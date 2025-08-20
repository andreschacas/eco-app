import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';

import LinearProgress from '@mui/material/LinearProgress';


import AddIcon from '@mui/icons-material/Add';


const GREEN = '#2AAC26';

const Home = ({ onOpenProject }) => {


  const projects = [
    {
      id: 1,
      name: 'Tesis Huella de carbono',
      progress: 55,
      members: [
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2',
        'https://i.pravatar.cc/150?img=3'
      ],
      dueDate: '25 Dic',
      color: '#2196f3',
      bgColor: '#e3f2fd'
    },
    {
      id: 2,
      name: 'Pared verde sustentable',
      progress: 78,
      members: [
        'https://i.pravatar.cc/150?img=4',
        'https://i.pravatar.cc/150?img=5'
      ],
      dueDate: '28 Dic',
      color: '#9c27b0',
      bgColor: '#f3e5f5'
    },
    {
      id: 3,
      name: 'Tesis Huella hidrica',
      progress: 32,
      members: [
        'https://i.pravatar.cc/150?img=6',
        'https://i.pravatar.cc/150?img=7',
        'https://i.pravatar.cc/150?img=8'
      ],
      dueDate: '15 Ene',
      color: '#ff5722',
      bgColor: '#fbe9e7'
    }
  ];

  const todayTasks = [
    {
      id: 1,
      title: 'Revisión y Feedback del Cliente',
      project: 'Rediseño Crypto Wallet',
      time: 'Hoy 22:00 - 23:45',
      completed: false,
      members: [
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2'
      ]
    },
    {
      id: 2,
      title: 'Revisión con el Cliente',
      project: 'Producto del Equipo',
      time: 'Hoy 13:00 - 15:00',
      completed: true,
      members: [
        'https://i.pravatar.cc/150?img=3'
      ]
    },
    {
      id: 3,
      title: 'Sesión de Ideación',
      project: 'App Móvil',
      time: 'Hoy 09:00 - 11:00',
      completed: false,
      members: [
        'https://i.pravatar.cc/150?img=4',
        'https://i.pravatar.cc/150?img=5'
      ]
    },
    {
      id: 4,
      title: 'Crear Wireframe',
      project: 'Diseño Web',
      time: 'Hoy 14:00 - 16:00',
      completed: false,
      members: [
        'https://i.pravatar.cc/150?img=6'
      ]
    }
  ];

  const currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const currentDate = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <Box sx={{ display: 'flex', height: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {/* Projects Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
          Proyectos
        </Typography>
              <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                Tienes {projects.length} proyectos
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: GREEN,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                fontFamily: 'Poppins, sans-serif',
                '&:hover': { bgcolor: '#1f9a1f' }
              }}
                          >
           Agregar
        </Button>
          </Box>

          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} md={4} key={project.id}>
                                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      background: project.bgColor,
                      border: `2px solid ${project.color}`,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                      },
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    onClick={() => onOpenProject && onOpenProject(project)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif', color: project.color }}>
                        {project.name}
                      </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                          Progreso {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: `${project.color}20`,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: project.color,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                        {project.members.map((member, index) => (
                          <Avatar key={index} src={member} alt={`Miembro ${index + 1}`} />
                        ))}
                      </AvatarGroup>
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        {project.dueDate}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>


      </Box>


    </Box>
  );
};

export default Home;
