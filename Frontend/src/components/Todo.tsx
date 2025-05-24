import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface TodoProps {
  title: string;
  completed: boolean;
  completedBy?: string;
  scheduledTime: number;
  onComplete: () => void;
  onUndoComplete: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export const Todo = ({ 
  title, 
  completed, 
  completedBy, 
  scheduledTime, 
  onComplete,
  onUndoComplete, 
  onPress, 
  onDelete 
}: TodoProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleCheckboxPress = () => {
    if (completed) {
      onUndoComplete();
    } else {
      onComplete();
    }
  };

  return (
    <TouchableOpacity 
      testID="todo-item"
      style={[styles.container, completed && styles.completedContainer]} 
      onPress={onPress}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(scheduledTime)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={[styles.title, completed && styles.completedText]}>{title}</Text>
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.metricText}>{formatTime(scheduledTime)}</Text>
            </View>
            {completed && completedBy && (
              <View style={styles.metricItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.status.success} />
                <Text style={[styles.metricText, styles.completedBy]}>Done by {completedBy}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            testID="delete-todo-button"
            style={styles.actionButton}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.checkbox, completed && styles.checked]} 
            onPress={handleCheckboxPress}
            testID="todo-checkbox"
          >
            {completed && <Ionicons name="checkmark" size={16} color={colors.text.primary} />}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  completedContainer: {
    opacity: 0.8,
  },
  timeContainer: {
    backgroundColor: colors.background.secondary,
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.background.primary,
  },
  time: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  completedText: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  completedBy: {
    color: colors.status.success,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.text.accent,
  },
}); 