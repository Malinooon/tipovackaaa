require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leagueRoutes = require('./routes/leagues');
const matchRoutes = require('./routes/matches');
const predictionRoutes = require('./routes/predictions');
const adminRoutes = require('./routes/admin');

// Import utilities
const { updateMatchResults } = require('./utils/sportsDbApi');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB připojeno'))
  .catch(err => console.error('Chyba připojení k MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Schedule tasks
// Aktualizace výsledků zápasů každou hodinu
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Spouštím automatickou aktualizaci výsledků zápasů...');
    await updateMatchResults();
    console.log('Aktualizace výsledků zápasů dokončena');
  } catch (error) {
    console.error('Chyba při aktualizaci výsledků zápasů:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Něco se pokazilo na serveru!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));

module.exports = app;
