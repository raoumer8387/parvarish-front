# React Learning Guide for Parvarish Frontend

**Purpose**: Learn React fundamentals by understanding the actual codebase you're working with.

---

## **Phase 1: Core React Concepts (3-4 hours)**

### **1.1 What is React?**
- A JavaScript library for building user interfaces
- Uses **Components** (reusable UI pieces)
- Uses **State** (component memory)
- Automatically re-renders when data changes

**Real analogy**: Think of React components like LEGO blocks - each block is reusable, they fit together, and when you change one, the whole structure updates.

---

### **1.2 Components - The Foundation**

**What they are**: JavaScript functions that return JSX (HTML-like syntax)

#### **Example 1: Simple Component**
```tsx
// File: src/components/LoginPage.tsx
export function LoginPage() {
  return (
    <div className="login-container">
      <h1>Welcome to Parvarish</h1>
      <button>Login</button>
    </div>
  );
}
```

**Key points**:
- Function name starts with UPPERCASE (LoginPage, not loginPage)
- Returns JSX that looks like HTML
- JSX gets compiled to JavaScript behind the scenes

#### **Exercise**: 
Look at these files in your project:
- [src/components/LoginPage.tsx](src/components/LoginPage.tsx) - Notice it's a function returning JSX
- [src/components/ParentDashboard.tsx](src/components/ParentDashboard.tsx) - Another component
- [src/components/GameScreen.tsx](src/components/GameScreen.tsx) - Larger component

**Task**: Open each file and identify:
1. What does this component display?
2. What interactive elements does it have (buttons, forms)?
3. What does it receive as props (the parameter)?

---

### **1.3 Props - Component Communication**

**What they are**: Data passed from parent → child component

#### **Example from your code**:
```tsx
// Parent component (App.tsx)
<LoginPage onLogin={handleLogin} />

// Child component (LoginPage.tsx)
interface LoginPageProps {
  onLogin: (userType: 'parent' | 'child') => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const handleGoogleLogin = () => {
    onLogin('parent');  // Call the function passed as prop
  };
  
  return <button onClick={handleGoogleLogin}>Login</button>;
}
```

**How it works**:
1. Parent passes `onLogin` function to child
2. Child receives it as a prop
3. Child calls it when needed
4. Parent receives the call and responds

**Real analogy**: Like ordering food at a restaurant
- You (parent) tell waiter (prop) what you want
- Waiter takes order to kitchen (child component)
- Kitchen does the work and returns result to waiter
- Waiter brings result back to you

#### **Exercise**:
1. Open [src/App.tsx](src/App.tsx)
2. Find where `<LoginPage>` is rendered (search for `<LoginPage`)
3. See what props are passed to it
4. Open [src/components/LoginPage.tsx](src/components/LoginPage.tsx)
5. See the `LoginPageProps` interface - those are the props it receives
6. Find where `onLogin` is called in the code

---

### **1.4 State - Component Memory**

**What it is**: Data that component remembers and can change

```tsx
import { useState } from 'react';

function MyComponent() {
  // useState returns [currentValue, functionToUpdate]
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**Key points**:
- `count` = current value
- `setCount` = function to change it
- When you call `setCount(newValue)`, React re-renders the component
- Component remembers the value between renders

#### **Real example from LoginPage.tsx**:
```tsx
const [userType, setUserType] = useState<'parent' | 'child' | null>(null);
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
```

**What's happening**:
- Component remembers what the user typed in username field
- When user types, `setUsername` updates state
- Component re-renders with new username
- If login button clicked and API calls, `setIsLoading(true)` shows spinner

#### **Exercise**:
1. Open [src/components/LoginPage.tsx](src/components/LoginPage.tsx)
2. Find all `useState` calls (look for blue lines)
3. For each state variable, ask:
   - What does this remember?
   - When is it updated?
   - Where is it used in the JSX?

---

### **1.5 useEffect Hook - Running Code at Specific Times**

**What it is**: Runs code when component loads or when something changes

```tsx
import { useEffect, useState } from 'react';

