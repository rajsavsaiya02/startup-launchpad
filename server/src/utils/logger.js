const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const infoLogPath = path.join(logDir, "app.log");
const errorLogPath = path.join(logDir, "error.log");

const writeToFile = (filePath, message) => {
  fs.appendFile(filePath, message + "\n", (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
};

const logger = {
  info: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[INFO] ${timestamp}: ${message}`;
    console.log(logMessage);
    writeToFile(infoLogPath, logMessage);
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[ERROR] ${timestamp}: ${message} ${error ? JSON.stringify(error) : ""}`;
    console.error(logMessage);
    writeToFile(errorLogPath, logMessage);
    writeToFile(infoLogPath, logMessage); // Also write errors to main log
  },
  warn: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[WARN] ${timestamp}: ${message}`;
    console.warn(logMessage);
    writeToFile(infoLogPath, logMessage);
  },
  debug: (message) => {
    if (process.env.NODE_ENV !== "production") {
      const timestamp = new Date().toISOString();
      const logMessage = `[DEBUG] ${timestamp}: ${message}`;
      console.log(logMessage);
      writeToFile(infoLogPath, logMessage);
    }
  },
};

module.exports = logger;
