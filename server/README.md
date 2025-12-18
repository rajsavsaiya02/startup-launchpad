<div align="center">
  <h1>🛠️ Startup LaunchPad: Backend Server</h1>
  <p><strong>Node.js | Express.js | PostgreSQL</strong></p>
</div>

---

## 📖 Overview
The **Server** is the backbone of the Startup LaunchPad application. It provides a RESTful API built with **Node.js** and **Express.js**, connecting to a **PostgreSQL** database. It handles user authentication, data management, and business logic.

---

## 🏗️ Directory Structure
We follow a clean **MVC (Model-View-Controller)** pattern for scalability.

```
server/
├── src/
│   ├── config/       # ⚙️ Configuration (DB, Environment)
│   ├── controllers/  # 🧠 Business logic & Request handling
│   ├── middleware/   # 🛡️ Custom middleware (Auth, Error handling)
│   ├── routes/       # 🛣️ API Route definitions
│   ├── utils/        # 🧰 Utility functions (Logger, Helpers)
│   ├── app.js        # 🚀 App setup (Middleware, Routes)
│   └── index.js      # 🏁 Entry point (Server listener)
├── .env              # 🔐 Environment variables (GitIgnored)
└── package.json      # 📦 Dependencies & Scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** installed and running.

### 2. Installation
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

### 3. Configuration
Create a `.env` file in the `server/` root (copy from `.env.example`):
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/startup_launchpad
NODE_ENV=development
```

### 4. Running the Server
```bash
# Development (with Nodemon for auto-restart)
npm run dev

# Production
npm start
```
The server will run on **http://localhost:5000**.

---

## 🩺 API Health Check
Verify the server status:
- **GET** `/api/health`
- **Response**:
  ```json
  {
    "status": "success",
    "server": "running",
    "database": "connected",
    "timestamp": "2025-..."
  }
  ```

---
> **Note:** Always keep the `.env` file secure and never commit it to the repository.
