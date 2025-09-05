import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Collapse,
  Fade,
  Zoom,
  Badge,
  Menu,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  ViewList,
  ViewModule,
  CalendarToday,
  Timeline,
  ChevronLeft,
  ChevronRight,
  MoreVert,
  Person,
  Schedule,
  Flag,
  Link,
  DragIndicator,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  ExpandMore,
  ExpandLess,
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
  Notifications,
  NotificationsOff,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Circle,
  FiberManualRecord,
  ZoomIn,
  ZoomOut,
  NavigateBefore,
  NavigateNext,
  Today,
  CenterFocusStrong
} from '@mui/icons-material';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import GanttTaskDialog from './GanttTaskDialog';

const ModernGantt = ({ projectId = null, filterByRole = true }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel] = useState('days'); // Solo vista días
  const [viewMode, setViewMode] = useState('timeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [groupBy, setGroupBy] = useState('project');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [notifications, setNotifications] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [autoCenterEnabled, setAutoCenterEnabled] = useState(true);

  const ganttRef = useRef(null);
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [viewEndDate, setViewEndDate] = useState(new Date());

  // Sistema de colores mejorado con mejor contraste
  const statusColors = {
    'Pendiente': {
      primary: '#FFA726',      // Naranja más vibrante
      light: '#FFF3E0',
      dark: '#F57C00',
      background: '#FFF8E1',   // Fondo más claro
      text: '#E65100',         // Texto más oscuro
      icon: <RadioButtonUnchecked />
    },
    'En progreso': {
      primary: '#42A5F5',      // Azul más vibrante
      light: '#E3F2FD',
      dark: '#1976D2',
      background: '#E1F5FE',   // Fondo más claro
      text: '#0D47A1',         // Texto más oscuro
      icon: <PlayCircle />
    },
    'Completada': {
      primary: '#66BB6A',      // Verde más vibrante
      light: '#E8F5E8',
      dark: '#388E3C',
      background: '#E8F5E8',   // Fondo más claro
      text: '#1B5E20',         // Texto más oscuro
      icon: <CheckCircle />
    },
    'Cancelada': {
      primary: '#EF5350',      // Rojo más vibrante
      light: '#FFEBEE',
      dark: '#D32F2F',
      background: '#FFEBEE',   // Fondo más claro
      text: '#B71C1C',         // Texto más oscuro
      icon: <Cancel />
    }
  };

  const priorityColors = {
    'Baja': { 
      color: '#66BB6A', 
      weight: 2,
      background: '#E8F5E8',
      text: '#1B5E20'
    },
    'Media': { 
      color: '#FFA726', 
      weight: 3,
      background: '#FFF8E1',
      text: '#E65100'
    },
    'Alta': { 
      color: '#EF5350', 
      weight: 4,
      background: '#FFEBEE',
      text: '#B71C1C'
    },
    'Crítica': { 
      color: '#AB47BC', 
      weight: 5,
      background: '#F3E5F5',
      text: '#4A148C'
    }
  };

  useEffect(() => {
    loadData();
    calculateViewDates();
  }, [projectId, filterByRole, user]);

  useEffect(() => {
    calculateViewDates();
  }, [currentDate, zoomLevel]);

  // Efecto para ocultar/mostrar sidebar automáticamente según la vista
  useEffect(() => {
    if (viewMode === 'calendar') {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [viewMode]);

  const loadData = useCallback(() => {
    try {
      let allTasks = dataService.getAll('tasks');
      let allProjects = dataService.getAll('projects');
      let allUsers = dataService.getAll('users');

      if (projectId) {
        allTasks = allTasks.filter(task => task.project_id === projectId);
      }

      if (filterByRole && user) {
        switch (user.role) {
          case 'Administrador':
            break;
          case 'Coordinador':
            if (!projectId) {
              const coordinatorProjects = dataService.getProjectsByCoordinator(user.id);
              const projectIds = coordinatorProjects.map(p => p.id);
              allTasks = allTasks.filter(task => projectIds.includes(task.project_id));
            }
            break;
          case 'Participante':
            if (projectId) {
              const userTasks = dataService.getTasksByUser(user.id);
              allTasks = allTasks.filter(task =>
                userTasks.some(userTask => userTask.id === task.id)
              );
            } else {
              allTasks = dataService.getTasksByUser(user.id);
            }
            break;
        }
      }

      const enrichedTasks = allTasks.map(task => {
        const assignedUsers = task.assigned_users.map(userId => 
          allUsers.find(u => u.id === userId)
        ).filter(Boolean);

        const project = allProjects.find(p => p.id === task.project_id);

        return {
          ...task,
          assignedUsers,
          project,
          progress: getTaskProgress(task),
          startDate: new Date(task.due_date),
          endDate: new Date(task.due_date)
        };
      });

      setTasks(enrichedTasks);
      setProjects(allProjects);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [projectId, filterByRole, user]);

  const getTaskProgress = (task) => {
    switch (task.status) {
      case 'Pendiente': return 0;
      case 'En progreso': 
        switch (task.priority) {
          case 'Crítica': return Math.random() * 40 + 60;
          case 'Alta': return Math.random() * 50 + 40;
          case 'Media': return Math.random() * 60 + 20;
          case 'Baja': return Math.random() * 40 + 10;
          default: return Math.random() * 40 + 30;
        }
      case 'Completada': return 100;
      default: return 0;
    }
  };

  const calculateViewDates = () => {
    const today = new Date(currentDate);
    let startDate, endDate;

    // Obtener el rango de fechas de todas las tareas
    const allTaskDates = tasks.map(task => new Date(task.due_date)).filter(date => !isNaN(date));
    const minTaskDate = allTaskDates.length > 0 ? new Date(Math.min(...allTaskDates)) : today;
    const maxTaskDate = allTaskDates.length > 0 ? new Date(Math.max(...allTaskDates)) : today;

    // Sistema de zoom optimizado para reducir desplazamiento horizontal
    if (allTaskDates.length > 0) {
      // Filtrar solo tareas activas (no completadas ni canceladas)
      const activeTasks = tasks.filter(task => 
        task.status !== 'Completada' && task.status !== 'Cancelada'
      );
      
      if (activeTasks.length > 0) {
        const activeTaskDates = activeTasks.map(task => new Date(task.due_date));
        const minActiveDate = new Date(Math.min(...activeTaskDates));
        const maxActiveDate = new Date(Math.max(...activeTaskDates));
        
        // Calcular el rango de tareas activas
        const activeRangeDays = Math.ceil((maxActiveDate - minActiveDate) / (1000 * 60 * 60 * 24));
        
        // Usar un rango más compacto basado en el contenido real
        if (activeRangeDays <= 14) {
          // Si las tareas están en un rango pequeño, mostrar solo ese rango + margen mínimo
          startDate = new Date(minActiveDate);
          startDate.setDate(startDate.getDate() - 2); // Margen mínimo de 2 días
          
          endDate = new Date(maxActiveDate);
          endDate.setDate(endDate.getDate() + 2); // Margen mínimo de 2 días
        } else if (activeRangeDays <= 30) {
          // Si el rango es mediano, usar un margen proporcional
          startDate = new Date(minActiveDate);
          startDate.setDate(startDate.getDate() - 5);
          
          endDate = new Date(maxActiveDate);
          endDate.setDate(endDate.getDate() + 5);
        } else {
          // Si el rango es muy grande, centrar en la fecha actual con límite estricto
          const centerDate = new Date((minActiveDate.getTime() + maxActiveDate.getTime()) / 2);
          startDate = new Date(centerDate);
          startDate.setDate(startDate.getDate() - 15); // Máximo 30 días de vista
          
          endDate = new Date(centerDate);
          endDate.setDate(endDate.getDate() + 15);
        }
      } else {
        // Si no hay tareas activas, mostrar solo 2 semanas centradas en hoy
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 7);
      }
    } else {
      // Si no hay tareas, mostrar solo 2 semanas centradas en la fecha actual
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
    }

    // Límite máximo estricto de días para evitar extensiones excesivas
    const maxDays = 30; // Máximo 1 mes
    const currentRangeDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (currentRangeDays > maxDays) {
      // Si el rango es muy grande, centrar en la fecha actual con límite estricto
      const centerDate = new Date((startDate.getTime() + endDate.getTime()) / 2);
      startDate = new Date(centerDate);
      startDate.setDate(startDate.getDate() - maxDays / 2);
      
      endDate = new Date(centerDate);
      endDate.setDate(endDate.getDate() + maxDays / 2);
    }

    setViewStartDate(startDate);
    setViewEndDate(endDate);
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
    return date.getDate().toString();
  };

  const getTaskBarPosition = (task) => {
    const dates = getDateRange();
    const taskStart = new Date(task.due_date);
    const taskEnd = new Date(task.due_date);
    
    // Ajustar la duración de la tarea según el zoom
    const duration = getTaskDuration(task);
    taskEnd.setDate(taskStart.getDate() + duration);
    
    const startIndex = dates.findIndex(d => 
      d.toDateString() === taskStart.toDateString()
    );
    const endIndex = dates.findIndex(d => 
      d.toDateString() === taskEnd.toDateString()
    );

    if (startIndex === -1 || endIndex === -1) {
      return { left: '0%', width: '0%' };
    }

    // Calcular posición usando porcentajes para alineación correcta
    const totalDays = dates.length;
    const leftPercentage = (startIndex / totalDays) * 100;
    const widthPercentage = Math.max(((endIndex - startIndex + 1) / totalDays) * 100, (1 / totalDays) * 100);

    return { left: `${leftPercentage}%`, width: `${widthPercentage}%` };
  };

  const getTaskDuration = (task) => {
    // Duración de tarea basada en prioridad y zoom optimizada
    const baseDuration = {
      'Baja': 2,
      'Media': 3,
      'Alta': 4,
      'Crítica': 5
    };

    const zoomMultiplier = {
      'days': 1,      // 1 día por unidad base
      'weeks': 0.3,   // 0.3 semanas por unidad base
      'months': 0.1   // 0.1 meses por unidad base
    };

    const calculatedDuration = baseDuration[task.priority] * zoomMultiplier[zoomLevel];
    
    // Asegurar duración mínima y máxima según el zoom
    const minDuration = zoomLevel === 'days' ? 1 : zoomLevel === 'weeks' ? 0.5 : 0.2;
    const maxDuration = zoomLevel === 'days' ? 14 : zoomLevel === 'weeks' ? 8 : 2;
    
    return Math.max(minDuration, Math.min(maxDuration, calculatedDuration));
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

  const handleTaskDrag = (taskId, newStartDate) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          due_date: newStartDate.toISOString().split('T')[0]
        };
        dataService.update('tasks', taskId, updatedTask);
        loadData();
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
        dataService.update('tasks', editingTask.id, taskData);
      } else {
        const newTask = {
          ...taskData,
          id: Date.now(),
          created_at: new Date().toISOString()
        };
        dataService.create('tasks', newTask);
      }
      loadData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = (taskId) => {
    try {
      dataService.delete('tasks', taskId);
      loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleFavorite = (taskId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(taskId)) {
        newFavorites.delete(taskId);
      } else {
        newFavorites.add(taskId);
      }
      return newFavorites;
    });
  };

  const toggleNotification = (taskId) => {
    setNotifications(prev => {
      const newNotifications = new Set(prev);
      if (newNotifications.has(taskId)) {
        newNotifications.delete(taskId);
      } else {
        newNotifications.add(taskId);
      }
      return newNotifications;
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const centerOnTasks = () => {
    const allTaskDates = tasks.map(task => new Date(task.due_date)).filter(date => !isNaN(date));
    
    if (allTaskDates.length > 0) {
      const minTaskDate = new Date(Math.min(...allTaskDates));
      const maxTaskDate = new Date(Math.max(...allTaskDates));
      
      // Centrar en el rango de tareas con margen mínimo
      const centerDate = new Date((minTaskDate.getTime() + maxTaskDate.getTime()) / 2);
      setCurrentDate(centerDate);
      
      // Recalcular fechas de vista
      calculateViewDates();
    } else {
      // Si no hay tareas, centrar en hoy
      setCurrentDate(new Date());
      calculateViewDates();
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    calculateViewDates();
  };



  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesUser = filterUser === 'all' || 
                       task.assignedUsers.some(user => user.id.toString() === filterUser);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesUser;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        return new Date(a.due_date) - new Date(b.due_date);
      case 'priority':
        const priorityOrder = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const groupedTasks = groupBy === 'project' 
    ? sortedTasks.reduce((groups, task) => {
        const projectName = task.project?.name || 'Sin proyecto';
        if (!groups[projectName]) groups[projectName] = [];
        groups[projectName].push(task);
        return groups;
      }, {})
    : groupBy === 'user'
    ? sortedTasks.reduce((groups, task) => {
        task.assignedUsers.forEach(user => {
          if (!groups[user.name]) groups[user.name] = [];
          groups[user.name].push(task);
        });
        return groups;
      }, {})
    : groupBy === 'status'
    ? sortedTasks.reduce((groups, task) => {
        if (!groups[task.status]) groups[task.status] = [];
        groups[task.status].push(task);
        return groups;
      }, {})
    : { 'Todas las tareas': sortedTasks };

  const renderModernHeader = () => (
    <Box sx={{ 
      p: 3, 
      borderBottom: '1px solid #e0e0e0', 
      bgcolor: '#fafafa',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 0.5, 
            color: '#1a1a1a',
            background: 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Diagrama de Gantt
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Gestión profesional de proyectos y cronogramas
          </Typography>
          
          {/* Indicador del rango de fechas actual */}
          <Box sx={{ 
            mt: 1, 
            p: 1, 
            bgcolor: '#e8f5e8', 
            borderRadius: 1, 
            border: '1px solid #2AAC26',
            display: 'inline-block'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#2AAC26', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              <CalendarToday fontSize="small" />
              {viewStartDate.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'short' 
              })} - {viewEndDate.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTask}
            sx={{
              background: 'linear-gradient(135deg, #2AAC26 0%, #1f9a1f 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #1f9a1f 0%, #1a8a1a 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(42, 172, 38, 0.3)'
              },
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              transition: 'all 0.3s ease'
            }}
          >
            Nueva Tarea
          </Button>
        </Box>
      </Box>

      {/* Controles de vista modernos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, bgcolor: '#fff', borderRadius: 2, p: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {[
            { mode: 'list', icon: <ViewList />, label: 'Lista' },
            { mode: 'board', icon: <ViewModule />, label: 'Tablero' },
            { mode: 'calendar', icon: <CalendarToday />, label: 'Calendario' },
            { mode: 'timeline', icon: <Timeline />, label: 'Timeline' }
          ].map(({ mode, icon, label }) => (
            <Tooltip key={mode} title={label}>
              <IconButton
                size="small"
                onClick={() => setViewMode(mode)}
                sx={{ 
                  bgcolor: viewMode === mode ? '#2AAC26' : 'transparent',
                  color: viewMode === mode ? '#fff' : '#666',
                  '&:hover': {
                    bgcolor: viewMode === mode ? '#1f9a1f' : '#f5f5f5'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Búsqueda moderna */}
        <TextField
          size="small"
          placeholder="Buscar tareas, proyectos o usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#fff',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }
            }
          }}
        />

        {/* Filtros rápidos */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterStatus}
            label="Estado"
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ borderRadius: 2, bgcolor: '#fff' }}
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
            label="Prioridad"
            onChange={(e) => setFilterPriority(e.target.value)}
            sx={{ borderRadius: 2, bgcolor: '#fff' }}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="Crítica">Crítica</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Media">Media</MenuItem>
            <MenuItem value="Baja">Baja</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Usuario</InputLabel>
          <Select
            value={filterUser}
            label="Usuario"
            onChange={(e) => setFilterUser(e.target.value)}
            sx={{ borderRadius: 2, bgcolor: '#fff' }}
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
            label="Agrupar"
            onChange={(e) => setGroupBy(e.target.value)}
            sx={{ borderRadius: 2, bgcolor: '#fff' }}
          >
            <MenuItem value="project">Proyecto</MenuItem>
            <MenuItem value="user">Usuario</MenuItem>
            <MenuItem value="status">Estado</MenuItem>
            <MenuItem value="none">Sin agrupar</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Controles de timeline */}
      {viewMode === 'timeline' && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: '#fff',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              size="small" 
              onClick={() => handleDateNavigation('prev')}
              sx={{ 
                bgcolor: '#f5f5f5',
                '&:hover': { bgcolor: '#e0e0e0' },
                borderRadius: 2
              }}
            >
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ 
              minWidth: 200, 
              textAlign: 'center', 
              fontWeight: 600, 
              color: '#333' 
            }}>
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => handleDateNavigation('next')}
              sx={{ 
                bgcolor: '#f5f5f5',
                '&:hover': { bgcolor: '#e0e0e0' },
                borderRadius: 2
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Zoom removido - solo vista días */}

            {/* Botones de navegación rápida */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={goToToday}
                startIcon={<Today />}
                sx={{
                  borderColor: '#2AAC26',
                  color: '#2AAC26',
                  '&:hover': {
                    borderColor: '#1f9a1f',
                    bgcolor: '#f0f8f0'
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Hoy
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={centerOnTasks}
                startIcon={<CenterFocusStrong />}
                sx={{
                  borderColor: '#2AAC26',
                  color: '#2AAC26',
                  '&:hover': {
                    borderColor: '#1f9a1f',
                    bgcolor: '#f0f8f0'
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Centrar
              </Button>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={showDependencies}
                  onChange={(e) => setShowDependencies(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#2AAC26',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#2AAC26',
                    },
                  }}
                />
              }
              label="Dependencias"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showMilestones}
                  onChange={(e) => setShowMilestones(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#2AAC26',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#2AAC26',
                    },
                  }}
                />
              }
              label="Hitos"
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderModernTaskList = () => (
    <Box sx={{ 
      width: sidebarCollapsed ? 0 : 380, 
      borderRight: sidebarCollapsed ? 'none' : '1px solid #e0e0e0', 
      bgcolor: '#fafafa',
      height: '100%',
      overflow: 'hidden',
      transition: 'width 0.3s ease',
      opacity: sidebarCollapsed ? 0 : 1
    }}>
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid #e0e0e0', 
        bgcolor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
            Tareas del Proyecto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {tasks.length} tareas • {tasks.filter(t => t.status === 'Completada').length} completadas
          </Typography>
        </Box>
        <IconButton
          onClick={toggleSidebar}
          size="small"
          sx={{
            bgcolor: '#f5f5f5',
            '&:hover': {
              bgcolor: '#e0e0e0'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronLeft />
        </IconButton>
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)', overflowY: 'auto', p: 1 }}>
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <Accordion
            key={groupName}
            expanded={expandedGroups[groupName] !== false}
            onChange={() => toggleGroup(groupName)}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f8f9fa' },
                minHeight: 48
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', flex: 1 }}>
                  {groupName}
                </Typography>
                <Chip
                  label={groupTasks.length}
                  size="small"
                  sx={{
                    bgcolor: '#2AAC26',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, bgcolor: '#fafafa' }}>
              <Collapse in={expandedGroups[groupName] !== false}>
                {groupTasks.map((task) => (
                  <Fade key={task.id} in={true} timeout={300}>
                    <Card
                      sx={{
                        m: 1,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: selectedTask?.id === task.id ? '2px solid #2AAC26' : '1px solid #e0e0e0',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          borderColor: '#2AAC26'
                        }
                      }}
                      onClick={() => setSelectedTask(task)}
                      onDoubleClick={() => handleEditTask(task)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        {/* Header de la tarea mejorado */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 4,
                              height: 40,
                              bgcolor: statusColors[task.status]?.primary || '#757575',
                              borderRadius: 2,
                              mt: 0.5
                            }}
                          />
                          
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 600,
                                  color: '#1a1a1a',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1
                                }}
                              >
                                {task.title}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(task.id);
                                  }}
                                  sx={{ p: 0.5 }}
                                >
                                  {favorites.has(task.id) ? 
                                    <Star sx={{ color: '#ffc107', fontSize: 18 }} /> : 
                                    <StarBorder sx={{ color: '#ccc', fontSize: 18 }} />
                                  }
                                </IconButton>
                                
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNotification(task.id);
                                  }}
                                  sx={{ p: 0.5 }}
                                >
                                  {notifications.has(task.id) ? 
                                    <Notifications sx={{ color: '#2AAC26', fontSize: 18 }} /> : 
                                    <NotificationsOff sx={{ color: '#ccc', fontSize: 18 }} />
                                  }
                                </IconButton>
                              </Box>
                            </Box>
                            
                            {/* Estado y prioridad mejorados */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <Chip
                                icon={statusColors[task.status]?.icon}
                                label={task.status}
                                size="small"
                                sx={{
                                  bgcolor: statusColors[task.status]?.background || '#f5f5f5',
                                  color: statusColors[task.status]?.text || '#666',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24,
                                  border: `1px solid ${statusColors[task.status]?.primary || '#666'}`
                                }}
                              />
                              <Chip
                                label={task.priority}
                                size="small"
                                sx={{
                                  bgcolor: priorityColors[task.priority]?.background || '#757575',
                                  color: priorityColors[task.priority]?.text || '#fff',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24,
                                  border: `1px solid ${priorityColors[task.priority]?.color || '#757575'}`
                                }}
                              />
                            </Box>
                            
                            {/* Fecha mejorada */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <Schedule sx={{ fontSize: 16, color: '#666' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {new Date(task.due_date).toLocaleDateString('es-ES')}
                              </Typography>
                            </Box>
                            
                            {/* Progreso mejorado con mejor contraste */}
                            <Box sx={{ mb: 1.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Progreso
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                  {Math.round(task.progress)}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={task.progress}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: statusColors[task.status]?.primary || '#2196f3',
                                    borderRadius: 4,
                                    background: `linear-gradient(90deg, ${statusColors[task.status]?.primary || '#2196f3'} 0%, ${statusColors[task.status]?.dark || '#1976d2'} 100%)`
                                  }
                                }}
                              />
                            </Box>
                            
                            {/* Usuarios asignados mejorados */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {task.assignedUsers.slice(0, 3).map((user, idx) => (
                                <Tooltip key={idx} title={user.name}>
                                  <Avatar
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      fontSize: 12,
                                      bgcolor: priorityColors[task.priority]?.background || '#2196f3',
                                      color: priorityColors[task.priority]?.text || '#fff',
                                      border: '2px solid #fff',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                      fontWeight: 600
                                    }}
                                  >
                                    {user.name.charAt(0)}
                                  </Avatar>
                                </Tooltip>
                              ))}
                              {task.assignedUsers.length > 3 && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, ml: 0.5, fontWeight: 600 }}>
                                  +{task.assignedUsers.length - 3}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
              </Collapse>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );

  const renderModernTimeline = () => {
    const dates = getDateRange();
    
    return (
      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#fff', position: 'relative' }}>
        {/* Botón para expandir sidebar cuando está colapsado */}
        {sidebarCollapsed && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: 'absolute',
              left: 10,
              top: 20,
              zIndex: 1000,
              bgcolor: '#2AAC26',
              color: '#fff',
              '&:hover': {
                bgcolor: '#1f9a1f',
                transform: 'scale(1.1)'
              },
              boxShadow: '0 4px 12px rgba(42, 172, 38, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <ChevronRight />
          </IconButton>
        )}
        {/* Header del timeline mejorado */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0', 
          bgcolor: '#fafafa',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            borderBottom: '1px solid #e0e0e0', 
            bgcolor: '#fff',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {dates.map((date, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: zoomLevel === 'days' ? 35 : zoomLevel === 'weeks' ? 45 : 60,
                  p: 1,
                  textAlign: 'center',
                  borderRight: '1px solid #f0f0f0',
                  bgcolor: date.toDateString() === new Date().toDateString() ? 
                    'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#f8f9fa'
                  }
                }}
              >
                <Typography variant="caption" sx={{ 
                  fontWeight: 700, 
                  fontSize: 12, 
                  color: '#333',
                  display: 'block'
                }}>
                  {formatDate(date)}
                </Typography>
                <Typography variant="caption" sx={{ 
                  fontSize: 10, 
                  color: '#666',
                  fontWeight: 500
                }}>
                  {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        {/* Área del Gantt mejorada */}
        <Box sx={{ 
          height: 'calc(100vh - 400px)', 
          overflow: 'auto', 
          position: 'relative', 
          bgcolor: '#fff',
          backgroundImage: `
            linear-gradient(90deg, transparent 98%, #f0f0f0 98%),
            linear-gradient(0deg, transparent 98%, #f0f0f0 98%)
          `,
          backgroundSize: zoomLevel === 'days' ? '35px 50px' : zoomLevel === 'weeks' ? '45px 60px' : '60px 80px',
          // Limitar el scroll horizontal para evitar extensiones excesivas
          '&::-webkit-scrollbar': {
            height: 8,
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2AAC26',
            borderRadius: 4,
            '&:hover': {
              background: '#1f9a1f',
            },
          },
          // Asegurar que el contenido no se extienda más allá de lo necesario
          maxWidth: '100%',
          minWidth: 0
        }}>
          {/* Líneas de grid mejoradas */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {dates.map((_, index) => {
              const columnWidth = zoomLevel === 'days' ? 35 : zoomLevel === 'weeks' ? 45 : 60;
              return (
                <Box
                  key={index}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${index * columnWidth}px`,
                    width: '1px',
                    bgcolor: index % 7 === 0 ? '#e0e0e0' : '#f5f5f5'
                  }}
                />
              );
            })}
          </Box>
          
          {/* Barras de tareas mejoradas con mejor contraste */}
          {sortedTasks.map((task, index) => {
            const position = getTaskBarPosition(task);
            const statusColor = statusColors[task.status];
            const priorityColor = priorityColors[task.priority];
              
            return (
              <Tooltip
                key={task.id}
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Estado:</strong> {task.status}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Prioridad:</strong> {task.priority}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Progreso:</strong> {Math.round(task.progress)}%
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Fecha:</strong> {new Date(task.due_date).toLocaleDateString('es-ES')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Responsables:</strong> {task.assignedUsers.map(u => u.name).join(', ')}
                    </Typography>
                    {task.project && (
                      <Typography variant="body2">
                        <strong>Proyecto:</strong> {task.project.name}
                      </Typography>
                    )}
                  </Box>
                }
                arrow
                placement="top"
              >
                <Zoom in={true} timeout={300 + index * 50}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: index * 80 + 20,
                      left: position.left,
                      width: position.width,
                      height: 60,
                      background: `linear-gradient(135deg, ${statusColor.background} 0%, ${statusColor.primary} 100%)`,
                      borderRadius: 12, // Bordes más redondeados
                      border: `2px solid ${statusColor.primary}`,
                      borderLeft: `6px solid ${priorityColor.color}`, // Borde izquierdo más grueso
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.03)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                        zIndex: 10,
                        borderColor: statusColor.dark || statusColor.primary
                      }
                    }}
                    draggable
                    onDragStart={(e) => {
                      setDraggedTask(task);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedTask) {
                        const rect = e.currentTarget.parentElement.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = (x / rect.width) * 100;
                        
                        const totalDays = Math.ceil((viewEndDate - viewStartDate) / (1000 * 60 * 60 * 24));
                        const newDayOffset = Math.round((percentage / 100) * totalDays);
                        const newDate = new Date(viewStartDate);
                        newDate.setDate(newDate.getDate() + newDayOffset);
                        
                        handleTaskDrag(draggedTask.id, newDate);
                        setDraggedTask(null);
                      }
                    }}
                    onDoubleClick={() => handleEditTask(task)}
                  >
                    {/* Progreso dentro de la barra mejorado */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${task.progress}%`,
                        bgcolor: 'rgba(255,255,255,0.4)',
                        borderRadius: '4px 0 0 4px',
                        backdropFilter: 'blur(4px)'
                      }}
                    />
                    
                    {/* Contenido de la barra mejorado */}
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', zIndex: 1, position: 'relative' }}>
                      {/* Título de la tarea */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#fff',
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mr: 1
                        }}
                      >
                        {task.title}
                      </Typography>
                      
                      {/* Avatares de usuarios mejorados */}
                      <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                        {task.assignedUsers.slice(0, 2).map((user, idx) => (
                          <Avatar
                            key={idx}
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: 10,
                              bgcolor: 'rgba(255,255,255,0.9)',
                              color: statusColor.primary,
                              border: '2px solid rgba(255,255,255,0.8)',
                              fontWeight: 700,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                        ))}
                      </Box>
                      
                      {/* Indicador de progreso mejorado */}
                      <Box sx={{ 
                        ml: 1, 
                        color: '#fff', 
                        fontSize: 11, 
                        fontWeight: 700,
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        bgcolor: 'rgba(0,0,0,0.2)',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        backdropFilter: 'blur(4px)'
                      }}>
                        {Math.round(task.progress)}%
                      </Box>
                    </Box>
                  </Box>
                </Zoom>
              </Tooltip>
            );
          })}
        </Box>

        {/* Navegación inferior tipo scrollbar */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid #e0e0e0', 
          bgcolor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>
            Navegación rápida
          </Typography>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => handleDateNavigation('prev')}
              sx={{ 
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f5f5f5' },
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <NavigateBefore />
            </IconButton>
            <Box sx={{ flex: 1, mx: 2 }}>
              <Slider
                value={[0, 100]}
                onChange={(_, newValue) => {
                  // Implementar navegación por slider
                }}
                sx={{
                  '& .MuiSlider-thumb': {
                    bgcolor: '#2AAC26',
                    '&:hover': { bgcolor: '#1f9a1f' }
                  },
                  '& .MuiSlider-track': {
                    bgcolor: '#2AAC26'
                  },
                  '& .MuiSlider-rail': {
                    bgcolor: '#e0e0e0'
                  }
                }}
              />
            </Box>
            <IconButton 
              size="small" 
              onClick={() => handleDateNavigation('next')}
              sx={{ 
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f5f5f5' },
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <NavigateNext />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {viewStartDate.toLocaleDateString('es-ES')} - {viewEndDate.toLocaleDateString('es-ES')}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ 
      height: '85vh', 
      borderRadius: 4, 
      border: '1px solid #e0e0e0', 
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
    }}>
      {renderModernHeader()}
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {viewMode === 'timeline' && !sidebarCollapsed && renderModernTaskList()}
        {viewMode === 'timeline' ? renderModernTimeline() : (
          <Box sx={{ flex: 1, p: 3 }}>
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              Vista de {viewMode} en desarrollo
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialog para crear/editar tareas */}
      <GanttTaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        projects={projects}
        users={users}
      />
    </Paper>
  );
};

export default ModernGantt;
