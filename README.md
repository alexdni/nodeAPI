# Node API with Firebase Authentication

A simple Node.js API service with Firebase authentication, user management, and Swagger documentation.

## Features

- **Authentication**: Firebase-based user authentication
- **User Management**: Create, read, update, and delete user profiles
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Vercel Ready**: Configured for easy deployment to Vercel

## Endpoints

### Public Endpoints
- `GET /` - Welcome message
- `GET /hello` - Returns "Hello from Vercel"
- `POST /palindrome` - Returns palindrome of a word
- `GET /palindrome/:word` - Returns palindrome via URL parameter

### Authentication Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/verify-token` - Verify a Firebase ID token
- `GET /auth/user` - Get current user profile (requires auth)
- `PUT /auth/user` - Update user profile (requires auth)
- `DELETE /auth/user` - Delete user account (requires auth)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and Firestore Database
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Option 1: Using individual environment variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Option 2: Using base64 encoded service account (recommended for Vercel)
# Encode your service account JSON: base64 -i serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-encoded-service-account-json
```

### 4. Run Locally

```bash
npm start
# or for development with auto-reload
npm run dev
```

Access the API at:
- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api-docs

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Configure Environment Variables

For Vercel deployment, it's recommended to use the base64 encoded service account:

1. Encode your service account JSON:
   ```bash
   base64 -i path/to/serviceAccountKey.json
   ```

2. Add the environment variable in Vercel:
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add `FIREBASE_SERVICE_ACCOUNT_BASE64` with the encoded value

### 3. Deploy

```bash
vercel
```

## Authentication Flow

### Client-Side Authentication

1. Use Firebase SDK to authenticate users on the client
2. Get the ID token: `const idToken = await user.getIdToken()`
3. Include the token in API requests: `Authorization: Bearer ${idToken}`

### Example: Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123",
    "displayName": "John Doe"
  }'
```

### Example: Authenticated Request

```bash
curl -X GET http://localhost:3000/auth/user \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

## Security

- All sensitive user operations require authentication
- Firebase ID tokens are verified on each request
- User data is stored securely in Firestore
- Passwords are managed by Firebase Auth (never stored directly)

## API Documentation

The API documentation is automatically generated and available at `/api-docs` when running the server. The standalone OpenAPI specification is also available in `swagger.json`.

## Troubleshooting

### Firebase Configuration Error
- Ensure all required environment variables are set
- Check that the service account key is valid
- Verify Firebase project settings

### Authentication Errors
- Ensure the ID token is valid and not expired
- Check that the Authorization header format is correct: `Bearer TOKEN`
- Verify the user exists in Firebase Auth

## License

ISC 