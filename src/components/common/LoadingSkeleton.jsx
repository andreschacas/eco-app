import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

// Skeleton para tabla de usuarios
export const UserTableSkeleton = ({ rows = 5 }) => (
  <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
    <CardContent>
      {[...Array(rows)].map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
      ))}
    </CardContent>
  </Card>
);

// Skeleton para tarjetas de dashboard
export const DashboardCardSkeleton = ({ count = 4 }) => (
  <Grid container spacing={3}>
    {[...Array(count)].map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" height={40} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Skeleton para tarjetas de Kanban
export const KanbanCardSkeleton = ({ count = 3 }) => (
  <Box sx={{ display: 'flex', gap: 2 }}>
    {[...Array(count)].map((_, columnIndex) => (
      <Box key={columnIndex} sx={{ flex: 1, minWidth: 300 }}>
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="60%" height={24} />
        </Box>
        {[...Array(4)].map((_, cardIndex) => (
          <Card key={cardIndex} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="100%" height={16} sx={{ mt: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="circular" width={24} height={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    ))}
  </Box>
);

// Skeleton para lista de proyectos
export const ProjectListSkeleton = ({ rows = 3 }) => (
  <Grid container spacing={3}>
    {[...Array(rows)].map((_, index) => (
      <Grid item xs={12} key={index}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="80%" height={16} sx={{ mt: 1 }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[...Array(3)].map((_, avatarIndex) => (
                    <Skeleton key={avatarIndex} variant="circular" width={24} height={24} />
                  ))}
                </Box>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1, mt: 0.5 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Skeleton para widgets del dashboard
export const WidgetSkeleton = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {[...Array(count)].map((_, index) => (
      <Grid item xs={12} sm={6} md={6} lg={4} key={index}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: 300 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
              </Box>
            </Box>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton variant="rectangular" width="100%" height="80%" sx={{ borderRadius: 2 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Skeleton genérico para formularios
export const FormSkeleton = () => (
  <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
    <CardContent>
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 3 }} />
      <Grid container spacing={2}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Skeleton variant="text" width="30%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
);

export default {
  UserTableSkeleton,
  DashboardCardSkeleton,
  KanbanCardSkeleton,
  ProjectListSkeleton,
  WidgetSkeleton,
  FormSkeleton
};
