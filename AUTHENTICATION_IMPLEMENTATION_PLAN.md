# Authentication Implementation Technical Plan

## Current State Analysis

### Existing Implementation
- **Firebase**: Basic Firebase Realtime Database setup (`src/config/firebase.js`)
- **Navigation**: Basic React Navigation structure but currently bypassed in `App.tsx`
- **Todo Management**: Functional todo CRUD operations without user association
- **Data Structure**: Todos stored globally without user scoping

### Missing Components
- Firebase Authentication SDK integration
- Google Sign-In configuration
- User authentication state management
- Protected routes/screens
- User-scoped data operations

## Technical Implementation Plan

### 1. Firebase Authentication Setup

#### Install Required Dependencies
```bash
# Google Sign-In for Expo
expo install expo-auth-session expo-crypto

# Optional: For more robust Google Auth
expo install @react-native-google-signin/google-signin
```

#### Update Firebase Configuration
**File: `src/config/firebase.js`**
```javascript
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ... existing config

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

**Learning Note**: Firebase Auth provides multiple authentication methods. Google Sign-In is popular for mobile apps because it leverages the user's existing Google account, reducing friction.

### 2. Authentication Service Layer

#### Create Authentication Service
**File: `src/services/auth.ts`**
```typescript
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const authService = {
  signInWithGoogle: async (): Promise<AuthUser> => {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    };
  },

  signOut: () => signOut(auth),

  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChanged(auth, (user: User | null) => {
      callback(user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      } : null);
    });
  },

  getCurrentUser: (): AuthUser | null => {
    const user = auth.currentUser;
    return user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    } : null;
  }
};
```

**Learning Note**: The service layer pattern separates Firebase-specific logic from React components, making the code more testable and maintainable.

### 3. Authentication Context (State Management)

#### Implementation Options Analysis

**Option A: React Context API (Recommended for MVP)**
- **Pros**: Built into React, no additional dependencies, sufficient for small-to-medium apps
- **Cons**: Can cause unnecessary re-renders if not optimized
- **Best for**: Learning React patterns, MVP simplicity

**Option B: Redux/Zustand**
- **Pros**: More predictable state updates, better for complex state
- **Cons**: Additional learning curve, overkill for simple auth state
- **Best for**: Large applications with complex state interactions

**Recommendation**: Use Context API for MVP, as it aligns with the spec and your learning goals.

#### Create Authentication Context
**File: `src/contexts/AuthContext.tsx`**
```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthUser } from '../services/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      setIsLoading(true);
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Learning Note**: React Context provides a way to pass data through the component tree without manually passing props at every level. The custom hook pattern (`useAuth`) provides a clean API and runtime error checking.

### 4. Screen Implementation

#### Login Screen
**File: `src/screens/LoginScreen.tsx`**
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

