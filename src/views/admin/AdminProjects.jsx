import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import dataService from '../../utils/dataService';
import activityService from '../../utils/activityService';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const AdminProjects = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Planificación',
    creator_id: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const statusOptions = [
    'Planificación',
    'En progreso',
    'Pausado',
    'Completado',
    'Cancelado'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadData = () => {
    try {
      const projectsData = dataService.getAll('projects');
      const usersData = dataService.getAll('users').filter(user => user.active);
      
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      showSnackbar('Error al cargar los datos', 'error');
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso': return '#4caf50';
      case 'Completado': return '#2196f3';
      case 'Planificación': return '#ff9800';
      case 'Pausado': return '#f44336';
      case 'Cancelado': return '#757575';
      default: return '#757575';
    }
  };

  const getCreatorName = (creatorId) => {
    const creator = users.find(u => u.id === creatorId);
    return creator ? creator.name : 'Desconocido';
  };

  const getProjectProgress = (project) => {
    // Simulación del progreso basado en fechas
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const currentDate = new Date();
    
    if (currentDate < startDate) return 0;
    if (currentDate > endDate) return 100;
    
    const totalDuration = endDate - startDate;
    const elapsed = currentDate - startDate;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    return Math.round(progress);
  };

  const getProjectParticipants = (projectId) => {
    const participants = dataService.getProjectParticipants(projectId);
    return participants.slice(0, 3); // Mostrar solo los primeros 3
  };

  const handleOpenDialog = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        status: project.status,
        creator_id: project.creator_id
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'Planificación',
        creator_id: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
  };

  const handleSaveProject = () => {
    try {
      if (!formData.name || !formData.description || !formData.start_date || !formData.end_date || !formData.creator_id) {
        showSnackbar('Por favor complete todos los campos obligatorios', 'error');
        return;
      }

      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        showSnackbar('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
        return;
      }

      if (editingProject) {
        dataService.update('projects', editingProject.id, formData);
        
        // Registrar actividad
        if (currentUser?.id) {
          activityService.addActivity(
            currentUser.id,
            activityService.ACTIVITY_TYPES.PROJECT_UPDATED,
            {
              projectName: formData.name,
              projectId: editingProject.id
            }
          );
        }
        
        showSnackbar('Proyecto actualizado exitosamente', 'success');
      } else {
        const newProject = dataService.create('projects', formData);
        
        // Registrar actividad
        if (currentUser?.id) {
          activityService.addActivity(
            currentUser.id,
            activityService.ACTIVITY_TYPES.PROJECT_CREATED,
            {
              projectName: formData.name,
              projectId: newProject.id
            }
          );
        }
        
        showSnackbar('Proyecto creado exitosamente', 'success');
      }

      loadData();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Error al guardar el proyecto', 'error');
    }
  };

  const handleDeleteProject = (projectId) => {
    try {
      const projectToDelete = projects.find(p => p.id === projectId);
      
      dataService.delete('projects', projectId);
      
      // Registrar actividad
      if (currentUser?.id && projectToDelete) {
        activityService.addActivity(
          currentUser.id,
          activityService.ACTIVITY_TYPES.PROJECT_DELETED,
          {
            projectName: projectToDelete.name,
            projectId: projectId
          }
        );
      }
      
      showSnackbar('Proyecto eliminado exitosamente', 'success');
      loadData();
    } catch (error) {
      showSnackbar('Error al eliminar el proyecto', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => onNavigate('admin-dashboard')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
            Gestión de Proyectos
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Administrar proyectos del sistema ECO
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: GREEN,
            textTransform: 'none',
            fontFamily: 'Poppins, sans-serif',
            '&:hover': { bgcolor: '#1f9a1f' }
          }}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => {
          const progress = getProjectProgress(project);
          const participants = getProjectParticipants(project.id);

          return (
            <Grid item size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          fontFamily: 'Poppins, sans-serif',
                          mb: 0.5,
                          lineHeight: 1.2
                        }}
                      >
                        {project.name}
                      </Typography>
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(project.status)}20`,
                          color: getStatusColor(project.status),
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => onNavigate('project-detail', project)}
                        sx={{ color: '#2196f3' }}
                        title="Ver detalles del proyecto"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(project)}
                        sx={{ color: GREEN }}
                        title="Editar proyecto"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProject(project.id)}
                        sx={{ color: '#f44336' }}
                        title="Eliminar proyecto"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666', 
                      fontFamily: 'Poppins, sans-serif',
                      mb: 2,
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {project.description}
                  </Typography>

                  {/* Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                        Progreso
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', color: GREEN }}>
                        {progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: GREEN,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>

                  {/* Dates */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      {new Date(project.start_date).toLocaleDateString('es-ES')} - {new Date(project.end_date).toLocaleDateString('es-ES')}
                    </Typography>
                  </Box>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        Creado por: {getCreatorName(project.creator_id)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {participants.length > 0 && (
                        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '12px' } }}>
                          {participants.map((participant) => (
                            <Avatar 
                              key={participant.id} 
                              src={participant.avatar} 
                              alt={participant.name}
                              title={participant.name}
                            />
                          ))}
                        </AvatarGroup>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredProjects.length === 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No se encontraron proyectos
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
              {searchTerm || statusFilter ? 'Intenta ajustar los filtros de búsqueda' : 'Crea tu primer proyecto'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Dialog for Create/Edit Project */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del proyecto"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Fecha de inicio"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Fecha de fin"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Estado"
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Coordinador</InputLabel>
                <Select
                  value={formData.creator_id}
                  onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                  label="Coordinador"
                >
                  {users.filter(user => user.role_id === 2 || user.role_id === 1).map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} - {user.role_id === 1 ? 'Administrador' : 'Coordinador'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveProject} 
            variant="contained" 
            sx={{ 
              bgcolor: GREEN,
              '&:hover': { bgcolor: '#1f9a1f' }
            }}
          >
            {editingProject ? 'Actualizar' : 'Crear'}
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

export default AdminProjects;
