import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

// Componente de columna droppable
const DroppableColumn = ({ status, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  const style = {
    opacity: isOver ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      sx={{ 
        flex: 1, 
        minWidth: 300,
        ...style
      }}
    >
      {children}
    </Box>
  );
};

// Componente de tarjeta de tarea sorteable
const SortableTaskCard = ({ task, onEdit, onDelete, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return '#fff3e0';
      case 'En progreso': return '#e3f2fd';
      case 'Completada': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  };

  const getStatusHoverColor = (status) => {
    switch (status) {
      case 'Pendiente': return '#ffe0b2';
      case 'En progreso': return '#bbdefb';
      case 'Completada': return '#c8e6c9';
      default: return '#e0e0e0';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 2,
        cursor: 'grab',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: getStatusColor(task.status),
        border: `1px solid ${getStatusColor(task.status)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 6px 20px rgba(42, 172, 38, 0.15)`,
          transform: 'translateY(-2px)',
          backgroundColor: getStatusHoverColor(task.status),
          borderColor: GREEN + '40'
        },
        '&:active': {
          cursor: 'grabbing',
          transform: 'translateY(0px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }
      }}
      onClick={() => onClick(task)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              fontFamily: 'Poppins, sans-serif',
              flex: 1,
              mr: 1
            }}
          >
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              sx={{ color: GREEN, p: 0.5 }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              sx={{ color: '#f44336', p: 0.5 }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {task.priority && (
          <Chip
            label={task.priority}
            size="small"
            sx={{
              fontSize: '10px',
              height: 20,
              mb: 1,
              bgcolor: getPriorityColor(task.priority) + '20',
              color: getPriorityColor(task.priority),
              fontFamily: 'Poppins, sans-serif'
            }}
          />
        )}

        <Typography 
          variant="caption" 
          sx={{ 
            color: '#666', 
            fontFamily: 'Poppins, sans-serif',
            display: 'block',
            mb: 1,
            lineHeight: 1.3
          }}
        >
          {task.description?.length > 60 ? `${task.description.substring(0, 60)}...` : task.description}
        </Typography>

        {task.due_date && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 12, color: '#666' }} />
            <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              {new Date(task.due_date).toLocaleDateString('es-ES')}
            </Typography>
          </Box>
        )}

        {task.assigned_users && task.assigned_users.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: '10px' } }}>
              {task.assigned_users.map((userId, index) => {
                const user = dataService.getById('users', userId);
                return user ? (
                  <Avatar 
                    key={userId} 
                    src={user.avatar} 
                    alt={user.name}
                    title={user.name}
                  />
                ) : null;
              })}
            </AvatarGroup>
            <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
              #{task.id}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Componente de columna del Kanban
const KanbanColumn = ({ title, tasks, onTaskAdd, onTaskEdit, onTaskDelete, onTaskClick, columnId }) => {
  const getColumnColor = (columnId) => {
    switch (columnId) {
      case 'Pendiente': return '#ff9800';
      case 'En progreso': return '#2196f3';
      case 'Completada': return '#4caf50';
      default: return '#757575';
    }
  };

  const color = getColumnColor(columnId);

  return (
    <Box sx={{ 
      minHeight: 400,
      bgcolor: '#f8f9fa',
      borderRadius: 2,
      p: 2,
      border: `2px solid ${color}20`,
      flex: 1,
      minWidth: 300
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            bgcolor: color 
          }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            {title}
          </Typography>
          <Chip 
            label={tasks.length} 
            size="small" 
            sx={{ 
              bgcolor: `${color}20`, 
              color: color,
              fontFamily: 'Poppins, sans-serif'
            }} 
          />
        </Box>
        <IconButton
          size="small"
          onClick={() => onTaskAdd(columnId)}
          sx={{ 
            bgcolor: `${color}20`,
            color: color,
            '&:hover': { bgcolor: `${color}30` }
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onClick={onTaskClick}
          />
        ))}
      </SortableContext>

      {tasks.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          color: '#999',
          borderRadius: 2,
          border: '2px dashed #ddd'
        }}>
          <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Arrastra tareas aquí
          </Typography>
        </Box>
      )}
    </Box>
  );
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

