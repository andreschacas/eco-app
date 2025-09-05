import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  Event,
  MoreVert
} from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/auth/AuthContext';
import dataService from '../utils/dataService';

const GREEN = '#2AAC26';

const CalendarView = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [viewMode, setViewMode] = useState('month');
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    type: 'task',
    priority: 'media',
    projectId: '',
    assignedUsers: []
  });

  useEffect(() => {
    loadCalendarData();
  }, [user]);

  const loadCalendarData = async () => {
    try {
      const userTasks = dataService.getTasksByUser(user.id);
      const allProjects = dataService.getProjects();
      
      const taskEvents = userTasks.map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        description: task.description,
        startDate: new Date(task.due_date),
        endDate: new Date(task.due_date),
        type: 'task',
        priority: task.priority,
        status: task.status,
        projectId: task.project_id,
        projectName: allProjects.find(p => p.id === task.project_id)?.name || 'Sin proyecto',
        assignedUsers: task.assigned_users || [],
        color: getEventColor(task.priority, task.status)
      }));

      setEvents(taskEvents);
      setTasks(userTasks);
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const getEventColor = (priority, status) => {
    if (status === 'Completada') return '#4caf50';
    if (priority === 'Crítica') return '#f44336';
    if (priority === 'Alta') return '#ff9800';
    if (priority === 'Media') return '#2196f3';
    return '#9e9e9e';
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForMonth = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  };

  const handleCreateEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      startDate: selectedDate,
      endDate: selectedDate,
      type: 'task',
      priority: 'media',
      projectId: '',
      assignedUsers: []
    });
    setEventDialogOpen(true);
  };

  const handleSaveEvent = () => {
    console.log('Saving event:', newEvent);
    setEventDialogOpen(false);
    loadCalendarData();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controles de navegación */}
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => handleMonthChange('prev')}
              sx={{ 
                bgcolor: '#f5f5f5',
                '&:hover': { bgcolor: '#e0e0e0' },
                borderRadius: 2
              }}
            >
              <ChevronLeft />
            </IconButton>
            
            <Typography variant="h6" sx={{ 
              minWidth: 200, 
              textAlign: 'center', 
              fontWeight: 600, 
              color: '#333',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Typography>
            
            <IconButton 
              onClick={() => handleMonthChange('next')}
              sx={{ 
                bgcolor: '#f5f5f5',
                '&:hover': { bgcolor: '#e0e0e0' },
                borderRadius: 2
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Today />}
              onClick={handleToday}
              size="small"
              sx={{ 
                borderColor: GREEN, 
                color: GREEN,
                '&:hover': { borderColor: GREEN, bgcolor: `${GREEN}10` }
              }}
            >
              Hoy
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateEvent}
              size="small"
              sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#1f9a1f' } }}
            >
              Nuevo Evento
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Vista del calendario */}
      <Paper sx={{ 
        flex: 1, 
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#f8f9fa'
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              fontFamily: 'Poppins, sans-serif',
              color: '#333'
            }}>
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, p: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
                sx={{
                  width: '100%',
                  '& .MuiPickersDay-root': {
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    position: 'relative'
                  },
                  '& .MuiPickersDay-root.Mui-selected': {
                    bgcolor: GREEN,
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#1f9a1f'
                    }
                  },
                  '& .MuiPickersCalendarHeader-root': {
                    fontFamily: 'Poppins, sans-serif'
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </Box>
      </Paper>

      {/* Dialog para crear eventos */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Nuevo Evento
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha de inicio"
                type="date"
                value={newEvent.startDate.toISOString().split('T')[0]}
                onChange={(e) => setNewEvent({ ...newEvent, startDate: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha de fin"
                type="date"
                value={newEvent.endDate.toISOString().split('T')[0]}
                onChange={(e) => setNewEvent({ ...newEvent, endDate: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEvent}
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#1f9a1f' } }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarView;