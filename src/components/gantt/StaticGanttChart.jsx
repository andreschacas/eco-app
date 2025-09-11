import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Input,
  Tooltip,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import eventBus from '../../utils/eventBus';

const GREEN = '#2AAC26';

// Datos de prueba para el diagrama de Gantt
const projectTasks = [
  { 
    id: 1, 
    name: "Instalación de Sensores", 
    startDate: new Date(2025, 8, 1), 
    endDate: new Date(2025, 8, 15), 
    progress: 65,
    status: 'En Progreso',
    color: '#2196f3'
  },
  { 
    id: 2, 
    name: "Análisis de Emisiones CO2", 
    startDate: new Date(2025, 8, 10), 
    endDate: new Date(2025, 8, 25), 
    progress: 30,
    status: 'En Progreso',
    color: '#ff9800'
  },
  { 
    id: 3, 
    name: "Configuración de Software", 
    startDate: new Date(2025, 8, 5), 
    endDate: new Date(2025, 8, 12), 
    progress: 100,
    status: 'Completado',
    color: '#4caf50'
  },
  { 
    id: 4, 
    name: "Pruebas de Calibración", 
    startDate: new Date(2025, 8, 20), 
    endDate: new Date(2025, 8, 30), 
    progress: 0,
    status: 'Pendiente',
    color: '#9e9e9e'
  }
];

