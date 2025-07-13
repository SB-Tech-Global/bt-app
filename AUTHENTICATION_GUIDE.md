# Authentication & Protected Routes Guide

## Overview
This application implements a comprehensive authentication system with JWT tokens, protected routes, and automatic session management.

## 🏗️ Architecture

### 1. Authentication Flow
```
User Login → JWT Token → localStorage → API Requests → Protected Routes
     ↓
Token Expires → 401 Error → Auto Logout → Redirect to Login
```

### 2. File Structure
```
components/
├── AuthContext.js          # Authentication state management
├── ProtectedRoute.js       # Route protection component
├── LayoutContent.js        # Conditional sidebar rendering
└── utils/
    └── apiRequest.js       # API requests with auth headers

app/
├── layout.tsx              # Root layout with AuthProvider
├── login/
│   └── page.js            # Login page with Google OAuth
└── [other pages]          # Protected application pages
```

## 🔐 Authentication System

### 1. AuthContext (`components/AuthContext.js`)

**Purpose**: Centralized authentication state management

**Key Features**:
- Manages user authentication state
- Handles token storage in localStorage
- Provides login/logout functions
- Listens for token expiration events

**State Variables**:
```javascript
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [loading, setLoading] = useState(true);
```

**Key Functions**:
```javascript
// Login function
const login = (userData, authToken) => {
  setUser(userData);
  setToken(authToken);
  localStorage.setItem('token', authToken);
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
};

// Logout function
const logout = () => {
  setUser(null);
  setToken(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

// Clear auth without redirect
const clearAuth = () => {
  setUser(null);
  setToken(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!token;
};
```

**Event Handling**:
```javascript
// Listen for auth logout events (e.g., from 401 errors)
const handleAuthLogout = (event) => {
  if (event.detail?.reason === 'token_expired') {
    clearAuth();
    router.push('/login');
  }
};
```

### 2. Login Page (`app/login/page.js`)

**Features**:
- Username/password authentication
- Google OAuth integration
- Form validation and error handling
- Loading states
- Password visibility toggle

**Authentication Flow**:
```javascript
const handleSubmit = async (e) => {
  // 1. Send credentials to backend
  const response = await apiRequest({
    endpoint: "http://localhost:8000/token/",
    method: "POST",
    payload: formData
  });

  // 2. Store token and redirect
  if (response.access) {
    login(null, response.access);
    router.push("/dashboard");
  }
};
```

**Google OAuth**:
```javascript
<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  <GoogleLogin
    onSuccess={async (credentialResponse) => {
      if (credentialResponse.credential) {
        await handleOAuthBackend('google', credentialResponse.credential);
      }
    }}
    onError={() => alert('Google Login Failed')}
  />
</GoogleOAuthProvider>
```

## 🛡️ Protected Routes

### 1. ProtectedRoute Component (`components/ProtectedRoute.js`)

**Purpose**: Wraps pages that require authentication

**How it works**:
```javascript
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return null; // Will redirect to login
  }

  return children;
}
```

**Usage**:
```javascript
// Wrap any page that requires authentication
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Dashboard Content</div>
    </ProtectedRoute>
  );
}
```

### 2. Layout Protection (`components/LayoutContent.js`)

**Purpose**: Conditionally renders sidebar based on authentication state

**Logic**:
```javascript
const pathname = usePathname();
const isLoginPage = pathname === '/login';
const isLandingPage = pathname === '/';
const shouldHideSidebar = isLoginPage || isLandingPage;

if (shouldHideSidebar) {
  return <>{children}</>; // Full-width layout
}
```

## 🔄 API Request System

### 1. apiRequest Utility (`components/utils/apiRequest.js`)

**Purpose**: Centralized API requests with automatic authentication

**Features**:
- Automatic token inclusion in headers
- 401 error handling with auto-logout
- Error message extraction
- Request/response logging

