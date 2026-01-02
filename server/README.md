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
│   ├── config/       # ⚙️ Configuration
│   ├── controllers/  # 🧠 Business logic (Auth, Config)
│   ├── database/     # 🐘 Database Connection & Logic
│   ├── middleware/   # 🛡️ Custom middleware
│   ├── public/       # 📂 Static assets (Mobile Configs)
│   ├── routes/       # 🛣️ API Route definitions
│   ├── scripts/      # 📜 Setup scripts (e.g. initDb)
│   ├── utils/        # 🧰 Utility functions
│   ├── app.js        # 🚀 App setup
│   └── index.js      # 🏁 Entry point
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
npm run db:init  # Initialize database tables
```

### 3. Configuration
Create a `.env` file in the `server/` root (copy from `.env.example`):
```env
PORT=5000
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=slpdb
# Email (Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
SMTP_HOST=mail.cyberinfospace.com
SMTP_PORT=465
SMTP_SECURE=true
# JWT
JWT_SECRET=your_jwt_secret
```

### 4. Running the Server

**Recommended Method (via Startup Scripts):**
```bash
../start/start_backend.sh
```

**Manual Method:**
```bash
# Development (with Nodemon)
npm run dev
```

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
