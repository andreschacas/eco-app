import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TaskIcon from '@mui/icons-material/Task';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const GREEN = '#2AAC26';

// Notificaciones de ejemplo
const sampleNotifications = [
  {
    id: 1,
    title: 'Nueva tarea asignada',
    message: 'Se te ha asignado la tarea "Revisar diseños de la app" en el proyecto Solar',
    type: 'task',
    priority: 'high',
    timestamp: '2024-01-15T10:30:00',
    read: false,
    user: {
      name: 'Ana García',
      avatar: 'https://i.pravatar.cc/150?img=1'
    }
  },
  {
    id: 2,
    title: 'Reunión programada',
    message: 'Reunión de seguimiento del proyecto Solar mañana a las 10:00 AM',
    type: 'meeting',
    priority: 'medium',
    timestamp: '2024-01-15T09:15:00',
    read: false,
    user: {
      name: 'Carlos Rodríguez',
      avatar: 'https://i.pravatar.cc/150?img=2'
    }
  },
  {
    id: 3,
    title: 'Proyecto completado',
    message: 'El proyecto "Eficiencia Energética" ha sido marcado como completado',
    type: 'success',
    priority: 'low',
    timestamp: '2024-01-15T08:45:00',
    read: true,
    user: {
      name: 'Sistema',
      avatar: null
    }
  },
  {
    id: 4,
    title: 'Recordatorio de entrega',
    message: 'La entrega del informe de sostenibilidad vence en 2 días',
    type: 'warning',
    priority: 'high',
    timestamp: '2024-01-14T16:20:00',
    read: true,
    user: {
      name: 'Laura Fernández',
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  },
  {
    id: 5,
    title: 'Nuevo comentario',
    message: 'María López ha comentado en la tarea "Diseñar logo"',
    type: 'info',
    priority: 'low',
    timestamp: '2024-01-14T14:30:00',
    read: true,
    user: {
      name: 'María López',
      avatar: 'https://i.pravatar.cc/150?img=3'
    }
  }
];

const getNotificationIcon = (type) => {
  switch (type) {
    case 'task': return <TaskIcon />;
    case 'meeting': return <EventIcon />;
    case 'success': return <CheckCircleIcon />;
    case 'warning': return <WarningIcon />;
    case 'info': return <InfoIcon />;
    default: return <NotificationsIcon />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'task': return '#2196f3';
    case 'meeting': return '#ff9800';
    case 'success': return '#4caf50';
    case 'warning': return '#f44336';
    case 'info': return '#2196f3';
    default: return GREEN;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#f44336';
    case 'medium': return '#ff9800';
    case 'low': return '#4caf50';
    default: return '#999';
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Hace unos minutos';
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
};

const NotificationsDialog = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          fontFamily: 'Poppins, sans-serif'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }}>
            <NotificationsIcon sx={{ color: GREEN }} />
          </Badge>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Notificaciones
          </Typography>
        </Box>
        <Box>
          <Button
            size="small"
            onClick={markAllAsRead}
            sx={{ 
              mr: 1, 
              fontSize: '0.75rem',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Marcar todas como leídas
          </Button>
          <IconButton onClick={onClose} size="small">
            <span style={{ fontWeight: 'bold', fontSize: 20 }}>×</span>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Filtros */}
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Todas"
              onClick={() => setFilter('all')}
              color={filter === 'all' ? 'primary' : 'default'}
              size="small"
              sx={{ fontFamily: 'Poppins, sans-serif' }}
            />
            <Chip
              label={`No leídas (${unreadCount})`}
              onClick={() => setFilter('unread')}
              color={filter === 'unread' ? 'primary' : 'default'}
              size="small"
              sx={{ fontFamily: 'Poppins, sans-serif' }}
            />
            <Chip
              label="Alta prioridad"
              onClick={() => setFilter('high')}
              color={filter === 'high' ? 'primary' : 'default'}
              size="small"
              sx={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </Box>
        </Box>

        {/* Lista de notificaciones */}
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : '#f8f9fa',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    cursor: 'pointer'
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: getNotificationColor(notification.type),
                        width: 40,
                        height: 40
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read ? 500 : 600,
                            fontFamily: 'Poppins, sans-serif',
                            color: notification.read ? '#666' : '#333'
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.priority === 'high' ? 'Alta' : 
                                 notification.priority === 'medium' ? 'Media' : 'Baja'}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(notification.priority),
                            color: '#fff',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: GREEN,
                              ml: 'auto'
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#666',
                            fontFamily: 'Poppins, sans-serif',
                            mb: 0.5
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#999',
                              fontFamily: 'Poppins, sans-serif'
                            }}
                          >
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                          {notification.user.name !== 'Sistema' && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#999',
                                fontFamily: 'Poppins, sans-serif'
                              }}
                            >
                              • Por {notification.user.name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    sx={{ color: '#999' }}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: 16 }}>×</span>
                  </IconButton>
                </ListItem>
                {index < filteredNotifications.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                No hay notificaciones
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationsDialog; 