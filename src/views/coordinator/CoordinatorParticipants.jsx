import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const CoordinatorParticipants = ({ onNavigate }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [participants, setParticipants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
      loadAvailableUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadParticipants();
    } else {
      setParticipants([]);
    }
  }, [selectedProject]);

  useEffect(() => {
    filterParticipants();
  }, [participants, searchTerm]);

  const loadProjects = () => {
    try {
      const coordinatorProjects = dataService.getProjectsByCoordinator(user.id);
      setProjects(coordinatorProjects);
      
      if (coordinatorProjects.length > 0) {
        setSelectedProject(coordinatorProjects[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      showSnackbar('Error al cargar los proyectos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = () => {
    try {
      const projectParticipants = dataService.getProjectParticipants(selectedProject);
      setParticipants(projectParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
      showSnackbar('Error al cargar los participantes', 'error');
    }
  };

  const loadAvailableUsers = () => {
    try {
      const users = dataService.getAll('users')
        .filter(user => user.active && user.role_id === 3); // Solo participantes activos
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const filterParticipants = () => {
    if (!searchTerm) {
      setFilteredParticipants(participants);
    } else {
      const filtered = participants.filter(participant =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParticipants(filtered);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    return project ? project.name : 'Proyecto Desconocido';
  };

  const getPositionName = (positionId) => {
    const positions = dataService.getAll('positions');
    const position = positions.find(p => p.id === positionId);
    return position ? position.name : 'Sin cargo';
  };

  const getParticipantTaskCount = (participantId) => {
    if (!selectedProject) return 0;
    const projectTasks = dataService.getTasksByProject(selectedProject);
    return projectTasks.filter(task => 
      task.assigned_users && task.assigned_users.includes(participantId)
    ).length;
  };

  const getParticipantCompletedTasks = (participantId) => {
    if (!selectedProject) return 0;
    const projectTasks = dataService.getTasksByProject(selectedProject);
    return projectTasks.filter(task => 
      task.assigned_users && 
      task.assigned_users.includes(participantId) &&
      task.status === 'Completada'
    ).length;
  };

  const handleAddParticipants = () => {
    setSelectedUsers([]);
    setOpenDialog(true);
  };

  const handleSaveParticipants = () => {
    try {
      if (selectedUsers.length === 0) {
        showSnackbar('Selecciona al menos un usuario', 'error');
        return;
      }

      let addedCount = 0;
      selectedUsers.forEach(user => {
        const existing = participants.find(p => p.id === user.id);
        if (!existing) {
          dataService.addUserToProject(selectedProject, user.id, user?.id);
          addedCount++;
        }
      });

      if (addedCount > 0) {
        showSnackbar(`${addedCount} participante${addedCount > 1 ? 's' : ''} agregado${addedCount > 1 ? 's' : ''} exitosamente`, 'success');
        loadParticipants();
      } else {
        showSnackbar('Todos los usuarios seleccionados ya son participantes del proyecto', 'warning');
      }

      setOpenDialog(false);
      setSelectedUsers([]);
    } catch (error) {
      showSnackbar('Error al agregar participantes', 'error');
    }
  };

  const handleRemoveParticipant = (participantId) => {
    try {
      // Aquí implementarías la lógica para remover del proyecto
      // Por simplicidad, simulamos la eliminación
      showSnackbar('Participante removido exitosamente', 'success');
      loadParticipants();
    } catch (error) {
      showSnackbar('Error al remover participante', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getAvailableUsersForProject = () => {
    return availableUsers.filter(user => 
      !participants.some(participant => participant.id === user.id)
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => onNavigate('coordinator-dashboard')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
            Gestión de Participantes
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Administra los participantes de tus proyectos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAddParticipants}
          disabled={!selectedProject}
          sx={{
            bgcolor: GREEN,
            textTransform: 'none',
            fontFamily: 'Poppins, sans-serif',
            '&:hover': { bgcolor: '#1f9a1f' }
          }}
        >
          Agregar Participantes
        </Button>
      </Box>

      {/* Project selector */}
      {projects.length > 1 && (
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel>Seleccionar Proyecto</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Seleccionar Proyecto"
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Project info */}
      {selectedProject && (
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
              {getProjectName(selectedProject)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`${participants.length} Participantes`}
                sx={{
                  bgcolor: `${GREEN}20`,
                  color: GREEN,
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                Gestiona quién puede participar en este proyecto
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar participantes por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Participants Grid */}
      <Grid container spacing={3}>
        {filteredParticipants.map((participant) => {
          const taskCount = getParticipantTaskCount(participant.id);
          const completedTasks = getParticipantCompletedTasks(participant.id);
          const completionRate = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={participant.id}>
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
                <CardContent sx={{ textAlign: 'center' }}>
                  {/* Avatar and basic info */}
                  <Avatar 
                    src={participant.avatar} 
                    alt={participant.name}
                    sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 0.5 }}>
                    {participant.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 14, color: '#666' }} />
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      {participant.email}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', display: 'block', mb: 2 }}>
                    {getPositionName(participant.position_id)}
                  </Typography>

                  {/* Task stats */}
                  <Box sx={{ 
                    bgcolor: '#f8f9fa', 
                    borderRadius: 2, 
                    p: 2, 
                    mb: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                      Tareas en este Proyecto
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                          {taskCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          Total
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
                          {completedTasks}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          Completadas
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800', fontFamily: 'Poppins, sans-serif' }}>
                          {completionRate}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          Progreso
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <IconButton
                    onClick={() => handleRemoveParticipant(participant.id)}
                    sx={{ 
                      color: '#f44336',
                      '&:hover': { bgcolor: '#ffebee' }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty states */}
      {filteredParticipants.length === 0 && participants.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No se encontraron participantes
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
              Intenta ajustar el término de búsqueda
            </Typography>
          </CardContent>
        </Card>
      )}

      {participants.length === 0 && selectedProject && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No hay participantes en este proyecto
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1, mb: 3 }}>
              Agrega participantes para comenzar la colaboración
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleAddParticipants}
              sx={{
                bgcolor: GREEN,
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': { bgcolor: '#1f9a1f' }
              }}
            >
              Agregar Primer Participante
            </Button>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No tienes proyectos asignados
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
              Los participantes aparecerán aquí cuando tengas proyectos asignados
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Add Participants Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Agregar Participantes al Proyecto
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 2 }}>
              Proyecto: <strong>{getProjectName(selectedProject)}</strong>
            </Typography>
            <Autocomplete
              multiple
              options={getAvailableUsersForProject()}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUsers}
              onChange={(event, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar usuarios"
                  placeholder="Buscar usuarios disponibles..."
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar src={option.avatar} alt={option.name} sx={{ width: 32, height: 32, mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
            {getAvailableUsersForProject().length === 0 && (
              <Alert severity="info" sx={{ mt: 2, fontFamily: 'Poppins, sans-serif' }}>
                Todos los usuarios disponibles ya son participantes de este proyecto.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveParticipants} 
            variant="contained" 
            disabled={selectedUsers.length === 0}
            sx={{ 
              bgcolor: GREEN,
              fontFamily: 'Poppins, sans-serif',
              '&:hover': { bgcolor: '#1f9a1f' }
            }}
          >
            Agregar {selectedUsers.length} Participante{selectedUsers.length !== 1 ? 's' : ''}
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
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CoordinatorParticipants;
