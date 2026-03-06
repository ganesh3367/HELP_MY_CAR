const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io context for controllers
app.set('io', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_order', (orderId) => {
        socket.join(orderId);
        console.log(`Socket ${socket.id} joined order ${orderId}`);
    });

    socket.on('update_location', ({ orderId, location }) => {
        // Broadcast location update to anyone tracking this order
        io.to(orderId).emit('location_updated', location);
        console.log(`Order ${orderId} location update:`, location);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        const sensitiveBody = { ...req.body };
        if (sensitiveBody.password) sensitiveBody.password = '********';
        console.log('Body:', sensitiveBody);
    }
    next();
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/garages', require('./routes/garageRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => {
    res.send('Help My Car API is running (MongoDB + Socket.io)');
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Unhandled Rejection: ${err?.message || err || 'Unknown error'}`);
    if (err?.stack) console.log(err.stack);
    // Close server & exit process
    if (server) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Uncaught Exception: ${err?.message || err || 'Unknown error'}`);
    if (err?.stack) console.log(err.stack);
    process.exit(1);
});

