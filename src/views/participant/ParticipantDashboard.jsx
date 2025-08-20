import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';
import DashboardWidgets from '../../components/dashboard/DashboardWidgets';

const GREEN = '#2AAC26';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({});
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  const taskStatuses = ['Pendiente', 'En progreso', 'Completada'];

  useEffect(() => {
    if (user) {
      loadUserTasks();
    }
  }, [user]);

  useEffect(() => {
    filterTasks();
  }, [myTasks, statusFilter]);

  const loadUserTasks = () => {
    try {
      // Obtener tareas asignadas al usuario
      const userTasks = dataService.getTasksByUser(user.id);
      setMyTasks(userTasks);

      // Calcular estadísticas
      const totalTasks = userTasks.length;
      const pendingTasks = userTasks.filter(t => t.status === 'Pendiente').length;
      const inProgressTasks = userTasks.filter(t => t.status === 'En progreso').length;
      const completedTasks = userTasks.filter(t => t.status === 'Completada').length;

      // Tareas vencidas
      const overdueTasks = userTasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        const today = new Date();
        return dueDate < today && task.status !== 'Completada';
      }).length;

      setStats({
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks
      });

    } catch (error) {
      showSnackbar('Error al cargar las tareas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (!statusFilter) {
      setFilteredTasks(myTasks);
    } else {
      setFilteredTasks(myTasks.filter(task => task.status === statusFilter));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada': return '#4caf50';
      case 'En progreso': return '#2196f3';
      case 'Pendiente': return '#ff9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completada': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'En progreso': return <PlayArrowIcon sx={{ color: '#2196f3' }} />;
      case 'Pendiente': return <PendingIcon sx={{ color: '#ff9800' }} />;
      default: return <AssignmentIcon sx={{ color: '#757575' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return '#f44336';
      case 'Alta': return '#ff9800';
      case 'Media': return '#2196f3';
      case 'Baja': return '#4caf50';
      default: return '#757575';
    }
  };

  const isTaskOverdue = (task) => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    return dueDate < today && task.status !== 'Completada';
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProjectName = (projectId) => {
    const project = dataService.getById('projects', projectId);
    return project ? project.name : 'Proyecto Desconocido';
  };

  const handleOpenTaskDialog = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setOpenTaskDialog(true);
  };

  const handleUpdateTaskStatus = () => {
    try {
      if (!selectedTask || !newStatus) {
        showSnackbar('Error al actualizar la tarea', 'error');
        return;
      }

      dataService.update('tasks', selectedTask.id, { status: newStatus });
      showSnackbar('Estado de la tarea actualizado exitosamente', 'success');
      loadUserTasks();
      setOpenTaskDialog(false);
    } catch (error) {
      showSnackbar('Error al actualizar la tarea', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
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
          Panel de Participante - Gestiona tus tareas asignadas
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
                    {stats.totalTasks || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Total Tareas
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${GREEN}20`, color: GREEN }}>
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
                    {stats.pendingTasks || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Pendientes
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}>
                  <PendingIcon />
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
                    {stats.inProgressTasks || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    En Progreso
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#2196f3' }}>
                  <PlayArrowIcon />
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
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', fontFamily: 'Poppins, sans-serif' }}>
                    {stats.completedTasks || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Completadas
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#e8f5e9', color: '#4caf50' }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Tasks */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
              Mis Tareas Asignadas
            </Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filtrar por estado"
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                {taskStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {stats.overdueTasks > 0 && (
            <Alert severity="warning" sx={{ mb: 3, fontFamily: 'Poppins, sans-serif' }}>
              Tienes {stats.overdueTasks} tarea{stats.overdueTasks > 1 ? 's' : ''} vencida{stats.overdueTasks > 1 ? 's' : ''}
            </Alert>
          )}

          <List>
            {filteredTasks.map((task) => {
              const isOverdue = isTaskOverdue(task);
              const daysRemaining = getDaysRemaining(task.due_date);

              return (
                <ListItem 
                  key={task.id}
                  sx={{
                    border: `1px solid ${isOverdue ? '#f44336' : '#e0e0e0'}`,
                    borderRadius: 2,
                    mb: 2,
                    bgcolor: isOverdue ? '#ffebee' : 'white',
                    '&:hover': { bgcolor: isOverdue ? '#ffcdd2' : '#f8f9fa' },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleOpenTaskDialog(task)}
                >
                  <Box sx={{ mr: 2 }}>
                    {getStatusIcon(task.status)}
                  </Box>
                  <ListItemText
                    primary={
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Typography 
                          component="span"
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            fontFamily: 'Poppins, sans-serif',
                            color: isOverdue ? '#d32f2f' : 'inherit'
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(task.status)}20`,
                            color: getStatusColor(task.status),
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        />
                        {task.priority && (
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              bgcolor: `${getPriorityColor(task.priority)}20`,
                              color: getPriorityColor(task.priority),
                              fontFamily: 'Poppins, sans-serif'
                            }}
                          />
                        )}
                        {isOverdue && (
                          <Chip
                            label="VENCIDA"
                            size="small"
                            sx={{
                              bgcolor: '#f4433620',
                              color: '#f44336',
                              fontFamily: 'Poppins, sans-serif',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </span>
                    }
                    secondary={
                      <span>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666', 
                            fontFamily: 'Poppins, sans-serif',
                            mb: 1
                          }}
                        >
                          {task.description}
                        </Typography>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                          <Typography 
                            component="span"
                            variant="caption" 
                            sx={{ 
                              color: '#999', 
                              fontFamily: 'Poppins, sans-serif',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <strong>Proyecto:</strong> {getProjectName(task.project_id)}
                          </Typography>
                          {task.due_date && (
                            <Typography 
                              component="span"
                              variant="caption" 
                              sx={{ 
                                color: isOverdue ? '#d32f2f' : '#999', 
                                fontFamily: 'Poppins, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <CalendarTodayIcon sx={{ fontSize: 12 }} />
                              {isOverdue 
                                ? `Vencida hace ${Math.abs(daysRemaining)} días`
                                : daysRemaining === 0 
                                  ? 'Vence hoy'
                                  : daysRemaining > 0 
                                    ? `${daysRemaining} días restantes`
                                    : 'Sin fecha límite'
                              }
                            </Typography>
                          )}
                        </span>
                      </span>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTaskDialog(task);
                      }}
                      sx={{
                        borderColor: GREEN,
                        color: GREEN,
                        textTransform: 'none',
                        fontFamily: 'Poppins, sans-serif',
                        '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' }
                      }}
                    >
                      Actualizar Estado
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>

          {filteredTasks.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                {statusFilter ? `No tienes tareas ${statusFilter.toLowerCase()}` : 'No tienes tareas asignadas'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
                {statusFilter ? 'Intenta cambiar el filtro' : 'Las tareas aparecerán aquí cuando sean asignadas por el coordinador'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Task Status Update Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Actualizar Estado de Tarea
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
                {selectedTask.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 3, fontFamily: 'Poppins, sans-serif' }}>
                {selectedTask.description}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Nuevo Estado</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Nuevo Estado"
                >
                  {taskStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Alert severity="info" sx={{ mt: 2, fontFamily: 'Poppins, sans-serif' }}>
                Solo puedes actualizar el estado de la tarea. Para otros cambios, contacta al coordinador del proyecto.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenTaskDialog(false)}
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateTaskStatus} 
            variant="contained" 
            sx={{ 
              bgcolor: GREEN,
              fontFamily: 'Poppins, sans-serif',
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
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Widgets Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
          Mi Rendimiento
        </Typography>
        <DashboardWidgets customizable={true} />
      </Box>
    </Box>
  );
};

export default ParticipantDashboard;
