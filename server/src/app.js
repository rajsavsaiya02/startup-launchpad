const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // Important: CORS must allow credentials
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('Unhandled Error', err);
    res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
