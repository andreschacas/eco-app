import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import NatureIcon from '@mui/icons-material/Nature';
import WaterIcon from '@mui/icons-material/Water';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RecyclingIcon from '@mui/icons-material/Recycling';
import ParkIcon from '@mui/icons-material/Park';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SpeedIcon from '@mui/icons-material/Speed';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const CoordinatorMetrics = ({ onNavigate }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [metricForm, setMetricForm] = useState({
    value: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadMetrics();
    } else {
      setMetrics([]);
    }
  }, [selectedProject]);

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

  const loadMetrics = () => {
    try {
      const projectMetrics = dataService.getProjectMetrics(selectedProject);
      
      // Si no hay métricas, crear algunas por defecto
      if (projectMetrics.length === 0) {
        createDefaultMetrics();
      } else {
        setMetrics(projectMetrics);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      showSnackbar('Error al cargar las métricas', 'error');
    }
  };

  const createDefaultMetrics = () => {
    const metricTypes = dataService.getAll('metricTypes') || dataService.getAll('metric_types') || [];
    
    if (metricTypes.length === 0) {
      // Crear tipos de métricas por defecto si no existen
      const defaultMetricTypes = [
        { id: 1, name: 'Emisiones CO2', unit: 'toneladas', category: 'Carbono' },
        { id: 2, name: 'Consumo Energético', unit: 'kWh', category: 'Energía' },
        { id: 3, name: 'Consumo de Agua', unit: 'litros', category: 'Agua' },
        { id: 4, name: 'Residuos Generados', unit: 'kg', category: 'Residuos' },
        { id: 5, name: 'Área Verde', unit: 'm²', category: 'Biodiversidad' }
      ];
      
      defaultMetricTypes.forEach(metricType => {
        dataService.create('metric_types', metricType);
      });
    }

    // Crear métricas para el proyecto
    const updatedMetricTypes = dataService.getAll('metric_types');
    const projectMetrics = updatedMetricTypes.map(metricType => ({
      project_id: parseInt(selectedProject),
      metric_type_id: metricType.id,
      name: metricType.name,
      unit: metricType.unit,
      category: metricType.category,
      current_value: 0,
      target_value: Math.floor(Math.random() * 1000) + 100, // Valor objetivo aleatorio
      created_at: new Date().toISOString()
    }));

    projectMetrics.forEach(metric => {
      dataService.create('metrics', metric);
    });

    setMetrics(projectMetrics);
  };

  const getMetricProgress = (metric) => {
    if (!metric.target_value || metric.target_value === 0) return 0;
    return Math.min(100, Math.round((metric.current_value / metric.target_value) * 100));
  };

  const getMetricColor = (category) => {
    switch (category) {
      case 'Carbono': return '#f44336';
      case 'Energía': return '#ff9800';
      case 'Agua': return '#2196f3';
      case 'Residuos': return '#9c27b0';
      case 'Biodiversidad': return '#4caf50';
      default: return GREEN;
    }
  };

  const getMetricIcon = (category) => {
    switch (category) {
      case 'Carbono': return <NatureIcon />;
      case 'Energía': return <FlashOnIcon />;
      case 'Agua': return <WaterIcon />;
      case 'Residuos': return <RecyclingIcon />;
      case 'Biodiversidad': return <ParkIcon />;
      default: return <AssessmentIcon />;
    }
  };

  const getTrendIcon = (progress) => {
    if (progress > 80) return <TrendingUpIcon sx={{ color: '#4caf50' }} />;
    if (progress > 50) return <TrendingFlatIcon sx={{ color: '#ff9800' }} />;
    return <TrendingDownIcon sx={{ color: '#f44336' }} />;
  };

  const getTrendText = (progress) => {
    if (progress > 80) return 'Excelente';
    if (progress > 50) return 'Bueno';
    return 'Necesita atención';
  };

  const getTrendColor = (progress) => {
    if (progress > 80) return '#4caf50';
    if (progress > 50) return '#ff9800';
    return '#f44336';
  };

  const CircularProgress = ({ progress, size = 80, strokeWidth = 8, color = GREEN }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e0e0e0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: color, fontFamily: 'Poppins, sans-serif' }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      </Box>
    );
  };

  const MetricCard = ({ metric, onUpdate }) => {
    const progress = getMetricProgress(metric);
    const color = getMetricColor(metric.category);
    const icon = getMetricIcon(metric.category);
    const trendIcon = getTrendIcon(progress);
    const trendText = getTrendText(progress);
    const trendColor = getTrendColor(progress);

    return (
      <Card 
        sx={{ 
          borderRadius: 3, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header con icono y tendencia */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48 }}>
              {icon}
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                {trendIcon}
                <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  {trendText}
                </Typography>
              </Box>
              <Chip 
                label={metric.category} 
                size="small" 
                sx={{ 
                  bgcolor: `${color}20`, 
                  color: color, 
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif'
                }} 
              />
            </Box>
          </Box>

          {/* Título de la métrica */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            {metric.name}
          </Typography>

          {/* Valor actual y objetivo */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: color, fontFamily: 'Poppins, sans-serif' }}>
                {metric.current_value || 0}
                <Typography component="span" variant="body2" sx={{ color: '#666', ml: 1, fontFamily: 'Poppins, sans-serif' }}>
                  {metric.unit}
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                de {metric.target_value} {metric.unit}
              </Typography>
            </Box>
            <CircularProgress progress={progress} color={color} size={80} />
          </Box>

          {/* Barra de progreso lineal */}
          <Box sx={{ mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 4
                }
              }}
            />
          </Box>

          {/* Información adicional */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon sx={{ fontSize: 16, color: '#666' }} />
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                {progress > 100 ? 'Meta superada' : `${100 - progress}% restante`}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: color, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
              {progress}% completado
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Botón de actualización */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<EditIcon />}
            onClick={() => onUpdate(metric)}
            sx={{
              borderColor: color,
              color: color,
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              py: 1.5,
              '&:hover': { 
                borderColor: color, 
                bgcolor: `${color}10`,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Actualizar Métrica
          </Button>
        </CardContent>
      </Card>
    );
  };

  const handleUpdateMetric = (metric) => {
    setEditingMetric(metric);
    setMetricForm({
      value: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleSaveMetric = () => {
    try {
      if (!metricForm.value || isNaN(parseFloat(metricForm.value))) {
        showSnackbar('Por favor ingrese un valor numérico válido', 'error');
        return;
      }

      const newValue = parseFloat(metricForm.value);
      
      // Actualizar métrica
      dataService.update('metrics', editingMetric.id, { 
        current_value: newValue,
        updated_at: new Date().toISOString()
      });

      // Guardar en historial
      dataService.updateMetricValue(editingMetric.id, newValue);

      showSnackbar('Métrica actualizada exitosamente', 'success');
      loadMetrics();
      setOpenDialog(false);
    } catch (error) {
      showSnackbar('Error al actualizar la métrica', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    return project ? project.name : 'Proyecto Desconocido';
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
            Métricas de Proyectos
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Monitorea y actualiza las métricas de tus proyectos
          </Typography>
        </Box>
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
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              Métricas de seguimiento ambiental y sostenibilidad
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Dashboard de Resumen */}
      {metrics.length > 0 && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
              📊 Resumen de Métricas Ambientales
                        </Typography>
            
            <Grid container spacing={3}>
              {/* Progreso General */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <CircularProgress 
                    progress={metrics.reduce((acc, metric) => acc + getMetricProgress(metric), 0) / metrics.length} 
                    size={100} 
                    color={GREEN}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, fontFamily: 'Poppins, sans-serif' }}>
                    Progreso General
                      </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    {Math.round(metrics.reduce((acc, metric) => acc + getMetricProgress(metric), 0) / metrics.length)}% promedio
                      </Typography>
                    </Box>
              </Grid>

              {/* Métricas por Categoría */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
                  Progreso por Categoría
                </Typography>
                <Stack spacing={2}>
                  {['Carbono', 'Energía', 'Agua', 'Residuos', 'Biodiversidad'].map(category => {
                    const categoryMetrics = metrics.filter(m => m.category === category);
                    if (categoryMetrics.length === 0) return null;
                    
                    const avgProgress = categoryMetrics.reduce((acc, metric) => acc + getMetricProgress(metric), 0) / categoryMetrics.length;
                    const color = getMetricColor(category);
                    const icon = getMetricIcon(category);
                    
                    return (
                      <Box key={category} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 32, height: 32 }}>
                          {icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>
                            {category}
                      </Typography>
                    <LinearProgress
                      variant="determinate"
                            value={avgProgress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>
                        <Typography variant="body2" sx={{ color: color, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                          {Math.round(avgProgress)}%
                    </Typography>
                  </Box>
                    );
                  })}
                </Stack>
              </Grid>
            </Grid>
                </CardContent>
              </Card>
      )}

      {/* Métricas Individuales */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
        🎯 Métricas Detalladas
      </Typography>
      
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} lg={4} key={metric.id}>
            <MetricCard metric={metric} onUpdate={handleUpdateMetric} />
            </Grid>
        ))}
      </Grid>

      {metrics.length === 0 && selectedProject && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No hay métricas configuradas
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
              Las métricas se crearán automáticamente para este proyecto
            </Typography>
            <Button
              variant="contained"
              onClick={createDefaultMetrics}
              sx={{
                mt: 2,
                bgcolor: GREEN,
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': { bgcolor: '#1f9a1f' }
              }}
            >
              Crear Métricas
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
              Las métricas aparecerán aquí cuando tengas proyectos asignados
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Update Metric Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {editingMetric && (
              <Avatar sx={{ 
                bgcolor: `${getMetricColor(editingMetric.category)}20`, 
                color: getMetricColor(editingMetric.category),
                width: 40,
                height: 40
              }}>
                {getMetricIcon(editingMetric.category)}
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                fontFamily: 'Poppins, sans-serif',
                color: '#333',
                fontSize: '1.25rem'
              }}>
                Actualizar Métrica
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#666', 
                fontFamily: 'Poppins, sans-serif' 
              }}>
                {editingMetric?.name}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              minWidth: 'auto',
              p: 1,
              color: '#666',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            ✕
          </Button>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Grid container spacing={3}>
            {/* Información Actual */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: '#f8f9fa', 
                borderRadius: 2, 
                p: 2,
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  fontFamily: 'Poppins, sans-serif',
                  color: '#333'
                }}>
                  📊 Estado Actual
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Valor actual:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    color: getMetricColor(editingMetric?.category),
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {editingMetric?.current_value || 0} {editingMetric?.unit}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Meta:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {editingMetric?.target_value} {editingMetric?.unit}
            </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Progreso:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    color: getMetricColor(editingMetric?.category),
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {editingMetric ? getMetricProgress(editingMetric) : 0}%
            </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={editingMetric ? getMetricProgress(editingMetric) : 0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getMetricColor(editingMetric?.category),
                      borderRadius: 3
                    }
                  }}
                />
              </Card>
            </Grid>

            {/* Formulario de Actualización */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label={`Nuevo valor (${editingMetric?.unit})`}
              type="number"
              value={metricForm.value}
              onChange={(e) => setMetricForm({ ...metricForm, value: e.target.value })}
              required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mr: 1,
                        color: getMetricColor(editingMetric?.category)
                      }}>
                        {editingMetric && getMetricIcon(editingMetric.category)}
                      </Box>
                    )
                  }}
                />

            <TextField
              fullWidth
              label="Notas (opcional)"
              multiline
              rows={3}
              value={metricForm.notes}
              onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
              placeholder="Agregar observaciones sobre esta actualización..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />

                {/* Vista previa del nuevo progreso */}
                {metricForm.value && !isNaN(parseFloat(metricForm.value)) && editingMetric && (
                  <Card sx={{ 
                    bgcolor: '#e8f5e8', 
                    borderRadius: 2, 
                    p: 2,
                    border: '1px solid #4caf50'
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600, 
                      mb: 1, 
                      fontFamily: 'Poppins, sans-serif',
                      color: '#2e7d32'
                    }}>
                      🔮 Vista Previa
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#2e7d32', 
                      fontFamily: 'Poppins, sans-serif',
                      mb: 1
                    }}>
                      Nuevo progreso: {Math.min(100, Math.round((parseFloat(metricForm.value) / editingMetric.target_value) * 100))}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, Math.round((parseFloat(metricForm.value) / editingMetric.target_value) * 100))}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: '#c8e6c9',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#4caf50',
                          borderRadius: 2
                        }
                      }}
                    />
                  </Card>
                )}
          </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              px: 3,
              py: 1
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveMetric} 
            variant="contained" 
            startIcon={<EditIcon />}
            sx={{ 
              bgcolor: getMetricColor(editingMetric?.category) || GREEN,
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': { 
                bgcolor: getMetricColor(editingMetric?.category) || GREEN,
                filter: 'brightness(0.9)'
              }
            }}
          >
            Actualizar Métrica
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

export default CoordinatorMetrics;