function MyComponent() {
  const [data, setData] = useState(null);
  
  // Run this code when component FIRST loads
  useEffect(() => {
    console.log('Component just mounted!');
    // Usually fetch data here
  }, []); // Empty array = run once on mount
  
  // Run this code every time 'data' changes
  useEffect(() => {
    console.log('Data changed!', data);
  }, [data]); // Array with 'data' = run when data changes
}
```

**Dependency array**:
- `[]` = run once when component mounts
- `[variable]` = run when variable changes
- No array = run every render (rare)

#### **Real example from App.tsx**:
```tsx
useEffect(() => {
  // Check for auth token when app first loads
  const token = localStorage.getItem('access_token');
  if (token) {
    setIsLoggedIn(true);
  }
}, []); // Run once on app start
```

**What's happening**:
1. App component loads
2. useEffect runs (because dependency array is empty)
3. Checks if user already logged in
4. If yes, sets isLoggedIn to true
5. App re-renders with logged-in view

#### **Exercise**:
1. Open [src/App.tsx](src/App.tsx)
2. Find `useEffect` (should be around line 36)
3. Read the code inside
4. Trace what happens:
   - Is there a token in localStorage?
   - If yes, what state is updated?
   - What component gets rendered because of this?

---

### **1.6 Async/Await - API Calls**

**What it is**: Making requests to backend without freezing the app

```tsx
async function handleLogin() {
  try {
    // await = "wait for this to finish, but don't freeze the app"
    const response = await axios.post('/api/login', { username, password });
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error);
  }
}
```

**Why it matters**:
- Sync calls = app freezes while waiting for API
- Async calls = app stays responsive, user sees spinner

#### **Real example from LoginPage.tsx**:
```tsx
const handleChildLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);  // Show spinner
  
  try {
    // Make API call - app stays responsive
    const res = await axios.post(
      API_ENDPOINTS.auth.login,
      { username, password }
    );
    
    // Success! Save token
    localStorage.setItem('access_token', res.data.access_token);
    setSuccess('Login successful!');
    
    // Redirect after 500ms
    setTimeout(() => {
      onLogin('child');
    }, 500);
  } catch (err: any) {
    // Handle error
    setError(err?.response?.data?.detail || 'Invalid username or password.');
  } finally {
    setIsLoading(false);  // Hide spinner
  }
};
```

**Step by step**:
1. User submits form
2. `setIsLoading(true)` shows spinner
3. `await axios.post()` makes API call (app continues running)
4. While waiting, user sees spinner (not frozen)
5. When response arrives, save token
6. Call `onLogin('child')` to notify parent
7. `setIsLoading(false)` hides spinner

#### **Exercise**:
1. Open [src/components/LoginPage.tsx](src/components/LoginPage.tsx)
2. Find `handleChildLogin` function
3. Trace through the code:
   - What state is set at start?
   - What API is called?
   - What happens if it succeeds?
   - What happens if it fails?

---

## **Phase 2: Understanding Your Codebase (4-5 hours)**

### **2.1 Project Structure Overview**

```
src/
├── App.tsx                 ← Main component (entry point)
├── components/             ← All UI components
│   ├── LoginPage.tsx       ← Login screen
│   ├── ParentDashboard.tsx ← Parent view
│   ├── GameScreen.tsx      ← Game wrapper
│   ├── games/              ← Individual games
│   │   ├── MemoryGame.tsx
│   │   ├── IslamicQuizGame.tsx
│   │   └── ...
│   └── ui/                 ← Reusable UI pieces (buttons, forms, etc)
├── api/                    ← Backend communication
│   ├── axiosInstance.ts    ← Configured HTTP client
│   ├── auth.ts             ← Auth helper functions
│   ├── config.ts           ← API endpoints
│   └── chatApi.ts          ← Specific API calls
└── types/                  ← TypeScript types
```

### **2.2 Authentication System**

**Files involved**:
1. [src/api/axiosInstance.ts](src/api/axiosInstance.ts) - HTTP client setup
2. [src/api/auth.ts](src/api/auth.ts) - Auth helpers
3. [src/components/LoginPage.tsx](src/components/LoginPage.tsx) - Login UI
4. [src/App.tsx](src/App.tsx) - Main app routing

**How it works**:

```
User opens app
    ↓