**Token Management**:
```javascript
// Add authorization header if token exists
const token = localStorage.getItem('token');
if (token && !endpoint.includes('/token/') && !endpoint.includes('/auth/')) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

**401 Error Handling**:
```javascript
if (res.status === 401) {
  // Clear tokens
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Notify AuthContext
  window.dispatchEvent(new CustomEvent('auth:logout', { 
    detail: { reason: 'token_expired' } 
  }));
  
  // Redirect to login
  window.location.href = '/login';
}
```

## 🔄 Authentication Flow Examples

### 1. User Login Process
```
1. User enters credentials on /login
2. Frontend sends POST to /token/
3. Backend validates and returns JWT token
4. Frontend stores token in localStorage
5. AuthContext updates state
6. User redirected to /dashboard
```

### 2. Protected Route Access
```
1. User tries to access /dashboard
2. ProtectedRoute checks isAuthenticated()
3. If authenticated: render page
4. If not authenticated: redirect to /login
```

### 3. Token Expiration Handling
```
1. User makes API request with expired token
2. Backend returns 401 Unauthorized
3. apiRequest detects 401 status
4. Clears localStorage tokens
5. Dispatches auth:logout event
6. AuthContext clears state
7. Redirects to /login
```

### 4. Automatic Logout
```
1. Token expires or becomes invalid
2. Any API call returns 401
3. System automatically:
   - Clears all authentication data
   - Updates React state
   - Redirects to login page
   - Shows "Session expired" message
```

## 🎯 Usage Examples

### 1. Protecting a Page
```javascript
// app/dashboard/page.js
import ProtectedRoute from '../../components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Dashboard content here</div>
    </ProtectedRoute>
  );
}
```

### 2. Using Authentication in Components
```javascript
import { useAuth } from '../components/AuthContext';

export default function MyComponent() {
  const { user, token, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Making Authenticated API Calls
```javascript
import apiRequest from '../components/utils/apiRequest';

// Token automatically included in headers
const response = await apiRequest({
  endpoint: 'http://localhost:8000/api/data/',
  method: 'GET'
});
```

## 🔧 Configuration

### 1. Environment Variables
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Backend API Endpoints
```
POST /token/                    # Username/password login
POST /auth/google/              # Google OAuth login
GET  /api/protected-endpoint/   # Protected API calls
```

### 3. Google OAuth Setup
1. Get Client ID from Google Cloud Console
2. Replace `YOUR_GOOGLE_CLIENT_ID` in login page
3. Configure authorized origins in Google Console

## 🛡️ Security Features

### 1. Token Management
- ✅ JWT tokens stored in localStorage
- ✅ Automatic token inclusion in API requests
- ✅ Token expiration handling
- ✅ Secure token cleanup on logout

### 2. Route Protection
- ✅ Automatic redirect for unauthenticated users
- ✅ Loading states during authentication checks
- ✅ Clean error handling

### 3. Session Management
- ✅ Automatic logout on token expiration
- ✅ Event-driven authentication state updates
- ✅ Consistent state across components

### 4. Error Handling
- ✅ Graceful 401 error handling
- ✅ User-friendly error messages
- ✅ Automatic cleanup on errors

## 🔄 State Management

### 1. Authentication State
```javascript
{
  user: null | UserObject,
  token: null | string,
  loading: boolean,
  isAuthenticated: () => boolean
}
```

### 2. localStorage Structure
```javascript
{
  token: "jwt-token-string",
  user: "JSON-stringified-user-object" // Optional
}
```

### 3. Event System
```javascript
// Custom events for authentication
window.dispatchEvent(new CustomEvent('auth:logout', { 
  detail: { reason: 'token_expired' } 
}));
```

## 🚀 Best Practices

### 1. Always Use ProtectedRoute
```javascript
// ✅ Good
export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Content</div>
    </ProtectedRoute>
  );
}

// ❌ Bad - No protection
export default function MyPage() {
  return <div>Content</div>;
}
```

### 2. Use AuthContext for State
```javascript
// ✅ Good
const { user, logout } = useAuth();

// ❌ Bad - Direct localStorage access
const token = localStorage.getItem('token');
```

### 3. Handle Loading States
```javascript
const { loading } = useAuth();

if (loading) {
  return <div>Loading...</div>;
}
```

This authentication system provides a robust, secure, and user-friendly authentication experience with automatic session management and protected routes. 