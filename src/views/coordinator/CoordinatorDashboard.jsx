import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import IconButton from '@mui/material/IconButton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';
import DashboardWidgets from '../../components/dashboard/DashboardWidgets';

const GREEN = '#2AAC26';

const CoordinatorDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [maxSlides, setMaxSlides] = useState(0);

  useEffect(() => {
    if (user) {
    loadDashboardData();
    }
  }, [user]);

  // Calcular el número máximo de slides
  useEffect(() => {
    if (myProjects.length > 0) {
      // Calcular cuántos slides necesitamos (1 proyecto por slide)
      const totalSlides = Math.max(0, myProjects.length - 3);
      setMaxSlides(totalSlides);
      // Resetear el slide actual si es mayor que el máximo
      if (currentSlide > totalSlides) {
        setCurrentSlide(0);
      }
    } else {
      setMaxSlides(0);
      setCurrentSlide(0);
    }
  }, [myProjects]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (myProjects.length <= 3) return;
      
      if (event.key === 'ArrowLeft' && currentSlide > 0) {
        event.preventDefault();
        setCurrentSlide(currentSlide - 1);
      } else if (event.key === 'ArrowRight' && currentSlide < maxSlides) {
        event.preventDefault();
        setCurrentSlide(currentSlide + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, maxSlides, myProjects.length]);

  const loadDashboardData = () => {
    try {
    // Obtener proyectos del coordinador
      const projects = dataService.getProjectsByCoordinator(user.id);
      setMyProjects(projects);

      // Calcular estadísticas
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'En progreso').length;
      
      let totalTasks = 0;
      let completedTasks = 0;
      projects.forEach(project => {
        const tasks = dataService.getTasksByProject(project.id);
        totalTasks += tasks.length;
        completedTasks += tasks.filter(t => t.status === 'Completada').length;
      });

      // Contar participantes únicos
      const allParticipants = new Set();
      projects.forEach(project => {
        const participants = dataService.getProjectParticipants(project.id);
        participants.forEach(p => allParticipants.add(p.id));
      });

      setStats({
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        totalParticipants: allParticipants.size
      });

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
          Bienvenido, {user?.name}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
          Panel de Coordinador - Gestiona tus proyectos de manera eficiente
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
                    Mis Proyectos
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${GREEN}20`, color: GREEN }}>
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
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', fontFamily: 'Poppins, sans-serif' }}>
                    {stats.completedTasks || 0}/{stats.totalTasks || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Tareas Completadas
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f3e5f5', color: '#9c27b0' }}>
                  <AssignmentIcon />
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
                    {stats.totalParticipants || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Colaboradores
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Mis Proyectos
          </Typography>
          
          {myProjects.length > 3 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                aria-label={`Ir al slide anterior. Slide ${currentSlide} de ${maxSlides + 1}`}
                sx={{
                  color: GREEN,
                  '&:disabled': { color: '#ccc' },
                  '&:hover': { bgcolor: 'rgba(42, 172, 38, 0.1)' },
                  '&:focus': { 
                    outline: '2px solid #2AAC26',
                    outlineOffset: '2px'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#666', 
                  fontFamily: 'Poppins, sans-serif',
                  minWidth: '80px',
                  textAlign: 'center'
                }}
                aria-live="polite"
                aria-label={`Slide ${currentSlide + 1} de ${maxSlides + 1}`}
              >
                {currentSlide + 1} de {maxSlides + 1}
              </Typography>
              <IconButton
                onClick={() => setCurrentSlide(Math.min(maxSlides, currentSlide + 1))}
                disabled={currentSlide >= maxSlides}
                aria-label={`Ir al slide siguiente. Slide ${currentSlide} de ${maxSlides + 1}`}
                sx={{
                  color: GREEN,
                  '&:disabled': { color: '#ccc' },
                  '&:hover': { bgcolor: 'rgba(42, 172, 38, 0.1)' },
                  '&:focus': { 
                    outline: '2px solid #2AAC26',
                    outlineOffset: '2px'
                  }
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )}
        </Box>

        {myProjects.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                No tienes proyectos asignados
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
                Contacta al administrador para que te asigne proyectos
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box 
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3
            }}
            role="region"
            aria-label="Carrusel de proyectos"
            aria-live="polite"
          >
            <Box 
              sx={{
                display: 'flex',
                transform: `translateX(-${currentSlide * (100 / 3)}%)`,
                transition: 'transform 0.3s ease-in-out',
                gap: 1.5
              }}
              role="group"
              aria-label={`Proyectos ${currentSlide * 3 + 1} a ${Math.min((currentSlide + 1) * 3, myProjects.length)} de ${myProjects.length}`}
            >
              {myProjects.map((project) => {
                const progress = getProjectProgress(project);
                const participants = getProjectParticipants(project.id);
                const daysRemaining = getDaysRemaining(project.end_date);

                return (
                  <Box
                    key={project.id}
                    sx={{
                      minWidth: 'calc(33.333% - 6px)',
                      flex: '0 0 calc(33.333% - 6px)',
                      maxWidth: 'calc(33.333% - 6px)'
                    }}
                  >
                  <Card 
                    sx={{ 
                      borderRadius: 3, 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                      },
                      '&:focus-within': {
                        outline: '2px solid #2AAC26',
                        outlineOffset: '2px'
                      }
                    }}
                    role="article"
                    aria-label={`Proyecto: ${project.name}`}
                    tabIndex={0}
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
                            onClick={() => onNavigate('project-detail', project)}
                            aria-label={`Ver detalles del proyecto ${project.name}`}
                            sx={{ 
                              color: GREEN,
                              '&:focus': { 
                                outline: '2px solid #2AAC26',
                                outlineOffset: '2px'
                              }
                            }}
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
                          onClick={() => onNavigate('project-detail', project)}
                          aria-label={`Ver detalles completos del proyecto ${project.name}`}
                          sx={{
                            borderColor: GREEN,
                            color: GREEN,
                            textTransform: 'none',
                            fontFamily: 'Poppins, sans-serif',
                            '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' },
                            '&:focus': { 
                              outline: '2px solid #2AAC26',
                              outlineOffset: '2px'
                            }
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
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* Quick Actions */}
      {myProjects.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
              Acciones Rápidas
                  </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: GREEN,
                  textTransform: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': { bgcolor: '#1f9a1f' }
                }}
                onClick={() => {
                  if (myProjects.length > 0) {
                    onNavigate('project-detail', myProjects[0]);
                  }
                }}
              >
                Gestionar Tareas
              </Button>
              <Button
                variant="outlined"
                onClick={() => onNavigate('coordinator-metrics')}
                sx={{
                  borderColor: GREEN,
                  color: GREEN,
                  textTransform: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' }
                }}
              >
                Ver Métricas
              </Button>
                </Box>
            </CardContent>
          </Card>
      )}
      
      {/* Widgets Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
          Métricas de Coordinación
        </Typography>
        <DashboardWidgets customizable={true} />
      </Box>
    </Box>
  );
};

export default CoordinatorDashboard;
