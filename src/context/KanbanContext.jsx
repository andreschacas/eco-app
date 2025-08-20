import React, { createContext, useContext, useState } from 'react';

const KanbanContext = createContext();

export const useKanban = () => useContext(KanbanContext);

const initialData = {
  columns: {
    todo: { id: 'todo', title: 'Por hacer', cardIds: ['1', '2'] },
    inprogress: { id: 'inprogress', title: 'En progreso', cardIds: ['3'] },
    done: { id: 'done', title: 'Completado', cardIds: [] },
  },
  cards: {
    '1': { id: '1', title: 'Diseñar logo', description: 'Crear un logo para el proyecto', dueDate: '2024-07-15', user: { avatar: 'https://i.pravatar.cc/24?img=1', name: 'Ana', role: 'Diseñadora' } },
    '2': { id: '2', title: 'Configurar hosting', description: 'Elegir y configurar el hosting para la app', dueDate: '2024-07-20', user: { avatar: 'https://i.pravatar.cc/24?img=2', name: 'Luis', role: 'DevOps' } },
    '3': { id: '3', title: 'Desarrollar login', description: 'Implementar autenticación de usuarios', dueDate: '2024-07-18', user: { avatar: 'https://i.pravatar.cc/24?img=3', name: 'Sofía', role: 'Backend' } },
  },
  columnOrder: ['todo', 'inprogress', 'done'],
};

export const KanbanProvider = ({ children }) => {
  const [data, setData] = useState(initialData);
  return (
    <KanbanContext.Provider value={{ data, setData }}>
      {children}
    </KanbanContext.Provider>
  );
};