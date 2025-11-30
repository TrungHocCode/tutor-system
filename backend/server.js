require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./src/config/database');

// Import routes
const tutorRoutes = require('./src/routes/tutors.route');
const studentRoutes = require('./src/routes/students.route');
const analyticsRoutes = require('./src/routes/analytics.route');
const reportRoutes = require('./src/routes/reports.route');

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'HCMUT Tutor Management API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/tutors', tutorRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reports', reportRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🎓 HCMUT Tutor Management API               ║
║   🚀 Server running on port ${PORT}            ║
║   📝 Environment: ${process.env.NODE_ENV}                ║
║   🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'} ║
╚═══════════════════════════════════════════════╝
  `);
});