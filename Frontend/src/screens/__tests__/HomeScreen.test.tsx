import { render, fireEvent, screen } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

describe('HomeScreen', () => {
  it('displays todos and allows completing them', () => {
    render(<HomeScreen />);
    
    // Check if initial todos are rendered
    const feedCat = screen.getByText('Feed cat');
    const takeOutTrash = screen.getByText('Take out trash');
    
    expect(feedCat).toBeTruthy();
    expect(takeOutTrash).toBeTruthy();
    
    // Find the completion checkbox for the first todo
    const checkbox = screen.getAllByTestId('todo-checkbox')[0];
    
    // Complete the todo
    fireEvent.press(checkbox);
    
    // Verify the todo was marked as completed
    expect(screen.getByText('Done by Me')).toBeTruthy();
  });

  it('shows floating action button for adding new todos', () => {
    render(<HomeScreen />);
    
    // Check if add button is present
    const addButton = screen.getByTestId('add-todo-button');
    expect(addButton).toBeTruthy();
  });
}); 