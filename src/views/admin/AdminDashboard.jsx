import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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

      <Grid container spacing={3}>
        {/* Proyectos Recientes */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  Proyectos Recientes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => onNavigate('admin-projects')}
                    sx={{
                      bgcolor: GREEN,
                      textTransform: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      '&:hover': { bgcolor: '#1f9a1f' }
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
                      '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' }
                    }}
                  >
                    Ver Todos
                  </Button>
                </Box>
              </Box>

              {recentProjects.map((project) => (
                <Box
                  key={project.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: '#f8f9fa',
                    '&:hover': { bgcolor: '#e9ecef' },
                    cursor: 'pointer',
                    minHeight: 100,
                    width: '100%'
                  }}
                  onClick={() => onNavigate('admin-projects')}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600, 
                        fontFamily: 'Poppins, sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5
                      }}
                    >
                      {project.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666', 
                        fontFamily: 'Poppins, sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {project.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
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
                        {new Date(project.start_date).toLocaleDateString('es-ES')} - {new Date(project.end_date).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Usuarios Recientes */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
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

              {recentUsers.map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: '#f8f9fa',
                    '&:hover': { bgcolor: '#e9ecef' },
                    cursor: 'pointer'
                  }}
                  onClick={() => onNavigate('admin-users')}
                >
                  <Avatar src={user.avatar} alt={user.name} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      {user.email}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getRoleName(user.role_id)}
                        size="small"
                        sx={{
                          bgcolor: `${getRoleColor(user.role_id)}20`,
                          color: getRoleColor(user.role_id),
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '10px'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
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
