import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EventIcon from '@mui/icons-material/Event';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const GREEN = '#2AAC26';

// Datos expandidos de participantes con toda la información del modal
const participants = [
  {
    id: 1,
    name: 'Ann Wayne',
    gender: 'Female',
    age: 24,
    area: 'Product Designer',
    entryDate: '12 September 2024',
    satisfaction: 100,
    status: 'Current',
    ethnicity: 'Bangladeshi',
    endDate: '12 September 2024',
    transportMode: 'Car',
    distancePerDay: '20kl',
    induction: 'Yes',
    satisfactionSurveyDate: '12 September 2024',
    satisfactionScore: 70,
    trainingDate: '12 September 2024',
    avatar: 'https://i.pravatar.cc/150?img=1',
    // Datos adicionales para el modal
    email: 'anywayne@example.com',
    phone: '+44 123 5678904',
    address: 'Los Angeles, California, USA',
    birthDate: '12/03/1994',
    tags: ['product', 'design'],
    tasks: [
      { id: 1, text: 'Conduct initial functionality testing', completed: false },
      { id: 2, text: 'Created wireframes and prototypes', completed: false },
      { id: 3, text: 'Conducted user research and gathered feedback', completed: true }
    ],
    documents: [
      { id: 1, name: 'Document', date: 'Submitted on 15 Feb, 2020' },
      { id: 2, name: 'Document', date: 'Submitted on 15 Feb, 2020' },
      { id: 3, name: 'Document', date: 'Uploaded on 15 Feb, 2020' }
    ],
    activities: [
      { id: 1, text: 'user scheduled an appointment for personal consultation service', time: '1 day ago', type: 'event' },
      { id: 2, text: 'user updated personal client information', time: '2 days ago', type: 'edit' },
      { id: 3, text: 'user added new file Questionnaire', time: '4 days ago', type: 'file' }
    ]
  },
  {
    id: 2,
    name: 'Marvin McKinney',
    gender: 'Male',
    age: 45,
    area: 'Chairman',
    entryDate: '12 September 2024',
    satisfaction: 0,
    status: 'Past',
    ethnicity: 'American',
    endDate: '12 September 2024',
    transportMode: 'Bus',
    distancePerDay: '15kl',
    induction: 'No',
    satisfactionSurveyDate: '12 September 2024',
    satisfactionScore: 45,
    trainingDate: '12 September 2024',
    avatar: 'https://i.pravatar.cc/150?img=2',
    email: 'marvin@example.com',
    phone: '+1 555 123 4567',
    address: 'New York, NY, USA',
    birthDate: '15/07/1979',
    tags: ['management', 'leadership'],
    tasks: [
      { id: 1, text: 'Review quarterly reports', completed: true },
      { id: 2, text: 'Prepare board presentation', completed: false }
    ],
    documents: [
      { id: 1, name: 'Quarterly Report', date: 'Submitted on 10 Jan, 2025' }
    ],
    activities: [
      { id: 1, text: 'reviewed quarterly budget', time: '3 days ago', type: 'edit' }
    ]
  },
  // ... existing code for other participants ...
  {
    id: 3,
    name: 'Ronald Richards',
    gender: 'Male',
    age: 40,
    area: 'Managing Director',
    entryDate: '12 September 2024',
    satisfaction: 30,
    status: 'Current',
    ethnicity: 'British',
    endDate: '12 September 2024',
    transportMode: 'Train',
    distancePerDay: '25kl',
    induction: 'Yes',
    satisfactionSurveyDate: '12 September 2024',
    satisfactionScore: 30,
    trainingDate: '12 September 2024',
    avatar: 'https://i.pravatar.cc/150?img=3',
    email: 'ronald@example.com',
    phone: '+44 987 654 3210',
    address: 'London, UK',
    birthDate: '22/11/1984',
    tags: ['management', 'strategy'],
    tasks: [
      { id: 1, text: 'Strategic planning meeting', completed: false },
      { id: 2, text: 'Team performance review', completed: true }
    ],
    documents: [
      { id: 1, name: 'Strategy Document', date: 'Submitted on 05 Feb, 2025' }
    ],
    activities: [
      { id: 1, text: 'updated team objectives', time: '1 week ago', type: 'edit' }
    ]
  }
];

const ParticipantsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (participant) => {
    setSelectedParticipant(participant);
    setDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
    setSelectedParticipant(null);
  };

  const getStatusColor = (status) => {
    return status === 'Current' ? 'success' : 'warning';
  };

  const getSatisfactionColor = (satisfaction) => {
    if (satisfaction === 0) return '#e0e0e0';
    if (satisfaction >= 80) return GREEN;
    if (satisfaction >= 50) return '#2196f3';
    return '#ff9800';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'event':
        return <EventIcon sx={{ color: '#6366f1', fontSize: 16 }} />;
      case 'edit':
        return <EditIcon sx={{ color: '#f59e0b', fontSize: 16 }} />;
      case 'file':
        return <AttachFileIcon sx={{ color: '#10b981', fontSize: 16 }} />;
      default:
        return <EventIcon sx={{ color: '#6366f1', fontSize: 16 }} />;
    }
  };

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          Participantes
        </Typography>
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
          Agregar Participante
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar participantes..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300, fontFamily: 'Poppins, sans-serif' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999' }} />
              </InputAdornment>
            ),
            style: { fontFamily: 'Poppins, sans-serif' }
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f6fa' }}>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Género</TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Edad</TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Área</TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Fecha de ingreso</TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Barra de satisfacción</TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Estatus</TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredParticipants.map((participant) => (
              <TableRow key={participant.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={participant.avatar} alt={participant.name} sx={{ width: 32, height: 32 }} />
                    {participant.name}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{participant.gender}</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{participant.age} years</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{participant.area}</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{participant.entryDate}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={participant.satisfaction}
                      sx={{
                        width: 100,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getSatisfactionColor(participant.satisfaction),
                          borderRadius: 4
                        }
                      }}
                    />
                    {participant.satisfaction > 0 && (
                      <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                        {participant.satisfaction}%
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={participant.status}
                    color={getStatusColor(participant.status)}
                    size="small"
                    sx={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(participant)}
                    sx={{
                      borderColor: GREEN,
                      color: GREEN,
                      fontFamily: 'Poppins, sans-serif',
                      '&:hover': {
                        borderColor: '#1f9a1f',
                        bgcolor: '#e8f5e9'
                      }
                    }}
                  >
                    View More
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Member Card Dialog - Exacto como la imagen */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            fontFamily: 'Inter, sans-serif',
            minHeight: '70vh'
          }
        }}
      >
        {selectedParticipant && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              pb: 2,
              borderBottom: 'none',
              px: 3,
              pt: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#6b7280', fontSize: '14px' }}>
                  Member's card
                </Typography>
                <EditIcon sx={{ color: '#9ca3af', fontSize: 16 }} />
              </Box>
              <IconButton onClick={handleCloseDetails} size="small">
                <span style={{ fontWeight: 'bold', fontSize: 20, color: '#6b7280' }}>×</span>
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3 }}>
              <Grid container spacing={4}>
                {/* Columna izquierda */}
                <Grid item xs={12} md={5}>
                  {/* Foto y info básica */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Avatar 
                      src={selectedParticipant.avatar} 
                      alt={selectedParticipant.name}
                      sx={{ width: 120, height: 120, mb: 2 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, textAlign: 'center' }}>
                      {selectedParticipant.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', textAlign: 'center' }}>
                      {selectedParticipant.area}
                    </Typography>
                  </Box>

                  {/* Información de contacto */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mb: 0.5 }}>
                        E-mail
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '14px' }}>
                        {selectedParticipant.email}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mb: 0.5 }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '14px' }}>
                        {selectedParticipant.phone}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mb: 0.5 }}>
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '14px' }}>
                        {selectedParticipant.address}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mb: 0.5 }}>
                        Date of birth
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '14px' }}>
                        {selectedParticipant.birthDate}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Botones */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PersonAddIcon />}
                      sx={{
                        flex: 1,
                        borderColor: '#d1d5db',
                        color: '#374151',
                        textTransform: 'none',
                        fontWeight: 500,
                        py: 1
                      }}
                    >
                      Add to group
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<MessageIcon />}
                      sx={{
                        flex: 1,
                        bgcolor: '#3b82f6',
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 500,
                        py: 1,
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      Message
                    </Button>
                  </Box>
                </Grid>

                {/* Columna derecha */}
                <Grid item xs={12} md={7}>
                  {/* Tags */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 500, color: '#6b7280' }}>
                        Tags
                      </Typography>
                      <AddIcon sx={{ color: '#9ca3af', fontSize: 16 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {selectedParticipant.tags?.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: '#f3f4f6',
                            color: '#374151',
                            fontSize: '12px',
                            height: 24
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Latest tasks */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 500, color: '#6b7280' }}>
                        Latest tasks
                        <span style={{ color: '#9ca3af', fontSize: '14px', marginLeft: 8 }}>03</span>
                      </Typography>
                      <Button sx={{ color: '#3b82f6', textTransform: 'none', fontSize: '12px', p: 0 }}>
                        show all
                      </Button>
                    </Box>
                    <List sx={{ p: 0 }}>
                      {selectedParticipant.tasks?.map((task) => (
                        <ListItem key={task.id} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                            <Checkbox
                              checked={task.completed}
                              size="small"
                              sx={{
                                color: '#d1d5db',
                                '&.Mui-checked': {
                                  color: '#3b82f6',
                                },
                                p: 0
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={task.text}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontSize: '14px',
                                color: task.completed ? '#9ca3af' : '#374151',
                                textDecoration: task.completed ? 'line-through' : 'none'
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Pinned documents & files */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 500, color: '#6b7280' }}>
                        Pinned documents & files
                        <span style={{ color: '#9ca3af', fontSize: '14px', marginLeft: 8 }}>09</span>
                      </Typography>
                      <Button sx={{ color: '#3b82f6', textTransform: 'none', fontSize: '12px', p: 0 }}>
                        show all
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {selectedParticipant.documents?.map((doc) => (
                        <Box key={doc.id} sx={{ textAlign: 'center' }}>
                          <Box sx={{
                            width: 60,
                            height: 80,
                            bgcolor: '#f8fafc',
                            border: '1px solid #e5e7eb',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <InsertDriveFileIcon sx={{ color: '#9ca3af', fontSize: 24 }} />
                          </Box>
                          <Typography variant="caption" sx={{ fontSize: '10px', color: '#6b7280', display: 'block' }}>
                            {doc.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '10px', color: '#9ca3af', display: 'block' }}>
                            {doc.date}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Latest activity */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 500, color: '#6b7280' }}>
                        Latest activity
                      </Typography>
                      <Box sx={{ transform: 'rotate(45deg)' }}>
                        ↗
                      </Box>
                    </Box>
                    <List sx={{ p: 0 }}>
                      {selectedParticipant.activities?.map((activity) => (
                        <ListItem key={activity.id} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 'auto', mr: 2, mt: 0.5 }}>
                            {getActivityIcon(activity.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography sx={{ fontSize: '14px', color: '#374151', mb: 0.5 }}>
                                {activity.text}
                              </Typography>
                            }
                            secondary={
                              <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>
                                {activity.time}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ParticipantsView; 