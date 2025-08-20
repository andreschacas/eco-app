import React, { useState, useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuth } from '../../context/auth/AuthContext';
import dataService from '../../utils/dataService';
import CalendarDialog from '../common/CalendarDialog';
import NotificationsDialog from '../common/NotificationsDialog';

const GREEN = '#2AAC26';

const NavbarAdvanced = ({ onNavigate, ...props }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Estado para búsqueda global
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    logout();
  };

  // Búsqueda global inteligente con debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performGlobalSearch(searchQuery);
      } else {
        setSearchResults([]);
        setSearchOpen(false);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performGlobalSearch = async (query) => {
    setIsSearching(true);
    const results = [];
    const lowerQuery = query.toLowerCase();

    try {
      // Simular delay de búsqueda para mejor UX
      await new Promise(resolve => setTimeout(resolve, 200));

      // Buscar usuarios
      const users = dataService.getAll('users').filter(user => 
        user.active && (
          user.name.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
        )
      ).slice(0, 3);

      users.forEach(user => {
        results.push({
          type: 'user',
          id: user.id,
          title: user.name,
          subtitle: user.email,
          icon: <PersonIcon />,
          action: () => handleSearchSelect('user', user.id),
          score: calculateScore(user.name + ' ' + user.email, query)
        });
      });

      // Buscar proyectos
      const projects = dataService.getAll('projects').filter(project => 
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery)
      ).slice(0, 3);

      projects.forEach(project => {
        results.push({
          type: 'project',
          id: project.id,
          title: project.name,
          subtitle: project.description.substring(0, 50) + (project.description.length > 50 ? '...' : ''),
          icon: <FolderIcon />,
          action: () => handleSearchSelect('project', project.id),
          score: calculateScore(project.name + ' ' + project.description, query)
        });
      });

      // Buscar tareas (filtradas por rol)
      let tasks = dataService.getAll('tasks');
      
      if (user) {
        switch (user.role) {
          case 'Coordinador':
            const coordinatorProjects = dataService.getProjectsByCoordinator(user.id);
            const projectIds = coordinatorProjects.map(p => p.id);
            tasks = tasks.filter(task => projectIds.includes(task.project_id));
            break;
          case 'Participante':
            tasks = dataService.getTasksByUser(user.id);
            break;
          // Administrador ve todas las tareas
        }
      }

      const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery)
      ).slice(0, 3);

      filteredTasks.forEach(task => {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          subtitle: task.description.substring(0, 50) + (task.description.length > 50 ? '...' : ''),
          icon: <AssignmentIcon />,
          action: () => handleSearchSelect('task', task.id),
          score: calculateScore(task.title + ' ' + task.description, query)
        });
      });

      // Ordenar por relevancia
      results.sort((a, b) => b.score - a.score);
      
      setSearchResults(results);
      setSearchOpen(results.length > 0 || query.length >= 2);
    } catch (error) {
      console.error('Error in search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateScore = (text, query) => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Puntuación base por coincidencia exacta
    if (lowerText.includes(lowerQuery)) {
      const index = lowerText.indexOf(lowerQuery);
      // Más puntos si aparece al principio
      return 100 - index + (lowerQuery.length * 10);
    }
    
    // Puntuación por palabras parciales
    const words = lowerQuery.split(' ');
    let score = 0;
    words.forEach(word => {
      if (lowerText.includes(word)) {
        score += word.length * 5;
      }
    });
    
    return score;
  };

  const handleSearchSelect = (type, id) => {
    setSearchQuery('');
    setSearchOpen(false);
    
    switch (type) {
      case 'user':
        onNavigate('user-profile', { userId: id });
        break;
      case 'project':
        onNavigate('project-detail', { projectId: id });
        break;
      case 'task':
        // Determinar la vista Kanban correcta según el rol
        let kanbanView = 'admin-kanban';
        if (user?.role === 'Coordinador') {
          kanbanView = 'coordinator-kanban';
        } else if (user?.role === 'Participante') {
          kanbanView = 'participant-kanban';
        }
        onNavigate(kanbanView, { highlightTask: id });
        break;
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value.length >= 2) {
      setIsSearching(true);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      setSearchQuery('');
      setSearchOpen(false);
    } else if (event.key === 'Enter' && searchResults.length > 0) {
      searchResults[0].action();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
    setSearchResults([]);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'user': return '#2196f3';
      case 'project': return GREEN;
      case 'task': return '#ff9800';
      default: return '#666';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'user': return 'Usuario';
      case 'project': return 'Proyecto';
      case 'task': return 'Tarea';
      default: return '';
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <span style={{ backgroundColor: '#fff3cd', fontWeight: 600 }}>
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <>
      <AppBar 
        position="static" 
        color="default" 
        elevation={0} 
        sx={{ 
          borderBottom: '1px solid #f0f0f0', 
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)', 
          color: '#222', 
          fontFamily: 'Poppins, sans-serif' 
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 4, width: '100%' }}>
          
          {/* Búsqueda Global Inteligente */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', px: 3, position: 'relative' }}>
            <Box 
              ref={searchRef}
              sx={{ 
                width: '100%',
                position: 'relative',
                maxWidth: '90%'
              }}
            >
              <InputBase
                placeholder="Buscar usuarios, proyectos, tareas..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                sx={{
                  width: '100%',
                  bgcolor: '#f5f6fa',
                  borderRadius: 3,
                  pl: 5,
                  pr: searchQuery ? 5 : 2,
                  py: 1,
                  fontSize: 15,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: '1px solid #e0e0e0',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: GREEN,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  },
                  '&.Mui-focused': {
                    borderColor: GREEN,
                    boxShadow: `0 4px 20px rgba(42, 172, 38, 0.15)`,
                    transform: 'translateY(-1px)',
                    bgcolor: '#fff'
                  }
                }}
                inputProps={{ 'aria-label': 'búsqueda global' }}
                startAdornment={
                  <Box sx={{ 
                    position: 'absolute', 
                    left: 15, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: isSearching ? GREEN : '#bbb',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {isSearching ? (
                      <CircularProgress size={20} sx={{ color: GREEN }} />
                    ) : (
                      <SearchIcon />
                    )}
                  </Box>
                }
                endAdornment={
                  searchQuery && (
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      sx={{ 
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                        '&:hover': { color: '#f44336' }
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }
              />

              {/* Dropdown de Resultados */}
              <Popper
                open={searchOpen}
                anchorEl={searchRef.current}
                placement="bottom-start"
                style={{ 
                  zIndex: 9999, 
                  width: searchRef.current?.offsetWidth || 300,
                  maxWidth: 600
                }}
                transition
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={200}>
                    <Paper
                      elevation={12}
                      sx={{
                        mt: 1,
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                        maxHeight: 500,
                        overflowY: 'auto',
                        background: 'linear-gradient(135deg, #fff 0%, #fafbfc 100%)'
                      }}
                    >
                      <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                        <List sx={{ p: 0 }}>
                          {searchResults.length > 0 && (
                            <ListItem sx={{ bgcolor: '#f8f9fa', py: 1, borderBottom: '1px solid #e9ecef' }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                              </Typography>
                            </ListItem>
                          )}
                          {searchResults.map((result, index) => (
                            <React.Fragment key={`${result.type}-${result.id}`}>
                              <ListItem disablePadding>
                                <ListItemButton
                                  onClick={result.action}
                                  sx={{
                                    py: 2,
                                    px: 3,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: `${getTypeColor(result.type)}10`,
                                      transform: 'translateX(4px)'
                                    }
                                  }}
                                >
                                  <ListItemIcon
                                    sx={{ 
                                      minWidth: 48,
                                      color: getTypeColor(result.type)
                                    }}
                                  >
                                    {result.icon}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                                          {highlightMatch(result.title, searchQuery)}
                                        </Typography>
                                        <Chip
                                          label={getTypeLabel(result.type)}
                                          size="small"
                                          sx={{
                                            bgcolor: `${getTypeColor(result.type)}20`,
                                            color: getTypeColor(result.type),
                                            fontSize: '10px',
                                            height: 20,
                                            fontWeight: 600
                                          }}
                                        />
                                      </Box>
                                    }
                                    secondary={
                                      <Typography variant="caption" sx={{ color: '#666', lineHeight: 1.3 }}>
                                        {highlightMatch(result.subtitle, searchQuery)}
                                      </Typography>
                                    }
                                  />
                                </ListItemButton>
                              </ListItem>
                              {index < searchResults.length - 1 && <Divider sx={{ mx: 3 }} />}
                            </React.Fragment>
                          ))}
                          {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                            <ListItem>
                              <ListItemText
                                primary={
                                  <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <SearchIcon sx={{ fontSize: 48, color: '#ddd', mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                                      No se encontraron resultados
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                      para "{searchQuery}"
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          )}
                          {searchQuery.length >= 2 && (
                            <ListItem sx={{ bgcolor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
                              <Typography variant="caption" sx={{ color: '#999', textAlign: 'center', width: '100%' }}>
                                Presiona Enter para ir al primer resultado • Esc para cerrar
                              </Typography>
                            </ListItem>
                          )}
                        </List>
                      </ClickAwayListener>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </Box>
          </Box>

          {/* Iconos de navegación y usuario */}
          <Stack direction="row" alignItems="center" spacing={3} sx={{ pr: 2 }}>
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1} 
              sx={{ 
                color: '#888', 
                fontSize: 15, 
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                p: 1.5,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f5f6fa',
                  color: GREEN,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                bgcolor: '#f8fffe',
                border: `1px solid ${GREEN}20`,
                borderRadius: 2,
                p: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#e8f5e9',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(42, 172, 38, 0.2)',
                  borderColor: GREEN
                }
              }}
              onClick={() => setNotificationsOpen(true)}
            >
              <NotificationsNoneIcon sx={{ fontSize: 24 }} />
            </IconButton>
            
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton 
                onClick={handleMenu} 
                size="small" 
                sx={{ 
                  p: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.name} 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    border: `2px solid ${GREEN}30`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      border: `2px solid ${GREEN}`
                    }
                  }} 
                />
              </IconButton>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  fontFamily: 'Poppins, sans-serif', 
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  '&:hover': { color: GREEN }
                }} 
                onClick={handleMenu}
              >
                {user?.name}
              </Typography>
              <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                  }
                }}
              >
                <MenuItem disabled sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Rol: {user?.role}
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    color: '#f44336', 
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': { bgcolor: '#ffebee' }
                  }}
                >
                  Cerrar sesión
                </MenuItem>
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
      />

      {/* Estilos CSS para animaciones */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </>
  );
};

export default NavbarAdvanced;
