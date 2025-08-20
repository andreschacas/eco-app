import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import QuickActions from './QuickActions';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TaskDetailsDialog from '../common/dialogs/TaskDetailsDialog';

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
      user: {
        avatar: 'https://i.pravatar.cc/24?img=3',
        name: 'Sofía',
        role: 'Backend',
      },
    },
  },
  columnOrder: ['todo', 'inprogress', 'done'],
};

const STORAGE_KEY = 'kanban-data';

const getInitialData = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialData;
    }
  }
  return initialData;
};

const KanbanBoard = () => {
  const [data, setData] = useState(getInitialData());
  const [selectedCard, setSelectedCard] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Persistir en localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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
    // Paso una copia profunda de la tarjeta seleccionada
    setSelectedCard(card ? JSON.parse(JSON.stringify(card)) : null);
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

  // --- Acciones de columna ---
  const handleRenameColumn = (colId, newName) => {
    setData(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [colId]: { ...prev.columns[colId], title: newName },
      },
    }));
  };

  const handleColumnMenu = (colId, action) => {
    if (action === 'archive') {
      alert('Funcionalidad de archivar lista próximamente');
    } else if (action === 'copy') {
      // Copiar columna y sus tarjetas
      setData(prev => {
        const newId = 'col_' + Date.now();
        const newCol = {
          ...prev.columns[colId],
          id: newId,
          title: prev.columns[colId].title + ' (Copia)',
          cardIds: [...prev.columns[colId].cardIds],
        };
        return {
          ...prev,
          columns: { ...prev.columns, [newId]: newCol },
          columnOrder: [...prev.columnOrder, newId],
        };
      });
    } else if (action === 'delete') {
      setData(prev => {
        const { [colId]: _, ...restCols } = prev.columns;
        const newOrder = prev.columnOrder.filter(id => id !== colId);
        return {
          ...prev,
          columns: restCols,
          columnOrder: newOrder,
        };
      });
    } else if (action === 'add_card') {
      handleAddTask(colId);
    }
  };

  // Callback para actualizar tarjeta
  const handleUpdateCard = (updatedCard) => {
    setData(prev => ({
      ...prev,
      cards: {
        ...prev.cards,
        [updatedCard.id]: updatedCard,
      },
    }));
    // Si la tarjeta editada es la seleccionada, actualizo selectedCard
    setSelectedCard(prev => (prev && prev.id === updatedCard.id ? updatedCard : prev));
  };

  return (
    <Box sx={{ width: '100%', minHeight: '80vh', bgcolor: '#e9ecef', p: { xs: 1, sm: 2 }, borderRadius: 3, fontFamily: 'Poppins, sans-serif' }}>
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
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      <KanbanColumn
                        title={column.title}
                        onAddCard={() => handleAddTask(column.id)}
                        onRename={newName => handleRenameColumn(column.id, newName)}
                        onMenuAction={action => handleColumnMenu(column.id, action === 'add_card' ? 'add_card' : action)}
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
        onUpdate={handleUpdateCard}
      />
    </Box>
  );
};

export default KanbanBoard;