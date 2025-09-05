import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  LinearProgress,
  Divider,
  Stack,
  Button,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Link,
  Add
} from '@mui/icons-material';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import GanttTaskDialog from './GanttTaskDialog';

const GanttChart = ({ projectId = null, filterByRole = true }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 9)); // 9 de septiembre de 2025
  const [zoomLevel, setZoomLevel] = useState('days');
  const [selectedTask, setSelectedTask] = useState(null);
  const [dependencies, setDependencies] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const ganttRef = useRef(null);
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [viewEndDate, setViewEndDate] = useState(new Date());

  // Configuración de colores
  const taskColors = {
    'Pendiente': '#e3f2fd',
    'En progreso': '#fff3e0',
    'Completada': '#e8f5e9',
    'Crítica': '#ffebee'
  };

  const priorityColors = {
    'Baja': '#4caf50',
    'Media': '#ff9800',
    'Alta': '#f44336',
    'Crítica': '#9c27b0'
  };

  useEffect(() => {
    loadData();
    calculateViewDates();
  }, [projectId, user, currentDate, zoomLevel]);

  const loadData = () => {
    try {
      let allTasks = dataService.getAll('tasks');
      
      // Filtrar por proyecto si se proporciona
      if (projectId) {
        allTasks = allTasks.filter(task => task.project_id === projectId);
      }
      
      // Filtrar por rol si es necesario
      if (filterByRole && user) {
        switch (user.role) {
          case 'Administrador':
            // Ve todas las tareas
            break;
          case 'Coordinador':
            if (!projectId) {
              const coordinatorProjects = dataService.getProjectsByCoordinator(user.id);
              const projectIds = coordinatorProjects.map(p => p.id);
              allTasks = allTasks.filter(task => projectIds.includes(task.project_id));
            }
            break;
          case 'Participante':
            const userTasks = dataService.getTasksByUser(user.id);
            allTasks = allTasks.filter(task => 
              userTasks.some(userTask => userTask.id === task.id)
            );
            break;
        }
      }

      // Enriquecer tareas con datos de usuarios y proyectos
      const enrichedTasks = allTasks.map(task => {
        const assignedUsers = task.assigned_users?.map(userId => 
          dataService.getById('users', userId)
        ).filter(Boolean) || [];
        
        const project = dataService.getById('projects', task.project_id);
        
        // Calcular fechas y duración
        const startDate = new Date(task.due_date);
        const duration = getTaskDuration(task);
        const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
        
        // Calcular progreso (simulado basado en estado)
        const progress = getTaskProgress(task);
        
        return {
          ...task,
          assignedUsers,
          project,
          startDate,
          endDate,
          duration,
          progress
        };
      });

      setTasks(enrichedTasks);
      
      // Cargar proyectos y usuarios
      setProjects(dataService.getAll('projects'));
      setUsers(dataService.getAll('users'));
      
      // Generar dependencias y milestones
      generateDependencies(enrichedTasks);
      generateMilestones(enrichedTasks);
      
    } catch (error) {
      console.error('Error loading Gantt data:', error);
    }
  };

  const getTaskDuration = (task) => {
    // Duración simulada basada en prioridad y tipo
    const baseDuration = {
      'Baja': 7,
      'Media': 5,
      'Alta': 3,
      'Crítica': 2
    };
    return baseDuration[task.priority] || 5;
  };

  const getTaskProgress = (task) => {
    // Progreso simulado basado en estado y prioridad
    switch (task.status) {
      case 'Pendiente': 
        return 0;
      case 'En progreso': 
        // Progreso más realista basado en prioridad
        switch (task.priority) {
          case 'Crítica': return Math.random() * 40 + 60; // 60-100%
          case 'Alta': return Math.random() * 50 + 40; // 40-90%
          case 'Media': return Math.random() * 60 + 20; // 20-80%
          case 'Baja': return Math.random() * 40 + 10; // 10-50%
          default: return Math.random() * 40 + 30; // 30-70%
        }
      case 'Completada': 
        return 100;
      default: 
        return 0;
    }
  };

  const generateDependencies = (tasks) => {
    // Generar dependencias más realistas basadas en las tareas de ejemplo
    const deps = [];
    
    // Dependencias específicas para las tareas de evento
    const eventDependencies = [
      { from: 1, to: 2 }, // Finalizar nombre -> Finalizar presupuesto
      { from: 2, to: 3 }, // Finalizar presupuesto -> Proponer ideas keynote
      { from: 3, to: 4 }, // Proponer ideas -> Reclutar oradores
      { from: 4, to: 7 }, // Reclutar oradores -> Asegurar panel
      { from: 5, to: 4 }, // Contactar invitados -> Reclutar oradores
      { from: 6, to: 8 }, // Mapear estrategia -> Programar sesiones
      { from: 8, to: 9 }, // Programar sesiones -> Explorar tema
      { from: 10, to: 11 }, // Programar evento -> Diseñar logo
      { from: 11, to: 12 }, // Diseñar logo -> Finalizar agenda
      { from: 12, to: 13 }  // Finalizar agenda -> Finalizar agenda sesiones
    ];
    
    // Agregar dependencias del evento
    eventDependencies.forEach((dep, index) => {
      if (tasks.find(t => t.id === dep.from) && tasks.find(t => t.id === dep.to)) {
        deps.push({
          id: `dep-${index}`,
          from: dep.from,
          to: dep.to,
          type: 'finish-to-start'
        });
      }
    });
    
    setDependencies(deps);
  };

  const generateMilestones = (tasks) => {
    // Generar milestones específicos para las tareas de evento
    const milestoneTasks = [
      { id: 1, title: 'Nombre del evento aprobado' },
      { id: 2, title: 'Presupuesto finalizado' },
      { id: 4, title: 'Oradores confirmados' },
      { id: 7, title: 'Panel de oradores asegurado' },
      { id: 12, title: 'Agenda del evento finalizada' }
    ];
    
    const milestones = milestoneTasks
      .filter(milestone => tasks.find(t => t.id === milestone.id))
      .map(milestone => {
        const task = tasks.find(t => t.id === milestone.id);
        return {
          id: `milestone-${milestone.id}`,
          taskId: milestone.id,
          date: new Date(task.due_date),
          title: milestone.title,
          type: 'milestone'
        };
      });
    
    setMilestones(milestones);
  };

  const calculateViewDates = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    switch (zoomLevel) {
      case 'days':
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 14);
        break;
      case 'weeks':
        start.setDate(start.getDate() - 14);
        end.setDate(end.getDate() + 28);
        break;
      case 'months':
        start.setMonth(start.getMonth() - 1);
        end.setMonth(end.getMonth() + 2);
        break;
    }
    
    setViewStartDate(start);
    setViewEndDate(end);
  };

  const getDateRange = () => {
    const dates = [];
    const current = new Date(viewStartDate);
    
    while (current <= viewEndDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const formatDate = (date) => {
    switch (zoomLevel) {
      case 'days':
        return date.getDate().toString();
      case 'weeks':
        return `W${Math.ceil(date.getDate() / 7)}`;
      case 'months':
        return date.toLocaleDateString('es-ES', { month: 'short' });
      default:
        return date.getDate().toString();
    }
  };

  const getTaskBarPosition = (task) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const totalDays = Math.ceil((viewEndDate - viewStartDate) / (1000 * 60 * 60 * 24));
    const startOffset = Math.ceil((startDate - viewStartDate) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };



  const handleTaskDrag = (taskId, newStartDate) => {
    try {
      // Actualizar la fecha de la tarea
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          due_date: newStartDate.toISOString().split('T')[0]
        };
        dataService.update('tasks', taskId, updatedTask);
        loadData(); // Recargar datos para reflejar el cambio
      }
    } catch (error) {
      console.error('Error updating task date:', error);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = (taskData) => {
    try {
      if (editingTask) {
        // Actualizar tarea existente
        const updatedTask = { ...editingTask, ...taskData };
        dataService.update('tasks', editingTask.id, updatedTask);
      } else {
        // Crear nueva tarea
        const newTask = {
          ...taskData,
          id: Date.now(),
          created_at: new Date().toISOString()
        };
        dataService.create('tasks', newTask);
      }
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = (taskId) => {
    try {
      dataService.delete('tasks', taskId);
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };



  const handleDateNavigation = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (zoomLevel) {
      case 'days':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'weeks':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 14 : -14));
        break;
      case 'months':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };



  const renderTimeline = () => {
    const dates = getDateRange();
    
    return (
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        {/* Header del timeline */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {/* Navegación de fechas */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => handleDateNavigation('prev')}
                sx={{ 
                  bgcolor: '#fff', 
                  border: '1px solid #e0e0e0',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center', fontWeight: 600, color: '#333' }}>
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleDateNavigation('next')}
                sx={{ 
                  bgcolor: '#fff', 
                  border: '1px solid #e0e0e0',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
            
            {/* Controles simplificados */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Zoom</InputLabel>
                <Select
                  value={zoomLevel}
                  label="Zoom"
                  onChange={(e) => setZoomLevel(e.target.value)}
                >
                  <MenuItem value="days">Días</MenuItem>
                  <MenuItem value="weeks">Semanas</MenuItem>
                  <MenuItem value="months">Meses</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {/* Grid de fechas */}
          <Box sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0', bgcolor: '#fff' }}>
            {dates.map((date, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: 50,
                  p: 1.5,
                  textAlign: 'center',
                  borderRight: '1px solid #f0f0f0',
                  bgcolor: date.toDateString() === new Date(2025, 8, 9).toDateString() ? '#e3f2fd' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 12, color: '#333' }}>
                  {formatDate(date)}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10 }}>
                  {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        {/* Área del Gantt */}
        <Box sx={{ height: 'calc(100vh - 300px)', overflow: 'auto', position: 'relative', bgcolor: '#fff' }}>
          {/* Líneas de grid */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {dates.map((_, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(index / dates.length) * 100}%`,
                  width: '1px',
                  bgcolor: '#f0f0f0'
                }}
              />
            ))}
          </Box>
          
          {/* Barras de tareas con funcionalidad de arrastre */}
          {tasks.map((task, index) => {
            const position = getTaskBarPosition(task);
            const barColor = priorityColors[task.priority] || '#2196f3';
              
            return (
              <Box
                key={task.id}
                sx={{
                  position: 'absolute',
                  top: index * 80 + 15,
                  left: position.left,
                  width: position.width,
                  height: 50,
                  bgcolor: barColor,
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.1)',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, startX: e.clientX }));
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                  const rect = e.currentTarget.parentElement.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = (x / rect.width) * 100;
                  
                  // Calcular nueva fecha basada en la posición
                  const totalDays = Math.ceil((viewEndDate - viewStartDate) / (1000 * 60 * 60 * 24));
                  const newDayOffset = Math.round((percentage / 100) * totalDays);
                  const newDate = new Date(viewStartDate);
                  newDate.setDate(newDate.getDate() + newDayOffset);
                  
                  // Actualizar la tarea
                  handleTaskDrag(task.id, newDate);
                }}
                onDoubleClick={() => handleEditTask(task)}
              >
                {/* Progreso dentro de la barra */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${task.progress}%`,
                    bgcolor: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px 0 0 3px'
                  }}
                />
                
                {/* Avatares de usuarios */}
                <Box sx={{ display: 'flex', gap: 0.5, zIndex: 1 }}>
                  {task.assignedUsers.slice(0, 2).map((user, idx) => (
                    <Avatar
                      key={idx}
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: 11,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: '#333',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                  ))}
                </Box>
                
                {/* Título de la tarea */}
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    color: '#333',
                    fontWeight: 600,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
                  }}
                >
                  {task.title}
                </Typography>
              </Box>
            );
          })}
          
          {/* Dependencias simplificadas */}
          {dependencies.slice(0, 3).map((dep, index) => {
            const fromTask = tasks.find(t => t.id === dep.from);
            const toTask = tasks.find(t => t.id === dep.to);
            
            if (!fromTask || !toTask) return null;
            
            const fromIndex = tasks.findIndex(t => t.id === dep.from);
            const toIndex = tasks.findIndex(t => t.id === dep.to);
            
            const fromPos = getTaskBarPosition(fromTask);
            const toPos = getTaskBarPosition(toTask);
            
            return (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  top: fromIndex * 80 + 40,
                  left: `calc(${fromPos.left} + ${fromPos.width})`,
                  width: `calc(${toPos.left} - ${fromPos.left} - ${fromPos.width})`,
                  height: 2,
                  bgcolor: '#666',
                  borderRadius: 1,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -4,
                    top: -3,
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid #666',
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent'
                  }
                }}
              />
            );
          })}
          
          {/* Milestones simplificados */}
          {milestones.slice(0, 2).map((milestone, index) => {
            const task = tasks.find(t => t.id === milestone.taskId);
            if (!task) return null;
            
            const taskIndex = tasks.findIndex(t => t.id === milestone.taskId);
            const position = getTaskBarPosition(task);
            
            return (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  top: taskIndex * 80 + 10,
                  left: `calc(${position.left} + ${position.width})`,
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '10px solid #ff9800',
                  transform: 'rotate(45deg)'
                }}
              />
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header principal simplificado */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#333' }}>
              Diagrama de Gantt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vista de cronograma del proyecto
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<Flag />}
              label={`${milestones.length} Hitos`}
              size="small"
              sx={{ 
                bgcolor: '#e3f2fd', 
                color: '#1976d2',
                border: '1px solid #bbdefb'
              }}
            />
            <Chip
              icon={<Link />}
              label={`${dependencies.length} Dependencias`}
              size="small"
              sx={{ 
                bgcolor: '#f3e5f5', 
                color: '#7b1fa2',
                border: '1px solid #e1bee7'
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={handleAddTask}
              sx={{ 
                bgcolor: '#2AAC26', 
                '&:hover': { bgcolor: '#1f9a1f' },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Nueva Tarea
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* Contenido principal - Solo timeline sin barra lateral */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {renderTimeline()}
      </Box>
      
      {/* Dialog para crear/editar tareas */}
      <GanttTaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        projectId={projectId}
        users={users}
      />
    </Paper>
  );
};

export default GanttChart;
