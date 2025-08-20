import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const ParticipantProjects = ({ onNavigate }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const statusOptions = ['Planificación', 'En progreso', 'Pausado', 'Completado', 'Cancelado'];

  useEffect(() => {
    if (user) {
      loadParticipantProjects();
    }
  }, [user]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadParticipantProjects = () => {
    try {
      // Obtener todos los proyectos donde el usuario es participante
      const allProjects = dataService.getAll('projects');
      const projectUsers = dataService.getAll('project_users');
      
      // Filtrar proyectos donde el usuario participa
      const userProjectIds = projectUsers
        .filter(pu => pu.user_id === user.id)
        .map(pu => pu.project_id);
      
      const participantProjects = allProjects.filter(project => 
        userProjectIds.includes(project.id)
      );
      
      setProjects(participantProjects);
    } catch (error) {
      console.error('Error loading participant projects:', error);
    } finally {
      setLoading(false);
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

  const getMyTasksInProject = (projectId) => {
    const allTasks = dataService.getTasksByProject(projectId);
    return allTasks.filter(task => 
      task.assigned_users && task.assigned_users.includes(user.id)
    );
  };

  const getMyTaskProgress = (projectId) => {
    const myTasks = getMyTasksInProject(projectId);
    if (myTasks.length === 0) return 0;
    
    const completedTasks = myTasks.filter(task => task.status === 'Completada').length;
    return Math.round((completedTasks / myTasks.length) * 100);
  };

  const getProjectParticipants = (projectId) => {
    const participants = dataService.getProjectParticipants(projectId);
    return participants.slice(0, 4); // Mostrar máximo 4
  };

  const getCoordinatorName = (creatorId) => {
    const coordinator = dataService.getById('users', creatorId);
    return coordinator ? coordinator.name : 'Desconocido';
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskStatusCounts = (projectId) => {
    const myTasks = getMyTasksInProject(projectId);
    return {
      total: myTasks.length,
      pending: myTasks.filter(task => task.status === 'Pendiente').length,
      inProgress: myTasks.filter(task => task.status === 'En progreso').length,
      completed: myTasks.filter(task => task.status === 'Completada').length
    };
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
          onClick={() => onNavigate('participant-dashboard')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
            Mis Proyectos
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Proyectos en los que participas
          </Typography>
        </Box>
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
          const myTaskProgress = getMyTaskProgress(project.id);
          const participants = getProjectParticipants(project.id);
          const daysRemaining = getDaysRemaining(project.end_date);
          const taskCounts = getTaskStatusCounts(project.id);

          return (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
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
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        fontFamily: 'Poppins, sans-serif',
                        mb: 1,
                        lineHeight: 1.2
                      }}
                    >
                      {project.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(project.status)}20`,
                          color: getStatusColor(project.status),
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        Coordinador: {getCoordinatorName(project.creator_id)}
                      </Typography>
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
                      '-webkit-line-clamp': 2,
                      '-webkit-box-orient': 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {project.description}
                  </Typography>

                  {/* My Task Progress */}
                  {taskCounts.total > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                          Mis Tareas ({taskCounts.completed}/{taskCounts.total})
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', color: GREEN }}>
                          {myTaskProgress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={myTaskProgress}
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
                  )}

                  {/* Task Status Breakdown */}
                  {taskCounts.total > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mb: 2,
                      p: 1.5,
                      bgcolor: '#f8f9fa',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800', fontFamily: 'Poppins, sans-serif' }}>
                          {taskCounts.pending}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          Pendientes
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
                          {taskCounts.inProgress}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          En Progreso
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50', fontFamily: 'Poppins, sans-serif' }}>
                          {taskCounts.completed}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          Completadas
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {taskCounts.total === 0 && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      mb: 2,
                      bgcolor: '#f8f9fa',
                      borderRadius: 1,
                      border: '1px dashed #ddd'
                    }}>
                      <AssignmentIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        No tienes tareas asignadas
                      </Typography>
                    </Box>
                  )}

                  {/* Timeline */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      {daysRemaining > 0 
                        ? `${daysRemaining} días restantes` 
                        : daysRemaining === 0 
                          ? 'Termina hoy' 
                          : `Vencido hace ${Math.abs(daysRemaining)} días`
                      }
                    </Typography>
                  </Box>

                  {/* Project dates */}
                  <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', display: 'block', mb: 2 }}>
                    {new Date(project.start_date).toLocaleDateString('es-ES')} - {new Date(project.end_date).toLocaleDateString('es-ES')}
                  </Typography>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        {participants.length} participante{participants.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '12px' } }}>
                      {participants.map((participant) => (
                        <Avatar 
                          key={participant.id} 
                          src={participant.avatar} 
                          alt={participant.name}
                          title={participant.name}
                        />
                      ))}
                    </AvatarGroup>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty states */}
      {filteredProjects.length === 0 && projects.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No se encontraron proyectos
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
              Intenta ajustar los filtros de búsqueda
            </Typography>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No participas en ningún proyecto
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
              Los proyectos aparecerán aquí cuando seas agregado por un coordinador
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ParticipantProjects;
