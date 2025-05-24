import { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AddTodoFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, scheduledTime: string) => void;
}

export const AddTodoForm = ({ visible, onClose, onSubmit }: AddTodoFormProps) => {
  const [title, setTitle] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleSubmit = () => {
    onSubmit(title, scheduledTime);
    setTitle('');
    setScheduledTime('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Add New Todo</Text>
          <TextInput
            testID="todo-name-input"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Todo name"
          />
          <TextInput
            testID="todo-scheduled-time-input"
            style={styles.input}
            value={scheduledTime}
            onChangeText={setScheduledTime}
            placeholder="Scheduled time (e.g. 2:00 PM)"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="confirm-button"
              style={[styles.button, styles.confirmButton]} 
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Add Todo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 