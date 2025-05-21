import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TodoProps {
  title: string;
  completed: boolean;
  completedBy?: string;
  onComplete: () => void;
  onPress: () => void;
}

export const Todo = ({ title, completed, completedBy, onComplete, onPress }: TodoProps) => {
  return (
    <TouchableOpacity 
      style={[styles.container, completed && styles.completedContainer]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.completedText]}>{title}</Text>
        {completed && completedBy && (
          <Text style={styles.completedBy}>Done by {completedBy}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={[styles.checkbox, completed && styles.checked]} 
        onPress={onComplete}
      />
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginLeft: 10,
  },
  checked: {
    backgroundColor: '#007AFF',
  },
}); 