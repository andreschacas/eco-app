import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
  Divider,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Slider,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search,
  Notifications,
  DarkMode,
  Person,
  Add,
  FilterList,
  ViewList,
  CalendarToday,
  MoreVert,
  ChevronLeft,
  ChevronRight,
  Today,
  ZoomIn,
  ZoomOut,
  Group,
  Sort,
  Refresh,
  Settings,
  CheckCircle,
  RadioButtonUnchecked,
  PlayCircle,
  PauseCircle,
  Cancel,
  Star,
  StarBorder,
  Timeline,
  ViewModule,
  ViewComfy,
  ViewWeek,
  ViewDay,
  CenterFocusStrong,
  Link,
  Flag,
  Schedule,
  DragIndicator,
  Edit,
  Delete,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import GanttTaskDialogNew from './GanttTaskDialogNew';
import eventBus from '../../utils/eventBus';

const ModernGanttNew = ({ projectId = null, filterByRole = true }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline');
  const [zoomLevel, setZoomLevel] = useState('weeks');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [groupBy, setGroupBy] = useState('project');
  const [sortBy, setSortBy] = useState('due_date');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [viewEndDate, setViewEndDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(1);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [projectId, filterByRole, user]);

  // Escuchar eventos del EventBus para sincronización automática
  useEffect(() => {
    const handleTaskCreated = (data) => {
      console.log('Gantt - Evento recibido taskCreated:', data);
      console.log('Gantt - projectId actual:', projectId, 'data.projectId:', data.projectId);
      
      // Solo actualizar si es del mismo proyecto o no hay proyecto específico
      if (!projectId || data.projectId == projectId) {
        console.log('Gantt - Tarea creada, recargando datos:', data);
        loadData();
      } else {
        console.log('Gantt - Ignorando tarea de otro proyecto');
      }
    };

    const handleTaskUpdated = (data) => {
      console.log('Gantt - Evento recibido taskUpdated:', data);
      console.log('Gantt - projectId actual:', projectId, 'data.projectId:', data.projectId);
      
      // Solo actualizar si es del mismo proyecto o no hay proyecto específico
      if (!projectId || data.projectId == projectId) {
        console.log('Gantt - Tarea actualizada, recargando datos:', data);
        loadData();
      } else {
        console.log('Gantt - Ignorando actualización de tarea de otro proyecto');
      }
    };

    const handleTaskDeleted = (data) => {
      console.log('Gantt - Evento recibido taskDeleted:', data);
      console.log('Gantt - projectId actual:', projectId, 'data.projectId:', data.projectId);
      
      // Solo actualizar si es del mismo proyecto o no hay proyecto específico
      if (!projectId || data.projectId == projectId) {
        console.log('Gantt - Tarea eliminada, recargando datos:', data);
        loadData();
      } else {
        console.log('Gantt - Ignorando eliminación de tarea de otro proyecto');
      }
    };

    // Suscribirse a los eventos
    eventBus.on('taskCreated', handleTaskCreated);
    eventBus.on('taskUpdated', handleTaskUpdated);
    eventBus.on('taskDeleted', handleTaskDeleted);

    console.log('Gantt - Suscrito a eventos del EventBus');

    // Limpiar suscripciones al desmontar
    return () => {
      eventBus.off('taskCreated', handleTaskCreated);
      eventBus.off('taskUpdated', handleTaskUpdated);
      eventBus.off('taskDeleted', handleTaskDeleted);
      console.log('Gantt - Desuscrito de eventos del EventBus');
    };
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectsData, tasksData, usersData] = await Promise.all([
        dataService.getAll('projects'),
        dataService.getAll('tasks'),
        dataService.getAll('users')
      ]);

      let filteredProjects = projectsData;
      let filteredTasks = tasksData;

      // PRIMER FILTRO: Por proyecto específico si se proporciona
      if (projectId) {
        filteredTasks = tasksData.filter(task => task.project_id === projectId);
        filteredProjects = projectsData.filter(project => project.id === projectId);
      }

      // SEGUNDO FILTRO: Por rol y usuario si es necesario
      if (filterByRole && user) {
        switch (user.role) {
          case 'Administrador':
            // Administrador ve TODAS las tareas (incluye tareas sin participantes)
            break;
          case 'Coordinador':
            if (!projectId) {
              // Si no hay proyecto específico, tareas de proyectos donde es coordinador
              const coordinatorProjects = dataService.getProjectsByCoordinator(user.id);
              const projectIds = coordinatorProjects.map(p => p.id);
              filteredTasks = filteredTasks.filter(task => projectIds.includes(task.project_id));
            }
            // Coordinador ve TODAS las tareas del proyecto (incluye tareas sin participantes)
            break;
          case 'Participante':
            // Participantes SOLO ven sus tareas asignadas
            filteredTasks = filteredTasks.filter(task => 
              task.assigned_users?.includes(user.id)
            );
            break;
          default:
            break;
        }
      }

      setProjects(filteredProjects);
      setTasks(filteredTasks);
      setUsers(usersData);

      // Debug: Verificar tareas cargadas
      console.log('Gantt - Tareas cargadas:', filteredTasks.length, 'para proyecto:', projectId);
      console.log('Gantt - Tareas:', filteredTasks.map(t => ({ id: t.id, title: t.title, project_id: t.project_id, due_date: t.due_date })));

      // Calcular fechas de vista
      calculateViewDates(filteredTasks);
      
      // Cargar tareas recientes
      loadRecentTasks(filteredTasks);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const calculateViewDates = (tasksData) => {
    if (tasksData.length === 0) {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setViewStartDate(startOfMonth);
      setViewEndDate(endOfMonth);
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      return;
    }

    const dates = tasksData
      .filter(task => task.due_date)
      .map(task => new Date(task.due_date));
    
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      // Ajustar al inicio y fin del mes
      const startOfMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const endOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
      
      setViewStartDate(startOfMonth);
      setViewEndDate(endOfMonth);
      setCurrentMonth(startOfMonth.getMonth());
      setCurrentYear(startOfMonth.getFullYear());
    }
  };

  const loadRecentTasks = (tasksData) => {
    console.log('Gantt - Cargando tareas recientes de:', tasksData.length, 'tareas');
    
    const recent = tasksData
      .filter(task => task.status !== 'Completada')
      .sort((a, b) => {
        // Ordenar por fecha de vencimiento, las más recientes primero
        const dateA = new Date(a.due_date || 0);
        const dateB = new Date(b.due_date || 0);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(task => ({
        id: task.id,
        title: task.title,
        time: formatTaskTime(task.due_date),
        type: getTaskType(task.priority, task.status),
        color: getTaskColor(task.priority, task.status),
        status: task.status,
        priority: task.priority
      }));
    
    console.log('Gantt - Tareas recientes cargadas:', recent.length, recent.map(t => t.title));
    setRecentTasks(recent);
  };

  const formatTaskTime = (dueDate) => {
    if (!dueDate) return 'Sin fecha';
    
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 0) return `En ${diffDays} días`;
    return `Hace ${Math.abs(diffDays)} días`;
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthIndex];
  };

  const handlePreviousMonth = () => {
    const newMonth = displayMonth === 0 ? 11 : displayMonth - 1;
    const newYear = displayMonth === 0 ? displayYear - 1 : displayYear;
    setDisplayMonth(newMonth);
    setDisplayYear(newYear);
    updateViewDates(newMonth, newYear);
  };

  const handleNextMonth = () => {
    const newMonth = displayMonth === 11 ? 0 : displayMonth + 1;
    const newYear = displayMonth === 11 ? displayYear + 1 : displayYear;
    setDisplayMonth(newMonth);
    setDisplayYear(newYear);
    updateViewDates(newMonth, newYear);
  };

  const handleToday = () => {
    const today = new Date();
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());
    updateViewDates(today.getMonth(), today.getFullYear());
  };

  const updateViewDates = (month, year) => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    setViewStartDate(startOfMonth);
    setViewEndDate(endOfMonth);
  };

  const getTaskType = (priority, status) => {
    if (status === 'Completada') return 'completed';
    if (priority === 'Alta' || priority === 'Urgente') return 'important';
    if (priority === 'Media') return 'warning';
    return 'info';
  };

  const getTaskColor = (priority, status) => {
    if (status === 'Completada') return '#4CAF50';
    if (priority === 'Alta' || priority === 'Urgente') return '#F44336';
    if (priority === 'Media') return '#FF9800';
    return '#2196F3';
  };

  const getTaskBarStyle = (task, projectColor) => {
    if (!task.due_date) return { display: 'none' };
    
    const startDate = new Date(task.due_date);
    const estimatedDays = Math.max(1, Math.ceil((task.estimated_hours || 8) / 8)); // 8 horas por día
    const endDate = new Date(startDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
    
    const totalDays = Math.ceil((viewEndDate - viewStartDate) / (1000 * 60 * 60 * 24));
    const startOffset = Math.max(0, (startDate - viewStartDate) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const left = Math.min(100, Math.max(0, (startOffset / totalDays) * 100));
    const width = Math.min(100 - left, Math.max(2, (duration / totalDays) * 100));
    
    return {
      position: 'absolute',
      left: `${left}%`,
      width: `${width}%`,
      height: '24px',
      backgroundColor: projectColor,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 8px',
      fontSize: '12px',
      color: 'white',
      fontWeight: 500,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }
    };
  };

  const getProgressBarStyle = (progress) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    width: `${progress}%`,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: '0 0 4px 4px'
  });

  const getAssigneeStyle = (userId) => {
    const user = users.find(u => u.id === userId);
    return {
      width: '16px',
      height: '16px',
      fontSize: '10px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.3)'
    };
  };

  const getProjectColor = (projectId) => {
    const colors = [
      '#E91E63', // Rosa vibrante (Slack)
      '#424242', // Gris oscuro (Vimeo)
      '#8BC34A', // Verde oliva (Behance)
      '#FFC107', // Amarillo mostaza (Puzzle)
      '#FF5722', // Naranja vibrante
      '#9C27B0', // Púrpura
      '#00BCD4', // Cian
      '#795548'  // Marrón
    ];
    return colors[projectId % colors.length];
  };

  const renderTaskBar = (task, projectColor) => {
    if (!task.due_date) return null;

    // Calcular posición en la semana
    const taskDate = new Date(task.due_date);
    const weekStart = new Date(viewStartDate);
    const weekNumber = Math.floor((taskDate - weekStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    // Determinar el icono basado en el estado/prioridad
    let iconText = 'E'; // Default
    if (task.status === 'Completada') iconText = '✓';
    else if (task.priority === 'Alta' || task.priority === 'Urgente') iconText = '!';
    else if (task.is_milestone) iconText = 'M';

    return (
      <Tooltip key={task.id} title={`${task.title} - ${task.progress}% completado`}>
        <Box
          sx={{
            position: 'absolute',
            left: `${((weekNumber - 1) * 100) / 7}%`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            backgroundColor: projectColor,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            '&:hover': {
              transform: 'translateY(-50%) scale(1.1)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }
          }}
          onClick={() => handleTaskClick(task)}
        >
          {iconText}
        </Box>
      </Tooltip>
    );
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id && tasks.find(t => t.id === taskData.id)) {
        // Actualizar tarea existente
        await dataService.update('tasks', taskData.id, taskData);
      } else {
        // Crear nueva tarea
        await dataService.create('tasks', taskData);
      }
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      alert('Error al guardar la tarea');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await dataService.delete('tasks', taskId);
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea');
    }
  };

  const renderProjectRow = (project) => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const projectColor = getProjectColor(project.id);
    
    return (
      <Box key={project.id} sx={{ 
        display: 'flex', 
        height: '60px', 
        borderBottom: '1px solid #f0f0f0',
        '&:hover': {
          backgroundColor: '#f8f9fa'
        }
      }}>
        {/* Project Name Column */}
        <Box sx={{ 
          width: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 16px',
          borderRight: '1px solid #f0f0f0',
          backgroundColor: 'white'
        }}>
          <Typography sx={{ 
            fontWeight: 500, 
            fontSize: '14px',
            color: '#333'
          }}>
            {project.name}
          </Typography>
        </Box>

        {/* Timeline Column */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          {projectTasks.map(task => renderTaskBar(task, projectColor))}
        </Box>
      </Box>
    );
  };

  const renderTimelineHeader = () => {
    const totalDays = Math.ceil((viewEndDate - viewStartDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(totalDays / 7);
    
    return (
      <Box sx={{ 
        display: 'flex', 
        height: '50px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fafafa'
      }}>
        {/* Nombre de proyecto */}
        <Box sx={{ 
          width: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 16px',
          borderRight: '1px solid #e0e0e0',
          fontWeight: 600,
          color: '#666',
          fontSize: '14px'
        }}>
          Nombre del proyecto
        </Box>

        {/* Semanas */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex',
          borderRight: '1px solid #e0e0e0'
        }}>
          {Array.from({ length: Math.min(7, weeks) }, (_, i) => (
            <Box key={i} sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRight: i < 6 ? '1px solid #e0e0e0' : 'none',
              position: 'relative',
              minWidth: '120px'
            }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>
                {i + 1} semana
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterUser !== 'all' && !task.assigned_users?.includes(parseInt(filterUser))) return false;
    return true;
  });

  const groupedProjects = projects.filter(project => 
    filteredTasks.some(task => task.project_id === project.id)
  );

  return (
    <Box sx={{ display: 'flex', height: '100%', backgroundColor: '#f8f9fa' }}>
      {/* Left Sidebar */}
      <Box sx={{ 
        width: '300px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #e0e0e0',
        height: '100%',
        overflowY: 'auto'
      }}>
        <Box sx={{ padding: '24px' }}>
          <Typography sx={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: '#333',
            mb: 3
          }}>
            Tus tareas recientes
          </Typography>

          {/* Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              size="small"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: '100%' }}
            />
            
            {/* Debug: Botón para probar sincronización */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                size="small"
                onClick={() => {
                  console.log('Gantt - Forzando recarga de datos...');
                  loadData();
                }}
                sx={{ mt: 1, width: '100%', fontSize: '10px' }}
              >
                🔄 Recargar Datos
              </Button>
            )}
          </Box>

          <Stack spacing={2}>
            {recentTasks.map((task) => (
              <Card key={task.id} sx={{ 
                boxShadow: 'none',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => handleTaskClick(tasks.find(t => t.id === task.id))}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ 
                      width: '4px', 
                      height: '40px', 
                      backgroundColor: task.color,
                      borderRadius: '2px',
                      flexShrink: 0
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ 
                        fontSize: '14px', 
                        fontWeight: 500,
                        color: '#333',
                        mb: 0.5
                      }}>
                        {task.title}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '12px', 
                        color: '#666'
                      }}>
                        {task.time}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        backgroundColor: 'white',
        overflow: 'auto',
        height: '100%'
      }}>
        <Box sx={{ padding: '24px' }}>
          {/* Barra de navegación de fechas */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3,
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            {/* Navegación de fechas */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                size="small" 
                onClick={handlePreviousMonth}
                sx={{ 
                  color: '#666',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                }}
              >
                <ChevronLeft />
              </IconButton>
              
              <Typography sx={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                color: '#333',
                minWidth: '200px',
                textAlign: 'center'
              }}>
                {getMonthName(displayMonth)} de {displayYear}
              </Typography>
              
              <IconButton 
                size="small" 
                onClick={handleNextMonth}
                sx={{ 
                  color: '#666',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>

            {/* Controles adicionales */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                size="small"
                startIcon={<Today />}
                onClick={handleToday}
                sx={{ 
                  fontSize: '12px',
                  textTransform: 'none',
                  color: '#666'
                }}
              >
                Hoy
              </Button>
              <Button
                size="small"
                startIcon={<CenterFocusStrong />}
                sx={{ 
                  fontSize: '12px',
                  textTransform: 'none',
                  color: '#666'
                }}
              >
                Centrar
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={showDependencies}
                    onChange={(e) => setShowDependencies(e.target.checked)}
                    size="small"
                    sx={{ '& .MuiSwitch-thumb': { width: 16, height: 16 } }}
                  />
                }
                label="Dependencias"
                sx={{ 
                  fontSize: '12px',
                  '& .MuiFormControlLabel-label': { fontSize: '12px' }
                }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showMilestones}
                    onChange={(e) => setShowMilestones(e.target.checked)}
                    size="small"
                    sx={{ '& .MuiSwitch-thumb': { width: 16, height: 16 } }}
                  />
                }
                label="Hitos"
                sx={{ 
                  fontSize: '12px',
                  '& .MuiFormControlLabel-label': { fontSize: '12px' }
                }}
              />
            </Box>
          </Box>

          {/* Toolbar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            flexWrap: 'wrap'
          }}>
            {/* Filters */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Estado"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="En progreso">En progreso</MenuItem>
                <MenuItem value="Completada">Completada</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Prioridad"
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="Baja">Baja</MenuItem>
                <MenuItem value="Media">Media</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
                <MenuItem value="Urgente">Urgente</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Usuario</InputLabel>
              <Select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                label="Usuario"
              >
                <MenuItem value="all">Todos</MenuItem>
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Agrupar</InputLabel>
              <Select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                label="Agrupar"
              >
                <MenuItem value="project">Proyecto</MenuItem>
                <MenuItem value="status">Estado</MenuItem>
                <MenuItem value="priority">Prioridad</MenuItem>
                <MenuItem value="user">Usuario</MenuItem>
              </Select>
            </FormControl>

            {/* Zoom Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={() => setZoomLevel('days')}>
                <ViewDay />
              </IconButton>
              <IconButton size="small" onClick={() => setZoomLevel('weeks')}>
                <ViewWeek />
              </IconButton>
              <IconButton size="small" onClick={() => setZoomLevel('months')}>
                <ViewModule />
              </IconButton>
            </Box>

            {/* Settings */}
            <IconButton 
              onClick={(e) => setSettingsMenuAnchor(e.currentTarget)}
              size="small"
            >
              <Settings />
            </IconButton>
          </Box>

          {/* Gantt Chart */}
          <Box sx={{ 
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            {renderTimelineHeader()}
            <Box>
              {groupedProjects.map(project => renderProjectRow(project))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={() => setSettingsMenuAnchor(null)}
      >
        <MenuItem onClick={() => setShowDependencies(!showDependencies)}>
          <ListItemIcon>
            <Link />
          </ListItemIcon>
          <ListItemText primary="Mostrar Dependencias" />
          <Switch checked={showDependencies} />
        </MenuItem>
        <MenuItem onClick={() => setShowMilestones(!showMilestones)}>
          <ListItemIcon>
            <Flag />
          </ListItemIcon>
          <ListItemText primary="Mostrar Hitos" />
          <Switch checked={showMilestones} />
        </MenuItem>
      </Menu>

      {/* Task Dialog */}
      <GanttTaskDialogNew
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        projects={projects}
        users={users}
      />
    </Box>
  );
};

export default ModernGanttNew;