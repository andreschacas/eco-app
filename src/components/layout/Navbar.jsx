import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import logo from '../../assets/eco-logo-pro.png';
import { useAuth } from '../../context/auth/AuthContext';
import CalendarDialog from '../common/CalendarDialog';
import NotificationsDialog from '../common/NotificationsDialog';
import NotificationModal from '../notifications/NotificationModal';
import notificationService from '../../utils/notificationService';

const GREEN = '#2AAC26';

const Navbar = ({ user: userProp, ...props }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    logout();
  };
  const userData = user || userProp;

  // Cargar contador de notificaciones no leídas
  useEffect(() => {
    const loadUnreadCount = () => {
      if (userData?.id) {
        const count = notificationService.getUnreadCountByUser(userData.id);
        setUnreadCount(count);
      }
    };

    loadUnreadCount();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [notificationsOpen, userData?.id]);

  // Función para actualizar el contador cuando se marquen notificaciones como leídas
  const handleNotificationRead = () => {
    if (userData?.id) {
      const count = notificationService.getUnreadCountByUser(userData.id);
      setUnreadCount(count);
    }
  };

  // Verificar si el usuario puede enviar notificaciones
  const canSendNotifications = userData?.role === 'admin' || userData?.role === 'coordinator';

  return (
    <>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #f0f0f0', background: '#fff', color: '#222', fontFamily: 'Poppins, sans-serif' }}>
        <Toolbar sx={{ minHeight: 64, px: 3 }}>
          
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', px: 2 }}>
            <InputBase
              placeholder="Buscar..."
              sx={{
                width: '100%',
                bgcolor: '#f5f6fa',
                borderRadius: 2,
                pl: 5,
                pr: 2,
                py: 1,
                fontSize: 15,
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                fontFamily: 'Poppins, sans-serif',
                maxWidth: '600px',
                '&:hover': {
                  borderColor: GREEN,
                },
                '&.Mui-focused': {
                  borderColor: GREEN,
                  boxShadow: '0 0 0 2px rgba(42, 172, 38, 0.1)',
                }
              }}
              inputProps={{ 'aria-label': 'buscar' }}
              startAdornment={
                <Box sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#bbb' }}>
                  <SearchIcon />
                </Box>
              }
            />
          </Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1} 
              sx={{ 
                color: '#888', 
                fontSize: 15, 
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: '#f5f6fa',
                  color: GREEN
                }
              }}
              onClick={() => setCalendarOpen(true)}
            >
              <CalendarMonthIcon fontSize="small" />
              <span>Ene 24 - Feb 24 2025</span>
            </Stack>
            <IconButton 
              size="large" 
              sx={{ 
                color: GREEN,
                '&:hover': {
                  bgcolor: '#e8f5e9'
                }
              }}
              onClick={() => setNotificationsOpen(true)}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={handleMenu} size="small" sx={{ p: 0 }}>
                <Avatar src={userData?.avatar} alt={userData?.name} sx={{ width: 32, height: 32 }} />
              </IconButton>
              <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }} onClick={handleMenu}>
                {userData?.name}
              </Typography>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem disabled>Rol: {userData?.role}</MenuItem>
                {canSendNotifications && (
                  <MenuItem onClick={() => { setNotificationModalOpen(true); handleClose(); }}>
                    Enviar Notificación
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout} sx={{ color: 'red', fontWeight: 600 }}>Cerrar sesión</MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Diálogos */}
      <CalendarDialog 
        open={calendarOpen} 
        onClose={() => setCalendarOpen(false)} 
      />
      <NotificationsDialog 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
        currentUser={userData}
        onNotificationRead={handleNotificationRead}
      />
      {canSendNotifications && (
        <NotificationModal
          open={notificationModalOpen}
          onClose={() => setNotificationModalOpen(false)}
          currentUser={userData}
        />
      )}
    </>
  );
};

export default Navbar; 