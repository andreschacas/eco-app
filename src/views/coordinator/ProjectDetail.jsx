import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Autocomplete from '@mui/material/Autocomplete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';
import CommentIcon from '@mui/icons-material/Comment';
import ReplyIcon from '@mui/icons-material/Reply';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ConstructionIcon from '@mui/icons-material/Construction';
import dataService from '../../utils/dataService';
import KanbanBoardNew from '../../components/kanban/KanbanBoardNew';
import StaticGanttChart from '../../components/gantt/StaticGanttChart';
import ProjectChat from '../../components/chat/ProjectChat';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const ProjectDetail = ({ project, onNavigate }) => {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState(project);
  const [activeTab, setActiveTab] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [comments, setComments] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [openParticipantDialog, setOpenParticipantDialog] = useState(false);
  const [openMetricDialog, setOpenMetricDialog] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [metricForm, setMetricForm] = useState({
    value: '',
    notes: ''
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Ref para el campo de comentarios
  const commentFieldRef = useRef(null);

  useEffect(() => {
    if (currentProject) {
      // Forzar limpieza de comentarios si es la primera carga
      const shouldClearComments = localStorage.getItem('eco_force_clear_comments');
      if (!shouldClearComments) {
        dataService.saveAll('comments', []);
        localStorage.setItem('eco_force_clear_comments', 'true');
      }
      loadProjectData();
    }
  }, [currentProject]);

  const loadProjectData = () => {
    try {
      // Cargar participantes
      const projectParticipants = dataService.getProjectParticipants(currentProject.id);
      setParticipants(projectParticipants);

      // Cargar métricas
      const projectMetrics = dataService.getProjectMetrics(currentProject.id);
      setMetrics(projectMetrics);

      // Cargar comentarios
      const projectComments = dataService.getProjectComments(currentProject.id);
      const commentsWithUsers = projectComments.map(comment => ({
        ...comment,
        user: dataService.getUserById(comment.user_id)
      }));
      setComments(commentsWithUsers);

      // Cargar usuarios disponibles (participantes activos)
      const allUsers = dataService.getAll('users')
        .filter(user => user.active && user.role_id === 3); // Solo participantes
      setAvailableUsers(allUsers);

    } catch (error) {
      showSnackbar('Error al cargar los datos del proyecto', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado': return '#4caf50';
      case 'En progreso': return '#2196f3';
      case 'Planificación': return '#ff9800';
      case 'Pausado': return '#f44336';
      case 'Cancelado': return '#757575';
      default: return '#757575';
    }
  };



  const handleAddParticipant = () => {
    try {
      if (selectedUsers.length === 0) {
        showSnackbar('Selecciona al menos un usuario', 'error');
        return;
      }

      selectedUsers.forEach(user => {
        const existing = participants.find(p => p.id === user.id);
        if (!existing) {
          dataService.addUserToProject(currentProject.id, user.id, user?.id);
        }
      });

      showSnackbar('Participantes agregados exitosamente', 'success');
      loadProjectData();
      setOpenParticipantDialog(false);
      setSelectedUsers([]);
    } catch (error) {
      showSnackbar('Error al agregar participantes', 'error');
    }
  };

  const handleRemoveParticipant = (participantId) => {
    try {
      const removed = dataService.removeUserFromProject(currentProject.id, participantId);
      
      if (removed) {
      showSnackbar('Participante removido exitosamente', 'success');
      loadProjectData();
      } else {
        showSnackbar('No se pudo remover el participante', 'error');
      }
    } catch (error) {
      showSnackbar('Error al remover participante', 'error');
      console.error('Error removing participant:', error);
    }
  };

  const handleUpdateMetric = (metric) => {
    setEditingMetric(metric);
    setMetricForm({
      value: '',
      notes: ''
    });
    setOpenMetricDialog(true);
  };

  const handleSaveMetric = () => {
    try {
      if (!metricForm.value) {
        showSnackbar('Por favor ingrese un valor', 'error');
        return;
      }

      dataService.updateMetricValue(editingMetric.id, parseFloat(metricForm.value));
      showSnackbar('Métrica actualizada exitosamente', 'success');
      loadProjectData();
      setOpenMetricDialog(false);
    } catch (error) {
      showSnackbar('Error al actualizar la métrica', 'error');
    }
  };

  // Funciones para manejar comentarios
  const handleAddComment = useCallback(() => {
    try {
      if (!newComment.trim() && attachments.length === 0) {
        showSnackbar('Por favor escriba un comentario o adjunte un archivo', 'error');
        return;
      }

      const commentAttachments = attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        data: attachment.data
      }));

      dataService.createComment(currentProject.id, user.id, newComment, replyingTo, commentAttachments);
      
      // Limpiar el estado sin perder el foco
      setNewComment('');
      setAttachments([]);
      setReplyingTo(null);
      
      // Recargar datos de forma diferida para no interrumpir la UX
      setTimeout(() => {
        loadProjectData();
      }, 100);
      
      showSnackbar('Comentario agregado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al agregar comentario', 'error');
    }
  }, [newComment, attachments, replyingTo, currentProject, user]);

  const handleReplyToComment = (commentId) => {
    setReplyingTo(commentId);
    setNewComment('');
  };

  const handleDeleteComment = (commentId) => {
    try {
      dataService.deleteComment(commentId);
      loadProjectData();
      showSnackbar('Comentario eliminado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al eliminar comentario', 'error');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.content);
    setReplyingTo(null);
  };

  const handleUpdateComment = () => {
    try {
      if (!newComment.trim()) {
        showSnackbar('Por favor escriba un comentario', 'error');
        return;
      }

      dataService.updateComment(editingComment.id, newComment);
      setNewComment('');
      setEditingComment(null);
      loadProjectData();
      showSnackbar('Comentario actualizado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al actualizar comentario', 'error');
    }
  };

  const cancelCommentEdit = useCallback(() => {
    setEditingComment(null);
    setReplyingTo(null);
    setNewComment('');
    setAttachments([]);
  }, []);

  // Funciones para manejar adjuntos
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = [];

    files.forEach(file => {
      // Validar tamaño (máximo 10MB simulado)
      if (file.size > 10 * 1024 * 1024) {
        showSnackbar(`El archivo ${file.name} es demasiado grande (máximo 10MB)`, 'error');
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword', 'application/vnd.ms-excel'];
      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
      
      if (!isAllowed) {
        showSnackbar(`Tipo de archivo no permitido: ${file.name}`, 'error');
        return;
      }

      // Simular la carga del archivo
      const attachment = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        data: file.type.startsWith('image/') ? 
          URL.createObjectURL(file) : 
          `file_${Date.now()}_${file.name}`
      };

      newAttachments.push(attachment);
    });

    setAttachments(prev => [...prev, ...newAttachments]);
    event.target.value = ''; // Limpiar input
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Función para limpiar manualmente los comentarios (para depuración)
  const clearAllComments = useCallback(() => {
    dataService.saveAll('comments', []);
    localStorage.removeItem('eco_force_clear_comments');
    setComments([]);
    setNewComment('');
    setAttachments([]);
    setReplyingTo(null);
    setEditingComment(null);
    showSnackbar('Comentarios limpiados exitosamente', 'info');
  }, []);

  // Componente de textarea ultra-simple que mantiene el foco
  const SimpleTextarea = ({ value, onChange, placeholder }) => {
    const textareaRef = useRef(null);
    
    // Manejar cambios sin perder foco
    const handleChange = (e) => {
      const newValue = e.target.value;
      onChange(newValue);
    };

    // Asegurar que el valor se mantiene sincronizado
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.value = value;
      }
    }, [value]);

    return (
      <textarea
        ref={textareaRef}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          color: '#333', // ARREGLADO: Color de texto visible
          backgroundColor: '#fff',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          lineHeight: '1.4'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = GREEN;
          e.target.style.boxShadow = `0 0 0 2px ${GREEN}30`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#ddd';
          e.target.style.boxShadow = 'none';
        }}
      />
    );
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  const getBackView = () => {
    if (!user) return 'coordinator-dashboard';
    switch (user.role) {
      case 'Administrador': return 'admin-projects';
      case 'Coordinador': return 'coordinator-dashboard';
      case 'Participante': return 'participant-dashboard';
      default: return 'coordinator-dashboard';
    }
  };

  if (!currentProject) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Proyecto no encontrado</Typography>
        <Button onClick={() => onNavigate(getBackView())} sx={{ mt: 2 }}>
          Volver al Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => onNavigate(getBackView())}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
            {currentProject.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={currentProject.status}
              sx={{
                bgcolor: `${getStatusColor(currentProject.status)}20`,
                color: getStatusColor(currentProject.status),
                fontFamily: 'Poppins, sans-serif'
              }}
            />
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              {new Date(currentProject.start_date).toLocaleDateString('es-ES')} - {new Date(currentProject.end_date).toLocaleDateString('es-ES')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Project Info */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Información del Proyecto
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            {currentProject.description}
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab 
              icon={<AssignmentIcon />} 
              label="Tareas" 
              sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Participantes" 
              sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
            />
            <Tab 
              icon={<TimelineIcon />} 
              label="Métricas" 
              sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
            />
            <Tab 
              icon={<CommentIcon />} 
              label="Comentarios" 
              sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
            />
            <Tab 
              icon={<CalendarTodayIcon />} 
              label="Calendario" 
              sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
            />
          </Tabs>
        </Box>

        {/* Tasks Tab - Kanban Board */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 0, overflow: 'hidden' }}>
            <KanbanBoardNew 
              projectId={currentProject.id}
              filterByRole={user?.role === 'Participante'}
                        />
                      </Box>
        </TabPanel>

        {/* Participants Tab */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Participantes del Proyecto
              </Typography>
              {(user?.role === 'Administrador' || user?.role === 'Coordinador') && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setOpenParticipantDialog(true)}
                sx={{
                  bgcolor: GREEN,
                  textTransform: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': { bgcolor: '#1f9a1f' }
                }}
              >
                Agregar Participante
              </Button>
              )}
            </Box>

            <Grid container spacing={2}>
              {participants.map((participant) => (
                <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={participant.id}>
                  <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar 
                        src={participant.avatar} 
                        alt={participant.name}
                        sx={{ width: 60, height: 60, mx: 'auto', mb: 2 }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                        {participant.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                        {participant.email}
                      </Typography>
                      {(user?.role === 'Administrador' || user?.role === 'Coordinador') && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveParticipant(participant.id)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {participants.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                  No hay participantes asignados
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                  Agrega participantes para comenzar la colaboración
                </Typography>
              </Box>
            )}
          </CardContent>
        </TabPanel>

        {/* Metrics Tab */}
        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
              Métricas del Proyecto
            </Typography>

            <Grid container spacing={3}>
              {metrics.map((metric) => (
                <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={metric.id}>
                  <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                        {metric.current_value || 0} {metric.unit}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>
                        {metric.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                        Meta: {metric.target_value} {metric.unit}
                      </Typography>
                      {(user?.role === 'Administrador' || user?.role === 'Coordinador') && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleUpdateMetric(metric)}
                        sx={{
                          borderColor: GREEN,
                          color: GREEN,
                          textTransform: 'none',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      >
                        Actualizar Valor
                      </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {metrics.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                  No hay métricas configuradas
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                  Las métricas son configuradas por el administrador
                </Typography>
              </Box>
            )}
          </CardContent>
        </TabPanel>

        {/* Comments Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
            <ProjectChat 
              projectId={project.id}
              onCommentAdded={() => loadProjectData()}
              onCommentUpdated={() => loadProjectData()}
              onCommentDeleted={() => loadProjectData()}
            />
          </Box>
        </TabPanel>

        {/* Old Comments Tab - Replaced */}
        <TabPanel value={activeTab} index={999}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Comentarios del Proyecto
              </Typography>
              {/* Botón de limpieza para depuración - remover en producción */}
              <Button 
                size="small" 
                onClick={clearAllComments}
                sx={{ 
                  fontSize: '0.7rem', 
                  textTransform: 'none',
                  color: '#999',
                  '&:hover': { color: '#666' }
                }}
              >
                🗑️ Limpiar Chat
              </Button>
            </Box>

            {/* New Comment Form */}
            <Card sx={{ mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 40, height: 40 }} />
                  <Box sx={{ flex: 1 }}>
                    {(replyingTo || editingComment) && (
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          {editingComment ? 'Editando comentario' : `Respondiendo a ${comments.find(c => c.id === replyingTo)?.user?.name}`}
                        </Typography>
                        <Button size="small" onClick={cancelCommentEdit} sx={{ minWidth: 'auto', p: 0.5 }}>
                          ✕
                        </Button>
                      </Box>
                    )}
                    <Box sx={{ mb: 2 }}>
                      <SimpleTextarea
                        value={newComment}
                        onChange={setNewComment}
                        placeholder={replyingTo ? 'Escribe tu respuesta...' : 'Escribe un comentario...'}
                      />
                    </Box>

                    {/* File attachments */}
                    {attachments.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 1, display: 'block' }}>
                          Archivos adjuntos:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {attachments.map((attachment) => (
                            <Chip
                              key={attachment.id}
                              label={`${attachment.name} (${formatFileSize(attachment.size)})`}
                              onDelete={() => removeAttachment(attachment.id)}
                              variant="outlined"
                              size="small"
                              icon={attachment.type.startsWith('image/') ? <ImageIcon /> : <AttachFileIcon />}
                              sx={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                          ))}
            </Box>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <input
                        type="file"
              multiple
                        style={{ display: 'none' }}
                        id="file-upload"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                      />
                      <label htmlFor="file-upload">
                        <IconButton
                          component="span"
                          size="small"
                          sx={{ color: '#666' }}
                          title="Adjuntar archivo"
                        >
                          <AttachFileIcon />
                        </IconButton>
                      </label>
                      
          <Button 
            variant="contained" 
                        startIcon={<SendIcon />}
                        onClick={editingComment ? handleUpdateComment : handleAddComment}
                        disabled={!newComment.trim() && attachments.length === 0}
            sx={{ 
              bgcolor: GREEN,
                          textTransform: 'none',
                          fontFamily: 'Poppins, sans-serif',
              '&:hover': { bgcolor: '#1f9a1f' }
            }}
          >
                        {editingComment ? 'Actualizar' : (replyingTo ? 'Responder' : 'Comentar')}
          </Button>
                      {(replyingTo || editingComment) && (
                        <Button
                          variant="outlined"
                          onClick={cancelCommentEdit}
                          sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Comments List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments
                .filter(comment => !comment.parent_id)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((comment) => (
                <Card key={comment.id} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    {/* Main Comment */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar src={comment.user?.avatar} alt={comment.user?.name} sx={{ width: 40, height: 40 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                            {comment.user?.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                            {new Date(comment.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                          {comment.created_at !== comment.updated_at && (
                            <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
                              (editado)
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                          {comment.content}
                        </Typography>

                        {/* Attachments */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {comment.attachments.map((attachment) => (
                                <Card key={attachment.id} sx={{ maxWidth: 200, border: '1px solid #e0e0e0' }}>
                                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    {attachment.type.startsWith('image/') ? (
                                      <Box>
                                        <img 
                                          src={attachment.data} 
                                          alt={attachment.name}
                                          style={{ 
                                            width: '100%', 
                                            height: 'auto',
                                            maxHeight: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '4px'
                                          }}
                                        />
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'Poppins, sans-serif' }}>
                                          {attachment.name}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AttachFileIcon sx={{ fontSize: 16, color: '#666' }} />
                                        <Box>
                                          <Typography variant="caption" sx={{ fontFamily: 'Poppins, sans-serif', display: 'block' }}>
                                            {attachment.name}
                                          </Typography>
                                          <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                                            {formatFileSize(attachment.size)}
                                          </Typography>
                                        </Box>
                                        <IconButton size="small" sx={{ ml: 'auto' }}>
                                          <DownloadIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </Box>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<ReplyIcon />}
                            onClick={() => handleReplyToComment(comment.id)}
                            sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
                          >
                            Responder
                          </Button>
                          {comment.user_id === user?.id && (
                            <>
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditComment(comment)}
                                sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
                              >
                                Editar
                              </Button>
                              <Button
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteComment(comment.id)}
                                sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif', color: '#f44336' }}
                              >
                                Eliminar
                              </Button>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Replies */}
                    {comments
                      .filter(reply => reply.parent_id === comment.id)
                      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                      .map((reply) => (
                      <Box key={reply.id} sx={{ ml: 6, mt: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Avatar src={reply.user?.avatar} alt={reply.user?.name} sx={{ width: 32, height: 32 }} />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem' }}>
                                {reply.user?.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                                {new Date(reply.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                              {reply.created_at !== reply.updated_at && (
                                <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
                                  (editado)
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', mb: 1 }}>
                              {reply.content}
                            </Typography>

                            {/* Reply Attachments */}
                            {reply.attachments && reply.attachments.length > 0 && (
                              <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {reply.attachments.map((attachment) => (
                                    <Card key={attachment.id} sx={{ maxWidth: 150, border: '1px solid #e0e0e0' }}>
                                      <CardContent sx={{ p: 0.5, '&:last-child': { pb: 0.5 } }}>
                                        {attachment.type.startsWith('image/') ? (
                                          <Box>
                                            <img 
                                              src={attachment.data} 
                                              alt={attachment.name}
                                              style={{ 
                                                width: '100%', 
                                                height: 'auto',
                                                maxHeight: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '2px'
                                              }}
                                            />
                                            <Typography variant="caption" sx={{ display: 'block', mt: 0.25, fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem' }}>
                                              {attachment.name}
                                            </Typography>
                                          </Box>
                                        ) : (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <AttachFileIcon sx={{ fontSize: 12, color: '#666' }} />
                                            <Typography variant="caption" sx={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.7rem' }}>
                                              {attachment.name}
                                            </Typography>
                                          </Box>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </Box>
                              </Box>
                            )}
                            {reply.user_id === user?.id && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleEditComment(reply)}
                                  sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem' }}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleDeleteComment(reply.id)}
                                  sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: '#f44336' }}
                                >
                                  Eliminar
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {comments.filter(comment => !comment.parent_id).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CommentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    No hay comentarios aún
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
                    Sé el primero en comentar sobre este proyecto
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </TabPanel>

        {/* Calendar Tab - Gantt Chart */}
                <TabPanel value={activeTab} index={4}>
          <Box sx={{ height: '100vh', overflow: 'hidden' }}>
            <StaticGanttChart projectId={project.id} filterByRole={false} />
          </Box>
        </TabPanel>
      </Card>



      {/* Add Participant Dialog */}
      <Dialog open={openParticipantDialog} onClose={() => setOpenParticipantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Agregar Participantes
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              options={availableUsers.filter(user => !participants.some(p => p.id === user.id))}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUsers}
              onChange={(event, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar usuarios"
                  placeholder="Buscar usuarios..."
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenParticipantDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddParticipant} 
            variant="contained" 
            sx={{ 
              bgcolor: GREEN,
              '&:hover': { bgcolor: '#1f9a1f' }
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Metric Dialog */}
      <Dialog open={openMetricDialog} onClose={() => setOpenMetricDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Actualizar Métrica: {editingMetric?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label={`Nuevo valor (${editingMetric?.unit})`}
              type="number"
              value={metricForm.value}
              onChange={(e) => setMetricForm({ ...metricForm, value: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Notas (opcional)"
              multiline
              rows={3}
              value={metricForm.notes}
              onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMetricDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveMetric} 
            variant="contained" 
            sx={{ 
              bgcolor: GREEN,
              '&:hover': { bgcolor: '#1f9a1f' }
            }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetail;
