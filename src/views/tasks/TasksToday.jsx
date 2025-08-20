import React from 'react';
import Typography from '@mui/material/Typography';
import KanbanView from '../kanban/KanbanView';

const TasksToday = () => {
  return (
    <div>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Tareas del día
      </Typography>
      <KanbanView />
    </div>
  );
};

export default TasksToday;