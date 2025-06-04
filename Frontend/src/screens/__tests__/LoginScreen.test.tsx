import { render, screen } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

describe('LoginScreen', () => {
  it('renders correctly', () => {
    render(<LoginScreen />);
    
    const welcomeText = screen.getByText('Welcome to Bahlee');
    const subtitleText = screen.getByText('Sign in');
    
    expect(welcomeText).toBeTruthy();
    expect(subtitleText).toBeTruthy();
  });
});
