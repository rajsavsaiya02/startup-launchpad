<div align="center">
  <h1>⚡ Startup LaunchPad: Automation Scripts</h1>
  <p><strong>One-Click Project Startup for Windows & Mac/Linux</strong></p>
</div>

---

## 📖 Overview
This directory contains automation scripts designed to streamline the improved development workflow. These scripts allow you to start both the **Backend (Server)** and **Frontend (Client)** with a single command, handling dependency installation automatically.

---

## 📂 Available Scripts

| OS | Script File | Description |
| :--- | :--- | :--- |
| **🍎 Mac / 🐧 Linux** | `start_project.sh` | Bash script. Runs services concurrently in the same terminal. |
| **🪟 Windows** | `start_project.bat` | Batch script. Opens separate command windows for Server and Client. |

---

## 🚀 How to Use

### For Mac & Linux Users (Bash)
1. **Permission**: Ensure the script is executable (run once):
   ```bash
   chmod +x start/start_project.sh
   ```
2. **Run**:
   ```bash
   ./start/start_project.sh
   ```
3. **Stop**: Press `Ctrl+C` to shut down both services.

### For Windows Users (Batch)
1. **Run**: Double-click `start\start_project.bat` or run it from the command line.
2. **Behavior**: Two new windows will open (one for Backend, one for Frontend).
3. **Stop**: Close the terminal windows to stop the servers.

---

## 🛠️ Troubleshooting
- **"Permission Denied"**: Run `chmod +x start/start_project.sh`.
- **"Command not found: npm"**: Ensure Node.js is installed and added to your system PATH.
- **Database Errors**: Check your `server/.env` file and ensure PostgreSQL is running.

---
> **Note:** These scripts allow for "Lazy Loading" of dependencies. If `node_modules` is missing, the script will automatically run `npm install` for you.
