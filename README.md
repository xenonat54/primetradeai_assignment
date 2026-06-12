# ⚡ Primetrade.ai Backend Developer Assignment

## 📖 Overview
This repository contains the solution for the Primetrade.ai Backend Developer Intern assignment. It features a scalable, secure RESTful API built with Node.js and Express, backed by MongoDB. The backend includes robust JWT-based authentication, Role-Based Access Control (RBAC), and full CRUD functionality for a task management entity. 

A lightweight, decoupled Vanilla JavaScript frontend is also included to demonstrate and test the API integrations in real-time.

## ✨ Core Features
* **Authentication & Security:** Secure user registration and login using `bcryptjs` for password hashing and `jsonwebtoken` (JWT) for stateless session management.
* **Role-Based Access Control (RBAC):** Distinct permissions for `user` and `admin` roles, ensuring secure access to administrative endpoints.
* **Task Management CRUD:** Complete Create, Read, Update, and Delete operations for user-specific tasks.
* **Production-Ready Middleware:** Integration of `helmet` for HTTP header security, `express-rate-limit` to prevent brute-force attacks, and global centralized error handling.
* **Vanilla JS Frontend:** A responsive UI utilizing the Fetch API to interact seamlessly with the backend.

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose ORM
* **Security:** JWT, Bcrypt.js, Helmet, Express Rate Limit
* **Frontend:** HTML5, CSS3, Vanilla JavaScript

## 📂 Project Structure
```text
PRIMETRADEAI-ASSIGNMENT/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection setup
│   │   │   └── db.js
│   │   ├── controllers/     # Business logic for routes
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middleware/      # Security and error handling checkpoints
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/          # Mongoose database schemas
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   ├── routes/          # API route definitions
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── utils/           # Helper functions
│   │   │   └── jwt.js
│   │   ├── app.js           # Express app configuration & middleware
│   │   └── server.js        # Application entry point
│   ├── .env                 # Environment variables
│   └── package.json         # Backend dependencies
│
└── frontend/
    ├── css/
    │   └── style.css        # UI styling
    ├── js/
    │   ├── api.js           # Fetch API logic and HTTP requests
    │   └── app.js           # DOM manipulation and event listeners
    └── index.html           # Main dashboard interface

```

## 🚀 Getting Started

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:
```bash
cd backend

```


2. Install the required dependencies:
```bash
npm install

```


3. Create a `.env` file in the root of the `backend` folder and configure your environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development

```


4. Start the development server:
```bash
node src/server.js

```



### 2. Frontend Setup

1. Navigate to the `frontend` directory.
2. Open the `index.html` file in your browser, or use an extension like VS Code Live Server to launch the UI.
3. Ensure the backend server is running on port 5000 so the frontend Fetch calls connect successfully.

## 📡 API Endpoints Reference

| HTTP Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register a new user | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/v1/tasks` | Retrieve all tasks for logged-in user | Private (User) |
| `POST` | `/api/v1/tasks` | Create a new task | Private (User) |
| `PUT` | `/api/v1/tasks/:id` | Update an existing task | Private (User) |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task | Private (User) |
| `GET` | `/api/v1/admin/users` | View all system users | Private (Admin) |

## 📈 Scalability & Deployment Strategy

To scale this application for production at Primetrade.ai, the following architectural enhancements would be implemented:

1. **Stateless Authentication:** By utilizing JWTs, the backend is inherently stateless. We can spin up multiple instances of the Node.js application behind a Load Balancer (like NGINX or AWS ALB) without shared session memory issues.
2. **Database Scaling:** MongoDB allows for replica sets for high availability and sharding for horizontal scaling as the user base and task data grow.
3. **Caching Layer:** Introducing Redis to cache frequently accessed, read-heavy data (like user profiles or static dashboard statistics) to drastically reduce database load and latency.
4. **Containerization:** The decoupled structure allows the backend and frontend to be independently containerized using Docker, enabling streamlined deployment via CI/CD pipelines to a Kubernetes cluster.

```
Made by Gandharv Pandey
```
