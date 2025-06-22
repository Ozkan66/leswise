# GitHub Copilot Instructions voor Leswise Project

## 🎯 Overzicht
Dit document bevat specifieke instructies voor GitHub Copilot om consistente, foutloze code te genereren voor het Leswise platform. Deze richtlijnen zijn gebaseerd op lessons learned uit recente test- en lint-error fixes.

## 📋 TypeScript & ESLint Regels

### 1. Type Safety - Gebruik NOOIT `any`
```typescript
// ❌ FOUT - Gebruik nooit any
const handleError = (error: any) => { ... }

// ✅ CORRECT - Gebruik specifieke types of union types
const handleError = (error: Error | unknown) => { ... }
const handleError = (error: string | null) => { ... }

// ✅ Voor onbekende errors
catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
}
```

### 2. Interface Definities - Altijd expliciete types
```typescript
// ✅ CORRECT - Definieer specifieke interfaces
interface NotificationSettings {
  emailNotifications: boolean;
  worksheetReminders: boolean;
  submissionNotifications: boolean;
  systemUpdates: boolean;
}

// ✅ Gebruik expliciete type aliases in plaats van NonNullable generics
type NotificationSettings = NonNullable<UserProfileData['notificationSettings']>;
```

### 3. Unused Variables & Imports
```typescript
// ❌ FOUT - Ongebruikte imports
import { useState, useEffect, useMemo } from 'react'; // useMemo niet gebruikt

// ✅ CORRECT - Alleen gebruikte imports
import { useState, useEffect } from 'react';

// ✅ Voor bewust ongebruikte parameters, gebruik underscore prefix
const handleSubmit = (_event: React.FormEvent, data: FormData) => { ... }
```

### 4. React Hooks Dependencies
```typescript
// ✅ CORRECT - Alle dependencies in useEffect
useEffect(() => {
  if (user && fetchData) {
    fetchData();
  }
}, [user, fetchData]); // Beide dependencies opgenomen

// ✅ Gebruik useCallback voor stable function references
const fetchData = useCallback(async () => {
  // implementation
}, [/* dependencies */]);
```

## 🧪 Testing Best Practices

### 1. Supabase Mocking - Chainable Methods
```javascript
// ✅ CORRECT - Implementeer ALLE chainable methods
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({ data: [], error: null })),
      in: jest.fn(() => ({ data: [], error: null })),
      match: jest.fn(() => ({ data: [], error: null })),
      filter: jest.fn(() => ({ data: [], error: null }))
    })),
    insert: jest.fn(() => ({ data: [], error: null })),
    update: jest.fn(() => ({ data: [], error: null })),
    delete: jest.fn(() => ({ data: [], error: null })),
    rpc: jest.fn(() => ({ data: [], error: null }))
  }))
};
```

### 2. Async Test Patterns
```javascript
// ✅ CORRECT - Gebruik waitFor voor async assertions
import { render, screen, waitFor, act } from '@testing-library/react';

test('should handle async operations', async () => {
  render(<Component />);
  
  // Voor async state updates
  await act(async () => {
    fireEvent.click(screen.getByRole('button'));
  });
  
  // Voor async assertions
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### 3. Error Mocking - Throw vs Return
```javascript
// ✅ CORRECT - Throw errors voor exception handling tests
mockFunction.mockImplementation(() => {
  throw new Error('Test error message');
});

// ❌ FOUT - Return error objects
mockFunction.mockReturnValue({ error: 'Test error' });
```

### 4. Text Queries - Specifiek en Uniek
```javascript
// ❌ FOUT - Ambiguous text queries
screen.getByText('Submit'); // Mogelijk meerdere matches

// ✅ CORRECT - Gebruik role-based queries of specifieke text
screen.getByRole('button', { name: 'Submit Form' });
screen.getByText('Submit Worksheet Form');
```

## ⚛️ React Component Patterns

### 1. Event Handlers - Type Safe
```typescript
// ✅ CORRECT - Expliciete event types
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // implementation
};

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

### 2. State Management - Initialized Types
```typescript
// ✅ CORRECT - Proper initial state with types
const [formData, setFormData] = useState<FormData>({
  name: '',
  email: '',
  role: null
});

// ❌ FOUT - Uninitialized optional properties
const [formData, setFormData] = useState<FormData>({});
```

### 3. Conditional Rendering - Null Safety
```typescript
// ✅ CORRECT - Safe property access
{user?.profile?.name && <span>{user.profile.name}</span>}

// ✅ With default values
const userName = user?.profile?.name || 'Anonymous';
```

## 🔧 Import Patterns

### 1. Module Imports - Specific en Clean
```typescript
// ✅ CORRECT - Specifieke imports
import { useState, useEffect, useCallback } from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// ❌ FOUT - Wildcard imports voor grote libraries
import * as React from 'react';
```

