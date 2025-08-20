import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import cacheService from '../../utils/cacheService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const GREEN = '#2AAC26';

const UserProfile = ({ userId, onBack, onNavigate }) => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del usuario
      const userData = dataService.getById('users', parseInt(userId));
      if (!userData) {
        throw new Error('Usuario no encontrado');
      }
      setUser(userData);

      // Cargar proyectos y tareas del usuario
      const [allProjects, allTasks] = await Promise.all([
        cacheService.getProjects(),
        cacheService.getTasks()
      ]);

      // Filtrar proyectos según el rol del usuario
      let projects = [];
      if (userData.role === 'Coordinador') {
        projects = allProjects.filter(p => p.creator_id === userData.id);
      } else if (userData.role === 'Participante') {
        const projectUsers = dataService.getAll('project_users');
        const userProjectIds = projectUsers
          .filter(pu => pu.user_id === userData.id)
          .map(pu => pu.project_id);
        projects = allProjects.filter(p => userProjectIds.includes(p.id));
      } else if (userData.role === 'Administrador') {
        projects = allProjects; // Admin puede ver todos
      }

      // Filtrar tareas del usuario
      const tasks = userData.role === 'Coordinador' 
        ? allTasks.filter(t => projects.some(p => p.id === t.project_id))
        : allTasks.filter(t => t.assigned_users && t.assigned_users.includes(userData.id));

      setUserProjects(projects);
      setUserTasks(tasks);

      // Calcular estadísticas
      const stats = calculateUserStats(userData, projects, tasks);
      setUserStats(stats);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = (userData, projects, tasks) => {
    const completedTasks = tasks.filter(t => t.status === 'Completada').length;
    const inProgressTasks = tasks.filter(t => t.status === 'En progreso').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
    
    const completedProjects = projects.filter(p => p.status === 'Completado').length;
    const activeProjects = projects.filter(p => p.status === 'En progreso').length;
    
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    // Calcular productividad por mes (últimos 6 meses)
    const productivity = calculateMonthlyProductivity(tasks);
    
    return {
      totalProjects: projects.length,
      completedProjects,
      activeProjects,
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate,
      productivity,
      joinDate: userData.created_at || '2024-01-01',
      lastActivity: getLastActivity(tasks)
    };
  };

  const calculateMonthlyProductivity = (tasks) => {
    const months = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'];
    return months.map(month => ({
      month,
      completed: Math.floor(Math.random() * 10) + 2, // Datos simulados
      total: Math.floor(Math.random() * 15) + 5
    }));
  };

  const getLastActivity = (tasks) => {
    if (tasks.length === 0) return 'Sin actividad reciente';
    
    const latestTask = tasks
      .filter(t => t.updated_at || t.created_at)
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))[0];
    
    if (!latestTask) return 'Sin actividad reciente';
    
    const activityDate = new Date(latestTask.updated_at || latestTask.created_at);
    const now = new Date();
    const diffDays = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return activityDate.toLocaleDateString('es-ES');
  };

  const getTasksChartData = () => {
    if (!userStats) return null;

    return {
      labels: ['Completadas', 'En Progreso', 'Pendientes'],
      datasets: [{
        data: [userStats.completedTasks, userStats.inProgressTasks, userStats.pendingTasks],
        backgroundColor: [GREEN, '#ff9800', '#f44336'],
        borderWidth: 0
      }]
    };
  };

  const getProductivityChartData = () => {
    if (!userStats?.productivity) return null;

    return {
      labels: userStats.productivity.map(p => p.month),
      datasets: [{
        label: 'Tareas Completadas',
        data: userStats.productivity.map(p => p.completed),
        backgroundColor: GREEN + '80',
        borderColor: GREEN,
        borderWidth: 2
      }, {
        label: 'Total Asignadas',
        data: userStats.productivity.map(p => p.total),
        backgroundColor: '#e0e0e0',
        borderColor: '#bdbdbd',
        borderWidth: 2
      }]
    };
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrador': return '#f44336';
      case 'Coordinador': return '#ff9800';
      case 'Participante': return '#2196f3';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado':
      case 'Completada': return '#4caf50';
      case 'En progreso': return '#ff9800';
      case 'Pendiente': return '#f44336';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Cargando perfil...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', color: '#f44336' }}>
          Usuario no encontrado
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            Perfil de Usuario
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={user.avatar} 
                  alt={user.name}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    border: `4px solid ${GREEN}20`
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                  {user.name}
                </Typography>
                <Chip
                  label={user.role}
                  sx={{
                    bgcolor: `${getRoleBadgeColor(user.role)}20`,
                    color: getRoleBadgeColor(user.role),
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    mb: 2
                  }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {user.email}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <CalendarTodayIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Miembro desde {new Date(userStats?.joinDate).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: '#999' }}>
                  Última actividad: {userStats?.lastActivity}
                </Typography>
              </CardContent>
            </Card>

            {/* Estadísticas Rápidas */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  Estadísticas
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                      {userStats?.totalProjects || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Proyectos
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
                      {userStats?.totalTasks || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Tareas
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Tasa de Completación
                    </Typography>
                    <Typography variant="body2" sx={{ color: GREEN, fontWeight: 600 }}>
                      {userStats?.completionRate || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={userStats?.completionRate || 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: GREEN,
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráficos y Actividad */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Distribución de Tareas */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: 300 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Distribución de Tareas
                    </Typography>
                    {userStats?.totalTasks > 0 ? (
                      <Box sx={{ height: 200 }}>
                        <Doughnut 
                          data={getTasksChartData()} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: { font: { family: 'Poppins' } }
                              }
                            }
                          }} 
                        />
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <AssignmentIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          No hay tareas asignadas
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Productividad Mensual */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: 300 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Productividad (6 meses)
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <Bar 
                        data={getProductivityChartData()} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: { font: { family: 'Poppins' } }
                            }
                          },
                          scales: {
                            y: { beginAtZero: true }
                          }
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Proyectos del Usuario */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                        Proyectos ({userProjects.length})
                      </Typography>
                      <TrendingUpIcon sx={{ color: GREEN }} />
                    </Box>
                    
                    {userProjects.length > 0 ? (
                      <List sx={{ maxHeight: 250, overflow: 'auto' }}>
                        {userProjects.slice(0, 5).map((project, index) => (
                          <React.Fragment key={project.id}>
                            <ListItem 
                              sx={{ 
                                px: 0, 
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#f5f5f5' }
                              }}
                              onClick={() => onNavigate('project-detail', { projectId: project.id })}
                            >
                              <ListItemIcon>
                                <FolderIcon sx={{ color: GREEN }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={project.name}
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Chip
                                      label={project.status}
                                      size="small"
                                      sx={{
                                        bgcolor: `${getStatusColor(project.status)}20`,
                                        color: getStatusColor(project.status),
                                        fontSize: '10px',
                                        height: 18
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                      {new Date(project.created_at).toLocaleDateString('es-ES')}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < Math.min(userProjects.length - 1, 4) && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <FolderIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          No participa en proyectos
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Tareas Recientes */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Tareas Recientes ({userTasks.length})
                    </Typography>
                    
                    {userTasks.length > 0 ? (
                      <List sx={{ maxHeight: 250, overflow: 'auto' }}>
                        {userTasks.slice(0, 5).map((task, index) => (
                          <React.Fragment key={task.id}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <AssignmentIcon sx={{ color: getStatusColor(task.status) }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={task.title}
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Chip
                                      label={task.status}
                                      size="small"
                                      sx={{
                                        bgcolor: `${getStatusColor(task.status)}20`,
                                        color: getStatusColor(task.status),
                                        fontSize: '10px',
                                        height: 18
                                      }}
                                    />
                                    {task.due_date && (
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Vence: {new Date(task.due_date).toLocaleDateString('es-ES')}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < Math.min(userTasks.length - 1, 4) && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <AssignmentIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          No hay tareas asignadas
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default UserProfile;
