import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import dataService from '../../utils/dataService';
import activityService from '../../utils/activityService';
import DashboardWidgets from '../../components/dashboard/DashboardWidgets';

const GREEN = '#2AAC26';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({});
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Escuchar cambios en las actividades
  useEffect(() => {
    const handleStorageChange = () => {
      // Recargar actividades cuando cambie el localStorage
      const activities = activityService.getRecentActivities(10);
      setRecentActivities(activities);
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar eventos personalizados de actividad
    const handleActivityAdded = () => {
      console.log('AdminDashboard - Nueva actividad detectada, recargando...');
      const allActivities = activityService.getAllActivities();
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50);
      setRecentActivities(sortedActivities);
    };

    // Agregar listener para eventos de actividad
    window.addEventListener('activityAdded', handleActivityAdded);

    // Intervalo de actualización como respaldo (cada 5 segundos)
    const updateInterval = setInterval(() => {
      const allActivities = activityService.getAllActivities();
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50);
      
      setRecentActivities(prevActivities => {
        // Solo actualizar si hay cambios
        if (JSON.stringify(sortedActivities) !== JSON.stringify(prevActivities)) {
          console.log('AdminDashboard - Actualización por intervalo detectada');
          return sortedActivities;
        }
        return prevActivities;
      });
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('activityAdded', handleActivityAdded);
      clearInterval(updateInterval);
    };
  }, []);

  const loadDashboardData = () => {
    try {
      const dashboardStats = dataService.getDashboardStats();
      setStats(dashboardStats);

      // Obtener proyectos recientes
      const projects = dataService.getAll('projects')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentProjects(projects);

      // Obtener usuarios recientes
      const users = dataService.getAll('users')
        .filter(user => user.active)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentUsers(users);

      // Cargar actividades recientes
      loadRecentActivities(users);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = (users) => {
    try {
      // Obtener todas las actividades del localStorage (persistencia completa)
      const allActivities = activityService.getAllActivities();
      console.log('AdminDashboard - Cargando actividades del localStorage:', allActivities.length);
      
      // Ordenar por timestamp (más recientes primero) y limitar a 50 para rendimiento
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50);
      
      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      setRecentActivities([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso': return '#4caf50';
      case 'Completado': return '#2196f3';
      case 'Planificación': return '#ff9800';
      case 'Pausado': return '#f44336';
      default: return '#757575';
    }
  };

  const getRoleColor = (roleId) => {
    switch (roleId) {
      case 1: return '#e53935'; // Administrador
      case 2: return '#1e88e5'; // Coordinador
      case 3: return '#43a047'; // Participante
      default: return '#757575';
    }
  };

  const getRoleName = (roleId) => {
    const roles = dataService.getAll('roles');
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Desconocido';
  };

  const getProjectProgress = (project) => {
    const tasks = dataService.getTasksByProject(project.id);
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(t => t.status === 'Completada').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getProjectParticipants = (projectId) => {
    const participants = dataService.getProjectParticipants(projectId);
    return participants.slice(0, 3);
  };

  // Obtener información del usuario para una actividad
  const getUserForActivity = (userId) => {
    return recentUsers.find(user => user.id === userId) || 
           dataService.getAll('users').find(user => user.id === userId);
  };

  // Obtener actividades agrupadas por usuario con historial completo
  const getActivitiesByUser = () => {
    const activitiesByUser = {};
    
    recentActivities.forEach(activity => {
      const user = getUserForActivity(activity.userId);
      if (user) {
        if (!activitiesByUser[user.id]) {
          activitiesByUser[user.id] = {
            user,
            activities: []
          };
        }
        activitiesByUser[user.id].activities.push(activity);
      }
    });

    // Convertir a array y ordenar por la actividad más reciente
    return Object.values(activitiesByUser)
      .map(userData => ({
        ...userData,
        // Ordenar actividades del usuario por timestamp (más reciente primero)
        activities: userData.activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        lastActivity: userData.activities[0] // La más reciente
      }))
      .sort((a, b) => new Date(b.lastActivity.timestamp) - new Date(a.lastActivity.timestamp))
      .slice(0, 5); // Mostrar solo 5 usuarios
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProjectPriority = (project) => {
    const tasks = dataService.getTasksByProject(project.id);
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      return dueDate < today && task.status !== 'Completada';
    }).length;
    
    if (overdueTasks > 0) return 'high';
    if (project.status === 'Pausado') return 'low';
    return 'medium';
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
          Panel de Administrador
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
          Vista general del sistema ECO
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                    {stats.totalProjects || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Total Proyectos
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${GREEN}20`, color: GREEN }}>
                  <FolderIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
                    {stats.activeProjects || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Proyectos Activos
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#2196f3' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800', fontFamily: 'Poppins, sans-serif' }}>
                    {stats.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Usuarios Activos
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', fontFamily: 'Poppins, sans-serif' }}>
                    {(stats.completedTasks || 0) + (stats.pendingTasks || 0) + (stats.inProgressTasks || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Total Tareas
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f3e5f5', color: '#9c27b0' }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Proyectos Section - Horizontal Layout */}
      <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Proyectos del Sistema
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => onNavigate('admin-projects')}
                    sx={{
                      borderColor: GREEN,
                      color: GREEN,
                      textTransform: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      '&:hover': { 
                        borderColor: '#1f9a1f', 
                        bgcolor: 'rgba(42, 172, 38, 0.04)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Ver Todos
                  </Button>
                </Box>
              </Box>

        {recentProjects.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                No hay proyectos en el sistema
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
                Crea el primer proyecto para comenzar
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {recentProjects.map((project) => {
              const progress = getProjectProgress(project);
              const participants = getProjectParticipants(project.id);
              const daysRemaining = getDaysRemaining(project.end_date);
              const priority = getProjectPriority(project);

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
                        <IconButton
                          size="small"
                          onClick={() => onNavigate('admin-projects')}
                          sx={{ color: GREEN }}
                        >
                          <VisibilityIcon />
                        </IconButton>
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

                      {/* Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                            Progreso de Tareas
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

                      {/* Timeline */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          {daysRemaining > 0 ? `${daysRemaining} días restantes` : daysRemaining === 0 ? 'Termina hoy' : `Vencido hace ${Math.abs(daysRemaining)} días`}
                        </Typography>
                </Box>

                      {/* Footer */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onNavigate('admin-projects')}
                          sx={{
                            borderColor: GREEN,
                            color: GREEN,
                            textTransform: 'none',
                            fontFamily: 'Poppins, sans-serif',
                            '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' }
                          }}
                        >
                          Ver Proyecto
                        </Button>
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
        )}
      </Box>

      {/* Actividad Reciente - Horizontal */}
      <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Actividad Reciente
                </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  activityService.clearAllActivities();
                  setRecentActivities([]);
                  console.log('Actividades limpiadas manualmente');
                }}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  textTransform: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.75rem',
                  '&:hover': { borderColor: '#d32f2f', bgcolor: '#ffebee' }
                }}
              >
                🗑️ Limpiar
              </Button>
            )}
                <Button
                  variant="outlined"
                  onClick={() => onNavigate('admin-users')}
                  sx={{
                    borderColor: GREEN,
                    color: GREEN,
                    textTransform: 'none',
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' }
                  }}
                >
                  Ver Todos
                </Button>
              </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
          {getActivitiesByUser().length > 0 ? (
            getActivitiesByUser().map((userData) => {
              const { user, activities } = userData;
              const lastActivity = activities[0]; // La más reciente
              const activityDescription = activityService.getActivityDescription(lastActivity);
              const activityIcon = activityService.getActivityIcon(lastActivity.activityType);
              const relativeTime = activityService.getRelativeTime(lastActivity.timestamp);
              
              return (
                <Card
                  key={user.id}
                  sx={{
                    minWidth: 350,
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                    },
                    cursor: 'pointer'
                  }}
                  onClick={() => onNavigate('admin-users')}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header con usuario */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar 
                        src={user.avatar} 
                        alt={user.name} 
                        sx={{ 
                          width: 48, 
                          height: 48,
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 0.5 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                          {user.email}
                        </Typography>
                        <Chip
                          label={getRoleName(user.role_id)}
                          size="small"
                          sx={{
                            bgcolor: `${getRoleColor(user.role_id)}20`,
                            color: getRoleColor(user.role_id),
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Historial de actividades */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600, 
                        fontFamily: 'Poppins, sans-serif',
                        color: '#333',
                        mb: 1.5
                      }}>
                        Actividades Recientes ({activities.length})
                      </Typography>
                      
                      <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                        {activities.slice(0, 5).map((activity, index) => {
                          const desc = activityService.getActivityDescription(activity);
                          const icon = activityService.getActivityIcon(activity.activityType);
                          const time = activityService.getRelativeTime(activity.timestamp);
                          
                          return (
                            <Box 
                              key={activity.id}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: 1.5, 
                                mb: 1.5,
                                p: 1.5,
                                bgcolor: index === 0 ? '#f8f9fa' : 'transparent',
                                borderRadius: 1.5,
                                border: index === 0 ? '1px solid #e9ecef' : 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: '#f5f5f5',
                                  borderRadius: 2
                                }
                              }}
                            >
                              <Typography sx={{ fontSize: '1rem', lineHeight: 1, mt: 0.2 }}>
                                {icon}
                              </Typography>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#333', 
                                  fontFamily: 'Poppins, sans-serif',
                                  fontWeight: index === 0 ? 500 : 400,
                                  lineHeight: 1.4,
                                  fontSize: index === 0 ? '0.875rem' : '0.8rem'
                                }}>
                                  {desc}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: '#999', 
                                  fontFamily: 'Poppins, sans-serif',
                                  fontSize: '0.75rem'
                                }}>
                                  {time}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Footer con estado y tiempo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: user.active ? '#4caf50' : '#f44336'
                        }} />
                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                        {relativeTime}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card sx={{ 
              minWidth: 320, 
              borderRadius: 3, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '2px dashed #e0e0e0'
            }}>
              <CardContent sx={{ 
                p: 4, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200
              }}>
                <Typography sx={{ fontSize: '3rem', mb: 2, opacity: 0.5 }}>
                  🔔
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  fontFamily: 'Poppins, sans-serif',
                  color: '#666',
                  mb: 1
                }}>
                  Sin Actividad Reciente
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#999', 
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center',
                  maxWidth: 250
                }}>
                  Las actividades de los usuarios aparecerán aquí cuando realicen acciones en el sistema
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Widgets de Sustentabilidad */}
      <Grid container spacing={3}>
        {/* Huella de Carbono */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  Huella de Carbono
                </Typography>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>🌱</Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                2.4 tCO₂
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Poppins, sans-serif' }}>
                Reducido este mes
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
                  -15% vs mes anterior
                </Typography>
                <TrendingDownIcon sx={{ fontSize: 16, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Energía Renovable */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  Energía Renovable
                </Typography>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>⚡</Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                87%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Poppins, sans-serif' }}>
                De energía limpia utilizada
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
                  +5% vs mes anterior
                </Typography>
                <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Proyectos Verdes */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  Proyectos Verdes
                </Typography>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>🌿</Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                {stats.totalProjects || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Poppins, sans-serif' }}>
                Proyectos sustentables activos
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
                  {stats.activeProjects || 0} en progreso
                </Typography>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      
      {/* Widgets Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
          Métricas Avanzadas
        </Typography>
        <DashboardWidgets customizable={true} />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
