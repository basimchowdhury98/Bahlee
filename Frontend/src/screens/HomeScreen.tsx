import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../components/Todo';
import { AddTodoForm } from '../components/AddTodoForm';
import { TodoItem, todosService } from '../services/todos';

export const HomeScreen = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const data = await todosService.fetchTodos();
        // Sort todos by scheduledTime
        const sortedTodos = [...data].sort((a, b) => a.scheduledTime - b.scheduledTime);
        setTodos(sortedTodos);
      } catch (err) {
        setError('Failed to load todos');
      } finally {
        setIsLoading(false);
      }
    };
    loadTodos();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await todosService.updateTodo(id, {
        completed: true,
        completedBy: 'Me'
      });
      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, completed: true, completedBy: 'Me' }
          : todo
      ));
    } catch (err) {
      setError('Failed to update todo');
    }
  };

  const handlePress = (id: string) => {
    // TODO: Navigate to todo detail screen
    console.log('Todo pressed:', id);
  };

  const handleDelete = async (id: string) => {
    try {
      await todosService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  const handleAddTodo = async (title: string, timeString: string) => {
    try {
      // Convert time string (e.g. "2:00 PM") to seconds since midnight
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalHours = hours;
      if (period === 'PM' && hours !== 12) totalHours += 12;
      if (period === 'AM' && hours === 12) totalHours = 0;
      const scheduledTime = totalHours * 3600 + minutes * 60;

      const newTodo = await todosService.addTodo(title, scheduledTime);
      setTodos([...todos, newTodo].sort((a, b) => a.scheduledTime - b.scheduledTime));
      setIsAddModalVisible(false);
    } catch (err) {
      setError('Failed to add todo');
    }
  };

  if (isLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.container}><Text>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Todo
            title={item.title}
            completed={item.completed}
            completedBy={item.completedBy}
            scheduledTime={item.scheduledTime}
            onComplete={() => handleComplete(item.id)}
            onPress={() => handlePress(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity 
        style={styles.addButton}
        testID="add-todo-button"
        onPress={() => setIsAddModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      <AddTodoForm
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleAddTodo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 20,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
}); 