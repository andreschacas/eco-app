import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FormControlLabel
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
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import GanttTaskDialog from './GanttTaskDialog';

const GanttChartNew = ({ projectId = null, filterByRole = true }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 9));
  const [zoomLevel, setZoomLevel] = useState('days');
  const [viewMode, setViewMode] = useState('timeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [groupBy, setGroupBy] = useState('project');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const ganttRef = useRef(null);
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [viewEndDate, setViewEndDate] = useState(new Date());

  // Colores por estado
  const statusColors = {
    'Pendiente': '#ff9800',
    'En progreso': '#2196f3',
    'Completada': '#4caf50',
    'Cancelada': '#f44336'
  };

  // Colores por prioridad
  const priorityColors = {
    'Baja': '#4caf50',
    'Media': '#ff9800',
    'Alta': '#f44336',
    'Crítica': '#9c27b0'
  };

  useEffect(() => {
    loadData();
    calculateViewDates();
  }, [projectId, filterByRole, user]);

  useEffect(() => {
    calculateViewDates();
  }, [currentDate, zoomLevel]);

  const loadData = useCallback(() => {
    try {
      let allTasks = dataService.getAll('tasks');
      let allProjects = dataService.getAll('projects');
      let allUsers = dataService.getAll('users');

      // Filtrar por proyecto si se especifica
      if (projectId) {
        allTasks = allTasks.filter(task => task.project_id === projectId);
      }

      // Filtrar por rol si es necesario
      if (filterByRole && user) {
        switch (user.role) {
          case 'Administrador':
            // Administrador ve TODAS las tareas
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

      // Enriquecer tareas con datos de usuarios y proyectos
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
    return date.getDate().toString();
  };

  const getTaskBarPosition = (task) => {
    const dates = getDateRange();
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    const startIndex = dates.findIndex(d => 
      d.toDateString() === taskStart.toDateString()
    );
    const endIndex = dates.findIndex(d => 
      d.toDateString() === taskEnd.toDateString()
    );

    if (startIndex === -1 || endIndex === -1) {
      return { left: '0%', width: '0%' };
    }

    const left = (startIndex / dates.length) * 100;
    const width = ((endIndex - startIndex + 1) / dates.length) * 100;

    return { left: `${left}%`, width: `${width}%` };
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
        // Actualizar tarea existente
        dataService.update('tasks', editingTask.id, taskData);
      } else {
        // Crear nueva tarea
        const newTask = {
          ...taskData,
          id: Date.now(), // ID temporal
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
    : { 'Todas las tareas': sortedTasks };

  const renderHeader = () => (
    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#333' }}>
            Diagrama de Gantt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vista de cronograma del proyecto
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
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

      {/* Controles de vista */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setViewMode('list')}
            sx={{ 
              bgcolor: viewMode === 'list' ? '#e3f2fd' : 'transparent',
              color: viewMode === 'list' ? '#1976d2' : '#666'
            }}
          >
            <ViewList />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setViewMode('board')}
            sx={{ 
              bgcolor: viewMode === 'board' ? '#e3f2fd' : 'transparent',
              color: viewMode === 'board' ? '#1976d2' : '#666'
            }}
          >
            <ViewModule />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setViewMode('calendar')}
            sx={{ 
              bgcolor: viewMode === 'calendar' ? '#e3f2fd' : 'transparent',
              color: viewMode === 'calendar' ? '#1976d2' : '#666'
            }}
          >
            <CalendarToday />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setViewMode('timeline')}
            sx={{ 
              bgcolor: viewMode === 'timeline' ? '#e3f2fd' : 'transparent',
              color: viewMode === 'timeline' ? '#1976d2' : '#666'
            }}
          >
            <Timeline />
          </IconButton>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Búsqueda */}
        <TextField
          size="small"
          placeholder="Buscar tareas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        {/* Filtros */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterStatus}
            label="Estado"
            onChange={(e) => setFilterStatus(e.target.value)}
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
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="Crítica">Crítica</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Media">Media</MenuItem>
            <MenuItem value="Baja">Baja</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Ordenar</InputLabel>
          <Select
            value={sortBy}
            label="Ordenar"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="due_date">Fecha</MenuItem>
            <MenuItem value="priority">Prioridad</MenuItem>
            <MenuItem value="status">Estado</MenuItem>
            <MenuItem value="title">Título</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Controles de timeline */}
      {viewMode === 'timeline' && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

            <FormControlLabel
              control={
                <Switch
                  checked={showDependencies}
                  onChange={(e) => setShowDependencies(e.target.checked)}
                  size="small"
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
                />
              }
              label="Hitos"
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderTaskList = () => (
    <Box sx={{ width: 350, borderRight: '1px solid #e0e0e0', bgcolor: '#fff' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
          Tareas del Proyecto
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {tasks.length} tareas • {tasks.filter(t => t.status === 'Completada').length} completadas
        </Typography>
      </Box>

      <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <Box key={groupName} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ p: 2, bgcolor: '#f5f5f5', fontWeight: 600, color: '#666' }}>
              {groupName} ({groupTasks.length})
            </Typography>
            {groupTasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  p: 2,
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: '#f8f9fa'
                  },
                  bgcolor: selectedTask?.id === task.id ? '#e3f2fd' : 'transparent'
                }}
                onClick={() => setSelectedTask(task)}
                onDoubleClick={() => handleEditTask(task)}
              >
                {/* Indicador de estado */}
                <Box
                  sx={{
                    width: 4,
                    height: '100%',
                    bgcolor: statusColors[task.status] || '#757575',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    borderRadius: '0 2px 2px 0'
                  }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DragIndicator sx={{ color: '#999', fontSize: 16 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#333',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      bgcolor: priorityColors[task.priority] || '#757575',
                      color: '#fff',
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Schedule sx={{ fontSize: 14, color: '#666' }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(task.due_date).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progreso
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {Math.round(task.progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: statusColors[task.status] || '#2196f3',
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {task.assignedUsers.slice(0, 3).map((user, idx) => (
                    <Tooltip key={idx} title={user.name}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: 11,
                          bgcolor: priorityColors[task.priority] || '#2196f3',
                          border: '2px solid #fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {task.assignedUsers.length > 3 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, ml: 0.5 }}>
                      +{task.assignedUsers.length - 3}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderTimeline = () => {
    const dates = getDateRange();
    
    return (
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Header del timeline */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0', bgcolor: '#fff' }}>
            {dates.map((date, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: 60,
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
        <Box sx={{ height: 'calc(100vh - 400px)', overflow: 'auto', position: 'relative', bgcolor: '#fff' }}>
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
          
          {/* Barras de tareas */}
          {sortedTasks.map((task, index) => {
            const position = getTaskBarPosition(task);
            const barColor = statusColors[task.status] || '#2196f3';
              
            return (
              <Box
                key={task.id}
                sx={{
                  position: 'absolute',
                  top: index * 60 + 10,
                  left: position.left,
                  width: position.width,
                  height: 40,
                  bgcolor: barColor,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.1)',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'center',
                  px: 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
                draggable
                onDragStart={(e) => {
                  setDraggedTask(task);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDragOffset({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                  });
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
                {/* Progreso dentro de la barra */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${task.progress}%`,
                    bgcolor: 'rgba(0,0,0,0.2)',
                    borderRadius: '2px 0 0 2px'
                  }}
                />
                
                {/* Avatares de usuarios */}
                <Box sx={{ display: 'flex', gap: 0.5, zIndex: 1 }}>
                  {task.assignedUsers.slice(0, 2).map((user, idx) => (
                    <Avatar
                      key={idx}
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: 10,
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
                    fontSize: 11,
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
        </Box>
      </Box>
    );
  };

  const renderListView = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {sortedTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
              onClick={() => setSelectedTask(task)}
              onDoubleClick={() => handleEditTask(task)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      bgcolor: statusColors[task.status] || '#757575',
                      borderRadius: 1
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    {task.title}
                  </Typography>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      bgcolor: priorityColors[task.priority] || '#757575',
                      color: '#fff',
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Schedule sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(task.due_date).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progreso
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {Math.round(task.progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: statusColors[task.status] || '#2196f3',
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {task.assignedUsers.map((user, idx) => (
                    <Tooltip key={idx} title={user.name}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 12,
                          bgcolor: priorityColors[task.priority] || '#2196f3',
                          border: '2px solid #fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                    </Tooltip>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Paper sx={{ height: '85vh', borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      {renderHeader()}
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {viewMode === 'timeline' && renderTaskList()}
        {viewMode === 'timeline' ? renderTimeline() : renderListView()}
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

export default GanttChartNew;
