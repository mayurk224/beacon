# Beacon - Incident Management Platform

Beacon is a comprehensive incident management and response platform designed to help organizations track, manage, and resolve incidents efficiently. It provides tools for real-time monitoring, analytics, team collaboration, and automated playbooks.

## 🏗️ Project Architecture

The project is structured as a full-stack application with a clear separation between the frontend and backend.

- **[Client](./client)**: A modern, responsive web application built with React, Vite, and Tailwind CSS.
- **[Server](./server)**: A robust RESTful API built with Node.js, Express, and MongoDB.

## 🚀 Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **Animations**: GSAP
- **State Management**: React Context API
- **Charts**: Chart.js & react-chartjs-2
- **Icons**: Lucide React
- **Flow/Diagrams**: @xyflow/react

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Google OAuth 2.0, Bcrypt
- **Security**: Helmet, Express Rate Limit, CORS
- **File Storage**: ImageKit
- **Email Service**: Nodemailer
- **Logging**: Morgan & Rotating File Stream
- **Testing**: Jest, Supertest

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance
- ImageKit account (for file uploads)
- Google Cloud Console project (for Google OAuth)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd beacon
   ```

2. **Setup the Server**:
   ```bash
   cd server
   npm install
   # Create a .env file based on the server README instructions
   npm run dev
   ```

3. **Setup the Client**:
   ```bash
   cd ../client
   npm install
   # Create a .env file based on the client README instructions
   npm run dev
   ```

## 📂 Project Structure

```text
beacon/
├── client/           # Frontend React application
│   ├── src/          # Source code
│   └── public/       # Static assets
├── server/           # Backend Express API
│   ├── src/          # API core logic
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── tests/        # Unit and integration tests
└── README.md         # Project root documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [server/package.json](./server/package.json) for details.
