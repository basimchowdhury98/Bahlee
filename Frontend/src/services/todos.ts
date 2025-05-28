import { ref, get, set, update, remove, push } from 'firebase/database';
import { db } from '../config/firebase';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  scheduledTime: number;
}

export const todosService = {
  fetchTodos: async (): Promise<TodoItem[]> => {
    const todosRef = ref(db, 'todos');
    const snapshot = await get(todosRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  },
  
  updateTodo: async (id: string, updates: Partial<TodoItem>): Promise<void> => {
    const todoRef = ref(db, `todos/${id}`);
    await update(todoRef, updates);
  },

  addTodo: async (title: string, scheduledTime: number): Promise<TodoItem> => {
    const todosRef = ref(db, 'todos');
    const newTodoRef = push(todosRef);
    
    const newTodo = {
      title,
      completed: false,
      scheduledTime,
    };
    
    await set(newTodoRef, newTodo);
    
    return {
      id: newTodoRef.key!,
      ...newTodo
    };
  },

  deleteTodo: async (id: string): Promise<void> => {
    const todoRef = ref(db, `todos/${id}`);
    await remove(todoRef);
  }
}; 