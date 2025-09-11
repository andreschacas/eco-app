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
import activityService from '../../utils/activityService';
import { useAuth } from '../../context/auth/AuthContext';
import DashboardWidgets from '../../components/dashboard/DashboardWidgets';

const GREEN = '#2AAC26';

const ParticipantDashboard = ({ onNavigate }) => {
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

  useEffect(() => {
    loadUserTasks();
  }, [user]);

  const loadUserTasks = async () => {
    try {
      setLoading(true);
      if (!user || !user.id) return;

      const tasks = dataService.getTasksByUser(user.id);
      setMyTasks(tasks);
      setFilteredTasks(tasks);
      
      // Calcular estadísticas
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
      const inProgressTasks = tasks.filter(t => t.status === 'En progreso').length;
      const completedTasks = tasks.filter(t => t.status === 'Completada').length;
      
      setStats({
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks
      });
    } catch (error) {
      console.error('Error loading user tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso': return '#4caf50';
      case 'Completada': return '#2196f3';
      case 'Pendiente': return '#ff9800';
      case 'Pausada': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completada': return <CheckCircleIcon />;
      case 'En progreso': return <PlayArrowIcon />;
      case 'Pendiente': return <PendingIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getProjectName = (projectId) => {
    const project = dataService.getById('projects', projectId);
    return project ? project.name : 'Proyecto Desconocido';
  };

  const filterTasks = () => {
    if (!statusFilter) {
      setFilteredTasks(myTasks);
    } else {
      setFilteredTasks(myTasks.filter(task => task.status === statusFilter));
    }
  };

  useEffect(() => {
    filterTasks();
  }, [statusFilter, myTasks]);

  const handleStatusChange = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setOpenTaskDialog(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedTask || !newStatus) return;

    try {
      const oldStatus = selectedTask.status;
      dataService.update('tasks', selectedTask.id, { status: newStatus });
      
      // Registrar actividad de cambio de estado
      if (user?.id) {
        activityService.addActivity(
          user.id,
          activityService.ACTIVITY_TYPES.TASK_STATUS_CHANGED,
          {
            taskTitle: selectedTask.title,
            taskId: selectedTask.id,
            oldStatus: oldStatus,
            newStatus: newStatus,
            projectId: selectedTask.project_id
          }
        );
      }
      
      loadUserTasks();
      setOpenTaskDialog(false);
      setSnackbar({
        open: true,
        message: 'Estado de tarea actualizado correctamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al actualizar el estado de la tarea',
        severity: 'error'
      });
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (endDate) => {
    const days = getDaysRemaining(endDate);
    return days !== null && days < 0;
  };

  const getOverdueTasks = () => {
    return myTasks.filter(task => isOverdue(task.end_date));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  const overdueTasks = getOverdueTasks();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
          Bienvenido, {user?.name}
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
          Panel de Participante - Gestiona tus tareas asignadas
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: GREEN, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                {stats.total || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                Total Tareas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PendingIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                {stats.pending || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrowIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                {stats.inProgress || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                En Progreso
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                {stats.completed || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                Completadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks Section */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
              Mis Tareas Asignadas
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrar por estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filtrar por estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Pendiente">Pendientes</MenuItem>
                <MenuItem value="En progreso">En Progreso</MenuItem>
                <MenuItem value="Completada">Completadas</MenuItem>
                <MenuItem value="Pausada">Pausadas</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Overdue Tasks Alert */}
          {overdueTasks.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              Tienes {overdueTasks.length} tareas vencidas
            </Alert>
          )}

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                No tienes tareas asignadas
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
                Contacta al coordinador para que te asigne tareas
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredTasks.map((task) => {
                const daysRemaining = getDaysRemaining(task.end_date);
                const overdue = isOverdue(task.end_date);
                
                return (
                  <ListItem
                    key={task.id}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: overdue ? '#fff3e0' : 'white',
                      '&:hover': { bgcolor: overdue ? '#ffe0b2' : '#f5f5f5' }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
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
                          <Chip
                            label={task.priority}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'Poppins, sans-serif' }}
                          />
                          {overdue && (
                            <Chip
                              label="VENCIDA"
                              size="small"
                              sx={{
                                bgcolor: '#f44336',
                                color: 'white',
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                            {task.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                              Proyecto: {getProjectName(task.project_id)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarTodayIcon sx={{ fontSize: 14, color: '#666' }} />
                              <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                                {daysRemaining === null ? 'Sin fecha límite' : 
                                 daysRemaining > 0 ? `${daysRemaining} días restantes` :
                                 daysRemaining === 0 ? 'Termina hoy' :
                                 `Vencida hace ${Math.abs(daysRemaining)} días`}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleStatusChange(task)}
                        sx={{
                          bgcolor: GREEN,
                          textTransform: 'none',
                          fontFamily: 'Poppins, sans-serif',
                          '&:hover': { bgcolor: '#1f9a1f' }
                        }}
                      >
                        Actualizar Estado
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Task Status Update Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Actualizar Estado de Tarea
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                {selectedTask.title}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Nuevo Estado</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Nuevo Estado"
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En progreso">En Progreso</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                  <MenuItem value="Pausada">Pausada</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateStatus}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ParticipantDashboard;