const KanbanBoardNew = ({ filterByRole = true, projectId = null, userId = null }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'Pendiente',
    priority: 'Media',
    due_date: '',
    project_id: '',
    assigned_users: []
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const taskStatuses = ['Pendiente', 'En progreso', 'Completada'];
  const priorities = ['Baja', 'Media', 'Alta', 'Crítica'];

  useEffect(() => {
    loadData();
  }, [user, projectId, userId]);

  const loadData = () => {
    try {
      let allTasks = dataService.getAll('tasks');
      
      // Filtrar tareas según el rol y parámetros
      if (filterByRole && user) {
        switch (user.role) {
          case 'Administrador':
            // Administrador ve todas las tareas
            break;
          case 'Coordinador':
            if (projectId) {
              // Si se especifica un proyecto, solo tareas de ese proyecto
              allTasks = allTasks.filter(task => task.project_id === projectId);
            } else {
              // Si no, tareas de proyectos donde es coordinador
              const coordinatorProjects = dataService.getProjectsByCoordinator(user.id);
              const projectIds = coordinatorProjects.map(p => p.id);
              allTasks = allTasks.filter(task => projectIds.includes(task.project_id));
            }
            break;
          case 'Participante':
            if (userId) {
              // Tareas asignadas a un usuario específico
              allTasks = dataService.getTasksByUser(userId);
            } else {
              // Tareas asignadas al usuario actual
              allTasks = dataService.getTasksByUser(user.id);
            }
            break;
        }
      } else if (projectId) {
        // Filtrar por proyecto específico
        allTasks = allTasks.filter(task => task.project_id === projectId);
      } else if (userId) {
        // Filtrar por usuario específico
        allTasks = dataService.getTasksByUser(userId);
      }

      setTasks(allTasks);
      
      // Cargar proyectos y usuarios para los formularios
      const allProjects = dataService.getAll('projects');
      const allUsers = dataService.getAll('users').filter(u => u.active);
      
      setProjects(allProjects);
      setUsers(allUsers);

    } catch (error) {
      console.error('Error loading tasks:', error);
      showSnackbar('Error al cargar las tareas', 'error');
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    // Determinar el nuevo estado basado en la columna de destino
    let newStatus = activeTask.status;
    
    // Si se soltó sobre una columna diferente
    if (over.id && taskStatuses.includes(over.id)) {
      newStatus = over.id;
    } else {
      // Si se soltó sobre otra tarea, obtener el estado de esa columna
      const overTask = tasks.find(task => task.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Actualizar el estado de la tarea si cambió
    if (newStatus !== activeTask.status) {
      // Validar permisos por rol
      if (user?.role === 'Participante') {
        // Los participantes solo pueden cambiar sus propias tareas
        const taskAssignments = dataService.getAll('task_assignments');
        const isAssignedToUser = taskAssignments.some(
          assignment => assignment.task_id === activeTask.id && assignment.user_id === user.id
        );
        
        if (!isAssignedToUser) {
          showSnackbar('No tienes permisos para modificar esta tarea', 'error');
          return;
        }
      }
      
      try {
        // Actualizar en el dataService
        dataService.update('tasks', activeTask.id, { status: newStatus });
        
        // Actualizar el estado local inmediatamente sin recargar
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === activeTask.id 
              ? { ...task, status: newStatus }
              : task
          )
        );
        
        showSnackbar(`Tarea movida a "${newStatus}"`, 'success');
      } catch (error) {
        showSnackbar('Error al actualizar la tarea', 'error');
        console.error('Error updating task:', error);
      }
    }
  };

  const handleTaskAdd = (status) => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      status: status,
      priority: 'Media',
      due_date: '',
      project_id: projectId || '',
      assigned_users: []
    });
    setOpenTaskDialog(true);
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority || 'Media',
      due_date: task.due_date || '',
      project_id: task.project_id || '',
      assigned_users: task.assigned_users || []
    });
    setOpenTaskDialog(true);
  };

  const handleTaskSave = () => {
    try {
      if (!taskForm.title || !taskForm.description) {
        showSnackbar('Por favor complete los campos obligatorios', 'error');
        return;
      }

      const taskData = {
        ...taskForm,
        project_id: parseInt(taskForm.project_id) || null
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

      loadData();
      setOpenTaskDialog(false);
    } catch (error) {
      showSnackbar('Error al guardar la tarea', 'error');
    }
  };

  const handleTaskDelete = (taskId) => {
    try {
      dataService.delete('tasks', taskId);
      showSnackbar('Tarea eliminada exitosamente', 'success');
      loadData();
    } catch (error) {
      showSnackbar('Error al eliminar la tarea', 'error');
    }
  };

  const handleTaskClick = (task) => {
    handleTaskEdit(task);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getAvailableProjects = () => {
    if (!user) return projects;
    
    switch (user.role) {
      case 'Administrador':
        return projects;
      case 'Coordinador':
        return dataService.getProjectsByCoordinator(user.id);
      default:
        return projects;
    }
  };

  const getAvailableUsers = () => {
    if (projectId) {
      return dataService.getProjectParticipants(projectId);
    }
    return users.filter(u => u.role_id === 3); // Solo participantes
  };

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
          Tablero Kanban
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
          Gestiona tus tareas arrastrando entre columnas
        </Typography>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          overflow: 'auto',
          minHeight: 500
        }}>
          {taskStatuses.map((status) => (
            <DroppableColumn key={status} status={status}>
              <SortableContext 
                items={getTasksByStatus(status).map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  title={status}
                  tasks={getTasksByStatus(status)}
                  onTaskAdd={handleTaskAdd}
                  onTaskEdit={handleTaskEdit}
                  onTaskDelete={handleTaskDelete}
                  onTaskClick={handleTaskClick}
                  columnId={status}
                />
              </SortableContext>
            </DroppableColumn>
          ))}
        </Box>

        <DragOverlay>
          {activeId ? (
            <Box sx={{ opacity: 0.8, transform: 'rotate(5deg)' }}>
              <SortableTaskCard
                task={tasks.find(task => task.id === activeId)}
                onEdit={() => {}}
                onDelete={() => {}}
                onClick={() => {}}
              />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Fecha de vencimiento"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Proyecto</InputLabel>
                <Select
                  value={taskForm.project_id}
                  onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
                  label="Proyecto"
                >
                  {getAvailableProjects().map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Autocomplete
              multiple
              options={getAvailableUsers()}
              getOptionLabel={(option) => option.name}
              value={getAvailableUsers().filter(u => taskForm.assigned_users.includes(u.id))}
              onChange={(event, newValue) => {
                setTaskForm({ ...taskForm, assigned_users: newValue.map(user => user.id) });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Asignar a usuarios"
                  placeholder="Seleccionar usuarios"
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
            onClick={handleTaskSave} 
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

export default KanbanBoardNew;
