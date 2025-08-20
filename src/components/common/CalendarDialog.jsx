import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';

const GREEN = '#2AAC26';

// Eventos de ejemplo
const sampleEvents = [
  {
    id: 1,
    title: 'Reunión de Proyecto Solar',
    date: '2024-01-15',
    time: '10:00',
    type: 'meeting',
    description: 'Revisión del progreso del proyecto solar'
  },
  {
    id: 2,
    title: 'Entrega de Diseños',
    date: '2024-01-18',
    time: '14:00',
    type: 'deadline',
    description: 'Entrega final de diseños para la app'
  },
  {
    id: 3,
    title: 'Auditoría Ambiental',
    date: '2024-01-20',
    time: '09:00',
    type: 'audit',
    description: 'Auditoría de sostenibilidad en oficinas'
  },
  {
    id: 4,
    title: 'Capacitación Equipo',
    date: '2024-01-22',
    time: '16:00',
    type: 'training',
    description: 'Capacitación sobre nuevas herramientas'
  }
];

const getEventColor = (type) => {
  switch (type) {
    case 'meeting': return '#2196f3';
    case 'deadline': return '#f44336';
    case 'audit': return '#ff9800';
    case 'training': return '#4caf50';
    default: return GREEN;
  }
};

const getEventIcon = (type) => {
  switch (type) {
    case 'meeting': return '👥';
    case 'deadline': return '⏰';
    case 'audit': return '📋';
    case 'training': return '🎓';
    default: return '📅';
  }
};

const CalendarDialog = ({ open, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const eventsForSelectedDate = sampleEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() - 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          <EventIcon sx={{ color: GREEN, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Calendario
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <span style={{ fontWeight: 'bold', fontSize: 20 }}>×</span>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Calendario */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </Typography>
                <Box>
                  <IconButton onClick={() => handleMonthChange('prev')} size="small">
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton onClick={() => handleMonthChange('next')} size="small">
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DateCalendar
                  value={selectedDate}
                  onChange={handleDateChange}
                  sx={{
                    '& .MuiPickersDay-root': {
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500
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
            </Paper>
          </Grid>

          {/* Eventos del día seleccionado */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 3, height: 'fit-content' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TodayIcon sx={{ color: GREEN, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  {formatDate(selectedDate)}
                </Typography>
              </Box>

              {eventsForSelectedDate.length > 0 ? (
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2, fontFamily: 'Poppins, sans-serif' }}>
                    {eventsForSelectedDate.length} evento{eventsForSelectedDate.length > 1 ? 's' : ''} programado{eventsForSelectedDate.length > 1 ? 's' : ''}
                  </Typography>
                  
                  {eventsForSelectedDate.map((event) => (
                    <Paper
                      key={event.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        border: `2px solid ${getEventColor(event.type)}`,
                        borderRadius: 2,
                        bgcolor: `${getEventColor(event.type)}08`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <span style={{ fontSize: 20, marginRight: 8 }}>
                          {getEventIcon(event.type)}
                        </span>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                            {event.time} - {event.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={event.type === 'meeting' ? 'Reunión' : 
                               event.type === 'deadline' ? 'Entrega' :
                               event.type === 'audit' ? 'Auditoría' : 'Capacitación'}
                        size="small"
                        sx={{
                          bgcolor: getEventColor(event.type),
                          color: '#fff',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                    No hay eventos programados para este día
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<span style={{ fontWeight: 'bold' }}>+</span>}
                sx={{
                  mt: 2,
                  borderColor: GREEN,
                  color: GREEN,
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': {
                    borderColor: '#1f9a1f',
                    bgcolor: '#e8f5e9'
                  }
                }}
              >
                Agregar Evento
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarDialog; 