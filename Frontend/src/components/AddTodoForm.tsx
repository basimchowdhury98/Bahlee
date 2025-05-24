import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';

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
          <Text style={styles.title}>Add New Activity</Text>
          <TextInput
            testID="todo-name-input"
            style={[styles.input, { color: colors.text.primary }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Activity name"
            placeholderTextColor={colors.text.secondary}
            selectionColor={colors.text.accent}
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
                textColor={colors.text.primary}
                themeVariant="dark"
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
                  themeVariant="dark"
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
              <Text style={styles.buttonText}>Add Activity</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  formContainer: {
    backgroundColor: colors.background.card,
    padding: 20,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text.primary,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  timePickerContainer: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 8,
  },
  timePicker: {
    height: 120,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  timeButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timeButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
  },
  confirmButton: {
    backgroundColor: colors.text.accent,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 