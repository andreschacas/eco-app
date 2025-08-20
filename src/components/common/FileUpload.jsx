import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion, AnimatePresence } from 'framer-motion';

const GREEN = '#2AAC26';

const FileUpload = ({ 
  files = [], 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 10485760, // 10MB
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  showGallery = true,
  entityType = 'project', // 'project', 'task', etc.
  entityId 
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    
    try {
      const newFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          // Simular upload
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // En producción sería la URL del servidor
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'current-user', // ID del usuario actual
            entityType,
            entityId,
            versions: [
              {
                id: 1,
                version: '1.0',
                uploadedAt: new Date().toISOString(),
                uploadedBy: 'current-user',
                size: file.size,
                url: URL.createObjectURL(file)
              }
            ]
          };
          
          return fileData;
        })
      );
      
      const updatedFiles = [...files, ...newFiles];
      onFilesChange(updatedFiles);
      
      // Simular persistencia en localStorage
      const storageKey = `files_${entityType}_${entityId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedFiles));
      
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  }, [files, onFilesChange, entityType, entityId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {})
  });

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
    
    // Actualizar localStorage
    const storageKey = `files_${entityType}_${entityId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedFiles));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon sx={{ color: '#4caf50' }} />;
    if (fileType === 'application/pdf') return <PictureAsPdfIcon sx={{ color: '#f44336' }} />;
    if (fileType.includes('document') || fileType.includes('word')) return <DescriptionIcon sx={{ color: '#2196f3' }} />;
    return <InsertDriveFileIcon sx={{ color: '#666' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const imageFiles = files.filter(file => file.type.startsWith('image/'));

  return (
    <Box>
      {/* Zona de drop */}
      <Card 
        sx={{ 
          mb: 2, 
          borderRadius: 3,
          border: isDragActive ? `2px dashed ${GREEN}` : '2px dashed #ddd',
          bgcolor: isDragActive ? `${GREEN}05` : 'transparent',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
      >
        <CardContent 
          {...getRootProps()}
          sx={{ 
            textAlign: 'center', 
            py: 4,
            '&:hover': {
              bgcolor: `${GREEN}05`,
              borderColor: GREEN
            }
          }}
        >
          <input {...getInputProps()} />
          <motion.div
            animate={{ 
              scale: isDragActive ? 1.05 : 1,
              rotateY: isDragActive ? 5 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            <CloudUploadIcon 
              sx={{ 
                fontSize: 48, 
                color: isDragActive ? GREEN : '#ccc', 
                mb: 2,
                transition: 'color 0.2s ease'
              }} 
            />
          </motion.div>
          
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 1 }}>
            {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 2 }}>
            Máximo {maxFiles} archivos • Tamaño máximo {formatFileSize(maxSize)} por archivo
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            {acceptedTypes.map((type) => (
              <Chip 
                key={type} 
                label={type} 
                size="small" 
                sx={{ 
                  bgcolor: `${GREEN}20`, 
                  color: GREEN,
                  fontFamily: 'Poppins, sans-serif'
                }} 
              />
            ))}
          </Box>

          {uploading && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <LinearProgress sx={{ color: GREEN }} />
              <Typography variant="caption" sx={{ mt: 1, color: '#666' }}>
                Subiendo archivos...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Archivos ({files.length})
              </Typography>
              {showGallery && imageFiles.length > 0 && (
                <Button
                  startIcon={<ImageIcon />}
                  onClick={() => setGalleryOpen(true)}
                  sx={{
                    color: GREEN,
                    textTransform: 'none',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  Ver Galería ({imageFiles.length})
                </Button>
              )}
            </Box>

            <List>
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <ListItem
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          bgcolor: '#f8f9fa',
                          transform: 'translateX(4px)',
                          transition: 'all 0.2s ease'
                        }
                      }}
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>
                            {file.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {formatFileSize(file.size)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              • {new Date(file.uploadedAt).toLocaleDateString()}
                            </Typography>
                            {file.versions && file.versions.length > 1 && (
                              <Chip
                                label={`v${file.versions.length}`}
                                size="small"
                                sx={{
                                  bgcolor: '#e3f2fd',
                                  color: '#1976d2',
                                  height: 16,
                                  fontSize: '10px'
                                }}
                              />
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {file.type.startsWith('image/') && (
                            <IconButton 
                              size="small" 
                              onClick={() => handlePreviewFile(file)}
                              sx={{ color: '#2196f3' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={() => downloadFile(file)}
                            sx={{ color: GREEN }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => removeFile(file.id)}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          </CardContent>
        </Card>
      )}

      {/* Dialog de previsualización */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
          {previewFile?.name}
        </DialogTitle>
        <DialogContent>
          {previewFile && previewFile.type.startsWith('image/') && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={previewFile.url}
                alt={previewFile.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  borderRadius: '8px'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Cerrar
          </Button>
          <Button 
            onClick={() => downloadFile(previewFile)}
            variant="contained"
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#1f9a1f' } }}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de galería */}
      <Dialog 
        open={galleryOpen} 
        onClose={() => setGalleryOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Galería de Imágenes ({imageFiles.length})
        </DialogTitle>
        <DialogContent>
          <ImageList variant="masonry" cols={3} gap={8}>
            {imageFiles.map((file) => (
              <ImageListItem 
                key={file.id}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease'
                  }
                }}
                onClick={() => handlePreviewFile(file)}
              >
                <img
                  src={file.url}
                  alt={file.name}
                  loading="lazy"
                  style={{ borderRadius: '8px' }}
                />
                <ImageListItemBar
                  title={file.name}
                  subtitle={formatFileSize(file.size)}
                  actionIcon={
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGalleryOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;
