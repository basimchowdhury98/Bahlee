export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
}

export const todosService = {
  fetchTodos: async (): Promise<TodoItem[]> => {
    // This will eventually be replaced with Firebase
    return [
      { id: '1', title: 'Feed cat', completed: false },
      { id: '2', title: 'Take out trash', completed: true, completedBy: 'Partner' },
    ];
  },
  
  updateTodo: async (id: string, updates: Partial<TodoItem>): Promise<void> => {
    // This will eventually be replaced with Firebase
    return Promise.resolve();
  }
}; 