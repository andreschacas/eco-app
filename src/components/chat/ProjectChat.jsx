import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Avatar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  Snackbar, 
  Alert,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const ProjectChat = ({ projectId, onCommentAdded, onCommentUpdated, onCommentDeleted }) => {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isTyping, setIsTyping] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [deleteMessageConfirmOpen, setDeleteMessageConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  const messageInputRef = useRef(null);
  const commentsEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const projectComments = dataService.getProjectComments(projectId);
      
      // Enriquecer comentarios con datos de usuario
      const enrichedComments = projectComments.map(comment => ({
        ...comment,
        user: dataService.getById('users', comment.user_id)
      }));
      
      setComments(enrichedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      showSnackbar('Error al cargar comentarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadComments();
    loadFiles();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) {
      showSnackbar('Por favor escribe un mensaje', 'warning');
      return;
    }

    try {
      console.log('Enviando mensaje:', { newMessage, projectId, userId: user.id, replyingTo, editingComment });
      
      // Si estamos editando, actualizar el comentario existente
      if (editingComment) {
        const result = dataService.updateComment(editingComment.id, newMessage.trim());
        console.log('Comentario actualizado:', result);
        showSnackbar('Comentario actualizado exitosamente', 'success');
        if (onCommentUpdated) onCommentUpdated();
      } else {
        // Crear nuevo comentario
        const result = dataService.createComment(projectId, user.id, newMessage.trim(), replyingTo);
        console.log('Comentario creado:', result);
        showSnackbar('Comentario enviado exitosamente', 'success');
        if (onCommentAdded) onCommentAdded();
      }

      // Limpiar estado
      setNewMessage('');
      setReplyingTo(null);
      setEditingComment(null);
      
      // Recargar solo comentarios sin afectar archivos
      const projectComments = dataService.getProjectComments(projectId);
      const enrichedComments = projectComments.map(comment => ({
        ...comment,
        user: dataService.getById('users', comment.user_id)
      }));
      setComments(enrichedComments);
      
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('Error al enviar mensaje', 'error');
    }
  }, [newMessage, replyingTo, editingComment, projectId, user, onCommentAdded, onCommentUpdated]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const loadFiles = () => {
    try {
      // Si no existe el método getProjectFiles, usar localStorage directamente
      if (dataService.getProjectFiles) {
        const projectFiles = dataService.getProjectFiles(projectId);
        setFiles(projectFiles);
      } else {
        // Fallback: buscar archivos en localStorage
        const allFiles = JSON.parse(localStorage.getItem('projectFiles') || '[]');
        const projectFiles = allFiles.filter(file => file.projectId === parseInt(projectId));
        setFiles(projectFiles);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      // Eliminar archivo del dataService si existe el método
      if (dataService.deleteProjectFile) {
        dataService.deleteProjectFile(fileId);
      } else {
        // Fallback: eliminar de localStorage directamente
        const allFiles = JSON.parse(localStorage.getItem('projectFiles') || '[]');
        const filteredFiles = allFiles.filter(file => file.id !== fileId);
        localStorage.setItem('projectFiles', JSON.stringify(filteredFiles));
      }

      // Actualizar estado local
      setFiles(prev => prev.filter(file => file.id !== fileId));

      // Eliminar comentario del chat si existe
      const fileComment = comments.find(comment => 
        comment.content.includes('📎') && comment.content.includes(fileId.toString())
      );
      if (fileComment) {
        dataService.deleteComment(fileComment.id);
        // Recargar solo comentarios, no archivos
        const projectComments = dataService.getProjectComments(projectId);
        const enrichedComments = projectComments.map(comment => ({
          ...comment,
          user: dataService.getById('users', comment.user_id)
        }));
        setComments(enrichedComments);
      }

      showSnackbar('Archivo eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting file:', error);
      showSnackbar('Error al eliminar archivo', 'error');
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of selectedFiles) {
        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showSnackbar(`El archivo ${file.name} es demasiado grande (máximo 10MB)`, 'error');
          continue;
        }

        // Crear objeto de archivo
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          projectId: projectId,
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString(),
          url: URL.createObjectURL(file) // Para preview local
        };

        // Guardar en dataService si existe el método
        if (dataService.createProjectFile) {
          dataService.createProjectFile(projectId, fileData);
        } else {
          // Fallback: guardar en localStorage directamente
          const allFiles = JSON.parse(localStorage.getItem('projectFiles') || '[]');
          allFiles.push(fileData);
          localStorage.setItem('projectFiles', JSON.stringify(allFiles));
        }
        
        // Actualizar estado local de archivos
        setFiles(prev => [fileData, ...prev]);

        // Crear comentario en el chat para el archivo
        const fileContent = `📎 **${file.name}** (${formatFileSize(file.size)})`;
        
        // Guardar comentario en dataService
        dataService.createComment(projectId, user.id, fileContent);
      }

      // Recargar solo comentarios para mostrar los archivos en el chat
      const projectComments = dataService.getProjectComments(projectId);
      const enrichedComments = projectComments.map(comment => ({
        ...comment,
        user: dataService.getById('users', comment.user_id)
      }));
      setComments(enrichedComments);
      
      showSnackbar(`${selectedFiles.length} archivo(s) subido(s) exitosamente`, 'success');
    } catch (error) {
      console.error('Error uploading files:', error);
      showSnackbar('Error al subir archivos', 'error');
    } finally {
      setUploading(false);
      // Limpiar input
      event.target.value = '';
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return { text: 'PDF', color: '#1976d2', bg: '#e3f2fd' };
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return { text: 'XLS', color: '#2AAC26', bg: '#e8f5e8' };
    if (fileType.includes('word') || fileType.includes('document')) return { text: 'DOC', color: '#f57c00', bg: '#fff3e0' };
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return { text: 'PPT', color: '#9c27b0', bg: '#f3e5f5' };
    if (fileType.includes('image')) return { text: 'IMG', color: '#e91e63', bg: '#fce4ec' };
    return { text: 'FILE', color: '#666', bg: '#f5f5f5' };
  };

  const getRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    if (diffInMinutes < 10080) return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const handleFilePreview = (fileName) => {
    const file = files.find(f => f.name === fileName);
    if (file) {
      setPreviewFile(file);
      setPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const handleDeleteClick = (fileId) => {
    const file = files.find(f => f.id === fileId);
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (fileToDelete) {
      await handleDeleteFile(fileToDelete.id);
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setFileToDelete(null);
  };

  // Funciones para administrador
  const handleDeleteAllChat = async () => {
    try {
      // Eliminar todos los comentarios del proyecto
      const projectComments = dataService.getProjectComments(projectId);
      projectComments.forEach(comment => {
        dataService.deleteComment(comment.id);
      });

      // Eliminar todos los archivos del proyecto
      const projectFiles = dataService.getProjectFiles(projectId);
      projectFiles.forEach(file => {
        if (dataService.deleteProjectFile) {
          dataService.deleteProjectFile(file.id);
        } else {
          // Fallback: eliminar de localStorage directamente
          const allFiles = JSON.parse(localStorage.getItem('projectFiles') || '[]');
          const filteredFiles = allFiles.filter(f => f.id !== file.id);
          localStorage.setItem('projectFiles', JSON.stringify(filteredFiles));
        }
      });

      // Limpiar estados locales
      setComments([]);
      setFiles([]);
      
      showSnackbar('Chat eliminado completamente', 'success');
      setDeleteAllConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting all chat:', error);
      showSnackbar('Error al eliminar chat', 'error');
    }
  };

  const handleDeleteMessage = async (commentId) => {
    try {
      dataService.deleteComment(commentId);
      
      // Recargar solo comentarios sin afectar archivos
      const projectComments = dataService.getProjectComments(projectId);
      const enrichedComments = projectComments.map(comment => ({
        ...comment,
        user: dataService.getById('users', comment.user_id)
      }));
      setComments(enrichedComments);
      
      showSnackbar('Mensaje eliminado exitosamente', 'success');
      setDeleteMessageConfirmOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      showSnackbar('Error al eliminar mensaje', 'error');
    }
  };

  const handleDeleteAllClick = () => {
    setDeleteAllConfirmOpen(true);
  };

  const handleDeleteMessageClick = (commentId) => {
    setMessageToDelete(commentId);
    setDeleteMessageConfirmOpen(true);
  };

  const handleDeleteAllCancel = () => {
    setDeleteAllConfirmOpen(false);
  };

  const handleDeleteMessageCancel = () => {
    setDeleteMessageConfirmOpen(false);
    setMessageToDelete(null);
  };

  const isImageFile = (fileType) => {
    return fileType && typeof fileType === 'string' && fileType.startsWith('image/');
  };

  const getFileTypeIcon = (fileType) => {
    // Validar que fileType existe y es string
    if (!fileType || typeof fileType !== 'string') {
      return { text: 'FILE', color: '#666', bg: '#f5f5f5' };
    }
    
    if (isImageFile(fileType)) return { text: 'IMG', color: '#e91e63', bg: '#fce4ec' };
    if (fileType.includes('pdf')) return { text: 'PDF', color: '#1976d2', bg: '#e3f2fd' };
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return { text: 'XLS', color: '#2AAC26', bg: '#e8f5e8' };
    if (fileType.includes('word') || fileType.includes('document')) return { text: 'DOC', color: '#f57c00', bg: '#fff3e0' };
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return { text: 'PPT', color: '#9c27b0', bg: '#f3e5f5' };
    return { text: 'FILE', color: '#666', bg: '#f5f5f5' };
  };

  const handleReply = (comment) => {
    setReplyingTo(comment.id);
    setEditingComment(null);
    setNewMessage('');
    messageInputRef.current?.focus();
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
    setNewMessage(comment.content);
    messageInputRef.current?.focus();
  };

  const handleDelete = (commentId) => {
    try {
      dataService.deleteComment(commentId);
      showSnackbar('Comentario eliminado exitosamente', 'success');
      if (onCommentDeleted) onCommentDeleted();
      
      // Recargar solo comentarios sin afectar archivos
      const projectComments = dataService.getProjectComments(projectId);
      const enrichedComments = projectComments.map(comment => ({
        ...comment,
        user: dataService.getById('users', comment.user_id)
      }));
      setComments(enrichedComments);
    } catch (error) {
      console.error('Error deleting comment:', error);
      showSnackbar('Error al eliminar comentario', 'error');
    }
  };

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const getReplies = (commentId) => {
    return comments.filter(comment => comment.parent_id === commentId);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const mainComments = comments.filter(comment => !comment.parent_id);

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex',
      gap: 2
    }}>
      {/* Chat Section - 70% */}
      <Box sx={{ 
        flex: '0 0 70%',
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0
      }}>
      {/* Header */}
      <Box sx={{ 
        p: 1.5, 
        borderBottom: '1px solid #e0e0e0',
        bgcolor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="body2" sx={{ 
          color: '#999', 
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.75rem',
          fontWeight: 500
        }}>
          Today {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Typography>
        
        {isAdmin && (
          <IconButton
            size="small"
            onClick={handleDeleteAllClick}
            sx={{
              color: '#f44336',
              '&:hover': {
                bgcolor: 'rgba(244,67,54,0.1)',
                color: '#d32f2f'
              }
            }}
            title="Borrar todo el chat"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        bgcolor: 'white',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a8a8a8',
        }
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Cargando comentarios...</Typography>
          </Box>
        ) : mainComments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 1 }}>
              No hay comentarios aún
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
              Sé el primero en comentar sobre este proyecto
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {mainComments.map((comment) => {
              const isOwnMessage = comment.user_id === user.id;
              return (
                <Box key={comment.id} sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  mb: 1
                }}>
                  {/* User Info */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.75,
                    mb: 0.5,
                    px: 1,
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row'
                  }}>
                    <Avatar 
                      src={comment.user?.avatar} 
                      alt={comment.user?.name}
                      sx={{ 
                        width: 24, 
                        height: 24,
                        bgcolor: isOwnMessage ? GREEN : '#e0e0e0',
                        fontSize: '0.75rem'
                      }}
                    >
                      {comment.user?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600, 
                      fontFamily: 'Poppins, sans-serif',
                      color: isOwnMessage ? '#2AAC26' : '#666',
                      fontSize: '0.75rem'
                    }}>
                      {comment.user?.name || 'Usuario'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: '#999', 
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.7rem'
                      }}>
                        {formatDate(comment.created_at)}
                      </Typography>
                      {comment.updated_at && comment.updated_at !== comment.created_at && (
                        <Typography variant="caption" sx={{ 
                          color: '#666', 
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.65rem',
                          fontStyle: 'italic',
                          bgcolor: 'rgba(42, 172, 38, 0.1)',
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 1
                        }}>
                          editado
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Message Bubble */}
                  <Box sx={{ 
                    background: isOwnMessage 
                      ? 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)' 
                      : '#f5f5f5',
                    color: isOwnMessage ? 'white' : '#333',
                    p: 1.5,
                    borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    maxWidth: '60%',
                    minWidth: '120px',
                    position: 'relative',
                    boxShadow: isOwnMessage 
                      ? '0 2px 8px rgba(42, 172, 38, 0.3)' 
                      : '0 1px 3px rgba(0,0,0,0.1)',
                    wordWrap: 'break-word',
                    border: isOwnMessage ? 'none' : '1px solid #e0e0e0'
                  }}>
                    {/* Detectar si es un archivo */}
                    {comment.content.startsWith('📎') ? (
                      (() => {
                        const fileName = comment.content.replace('📎 **', '').replace('**', '').split(' (')[0];
                        const file = files.find(f => f.name === fileName);
                        const isImage = file && isImageFile(file.type);
                        
                        return (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.9
                            }
                          }}
                          onClick={() => handleFilePreview(fileName)}
                          >
                            {isImage ? (
                              // Preview de imagen
                              <Box sx={{ 
                                position: 'relative',
                                borderRadius: 2,
                                overflow: 'hidden',
                                maxWidth: '200px',
                                maxHeight: '150px',
                                border: isOwnMessage ? '2px solid rgba(255,255,255,0.3)' : '2px solid #e0e0e0'
                              }}>
                                <img 
                                  src={file.url} 
                                  alt={fileName}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    display: 'block'
                                  }}
                                />
                                <Box sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.7rem',
                                  fontWeight: 600
                                }}>
                                  {getFileTypeIcon(file.type).text}
                                </Box>
                              </Box>
                            ) : (
                              // Archivo normal
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: isOwnMessage ? 'rgba(255,255,255,0.2)' : getFileTypeIcon(file?.type).bg,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Typography sx={{ 
                                    color: isOwnMessage ? 'white' : getFileTypeIcon(file?.type).color,
                                    fontSize: '0.7rem', 
                                    fontWeight: 600 
                                  }}>
                                    {getFileTypeIcon(file?.type).text}
                                  </Typography>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontFamily: 'Poppins, sans-serif',
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                      lineHeight: 1.4,
                                      color: isOwnMessage ? 'white' : '#333'
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                  {file && (
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '0.75rem',
                                        color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#666'
                                      }}
                                    >
                                      {formatFileSize(file.size)}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            )}
                            
                            {/* Botones de descarga y eliminar */}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'flex-end',
                              gap: 0.5,
                              mt: isImage ? 0.5 : 0
                            }}>
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: isOwnMessage ? 'white' : '#666',
                                  '&:hover': {
                                    bgcolor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (file) {
                                    const link = document.createElement('a');
                                    link.href = file.url;
                                    link.download = file.name;
                                    link.click();
                                  }
                                }}
                              >
                                <AttachFileIcon fontSize="small" />
                              </IconButton>
                              
                              {/* Botón de eliminar para admin */}
                              {isAdmin && file && (
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#f44336',
                                    '&:hover': {
                                      bgcolor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(244,67,54,0.1)',
                                      color: isOwnMessage ? 'white' : '#d32f2f'
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(file.id);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        );
                      })()
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'Poppins, sans-serif',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          fontSize: '0.9rem',
                          fontWeight: 400
                        }}
                      >
                        {comment.content}
                      </Typography>
                    )}
                  </Box>


                </Box>
              );
            })}
            <div ref={commentsEndRef} />
            
            {/* Typing Indicator */}
            {isTyping && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                px: 1, 
                py: 0.5,
                justifyContent: 'flex-start'
              }}>
                <Avatar sx={{ width: 20, height: 20, bgcolor: GREEN, fontSize: '0.6rem' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ 
                  bgcolor: '#f5f5f5', 
                  px: 1.5, 
                  py: 0.75, 
                  borderRadius: '12px 12px 12px 4px',
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#666', 
                    fontStyle: 'italic',
                    fontSize: '0.75rem'
                  }}>
                    Escribiendo...
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, bgcolor: 'white' }}>
        {(replyingTo || editingComment) && (
          <Box sx={{ mb: 1.5, p: 0.75, bgcolor: '#e3f2fd', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#1976d2', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem' }}>
              {editingComment ? 'Editando comentario' : `Respondiendo a ${comments.find(c => c.id === replyingTo)?.user?.name}`}
            </Typography>
            <IconButton size="small" onClick={() => { setReplyingTo(null); setEditingComment(null); setNewMessage(''); }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'flex-end',
          bgcolor: '#f8f9fa',
          p: 1.5,
          borderRadius: '20px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <IconButton
            size="small"
            onClick={handleFileClick}
            disabled={uploading}
            sx={{ 
              color: '#666',
              width: 32,
              height: 32,
              mb: 0.5,
              '&:hover': { 
                color: GREEN,
                bgcolor: 'rgba(42, 172, 38, 0.1)'
              },
              '&:disabled': {
                color: '#ccc'
              }
            }}
            title="Adjuntar archivo"
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="*/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <TextField
            ref={messageInputRef}
            multiline
            maxRows={4}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message here..."
            variant="standard"
            fullWidth
            sx={{
              '& .MuiInput-root': {
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.9rem',
                '&:before': {
                  borderBottom: 'none',
                },
                '&:after': {
                  borderBottom: 'none',
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: 'none',
                },
              },
              '& .MuiInput-input': {
                padding: '8px 12px',
                lineHeight: 1.4
              },
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 0.5 }}>
            <IconButton
              size="small"
              sx={{ 
                color: '#666',
                width: 32,
                height: 32,
                '&:hover': { 
                  color: GREEN,
                  bgcolor: 'rgba(42, 172, 38, 0.1)'
                }
              }}
              title="Emoji"
            >
              <EmojiEmotionsIcon fontSize="small" />
            </IconButton>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{
                background: 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #1f9a1f 0%, #1a8a1a 100%)',
                  transform: 'translateY(-1px)'
                },
                minWidth: 'auto',
                px: 1.5,
                py: 0.75,
                borderRadius: '50%',
                width: 36,
                height: 36,
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 2px 8px rgba(42, 172, 38, 0.3)',
                transition: 'all 0.2s ease',
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#999',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Box>
      </Box>

      {/* Files Panel - 30% */}
      <Box sx={{ 
        flex: '0 0 30%',
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        {/* Files Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0',
          bgcolor: 'white'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            fontFamily: 'Poppins, sans-serif',
            color: '#333',
            fontSize: '1rem',
            mb: 0.5
          }}>
            Archivos del Proyecto
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#666', 
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.8rem'
          }}>
            Documentos y adjuntos compartidos
          </Typography>
        </Box>

        {/* Files List */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 1.5
        }}>
          {files.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {files.map((file) => {
                const fileIcon = getFileTypeIcon(file.type);
                const isImage = isImageFile(file.type);
                
                return (
                  <Box 
                    key={file.id}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      p: 1.5,
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleFilePreview(file.name)}
                  >
                    {isImage ? (
                      // Preview de imagen en panel lateral
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <img 
                          src={file.url} 
                          alt={file.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                        <Box sx={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontSize: '0.6rem',
                          fontWeight: 600
                        }}>
                          {fileIcon.text}
                        </Box>
                      </Box>
                    ) : (
                      // Icono normal para otros archivos
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: fileIcon.bg, 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ 
                          color: fileIcon.color, 
                          fontSize: '0.8rem', 
                          fontWeight: 600 
                        }}>
                          {fileIcon.text}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        fontFamily: 'Poppins, sans-serif',
                        color: '#333',
                        fontSize: '0.85rem',
                        mb: 0.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#666', 
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.75rem'
                      }}>
                        {formatFileSize(file.size)} • {getRelativeTime(file.uploadedAt)}
                      </Typography>
                    </Box>
                    
                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#666' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = file.url;
                          link.download = file.name;
                          link.click();
                        }}
                      >
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                      
                      {/* Botón de eliminar para admin */}
                      {isAdmin && (
                        <IconButton 
                          size="small" 
                          sx={{ 
                            color: '#f44336',
                            '&:hover': {
                              bgcolor: 'rgba(244,67,54,0.1)',
                              color: '#d32f2f'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(file.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4
            }}>
              <AttachFileIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                No hay archivos aún
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                Los archivos compartidos aparecerán aquí
              </Typography>
            </Box>
          )}
        </Box>

        {/* Upload Button */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid #e0e0e0',
          bgcolor: 'white'
        }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AttachFileIcon />}
            onClick={handleFileClick}
            disabled={uploading}
            sx={{
              borderColor: GREEN,
              color: GREEN,
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              borderRadius: 2,
              py: 1,
              '&:hover': {
                borderColor: '#1f9a1f',
                bgcolor: 'rgba(42, 172, 38, 0.05)'
              },
              '&:disabled': {
                borderColor: '#e0e0e0',
                color: '#ccc'
              }
            }}
          >
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </Button>
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            borderRadius: 2, 
            minWidth: 180,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        {/* Opción de editar - solo para mensajes propios */}
        {selectedComment?.user_id === user?.id && (
          <MenuItem 
            onClick={() => {
              handleEdit(selectedComment);
              handleMenuClose();
            }}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(42, 172, 38, 0.1)'
              }
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: GREEN }} />
            </ListItemIcon>
            <ListItemText 
              primary="Editar mensaje"
              primaryTypographyProps={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.9rem'
              }}
            />
          </MenuItem>
        )}
        
        {/* Opción de eliminar - para mensajes propios o si es admin */}
        {(selectedComment?.user_id === user?.id || isAdmin) && (
          <MenuItem 
            onClick={() => {
              if (isAdmin && selectedComment?.user_id !== user?.id) {
                // Admin eliminando mensaje de otro usuario
                handleDeleteMessageClick(selectedComment?.id);
              } else {
                // Usuario eliminando su propio mensaje
                handleDelete(selectedComment?.id);
              }
              handleMenuClose();
            }}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.1)'
              }
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: '#f44336' }} />
            </ListItemIcon>
            <ListItemText 
              primary={isAdmin && selectedComment?.user_id !== user?.id ? "Eliminar mensaje" : "Eliminar"}
              primaryTypographyProps={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.9rem',
                color: '#f44336'
              }}
            />
          </MenuItem>
        )}
        
        {/* Opción de responder - para todos */}
        <MenuItem 
          onClick={() => {
            setReplyingTo(selectedComment);
            handleMenuClose();
            messageInputRef.current?.focus();
          }}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(33, 150, 243, 0.1)'
            }
          }}
        >
          <ListItemIcon>
            <ReplyIcon fontSize="small" sx={{ color: '#2196f3' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Responder"
            primaryTypographyProps={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.9rem'
            }}
          />
        </MenuItem>
      </Menu>

      {/* File Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh',
            maxWidth: '80vw'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachFileIcon sx={{ color: '#2AAC26' }} />
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600
            }}>
              {previewFile?.name}
            </Typography>
          </Box>
          <IconButton onClick={handleClosePreview} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {previewFile && (
            <>
              {isImageFile(previewFile.type) ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: '300px',
                  bgcolor: '#f5f5f5'
                }}>
                  <img 
                    src={previewFile.url} 
                    alt={previewFile.name}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '50vh', 
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '400px',
                  bgcolor: '#f5f5f5',
                  p: 4
                }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    bgcolor: getFileTypeIcon(previewFile.type).bg,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}>
                    <Typography sx={{ 
                      color: getFileTypeIcon(previewFile.type).color,
                      fontSize: '1.5rem', 
                      fontWeight: 600 
                    }}>
                      {getFileTypeIcon(previewFile.type).text}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    mb: 1
                  }}>
                    {previewFile.name}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    fontFamily: 'Poppins, sans-serif',
                    mb: 2
                  }}>
                    {formatFileSize(previewFile.size)} • {getRelativeTime(previewFile.uploadedAt)}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AttachFileIcon />}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewFile.url;
                      link.download = previewFile.name;
                      link.click();
                    }}
                    sx={{
                      background: 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1f9a1f 0%, #1a8a1a 100%)'
                      },
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      py: 1
                    }}
                  >
                    Descargar Archivo
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          p: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DeleteIcon sx={{ color: '#f44336', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#333',
              mb: 0.5
            }}>
              Eliminar archivo
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#666',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Typography variant="body1" sx={{ 
            fontFamily: 'Poppins, sans-serif',
            color: '#333',
            mb: 2
          }}>
            ¿Estás seguro de que quieres eliminar el archivo <strong>"{fileToDelete?.name}"</strong>?
          </Typography>
          
          {fileToDelete && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}>
              {isImageFile(fileToDelete.type) ? (
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img 
                    src={fileToDelete.url} 
                    alt={fileToDelete.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: getFileTypeIcon(fileToDelete.type).bg, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ 
                    color: getFileTypeIcon(fileToDelete.type).color, 
                    fontSize: '0.8rem', 
                    fontWeight: 600 
                  }}>
                    {getFileTypeIcon(fileToDelete.type).text}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  fontFamily: 'Poppins, sans-serif',
                  color: '#333',
                  fontSize: '0.9rem',
                  mb: 0.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {fileToDelete.name}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: '#666', 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.75rem'
                }}>
                  {formatFileSize(fileToDelete.size)} • {getRelativeTime(fileToDelete.uploadedAt)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          gap: 1,
          justifyContent: 'flex-end'
        }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#ccc',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f'
              }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal de confirmación para eliminar todo el chat */}
      <Dialog
        open={deleteAllConfirmOpen}
        onClose={handleDeleteAllCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DeleteIcon sx={{ color: '#f44336', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#333',
              mb: 0.5
            }}>
              Eliminar todo el chat
            </Typography>
            <Typography variant="body2" sx={{
              color: '#666',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Typography variant="body1" sx={{
            fontFamily: 'Poppins, sans-serif',
            color: '#333',
            mb: 2
          }}>
            ¿Estás seguro de que quieres eliminar <strong>todos los mensajes y archivos</strong> del chat de este proyecto?
          </Typography>
          
          <Box sx={{
            p: 2,
            bgcolor: '#fff3e0',
            borderRadius: 2,
            border: '1px solid #ffcc02'
          }}>
            <Typography variant="body2" sx={{
              fontFamily: 'Poppins, sans-serif',
              color: '#e65100',
              fontSize: '0.85rem'
            }}>
              ⚠️ Se eliminarán todos los mensajes, archivos e imágenes compartidos en este chat.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          pt: 2,
          gap: 1,
          justifyContent: 'flex-end'
        }}>
          <Button
            onClick={handleDeleteAllCancel}
            variant="outlined"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#ccc',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteAllChat}
            variant="contained"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f'
              }
            }}
          >
            Eliminar todo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar mensaje individual */}
      <Dialog
        open={deleteMessageConfirmOpen}
        onClose={handleDeleteMessageCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DeleteIcon sx={{ color: '#f44336', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#333',
              mb: 0.5
            }}>
              Eliminar mensaje
            </Typography>
            <Typography variant="body2" sx={{
              color: '#666',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Typography variant="body1" sx={{
            fontFamily: 'Poppins, sans-serif',
            color: '#333',
            mb: 2
          }}>
            ¿Estás seguro de que quieres eliminar este mensaje?
          </Typography>
          
          {messageToDelete && (
            <Box sx={{
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              maxHeight: 100,
              overflow: 'auto'
            }}>
              <Typography variant="body2" sx={{
                fontFamily: 'Poppins, sans-serif',
                color: '#666',
                fontSize: '0.85rem',
                fontStyle: 'italic'
              }}>
                "{comments.find(c => c.id === messageToDelete)?.content?.substring(0, 100)}..."
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          pt: 2,
          gap: 1,
          justifyContent: 'flex-end'
        }}>
          <Button
            onClick={handleDeleteMessageCancel}
            variant="outlined"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#ccc',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleDeleteMessage(messageToDelete)}
            variant="contained"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f'
              }
            }}
          >
            Eliminar mensaje
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectChat;