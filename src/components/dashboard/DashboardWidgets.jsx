import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import cacheService from '../../utils/cacheService';

// Registrar Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
);

const GREEN = '#2AAC26';

const DashboardWidgets = ({ layout = 'default', onLayoutChange, customizable = true }) => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [fullscreenWidget, setFullscreenWidget] = useState(null);

  // Configuración por defecto de widgets
  const defaultWidgets = {
    Administrador: [
      'project_overview',
      'task_status',
      'user_activity',
      'metrics_summary',
      'recent_projects',
      'system_health'
    ],
    Coordinador: [
      'my_projects',
      'project_progress',
      'team_performance',
      'upcoming_deadlines',
      'metrics_chart',
      'recent_activity'
    ],
    Participante: [
      'my_tasks',
      'task_progress',
      'project_participation',
      'upcoming_deadlines',
      'achievement_badges',
      'time_tracking'
    ]
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadWidgetConfiguration();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await cacheService.getDashboardData(user.id, user.role);
      
      // Obtener datos adicionales específicos por rol
      const projects = await cacheService.getProjects();
      const tasks = await cacheService.getTasks();
      const users = await cacheService.getUsers();

      // Calcular métricas específicas
      let enhancedData = { ...data };

      if (user.role === 'Administrador') {
        enhancedData = {
          ...enhancedData,
          projectsByStatus: calculateProjectsByStatus(projects),
          tasksByStatus: calculateTasksByStatus(tasks),
          userGrowth: calculateUserGrowth(users),
          systemMetrics: calculateSystemMetrics(projects, tasks, users)
        };
      } else if (user.role === 'Coordinador') {
        const myProjects = dataService.getProjectsByCoordinator(user.id);
        const myTasks = tasks.filter(t => myProjects.some(p => p.id === t.project_id));
        
        enhancedData = {
          ...enhancedData,
          myProjects,
          projectProgress: calculateProjectProgress(myProjects),
          teamPerformance: calculateTeamPerformance(myProjects, tasks),
          upcomingDeadlines: getUpcomingDeadlines(myTasks)
        };
      } else if (user.role === 'Participante') {
        const myTasks = dataService.getTasksByUser(user.id);
        const myProjects = projects.filter(p => 
          myTasks.some(t => t.project_id === p.id)
        );
        
        enhancedData = {
          ...enhancedData,
          myTasks,
          taskProgress: calculateTaskProgress(myTasks),
          projectParticipation: myProjects,
          achievements: calculateAchievements(myTasks)
        };
      }

      setDashboardData(enhancedData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetConfiguration = () => {
    const savedWidgets = localStorage.getItem(`dashboard_widgets_${user.id}`);
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      const defaultConfig = defaultWidgets[user.role] || defaultWidgets.Participante;
      setWidgets(defaultConfig.map((id, index) => ({
        id,
        enabled: true,
        position: index,
        size: getDefaultWidgetSize(id)
      })));
    }
  };

  const getDefaultWidgetSize = (widgetId) => {
    const largeSizeWidgets = ['metrics_chart', 'project_progress', 'team_performance'];
    return largeSizeWidgets.includes(widgetId) ? 'large' : 'medium';
  };

  // Funciones de cálculo de métricas
  const calculateProjectsByStatus = (projects) => {
    const statusCount = {};
    projects.forEach(project => {
      statusCount[project.status] = (statusCount[project.status] || 0) + 1;
    });
    return statusCount;
  };

  const calculateTasksByStatus = (tasks) => {
    const statusCount = {};
    tasks.forEach(task => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1;
    });
    return statusCount;
  };

  const calculateUserGrowth = (users) => {
    // Simular datos de crecimiento
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const growth = months.map((month, index) => ({
      month,
      users: Math.floor(users.length * (0.6 + index * 0.1))
    }));
    return growth;
  };

  const calculateSystemMetrics = (projects, tasks, users) => {
    return {
      completionRate: Math.round((tasks.filter(t => t.status === 'Completada').length / tasks.length) * 100) || 0,
      activeProjects: projects.filter(p => p.status === 'En progreso').length,
      activeUsers: users.filter(u => u.active).length,
      overdueTasks: tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'Completada').length
    };
  };

  const calculateProjectProgress = (projects) => {
    return projects.map(project => {
      const tasks = dataService.getTasksByProject(project.id);
      const completedTasks = tasks.filter(t => t.status === 'Completada').length;
      const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      
      return {
        ...project,
        progress,
        totalTasks: tasks.length,
        completedTasks
      };
    });
  };

  const calculateTeamPerformance = (projects, allTasks) => {
    const teamData = [];
    projects.forEach(project => {
      const projectTasks = allTasks.filter(t => t.project_id === project.id);
      const participants = dataService.getProjectParticipants(project.id);
      
      participants.forEach(participant => {
        const userTasks = projectTasks.filter(t => 
          t.assigned_users && t.assigned_users.includes(participant.id)
        );
        const completedTasks = userTasks.filter(t => t.status === 'Completada').length;
        const efficiency = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;
        
        teamData.push({
          name: participant.name,
          tasks: userTasks.length,
          completed: completedTasks,
          efficiency: Math.round(efficiency)
        });
      });
    });
    
    return teamData.slice(0, 5); // Top 5
  };

  const getUpcomingDeadlines = (tasks) => {
    const upcoming = tasks.filter(task => {
      if (!task.due_date || task.status === 'Completada') return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    
    return upcoming.slice(0, 5);
  };

  const calculateTaskProgress = (tasks) => {
    const statusCount = calculateTasksByStatus(tasks);
    return {
      total: tasks.length,
      completed: statusCount['Completada'] || 0,
      inProgress: statusCount['En progreso'] || 0,
      pending: statusCount['Pendiente'] || 0
    };
  };

  const calculateAchievements = (tasks) => {
    const completedTasks = tasks.filter(t => t.status === 'Completada').length;
    const achievements = [];
    
    if (completedTasks >= 10) achievements.push({ name: 'Completador', icon: '🏆', description: '10+ tareas completadas' });
    if (completedTasks >= 50) achievements.push({ name: 'Experto', icon: '🌟', description: '50+ tareas completadas' });
    if (tasks.some(t => t.priority === 'Crítica' && t.status === 'Completada')) {
      achievements.push({ name: 'Héroe', icon: '🦸', description: 'Tarea crítica completada' });
    }
    
    return achievements;
  };

  // Componentes de widgets individuales
  const renderWidget = (widget) => {
    const WidgetComponent = getWidgetComponent(widget.id);
    if (!WidgetComponent) return null;

    return (
      <motion.div
        key={widget.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            height: widget.size === 'large' ? 400 : widget.size === 'small' ? 200 : 300,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            position: 'relative',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <CardHeader
            title={getWidgetTitle(widget.id)}
            action={
              customizable && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => setFullscreenWidget(widget)}>
                    <FullscreenIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openWidgetConfig(widget)}>
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ cursor: 'grab' }}>
                    <DragIndicatorIcon fontSize="small" />
                  </IconButton>
                </Box>
              )
            }
            sx={{
              pb: 1,
              '& .MuiCardHeader-title': {
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif'
              }
            }}
          />
          <CardContent sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
            <WidgetComponent data={dashboardData} />
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const getWidgetComponent = (widgetId) => {
    const components = {
      project_overview: ProjectOverviewWidget,
      task_status: TaskStatusWidget,
      user_activity: UserActivityWidget,
      metrics_summary: MetricsSummaryWidget,
      my_projects: MyProjectsWidget,
      project_progress: ProjectProgressWidget,
      team_performance: TeamPerformanceWidget,
      upcoming_deadlines: UpcomingDeadlinesWidget,
      metrics_chart: MetricsChartWidget,
      my_tasks: MyTasksWidget,
      task_progress: TaskProgressWidget,
      achievement_badges: AchievementBadgesWidget
    };
    
    return components[widgetId];
  };

  const getWidgetTitle = (widgetId) => {
    const titles = {
      project_overview: 'Resumen de Proyectos',
      task_status: 'Estado de Tareas',
      user_activity: 'Actividad de Usuarios',
      metrics_summary: 'Resumen de Métricas',
      my_projects: 'Mis Proyectos',
      project_progress: 'Progreso de Proyectos',
      team_performance: 'Rendimiento del Equipo',
      upcoming_deadlines: 'Próximos Vencimientos',
      metrics_chart: 'Gráfico de Métricas',
      my_tasks: 'Mis Tareas',
      task_progress: 'Progreso de Tareas',
      achievement_badges: 'Logros'
    };
    
    return titles[widgetId] || 'Widget';
  };

  const openWidgetConfig = (widget) => {
    setSelectedWidget(widget);
    setConfigOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <AnimatePresence>
        <Grid container spacing={3}>
          {widgets.filter(w => w.enabled).map((widget) => (
            <Grid 
              item 
              xs={12} 
              sm={widget.size === 'small' ? 6 : widget.size === 'large' ? 12 : 6}
              md={widget.size === 'small' ? 4 : widget.size === 'large' ? 8 : 6}
              lg={widget.size === 'small' ? 3 : widget.size === 'large' ? 6 : 4}
              key={widget.id}
            >
              {renderWidget(widget)}
            </Grid>
          ))}
        </Grid>
      </AnimatePresence>

      {/* Widget Configuration Dialog */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)}>
        <DialogTitle>Configurar Widget</DialogTitle>
        <DialogContent>
          {selectedWidget && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedWidget.enabled}
                    onChange={(e) => {
                      // Actualizar configuración del widget
                    }}
                  />
                }
                label="Mostrar widget"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Cancelar</Button>
          <Button variant="contained" sx={{ bgcolor: GREEN }}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Widget Dialog */}
      <Dialog 
        open={!!fullscreenWidget} 
        onClose={() => setFullscreenWidget(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{fullscreenWidget && getWidgetTitle(fullscreenWidget.id)}</DialogTitle>
        <DialogContent>
          {fullscreenWidget && (
            <Box sx={{ height: '60vh' }}>
              {React.createElement(getWidgetComponent(fullscreenWidget.id), { 
                data: dashboardData,
                fullscreen: true 
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFullscreenWidget(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componentes de widgets individuales
const ProjectOverviewWidget = ({ data }) => {
  if (!data) return <Typography>Cargando...</Typography>;

  const chartData = {
    labels: Object.keys(data.projectsByStatus || {}),
    datasets: [{
      data: Object.values(data.projectsByStatus || {}),
      backgroundColor: [GREEN, '#ff9800', '#f44336', '#2196f3', '#9c27b0'],
      borderWidth: 0
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'Poppins' } }
      }
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1 }}>
        <Doughnut data={chartData} options={options} />
      </Box>
      <Typography variant="h4" sx={{ textAlign: 'center', mt: 2, fontFamily: 'Poppins, sans-serif', color: GREEN }}>
        {data.totalProjects}
      </Typography>
      <Typography variant="caption" sx={{ textAlign: 'center', color: '#666' }}>
        Total de Proyectos
      </Typography>
    </Box>
  );
};

const TaskStatusWidget = ({ data }) => {
  if (!data) return <Typography>Cargando...</Typography>;

  const chartData = {
    labels: Object.keys(data.tasksByStatus || {}),
    datasets: [{
      label: 'Tareas',
      data: Object.values(data.tasksByStatus || {}),
      backgroundColor: [GREEN, '#ff9800', '#f44336'],
      borderRadius: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return <Bar data={chartData} options={options} />;
};

const MyTasksWidget = ({ data }) => {
  if (!data?.taskProgress) return <Typography>Cargando...</Typography>;

  const { total, completed, inProgress, pending } = data.taskProgress;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
          {total}
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {Math.round((completed / total) * 100) || 0}% Completado
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(completed / total) * 100 || 0} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': { bgcolor: GREEN }
            }} 
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#ff9800', fontFamily: 'Poppins, sans-serif' }}>
            {pending}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Pendientes
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
            {inProgress}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            En Progreso
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
            {completed}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Completadas
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const UserActivityWidget = ({ data }) => {
  if (!data?.userActivity) return <Typography>Cargando...</Typography>;

  const { weeklyTasks, productivityScore, lastActivity } = data.userActivity;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
          {productivityScore || 85}%
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Productividad esta semana
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            {lastActivity || 'Hace 2 horas'}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
            {weeklyTasks?.completed || 12}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Completadas
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
            {weeklyTasks?.total || 18}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Total Semanal
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const MetricsSummaryWidget = ({ data }) => {
  if (!data?.metrics) return <Typography>Cargando...</Typography>;

  const totalMetrics = data.metrics.length || 0;
  const onTrack = data.metrics.filter(m => m.progress >= 80).length || 0;
  const avgProgress = data.metrics.reduce((acc, m) => acc + (m.progress || 0), 0) / totalMetrics || 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
          {Math.round(avgProgress)}%
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Progreso Promedio
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
            {totalMetrics}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Métricas
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
            {onTrack}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            En Meta
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const MyProjectsWidget = ({ data }) => {
  if (!data?.projects) return <Typography>Cargando...</Typography>;

  const projects = data.projects || [];
  const activeProjects = projects.filter(p => p.status === 'En progreso').length;
  const completedProjects = projects.filter(p => p.status === 'Completado').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
          {projects.length}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Mis Proyectos
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
            {activeProjects}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Activos
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
            {completedProjects}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Completados
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const ProjectProgressWidget = ({ data }) => {
  if (!data?.projectProgress) return <Typography>Cargando...</Typography>;

  const { current, total, percentage } = data.projectProgress;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
          {percentage || 68}%
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {current || 15} de {total || 22} proyectos
          </Typography>
        </Box>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={percentage || 68} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          bgcolor: '#e0e0e0',
          '& .MuiLinearProgress-bar': { bgcolor: GREEN }
        }} 
      />
      
      <Typography variant="caption" sx={{ color: '#666', textAlign: 'center' }}>
        Progreso General de Proyectos
      </Typography>
    </Box>
  );
};

const TeamPerformanceWidget = ({ data }) => {
  if (!data?.teamPerformance) return <Typography>Cargando...</Typography>;

  const { efficiency, collaboration, delivery } = data.teamPerformance;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
        Rendimiento del Equipo
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Eficiencia</Typography>
            <Typography variant="caption">{efficiency || 85}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={efficiency || 85} sx={{ height: 4, borderRadius: 2 }} />
        </Box>
        
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Colaboración</Typography>
            <Typography variant="caption">{collaboration || 92}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={collaboration || 92} sx={{ height: 4, borderRadius: 2 }} />
        </Box>
        
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Entregas</Typography>
            <Typography variant="caption">{delivery || 78}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={delivery || 78} sx={{ height: 4, borderRadius: 2 }} />
        </Box>
      </Box>
    </Box>
  );
};

const UpcomingDeadlinesWidget = ({ data }) => {
  if (!data?.upcomingDeadlines) return <Typography>Cargando...</Typography>;

  const deadlines = data.upcomingDeadlines || [
    { name: 'Proyecto Energía Solar', days: 3, type: 'project' },
    { name: 'Análisis de métricas', days: 7, type: 'task' },
    { name: 'Revisión trimestral', days: 14, type: 'milestone' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="h6" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', mb: 1 }}>
        Próximos Vencimientos
      </Typography>
      
      {deadlines.slice(0, 3).map((deadline, index) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>
              {deadline.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {deadline.type === 'project' ? 'Proyecto' : deadline.type === 'task' ? 'Tarea' : 'Hito'}
            </Typography>
          </Box>
          <Chip 
            label={`${deadline.days}d`} 
            size="small" 
            sx={{ 
              bgcolor: deadline.days <= 3 ? '#ffebee' : '#e8f5e9',
              color: deadline.days <= 3 ? '#f44336' : GREEN,
              fontFamily: 'Poppins, sans-serif'
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

const MetricsChartWidget = ({ data }) => {
  if (!data?.metricsChart) return <Typography>Cargando...</Typography>;

  const chartData = {
    labels: data.metricsChart?.labels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Progreso',
      data: data.metricsChart?.values || [65, 72, 68, 85, 79, 88],
      borderColor: GREEN,
      backgroundColor: GREEN + '20',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
};

const TaskProgressWidget = ({ data }) => {
  if (!data?.taskProgress) return <Typography>Cargando...</Typography>;

  const { completed, total, thisWeek } = data.taskProgress;
  const percentage = Math.round((completed / total) * 100) || 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
          {percentage}%
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Tareas Completadas
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          bgcolor: '#e0e0e0',
          '& .MuiLinearProgress-bar': { bgcolor: GREEN }
        }} 
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
            {completed || 24}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Completadas
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
            {thisWeek || 8}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Esta Semana
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const AchievementBadgesWidget = ({ data }) => {
  if (!data?.achievements) return <Typography>Cargando...</Typography>;

  const badges = data.achievements || [
    { name: 'Proyecto Completado', icon: '🏆', earned: true },
    { name: 'Meta Semanal', icon: '⭐', earned: true },
    { name: 'Colaborador Estrella', icon: '🌟', earned: false },
    { name: 'Innovador', icon: '💡', earned: true }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
        Logros
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {badges.map((badge, index) => (
          <Box 
            key={index}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              opacity: badge.earned ? 1 : 0.4,
              p: 1,
              borderRadius: 2,
              bgcolor: badge.earned ? '#f5f5f5' : 'transparent'
            }}
          >
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {badge.icon}
            </Typography>
            <Typography variant="caption" sx={{ 
              textAlign: 'center', 
              fontFamily: 'Poppins, sans-serif',
              color: badge.earned ? '#333' : '#999'
            }}>
              {badge.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardWidgets;
