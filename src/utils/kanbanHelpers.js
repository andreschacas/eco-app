// Helpers para manipular el estado del Kanban

export function moveCard(data, source, destination, draggableId) {
  const start = data.columns[source.droppableId];
  const finish = data.columns[destination.droppableId];
  if (start === finish) {
    const newCardIds = Array.from(start.cardIds);
    newCardIds.splice(source.index, 1);
    newCardIds.splice(destination.index, 0, draggableId);
    const newColumn = { ...start, cardIds: newCardIds };
    return {
      ...data,
      columns: { ...data.columns, [newColumn.id]: newColumn },
    };
  }
  const startCardIds = Array.from(start.cardIds);
  startCardIds.splice(source.index, 1);
  const newStart = { ...start, cardIds: startCardIds };
  const finishCardIds = Array.from(finish.cardIds);
  finishCardIds.splice(destination.index, 0, draggableId);
  const newFinish = { ...finish, cardIds: finishCardIds };
  return {
    ...data,
    columns: { ...data.columns, [newStart.id]: newStart, [newFinish.id]: newFinish },
  };
}

export function addCard(data, columnId, card) {
  return {
    ...data,
    cards: { ...data.cards, [card.id]: card },
    columns: {
      ...data.columns,
      [columnId]: {
        ...data.columns[columnId],
        cardIds: [card.id, ...data.columns[columnId].cardIds],
      },
    },
  };
} 