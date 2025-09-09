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

    // Calcular posición y duración
    const taskDate = new Date(task.due_date);
    const weekStart = new Date(viewStartDate);
    const weekNumber = Math.floor((taskDate - weekStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    // Calcular duración de la tarea (en días)
    const taskDuration = task.duration || 1; // días
    const barWidth = Math.max((taskDuration / 7) * 100, 8); // mínimo 8% de ancho
    
    // Colores basados en estado y prioridad
    const getTaskColors = (status, priority) => {
      if (status === 'Completada') {
        return {
          primary: '#4CAF50',
          secondary: '#2E7D32',
          gradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
        };
      } else if (status === 'En progreso') {
        if (priority === 'Urgente' || priority === 'Crítica') {
          return {
            primary: '#F44336',
            secondary: '#D32F2F',
            gradient: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)'
          };
        } else if (priority === 'Alta') {
          return {
            primary: '#FF9800',
            secondary: '#F57C00',
            gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
          };
        } else {
          return {
            primary: '#2196F3',
            secondary: '#1976D2',
            gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
          };
        }
      } else {
        return {
          primary: '#9E9E9E',
          secondary: '#757575',
          gradient: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)'
        };
      }
    };

    const colors = getTaskColors(task.status, task.priority);
    const progress = task.progress || 0;

    return (
      <Tooltip 
        key={task.id} 
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
          sx={{
            position: 'absolute',
            left: `${Math.max(((weekNumber - 1) * 100) / 7, 0)}%`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: `${barWidth}%`,
            height: '28px',
            background: colors.gradient,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-50%) scale(1.02)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              zIndex: 10
            }
          }}
          onClick={() => handleTaskClick(task)}
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
              borderRadius: '6px 0 0 6px',
              transition: 'width 0.3s ease'
            }}
          />
          
          {/* Contenido de la barra */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%',
            px: 1,
            zIndex: 1
          }}>
            {/* Icono de estado */}
            <Box sx={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: colors.primary
            }}>
              {task.status === 'Completada' ? '✓' : 
               task.priority === 'Urgente' || task.priority === 'Crítica' ? '!' :
               task.is_milestone ? 'M' : '●'}
            </Box>
            
            {/* Nombre de la tarea */}
            <Typography
              sx={{
                color: 'white',
                fontSize: '11px',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                mx: 0.5
              }}
            >
              {task.title}
            </Typography>
            
            {/* Porcentaje de progreso */}
            <Typography
              sx={{
                color: 'white',
                fontSize: '10px',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                minWidth: '24px',
                textAlign: 'right'
              }}
            >
              {progress}%
            </Typography>
          </Box>
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
    
    // Calcular métricas del proyecto
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === 'Completada').length;
    const inProgressTasks = projectTasks.filter(task => task.status === 'En progreso').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return (
      <Box key={project.id} sx={{ 
        display: 'flex', 
        height: '80px', 
        borderBottom: '1px solid #e8e9ea',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }
      }}>
        {/* Project Name Column */}
        <Box sx={{ 
          width: '200px', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 20px',
          borderRight: '2px solid #e8e9ea',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative'
        }}>
          {/* Indicador de color del proyecto */}
          <Box sx={{
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            width: '4px',
            background: `linear-gradient(180deg, ${projectColor} 0%, ${projectColor}80 100%)`
          }} />
          
          {/* Nombre del proyecto */}
          <Typography sx={{ 
            fontWeight: 600, 
            fontSize: '14px',
            color: '#2c3e50',
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: projectColor
            }} />
            {project.name}
          </Typography>
          
          {/* Métricas del proyecto */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography sx={{ 
              fontSize: '11px', 
              color: '#666',
              fontWeight: 500
            }}>
              {completedTasks}/{totalTasks} tareas
            </Typography>
            <Typography sx={{ 
              fontSize: '11px', 
              color: progressPercentage === 100 ? '#4caf50' : '#ff9800',
              fontWeight: 600
            }}>
              {progressPercentage}%
            </Typography>
          </Box>
          
          {/* Barra de progreso del proyecto */}
          <Box sx={{
            width: '100%',
            height: '4px',
            background: '#e0e0e0',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <Box sx={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${projectColor} 0%, ${projectColor}80 100%)`,
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }} />
          </Box>
        </Box>

        {/* Timeline Column */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          display: 'flex',
          alignItems: 'center',
          padding: '8px 0'
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
          
          {/* Tareas del proyecto */}
          {projectTasks.map(task => renderTaskBar(task, projectColor))}
          
          {/* Indicador de estado general del proyecto */}
          <Box sx={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            {inProgressTasks > 0 && (
              <Box sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                animation: 'pulse 2s infinite'
              }} />
            )}
            {completedTasks === totalTasks && totalTasks > 0 && (
              <Box sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
              }} />
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderTimelineHeader = () => {
    const totalDays = Math.ceil((viewEndDate - viewStartDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(totalDays / 7);
    
    // Generar fechas para cada semana
    const generateWeekDates = (weekIndex) => {
      const startDate = new Date(viewStartDate);
      startDate.setDate(startDate.getDate() + (weekIndex * 7));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      return {
        start: startDate,
        end: endDate,
        isCurrentWeek: isCurrentWeek(startDate, endDate)
      };
    };

    const isCurrentWeek = (start, end) => {
      const now = new Date();
      return now >= start && now <= end;
    };

    return (
      <Box sx={{ 
        display: 'flex', 
        height: '60px',
        borderBottom: '2px solid #e0e0e0',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative'
      }}>
        {/* Nombre de proyecto */}
        <Box sx={{ 
          width: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 20px',
          borderRight: '2px solid #e0e0e0',
          fontWeight: 700,
          color: '#2c3e50',
          fontSize: '14px',
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
            <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
              Proyectos
            </Typography>
          </Box>
        </Box>

        {/* Timeline con semanas */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}>
          {Array.from({ length: Math.min(7, weeks) }, (_, i) => {
            const weekData = generateWeekDates(i);
            const isCurrent = weekData.isCurrentWeek;
            
            return (
              <Box 
                key={i} 
                sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRight: i < 6 ? '1px solid #e0e0e0' : 'none',
                  position: 'relative',
                  minWidth: '120px',
                  background: isCurrent 
                    ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isCurrent 
                      ? 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)'
                      : 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)'
                  }
                }}
              >
                {/* Indicador de semana actual */}
                {isCurrent && (
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
                
                {/* Número de semana */}
                <Typography sx={{ 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: isCurrent ? '#1976d2' : '#666',
                  mb: 0.5
                }}>
                  Semana {i + 1}
                </Typography>
                
                {/* Fechas */}
                <Typography sx={{ 
                  fontSize: '10px', 
                  fontWeight: 500, 
                  color: isCurrent ? '#1976d2' : '#888',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}>
                  {weekData.start.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - 
                  {weekData.end.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                </Typography>
                
                {/* Indicador de progreso de la semana */}
                <Box sx={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '3px',
                  background: isCurrent 
                    ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                    : 'linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 100%)',
                  borderRadius: '0 0 4px 4px'
                }} />
              </Box>
            );
          })}
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
    <Box sx={{ 
      display: 'flex', 
      height: '100%', 
      backgroundColor: '#f8f9fa',
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
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '3px',
              background: 'linear-gradient(90deg, #3498db 0%, #2980b9 50%, #3498db 100%)',
              borderRadius: '12px 12px 0 0'
            }
          }}>
            {/* Navegación de fechas */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                size="small" 
                onClick={handlePreviousMonth}
                sx={{ 
                  color: '#666',
                  backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  border: '1px solid rgba(52, 152, 219, 0.2)',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  '&:hover': { 
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    transform: 'translateX(-2px)',
                    boxShadow: '0 4px 8px rgba(52, 152, 219, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ChevronLeft />
              </IconButton>
              
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1,
                backgroundColor: 'rgba(52, 152, 219, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(52, 152, 219, 0.1)'
              }}>
                <CalendarToday sx={{ color: '#3498db', fontSize: '20px' }} />
                <Typography sx={{ 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  color: '#2c3e50',
                  minWidth: '200px',
                  textAlign: 'center'
                }}>
                  {getMonthName(displayMonth)} de {displayYear}
                </Typography>
              </Box>
              
              <IconButton 
                size="small" 
                onClick={handleNextMonth}
                sx={{ 
                  color: '#666',
                  backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  border: '1px solid rgba(52, 152, 219, 0.2)',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  '&:hover': { 
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    transform: 'translateX(2px)',
                    boxShadow: '0 4px 8px rgba(52, 152, 219, 0.3)'
                  },
                  transition: 'all 0.2s ease'
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
                  color: '#666',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: '6px',
                  px: 2,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)'
                  },
                  transition: 'all 0.2s ease'
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
                  color: '#666',
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  border: '1px solid rgba(156, 39, 176, 0.2)',
                  borderRadius: '6px',
                  px: 2,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(156, 39, 176, 0.2)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 4px rgba(156, 39, 176, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Centrar
              </Button>
              
              {/* Switches con diseño mejorado */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showDependencies}
                      onChange={(e) => setShowDependencies(e.target.checked)}
                      size="small"
                      sx={{ 
                        '& .MuiSwitch-thumb': { 
                          width: 16, 
                          height: 16,
                          backgroundColor: showDependencies ? '#4caf50' : '#f5f5f5'
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: showDependencies ? '#81c784' : '#e0e0e0'
                        }
                      }}
                    />
                  }
                  label="Dependencias"
                  sx={{ 
                    fontSize: '12px',
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#666'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMilestones}
                      onChange={(e) => setShowMilestones(e.target.checked)}
                      size="small"
                      sx={{ 
                        '& .MuiSwitch-thumb': { 
                          width: 16, 
                          height: 16,
                          backgroundColor: showMilestones ? '#ff9800' : '#f5f5f5'
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: showMilestones ? '#ffb74d' : '#e0e0e0'
                        }
                      }}
                    />
                  }
                  label="Hitos"
                  sx={{ 
                    fontSize: '12px',
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#666'
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Toolbar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            flexWrap: 'wrap',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            borderRadius: '10px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'linear-gradient(90deg, #3498db 0%, #2980b9 50%, #3498db 100%)',
              borderRadius: '12px 12px 0 0'
            }
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