const StaticGanttChart = ({ projectId, filterByRole = false, initialDate = null }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date('2025-09-01'));
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [eventReceived, setEventReceived] = useState(false);
  
  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todos');
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  // Fecha de hoy para el cálculo dinámico
  const today = new Date();
  
  // Calcular las 5 semanas basadas en el mes actual
  const weeks = useMemo(() => {
    const weeksArray = [];
    
    // Encontrar el primer lunes del mes
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const firstMonday = new Date(firstDayOfMonth);
    firstMonday.setDate(firstDayOfMonth.getDate() + daysToMonday);
    
    // Generar 5 semanas consecutivas
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(firstMonday);
      weekStart.setDate(firstMonday.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weeksArray.push({
        number: i + 1,
        start: weekStart,
        end: weekEnd,
        label: `Semana ${i + 1}`,
        dateRange: `${weekStart.getDate()} ${weekStart.toLocaleDateString('es-ES', { month: 'short' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('es-ES', { month: 'short' })}`
      });
    }
    
    return weeksArray;
  }, [currentMonth]);

  // Calcular la posición de la línea "Hoy" dinámicamente
  const todayPosition = useMemo(() => {
    const todayDate = new Date();
    const firstWeekStart = weeks[0]?.start;
    const lastWeekEnd = weeks[4]?.end;
    
    if (!firstWeekStart || !lastWeekEnd) return 0;
    
    // Verificar si hoy está dentro del rango de las 5 semanas
    if (todayDate < firstWeekStart || todayDate > lastWeekEnd) {
      return null; // No mostrar línea si hoy está fuera del rango
    }
    
    // Calcular la posición como porcentaje
    const totalDays = Math.ceil((lastWeekEnd - firstWeekStart) / (1000 * 60 * 60 * 24)) + 1;
    const daysFromStart = Math.ceil((todayDate - firstWeekStart) / (1000 * 60 * 60 * 24));
    
    return (daysFromStart / totalDays) * 100;
  }, [weeks]);

  // Verificar si "Hoy" está visible en el mes actual
  const isTodayVisible = useMemo(() => {
    const todayDate = new Date();
    const firstWeekStart = weeks[0]?.start;
    const lastWeekEnd = weeks[4]?.end;
    
    if (!firstWeekStart || !lastWeekEnd) return false;
    
    return todayDate >= firstWeekStart && todayDate <= lastWeekEnd;
  }, [weeks]);

  // Encontrar la semana actual
  const currentWeekIndex = useMemo(() => {
    const todayDate = new Date();
    return weeks.findIndex(week => {
      return todayDate >= week.start && todayDate <= week.end;
    });
  }, [weeks]);

  // Funciones para cambiar el mes
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  useEffect(() => {
    console.log('StaticGanttChart - useEffect triggered:', { user: user?.id, projectId, currentMonth: currentMonth.toISOString().split('T')[0] });
    loadTasks();
  }, [user, projectId, currentMonth]);

  // Actualizar el mes cuando cambie initialDate
  useEffect(() => {
    if (initialDate) {
      console.log('StaticGanttChart - initialDate changed:', initialDate.toISOString().split('T')[0]);
      setCurrentMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    }
  }, [initialDate]);

  // Listener para detectar cambios en las tareas
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Solo recargar si cambió la clave de tareas
      if (e.key === 'eco_tasks') {
        loadTasks();
      }
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar eventos del eventBus
    const handleTaskCreated = (data) => {
      console.log('Gantt - Recibido evento taskCreated:', data);
      setLastUpdate(new Date());
      if (data.projectId === projectId || !projectId) {
        loadTasks();
      }
    };

    const handleTaskUpdated = (data) => {
      console.log('Gantt - Recibido evento taskUpdated:', data);
      console.log('Gantt - Comparando projectId:', { 
        eventProjectId: data.projectId, 
        currentProjectId: projectId, 
        shouldUpdate: data.projectId === projectId || !projectId 
      });
      setLastUpdate(new Date());
      setEventReceived(true);
      setTimeout(() => setEventReceived(false), 2000); // Reset después de 2 segundos
      if (data.projectId === projectId || !projectId) {
        console.log('Gantt - Recargando tareas por evento taskUpdated');
        loadTasks();
      } else {
        console.log('Gantt - Ignorando evento taskUpdated - proyecto diferente');
      }
    };

    const handleTaskDeleted = (data) => {
      console.log('Gantt - Recibido evento taskDeleted:', data);
      setLastUpdate(new Date());
      if (data.projectId === projectId || !projectId) {
        loadTasks();
      }
    };

    // Suscribirse a los eventos
    eventBus.on('taskCreated', handleTaskCreated);
    eventBus.on('taskUpdated', handleTaskUpdated);
    eventBus.on('taskDeleted', handleTaskDeleted);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      eventBus.off('taskCreated', handleTaskCreated);
      eventBus.off('taskUpdated', handleTaskUpdated);
      eventBus.off('taskDeleted', handleTaskDeleted);
    };
  }, [projectId, currentMonth]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      console.log('Gantt - Iniciando carga de tareas con projectId:', projectId);
      
      const allProjects = dataService.getAll('projects');
      
      if (projectId) {
        // Cargar tareas reales del proyecto específico
        const userTasks = dataService.getTasksByProject(projectId);
        
        console.log('Gantt - Cargando tareas para proyecto ID:', projectId);
        console.log('Gantt - Tareas encontradas en dataService:', userTasks);
        console.log('Gantt - Proyectos encontrados:', allProjects);
        
        // Verificar que el proyecto existe
        const currentProject = allProjects.find(p => p.id === parseInt(projectId));
        console.log('Gantt - Proyecto actual:', currentProject);
        
        // Verificar que las tareas pertenecen al proyecto correcto
        const projectTasks = userTasks.filter(task => {
          const taskProjectId = parseInt(task.project_id);
          const currentProjectId = parseInt(projectId);
          const belongsToProject = taskProjectId === currentProjectId;
          console.log('Gantt - Verificando tarea:', task.title, {
            taskProjectId: taskProjectId,
            currentProjectId: currentProjectId,
            belongsToProject,
            taskId: task.id,
            originalTaskProjectId: task.project_id,
            originalCurrentProjectId: projectId
          });
          return belongsToProject;
        });
        
        console.log('Gantt - Resumen de filtrado:', {
          totalTasks: userTasks.length,
          projectTasks: projectTasks.length,
          projectId: projectId
        });
        
        console.log('Gantt - Tareas filtradas por proyecto:', projectTasks);
        
        if (projectTasks && projectTasks.length > 0) {
          const enrichedTasks = projectTasks.map(task => {
            const project = allProjects.find(p => p.id === task.project_id);
            console.log('Gantt - Procesando tarea:', task.title, {
              status: task.status,
              progress: task.progress,
              due_date: task.due_date,
              project: project?.name
            });
            
            // Convertir fechas de string a Date si es necesario
            let startDate, endDate;
            
            // El dataService usa 'due_date' como fecha principal
            if (task.due_date) {
              const dueDate = new Date(task.due_date);
              // Usar due_date como endDate y calcular startDate
              endDate = dueDate;
              startDate = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 días antes
            } else if (task.start_date) {
              startDate = new Date(task.start_date);
              endDate = new Date(task.end_date || task.start_date);
            } else if (task.startDate) {
              startDate = new Date(task.startDate);
              endDate = new Date(task.endDate || task.startDate);
            } else {
              // Fecha por defecto si no existe
              startDate = new Date();
              endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 días
            }
            
            // Calcular progreso basado en el estado
            const calculatedProgress = getProgressByStatus(task.status || 'Pendiente', task.progress);
            const taskStatus = task.status || 'Pendiente';
            
            const enrichedTask = {
              id: task.id,
              name: task.title || task.name || 'Tarea sin nombre',
              startDate: startDate,
              endDate: endDate,
              progress: calculatedProgress,
              status: taskStatus,
              projectName: project?.name || 'Sin proyecto',
              projectColor: project?.color || GREEN,
              color: getTaskColorByStatus(taskStatus, calculatedProgress)
            };
            
            console.log('Gantt - Tarea enriquecida:', enrichedTask.name, {
              status: enrichedTask.status,
              progress: enrichedTask.progress,
              color: enrichedTask.color,
              originalProgress: task.progress,
              calculatedProgress: calculatedProgress
            });
            
            return enrichedTask;
          });
          
          // Filtrar tareas que estén dentro del rango del mes actual
          const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          
          console.log('Gantt - Rango del mes actual:', {
            start: currentMonthStart.toISOString().split('T')[0],
            end: currentMonthEnd.toISOString().split('T')[0]
          });
          
          const filteredTasks = enrichedTasks.filter(task => {
            const isInRange = task.startDate <= currentMonthEnd && task.endDate >= currentMonthStart;
            console.log('Gantt - Tarea filtrada:', task.name, {
              startDate: task.startDate.toISOString().split('T')[0],
              endDate: task.endDate.toISOString().split('T')[0],
              isInRange
            });
            return isInRange;
          });
          
          console.log('Gantt - Tareas cargadas para el proyecto:', projectId);
          console.log('Gantt - Tareas filtradas:', filteredTasks);
          console.log('Gantt - Rango del mes:', {
            start: currentMonthStart.toISOString().split('T')[0],
            end: currentMonthEnd.toISOString().split('T')[0]
          });
          setTasks(filteredTasks);
        } else {
          console.log('Gantt - No hay tareas para el proyecto ID:', projectId);
          setTasks([]);
        }
      } else {
        // Cargar todas las tareas de todos los proyectos
        console.log('Gantt - Cargando todas las tareas de todos los proyectos');
        const allTasks = dataService.getAll('tasks');
        
        console.log('Gantt - Todas las tareas encontradas:', allTasks);
        console.log('Gantt - Todos los proyectos encontrados:', allProjects);
        
        if (allTasks && allTasks.length > 0) {
          const enrichedTasks = allTasks.map(task => {
            const project = allProjects.find(p => p.id === task.project_id);
            console.log('Gantt - Procesando tarea:', task.title, {
              status: task.status,
              progress: task.progress,
              due_date: task.due_date,
              project: project?.name
            });
            
            // Convertir fechas de string a Date si es necesario
            let startDate, endDate;
            
            // El dataService usa 'due_date' como fecha principal
            if (task.due_date) {
              const dueDate = new Date(task.due_date);
              // Usar due_date como endDate y calcular startDate
              endDate = dueDate;
              startDate = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 días antes
            } else if (task.start_date) {
              startDate = new Date(task.start_date);
              endDate = new Date(task.end_date || task.start_date);
            } else if (task.startDate) {
              startDate = new Date(task.startDate);
              endDate = new Date(task.endDate || task.startDate);
            } else {
              // Fecha por defecto si no existe
              startDate = new Date();
              endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 días
            }
            
            // Calcular progreso basado en el estado
            const calculatedProgress = getProgressByStatus(task.status || 'Pendiente', task.progress);
            const taskStatus = task.status || 'Pendiente';
            
            const enrichedTask = {
              id: task.id,
              name: task.title || task.name || 'Tarea sin nombre',
              startDate: startDate,
              endDate: endDate,
              progress: calculatedProgress,
              status: taskStatus,
              projectName: project?.name || 'Sin proyecto',
              projectColor: project?.color || GREEN,
              color: getTaskColorByStatus(taskStatus, calculatedProgress)
            };
            
            console.log('Gantt - Tarea enriquecida:', enrichedTask.name, {
              status: enrichedTask.status,
              progress: enrichedTask.progress,
              color: enrichedTask.color,
              originalProgress: task.progress,
              calculatedProgress: calculatedProgress
            });
            
            return enrichedTask;
          });
          
          // Filtrar tareas que estén dentro del rango del mes actual
          const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          
          console.log('Gantt - Rango del mes actual:', {
            start: currentMonthStart.toISOString().split('T')[0],
            end: currentMonthEnd.toISOString().split('T')[0]
          });
          
          const filteredTasks = enrichedTasks.filter(task => {
            const isInRange = task.startDate <= currentMonthEnd && task.endDate >= currentMonthStart;
            console.log('Gantt - Tarea filtrada:', task.name, {
              startDate: task.startDate.toISOString().split('T')[0],
              endDate: task.endDate.toISOString().split('T')[0],
              isInRange
            });
            return isInRange;
          });
          
          console.log('Gantt - Tareas cargadas para todos los proyectos');
          console.log('Gantt - Tareas filtradas:', filteredTasks);
          console.log('Gantt - Rango del mes:', {
            start: currentMonthStart.toISOString().split('T')[0],
            end: currentMonthEnd.toISOString().split('T')[0]
          });
          setTasks(filteredTasks);
        } else {
          console.log('Gantt - No hay tareas en el sistema');
        setTasks([]);
        }
      }
    } catch (error) {
      console.error('Gantt - Error loading tasks:', error);
      console.error('Gantt - Error details:', {
        projectId,
        errorMessage: error.message,
        errorStack: error.stack
      });
      // Usar datos de prueba como fallback
      setTasks(projectTasks);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el color de la tarea según su estado
  const getTaskColorByStatus = (status, progress) => {
    // Priorizar el progreso sobre el estado
    if (progress === 100) return '#4caf50'; // Verde para completado (100%)
    if (progress > 0) return '#2196f3'; // Azul para en progreso (1-99%)
    
    // Si no hay progreso, usar el estado
    if (status === 'Completada' || status === 'Completado') return '#4caf50'; // Verde para completado
    if (status === 'En progreso' || status === 'En Progreso') return '#ff9800'; // Naranja para en progreso
    if (status === 'Pendiente') return '#9e9e9e'; // Gris para pendiente
    
    return '#9e9e9e'; // Gris por defecto
  };

  // Función para calcular el progreso basado en el estado
  const getProgressByStatus = (status, progress) => {
    // Si ya hay un progreso definido, usarlo
    if (progress !== undefined && progress !== null) {
      return progress;
    }
    
    // Calcular progreso basado en el estado
    switch (status) {
      case 'Completada':
      case 'Completado':
        return 100;
      case 'En progreso':
      case 'En Progreso':
        return 50; // Progreso medio para tareas en progreso
      case 'Pendiente':
        return 0;
      default:
        return 0;
    }
  };

  // Función para calcular la posición y duración de una tarea
  const getTaskPosition = (task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const firstWeekStart = weeks[0]?.start;
    const lastWeekEnd = weeks[4]?.end;
    
    if (!firstWeekStart || !lastWeekEnd) return { left: 0, width: 0, visible: false };
    
    // Verificar si la tarea es visible en el rango de semanas
    const isVisible = taskStart <= lastWeekEnd && taskEnd >= firstWeekStart;
    if (!isVisible) return { left: 0, width: 0, visible: false };
    
    // Calcular posición izquierda
    const totalDays = Math.ceil((lastWeekEnd - firstWeekStart) / (1000 * 60 * 60 * 24)) + 1;
    const daysFromStart = Math.max(0, Math.ceil((taskStart - firstWeekStart) / (1000 * 60 * 60 * 24)));
    const left = (daysFromStart / totalDays) * 100;
    
    // Calcular ancho
    const taskDuration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1;
    const width = (taskDuration / totalDays) * 100;
    
    return { left, width, visible: true };
  };

  // Función para obtener el color de la tarea según su estado
  const getTaskColor = (task) => {
    return getTaskColorByStatus(task.status, task.progress);
  };

  // Función para obtener el progreso de la tarea
  const getTaskProgress = (task) => {
    return getProgressByStatus(task.status, task.progress);
  };

  // Función para filtrar tareas
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(task => {
        const taskStatus = task.status || 'Pendiente';
        switch (statusFilter) {
          case 'pendiente':
            return taskStatus === 'Pendiente';
          case 'en-progreso':
            return taskStatus === 'En progreso' || taskStatus === 'En Progreso';
          case 'completado':
            return taskStatus === 'Completado' || taskStatus === 'Completada';
          default:
            return true;
        }
      });
    }

    // Filtro por prioridad (asumiendo que las tareas tienen una propiedad priority)
    if (priorityFilter !== 'todos') {
      filtered = filtered.filter(task => {
        const taskPriority = task.priority || 'media';
        return taskPriority.toLowerCase() === priorityFilter;
      });
    }

    // Filtro "Hoy" - solo tareas que están en la semana actual
    if (showTodayOnly) {
      const todayDate = new Date();
      filtered = filtered.filter(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        return todayDate >= taskStart && todayDate <= taskEnd;
      });
    }

    return filtered;
  }, [tasks, statusFilter, priorityFilter, showTodayOnly]);

  // Función para navegar a la semana actual
  const goToToday = () => {
    const todayDate = new Date();
    const todayMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    setCurrentMonth(todayMonth);
    setShowTodayOnly(true);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setStatusFilter('todos');
    setPriorityFilter('todos');
    setShowTodayOnly(false);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      p: 2,
      // Keyframes para animaciones
      '@keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
          boxShadow: '0 2px 6px rgba(255, 107, 107, 0.5)'
        },
        '50%': {
          transform: 'scale(1.2)',
          boxShadow: '0 4px 16px rgba(255, 107, 107, 0.7)'
        },
        '100%': {
          transform: 'scale(1)',
          boxShadow: '0 2px 6px rgba(255, 107, 107, 0.5)'
        }
      },
      '@keyframes fadeIn': {
        '0%': {
          opacity: 0,
          transform: 'translateY(-10px)'
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)'
        }
      }
    }}>
      {/* Header con filtros */}
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2
      }}>
        {/* Título y controles principales */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            fontFamily: 'Poppins, sans-serif',
            color: '#333'
          }}>
            📅 Calendario del Proyecto
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={loadTasks}
              size="small"
              sx={{ 
                color: '#666',
                '&:hover': { 
                  color: '#2AAC26',
                  bgcolor: 'rgba(42, 172, 38, 0.1)' 
                }
              }}
            >
              <Refresh />
            </IconButton>
            
            {loading && (
              <Box sx={{
                width: '16px',
                height: '16px',
                border: '2px solid #e0e0e0',
                borderTop: '2px solid #2AAC26',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            )}
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body2" sx={{
                fontFamily: 'Poppins, sans-serif',
                color: '#666',
                fontSize: '0.85rem'
              }}>
                {loading ? 'Cargando...' : `${filteredTasks.length} de ${tasks.length} tareas`}
              </Typography>
              {lastUpdate && (
                <Typography variant="caption" sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: eventReceived ? '#2AAC26' : '#999',
                  fontSize: '0.7rem',
                  fontWeight: eventReceived ? 600 : 400
                }}>
                  {eventReceived ? '🔄 Actualizando...' : `Actualizado: ${lastUpdate.toLocaleTimeString()}`}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Panel de filtros */}
        <Box sx={{
          p: 2,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '12px',
          border: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          {/* Filtro por Estado */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#495057',
              fontSize: '0.75rem',
              minWidth: '50px'
            }}>
              Estado:
            </Typography>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: 'white',
                color: '#495057',
                minWidth: '120px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#2AAC26';
                e.target.style.boxShadow = '0 4px 8px rgba(42, 172, 38, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2AAC26';
                e.target.style.outline = 'none';
              }}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en-progreso">En Progreso</option>
              <option value="completado">Completado</option>
            </select>
          </Box>

          {/* Filtro por Prioridad */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#495057',
              fontSize: '0.75rem',
              minWidth: '60px'
            }}>
              Prioridad:
            </Typography>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: 'white',
                color: '#495057',
                minWidth: '120px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#2AAC26';
                e.target.style.boxShadow = '0 4px 8px rgba(42, 172, 38, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2AAC26';
                e.target.style.outline = 'none';
              }}
            >
              <option value="todos">Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </Box>

          {/* Botón Hoy */}
          <button
            onClick={goToToday}
            style={{
              padding: '8px 16px',
              border: '1px solid #2AAC26',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: showTodayOnly ? '#2AAC26' : 'white',
              color: showTodayOnly ? 'white' : '#2AAC26',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (!showTodayOnly) {
                e.target.style.backgroundColor = '#2AAC26';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(42, 172, 38, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showTodayOnly) {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#2AAC26';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
          >
            📅 Hoy
          </button>

          {/* Botón Limpiar Filtros */}
          <button
            onClick={clearFilters}
            style={{
              padding: '8px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'white',
              color: '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ffebee';
              e.target.style.color = '#d32f2f';
              e.target.style.borderColor = '#d32f2f';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(211, 47, 47, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#666';
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            🗑️ Limpiar
          </button>
        </Box>
      </Box>

      {/* Contenedor principal del Gantt */}
      <Paper sx={{ 
        flex: 1, 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}>
        {/* Header de Timeline minimalista */}
        <Box sx={{ 
          borderBottom: '1px solid #e0e0e0',
          background: '#f8f9fa'
        }}>
          {/* Navegación de mes */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}>
            <IconButton 
              onClick={handlePreviousMonth}
              size="small"
              sx={{ 
                color: '#666',
                bgcolor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  color: '#2AAC26',
                  bgcolor: '#e8f5e9',
                  borderColor: '#2AAC26',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(42, 172, 38, 0.2)'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>
            
            <Typography sx={{
              fontSize: '1.1rem',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              color: '#333',
              minWidth: '150px',
              textAlign: 'center',
              px: 2,
              py: 1,
              bgcolor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Typography>
            
            <IconButton 
              onClick={handleNextMonth}
              size="small"
              sx={{ 
                color: '#666',
                bgcolor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  color: '#2AAC26',
                  bgcolor: '#e8f5e9',
                  borderColor: '#2AAC26',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(42, 172, 38, 0.2)'
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>


          {/* Semanas minimalistas */}
          <Box sx={{ 
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#2AAC26',
              borderRadius: '3px',
              '&:hover': {
                background: '#1f9a1f'
              }
            }
          }}>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: '250px repeat(5, 1fr)',
              minHeight: '60px',
              alignItems: 'center',
              minWidth: '900px'
            }}>
              {/* Columna de etiquetas mejorada */}
              <Box sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRight: '2px solid #dee2e6',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '8px solid #dee2e6',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent'
                }
              }}>
                <Typography variant="subtitle1" sx={{
                  fontWeight: 700,
                  fontFamily: 'Poppins, sans-serif',
                  color: '#495057',
                  fontSize: '0.9rem'
                }}>
                  📋 Tareas
                </Typography>
              </Box>
              
              {/* Headers de las semanas */}
              {weeks.map((week, index) => {
                const isCurrentWeek = index === currentWeekIndex;
                return (
                  <Box key={week.number} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                    borderRight: index < 4 ? '1px solid #e0e0e0' : 'none',
                    minHeight: '60px',
                    background: isCurrentWeek 
                      ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' 
                      : index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    border: isCurrentWeek ? '2px solid #ff6b6b' : 'none',
                    borderRadius: isCurrentWeek ? '8px' : '0',
                    position: 'relative',
                    '&::before': isCurrentWeek ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #ff6b6b 0%, #ff5252 100%)',
                      borderRadius: '8px 8px 0 0'
                    } : {}
                  }}>
                  <Typography variant="subtitle2" sx={{
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    color: isCurrentWeek ? '#d32f2f' : '#2AAC26',
                    fontSize: '0.8rem',
                    mb: 0.5
                  }}>
                    {week.label}
                  </Typography>
                  <Typography variant="caption" sx={{
                    fontFamily: 'Poppins, sans-serif',
                    color: isCurrentWeek ? '#b71c1c' : '#666',
                    fontSize: '0.7rem',
                    textAlign: 'center'
                  }}>
                    {week.dateRange}
                  </Typography>
                </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Área de Tareas minimalista */}
        <Box sx={{ 
          position: 'relative',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2AAC26',
            borderRadius: '3px',
            '&:hover': {
              background: '#1f9a1f'
            }
          }
        }}>
          <Box sx={{ minWidth: '900px' }}>

            {/* Lista de Tareas con sidebar mejorado */}
            {filteredTasks.map((task, taskIndex) => {
              const taskPosition = getTaskPosition(task);
              const taskColor = getTaskColor(task);
              const taskProgress = getTaskProgress(task);
              const isHovered = hoveredTask === task.id;
              
              return (
                <Box key={task.id} sx={{
                  display: 'grid',
                  gridTemplateColumns: '250px 1fr',
                  minHeight: '80px',
                  borderBottom: '1px solid #f0f0f0',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  background: isHovered 
                    ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
                    : 'transparent',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }
                }}>
                  {/* Descripción de la tarea mejorada */}
                  <Box sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    borderRight: '2px solid #e0e0e0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '0',
                      height: '0',
                      borderLeft: '8px solid #e0e0e0',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent'
                    }
                  }}>
                    {/* Indicador de estado */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: `linear-gradient(180deg, ${taskColor} 0%, ${taskColor}dd 100%)`,
                      borderRadius: '0 2px 2px 0'
                    }} />
                    
                    <Box sx={{ pl: 1 }}>
                      <Typography variant="body1" sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.9rem',
                        mb: 0.5
                      }}>
                        {task.name}
                      </Typography>
                      
                      {/* Chips de estado y progreso */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '15px',
                          background: `linear-gradient(135deg, ${taskColor} 0%, ${taskColor}dd 100%)`,
                          color: 'white',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          fontFamily: 'Poppins, sans-serif',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {task.status}
                        </Box>
                        <Box sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '15px',
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                          color: '#1976d2',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          fontFamily: 'Poppins, sans-serif',
                          border: '1px solid #bbdefb'
                        }}>
                          {taskProgress}%
                        </Box>
                      </Box>
                      
                      {/* Barra de progreso mejorada */}
                      <Box sx={{ pl: 1 }}>
                        <Box sx={{
                          width: '100%',
                          height: '6px',
                          background: 'linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 100%)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                          <Box sx={{
                            width: `${taskProgress}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${taskColor} 0%, ${taskColor}dd 100%)`,
                            borderRadius: '3px',
                            transition: 'width 0.5s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Área de barras de Gantt mejorada */}
                  <Box sx={{
                    position: 'relative',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    background: isHovered 
                      ? 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)' 
                      : 'transparent',
                    transition: 'background 0.3s ease'
                  }}>
                    {taskPosition.visible && (
                      <Tooltip
                        title={
                          <Box sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              mb: 1.5,
                              fontFamily: 'Poppins, sans-serif',
                              color: 'white',
                              textAlign: 'center'
                            }}>
                              📋 {task.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ 
                                  fontFamily: 'Poppins, sans-serif',
                                  color: 'rgba(255,255,255,0.9)',
                                  fontWeight: 600
                                }}>
                                  📊 Estado:
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  fontFamily: 'Poppins, sans-serif',
                                  color: 'white',
                                  fontWeight: 500
                                }}>
                                  {task.status}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ 
                                  fontFamily: 'Poppins, sans-serif',
                                  color: 'rgba(255,255,255,0.9)',
                                  fontWeight: 600
                                }}>
                                  ⚡ Progreso:
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  fontFamily: 'Poppins, sans-serif',
                                  color: 'white',
                                  fontWeight: 500
                                }}>
                                  {taskProgress}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ 
                                  fontFamily: 'Poppins, sans-serif',
                                  color: 'rgba(255,255,255,0.9)',
                                  fontWeight: 600
                                }}>
                                  📅 Inicio:
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  fontFamily: 'Poppins, sans-serif',
                                  color: 'white',
                                  fontWeight: 500
                                }}>
                                  {task.startDate.toLocaleDateString('es-ES')}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ 
                                  fontFamily: 'Poppins, sans-serif',
                                  color: 'rgba(255,255,255,0.9)',
                                  fontWeight: 600
                                }}>
                                  🏁 Fin:
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  fontFamily: 'Poppins, sans-serif',
                                  color: 'white',
                                  fontWeight: 500
                                }}>
                                  {task.endDate.toLocaleDateString('es-ES')}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                        arrow
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.8) 100%)',
                              borderRadius: '12px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }
                          }
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: `${taskPosition.left}%`,
                            width: `${taskPosition.width}%`,
                            height: '48px',
                            background: `linear-gradient(135deg, ${taskColor} 0%, ${taskColor}dd 100%)`,
                            borderRadius: '8px',
                            boxShadow: isHovered 
                              ? '0 8px 25px rgba(0,0,0,0.2)' 
                              : '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: `2px solid ${taskColor}aa`,
                            '&:hover': {
                              transform: 'translateY(-3px) scale(1.02)',
                              boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
                              border: `2px solid ${taskColor}`
                            }
                          }}
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                        >
                          {/* Barra de progreso dentro de la tarea */}
                          {taskProgress > 0 && (
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              height: '100%',
                              width: `${taskProgress}%`,
                              background: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)',
                              borderRadius: '6px 0 0 6px',
                              transition: 'width 0.5s ease'
                            }} />
                          )}
                          
                          {/* Porcentaje de progreso */}
                          <Typography variant="caption" sx={{
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            zIndex: 1,
                            fontFamily: 'Poppins, sans-serif'
                          }}>
                            {taskProgress}%
                          </Typography>
                          
                          {/* Efecto de brillo en hover */}
                          {isHovered && (
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                              animation: 'shimmer 1.5s ease-in-out',
                              '@keyframes shimmer': {
                                '0%': { transform: 'translateX(-100%)' },
                                '100%': { transform: 'translateX(100%)' }
                              }
                            }} />
                          )}
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              );
            })}

            {/* Mensaje si no hay tareas */}
            {tasks.length === 0 && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                color: '#999',
                p: 3
              }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  mb: 1,
                  color: '#666'
                }}>
                  📅 No hay tareas en {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center',
                  maxWidth: '400px'
                }}>
                  Las tareas aparecerán aquí cuando tengan fechas dentro de este mes. 
                  Usa las flechas para navegar entre meses o crea nuevas tareas con fechas específicas.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default StaticGanttChart;

// Agregar estilos CSS para animaciones
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
`;

// Inyectar estilos en el head del documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}