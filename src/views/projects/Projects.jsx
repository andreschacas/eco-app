import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import TaskIcon from '@mui/icons-material/Task';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CommentIcon from '@mui/icons-material/Comment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const GREEN = '#2AAC26';

// Los 3 proyectos del dashboard de inicio
const projectsData = [
  {
    id: 1,
    name: 'Tesis Huella de carbono',
    description: 'Investigación y análisis de la huella de carbono en procesos industriales para implementar estrategias de reducción sostenible.',
    status: 'En progreso',
    priority: 'Alta',
    progress: 55,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-25'),
    budget: 25000,
    actualCost: 13750,
    manager: 'Dr. Elena Rodríguez',
    members: [
      { id: 1, name: 'Dr. Elena Rodríguez', role: 'Investigador Principal', avatar: 'https://i.pravatar.cc/150?img=1', email: 'elena.rodriguez@eco.com' },
      { id: 2, name: 'Carlos Mendoza', role: 'Analista Ambiental', avatar: 'https://i.pravatar.cc/150?img=2', email: 'carlos.mendoza@eco.com' },
      { id: 3, name: 'Ana Martínez', role: 'Especialista en Datos', avatar: 'https://i.pravatar.cc/150?img=3', email: 'ana.martinez@eco.com' }
    ],
    tags: ['Investigación', 'Carbono', 'Sostenibilidad'],
    color: '#2196f3',
    bgColor: '#e3f2fd',
    isStarred: true,
    tasks: [
      { id: 1, title: 'Recolección de datos industriales', completed: true, assignedTo: 'Carlos Mendoza', dueDate: '2024-01-30' },
      { id: 2, title: 'Análisis de emisiones por sector', completed: true, assignedTo: 'Ana Martínez', dueDate: '2024-02-15' },
      { id: 3, title: 'Modelado de reducción de carbono', completed: false, assignedTo: 'Dr. Elena Rodríguez', dueDate: '2024-03-01' },
      { id: 4, title: 'Redacción de conclusiones', completed: false, assignedTo: 'Dr. Elena Rodríguez', dueDate: '2024-03-15' }
    ],
    attachments: 12,
    comments: 45,
    lastActivity: '2 horas ago'
  },
  {
    id: 2,
    name: 'Pared verde sustentable',
    description: 'Desarrollo e implementación de sistemas de paredes verdes para mejorar la calidad del aire en espacios urbanos.',
    status: 'En progreso',
    priority: 'Media',
    progress: 78,
    startDate: new Date('2023-11-01'),
    endDate: new Date('2024-12-28'),
    budget: 35000,
    actualCost: 27300,
    manager: 'Arq. Patricia Silva',
    members: [
      { id: 4, name: 'Arq. Patricia Silva', role: 'Arquitecta Paisajista', avatar: 'https://i.pravatar.cc/150?img=4', email: 'patricia.silva@eco.com' },
      { id: 5, name: 'Miguel Torres', role: 'Ingeniero Ambiental', avatar: 'https://i.pravatar.cc/150?img=5', email: 'miguel.torres@eco.com' }
    ],
    tags: ['Arquitectura Verde', 'Calidad del Aire', 'Urbano'],
    color: '#9c27b0',
    bgColor: '#f3e5f5',
    isStarred: false,
    tasks: [
      { id: 1, title: 'Diseño de sistema de riego', completed: true, assignedTo: 'Arq. Patricia Silva', dueDate: '2024-01-15' },
      { id: 2, title: 'Selección de plantas nativas', completed: true, assignedTo: 'Miguel Torres', dueDate: '2024-01-20' },
      { id: 3, title: 'Instalación del prototipo', completed: true, assignedTo: 'Miguel Torres', dueDate: '2024-02-10' },
      { id: 4, title: 'Monitoreo de calidad del aire', completed: false, assignedTo: 'Miguel Torres', dueDate: '2024-03-01' }
    ],
    attachments: 8,
    comments: 23,
    lastActivity: '1 día ago'
  },
  {
    id: 3,
    name: 'Tesis Huella hídrica',
    description: 'Estudio del consumo de agua en procesos agrícolas y propuesta de técnicas de conservación hídrica.',
    status: 'Planificación',
    priority: 'Alta',
    progress: 32,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-01-15'),
    budget: 20000,
    actualCost: 6400,
    manager: 'Ing. Roberto Vargas',
    members: [
      { id: 6, name: 'Ing. Roberto Vargas', role: 'Ingeniero Hidráulico', avatar: 'https://i.pravatar.cc/150?img=6', email: 'roberto.vargas@eco.com' },
      { id: 7, name: 'Laura González', role: 'Bióloga Marina', avatar: 'https://i.pravatar.cc/150?img=7', email: 'laura.gonzalez@eco.com' },
      { id: 8, name: 'Pedro Ramírez', role: 'Técnico en Aguas', avatar: 'https://i.pravatar.cc/150?img=8', email: 'pedro.ramirez@eco.com' }
    ],
    tags: ['Hidrología', 'Agricultura', 'Conservación'],
    color: '#ff5722',
    bgColor: '#fbe9e7',
    isStarred: true,
    tasks: [
      { id: 1, title: 'Revisión bibliográfica', completed: true, assignedTo: 'Laura González', dueDate: '2024-02-15' },
      { id: 2, title: 'Identificación de áreas de estudio', completed: false, assignedTo: 'Ing. Roberto Vargas', dueDate: '2024-03-01' },
      { id: 3, title: 'Instalación de medidores', completed: false, assignedTo: 'Pedro Ramírez', dueDate: '2024-03-15' }
    ],
    attachments: 5,
    comments: 12,
    lastActivity: '3 días ago'
  }
];

