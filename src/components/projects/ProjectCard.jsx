import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const GREEN = '#2AAC26';

const ProjectCard = ({ name = 'Proyecto', ...props }) => (
  <Box
    sx={{
      bgcolor: GREEN,
      borderRadius: 3,
      minWidth: 220,
      minHeight: 140,
      maxWidth: 240,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'flex-end',
      p: 2,
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
      fontFamily: 'Poppins, sans-serif',
      '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.13)' },
    }}
    {...props}
  >
    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
      {name}
    </Typography>
  </Box>
);

export default ProjectCard; 