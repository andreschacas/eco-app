import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import { useAuth } from '../context/auth/AuthContext';
import dataService from '../utils/dataService';

const GREEN = '#2AAC26';

const ReportsView = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadReportData();
    }
  }, [selectedProject]);

  const loadProjects = () => {
    try {
      let availableProjects = [];
      
      switch (user.role) {
        case 'Administrador':
          availableProjects = dataService.getAll('projects');
          break;
        case 'Coordinador':
          availableProjects = dataService.getProjectsByCoordinator(user.id);
          break;
        case 'Participante':
          const userTasks = dataService.getTasksByUser(user.id);
          const projectIds = [...new Set(userTasks.map(t => t.project_id))];
          availableProjects = dataService.getAll('projects').filter(p => projectIds.includes(p.id));
          break;
        default:
          availableProjects = [];
      }
      
      setProjects(availableProjects);
      if (availableProjects.length > 0) {
        setSelectedProject(availableProjects[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      showSnackbar('Error al cargar los proyectos', 'error');
    }
  };

  const loadReportData = () => {
    try {
      setLoading(true);
      
      const project = projects.find(p => p.id === selectedProject);
      if (!project) return;

      const tasks = dataService.getTasksByProject(selectedProject);
      const participants = dataService.getProjectParticipants(selectedProject);
      const metrics = dataService.getMetricsByProject(selectedProject);

      const tasksByStatus = {
        'Pendiente': tasks.filter(t => t.status === 'Pendiente').length,
        'En progreso': tasks.filter(t => t.status === 'En progreso').length,
        'Completada': tasks.filter(t => t.status === 'Completada').length
      };

      const completionRate = tasks.length > 0 ? 
        Math.round((tasksByStatus['Completada'] / tasks.length) * 100) : 0;

      const overdueTasks = tasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completada'
      ).length;

      const avgMetricProgress = metrics.length > 0 ? 
        Math.round(metrics.reduce((acc, m) => acc + (m.current_value / m.target_value * 100), 0) / metrics.length) : 0;

      setReportData({
        project,
        tasks,
        participants,
        metrics,
        stats: {
          totalTasks: tasks.length,
          completedTasks: tasksByStatus['Completada'],
          inProgressTasks: tasksByStatus['En progreso'],
          pendingTasks: tasksByStatus['Pendiente'],
          overdueTasks,
          completionRate,
          totalParticipants: participants.length,
          avgMetricProgress
        }
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      showSnackbar('Error al cargar los datos del reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!reportData) return;

    try {
      const doc = new jsPDF();
      const { project, stats } = reportData;

      // Header
      doc.setFontSize(20);
      doc.text('Reporte de Proyecto', 20, 30);
      
      // Project info
      doc.setFontSize(16);
      doc.text(`Proyecto: ${project.name}`, 20, 50);
      
      doc.setFontSize(12);
      doc.text(`Descripción: ${project.description || 'Sin descripción'}`, 20, 65);
      doc.text(`Estado: ${project.status}`, 20, 75);
      doc.text(`Fecha de inicio: ${new Date(project.start_date).toLocaleDateString('es-ES')}`, 20, 85);
      doc.text(`Fecha de fin: ${new Date(project.end_date).toLocaleDateString('es-ES')}`, 20, 95);

      // Stats
      doc.setFontSize(14);
      doc.text('Estadísticas del Proyecto', 20, 115);
      
      doc.setFontSize(12);
      doc.text(`Total de tareas: ${stats.totalTasks}`, 20, 130);
      doc.text(`Tareas completadas: ${stats.completedTasks}`, 20, 140);
      doc.text(`Tareas en progreso: ${stats.inProgressTasks}`, 20, 150);
      doc.text(`Tareas pendientes: ${stats.pendingTasks}`, 20, 160);
      doc.text(`Tareas vencidas: ${stats.overdueTasks}`, 20, 170);
      doc.text(`Tasa de completación: ${stats.completionRate}%`, 20, 180);
      doc.text(`Total de participantes: ${stats.totalParticipants}`, 20, 190);
      doc.text(`Progreso promedio de métricas: ${stats.avgMetricProgress}%`, 20, 200);

      // Footer
      doc.setFontSize(10);
      doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} por ${user.name}`, 20, 280);

      // Save
      doc.save(`reporte_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      showSnackbar('Reporte PDF generado exitosamente', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showSnackbar('Error al generar el reporte PDF', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          Reportes de Proyecto
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={generatePDF}
            disabled={!reportData || loading}
            sx={{
              bgcolor: GREEN,
              color: '#fff',
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'none',
              '&:hover': { bgcolor: '#1f9a1f' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            Exportar a PDF
          </Button>
        </Box>
      </Box>

      {/* Project Selection */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Seleccionar Proyecto
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Proyecto</InputLabel>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              label="Proyecto"
              disabled={loading}
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

      {/* Loading or Report Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress sx={{ color: GREEN }} />
          <Typography variant="body1" sx={{ ml: 2, fontFamily: 'Poppins, sans-serif' }}>
            Cargando datos del reporte...
          </Typography>
                  </Box>
      ) : reportData ? (
        <>
          {/* Project Info */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
                Información del Proyecto
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Nombre:</strong> {reportData.project.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Estado:</strong> 
                  <Chip
                      label={reportData.project.status} 
                    size="small"
                      sx={{ ml: 1, bgcolor: GREEN + '20', color: GREEN }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Descripción:</strong> {reportData.project.description || 'Sin descripción'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Fecha de inicio:</strong> {new Date(reportData.project.start_date).toLocaleDateString('es-ES')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Fecha de fin:</strong> {new Date(reportData.project.end_date).toLocaleDateString('es-ES')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                        {reportData.stats.totalTasks}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        Total de Tareas
                </Typography>
                    </Box>
                    <AssignmentIcon sx={{ color: GREEN, fontSize: 40 }} />
                  </Box>
              </CardContent>
            </Card>
      </Grid>

            <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', fontFamily: 'Poppins, sans-serif' }}>
                        {reportData.stats.completedTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        Tareas Completadas
                    </Typography>
                  </Box>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 40 }} />
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
                        {reportData.stats.totalParticipants}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        Participantes
                  </Typography>
                </Box>
                    <PeopleIcon sx={{ color: '#2196f3', fontSize: 40 }} />
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
                        {reportData.stats.completionRate}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        Tasa de Completación
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ color: '#ff9800', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tasks Overview */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
                    Resumen de Tareas
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        Completadas ({reportData.stats.completedTasks})
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        {reportData.stats.completionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                      value={reportData.stats.completionRate}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                      bgcolor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                          bgcolor: '#4caf50',
                          borderRadius: 4
                      }
                    }}
                  />
                </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800', fontFamily: 'Poppins, sans-serif' }}>
                          {reportData.stats.pendingTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          Pendientes
                    </Typography>
                  </Box>
                </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
                          {reportData.stats.inProgressTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          En Progreso
                    </Typography>
                  </Box>
                </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336', fontFamily: 'Poppins, sans-serif' }}>
                          {reportData.stats.overdueTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          Vencidas
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
                    Métricas del Proyecto
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                      {reportData.stats.avgMetricProgress}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      Progreso Promedio
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                      <strong>Total de métricas:</strong> {reportData.metrics.length}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                      <strong>En meta:</strong> {reportData.metrics.filter(m => (m.current_value / m.target_value * 100) >= 80).length}
                    </Typography>
                  </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" sx={{ color: '#666', mb: 1, fontFamily: 'Poppins, sans-serif' }}>
            Selecciona un proyecto para generar el reporte
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
            {projects.length === 0 ? 'No tienes proyectos disponibles' : 'Usa el selector arriba para elegir un proyecto'}
          </Typography>
        </Box>
      )}

      {/* Snackbar */}
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

export default ReportsView; 