App.tsx useEffect runs
    ↓
Check localStorage for token?
    ├─ YES → Set isLoggedIn=true → Show dashboard
    └─ NO → Show LoginPage
        ↓
    User logs in (parent or child)
        ↓
    LoginPage calls API
        ↓
    Backend returns token
        ↓
    Token saved to localStorage
        ↓
    Call onLogin() prop
        ↓
    App sets isLoggedIn=true, userType='child'/'parent'
        ↓
    Dashboard renders
```

**Key code to study**:

[src/App.tsx](src/App.tsx#L38-L65) - How token is handled on app load

[src/components/LoginPage.tsx](src/components/LoginPage.tsx#L45-L60) - Login form submission

[src/api/axiosInstance.ts](src/api/axiosInstance.ts#L10-L20) - Auto-adding token to requests

#### **Exercise**: Trace the authentication flow
1. Open [src/App.tsx](src/App.tsx)
2. Find the useEffect that runs on mount
3. Understand what it checks
4. Open [src/api/auth.ts](src/api/auth.ts)
5. See what `getAccessToken()` returns
6. See what `getUserInfo()` returns
7. Open [src/components/LoginPage.tsx](src/components/LoginPage.tsx)
8. Find `handleChildLogin` - trace what it does
9. Open [src/api/axiosInstance.ts](src/api/axiosInstance.ts)
10. See how token is added to every request

---

### **2.3 Page Navigation**

**Your app doesn't use React Router** - it uses state-based navigation!

```tsx
// In App.tsx
const [currentPage, setCurrentPage] = useState<Page>('dashboard');

// In render:
{currentPage === 'dashboard' && <ParentDashboard />}
{currentPage === 'games' && <GamesPage />}
{currentPage === 'chatbot' && <ChatbotInterface />}

// When user clicks sidebar:
<button onClick={() => setCurrentPage('games')}>Games</button>
```

**Advantages**:
- Simple to understand
- No external routing library needed
- State is inside App component (easy to debug)

**Disadvantage**:
- Can't bookmark pages (URL doesn't change)
- Back button doesn't work between pages

#### **Exercise**:
1. Open [src/App.tsx](src/App.tsx)
2. Find where `currentPage` state is defined
3. Find all the conditional renders (if currentPage === ...)
4. Open [src/components/AppSidebar.tsx](src/components/AppSidebar.tsx)
5. Find where sidebar items call `setCurrentPage`

---

### **2.4 API Integration Pattern**

**Your pattern**:
```
Component needs data
    ↓
useEffect calls API
    ↓
API file (chatApi.ts, taskApi.ts, etc.)
    ↓
Uses axiosInstance to make request
    ↓
Backend processes
    ↓
Response returned
    ↓
Component saves to state
    ↓
JSX renders with new data
```

**Example - Fetching chat messages**:

[src/api/chatApi.ts](src/api/chatApi.ts) - Makes API call
```typescript
export async function sendMessage(message: string) {
  const response = await axiosInstance.post('/api/chat/message', { message });
  return response.data;
}
```

[src/components/ChatbotInterface.tsx](src/components/ChatbotInterface.tsx) - Calls it in useEffect
```typescript
const handleSendMessage = async (message: string) => {
  const response = await sendMessage(message);
  setMessages([...messages, response]);
};
```

#### **Exercise**:
1. Pick one API file: [src/api/taskApi.ts](src/api/taskApi.ts) or [src/api/chatApi.ts](src/api/chatApi.ts)
2. Read what functions it exports
3. Find a component that imports this API file
4. See how the component calls the API function
5. See where the response is stored in state

---

## **Phase 3: Hands-On Practice (5-6 hours)**

### **3.1 Modify Existing Component**

**Task 1**: Change LoginPage welcome message
1. Open [src/components/LoginPage.tsx](src/components/LoginPage.tsx)
2. Find the `<h1>Welcome to Parvarish</h1>` text (around line 80)
3. Change it to something else, like `<h1>Login to Your Account</h1>`
4. Save and check in browser - should update immediately

**Task 2**: Add a new button to ParentDashboard
1. Open [src/components/ParentDashboard.tsx](src/components/ParentDashboard.tsx)
2. Find where buttons are rendered
3. Add a new button that says "Settings" (just the button, don't worry about functionality)
4. Save and check browser

**Task 3**: Change a color
1. Open any component (e.g., [src/components/LoginPage.tsx](src/components/LoginPage.tsx))
2. Find where colors are defined (look for Tailwind classes like `bg-blue-500`, `text-red-600`)
3. Change a color, save, and see update in browser

### **3.2 Create a Simple New Component**

**Task**: Create a Welcome component that accepts a name as prop

```tsx
// Create file: src/components/Welcome.tsx
interface WelcomeProps {
  name: string;
}