const ProjectsView = () => {
  const [projects, setProjects] = useState(projectsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProjectMenu, setSelectedProjectMenu] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedMemberForTask, setSelectedMemberForTask] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Filtros y búsqueda
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: projects.length,
    enProgreso: projects.filter(p => p.status === 'En progreso').length,
    completados: projects.filter(p => p.status === 'Completado').length,
    planificacion: projects.filter(p => p.status === 'Planificación').length
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setDetailDialogOpen(true);
    setTabValue(0);
  };

  const handleToggleStar = (projectId) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, isStarred: !p.isStarred } : p
    ));
  };

  const handleToggleTask = (taskId) => {
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        tasks: selectedProject.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      };
      setSelectedProject(updatedProject);
      setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    }
  };

  const handleRemoveMember = (memberId) => {
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        members: selectedProject.members.filter(member => member.id !== memberId)
      };
      setSelectedProject(updatedProject);
      setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle && selectedMemberForTask && selectedProject) {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle,
        completed: false,
        assignedTo: selectedMemberForTask,
        dueDate: newTaskDueDate || new Date().toISOString().split('T')[0]
      };
      
      const updatedProject = {
        ...selectedProject,
        tasks: [...selectedProject.tasks, newTask]
      };
      
      setSelectedProject(updatedProject);
      setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
      
      // Reset form
      setNewTaskTitle('');
      setSelectedMemberForTask('');
      setNewTaskDueDate('');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'En progreso': { color: '#2196f3', bg: '#e3f2fd' },
      'Completado': { color: '#4caf50', bg: '#e8f5e9' },
      'Planificación': { color: '#ff9800', bg: '#fff3e0' },
      'En pausa': { color: '#f44336', bg: '#ffebee' }
    };
    return colors[status] || colors['Planificación'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Alta': '#f44336',
      'Media': '#ff9800',
      'Baja': '#4caf50'
    };
    return colors[priority] || colors['Media'];
  };

  const getTasksCompleted = (tasks) => {
    return tasks.filter(task => task.completed).length;
  };

  const ProjectCard = ({ project }) => (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        background: project.bgColor,
        border: `2px solid ${project.color}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        },
        fontFamily: 'Poppins, sans-serif'
      }}
      onClick={() => handleViewProject(project)}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#1a1a1a' }}>
                {project.name}
              </Typography>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStar(project.id);
                }}
              >
                {project.isStarred ? 
                  <StarIcon sx={{ color: '#ffc107', fontSize: 20 }} /> : 
                  <StarBorderIcon sx={{ color: '#999', fontSize: 20 }} />
                }
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ color: '#555', fontFamily: 'Poppins, sans-serif', mb: 2, lineHeight: 1.4 }}>
              {project.description}
            </Typography>
          </Box>
          <IconButton 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
              setSelectedProjectMenu(project);
            }}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Estado y Prioridad */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Chip
            label={project.status}
            size="small"
            sx={{
              bgcolor: getStatusColor(project.status).bg,
              color: getStatusColor(project.status).color,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              borderRadius: 2
            }}
          />
          <Chip
            icon={<PriorityHighIcon sx={{ fontSize: 14 }} />}
            label={project.priority}
            size="small"
            sx={{
              bgcolor: `${getPriorityColor(project.priority)}15`,
              color: getPriorityColor(project.priority),
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              borderRadius: 2
            }}
          />
        </Box>

        {/* Progreso */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
              Progreso del Proyecto
            </Typography>
            <Typography variant="body2" sx={{ color: project.color, fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              {project.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: `${project.color}20`,
              '& .MuiLinearProgress-bar': {
                bgcolor: project.color,
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Estadísticas compactas */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TaskIcon sx={{ fontSize: 16, color: project.color }} />
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
              {getTasksCompleted(project.tasks)}/{project.tasks.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon sx={{ fontSize: 16, color: project.color }} />
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
              {project.members.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachFileIcon sx={{ fontSize: 16, color: project.color }} />
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
              {project.attachments}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: project.color }} />
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
              {project.endDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </Typography>
          </Box>
        </Box>

        {/* Footer con miembros */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', display: 'block' }}>
              Equipo
            </Typography>
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, border: '2px solid white' } }}>
              {project.members.map((member) => (
                <Tooltip key={member.id} title={`${member.name} - ${member.role}`}>
                  <Avatar src={member.avatar} alt={member.name} />
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', display: 'block' }}>
              Manager
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              {project.manager}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header con estadísticas */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
              Gestión de Proyectos
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              Proyectos principales de investigación ECO
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: GREEN,
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 4px 12px rgba(42, 172, 38, 0.3)',
              '&:hover': { 
                bgcolor: '#1f9a1f',
                boxShadow: '0 6px 16px rgba(42, 172, 38, 0.4)'
              }
            }}
          >
            Nuevo Proyecto
          </Button>
        </Box>

        {/* Tarjetas de estadísticas compactas */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 2, borderLeft: `4px solid ${GREEN}`, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: GREEN }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    Total Proyectos
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 32, color: GREEN, opacity: 0.3 }} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid #2196f3', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    {stats.enProgreso}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    En Progreso
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 32, color: '#2196f3', opacity: 0.3 }} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid #4caf50', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {stats.completados}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    Completados
                  </Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 32, color: '#4caf50', opacity: 0.3 }} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid #ff9800', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {stats.planificacion}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    Planificación
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 32, color: '#ff9800', opacity: 0.3 }} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filtros compactos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Buscar proyectos..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300, fontFamily: 'Poppins, sans-serif' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999' }} />
              </InputAdornment>
            ),
            style: { fontFamily: 'Poppins, sans-serif' }
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={statusFilter}
            label="Estado"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="En progreso">En progreso</MenuItem>
            <MenuItem value="Completado">Completado</MenuItem>
            <MenuItem value="Planificación">Planificación</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Grid de proyectos */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleViewProject(selectedProjectMenu)}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Ver detalles
        </MenuItem>
        <MenuItem onClick={() => handleToggleStar(selectedProjectMenu?.id)}>
          {selectedProjectMenu?.isStarred ? 
            <StarIcon sx={{ mr: 1, fontSize: 20, color: '#ffc107' }} /> : 
            <StarBorderIcon sx={{ mr: 1, fontSize: 20 }} />
          }
          {selectedProjectMenu?.isStarred ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        </MenuItem>
        <MenuItem>
          <ShareIcon sx={{ mr: 1, fontSize: 20 }} />
          Compartir proyecto
        </MenuItem>
      </Menu>

      {/* Dialog de detalles del proyecto - MEJORADO Y COMPACTO */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            fontFamily: 'Poppins, sans-serif',
            maxHeight: '90vh'
          }
        }}
      >
        {selectedProject && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid #e0e0e0',
              pb: 2,
              background: `linear-gradient(135deg, ${selectedProject.color}15, ${selectedProject.bgColor})`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                  {selectedProject.name}
                </Typography>
                <Chip
                  label={selectedProject.status}
                  sx={{
                    bgcolor: getStatusColor(selectedProject.status).color,
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Chip
                  icon={<PriorityHighIcon sx={{ fontSize: 16 }} />}
                  label={selectedProject.priority}
                  sx={{
                    bgcolor: getPriorityColor(selectedProject.priority),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
              <IconButton onClick={() => setDetailDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)} 
                sx={{ 
                  borderBottom: '1px solid #e0e0e0',
                  '& .MuiTab-root': { fontFamily: 'Poppins, sans-serif', fontWeight: 600 }
                }}
              >
                <Tab label="Resumen" />
                <Tab label={`Tareas (${selectedProject.tasks.length})`} />
                <Tab label={`Equipo (${selectedProject.members.length})`} />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {/* Tab 0: Resumen Compacto */}
                {tabValue === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.6 }}>
                        {selectedProject.description}
                      </Typography>

                      {/* Progreso visual */}
                      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          Progreso del Proyecto
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Completado
                            </Typography>
                            <Typography variant="body2" sx={{ color: selectedProject.color, fontWeight: 700 }}>
                              {selectedProject.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={selectedProject.progress}
                            sx={{
                              height: 12,
                              borderRadius: 6,
                              bgcolor: `${selectedProject.color}15`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: selectedProject.color,
                                borderRadius: 6
                              }
                            }}
                          />
                        </Box>
                      </Paper>

                      {/* Métricas en Grid compacto */}
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h5" sx={{ color: GREEN, fontWeight: 700 }}>
                              {getTasksCompleted(selectedProject.tasks)}/{selectedProject.tasks.length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Tareas
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h5" sx={{ color: '#2196f3', fontWeight: 700 }}>
                              {selectedProject.members.length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Miembros
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 700 }}>
                              {selectedProject.attachments}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Archivos
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                              {selectedProject.comments}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Comentarios
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      {/* Info del proyecto compacta */}
                      <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                          Información del Proyecto
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                            Manager
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedProject.manager}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                            Fecha límite
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedProject.endDate.toLocaleDateString('es-ES')}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                            Presupuesto
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            ${selectedProject.budget.toLocaleString()}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                            Costo actual
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            ${selectedProject.actualCost.toLocaleString()}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {/* Tab 1: Tareas FUNCIONAL */}
                {tabValue === 1 && (
                  <Box>
                    {/* Agregar nueva tarea */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Agregar Nueva Tarea
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Título de la tarea"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Asignar a</InputLabel>
                            <Select
                              value={selectedMemberForTask}
                              label="Asignar a"
                              onChange={(e) => setSelectedMemberForTask(e.target.value)}
                            >
                              {selectedProject.members.map((member) => (
                                <MenuItem key={member.id} value={member.name}>
                                  {member.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Fecha límite"
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handleAddTask}
                            disabled={!newTaskTitle || !selectedMemberForTask}
                            sx={{ 
                              bgcolor: GREEN, 
                              height: '40px',
                              '&:hover': { bgcolor: '#1f9a1f' }
                            }}
                          >
                            Agregar
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Lista de tareas */}
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Tareas del Proyecto ({getTasksCompleted(selectedProject.tasks)}/{selectedProject.tasks.length} completadas)
                    </Typography>
                    <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                      {selectedProject.tasks.map((task, index) => (
                        <React.Fragment key={task.id}>
                          <ListItem sx={{ py: 2 }}>
                            <ListItemIcon>
                              <Checkbox
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id)}
                                sx={{
                                  color: selectedProject.color,
                                  '&.Mui-checked': {
                                    color: selectedProject.color,
                                  },
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={task.title}
                              secondary={
                                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                  <Chip 
                                    label={task.assignedTo} 
                                    size="small" 
                                    sx={{ bgcolor: `${selectedProject.color}15`, color: selectedProject.color }}
                                  />
                                  <Chip 
                                    label={task.dueDate} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              sx={{
                                '& .MuiListItemText-primary': {
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  color: task.completed ? '#999' : '#333',
                                  fontWeight: 500
                                }
                              }}
                            />
                          </ListItem>
                          {index < selectedProject.tasks.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Tab 2: Miembros FUNCIONAL */}
                {tabValue === 2 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Miembros del Equipo
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        sx={{
                          borderColor: GREEN,
                          color: GREEN,
                          '&:hover': { borderColor: '#1f9a1f', bgcolor: '#f0f8f0' }
                        }}
                      >
                        Agregar Miembro
                      </Button>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {selectedProject.members.map((member) => (
                        <Grid item xs={12} md={6} key={member.id}>
                          <Paper sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveMember(member.id)}
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      bgcolor: '#f44336',
                                      color: 'white',
                                      '&:hover': { bgcolor: '#d32f2f' }
                                    }}
                                  >
                                    <PersonRemoveIcon sx={{ fontSize: 12 }} />
                                  </IconButton>
                                }
                              >
                                <Avatar 
                                  src={member.avatar} 
                                  alt={member.name} 
                                  sx={{ width: 60, height: 60 }} 
                                />
                              </Badge>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {member.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                                  {member.role}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#999', fontSize: '12px' }}>
                                  {member.email}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProjectsView;