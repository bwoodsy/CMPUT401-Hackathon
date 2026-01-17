const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const jobsRoutes = require('./routes/jobs');
const resumesRoutes = require('./routes/resume');
const usersRoutes = require('./routes/users');
const notificationsRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/resume', resumesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});