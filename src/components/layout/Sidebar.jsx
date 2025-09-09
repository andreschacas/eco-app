import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TodayIcon from '@mui/icons-material/Today';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import logo from '../../assets/eco-logo-pro.png';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const Sidebar = ({ onNavigate, current, user: userProp, onCalendarNavigation, onToggleSidebar, sidebarCollapsed }) => {
  const { user: authUser } = useAuth();
  const user = userProp || authUser;
  const [currentDate, setCurrentDate] = useState(new Date());
  
  if (!user) return null;
  
  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { label: 'Reportes', icon: <BarChartIcon />, key: 'reports' },
      { label: 'Configuración', icon: <SettingsIcon />, key: 'settings' },
      { label: 'Ayuda', icon: <HelpOutlineIcon />, key: 'help' },
    ];
    
    switch (user.role) {
      case 'Administrador':
        return [
          { label: 'Dashboard', icon: <HomeIcon />, key: 'admin-dashboard' },
          { label: 'Gestión de Proyectos', icon: <FolderOpenIcon />, key: 'admin-projects' },
          { label: 'Gestión de Usuarios', icon: <GroupIcon />, key: 'admin-users' },
          { label: 'Tareas (Kanban)', icon: <AssignmentIcon />, key: 'admin-kanban' },
          ...baseItems
        ];
      
      case 'Coordinador':
        return [
          { label: 'Dashboard', icon: <HomeIcon />, key: 'coordinator-dashboard' },
          { label: 'Mis Proyectos', icon: <FolderOpenIcon />, key: 'coordinator-projects' },
          { label: 'Tareas (Kanban)', icon: <AssignmentIcon />, key: 'coordinator-kanban' },
          { label: 'Métricas', icon: <BarChartIcon />, key: 'coordinator-metrics' },
          { label: 'Participantes', icon: <GroupIcon />, key: 'coordinator-participants' },
          ...baseItems
        ];
      
      case 'Participante':
        return [
          { label: 'Dashboard', icon: <HomeIcon />, key: 'participant-dashboard' },
          { label: 'Mis Tareas (Kanban)', icon: <AssignmentIcon />, key: 'participant-kanban' },
          { label: 'Mis Proyectos', icon: <FolderOpenIcon />, key: 'participant-projects' },
          ...baseItems
        ];
      
      default:
        // Legacy menu items for backward compatibility
        return [
          { label: 'Inicio', icon: <HomeIcon />, key: 'home' },
          { label: 'Proyectos', icon: <FolderOpenIcon />, key: 'projects' },
          { label: 'Tarea de hoy', icon: <TodayIcon />, key: 'tasks' },
          { label: 'Todas las tareas', icon: <ListAltIcon />, key: 'alltasks' },
          { label: 'Calendario', icon: <CalendarMonthIcon />, key: 'calendar' },
          { label: 'Gantt', icon: <TimelineIcon />, key: 'gantt' },
          { label: 'Reportes', icon: <BarChartIcon />, key: 'reports' },
          { label: 'Participantes', icon: <GroupIcon />, key: 'participants' },
          ...baseItems
        ];
    }
  };
  
  const menuItems = getMenuItems();

  // Funciones para navegación del calendario
  const handleCalendarNavigation = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    if (onCalendarNavigation) {
      onCalendarNavigation(newDate);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (onCalendarNavigation) {
      onCalendarNavigation(today);
    }
  };

  // Verificar si estamos en la sección del calendario
  const isCalendarSection = current === 'calendar' || current === 'admin-calendar' || 
                           current === 'coordinator-calendar' || current === 'participant-calendar';

  return (
    <>
      <Drawer 
        variant="permanent" 
        anchor="left" 
        sx={{ 
          width: sidebarCollapsed ? 0 : 260, 
          flexShrink: 0, 
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': { 
            width: sidebarCollapsed ? 0 : 260, 
            boxSizing: 'border-box', 
            borderRight: '1px solid #f0f0f0', 
            pt: 2, 
            fontFamily: 'Poppins, sans-serif', 
            background: '#fff',
            transition: 'width 0.3s ease',
            overflow: 'hidden'
          } 
        }}
      >
        {/* Logo y nombre */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Logo" style={{ width: 32, height: 32, marginRight: 10 }} />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, letterSpacing: 0.5 }}>
              <span style={{ fontWeight: 700, color: '#2AAC26' }}>Green</span>
              <span style={{ fontWeight: 700, color: '#121212' }}>Tech</span>
            </span>
          </Box>
          
          {/* Botón para colapsar el sidebar */}
          <IconButton
            size="small"
            onClick={() => onToggleSidebar && onToggleSidebar()}
            sx={{
              bgcolor: '#f5f5f5',
              '&:hover': {
                bgcolor: '#e0e0e0'
              },
              transition: 'all 0.2s ease',
              ml: 1
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {/* User Info */}
        <Box sx={{ px: 2, mb: 3, pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: '#44b883', 
              mr: 1 
            }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                {user.role}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ color: '#8B8B8B', fontSize: 13, fontWeight: 600, letterSpacing: 0.5, px: 2, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
          MENU
        </Box>
        
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={current === item.key}
                onClick={() => onNavigate(item.key)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  height: 40,
                  background: current === item.key ? GREEN : 'transparent',
                  color: current === item.key ? '#fff' : '#222',
                  fontWeight: current === item.key ? 700 : 500,
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': {
                    background: current === item.key ? GREEN : '#f5f6fa',
                  },
                  transition: 'background 0.2s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: current === item.key ? GREEN : '#8B8B8B', opacity: current === item.key ? 0.95 : 1 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: current === item.key ? 700 : 500, 
                    fontSize: 15, 
                    fontFamily: 'Poppins, sans-serif' 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Botón de navegación del calendario - Solo visible cuando estamos en la sección del calendario */}
        {isCalendarSection && (
          <Box>
            <Divider sx={{ mx: 2, my: 2 }} />
            <Box sx={{ px: 2, mb: 2 }}>
              <Typography variant="caption" sx={{ 
                color: '#8B8B8B', 
                fontSize: 12, 
                fontWeight: 600, 
                letterSpacing: 0.5, 
                fontFamily: 'Poppins, sans-serif',
                mb: 1,
                display: 'block'
              }}>
                NAVEGACIÓN DEL CALENDARIO
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 1.5,
                border: '1px solid #e0e0e0'
              }}>
                <IconButton 
                  size="small"
                  onClick={() => handleCalendarNavigation('prev')}
                  sx={{ 
                    bgcolor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': { 
                      bgcolor: '#f5f5f5',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                
                <Box sx={{ textAlign: 'center', flex: 1, mx: 1 }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    fontFamily: 'Poppins, sans-serif',
                    color: '#333',
                    fontSize: 13
                  }}>
                    {currentDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>
                
                <IconButton 
                  size="small"
                  onClick={() => handleCalendarNavigation('next')}
                  sx={{ 
                    bgcolor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': { 
                      bgcolor: '#f5f5f5',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <IconButton 
                  size="small"
                  onClick={handleToday}
                  sx={{ 
                    width: '100%',
                    bgcolor: GREEN,
                    color: '#fff',
                    borderRadius: 2,
                    py: 1,
                    '&:hover': { 
                      bgcolor: '#1f9a1f',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TodayIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption" sx={{ 
                    fontWeight: 600, 
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12
                  }}>
                    Hoy
                  </Typography>
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Botón flotante para expandir sidebar cuando está colapsado */}
      {sidebarCollapsed && (
        <IconButton
          onClick={onToggleSidebar}
          sx={{
            position: 'fixed',
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
          <ChevronRightIcon />
        </IconButton>
      )}
    </>
  );
};

export default Sidebar;