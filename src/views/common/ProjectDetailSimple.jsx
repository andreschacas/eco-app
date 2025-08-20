import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import cacheService from '../../utils/cacheService';
import FileUpload from '../../components/common/FileUpload';

// Registrar Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const GREEN = '#2AAC26';

const ProjectDetailSimple = ({ project, onBack, onNavigate }) => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [projectData, setProjectData] = useState(project);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Pendiente',
    priority: 'Media',
    assigned_users: []
  });

  const tabLabels = ['Información General', 'Timeline', 'Métricas', 'Tareas', 'Participantes', 'Archivos'];

  useEffect(() => {
    if (project) {
      loadProjectData();
    }
  }, [project]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [
        projectTasks,
        projectMetrics,
        projectParticipants,
        storedFiles
      ] = await Promise.all([
        cacheService.getTasks(project.id),
        cacheService.getMetrics(project.id),
        Promise.resolve(dataService.getProjectParticipants(project.id)),
        Promise.resolve(JSON.parse(localStorage.getItem(`files_project_${project.id}`) || '[]'))
      ]);

      setTasks(projectTasks);
      setMetrics(projectMetrics);
      setParticipants(projectParticipants);
      setProjectFiles(storedFiles);

    } catch (error) {
      console.error('Error loading project data:', error);
      showSnackbar('Error al cargar los datos del proyecto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = () => {
    try {
      const allUsers = dataService.getAll('users').filter(u => u.active);
      const participantIds = participants.map(p => p.id);
      const available = allUsers.filter(u => !participantIds.includes(u.id));
      setAvailableUsers(available);
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const handleAddParticipants = () => {
    try {
      selectedUsers.forEach(userId => {
        dataService.addParticipantToProject(project.id, userId);
      });
      
      showSnackbar(`${selectedUsers.length} participante(s) agregado(s) exitosamente`, 'success');
      setParticipantDialogOpen(false);
      setSelectedUsers([]);
      loadProjectData(); // Recargar datos
    } catch (error) {
      console.error('Error adding participants:', error);
      showSnackbar('Error al agregar participantes', 'error');
    }
  };

  const handleOpenParticipantDialog = () => {
    loadAvailableUsers();
    setParticipantDialogOpen(true);
  };

  const canEditTask = (task) => {
    if (user.role === 'Administrador') return true;
    if (user.role === 'Coordinador' && project.creator_id === user.id) return true;
    return false;
  };

  const canEditProject = () => {
    if (user.role === 'Administrador') return true;
    if (user.role === 'Coordinador' && project.creator_id === user.id) return true;
    return false;
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pendiente',
      priority: 'Media',
      assigned_users: []
    });
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '',
      end_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      status: task.status,
      priority: task.priority || 'Media',
      assigned_users: task.assigned_users || []
    });
    setTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    try {
      if (!taskForm.title || !taskForm.description) {
        showSnackbar('Por favor complete los campos obligatorios', 'error');
        return;
      }

      const taskData = {
        ...taskForm,
        project_id: project.id,
        start_date: taskForm.start_date,
        due_date: taskForm.end_date
      };

      if (editingTask) {
        dataService.update('tasks', editingTask.id, taskData);
        showSnackbar('Tarea actualizada exitosamente', 'success');
      } else {
        const newTask = dataService.create('tasks', taskData);
        // Asignar usuarios a la tarea
        if (taskForm.assigned_users.length > 0) {
          taskForm.assigned_users.forEach(userId => {
            dataService.assignTaskToUser(newTask.id, userId);
          });
        }
        showSnackbar('Tarea creada exitosamente', 'success');
      }

      setTaskDialogOpen(false);
      loadProjectData();
    } catch (error) {
      showSnackbar('Error al guardar la tarea', 'error');
    }
  };

  const handleProjectSave = () => {
    try {
      dataService.update('projects', project.id, projectData);
      setEditMode(false);
      showSnackbar('Proyecto actualizado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al actualizar el proyecto', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getProjectProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status === 'Completada').length;
    return Math.round((completedTasks / tasks.length) * 100);
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

  const getDaysRemaining = () => {
    if (!project.end_date) return null;
    const today = new Date();
    const endDate = new Date(project.end_date);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Gráficos para métricas
  const getMetricsChartData = () => {
    if (!metrics.length) return null;

    return {
      labels: metrics.map(m => m.name),
      datasets: [{
        label: 'Valor Actual',
        data: metrics.map(m => m.current_value || 0),
        backgroundColor: GREEN + '80',
        borderColor: GREEN,
        borderWidth: 2
      }, {
        label: 'Meta',
        data: metrics.map(m => m.target_value || 0),
        backgroundColor: '#ff980080',
        borderColor: '#ff9800',
        borderWidth: 2
      }]
    };
  };

  const getTaskDistributionData = () => {
    const statusCount = {};
    tasks.forEach(task => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1;
    });

    return {
      labels: Object.keys(statusCount),
      datasets: [{
        data: Object.values(statusCount),
        backgroundColor: [GREEN, '#ff9800', '#f44336'],
        borderWidth: 0
      }]
    };
  };

  const getTaskColor = (priority) => {
    switch (priority) {
      case 'Crítica': return '#f44336';
      case 'Alta': return '#ff9800';
      case 'Media': return '#2196f3';
      case 'Baja': return '#4caf50';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Cargando proyecto...
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
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
              {projectData.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={projectData.status}
                sx={{
                  bgcolor: `${getStatusColor(projectData.status)}20`,
                  color: getStatusColor(projectData.status),
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                {tasks.length} tareas • {participants.length} participantes
              </Typography>
              {getDaysRemaining() !== null && (
                <Typography variant="body2" sx={{ color: getDaysRemaining() < 0 ? '#f44336' : '#666' }}>
                  {getDaysRemaining() > 0 
                    ? `${getDaysRemaining()} días restantes`
                    : getDaysRemaining() === 0
                      ? 'Termina hoy'
                      : `Vencido hace ${Math.abs(getDaysRemaining())} días`
                  }
                </Typography>
              )}
            </Box>
          </Box>
          {canEditProject() && (
            <Button
              startIcon={editMode ? <SaveIcon /> : <EditIcon />}
              onClick={editMode ? handleProjectSave : () => setEditMode(true)}
              variant={editMode ? "contained" : "outlined"}
              sx={{
                borderColor: GREEN,
                color: editMode ? '#fff' : GREEN,
                bgcolor: editMode ? GREEN : 'transparent',
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': { 
                  borderColor: '#1f9a1f', 
                  bgcolor: editMode ? '#1f9a1f' : '#e8f5e9' 
                }
              }}
            >
              {editMode ? 'Guardar' : 'Editar'}
            </Button>
          )}
        </Box>

        {/* Progreso general */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Progreso General
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                {getProjectProgress()}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProjectProgress()}
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
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500
              },
              '& .Mui-selected': {
                color: `${GREEN} !important`
              },
              '& .MuiTabs-indicator': {
                backgroundColor: GREEN
              }
            }}
          >
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentTab === 0 && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                        Descripción del Proyecto
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={projectData.description}
                          onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ fontFamily: 'Poppins, sans-serif', lineHeight: 1.7 }}>
                          {projectData.description}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Fechas
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Inicio: {new Date(projectData.start_date).toLocaleDateString('es-ES')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Fin: {new Date(projectData.end_date).toLocaleDateString('es-ES')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Equipo
                          </Typography>
                          <AvatarGroup max={6}>
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
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {currentTab === 1 && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 3 }}>
                    Timeline del Proyecto
                  </Typography>
                  
                  {tasks.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {tasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card sx={{ 
                            border: '1px solid #e0e0e0',
                            borderLeft: `4px solid ${getTaskColor(task.priority)}`,
                            '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                          }}>
                            <CardContent sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    {task.title}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                    {task.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip
                                      label={task.status}
                                      size="small"
                                      sx={{
                                        bgcolor: `${getTaskColor(task.priority)}20`,
                                        color: getTaskColor(task.priority),
                                        fontSize: '10px'
                                      }}
                                    />
                                    {task.due_date && (
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Vence: {new Date(task.due_date).toLocaleDateString('es-ES')}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                {canEditTask(task) && (
                                  <IconButton size="small" onClick={() => handleEditTask(task)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <TimelineIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                        No hay tareas para mostrar
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Agrega tareas al proyecto para ver el timeline
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {currentTab === 2 && (
              <Grid container spacing={3}>
                {metrics.length > 0 ? (
                  <>
                    <Grid item xs={12} md={8}>
                      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                            Progreso de Métricas
                          </Typography>
                          <Box sx={{ height: 300 }}>
                            <Bar data={getMetricsChartData()} options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: 'top' }
                              }
                            }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                            Distribución de Tareas
                          </Typography>
                          <Box sx={{ height: 250 }}>
                            <Doughnut data={getTaskDistributionData()} options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: 'bottom' }
                              }
                            }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <BarChartIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                          No hay métricas configuradas
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Las métricas aparecerán aquí cuando se configuren para el proyecto
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}

            {currentTab === 3 && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Gestión de Tareas
                    </Typography>
                    {canEditProject() && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddTask}
                        variant="contained"
                        sx={{
                          bgcolor: GREEN,
                          textTransform: 'none',
                          fontFamily: 'Poppins, sans-serif',
                          '&:hover': { bgcolor: '#1f9a1f' }
                        }}
                      >
                        Nueva Tarea
                      </Button>
                    )}
                  </Box>

                  {tasks.length > 0 ? (
                    <Grid container spacing={2}>
                      {tasks.map((task) => (
                        <Grid item xs={12} sm={6} md={4} key={task.id}>
                          <Card 
                            sx={{ 
                              borderRadius: 2,
                              border: '1px solid #e0e0e0',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            <CardContent sx={{ pb: '16px !important' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                                  {task.title}
                                </Typography>
                                {canEditTask(task) && (
                                  <IconButton size="small" onClick={() => handleEditTask(task)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                              
                              <Chip
                                label={task.status}
                                size="small"
                                sx={{
                                  bgcolor: `${getTaskColor(task.priority)}20`,
                                  color: getTaskColor(task.priority),
                                  fontFamily: 'Poppins, sans-serif',
                                  fontSize: '10px',
                                  mb: 1
                                }}
                              />
                              
                              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                                {task.description?.length > 60 ? `${task.description.substring(0, 60)}...` : task.description}
                              </Typography>
                              
                              {task.due_date && (
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                  Vence: {new Date(task.due_date).toLocaleDateString('es-ES')}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                        No hay tareas en este proyecto
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                        Agrega la primera tarea para comenzar
                      </Typography>
                      {canEditProject() && (
                        <Button
                          startIcon={<AddIcon />}
                          onClick={handleAddTask}
                          variant="contained"
                          sx={{
                            bgcolor: GREEN,
                            textTransform: 'none',
                            fontFamily: 'Poppins, sans-serif',
                            '&:hover': { bgcolor: '#1f9a1f' }
                          }}
                        >
                          Crear Primera Tarea
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {currentTab === 4 && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Participantes del Proyecto ({participants.length})
                    </Typography>
                    {user.role === 'Administrador' && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleOpenParticipantDialog}
                        variant="contained"
                        sx={{
                          bgcolor: GREEN,
                          textTransform: 'none',
                          fontFamily: 'Poppins, sans-serif',
                          '&:hover': { bgcolor: '#1f9a1f' }
                        }}
                      >
                        Agregar Participante
                      </Button>
                    )}
                  </Box>
                  
                  {participants.length > 0 ? (
                    <Grid container spacing={2}>
                      {participants.map((participant) => (
                        <Grid item xs={12} sm={6} md={4} key={participant.id}>
                          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Avatar 
                                src={participant.avatar} 
                                alt={participant.name}
                                sx={{ width: 60, height: 60, mx: 'auto', mb: 2 }}
                              />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                                {participant.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {participant.email}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <PeopleIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                        No hay participantes asignados
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Los participantes aparecerán aquí cuando sean agregados al proyecto
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {currentTab === 5 && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                    Archivos del Proyecto
                  </Typography>
                  <FileUpload
                    files={projectFiles}
                    onFilesChange={setProjectFiles}
                    entityType="project"
                    entityId={project.id}
                    maxFiles={20}
                    acceptedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx']}
                    showGallery={true}
                  />
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Task Dialog */}
        <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título de la tarea"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Fecha de inicio"
                  type="date"
                  value={taskForm.start_date}
                  onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Fecha de vencimiento"
                  type="date"
                  value={taskForm.end_date}
                  onChange={(e) => setTaskForm({ ...taskForm, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    label="Estado"
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="En progreso">En progreso</MenuItem>
                    <MenuItem value="Completada">Completada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    label="Prioridad"
                  >
                    <MenuItem value="Baja">Baja</MenuItem>
                    <MenuItem value="Media">Media</MenuItem>
                    <MenuItem value="Alta">Alta</MenuItem>
                    <MenuItem value="Crítica">Crítica</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTaskDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveTask} 
              variant="contained" 
              sx={{ 
                bgcolor: GREEN,
                '&:hover': { bgcolor: '#1f9a1f' }
              }}
            >
              {editingTask ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Participant Dialog */}
        <Dialog open={participantDialogOpen} onClose={() => setParticipantDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            Agregar Participantes al Proyecto
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              Selecciona los usuarios que quieres agregar a este proyecto:
            </Typography>
            
            {availableUsers.length > 0 ? (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {availableUsers.map((user) => (
                  <Box 
                    key={user.id}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 1, 
                      '&:hover': { bgcolor: '#f5f5f5' },
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          sx={{ color: GREEN, '&.Mui-checked': { color: GREEN } }}
                        />
                      }
                      label=""
                      sx={{ mr: 2 }}
                    />
                    <Avatar src={user.avatar} alt={user.name} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 4 }}>
                No hay usuarios disponibles para agregar a este proyecto.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setParticipantDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddParticipants} 
              variant="contained" 
              disabled={selectedUsers.length === 0}
              sx={{ 
                bgcolor: GREEN,
                '&:hover': { bgcolor: '#1f9a1f' }
              }}
            >
              Agregar {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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
    </motion.div>
  );
};

export default ProjectDetailSimple;
