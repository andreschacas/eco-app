import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const CoordinatorProjects = ({ onNavigate }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const statusOptions = ['Planificación', 'En progreso', 'Pausado', 'Completado', 'Cancelado'];

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    filterProjects();
    setCurrentSlide(0); // Reset slide when filters change
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = () => {
    try {
      const coordinatorProjects = dataService.getProjectsByCoordinator(user.id);
      setProjects(coordinatorProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
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

  const handlePreviousSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    const maxSlides = Math.ceil(filteredProjects.length / 3) - 1;
    setCurrentSlide(prev => Math.min(maxSlides, prev + 1));
  };

  const getMaxSlides = () => {
    return Math.max(0, Math.ceil(filteredProjects.length / 3) - 1);
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
            Mis Proyectos
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Gestiona todos tus proyectos asignados
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

      {/* Projects Slider */}
      {filteredProjects.length > 0 && (
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
          {/* Navigation Controls */}
          {filteredProjects.length > 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <IconButton
                onClick={handlePreviousSlide}
                disabled={currentSlide === 0}
                sx={{
                  bgcolor: GREEN,
                  color: 'white',
                  '&:hover': { bgcolor: '#1f9a1f' },
                  '&:disabled': { bgcolor: '#e0e0e0', color: '#999' }
                }}
                aria-label="Proyectos anteriores"
              >
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>
                {currentSlide + 1} de {getMaxSlides() + 1}
              </Typography>
              
              <IconButton
                onClick={handleNextSlide}
                disabled={currentSlide >= getMaxSlides()}
                sx={{
                  bgcolor: GREEN,
                  color: 'white',
                  '&:hover': { bgcolor: '#1f9a1f' },
                  '&:disabled': { bgcolor: '#e0e0e0', color: '#999' }
                }}
                aria-label="Siguientes proyectos"
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          )}
          
          <Box 
            sx={{
              display: 'flex',
              transform: filteredProjects.length > 3 ? `translateX(-${currentSlide * (100 / 3)}%)` : 'none',
              transition: 'transform 0.3s ease-in-out',
              gap: 1.5
            }}
            role="group"
            aria-label={filteredProjects.length > 3 ? `Proyectos ${currentSlide * 3 + 1} a ${Math.min((currentSlide + 1) * 3, filteredProjects.length)} de ${filteredProjects.length}` : `Todos los ${filteredProjects.length} proyectos`}
          >
            {filteredProjects.map((project) => {
              const progress = getProjectProgress(project);
              const participants = getProjectParticipants(project.id);
              const daysRemaining = getDaysRemaining(project.end_date);

              return (
                <Box
                  key={project.id}
                  sx={{
                    minWidth: filteredProjects.length > 3 ? 'calc(33.333% - 6px)' : 'auto',
                    flex: filteredProjects.length > 3 ? '0 0 calc(33.333% - 6px)' : '1',
                    maxWidth: filteredProjects.length > 3 ? 'calc(33.333% - 6px)' : 'none'
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
                        <Box sx={{ flex: 1, mr: 1 }}>
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
                          sx={{ 
                            color: GREEN,
                            '&:focus': { 
                              outline: '2px solid #2AAC26',
                              outlineOffset: '2px'
                            }
                          }}
                          aria-label={`Ver detalles del proyecto ${project.name}`}
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
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {filteredProjects.length === 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              {searchTerm || statusFilter ? 'No se encontraron proyectos' : 'No tienes proyectos asignados'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
              {searchTerm || statusFilter ? 'Intenta ajustar los filtros de búsqueda' : 'Los proyectos aparecerán aquí cuando sean asignados por el administrador'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CoordinatorProjects;
