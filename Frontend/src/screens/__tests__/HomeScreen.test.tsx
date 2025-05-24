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
  },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('shows nothing when no todos are returned', async () => {
    // Override mock for this test
    (todosService.fetchTodos as jest.Mock).mockResolvedValueOnce([]);
    
    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());

    expect(screen.queryByTestId('todo-checkbox')).toBeNull();
  });
  
}); 