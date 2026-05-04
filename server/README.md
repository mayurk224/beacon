# Beacon Backend (Server)

The server for Beacon is a robust RESTful API built with Node.js and Express. It handles authentication, data management, file storage, and business logic for the incident management platform.

## 🚀 Technology Stack

- **Runtime**: Node.js
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Security**: 
  - [Helmet](https://helmetjs.github.io/) for security headers
  - [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit) for DoS protection
  - [Bcryptjs](https://www.npmjs.com/package/bcryptjs) for password hashing
- **Authentication**: JWT (JSON Web Tokens) & Google OAuth 2.0
- **File Storage**: [ImageKit](https://imagekit.io/)
- **Mailing**: [Nodemailer](https://nodemailer.com/)
- **Logging**: Morgan & Rotating File Stream
- **Testing**: [Jest](https://jestjs.io/) & [Supertest](https://www.npmjs.com/package/supertest)

## 📦 Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` root:
   ```env
   PORT=3000
   MONGO_URL=your_mongodb_uri
   GOOGLE_USER=your_email@gmail.com
   GOOGLE_APP_PASS=your_gmail_app_password
   CLIENT_URL=http://localhost:5173
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SERVER_URL=http://localhost:3000
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   NODE_ENV=development
   ```

## 🛠️ Development and Testing

- **Start development server (with nodemon)**:
  ```bash
  npm run dev
  ```
- **Start production server**:
  ```bash
  npm run start
  ```
- **Run tests**:
  ```bash
  npm test
  ```

## 📂 Directory Structure

- `src/`: Core application setup (`app.js`).
- `controllers/`: Request handlers for different modules (auth, incident, user, admin).
- `models/`: Mongoose schemas for User, Incident, Organization, etc.
- `routes/`: Express route definitions.
- `middleware/`: Custom middleware for authentication, file uploads, and admin checks.
- `config/`: Configuration files and validation schemas.
- `services/`: External services like email.
- `utils/`: Utility functions for logging, rate limiting, and more.
- `tests/`: Comprehensive test suite including unit and integration tests.

## 📡 API Documentation

### Auth Routes (`/api/auth`)
- `POST /signup`: Register a new user.
- `POST /login`: Authenticate a user and receive tokens.
- `POST /logout`: Clear authentication cookies.
- `GET /verify-email`: Verify user email via token.
- `POST /forgot-password`: Request password reset.
- `POST /google`: Authenticate via Google OAuth.

### User Routes (`/api/users`)
- `GET /profile`: Get current user profile.
- `PATCH /profile`: Update user profile details.
- `POST /organization`: Create a new organization.
- `POST /organization/user/invite`: Invite a user to an organization.

### Incident Routes (`/api/incidents`)
- `POST /create`: Create a new incident.
- `GET /all`: Retrieve all incidents for the user's organization.
- `GET /:id`: Get detailed information for a specific incident.
- `POST /:id/update`: Add a status update to an incident.
- `POST /:id/assign`: Assign responders to an incident.

### Admin Routes (`/api/admin`)
- Restricted routes for platform administrators to manage users and monitor system activity.

## 🤝 Contribution Guidelines

Please ensure all new features are accompanied by relevant unit and integration tests in the `tests/` directory.

## 📄 License

This project is licensed under the ISC License.
