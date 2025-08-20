import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import NavbarAdvanced from './components/layout/NavbarAdvanced';
import Sidebar from './components/layout/Sidebar';
import Home from './views/projects/Home';
import ProjectsView from './views/projects/Projects';
import TasksToday from './views/tasks/TasksToday';
import KanbanView from './views/kanban/KanbanView';
import ParticipantsView from './views/ParticipantsView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import HelpView from './views/HelpView';

// New role-based views
import AdminDashboard from './views/admin/AdminDashboard';
import AdminUsers from './views/admin/AdminUsers';
import AdminProjects from './views/admin/AdminProjects';
import CoordinatorDashboard from './views/coordinator/CoordinatorDashboard';
import ProjectDetail from './views/coordinator/ProjectDetail';
import ParticipantDashboard from './views/participant/ParticipantDashboard';

// Kanban and new views
import KanbanBoardNew from './components/kanban/KanbanBoardNew';
import CoordinatorProjects from './views/coordinator/CoordinatorProjects';
import CoordinatorMetrics from './views/coordinator/CoordinatorMetrics';
import CoordinatorParticipants from './views/coordinator/CoordinatorParticipants';
import ParticipantProjects from './views/participant/ParticipantProjects';

// Nuevos componentes avanzados
import ProjectDetailSimple from './views/common/ProjectDetailSimple';
import UserProfile from './views/common/UserProfile';
import DashboardWidgets from './components/dashboard/DashboardWidgets';
import cacheService from './utils/cacheService';

import Auth from './views/Auth';
import { AuthProvider, useAuth } from './context/auth/AuthContext';

const VIEWS = {
  // Legacy views (mantener compatibilidad)
  HOME: 'home',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  KANBAN: 'kanban',
  PARTICIPANTS: 'participants',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  HELP: 'help',
  
  // New role-based views
  ADMIN_DASHBOARD: 'admin-dashboard',
  ADMIN_USERS: 'admin-users',
  ADMIN_PROJECTS: 'admin-projects',
  ADMIN_KANBAN: 'admin-kanban',
  COORDINATOR_DASHBOARD: 'coordinator-dashboard',
  COORDINATOR_PROJECTS: 'coordinator-projects',
  COORDINATOR_KANBAN: 'coordinator-kanban',
  COORDINATOR_METRICS: 'coordinator-metrics',
  COORDINATOR_PARTICIPANTS: 'coordinator-participants',
  PROJECT_DETAIL: 'project-detail',
  PROJECT_DETAIL_ADVANCED: 'project-detail-advanced',
  USER_PROFILE: 'user-profile',
  PARTICIPANT_DASHBOARD: 'participant-dashboard',
  PARTICIPANT_KANBAN: 'participant-kanban',
  PARTICIPANT_PROJECTS: 'participant-projects'
};

function MainApp() {
  const [view, setView] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewParams, setViewParams] = useState({});
  const { user, getDefaultView, loading } = useAuth();

  // Set default view based on user role
  React.useEffect(() => {
    if (user && !view) {
      const defaultView = getDefaultView();
      setView(defaultView || VIEWS.HOME);
      // Prefetch common data for better performance
      cacheService.prefetchCommonData();
    }
  }, [user, view, getDefaultView]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (!user) return <Auth />;

  // Navigation handler with advanced routing
  const handleNavigate = (newView, params = null) => {
    setView(newView);
    setViewParams(params || {});
    
    // Legacy support for project navigation
    if (params && typeof params === 'object') {
      if (params.projectId) {
        setSelectedProject({ id: params.projectId });
      } else if (!params.userId && !params.highlightTask) {
        setSelectedProject(params);
      }
    }
  };

  let content;
  
  // Role-based views (PRIORITY) - CON WIDGETS AVANZADOS
  if (view === VIEWS.ADMIN_DASHBOARD) {
    content = <AdminDashboard onNavigate={handleNavigate} />;
  } else if (view === VIEWS.ADMIN_USERS) {
    content = <AdminUsers onNavigate={handleNavigate} />;
  } else if (view === VIEWS.ADMIN_PROJECTS) {
    content = <AdminProjects onNavigate={handleNavigate} />;
  } else if (view === VIEWS.ADMIN_KANBAN) {
    content = <KanbanBoardNew filterByRole={true} highlightTask={viewParams.highlightTask} />;
  } else if (view === VIEWS.COORDINATOR_DASHBOARD) {
    content = <CoordinatorDashboard onNavigate={handleNavigate} />;
  } else if (view === VIEWS.COORDINATOR_PROJECTS) {
    content = <CoordinatorProjects onNavigate={handleNavigate} />;
  } else if (view === VIEWS.COORDINATOR_KANBAN) {
    content = <KanbanBoardNew filterByRole={true} highlightTask={viewParams.highlightTask} />;
  } else if (view === VIEWS.COORDINATOR_METRICS) {
    content = <CoordinatorMetrics onNavigate={handleNavigate} />;
  } else if (view === VIEWS.COORDINATOR_PARTICIPANTS) {
    content = <CoordinatorParticipants onNavigate={handleNavigate} />;
  } else if (view === VIEWS.PROJECT_DETAIL) {
    content = <ProjectDetail project={selectedProject} onNavigate={handleNavigate} />;
  } else if (view === VIEWS.PROJECT_DETAIL_ADVANCED) {
    content = (
      <ProjectDetailSimple 
        project={selectedProject} 
        onBack={() => handleNavigate(getDefaultView())}
        onNavigate={handleNavigate}
      />
    );
  } else if (view === VIEWS.USER_PROFILE) {
    content = (
      <UserProfile 
        userId={viewParams.userId} 
        onBack={() => handleNavigate(getDefaultView())}
        onNavigate={handleNavigate}
      />
    );
  } else if (view === VIEWS.PARTICIPANT_DASHBOARD) {
    content = <ParticipantDashboard onNavigate={handleNavigate} />;
  } else if (view === VIEWS.PARTICIPANT_KANBAN) {
    content = <KanbanBoardNew filterByRole={true} highlightTask={viewParams.highlightTask} />;
  } else if (view === VIEWS.PARTICIPANT_PROJECTS) {
    content = <ParticipantProjects onNavigate={handleNavigate} />;
  } else if (view === VIEWS.SETTINGS) {
    content = <SettingsView onNavigate={handleNavigate} />;
  }
  
  // Legacy views (mantener compatibilidad)
  else if (view === VIEWS.HOME) {
    content = (
      <Home
        onOpenProject={(project) => {
          setSelectedProject(project);
          setView(VIEWS.PROJECTS);
        }}
      />
    );
  } else if (view === VIEWS.PROJECTS) {
    content = (
      <ProjectsView
        project={selectedProject}
        onBack={() => setView(VIEWS.HOME)}
      />
    );
  }
  else if (view === VIEWS.TASKS) content = <TasksToday />;
  else if (view === VIEWS.KANBAN) content = <KanbanView />;
  else if (view === VIEWS.PARTICIPANTS) content = <ParticipantsView />;
  else if (view === VIEWS.REPORTS) content = <ReportsView />;
  else if (view === VIEWS.SETTINGS) content = <SettingsView />;
  else if (view === VIEWS.HELP) content = <HelpView />;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f6fa' }}>
      <CssBaseline />
      <Sidebar onNavigate={handleNavigate} current={view} user={user} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavbarAdvanced onNavigate={handleNavigate} current={view} />
        <Box sx={{ flex: 1, p: 3 }}>{content}</Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
