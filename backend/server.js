const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const applicationsRoutes = require('./routes/applications');
const resumesRoutes = require('./routes/resumes');
const communicationsRoutes = require('./routes/communications');
const remindersRoutes = require('./routes/reminders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routes
app.use('/api/applications', applicationsRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/reminders', remindersRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});