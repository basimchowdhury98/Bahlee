# Bahlee Development Documentation

## Project Overview
Personal todo/reminder app for syncing tasks between partners. Built with React Native + Expo.

## Project Structure
Bahlee/
├── Frontend/ # React Native Expo app
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ │ └── Todo.tsx # Todo item component
│ │ ├── screens/ # App screens
│ │ │ └── HomeScreen.tsx
│ │ └── navigation/ # Navigation setup
│ │ └── AppNavigator.tsx
│ ├── App.tsx # Root component
│ └── index.ts # Entry point
└── Backend/ # Future backend directory

## Tech Stack
- React Native with Expo
- TypeScript
- React Navigation
- Firebase (planned)

## Current Features
1. Basic todo list UI
2. Todo completion tracking
3. "Done by" attribution
4. Stack navigation setup

## Development Setup
1. Install dependencies:
   ```bash
   cd Frontend
   npm install
   ```
2. Run development server:
   ```bash
   npx expo start
   ```
3. Use Expo Go app on phone to test
   - Scan QR code with Expo Go
   - Both phone and PC must be on same network
   - Or use --tunnel for different networks

## Testing Setup
1. Install testing dependencies:
   ```bash
   cd Frontend
   npm install --save-dev --legacy-peer-deps @testing-library/react-native @testing-library/jest-native jest jest-expo @types/jest
   ```

2. Configure TypeScript for JSX:
   ```json
   // tsconfig.json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "strict": true,
       "jsx": "react-native"
     }
   }
   ```

3. Add test script to package.json:
   ```json
   {
     "scripts": {
       "test": "jest"
     }
   }
   ```

4. Run tests:
   ```bash
   npm test
   ```

### Test Structure
- Tests are located in `__tests__` directories next to the files they test
- Using React Native Testing Library for component testing
- Focus on functional/integration tests that verify user interactions
- Use testID attributes for reliable element selection

## Component Structure
### Todo Component (`Todo.tsx`)
- Displays individual todo items
- Handles completion toggle
- Shows who completed the task
- Props:
  ```typescript
  interface TodoProps {
    title: string;
    completed: boolean;
    completedBy?: string;
    onComplete: () => void;
    onPress: () => void;
  }
  ```

### HomeScreen (`HomeScreen.tsx`)
- Displays list of todos
- Manages todo state
- Floating action button for new todos
- Uses FlatList for performance

### Navigation (`AppNavigator.tsx`)
- Stack navigation setup
- Currently one screen (Home)
- Prepared for additional screens

## Planned Features
1. Add Todo screen
2. Todo detail view
3. Firebase integration
4. Push notifications
5. Real-time sync between users

## Style Guide
- Components use StyleSheet.create
- Consistent spacing (15-20px padding)
- Primary color: #007AFF
- Background: #f5f5f5

## Git Workflow
- Main branch for stable releases
- Feature branches for new features
- Commit messages should be descriptive

## Next Steps
1. Implement "Add Todo" functionality
2. Create TodoDetail screen
3. Set up Firebase backend
4. Implement user authentication
5. Add push notifications