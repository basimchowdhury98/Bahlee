import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { todosService } from '../../services/todos';

// Mock the todos service
jest.mock('../../services/todos', () => ({
  todosService: {
    fetchTodos: jest.fn().mockResolvedValue([
      { id: '1', title: 'Feed cat', completed: false },
      { id: '2', title: 'Take out trash', completed: true, completedBy: 'Partner' },
    ]),
    updateTodo: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays todos and allows completing them', async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(todosService.fetchTodos).toHaveBeenCalled());
    const feedCat = screen.getByText('Feed cat');
    const takeOutTrash = screen.getByText('Take out trash');
    const checkbox = screen.getAllByTestId('todo-checkbox')[0];

    fireEvent.press(checkbox);

    expect(feedCat).toBeTruthy();
    expect(takeOutTrash).toBeTruthy();
    expect(todosService.updateTodo).toHaveBeenCalledWith('1', {
      completed: true,
      completedBy: 'Me'
    });
    await waitFor(() => {
      expect(screen.getByText('Done by Me')).toBeTruthy();
    });
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