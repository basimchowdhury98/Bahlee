import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../components/Todo';
import { AddTodoForm } from '../components/AddTodoForm';
import { TodoItem, todosService } from '../services/todos';
import { colors } from '../theme/colors';

export const HomeScreen = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const data = await todosService.fetchTodos();
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

  const handleUndoComplete = async (id: string) => {
    try {
      await todosService.updateTodo(id, {
        completed: false,
        completedBy: undefined
      });
      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, completed: false, completedBy: undefined }
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
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          testID="add-todo-button"
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.text.primary} />
          <Text style={styles.actionButtonText}>Add an activity</Text>
        </TouchableOpacity>
      </View>
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
            onUndoComplete={() => handleUndoComplete(item.id)}
            onPress={() => handlePress(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
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
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text.primary,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    padding: 20,
  },
  loadingText: {
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: colors.status.error,
    textAlign: 'center',
    marginTop: 20,
  },
}); 