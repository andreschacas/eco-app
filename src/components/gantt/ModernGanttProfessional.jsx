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
  ListItemText,
  Fade,
  Zoom,
  ClickAwayListener,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  Checkbox
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
  Settings,
  CheckCircle,
  Schedule,
  Warning,
  Flag,
  Star,
  StarBorder,
  PlayArrow,
  Pause,
  Stop,
  Assignment,
  BugReport,
  Build,
  Code,
  DesignServices,
  Analytics,
  CalendarMonth,
  TrendingUp,
  People,
  Work,
  TaskAlt,
  RadioButtonUnchecked,
  CheckCircleOutline,
  Timeline,
  CenterFocusStrong,
  ExpandMore,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';
import eventBus from '../../utils/eventBus';
import GanttTaskDialogNew from './GanttTaskDialogNew';

const ModernGanttProfessional = ({ projectId, filterByRole = true }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [userFilter, setUserFilter] = useState('Todos');
  const [groupBy, setGroupBy] = useState('Proyecto');
  const [zoomLevel, setZoomLevel] = useState('Semanas');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showDependencies, setShowDependencies] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [viewEndDate, setViewEndDate] = useState(new Date());
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({});
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [viewMenuAnchor, setViewMenuAnchor] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const ganttRef = useRef(null);
  const tooltipRef = useRef(null);

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [projectId, filterByRole, user]);

  // Escuchar eventos del EventBus para sincronización automática
  useEffect(() => {
    const handleTaskCreated = (data) => {
      console.log('Gantt - Evento recibido taskCreated:', data);
      console.log('Gantt - projectId actual:', projectId, 'data.projectId:', data.projectId);
      
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
      
      if (!projectId || data.projectId == projectId) {
        console.log('Gantt - Tarea eliminada, recargando datos:', data);
        loadData();
      } else {
        console.log('Gantt - Ignorando eliminación de tarea de otro proyecto');
      }
    };

    eventBus.on('taskCreated', handleTaskCreated);
    eventBus.on('taskUpdated', handleTaskUpdated);
    eventBus.on('taskDeleted', handleTaskDeleted);

    console.log('Gantt - Suscrito a eventos del EventBus');

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

      // Filtrar por proyecto específico si se proporciona
      if (projectId) {
        filteredProjects = projectsData.filter(p => p.id === projectId);
        filteredTasks = tasksData.filter(t => t.project_id === projectId);
      }

      // Aplicar filtros por rol
      if (filterByRole && user) {
        switch (user.role) {
          case 'Administrador':
            // Administrador ve todo
            break;
          case 'Coordinador':
            // Coordinador ve proyectos donde es coordinador
            const coordinatorProjects = projectsData.filter(p => p.coordinator_id === user.id);
            const projectIds = coordinatorProjects.map(p => p.id);
            filteredTasks = filteredTasks.filter(task => projectIds.includes(task.project_id));
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

      console.log('Gantt - Tareas cargadas:', filteredTasks.length, 'para proyecto:', projectId);
      console.log('Gantt - Tareas:', filteredTasks.map(t => ({ id: t.id, title: t.title, project_id: t.project_id, due_date: t.due_date })));

      calculateViewDates(filteredTasks);
      loadRecentTasks(filteredTasks);
    } catch (error) {
      console.error('Error cargando datos del Gantt:', error);
    }
  };

  const calculateViewDates = (tasksData) => {
    const today = new Date();
    
    if (tasksData.length === 0) {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setViewStartDate(startOfMonth);
      setViewEndDate(endOfMonth);
      return;
    }

    // Recopilar todas las fechas relevantes (inicio y fin de tareas)
    const allDates = [];
    
    tasksData.forEach(task => {
      // Agregar fecha de inicio si existe
      if (task.start_date) {
        allDates.push(new Date(task.start_date));
      } else if (task.created_at) {
        // Usar fecha de creación como inicio si no hay start_date
        allDates.push(new Date(task.created_at));
      }
      
      // Agregar fecha de vencimiento si existe
      if (task.due_date) {
        allDates.push(new Date(task.due_date));
      }
    });
    
    if (allDates.length > 0) {
      const minDate = new Date(Math.min(...allDates));
      const maxDate = new Date(Math.max(...allDates));
      
      // Agregar un margen de una semana antes y después
      const marginDays = 7;
      const startDate = new Date(minDate);
      startDate.setDate(startDate.getDate() - marginDays);
      
      const endDate = new Date(maxDate);
      endDate.setDate(endDate.getDate() + marginDays);
      
      // Ajustar al inicio de la semana para la fecha de inicio
      const startOfWeek = new Date(startDate);
      const dayOfWeek = startOfWeek.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
      
      // Ajustar al final de la semana para la fecha de fin
      const endOfWeek = new Date(endDate);
      const endDayOfWeek = endOfWeek.getDay();
      const daysToSunday = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
      endOfWeek.setDate(endOfWeek.getDate() + daysToSunday);
      
      setViewStartDate(startOfWeek);
      setViewEndDate(endOfWeek);
    }
  };

  const loadRecentTasks = (tasksData) => {
    console.log('Gantt - Cargando tareas recientes de:', tasksData.length, 'tareas');
    
    const recent = tasksData
      .filter(task => task.status !== 'Completada')
      .sort((a, b) => {
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

  const getTaskType = (priority, status) => {
    if (status === 'Completada') return 'Completada';
    if (priority === 'Alta') return 'Alta';
    if (priority === 'Media') return 'Media';
    if (priority === 'Baja') return 'Baja';
    return 'Normal';
  };

  const getTaskColor = (priority, status) => {
    if (status === 'Completada') return '#4CAF50';
    if (priority === 'Alta') return '#F44336';
    if (priority === 'Media') return '#FF9800';
    if (priority === 'Baja') return '#2196F3';
    return '#9E9E9E';
  };

  const getTaskIcon = (priority, status) => {
    if (status === 'Completada') return <CheckCircle />;
    if (priority === 'Alta') return <Warning />;
    if (priority === 'Media') return <Flag />;
    if (priority === 'Baja') return <Schedule />;
    return <Assignment />;
  };

  const isCurrentWeek = (start, end) => {
    const now = new Date();
    return now >= start && now <= end;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada': return '#4CAF50';
      case 'En Progreso': return '#2196F3';
      case 'Pendiente': return '#FF9800';
      case 'Bloqueada': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getTaskGradient = (status, priority) => {
    if (status === 'Completada') {
      return 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)';
    } else if (status === 'En Progreso') {
      if (priority === 'Urgente' || priority === 'Crítica') {
        return 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)';
      } else if (priority === 'Alta') {
        return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
      } else {
        return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
      }
    } else if (status === 'Pendiente') {
      return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
    } else if (status === 'Bloqueada') {
      return 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)';
    } else {
      return 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return '#F44336';
      case 'Media': return '#FF9800';
      case 'Baja': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditingTask(task);
    setOpenTaskDialog(true);
  };

  const handleTaskSave = (taskData) => {
    if (editingTask) {
      dataService.update('tasks', editingTask.id, taskData);
    } else {
      dataService.create('tasks', taskData);
    }
    loadData();
    setOpenTaskDialog(false);
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId) => {
    dataService.delete('tasks', taskId);
    loadData();
    setOpenTaskDialog(false);
    setEditingTask(null);
  };

  const handleMouseEnter = (event, task) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setTooltipContent({
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      progress: task.progress || 0,
      assignedUsers: task.assigned_users || []
    });
    setTooltipOpen(true);
  };

  const handleMouseLeave = () => {
    setTooltipOpen(false);
  };

  const renderTimelineHeader = () => {
    const weeks = [];
    const startDate = new Date(viewStartDate);
    const endDate = new Date(viewEndDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const weekStart = new Date(d);
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        start: new Date(weekStart),
        end: new Date(weekEnd),
        label: `Semana ${weeks.length + 1}`
      });
    }

    return (
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderBottom: '2px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Grid container spacing={0}>
          <Grid item xs={3}>
            <Box sx={{ 
              p: 2, 
              borderRight: '2px solid #e0e0e0',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                right: '-1px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '2px',
                height: '30px',
                background: 'linear-gradient(180deg, #3498db 0%, #2980b9 100%)',
                borderRadius: '1px'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#2c3e50',
                  fontSize: '16px'
                }}>
                  Proyectos
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box sx={{ 
              display: 'flex',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              {weeks.map((week, index) => {
                const isCurrentWeekFlag = isCurrentWeek(week.start, week.end);
                
                return (
                  <Box key={index} sx={{ 
                    flex: 1, 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRight: '1px solid #e0e0e0',
                    position: 'relative',
                    background: isCurrentWeekFlag 
                      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: isCurrentWeekFlag 
                        ? 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)'
                        : 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)'
                    }
                  }}>
                    {/* Indicador de semana actual */}
                    {isCurrentWeekFlag && (
                      <Box sx={{
                        position: 'absolute',
                        top: '4px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        animation: 'pulse 2s infinite'
                      }} />
                    )}
                    
                    <Typography variant="body2" sx={{ 
                      fontWeight: 700, 
                      color: isCurrentWeekFlag ? '#1976d2' : '#666',
                      fontSize: '13px',
                      mb: 0.5
                    }}>
                      {week.label}
                    </Typography>
                    
                    <Typography variant="caption" sx={{ 
                      color: isCurrentWeekFlag ? '#1976d2' : '#888',
                      fontSize: '10px',
                      fontWeight: 500
                    }}>
                      {week.start.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - 
                      {week.end.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                    </Typography>
                    
                    {/* Indicador de progreso de la semana */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      height: '3px',
                      background: isCurrentWeekFlag 
                        ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                        : 'linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 100%)',
                      borderRadius: '0 0 4px 4px'
                    }} />
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderTaskRow = (task) => {
    // Validar fechas de manera más robusta
    const startDate = task.start_date ? new Date(task.start_date) : new Date(task.created_at);
    const endDate = task.due_date ? new Date(task.due_date) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Asegurar que las fechas sean válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Fechas inválidas para tarea:', task.title);
      return null;
    }

    const today = new Date();
    
    const getTaskPosition = () => {
      const totalDays = Math.ceil((viewEndDate - viewStartDate) / (1000 * 60 * 60 * 24));
      const taskStartDays = Math.ceil((startDate - viewStartDate) / (1000 * 60 * 60 * 24));
      const taskDurationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Asegurar valores válidos
      const leftPercent = Math.max(0, Math.min(100, (taskStartDays / totalDays) * 100));
      const widthPercent = Math.max(5, Math.min(100, (taskDurationDays / totalDays) * 100));
      
      return { left: leftPercent, width: widthPercent };
    };

    const position = getTaskPosition();
    const isOverdue = endDate < today && task.status !== 'Completada';
    const progress = task.progress || 0;

    return (
      <Box key={task.id} sx={{ 
        position: 'relative', 
        height: 60, 
        borderBottom: '1px solid #e8e9ea',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        transition: 'all 0.2s ease',
        '&:hover': { 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }
      }}>
        <Grid container spacing={0}>
          <Grid item xs={3}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              borderRight: '2px solid #e8e9ea',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              position: 'relative',
              height: '100%'
            }}>
              {/* Indicador de color del estado */}
              <Box sx={{
                position: 'absolute',
                left: '0',
                top: '0',
                bottom: '0',
                width: '4px',
                background: `linear-gradient(180deg, ${getStatusColor(task.status)} 0%, ${getStatusColor(task.status)}80 100%)`
              }} />
              
              {/* Indicador de estado mejorado */}
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${getStatusColor(task.status)} 0%, ${getStatusColor(task.status)}CC 100%)`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }} />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  color: '#2c3e50',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  mb: 0.5
                }}>
                  {task.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={task.status} 
                    size="small" 
                    sx={{ 
                      height: '20px',
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: `${getStatusColor(task.status)}20`,
                      color: getStatusColor(task.status),
                      border: `1px solid ${getStatusColor(task.status)}40`
                    }} 
                  />
                  <Chip 
                    label={task.priority} 
                    size="small" 
                    sx={{ 
                      height: '20px',
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: `${getPriorityColor(task.priority)}20`,
                      color: getPriorityColor(task.priority),
                      border: `1px solid ${getPriorityColor(task.priority)}40`
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box sx={{ 
              position: 'relative', 
              height: '100%', 
              p: 1,
              borderRight: '1px solid #e0e0e0',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              display: 'flex',
              alignItems: 'center'
            }}>
              {/* Líneas de guía verticales */}
              {Array.from({ length: 7 }, (_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    left: `${(i * 100) / 7}%`,
                    top: '0',
                    bottom: '0',
                    width: '1px',
                    background: 'linear-gradient(180deg, transparent 0%, #e0e0e0 20%, #e0e0e0 80%, transparent 100%)',
                    opacity: 0.5
                  }}
                />
              ))}
              <Tooltip 
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Estado: {task.status}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Prioridad: {task.priority}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Progreso: {progress}%
                    </Typography>
                    <Typography variant="body2">
                      Vencimiento: {new Date(task.due_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Box
                  onMouseEnter={(e) => handleMouseEnter(e, task)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleTaskClick(task)}
                  sx={{
                    position: 'absolute',
                    left: `${position.left}%`,
                    width: `${position.width}%`,
                    height: 36,
                    background: getTaskGradient(task.status, task.priority),
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                      zIndex: 10
                    }
                  }}
                >
                  {/* Barra de progreso interna */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${progress}%`,
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '8px 0 0 8px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                  
                  {/* Contenido de la barra */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%',
                    zIndex: 1
                  }}>
                    {/* Icono de estado */}
                    <Box sx={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: getStatusColor(task.status)
                    }}>
                      {task.status === 'Completada' ? '✓' : 
                       task.priority === 'Urgente' || task.priority === 'Crítica' ? '!' :
                       task.is_milestone ? 'M' : '●'}
                    </Box>
                    
                    {/* Nombre de la tarea */}
                    <Typography
                      sx={{
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        mx: 1
                      }}
                    >
                      {task.title}
                    </Typography>
                    
                    {/* Porcentaje de progreso */}
                    <Typography
                      sx={{
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        minWidth: '28px',
                        textAlign: 'right'
                      }}
                    >
                      {progress}%
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
              
              {/* Barra de progreso mejorada */}
              {progress > 0 && (
                <Box sx={{
                  position: 'absolute',
                  left: `${position.left}%`,
                  width: `${position.width}%`,
                  bottom: 2,
                  height: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: 1.5
                }}>
                  <Box sx={{
                    width: `${progress}%`,
                    height: '100%',
                    bgcolor: 'white',
                    borderRadius: 1.5,
                    transition: 'width 0.3s ease'
                  }} />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderTodayLine = () => {
    const today = new Date();
    const totalDays = Math.ceil((viewEndDate - viewStartDate) / (1000 * 60 * 60 * 24));
    const todayDays = Math.ceil((today - viewStartDate) / (1000 * 60 * 60 * 24));
    const todayPercent = Math.max(0, Math.min(100, (todayDays / totalDays) * 100));
    
    if (todayPercent < 0 || todayPercent > 100) return null;

    return (
      <Box sx={{
        position: 'absolute',
        left: `${todayPercent}%`,
        top: 0,
        bottom: 0,
        width: 2,
        bgcolor: '#F44336',
        zIndex: 5,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -4,
          left: -4,
          width: 10,
          height: 10,
          bgcolor: '#F44336',
          borderRadius: '50%'
        }
      }} />
    );
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      bgcolor: '#f8f9fa',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '& @keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
          opacity: 1
        },
        '50%': {
          transform: 'scale(1.1)',
          opacity: 0.7
        },
        '100%': {
          transform: 'scale(1)',
          opacity: 1
        }
      }
    }}>
      {/* Sidebar */}
      <Fade in={!sidebarCollapsed} timeout={300}>
        <Paper sx={{ 
          width: sidebarCollapsed ? 0 : 320, 
          minWidth: sidebarCollapsed ? 0 : 320,
          height: '100%',
          borderRadius: 0,
          borderRight: '1px solid #e0e0e0',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e0e0e0',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: '#333',
                fontFamily: 'Inter, sans-serif'
              }}>
                Proyecto Tasks
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                sx={{ color: '#666' }}
              >
                <ChevronLeft />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label="Onboard" 
                size="small" 
                sx={{ 
                  bgcolor: '#e3f2fd', 
                  color: '#1976d2',
                  fontWeight: 500
                }} 
              />
              <Chip 
                icon={<CalendarMonth />}
                label="May 2025" 
                size="small" 
                sx={{ 
                  bgcolor: '#f3e5f5', 
                  color: '#7b1fa2',
                  fontWeight: 500
                }} 
              />
            </Box>
          </Box>

          {/* Search */}
          <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              size="small"
              placeholder="Q Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#666', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#f8f9fa'
                }
              }}
            />
          </Box>

          {/* Recent Tasks */}
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#333', 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Assignment sx={{ fontSize: 20 }} />
              Tus tareas recientes
            </Typography>
            
            <Stack spacing={1.5}>
              {recentTasks.map((task) => (
                <Card key={task.id} sx={{ 
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {/* Indicador de estado minimalista */}
                      <Box sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: task.color,
                        flexShrink: 0
                      }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: '#333',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.875rem'
                        }}>
                          {task.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={task.time} 
                            size="small" 
                            sx={{ 
                              height: 18, 
                              fontSize: '0.7rem',
                              bgcolor: task.color + '15',
                              color: task.color,
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1 }
                            }} 
                          />
                          <Chip 
                            label={task.type} 
                            size="small" 
                            sx={{ 
                              height: 18, 
                              fontSize: '0.7rem',
                              bgcolor: '#f5f5f5',
                              color: '#666',
                              '& .MuiChip-label': { px: 1 }
                            }} 
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Fade>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Controls */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 0, 
          borderBottom: '1px solid #e0e0e0',
          bgcolor: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Filtros
              </Button>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En Progreso">En Progreso</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Todas">Todas</MenuItem>
                  <MenuItem value="Alta">Alta</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Baja">Baja</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Proyecto">Proyecto</MenuItem>
                  <MenuItem value="Usuario">Usuario</MenuItem>
                  <MenuItem value="Estado">Estado</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    size="small"
                  />
                }
                label="Completadas"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingTask(null);
                  setOpenTaskDialog(true);
                }}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#1565c0' }
                }}
              >
                Nueva Tarea
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Gantt Chart */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          position: 'relative',
          bgcolor: 'white'
        }} ref={ganttRef}>
          {renderTimelineHeader()}
          
          <Box sx={{ position: 'relative' }}>
            {renderTodayLine()}
            
            {tasks
              .filter(task => {
                if (!showCompleted && task.status === 'Completada') return false;
                if (statusFilter !== 'Todos' && task.status !== statusFilter) return false;
                if (priorityFilter !== 'Todas' && task.priority !== priorityFilter) return false;
                return true;
              })
              .map(renderTaskRow)}
          </Box>
        </Box>
      </Box>

      {/* Tooltip */}
      <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
        <Fade in={tooltipOpen} timeout={200}>
          <Paper
            ref={tooltipRef}
            sx={{
              position: 'fixed',
              left: tooltipPosition.x - 100,
              top: tooltipPosition.y - 80,
              width: 200,
              p: 2,
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 2,
              pointerEvents: 'none'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {tooltipContent.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
              Estado: {tooltipContent.status}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
              Prioridad: {tooltipContent.priority}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
              Progreso: {tooltipContent.progress}%
            </Typography>
            {tooltipContent.dueDate && (
              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                Vence: {new Date(tooltipContent.dueDate).toLocaleDateString('es-ES')}
              </Typography>
            )}
          </Paper>
        </Fade>
      </ClickAwayListener>

      {/* Task Dialog */}
      <GanttTaskDialogNew
        open={openTaskDialog}
        onClose={() => {
          setOpenTaskDialog(false);
          setEditingTask(null);
        }}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        task={editingTask}
        projects={projects}
        users={users}
        projectId={projectId}
      />
    </Box>
  );
};

export default ModernGanttProfessional;