export function Welcome({ name }: WelcomeProps) {
  return (
    <div className="p-4 bg-blue-100 rounded">
      <h1>Welcome, {name}!</h1>
      <p>Happy to see you here.</p>
    </div>
  );
}
```

Then use it in ParentDashboard:
```tsx
<Welcome name="Ahmed" />
```

### **3.3 Add State to a Component**

**Task**: Add a counter to ParentDashboard

```tsx
import { useState } from 'react';

export function ParentDashboard() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

Verify:
- Click button
- Count increases
- Component re-renders automatically

### **3.4 Use useEffect**

**Task**: Log a message when ParentDashboard loads

```tsx
import { useEffect } from 'react';

export function ParentDashboard() {
  useEffect(() => {
    console.log('ParentDashboard component loaded!');
    return () => {
      console.log('ParentDashboard component unmounting!');
    };
  }, []);
  
  return <div>...</div>;
}
```

Verify:
- Open browser DevTools (F12)
- Go to Console tab
- Navigate to ParentDashboard page
- Should see "ParentDashboard component loaded!"

### **3.5 Make an API Call**

**Task**: Call an existing API and log the response

```tsx
import { useEffect } from 'react';
import { getAccessToken } from '../api/auth';

export function ParentDashboard() {
  useEffect(() => {
    const token = getAccessToken();
    console.log('Current auth token:', token);
  }, []);
  
  return <div>...</div>;
}
```

---

## **Phase 4: Deep Dive into Your Specific Features (6-8 hours)**

### **4.1 Game System**

**Files to study**:
- [src/components/GamesPage.tsx](src/components/GamesPage.tsx) - Game list
- [src/components/GameScreen.tsx](src/components/GameScreen.tsx) - Game wrapper
- [src/components/games/MemoryGame.tsx](src/components/games/MemoryGame.tsx) - Specific game

**Questions to answer**:
1. How are games fetched from backend?
2. How does GameScreen know which game to show?
3. How does a game return score/result back to parent?

**Task**: Understand one complete game flow
1. Open [src/components/GamesPage.tsx](src/components/GamesPage.tsx)
2. Find where games list is rendered
3. See what data is passed to GameScreen
4. Open [src/components/GameScreen.tsx](src/components/GameScreen.tsx)
5. Understand how it selects which game component to show
6. Open one game file, e.g., [src/components/games/MemoryGame.tsx](src/components/games/MemoryGame.tsx)
7. Understand the game logic

### **4.2 Chatbot System**

**Files to study**:
- [src/components/ChatbotInterface.tsx](src/components/ChatbotInterface.tsx) - Chat UI
- [src/api/chatApi.ts](src/api/chatApi.ts) - API calls

**Questions to answer**:
1. How are messages sent to backend?
2. How are responses displayed?
3. How is message history stored?

### **4.3 Task System**

**Files to study**:
- [src/components/TaskList.tsx](src/components/TaskList.tsx) - Task display
- [src/components/TaskGeneration.tsx](src/components/TaskGeneration.tsx) - Task creation
- [src/api/taskApi.ts](src/api/taskApi.ts) - Task API

