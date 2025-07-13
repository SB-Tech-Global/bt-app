# Login Page Setup Guide

## Overview
A login page has been created with username/password authentication and Google SSO integration.

## Features
- Username/password authentication
- Google OAuth integration
- Responsive design with dark theme
- Form validation and error handling
- Authentication state management
- Protected routes

## Setup Instructions

### 1. Install Required Dependencies
```bash
npm install @react-oauth/google
```

### 2. Configure Google OAuth
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add your domain to the authorized origins
6. Copy the Client ID

### 3. Update the Login Page
Replace `YOUR_GOOGLE_CLIENT_ID` in `app/login/page.js` with your actual Google Client ID:

```javascript
<GoogleOAuthProvider clientId="your-actual-client-id-here">
```

### 4. Backend API Endpoints
Ensure your Django backend has the following endpoints:

#### Login Endpoint
```
POST /token/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}

Response:
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyMzg0NTk3LCJpYXQiOjE3NTIyOTgxOTcsImp0aSI6Ijk0YWI1ZWQ1ODY3NzQzOTZhOTkzNzJmZDgwZmNjM2RjIiwidXNlcl9pZCI6MX0.oeWfTdsmRSgj4y6BGZOflr2XvPWMm9l28337OhsmqA0"
}
```

#### Google OAuth Endpoint
```
POST /auth/google/
Content-Type: application/json

{
  "credential": "google-jwt-token"
}

Response:
{
  "access": "jwt-access-token-here"
}
```

### 5. Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_API_URL=https://bt-backend.ntgen1.in
```

### 6. Usage
- Navigate to `/login` to access the login page
- Users can authenticate with username/password or Google SSO
- Successful authentication redirects to `/dashboard`
- Protected routes automatically redirect to login if not authenticated

## File Structure
```
app/
├── login/
│   └── page.js          # Login page component
├── layout.tsx           # Updated with AuthProvider
components/
├── AuthContext.js       # Authentication context
├── ProtectedRoute.js    # Route protection component
└── utils/
    └── apiRequest.js    # API request utility (updated to use dynamic tokens)
```

## Authentication Flow
1. User submits login form with username/password
2. Frontend sends request to `/token/` endpoint
3. Backend validates credentials and returns JWT access token
4. Frontend stores token in localStorage
5. Token is automatically included in subsequent API requests
6. Protected routes check for token presence

## Customization
- Update the styling in `app/login/page.js` to match your brand
- Modify the authentication logic in `components/AuthContext.js`
- Add additional OAuth providers as needed
- Customize the protected route behavior in `components/ProtectedRoute.js`

## Security Notes
- Always use HTTPS in production
- Implement proper JWT token validation on the backend
- Add rate limiting to prevent brute force attacks
- Consider implementing refresh tokens for better security
- Validate Google tokens on the backend before creating sessions
- Tokens are automatically included in API requests via the `apiRequest` utility 