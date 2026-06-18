const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const socketIO = require('socket.io');

// Load env vars
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const rideRoutes = require('./routes/ride.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const chatRoutes = require('./routes/chat.routes');
const userRoutes = require('./routes/user.routes');
const venueRoutes = require('./routes/venue.routes');
const vehicleCatalogRoutes = require('./routes/vehicleCatalog.routes');
const adminRoutes = require('./routes/admin.routes');
const resaleRoutes = require('./routes/resale.routes');
const otpRoutes = require('./routes/otp.routes');
const notificationRoutes = require('./routes/notification.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const reportRoutes = require('./routes/report.routes');
const logRoutes = require('./routes/log.routes');

// Import socket handler
const { initializeSocket } = require('./sockets/chat.socket');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
initializeSocket(io);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true })); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(mongoSanitize()); // Sanitize data to prevent MongoDB injection

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connesso con successo'))
  .catch((err) => {
    console.error('❌ Errore connessione MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚗 Caraibe API - Ride Sharing App per Locali Latini Roma',
    version: '1.0.0',
    status: 'online'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/vehicle-catalog', vehicleCatalogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resales', resaleRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logs', logRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Errore interno del server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trovata'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server in esecuzione su porta ${PORT} in modalità ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = { app, io };
