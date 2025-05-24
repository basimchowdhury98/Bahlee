import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface AddTodoFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, scheduledTime: string) => void;
}

export const AddTodoForm = ({ visible, onClose, onSubmit }: AddTodoFormProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = () => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const timeString = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    
    onSubmit(title, timeString);
    setTitle('');
    setDate(new Date());
  };

  const formatTimeForDisplay = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
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
          
          {Platform.OS === 'ios' ? (
            <View style={styles.timePickerContainer}>
              <Text style={styles.timeLabel}>Scheduled Time:</Text>
              <DateTimePicker
                testID="todo-scheduled-time-input"
                value={date}
                mode="time"
                is24Hour={false}
                onChange={handleTimeChange}
                style={styles.timePicker}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                testID="todo-scheduled-time-input"
                style={styles.timeButton}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  {formatTimeForDisplay(date)}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  testID="todo-scheduled-time-picker"
                  value={date}
                  mode="time"
                  is24Hour={false}
                  onChange={handleTimeChange}
                />
              )}
            </>
          )}

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
  timePickerContainer: {
    marginBottom: 15,
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  timePicker: {
    height: 120,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#000',
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