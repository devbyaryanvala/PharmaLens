const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { loadData } = require('./utils/dataLoader');
const searchRouter = require('./routes/search');
const aiRouter = require('./routes/ai');

const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Load Data on Startup
try {
    loadData();
} catch (e) {
    console.error("CRITICAL: Failed to load data, server might not function correctly.", e);
    process.exit(1); // Exit if data cannot load
}

// Routes
app.use('/api/search', searchRouter);
app.use('/api/ai', aiRouter);
app.use('/api/trends', require('./routes/trends'));

app.get('/', (req, res) => {
    res.send('Drug Analyzer API is running. Use /api/search?drug=Name or /api/ai/analyze for AI analysis.');
});

// 404 Handler for unknown routes
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Central Error Handler Middleware
app.use(errorHandler);

// Handle Uncaught Exceptions (Synchronous)
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Handle Unhandled Rejections (Asynchronous)
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Graceful Shutdown on Ctrl+C
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT (Ctrl+C). Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

// Start Server exposed to Network
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
    console.log(`Network access enabled. Access via your IP address on port ${PORT}`);
});

