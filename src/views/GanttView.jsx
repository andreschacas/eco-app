import React from 'react';
import { Box } from '@mui/material';
import ModernGanttProfessional from '../components/gantt/ModernGanttProfessional';

const GanttView = () => {
  return (
    <Box sx={{ 
      height: 'calc(100vh - 120px)', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      <ModernGanttProfessional />
    </Box>
  );
};

export default GanttView;
