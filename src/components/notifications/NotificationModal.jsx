import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Autocomplete,
  Divider
} from '@mui/material';
import { Send, Close, Person, Group, Folder } from '@mui/icons-material';
import notificationService from '../../utils/notificationService';
import dataService from '../../utils/dataService';
import Toast from '../common/Toast';

const NotificationModal = ({ open, onClose, currentUser, onNotificationSent }) => {
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    message: '',
    recipients: [],
    recipientType: 'specific',
    selectedProject: null,
    priority: 'normal'
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = () => {
    try {
      const allUsers = dataService.getAll('users');
      const allProjects = dataService.getAll('projects');
      
      const filteredUsers = allUsers.filter(user => user.id !== currentUser?.id);
      setUsers(filteredUsers);
      setProjects(allProjects);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      setToast({
        open: true,
        message: 'Por favor completa todos los campos obligatorios',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      let notificationData = {
        type: formData.type,
        title: formData.title.trim(),
        message: formData.message.trim(),
        priority: formData.priority,
        sender_id: currentUser?.id,
        sender_name: currentUser?.name || 'Usuario'
      };

      let sentNotifications = [];

      if (formData.recipientType === 'specific') {
        if (formData.recipients.length === 0) {
          setToast({
            open: true,
            message: 'Por favor selecciona al menos un destinatario',
            severity: 'warning'
          });
          setLoading(false);
          return;
        }
        const userIds = formData.recipients.map(user => user.id);
        sentNotifications = notificationService.sendToUsers(userIds, notificationData);
      } else if (formData.recipientType === 'project') {
        if (!formData.selectedProject) {
          setToast({
            open: true,
            message: 'Por favor selecciona un proyecto',
            severity: 'warning'
          });
          setLoading(false);
          return;
        }
        sentNotifications = notificationService.sendToProject(formData.selectedProject.id, notificationData);
      } else if (formData.recipientType === 'all') {
        const allUserIds = users.map(user => user.id);
        sentNotifications = notificationService.sendToUsers(allUserIds, notificationData);
      }

      if (sentNotifications.length > 0) {
        setToast({
          open: true,
          message: `Notificación enviada exitosamente a ${sentNotifications.length} usuario(s)`,
          severity: 'success'
        });
        handleClose();
        if (onNotificationSent) {
          onNotificationSent();
        }
      } else {
        setToast({
          open: true,
          message: 'Error al enviar la notificación',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      setToast({
        open: true,
        message: 'Error al enviar la notificación',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'general',
      title: '',
      message: '',
      recipients: [],
      recipientType: 'specific',
      selectedProject: null,
      priority: 'normal'
    });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e0e0e0',
          fontFamily: 'Poppins, sans-serif'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        pb: 3,
        pt: 3,
        px: 3
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          fontFamily: 'Poppins, sans-serif',
          color: '#333',
          fontSize: '1.25rem'
        }}>
          Enviar Notificación
        </Typography>
        <Button
          onClick={handleClose}
          sx={{
            minWidth: 'auto',
            p: 1,
            color: '#666',
            '&:hover': {
              bgcolor: '#f5f5f5'
            }
          }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Título */}
          <TextField
            label="Título de la notificación"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            fullWidth
            required
            placeholder="Ingresa el título de la notificación"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />

          {/* Mensaje */}
          <TextField
            label="Mensaje"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
            placeholder="Escribe el mensaje de la notificación"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />

          {/* Tipo de notificación y Prioridad en una fila */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Notificación</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                label="Tipo de Notificación"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="task_assigned">Tarea Asignada</MenuItem>
                <MenuItem value="task_completed">Tarea Completada</MenuItem>
                <MenuItem value="project_update">Actualización de Proyecto</MenuItem>
                <MenuItem value="deadline_approaching">Fecha Límite Próxima</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Prioridad"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Tipo de destinatarios */}
          <FormControl fullWidth>
            <InputLabel>Tipo de Destinatarios</InputLabel>
            <Select
              value={formData.recipientType}
              onChange={(e) => handleInputChange('recipientType', e.target.value)}
              label="Tipo de Destinatarios"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            >
              <MenuItem value="specific">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 20 }} />
                  Usuarios Específicos
                </Box>
              </MenuItem>
              <MenuItem value="project">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Folder sx={{ fontSize: 20 }} />
                  Proyecto Completo
                </Box>
              </MenuItem>
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group sx={{ fontSize: 20 }} />
                  Todos los Usuarios
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Selección de usuarios específicos */}
          {formData.recipientType === 'specific' && (
            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.role})`}
              value={formData.recipients}
              onChange={(event, newValue) => handleInputChange('recipients', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={`${option.name} (${option.role})`}
                    {...getTagProps({ index })}
                    key={option.id}
                    sx={{ borderRadius: 1 }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar Usuarios"
                  placeholder="Buscar usuarios..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              )}
            />
          )}

          {/* Selección de proyecto */}
          {formData.recipientType === 'project' && (
            <Autocomplete
              options={projects}
              getOptionLabel={(option) => option.name}
              value={formData.selectedProject}
              onChange={(event, newValue) => handleInputChange('selectedProject', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar Proyecto"
                  placeholder="Buscar proyecto..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              )}
            />
          )}

          {/* Resumen de destinatarios */}
          {formData.recipientType === 'all' && (
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f9fa', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid #e9ecef'
            }}>
              <Group sx={{ color: '#2AAC26', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                La notificación se enviará a todos los usuarios del sistema ({users.length} usuarios)
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            px: 3,
            py: 1,
            borderRadius: 1,
            borderColor: '#d0d7de',
            color: '#656d76',
            '&:hover': {
              borderColor: '#d0d7de',
              bgcolor: '#f6f8fa'
            }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSendNotification}
          variant="contained"
          disabled={loading}
          startIcon={<Send />}
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            px: 3,
            py: 1,
            borderRadius: 1,
            bgcolor: '#2AAC26',
            '&:hover': { 
              bgcolor: '#1f9a1f' 
            },
            '&:disabled': {
              bgcolor: '#d0d7de',
              color: '#656d76'
            }
          }}
                 >
           {loading ? 'Enviando...' : 'Enviar Notificación'}
         </Button>
       </DialogActions>

       {/* Toast para feedback */}
       <Toast
         open={toast.open}
         message={toast.message}
         severity={toast.severity}
         onClose={() => setToast({ ...toast, open: false })}
       />
     </Dialog>
   );
 };

export default NotificationModal;