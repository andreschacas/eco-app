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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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

      {/* Metrics Grid */}
      <Grid container spacing={3}>
        {metrics.map((metric) => {
          const progress = getMetricProgress(metric);
          const color = getMetricColor(metric.category);

          return (
            <Grid item xs={12} sm={6} md={4} key={metric.id}>
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
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: color,
                          fontFamily: 'Poppins, sans-serif',
                          mb: 0.5
                        }}
                      >
                        {metric.current_value || 0}
                        <Typography 
                          component="span" 
                          variant="body2" 
                          sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', ml: 1 }}
                        >
                          {metric.unit}
                        </Typography>
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                        {metric.name}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateMetric(metric)}
                      sx={{ color: color }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>

                  {/* Category */}
                  <Box sx={{ 
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: `${color}20`,
                    color: color,
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    mb: 2
                  }}>
                    {metric.category}
                  </Box>

                  {/* Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                        Progreso
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', color: color }}>
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
                          bgcolor: color,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>

                  {/* Target */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      Meta: {metric.target_value} {metric.unit}
                    </Typography>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#666' }} />
                  </Box>

                  {/* Update button */}
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleUpdateMetric(metric)}
                    sx={{
                      borderColor: color,
                      color: color,
                      textTransform: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      '&:hover': { 
                        borderColor: color, 
                        bgcolor: `${color}10` 
                      }
                    }}
                  >
                    Actualizar Valor
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Actualizar Métrica: {editingMetric?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              Valor actual: <strong>{editingMetric?.current_value || 0} {editingMetric?.unit}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              Meta: <strong>{editingMetric?.target_value} {editingMetric?.unit}</strong>
            </Typography>
            <TextField
              fullWidth
              label={`Nuevo valor (${editingMetric?.unit})`}
              type="number"
              value={metricForm.value}
              onChange={(e) => setMetricForm({ ...metricForm, value: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Notas (opcional)"
              multiline
              rows={3}
              value={metricForm.notes}
              onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
              placeholder="Agregar observaciones sobre esta actualización..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveMetric} 
            variant="contained" 
            sx={{ 
              bgcolor: GREEN,
              '&:hover': { bgcolor: '#1f9a1f' }
            }}
          >
            Actualizar
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
