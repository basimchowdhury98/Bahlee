import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { todosService } from '../../services/todos';

// Mock the todos service
jest.mock('../../services/todos', () => ({
  todosService: {
    fetchTodos: jest.fn().mockResolvedValue([
      { id: '1', title: 'Feed cat', completed: false, scheduledTime: 36000 },
      { id: '2', title: 'Take out trash', completed: true, completedBy: 'Partner', scheduledTime: 43200 },
      { id: '3', title: 'Run roomba', completed: false, scheduledTime: 39600 },
    ]),
    updateTodo: jest.fn().mockResolvedValue(undefined),
    addTodo: jest.fn().mockImplementation((title, scheduledTime) => 
      Promise.resolve({
        id: '4',
        title,
        completed: false,
        scheduledTime,
      })
    ),
    deleteTodo: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('HomeScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());
  });

  it('shows nothing when there are no todos', async () => {
    // Override mock for this test
    (todosService.fetchTodos as jest.Mock).mockResolvedValueOnce([]);
    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());

    expect(screen.queryByTestId('todo-checkbox')).toBeNull();
  });

  it('displays todos in order', async () => {
    const todoItems = screen.getAllByTestId('todo-item');
    const feedCat = todoItems[0];
    const runRoomba = todoItems[1];
    const takeOutTrash = todoItems[2];

    expect(feedCat).toBeTruthy();
    expect(feedCat).toHaveTextContent('Feed cat', { exact: false });
    expect(runRoomba).toBeTruthy();
    expect(runRoomba).toHaveTextContent('Run roomba', { exact: false });
    expect(takeOutTrash).toBeTruthy();
    expect(takeOutTrash).toHaveTextContent('Take out trash', { exact: false });
    expect(takeOutTrash).toHaveTextContent('Done by Partner', { exact: false });
  });

  it('shows floating action button for adding new todos', async () => {
    const addButton = screen.getByTestId('add-todo-button');

    expect(addButton).toBeTruthy();
  });

  it('allows todos to be added', async () => {
    const addButton = screen.getByTestId('add-todo-button');
    fireEvent.press(addButton);
    const todoNameInput = screen.getByTestId('todo-name-input');
    fireEvent.changeText(todoNameInput, 'Take out dishes from dishwasher');
    await setTodoScheduledTimeToHour(14);
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    await waitFor(() => expect(todosService.addTodo).toHaveBeenCalled());
    const todoItems = screen.getAllByTestId('todo-item');
    const takeOutDishes = todoItems[3];
    expect(takeOutDishes).toBeTruthy();
    expect(takeOutDishes).toHaveTextContent('Take out dishes from dishwasher', { exact: false });
    expect(takeOutDishes).toHaveTextContent('14:00', { exact: false });
  });

  it('allows todos to be deleted', async () => {
    const deleteButton = screen.getAllByTestId('delete-todo-button')[0];
    fireEvent.press(deleteButton);

    await waitFor(() => expect(todosService.deleteTodo).toHaveBeenCalled());
    const todoItems = screen.getAllByTestId('todo-item');
    expect(todoItems.length).toBe(2);
  })
  
  it('allows todos to be completed', async () => {
    const feedCatCheckbox = screen.getAllByTestId('todo-checkbox')[0];
    fireEvent.press(feedCatCheckbox);

    await waitFor(() => expect(todosService.updateTodo).toHaveBeenCalled());
    const todoItems = screen.getAllByTestId('todo-item');
    const feedCat = todoItems[0];
    expect(feedCat).toHaveTextContent('Feed cat', { exact: false });
    expect(feedCat).toHaveTextContent('Done by me', { exact: false });
  })
}); 

const setTodoScheduledTimeToHour = async (hour: number) => {
  const timeInput = screen.getByTestId('todo-scheduled-time-input');
  const selectedDate = new Date();
  selectedDate.setHours(hour);
  selectedDate.setMinutes(0);
  fireEvent(timeInput, 'onChange', {
    nativeEvent: { timestamp: selectedDate.getTime() },
    type: 'set',
  }, selectedDate);
}