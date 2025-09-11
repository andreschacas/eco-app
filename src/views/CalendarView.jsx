import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  CalendarMonth,
  Refresh,
  Today,
  Clear,
  ChevronLeft,
  ChevronRight,
  Assignment,
  CheckCircle,
  Pending,
  PlayArrow,
  CalendarToday
} from '@mui/icons-material';
import { useAuth } from '../context/auth/AuthContext';
import dataService from '../utils/dataService';
import StaticGanttChart from '../components/gantt/StaticGanttChart';

const GREEN = '#2AAC26';

const CalendarView = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Cargar todos los proyectos
      const allProjects = dataService.getAll('projects');
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
    console.log('CalendarView - Proyecto cambiado a:', event.target.value);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    console.log('CalendarView - Navegando a hoy:', today.toISOString().split('T')[0]);
  };

  const handleClearFilters = () => {
    setSelectedProject('all');
  };

  const getMonthName = (date) => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[date.getMonth()];
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>

      {/* Barra de filtros */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
            Proyecto:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Proyecto</InputLabel>
            <Select
              value={selectedProject}
              onChange={handleProjectChange}
              label="Proyecto"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: GREEN,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: GREEN,
                }
              }}
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Todos los proyectos</Typography>
                  <Chip
                    label={`${projects.length} proyectos`}
                    size="small"
                    sx={{ fontSize: '10px', height: 20 }}
                  />
                </Box>
              </MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id.toString()}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>{project.name}</Typography>
                    <Chip
                      label={project.status || 'Activo'}
                      size="small"
                      sx={{
                        fontSize: '10px',
                        height: 20,
                        bgcolor: project.status === 'Completado' ? '#e8f5e9' : '#e3f2fd',
                        color: project.status === 'Completado' ? '#2e7d32' : '#1976d2'
                      }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={handleClearFilters}
            sx={{
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#d32f2f',
                color: '#d32f2f',
                backgroundColor: '#ffebee'
              }
            }}
          >
            Limpiar
          </Button>
        </Box>
      </Paper>

      {/* Contenedor principal del Gantt */}
      <Box sx={{ flex: 1, borderRadius: 2, overflow: 'hidden' }}>
        <StaticGanttChart 
          key={`${selectedProject}-${currentDate.getFullYear()}-${currentDate.getMonth()}`} // Forzar re-render cuando cambie el proyecto o fecha
          projectId={selectedProject === 'all' ? null : parseInt(selectedProject)}
          filterByRole={false}
          initialDate={currentDate}
        />
      </Box>
    </Box>
  );
};

export default CalendarView;