### **4.4 Progress Tracking**

**Files to study**:
- [src/components/ProgressDashboard.tsx](src/components/ProgressDashboard.tsx)
- [src/api/childProgressApi.ts](src/api/childProgressApi.ts)

---

## **Phase 5: Evaluation Prep (2-3 hours)**

### **5.1 Key Questions to Prepare Answers For**

1. **"What is React?"**
   - Answer: UI library that uses components and state
   - Components are reusable
   - State drives what's rendered

2. **"What are components?"**
   - Answer: Functions that return JSX
   - Can receive props (data from parent)
   - Can have state (data they remember)

3. **"How does your authentication work?"**
   - Answer: User logs in → backend returns token → token saved to localStorage → axios auto-adds token to all requests

4. **"What is props vs state?"**
   - Props: data passed FROM parent TO child (read-only)
   - State: data component remembers and can change

5. **"How do API calls work?"**
   - Answer: Use axios → await response → save data to state → component re-renders

6. **"How is data flow in your app?"**
   - User action → state updated → component re-renders → new UI shown

7. **"What is useEffect?"**
   - Answer: Runs code at specific times (on mount, when dependency changes)

8. **"How does navigation work?"**
   - Answer: State-based (currentPage state) → when page state changes → different component renders

### **5.2 Code Walkthrough Practice**

Be prepared to:
1. Open a component and explain what it does
2. Find state variables and explain why they exist
3. Trace a user action from click to API call to result
4. Explain how a component receives and uses props

### **5.3 Terminology to Know**

- **JSX**: HTML-like syntax in JavaScript
- **Component**: Reusable function that returns JSX
- **Props**: Data passed to component
- **State**: Component memory
- **Hook**: Functions like useState, useEffect
- **Render**: Display component on screen
- **Re-render**: Display again when something changes
- **Async/Await**: Non-blocking code
- **Promise**: Object that represents eventual result
- **TypeScript**: JavaScript with type checking

---

## **Study Schedule (Recommended)**

**Day 1**:
- Phase 1.1 - 1.3 (2 hours)
- Study your components: LoginPage, ParentDashboard

**Day 2**:
- Phase 1.4 - 1.6 (2 hours)
- Study state usage in LoginPage
- Study async/await in API files

**Day 3**:
- Phase 2 (4 hours)
- Understand auth system completely
- Understand page navigation
- Understand API integration pattern

**Day 4**:
- Phase 3 (5 hours)
- Do all the hands-on tasks
- Create your own component
- Modify existing components

**Day 5** (Evaluation day):
- Phase 4 (2 hours) - Focus on your main features
- Phase 5 (1 hour) - Practice answers

---

## **Resources to Check**

### **When you get stuck**:

1. **Understanding a component**: 
   - Open the file
   - Read top to bottom
   - For each `use*`, understand what it does
   - For each JSX element, understand why it's rendered

2. **Understanding a feature**:
   - Find the main component file
   - Look at what props it receives
   - Look at what state it has
   - Find the API calls (imports from `/api/`)
   - Trace the data flow

3. **Understanding the flow**:
   - Look for `onClick`, `onSubmit` handlers
   - See what they do (update state? call API?)
   - See what state is updated
   - See what JSX uses that state

---

## **Quick Reference**

### **Common React Patterns in Your Codebase**

**Pattern 1: Form Submission**
```tsx
const [email, setEmail] = useState('');
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await apiFunction(email);
    // Success
  } catch (e) {
    // Error
  } finally {
    setIsLoading(false);
  }
};

return <form onSubmit={handleSubmit}>...</form>;
```

**Pattern 2: Data Fetching**
```tsx
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    const result = await apiFunction();
    setData(result);
    setIsLoading(false);
  };
  fetchData();
}, []);

return isLoading ? <Spinner /> : <Data data={data} />;
```

**Pattern 3: Conditional Rendering**
```tsx
{isLoggedIn ? (
  <Dashboard />
) : (
  <LoginPage />
)}
```

---

**Good luck! You've got this! 💪**
