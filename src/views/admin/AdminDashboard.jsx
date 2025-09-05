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
import DashboardWidgets from '../../components/dashboard/DashboardWidgets';

const GREEN = '#2AAC26';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({});
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
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

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => onNavigate('admin-projects')}
                    sx={{
                      background: 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)',
                      textTransform: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      boxShadow: '0 4px 12px rgba(42, 172, 38, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1f9a1f 0%, #1a8a1a 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(42, 172, 38, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Nuevo Proyecto
                  </Button>
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

      {/* Usuarios Recientes - Horizontal */}
      <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  Usuarios Recientes
                </Typography>
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

        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {recentUsers.map((user) => (
            <Card
                  key={user.id}
                  sx={{
                minWidth: 280,
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
                    Última actividad: Hoy
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
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
