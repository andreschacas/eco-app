import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import QuickActions from './QuickActions';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TaskDetailsDialog from './dialogs/TaskDetailsDialog';

const initialData = {
  columns: {
    todo: {
      id: 'todo',
      title: 'Por hacer',
      cardIds: ['1', '2'],
    },
    inprogress: {
      id: 'inprogress',
      title: 'En progreso',
      cardIds: ['3'],
    },
    done: {
      id: 'done',
      title: 'Completado',
      cardIds: [],
    },
  },
  cards: {
    '1': {
      id: '1',
      title: 'Diseñar logo',
      description: 'Crear un logo para el proyecto',
      dueDate: '2024-07-15',
      labels: ['Diseño'],
      user: {
        avatar: 'https://i.pravatar.cc/24?img=1',
        name: 'Ana',
        role: 'Diseñadora',
      },
    },
    '2': {
      id: '2',
      title: 'Configurar hosting',
      description: 'Elegir y configurar el hosting para la app',
      dueDate: '2024-07-20',
      labels: ['Infraestructura', 'Energía solar'],
      user: {
        avatar: 'https://i.pravatar.cc/24?img=2',
        name: 'Luis',
        role: 'DevOps',
      },
    },
    '3': {
      id: '3',
      title: 'Desarrollar login',
      description: 'Implementar autenticación de usuarios',
      dueDate: '2024-07-18',
      labels: ['Backend'],
      user: {
        avatar: 'https://i.pravatar.cc/24?img=3',
        name: 'Sofía',
        role: 'Backend',
      },
    },
  },
  columnOrder: ['todo', 'inprogress', 'done'],
};

const KanbanBoard = () => {
  const [data, setData] = useState(initialData);
  const [selectedCard, setSelectedCard] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newCardIds = Array.from(start.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);
      const newColumn = {
        ...start,
        cardIds: newCardIds,
      };
      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }
    // Moving from one column to another
    const startCardIds = Array.from(start.cardIds);
    startCardIds.splice(source.index, 1);
    const newStart = {
      ...start,
      cardIds: startCardIds,
    };
    const finishCardIds = Array.from(finish.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      cardIds: finishCardIds,
    };
    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  const handleAddTask = (columnId = 'todo') => {
    const title = prompt('Título de la tarea:');
    if (!title) return;
    const id = Date.now().toString();
    const newCard = {
      id,
      title,
      description: '',
      dueDate: '',
      labels: [],
      user: null,
    };
    setData((prev) => {
      const newCards = { ...prev.cards, [id]: newCard };
      const newCol = {
        ...prev.columns[columnId],
        cardIds: [id, ...prev.columns[columnId].cardIds],
      };
      return {
        ...prev,
        cards: newCards,
        columns: { ...prev.columns, [columnId]: newCol },
      };
    });
  };

  const handleFilter = (type) => {
    alert('Funcionalidad de filtro: ' + type + ' (próximamente)');
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCard(null);
  };
  const handleEditCard = () => {
    alert('Funcionalidad de edición próximamente');
  };
  const handleDeleteCard = () => {
    alert('Funcionalidad de eliminar próximamente');
  };

  return (
    <Box sx={{ width: '100%', minHeight: '80vh', bgcolor: '#e9ecef', p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
      <QuickActions onAddTask={handleAddTask} onFilter={handleFilter} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2} wrap="nowrap" sx={{ overflowX: 'auto', pb: 2 }}>
          {data.columnOrder.map((colId) => {
            const column = data.columns[colId];
            return (
              <Grid item key={column.id} sx={{ minWidth: 320, maxWidth: 400, flex: 1 }}>
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      elevation={4}
                      sx={{
                        bgcolor: '#f4f6fa',
                        borderRadius: 3,
                        p: 2,
                        minHeight: '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                      }}
                    >
                      <KanbanColumn
                        title={column.title}
                        onAddCard={() => handleAddTask(column.id)}
                      >
                        {column.cardIds.map((cardId, idx) => {
                          const card = data.cards[cardId];
                          return (
                            <Draggable draggableId={card.id} index={idx} key={card.id}>
                              {(provided) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  sx={{ mb: 2, ...provided.draggableProps.style }}
                                >
                                  <KanbanCard
                                    {...card}
                                    dragHandleProps={provided.dragHandleProps}
                                    onClick={() => handleCardClick(card)}
                                  />
                                </Box>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </KanbanColumn>
                    </Paper>
                  )}
                </Droppable>
              </Grid>
            );
          })}
        </Grid>
      </DragDropContext>
      <TaskDetailsDialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        card={selectedCard}
        onEdit={handleEditCard}
        onDelete={handleDeleteCard}
      />
    </Box>
  );
};

export default KanbanBoard; 