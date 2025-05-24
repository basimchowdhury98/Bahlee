import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TodoProps {
  title: string;
  completed: boolean;
  completedBy?: string;
  scheduledTime: number;
  onComplete: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export const Todo = ({ title, completed, completedBy, scheduledTime, onComplete, onPress, onDelete }: TodoProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity 
      testID="todo-item"
      style={[styles.container, completed && styles.completedContainer]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.completedText]}>{title}</Text>
        <Text style={styles.scheduledTime} testID="scheduled-time">
          {formatTime(scheduledTime)}
        </Text>
        {completed && completedBy && (
          <Text style={styles.completedBy}>Done by {completedBy}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          testID="delete-todo-button"
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.checkbox, completed && styles.checked]} 
          onPress={onComplete}
          testID="todo-checkbox"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completedContainer: {
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  completedText: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  completedBy: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 10,
    padding: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  scheduledTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 