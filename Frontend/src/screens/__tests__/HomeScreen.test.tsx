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
  },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('shows nothing when there are no todos', async () => {
    // Override mock for this test
    (todosService.fetchTodos as jest.Mock).mockResolvedValueOnce([]);
    
    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());

    expect(screen.queryByTestId('todo-checkbox')).toBeNull();
  });

  it('displays todos in order', async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());

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
  });

  it('shows floating action button for adding new todos', async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());

    const addButton = screen.getByTestId('add-todo-button');

    expect(addButton).toBeTruthy();
  });

  it('allows todos to be added', async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());

    const addButton = screen.getByTestId('add-todo-button');
    fireEvent.press(addButton);
    const todoNameInput = screen.getByTestId('todo-name-input');
    fireEvent.changeText(todoNameInput, 'Take out dishes from dishwasher');
    const todoScheduledTimeInput = screen.getByTestId('todo-scheduled-time-input');
    fireEvent.changeText(todoScheduledTimeInput, '2:00 PM');
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    await waitFor(() => expect(todosService.addTodo).toHaveBeenCalledWith(
      'Take out dishes from dishwasher',
      50400 // 2:00 PM in seconds (14 * 3600)
    ));
    const todoItems = screen.getAllByTestId('todo-item');
    const takeOutDishes = todoItems[3];
    expect(takeOutDishes).toBeTruthy();
    expect(takeOutDishes).toHaveTextContent('Take out dishes from dishwasher', { exact: false });
  });
  
  it('allows todos to be completed', async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());

    const feedCatCheckbox = screen.getAllByTestId('todo-checkbox')[0];

    fireEvent.press(feedCatCheckbox);
  })
}); 