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
  Grid,
  Typography,
  Box,
  Chip,
  Avatar,
  Autocomplete,
  Slider,
  IconButton,
  Divider
} from '@mui/material';
import {
  Close,
  Person,
  Schedule,
  Flag,
  Description,
  Delete
} from '@mui/icons-material';
import dataService from '../../utils/dataService';

const GanttTaskDialog = ({ 
  open, 
  onClose, 
  onSave, 
  onDelete, 
  task = null, 
  projects = [], 
  users = [] 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pendiente',
    priority: 'Media',
    due_date: '',
    project_id: null,
    assigned_users: [],
    progress: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Pendiente',
        priority: task.priority || 'Media',
        due_date: task.due_date || '',
        project_id: task.project_id || null,
        assigned_users: task.assigned_users || [],
        progress: task.progress || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Pendiente',
        priority: 'Media',
        due_date: '',
        project_id: null,
        assigned_users: [],
        progress: 0
      });
    }
    setErrors({});
  }, [task, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'La fecha de vencimiento es requerida';
    }

    if (!formData.project_id) {
      newErrors.project_id = 'El proyecto es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const taskData = {
      ...formData,
      assigned_users: formData.assigned_users.map(user => 
        typeof user === 'object' ? user.id : user
      )
    };

    onSave(taskData);
    onClose();
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  const priorityColors = {
    'Baja': '#4caf50',
    'Media': '#ff9800',
    'Alta': '#f44336',
    'Crítica': '#9c27b0'
  };

  const statusColors = {
    'Pendiente': '#ff9800',
    'En progreso': '#2196f3',
    'Completada': '#4caf50',
    'Cancelada': '#f44336'
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 80px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)', 
        color: '#fff',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 3,
        px: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            borderRadius: 2, 
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Description sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Sección 1: Información Principal */}
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f9fa', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              mb: 2
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#2AAC26',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Description />
                Información Principal
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Título de la tarea"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title || 'Nombre descriptivo de la tarea'}
                    placeholder="Ej: Implementar autenticación de usuarios"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#2AAC26',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2AAC26',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.project_id}>
                    <InputLabel>Proyecto *</InputLabel>
                    <Select
                      value={formData.project_id || ''}
                      label="Proyecto *"
                      onChange={(e) => handleChange('project_id', e.target.value)}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2AAC26',
                        },
                      }}
                    >
                      {projects.map((project) => (
                        <MenuItem key={project.id} value={project.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: '#2AAC26' 
                            }} />
                            {project.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Descripción"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe los detalles, objetivos y requisitos de la tarea..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#2AAC26',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2AAC26',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Sección 2: Configuración de Tarea */}
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f9fa', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              mb: 2
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#2AAC26',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Flag />
                Configuración de Tarea
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.status}
                      label="Estado"
                      onChange={(e) => handleChange('status', e.target.value)}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2AAC26',
                        },
                      }}
                    >
                      <MenuItem value="Pendiente">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: statusColors['Pendiente'] 
                          }} />
                          <Typography variant="body2">Pendiente</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="En progreso">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: statusColors['En progreso'] 
                          }} />
                          <Typography variant="body2">En progreso</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Completada">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: statusColors['Completada'] 
                          }} />
                          <Typography variant="body2">Completada</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Cancelada">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: statusColors['Cancelada'] 
                          }} />
                          <Typography variant="body2">Cancelada</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      value={formData.priority}
                      label="Prioridad"
                      onChange={(e) => handleChange('priority', e.target.value)}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2AAC26',
                        },
                      }}
                    >
                      <MenuItem value="Baja">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: priorityColors['Baja'] 
                          }} />
                          <Typography variant="body2">Baja</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Media">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: priorityColors['Media'] 
                          }} />
                          <Typography variant="body2">Media</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Alta">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: priorityColors['Alta'] 
                          }} />
                          <Typography variant="body2">Alta</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Crítica">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: priorityColors['Crítica'] 
                          }} />
                          <Typography variant="body2">Crítica</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de vencimiento *"
                    value={formData.due_date}
                    onChange={(e) => handleChange('due_date', e.target.value)}
                    error={!!errors.due_date}
                    helperText={errors.due_date || 'Fecha límite para completar la tarea'}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#2AAC26',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2AAC26',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Sección 3: Progreso y Asignación */}
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f9fa', 
              borderRadius: 2, 
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#2AAC26',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Person />
                Progreso y Asignación
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e9ecef' }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600, 
                      mb: 2, 
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Schedule />
                      Progreso de la Tarea
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Completado
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          color: statusColors[formData.status] || '#2196f3' 
                        }}>
                          {formData.progress}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: '#e9ecef', 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: `${formData.progress}%`, 
                          height: '100%', 
                          bgcolor: statusColors[formData.status] || '#2196f3',
                          borderRadius: 4,
                          transition: 'width 0.3s ease'
                        }} />
                      </Box>
                    </Box>
                    
                    <Slider
                      value={formData.progress}
                      onChange={(e, value) => handleChange('progress', value)}
                      min={0}
                      max={100}
                      step={5}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 25, label: '25%' },
                        { value: 50, label: '50%' },
                        { value: 75, label: '75%' },
                        { value: 100, label: '100%' }
                      ]}
                      sx={{
                        color: statusColors[formData.status] || '#2196f3',
                        '& .MuiSlider-thumb': {
                          bgcolor: statusColors[formData.status] || '#2196f3',
                          width: 20,
                          height: 20,
                          '&:hover': {
                            boxShadow: `0 0 0 8px ${(statusColors[formData.status] || '#2196f3')}20`,
                          },
                        },
                        '& .MuiSlider-track': {
                          bgcolor: statusColors[formData.status] || '#2196f3',
                        },
                        '& .MuiSlider-rail': {
                          bgcolor: '#e9ecef',
                        },
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e9ecef' }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600, 
                      mb: 2, 
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Person />
                      Usuarios Asignados
                    </Typography>
                    
                    <Autocomplete
                      multiple
                      options={users}
                      getOptionLabel={(option) => option.name}
                      value={users.filter(user => formData.assigned_users.includes(user.id))}
                      onChange={(e, newValue) => {
                        handleChange('assigned_users', newValue.map(user => user.id));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Seleccionar usuarios"
                          placeholder="Buscar usuarios..."
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#2AAC26',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#2AAC26',
                              },
                            },
                          }}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.id}
                            avatar={
                              <Avatar sx={{ 
                                bgcolor: priorityColors[formData.priority] || '#2196f3',
                                width: 24,
                                height: 24,
                                fontSize: '0.75rem'
                              }}>
                                {option.name.charAt(0)}
                              </Avatar>
                            }
                            label={option.name}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiChip-deleteIcon': {
                                color: '#666',
                                '&:hover': {
                                  color: '#f44336',
                                },
                              },
                            }}
                          />
                        ))
                      }
                      renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ py: 1 }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: priorityColors[formData.priority] || '#2196f3',
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem'
                          }}>
                            {option.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.role}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ 
        p: 4, 
        gap: 2,
        bgcolor: '#f8f9fa',
        borderTop: '1px solid #e9ecef'
      }}>
        {task && (
          <Button
            onClick={handleDelete}
            color="error"
            variant="outlined"
            startIcon={<Delete />}
            sx={{ 
              mr: 'auto',
              borderColor: '#dc3545',
              color: '#dc3545',
              '&:hover': {
                borderColor: '#c82333',
                bgcolor: 'rgba(220, 53, 69, 0.04)'
              }
            }}
          >
            Eliminar
          </Button>
        )}
        
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderColor: '#6c757d',
            color: '#6c757d',
            px: 3,
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              borderColor: '#5a6268',
              bgcolor: 'rgba(108, 117, 125, 0.04)'
            }
          }}
        >
          Cancelar
        </Button>
        
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)',
            px: 4,
            py: 1.5,
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(42, 172, 38, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1f9a1f 0%, #1a8a1a 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(42, 172, 38, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {task ? 'Actualizar' : 'Crear'} Tarea
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GanttTaskDialog;