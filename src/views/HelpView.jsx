import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import BookIcon from '@mui/icons-material/Book';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

const GREEN = '#2AAC26';

const HelpView = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      question: '¿Cómo puedo crear una nueva tarea?',
      answer: 'Para crear una nueva tarea, ve a la vista Kanban y haz clic en el botón "+" en la columna "Por hacer". También puedes usar el botón "Nueva Tarea" en la vista de Tareas de Hoy.'
    },
    {
      question: '¿Cómo funciona el sistema de drag & drop?',
      answer: 'Puedes arrastrar las tarjetas de tareas entre las diferentes columnas (Por hacer, En progreso, Completado) para cambiar su estado. Simplemente haz clic y arrastra la tarjeta a la columna deseada.'
    },
    {
      question: '¿Cómo puedo agregar participantes a un proyecto?',
      answer: 'Ve a la vista de Participantes y haz clic en "Agregar Participante". Completa la información requerida y el participante será agregado al sistema.'
    },
    {
      question: '¿Cómo configuro las notificaciones?',
      answer: 'Ve a Configuración > Notificaciones y activa o desactiva los tipos de notificaciones que deseas recibir. Puedes configurar notificaciones por email, push, recordatorios de tareas, etc.'
    },
    {
      question: '¿Cómo exporto reportes?',
      answer: 'En la vista de Informes, usa los botones "Exportar", "Imprimir" o "Compartir" para obtener los reportes en diferentes formatos.'
    },
    {
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a Configuración > Seguridad y haz clic en "Cambiar Contraseña". Sigue las instrucciones para establecer una nueva contraseña segura.'
    }
  ];

  const quickActions = [
    {
      title: 'Documentación',
      description: 'Guías completas y manuales de usuario',
      icon: <BookIcon sx={{ fontSize: 40, color: GREEN }} />,
      action: 'Ver Documentación'
    },
    {
      title: 'Videos Tutoriales',
      description: 'Aprende con videos paso a paso',
      icon: <VideoLibraryIcon sx={{ fontSize: 40, color: GREEN }} />,
      action: 'Ver Tutoriales'
    },
    {
      title: 'Soporte Técnico',
      description: 'Contacta con nuestro equipo de soporte',
      icon: <ContactSupportIcon sx={{ fontSize: 40, color: GREEN }} />,
      action: 'Contactar Soporte'
    }
  ];

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <HelpOutlineIcon sx={{ color: GREEN, mr: 2, fontSize: 40 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            Centro de Ayuda
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Encuentra respuestas a tus preguntas y aprende a usar ECO
          </Typography>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                },
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                  {action.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 2, fontFamily: 'Poppins, sans-serif' }}>
                  {action.description}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: GREEN,
                    color: GREEN,
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' }
                  }}
                >
                  {action.action}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
            Preguntas Frecuentes
          </Typography>
          
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                mb: 1,
                borderRadius: 2,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: GREEN }} />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0'
                  }
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            ¿Necesitas más ayuda?
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Si no encuentras la respuesta que buscas, nuestro equipo de soporte está aquí para ayudarte.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
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
              Contactar Soporte
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: GREEN,
                color: GREEN,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                fontFamily: 'Poppins, sans-serif',
                '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' }
              }}
            >
              Enviar Feedback
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HelpView; 