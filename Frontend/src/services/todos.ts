export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  scheduledTime: number;
}

export const todosService = {
  fetchTodos: async (): Promise<TodoItem[]> => {
    // This will eventually be replaced with Firebase
    return [
      { id: '1', title: 'Feed cat', completed: false, scheduledTime: 36000 },
      { id: '2', title: 'Take out trash', completed: true, completedBy: 'Partner', scheduledTime: 43200 },
      { id: '3', title: 'Run roomba', completed: false, scheduledTime: 39600 },
    ];
  },
  
  updateTodo: async (id: string, updates: Partial<TodoItem>): Promise<void> => {
    // This will eventually be replaced with Firebase
    return Promise.resolve();
  }
}; 