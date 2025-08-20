import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Autocomplete from '@mui/material/Autocomplete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';
import dataService from '../../utils/dataService';

const GREEN = '#2AAC26';

const ProjectDetail = ({ project, onNavigate }) => {
  const [currentProject, setCurrentProject] = useState(project);
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openParticipantDialog, setOpenParticipantDialog] = useState(false);
  const [openMetricDialog, setOpenMetricDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingMetric, setEditingMetric] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'Pendiente',
    priority: 'Media',
    due_date: '',
    assigned_users: []
  });
  const [metricForm, setMetricForm] = useState({
    value: '',
    notes: ''
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const taskStatuses = ['Pendiente', 'En progreso', 'Completada'];
  const priorities = ['Baja', 'Media', 'Alta', 'Crítica'];

  useEffect(() => {
    if (currentProject) {
      loadProjectData();
    }
  }, [currentProject]);

  const loadProjectData = () => {
    try {
      // Cargar tareas
      const projectTasks = dataService.getTasksByProject(currentProject.id);
      setTasks(projectTasks);

      // Cargar participantes
      const projectParticipants = dataService.getProjectParticipants(currentProject.id);
      setParticipants(projectParticipants);

      // Cargar métricas
      const projectMetrics = dataService.getProjectMetrics(currentProject.id);
      setMetrics(projectMetrics);

      // Cargar usuarios disponibles (participantes activos)
      const allUsers = dataService.getAll('users')
        .filter(user => user.active && user.role_id === 3); // Solo participantes
      setAvailableUsers(allUsers);

    } catch (error) {
      showSnackbar('Error al cargar los datos del proyecto', 'error');
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return '#f44336';
      case 'Alta': return '#ff9800';
      case 'Media': return '#2196f3';
      case 'Baja': return '#4caf50';
      default: return '#757575';
    }
  };

  const handleOpenTaskDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        assigned_users: task.assigned_users || []
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        status: 'Pendiente',
        priority: 'Media',
        due_date: '',
        assigned_users: []
      });
    }
    setOpenTaskDialog(true);
  };

  const handleSaveTask = () => {
    try {
      if (!taskForm.title || !taskForm.description) {
        showSnackbar('Por favor complete todos los campos obligatorios', 'error');
        return;
      }

      const taskData = {
        ...taskForm,
        project_id: currentProject.id
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

      loadProjectData();
      setOpenTaskDialog(false);
    } catch (error) {
      showSnackbar('Error al guardar la tarea', 'error');
    }
  };

  const handleDeleteTask = (taskId) => {
    try {
      dataService.delete('tasks', taskId);
      showSnackbar('Tarea eliminada exitosamente', 'success');
      loadProjectData();
    } catch (error) {
      showSnackbar('Error al eliminar la tarea', 'error');
    }
  };

  const handleAddParticipant = () => {
    try {
      if (selectedUsers.length === 0) {
        showSnackbar('Selecciona al menos un usuario', 'error');
        return;
      }

      selectedUsers.forEach(user => {
        const existing = participants.find(p => p.id === user.id);
        if (!existing) {
          dataService.addUserToProject(currentProject.id, user.id);
        }
      });

      showSnackbar('Participantes agregados exitosamente', 'success');
      loadProjectData();
      setOpenParticipantDialog(false);
      setSelectedUsers([]);
    } catch (error) {
      showSnackbar('Error al agregar participantes', 'error');
    }
  };

  const handleRemoveParticipant = (participantId) => {
    try {
      // Aquí deberías implementar la lógica para remover del proyecto
      // Por simplicidad, no se implementa la eliminación completa
      showSnackbar('Participante removido exitosamente', 'success');
      loadProjectData();
    } catch (error) {
      showSnackbar('Error al remover participante', 'error');
    }
  };

  const handleUpdateMetric = (metric) => {
    setEditingMetric(metric);
    setMetricForm({
      value: '',
      notes: ''
    });
    setOpenMetricDialog(true);
  };

  const handleSaveMetric = () => {
    try {
      if (!metricForm.value) {
        showSnackbar('Por favor ingrese un valor', 'error');
        return;
      }

      dataService.updateMetricValue(editingMetric.id, parseFloat(metricForm.value));
      showSnackbar('Métrica actualizada exitosamente', 'success');
      loadProjectData();
      setOpenMetricDialog(false);
    } catch (error) {
      showSnackbar('Error al actualizar la métrica', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  if (!currentProject) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Proyecto no encontrado</Typography>
        <Button onClick={() => onNavigate('coordinator-dashboard')} sx={{ mt: 2 }}>
          Volver al Dashboard
        </Button>
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
            {currentProject.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={currentProject.status}
              sx={{
                bgcolor: `${getStatusColor(currentProject.status)}20`,
                color: getStatusColor(currentProject.status),
                fontFamily: 'Poppins, sans-serif'
              }}
            />
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              {new Date(currentProject.start_date).toLocaleDateString('es-ES')} - {new Date(currentProject.end_date).toLocaleDateString('es-ES')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Project Info */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Información del Proyecto
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            {currentProject.description}
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab 
              icon={<AssignmentIcon />} 
              label="Tareas" 
              sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Participantes" 
              sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
            />
            <Tab 
              icon={<TimelineIcon />} 
              label="Métricas" 
              sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
            />
          </Tabs>
        </Box>

        {/* Tasks Tab */}
        <TabPanel value={activeTab} index={0}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Gestión de Tareas
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenTaskDialog()}
                sx={{
                  bgcolor: GREEN,
                  textTransform: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': { bgcolor: '#1f9a1f' }
                }}
              >
                Nueva Tarea
              </Button>
            </Box>

            <List>
              {tasks.map((task) => (
                <ListItem 
                  key={task.id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': { bgcolor: '#f8f9fa' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
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
                          sx={{
                            bgcolor: `${getPriorityColor(task.priority)}20`,
                            color: getPriorityColor(task.priority),
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          {task.description}
                        </Typography>
                        {task.due_date && (
                          <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                            Vence: {new Date(task.due_date).toLocaleDateString('es-ES')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenTaskDialog(task)}
                      sx={{ mr: 1, color: GREEN }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteTask(task.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {tasks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                  No hay tareas creadas aún
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                  Crea la primera tarea para comenzar
                </Typography>
              </Box>
            )}
          </CardContent>
        </TabPanel>

        {/* Participants Tab */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Participantes del Proyecto
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setOpenParticipantDialog(true)}
                sx={{
                  bgcolor: GREEN,
                  textTransform: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': { bgcolor: '#1f9a1f' }
                }}
              >
                Agregar Participante
              </Button>
            </Box>

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
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                        {participant.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                        {participant.email}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveParticipant(participant.id)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {participants.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                  No hay participantes asignados
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                  Agrega participantes para comenzar la colaboración
                </Typography>
              </Box>
            )}
          </CardContent>
        </TabPanel>

        {/* Metrics Tab */}
        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
              Métricas del Proyecto
            </Typography>

            <Grid container spacing={3}>
              {metrics.map((metric) => (
                <Grid item xs={12} sm={6} md={4} key={metric.id}>
                  <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                        {metric.current_value || 0} {metric.unit}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>
                        {metric.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                        Meta: {metric.target_value} {metric.unit}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleUpdateMetric(metric)}
                        sx={{
                          borderColor: GREEN,
                          color: GREEN,
                          textTransform: 'none',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      >
                        Actualizar Valor
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {metrics.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                  No hay métricas configuradas
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                  Las métricas son configuradas por el administrador
                </Typography>
              </Box>
            )}
          </CardContent>
        </TabPanel>
      </Card>

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Título de la tarea"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  label="Estado"
                >
                  {taskStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  label="Prioridad"
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              label="Fecha de vencimiento"
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Autocomplete
              multiple
              options={participants}
              getOptionLabel={(option) => option.name}
              value={participants.filter(p => taskForm.assigned_users.includes(p.id))}
              onChange={(event, newValue) => {
                setTaskForm({ ...taskForm, assigned_users: newValue.map(user => user.id) });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Asignar a participantes"
                  placeholder="Seleccionar participantes"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>
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

      {/* Add Participant Dialog */}
      <Dialog open={openParticipantDialog} onClose={() => setOpenParticipantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Agregar Participantes
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              options={availableUsers.filter(user => !participants.some(p => p.id === user.id))}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUsers}
              onChange={(event, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar usuarios"
                  placeholder="Buscar usuarios..."
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenParticipantDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddParticipant} 
            variant="contained" 
            sx={{ 
              bgcolor: GREEN,
              '&:hover': { bgcolor: '#1f9a1f' }
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Metric Dialog */}
      <Dialog open={openMetricDialog} onClose={() => setOpenMetricDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Actualizar Métrica: {editingMetric?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMetricDialog(false)}>
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

export default ProjectDetail;