### 2. Relative Imports - Consistent Paths
```typescript
// ✅ CORRECT - Relatieve paths vanuit project root
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
```

## 📝 Code Quality Standards

### 1. Function Signatures - Explicit Return Types
```typescript
// ✅ CORRECT - Expliciete return types voor complexe functies
const validateForm = (data: FormData): ValidationResult => {
  return { isValid: true, errors: [] };
};

// ✅ Voor async functies
const fetchUserData = async (id: string): Promise<User | null> => {
  // implementation
};
```

### 2. Error Handling - Consistent Patterns
```typescript
// ✅ CORRECT - Consistent error handling
try {
  const result = await apiCall();
  return result;
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    throw error;
  }
  throw new Error('Unknown error occurred');
}
```

### 3. Component Props - Interface Definitions
```typescript
// ✅ CORRECT - Explicit prop interfaces
interface ButtonProps {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled = false, variant = 'primary' }) => {
  // implementation
};
```

## 🧩 Test Structure

### 1. Test Organization - Describe Blocks
```javascript
describe('ComponentName', () => {
  describe('when user is authenticated', () => {
    beforeEach(() => {
      // setup
    });

    test('should render user profile', () => {
      // test implementation
    });
  });

  describe('when user is not authenticated', () => {
    test('should show login prompt', () => {
      // test implementation
    });
  });
});
```

### 2. Mock Cleanup - Proper Lifecycle
```javascript
describe('Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });
});
```

## 🚨 Veelgemaakte Fouten & Oplossingen

### 1. Act() Warnings
```javascript
// ✅ CORRECT - Wrap state updates in act()
await act(async () => {
  fireEvent.click(submitButton);
});

// ✅ Voor complex async workflows
await act(async () => {
  await user.click(submitButton);
  await waitFor(() => {
    expect(mockApi).toHaveBeenCalled();
  });
});
```

### 2. Missing Dependencies in Hooks
```javascript
// ✅ CORRECT - Include all dependencies
const memoizedValue = useMemo(() => {
  return calculateValue(input, config);
}, [input, config]); // Beide dependencies included

// ✅ Voor empty dependency arrays - document why
useEffect(() => {
  initializeApp();
}, []); // Empty deps: run only on mount
```

### 3. Type Assertions - Use Carefully
```typescript
// ❌ FOUT - Unsafe type assertion
const user = data as User;

// ✅ CORRECT - Type guards
const isUser = (data: unknown): data is User => {
  return typeof data === 'object' && data !== null && 'id' in data;
};

if (isUser(data)) {
  // data is safely typed as User
}
```

### 4. Supabase Query Response Types - Match Actual Structure
```typescript
// ❌ FOUT - Type doesn't match Supabase join response
type UserRoleData = {
  users?: {
    id?: string;
    email?: string;
  };
  role: string;
};

// ✅ CORRECT - Type matches actual Supabase response structure
type UserRoleData = {
  user_id: string;
  role: string;
  users: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  }[];
};

// ✅ Access joined data correctly
const usersList = usersData?.map((ur: UserRoleData) => ({
  id: ur.users[0]?.id || '',
  email: ur.users[0]?.email || '',
  firstName: ur.users[0]?.first_name || undefined,
  lastName: ur.users[0]?.last_name || undefined,
  role: ur.role
}));
```

## 📦 Project-Specific Patterns

### 1. Supabase Integration
```typescript
// ✅ CORRECT - Proper error handling
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id);

if (error) {
  throw new Error(`Database error: ${error.message}`);
}

return data;
```

### 2. Authentication Context Usage
```typescript
// ✅ CORRECT - Safe user access
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <LoginPrompt />;

// user is guaranteed to be defined here
```

### 3. Form Handling - Controlled Components
```typescript
// ✅ CORRECT - Controlled form inputs
const [formData, setFormData] = useState({
  email: '',
  password: ''
});

const handleInputChange = (field: keyof typeof formData, value: string) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};
```

## 🔍 Code Review Checklist

Voor elke nieuwe component/feature, controleer:

- [ ] Geen `any` types gebruikt
- [ ] Alle imports worden gebruikt
- [ ] useEffect dependencies zijn compleet
- [ ] Error handling is consistent
- [ ] Tests dekken happy path en error cases
- [ ] Async operations gebruiken proper patterns
- [ ] TypeScript interfaces zijn expliciet gedefinieerd
- [ ] Component props hebben interface definities
- [ ] Event handlers hebben correcte types
- [ ] Supabase query response types matchen actual database structure
- [ ] Join queries gebruik correct array access pattern (users[0] vs users)
- [ ] Database null values worden correct behandeld (string | null)

## 📚 Referenties

- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [React Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [React Hooks Exhaustive Deps](https://reactjs.org/docs/hooks-exhaustive-deps.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

---

**Laatste update**: Juni 2025  
**Gebaseerd op**: Leswise test/lint error fixes, Vercel deployment fixes en best practices