import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Input,
  Chip
} from '@mui/material';
import { useAuth } from '../context/auth/AuthContext';
import dataService from '../utils/dataService';

const GREEN = '#2AAC26';

const CalendarView = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  // Fecha de hoy para el cálculo dinámico
  const today = new Date();
  
  // Calcular las 5 semanas centradas en la semana que contiene el 8 de septiembre de 2025
  const targetDate = new Date('2025-09-08');
  const weeks = useMemo(() => {
    const weeksArray = [];
    
    // Encontrar el lunes de la semana que contiene el 8 de septiembre
    const targetMonday = new Date(targetDate);
    const dayOfWeek = targetDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    targetMonday.setDate(targetDate.getDate() + daysToMonday);
    
    // Generar 5 semanas consecutivas
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(targetMonday);
      weekStart.setDate(targetMonday.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weeksArray.push({
        number: i + 1,
        start: weekStart,
        end: weekEnd,
        label: `Week ${i + 1}`
      });
    }
    
    return weeksArray;
  }, []);

  // Calcular la posición de la línea "Hoy" dinámicamente
  const todayPosition = useMemo(() => {
    const todayDate = new Date();
    const firstWeekStart = weeks[0]?.start;
    const lastWeekEnd = weeks[4]?.end;
    
    if (!firstWeekStart || !lastWeekEnd) return 0;
    
    // Verificar si hoy está dentro del rango de las 5 semanas
    if (todayDate < firstWeekStart || todayDate > lastWeekEnd) {
      return null; // No mostrar línea si hoy está fuera del rango
    }
    
    // Calcular la posición como porcentaje
    const totalDays = Math.ceil((lastWeekEnd - firstWeekStart) / (1000 * 60 * 60 * 24)) + 1;
    const daysFromStart = Math.ceil((todayDate - firstWeekStart) / (1000 * 60 * 60 * 24));
    
    return (daysFromStart / totalDays) * 100;
  }, [weeks]);

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    try {
      const userTasks = dataService.getTasksByUser(user.id);
      const allProjects = dataService.getProjects();
      
      // Enriquecer tareas con información del proyecto
      const enrichedTasks = userTasks.map(task => {
        const project = allProjects.find(p => p.id === task.project_id);
        return {
          ...task,
          projectName: project?.name || 'Sin proyecto',
          projectColor: project?.color || GREEN
        };
      });

      setTasks(enrichedTasks);
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Función para determinar en qué semanas aparece una tarea
  const getTaskWeeks = (task) => {
    const taskStart = new Date(task.start_date || task.created_at);
    const taskEnd = new Date(task.due_date || task.start_date || task.created_at);
    
    return weeks.map((week, index) => {
      const weekStart = week.start;
      const weekEnd = week.end;
      
      // Verificar si la tarea se superpone con esta semana
      const overlaps = taskStart <= weekEnd && taskEnd >= weekStart;
      
      return {
        weekIndex: index,
        weekNumber: week.number,
        hasTask: overlaps,
        isStart: taskStart >= weekStart && taskStart <= weekEnd,
        isEnd: taskEnd >= weekStart && taskEnd <= weekEnd
      };
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Título del componente */}
      <Typography variant="h4" sx={{ 
        fontWeight: 600, 
        fontFamily: 'Poppins, sans-serif',
        color: '#333',
        mb: 3
      }}>
        Calendario del Proyecto
      </Typography>

      {/* Contenedor principal del Gantt */}
      <Paper sx={{ 
        flex: 1, 
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}>
        {/* Header de Timeline */}
        <Box sx={{ 
          borderBottom: '2px solid #e0e0e0',
          bgcolor: '#f8f9fa'
        }}>
          {/* Input de Mes */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Input
              value="Septiembre 2025"
              readOnly
              sx={{
                fontSize: '1.2rem',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                color: '#333',
                '& .MuiInput-input': {
                  textAlign: 'center',
                  border: 'none',
                  outline: 'none'
                }
              }}
            />
          </Box>

          {/* Semanas */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: '200px repeat(5, 1fr)',
            minHeight: '60px',
            alignItems: 'center'
          }}>
            {/* Columna vacía para alineación */}
            <Box></Box>
            
            {/* Headers de las semanas */}
            {weeks.map((week, index) => (
              <Box key={week.number} sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                borderRight: index < 4 ? '1px solid #e0e0e0' : 'none',
                position: 'relative',
                minHeight: '60px'
              }}>
                <Typography variant="subtitle2" sx={{
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                  color: '#666',
                  mb: 0.5
                }}>
                  {week.label}
                </Typography>
                <Typography variant="caption" sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#999',
                  fontSize: '0.75rem'
                }}>
                  {week.start.getDate()}/{week.start.getMonth() + 1} - {week.end.getDate()}/{week.end.getMonth() + 1}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Área de Tareas */}
        <Box sx={{ position: 'relative' }}>
          {/* Línea de "Hoy" */}
          {todayPosition !== null && (
            <Box sx={{
              position: 'absolute',
              left: `calc(200px + ${todayPosition}%)`,
              top: 0,
              bottom: 0,
              width: '2px',
              bgcolor: '#f44336',
              zIndex: 10,
              '&::before': {
                content: '"Hoy"',
                position: 'absolute',
                top: '-8px',
                left: '-15px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#f44336',
                fontFamily: 'Poppins, sans-serif',
                bgcolor: 'white',
                px: 0.5,
                borderRadius: '4px'
              }
            }} />
          )}

          {/* Lista de Tareas */}
          {tasks.map((task, taskIndex) => {
            const taskWeeks = getTaskWeeks(task);
            
            return (
              <Box key={task.id} sx={{
                display: 'grid',
                gridTemplateColumns: '200px repeat(5, 1fr)',
                minHeight: '50px',
                borderBottom: '1px solid #f0f0f0',
                alignItems: 'center',
                '&:hover': {
                  bgcolor: '#f8f9fa'
                }
              }}>
                {/* Descripción de la tarea */}
                <Box sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderRight: '1px solid #e0e0e0',
                  bgcolor: 'white'
                }}>
                  <Box sx={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    bgcolor: task.projectColor || GREEN,
                    flexShrink: 0
                  }} />
                  <Typography variant="body2" sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {task.title}
                  </Typography>
                </Box>

                {/* Barras de duración para cada semana */}
                {taskWeeks.map((weekInfo, weekIndex) => (
                  <Box key={weekIndex} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    borderRight: weekIndex < 4 ? '1px solid #e0e0e0' : 'none',
                    position: 'relative',
                    minHeight: '50px'
                  }}>
                    {weekInfo.hasTask && (
                      <Box sx={{
                        width: '100%',
                        height: '24px',
                        bgcolor: task.projectColor || GREEN,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        opacity: 0.8,
                        '&:hover': {
                          opacity: 1
                        }
                      }}>
                        {/* Indicadores de inicio y fin */}
                        {weekInfo.isStart && (
                          <Box sx={{
                            position: 'absolute',
                            left: '2px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '0',
                            height: '0',
                            borderLeft: '6px solid white',
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent'
                          }} />
                        )}
                        {weekInfo.isEnd && (
                          <Box sx={{
                            position: 'absolute',
                            right: '2px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '0',
                            height: '0',
                            borderRight: '6px solid white',
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent'
                          }} />
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            );
          })}

          {/* Mensaje si no hay tareas */}
          {tasks.length === 0 && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: '#999'
            }}>
              <Typography variant="body1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                No hay tareas para mostrar
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CalendarView;