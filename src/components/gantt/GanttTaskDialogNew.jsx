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
  Divider,
  Grid,
  Switch,
  FormControlLabel,
  Slider,
  IconButton,
  Stack
} from '@mui/material';
import {
  Close,
  Save,
  Delete,
  Person,
  Schedule,
  Flag,
  Link,
  Star,
  StarBorder,
  Add,
  Remove
} from '@mui/icons-material';

const GanttTaskDialogNew = ({ 
  open, 
  onClose, 
  onSave, 
  onDelete, 
  task, 
  projects, 
  users 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pendiente',
    priority: 'Media',
    due_date: '',
    project_id: '',
    assigned_users: [],
    progress: 0,
    estimated_hours: 8,
    actual_hours: 0,
    tags: [],
    dependencies: [],
    is_milestone: false,
    is_favorite: false
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Pendiente',
        priority: task.priority || 'Media',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        project_id: task.project_id || '',
        assigned_users: task.assigned_users || [],
        progress: task.progress || 0,
        estimated_hours: task.estimated_hours || 8,
        actual_hours: task.actual_hours || 0,
        tags: task.tags || [],
        dependencies: task.dependencies || [],
        is_milestone: task.is_milestone || false,
        is_favorite: task.is_favorite || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Pendiente',
        priority: 'Media',
        due_date: '',
        project_id: '',
        assigned_users: [],
        progress: 0,
        estimated_hours: 8,
        actual_hours: 0,
        tags: [],
        dependencies: [],
        is_milestone: false,
        is_favorite: false
      });
    }
  }, [task, open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    const taskData = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      id: task?.id || Date.now()
    };

    onSave(taskData);
    onClose();
  };

  const handleDelete = () => {
    if (task && window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
          {task ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {task && (
            <IconButton
              onClick={() => handleInputChange('is_favorite', !formData.is_favorite)}
              size="small"
            >
              {formData.is_favorite ? <Star sx={{ color: '#FFD700' }} /> : <StarBorder />}
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
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
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Título y Proyecto */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Título de la tarea"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                fullWidth
                required
                placeholder="Ingresa el título de la tarea"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Proyecto</InputLabel>
                <Select
                  value={formData.project_id}
                  onChange={(e) => handleInputChange('project_id', e.target.value)}
                  label="Proyecto"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                >
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Descripción */}
          <TextField
            label="Descripción"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Describe la tarea en detalle"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />

          {/* Estado, Prioridad y Fecha */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Estado"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En progreso">En progreso</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                  <MenuItem value="Cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
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
                  <MenuItem value="Baja">Baja</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Alta">Alta</MenuItem>
                  <MenuItem value="Urgente">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Fecha de vencimiento"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Asignados */}
          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(option) => option.name}
            value={users.filter(user => formData.assigned_users.includes(user.id))}
            onChange={(event, newValue) => {
              const userIds = newValue.map(user => user.id);
              handleInputChange('assigned_users', userIds);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.id}
                  sx={{ borderRadius: 1 }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Usuarios Asignados"
                placeholder="Seleccionar usuarios..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
            )}
          />

          {/* Progreso y Horas */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Progreso: {formData.progress}%
              </Typography>
              <Slider
                value={formData.progress}
                onChange={(e, value) => handleInputChange('progress', value)}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Horas Estimadas"
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => handleInputChange('estimated_hours', parseInt(e.target.value) || 0)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Horas Reales"
                    type="number"
                    value={formData.actual_hours}
                    onChange={(e) => handleInputChange('actual_hours', parseInt(e.target.value) || 0)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Tags */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Etiquetas
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Agregar etiqueta"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ flex: 1 }}
              />
              <Button
                size="small"
                onClick={handleAddTag}
                startIcon={<Add />}
                variant="outlined"
              >
                Agregar
              </Button>
            </Box>
          </Box>

          {/* Opciones adicionales */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Opciones
            </Typography>
            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_milestone}
                    onChange={(e) => handleInputChange('is_milestone', e.target.checked)}
                  />
                }
                label="Es un hito"
              />
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
        {task && (
          <Button
            onClick={handleDelete}
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              px: 3,
              py: 1,
              borderRadius: 1
            }}
          >
            Eliminar
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
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
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            px: 3,
            py: 1,
            borderRadius: 1,
            bgcolor: '#2AAC26',
            '&:hover': { 
              bgcolor: '#1f9a1f' 
            }
          }}
        >
          {task ? 'Actualizar Tarea' : 'Crear Tarea'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GanttTaskDialogNew;
