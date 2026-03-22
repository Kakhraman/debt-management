require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const debtRoutes = require('./routes/debtRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const ratesRoutes = require('./routes/ratesRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/auth', authRoutes);
app.use('/debts', debtRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/rates', ratesRoutes);

// Error handler
app.use(errorMiddleware);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Debt Tracker running at http://localhost:${PORT}`);
});
