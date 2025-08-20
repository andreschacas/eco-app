import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ProjectCard from '../components/ProjectCard';

const GREEN = '#2AAC26';

const projects = [
  { name: 'Proyecto Solar' },
  { name: 'Eficiencia Energética' },
  { name: 'Movilidad Verde' },
  { name: 'Reciclaje Urbano' },
];

const Home = () => {
  return (
    <Box sx={{ mt: 2, ml: 1, fontFamily: 'Poppins, sans-serif' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1, fontFamily: 'Poppins, sans-serif' }}>
          PEPE
        </Typography>
        <Button variant="contained" sx={{ bgcolor: GREEN, color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', px: 3, fontFamily: 'Poppins, sans-serif', ':hover': { bgcolor: GREEN } }}>
          + Agregar
        </Button>
      </Box>
      <Typography variant="body2" sx={{ color: '#888', mb: 3, fontFamily: 'Poppins, sans-serif' }}>
        Tienes {projects.length} proyectos
      </Typography>
      <Stack direction="row" spacing={3}>
        {projects.map((p, i) => (
          <ProjectCard key={i} name={p.name} />
        ))}
      </Stack>
    </Box>
  );
};

export default Home;