export const LoginScreen: React.FC = () => {
  const { signIn, isLoading } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Bahlee</Text>
      <Text style={styles.subtitle}>Sign in to manage your shared todos</Text>
      
      <TouchableOpacity 
        style={styles.googleButton}
        onPress={signIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

#### Update Home Screen for Authentication
**File: `src/screens/HomeScreen.tsx` (modifications needed)**
```typescript
// Add to existing HomeScreen
import { useAuth } from '../contexts/AuthContext';

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  
  // Add sign out button to header or as floating action
  // Rest of existing implementation...
};
```

### 5. Navigation Flow Updates

#### Authentication-Aware Navigation
**File: `src/navigation/AppNavigator.tsx`**
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoadingScreen } from '../screens/LoadingScreen'; // To be created

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Partners: undefined; // For future implementation
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

#### Update App.tsx
**File: `App.tsx`**
```typescript
import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle="light-content"
          backgroundColor={colors.background.primary}
          translucent
        />
        <AppNavigator />
      </SafeAreaView>
    </AuthProvider>
  );
}
```

**Learning Note**: This pattern uses conditional rendering based on authentication state. The navigation tree changes completely rather than just hiding/showing screens, which is more secure.

### 6. Data Layer Updates for User Association

#### Update Todo Service for User Scoping
**File: `src/services/todos.ts`**
```typescript
import { ref, get, set, update, remove, push } from 'firebase/database';
import { db } from '../config/firebase';
import { authService } from './auth';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  scheduledTime: number;
  createdBy: string; // New field
  timestampCreated: number; // New field
}

export const todosService = {
  fetchTodos: async (): Promise<TodoItem[]> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const todosRef = ref(db, `todos/${currentUser.uid}`);
    const snapshot = await get(todosRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  },
  
  addTodo: async (title: string, scheduledTime: number): Promise<TodoItem> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const todosRef = ref(db, `todos/${currentUser.uid}`);
    const newTodoRef = push(todosRef);
    
    const newTodo = {
      title,
      completed: false,
      scheduledTime,
      createdBy: currentUser.uid,
      timestampCreated: Date.now(),
    };
    
    await set(newTodoRef, newTodo);
    
    return {
      id: newTodoRef.key!,
      ...newTodo
    };
  },

  updateTodo: async (id: string, updates: Partial<TodoItem>): Promise<void> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const todoRef = ref(db, `todos/${currentUser.uid}/${id}`);
    await update(todoRef, updates);
  },

  deleteTodo: async (id: string): Promise<void> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const todoRef = ref(db, `todos/${currentUser.uid}/${id}`);
    await remove(todoRef);
  }
};
```

#### User Profile Service
**File: `src/services/users.ts`**
```typescript
import { ref, get, set, update } from 'firebase/database';
import { db } from '../config/firebase';
import { AuthUser } from './auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  partnerId?: string;
  createdAt: number;
}

export const usersService = {
  createUserProfile: async (user: AuthUser): Promise<void> => {
    const userRef = ref(db, `users/${user.uid}`);
    const existingUser = await get(userRef);
    
    if (!existingUser.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        createdAt: Date.now(),
      };
      
      await set(userRef, userProfile);
    }
  },

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    
    return snapshot.exists() ? snapshot.val() : null;
  },

  updateUserProfile: async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, updates);
  }
};
```

### 7. Migration Strategy for Existing Data

#### Data Migration Considerations
Since you have existing todos in the database without user association:

**Option A: Manual Migration Script**
```typescript
// One-time migration script
const migrateTodos = async (userId: string) => {
  // Move existing todos from /todos to /todos/{userId}
  // This would be run once per existing user
};
```

**Option B: Gradual Migration**
- Keep existing todos accessible to all users temporarily
- New todos go to user-scoped paths
- Eventually remove global todos

**Recommendation**: For MVP, start fresh since you're likely in development phase.

### 8. Firebase Security Rules Update

#### Database Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "todos": {
      "$uid": {
        ".read": "auth.uid === $uid || root.child('users').child(auth.uid).child('partnerId').val() === $uid",
        ".write": "auth.uid === $uid || root.child('users').child(auth.uid).child('partnerId').val() === $uid"
      }
    }
  }
}
```

**Learning Note**: Firebase security rules run on the server and prevent unauthorized access to data. The rules above ensure users can only access their own data or their partner's data.

### 9. Testing Strategy

#### Unit Tests for Authentication
**File: `src/services/__tests__/auth.test.ts`**
```typescript
import { authService } from '../auth';
// Mock Firebase auth for testing
jest.mock('firebase/auth');

describe('authService', () => {
  it('should sign in with Google', async () => {
    // Test implementation
  });
  
  it('should handle sign out', async () => {
    // Test implementation
  });
});
```

#### E2E Tests with Maestro
Update `.maestro/home.yml` to include authentication flow:
```yaml
appId: com.bchowdhury.bahlee
---
- launchApp
- assertVisible: "Sign in with Google"
- tapOn: "Sign in with Google"
# Add authentication steps
- assertVisible: "Add Todo"
```

### 10. Implementation Sequence

#### Phase 1: Core Authentication (Priority: High)
1. Install dependencies
2. Update Firebase config with Auth
3. Create authentication service
4. Create authentication context
5. Create Login screen
6. Update navigation flow
7. Update App.tsx

#### Phase 2: Data Integration (Priority: High)
1. Update todos service for user scoping
2. Create users service
3. Migrate existing data (if needed)
4. Update Firebase security rules

#### Phase 3: Enhanced UX (Priority: Medium)
1. Add loading states
2. Error handling and user feedback
3. Sign out functionality
4. User profile display

#### Phase 4: Testing (Priority: Medium)
1. Unit tests for auth service
2. Integration tests for user flows
3. Update E2E tests

### Key Learning Concepts for React/Expo Development

1. **Context API vs Props Drilling**: Context solves the problem of passing data through multiple component layers
2. **Authentication Patterns**: Conditional navigation based on auth state is a common mobile app pattern
3. **Service Layer Architecture**: Separating business logic from UI components improves maintainability
4. **Firebase Integration**: Firebase provides backend-as-a-service, eliminating need for custom server setup
5. **State Management**: Authentication state is global state that many components need access to
6. **Security**: Client-side authentication must be paired with server-side rules to be secure

### Potential Challenges & Solutions

1. **Google Sign-In Configuration**: Requires proper OAuth setup in Firebase console
2. **Platform-Specific Setup**: iOS and Android may require additional configuration
3. **State Persistence**: Authentication state should persist across app restarts
4. **Error Handling**: Network failures, auth failures need graceful handling
5. **Testing with Firebase**: Requires mocking Firebase services in tests

This plan provides a comprehensive approach to implementing authentication while maintaining the existing functionality and preparing for the partner system feature.