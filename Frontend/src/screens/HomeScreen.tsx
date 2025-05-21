import { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../components/Todo';

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
}

export const HomeScreen = () => {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', title: 'Feed cat', completed: false },
    { id: '2', title: 'Take out trash', completed: true, completedBy: 'Partner' },
  ]);

  const handleComplete = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed, completedBy: !todo.completed ? 'Me' : undefined }
        : todo
    ));
  };

  const handlePress = (id: string) => {
    // TODO: Navigate to todo detail screen
    console.log('Todo pressed:', id);
  };

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
            onComplete={() => handleComplete(item.id)}
            onPress={() => handlePress(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
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