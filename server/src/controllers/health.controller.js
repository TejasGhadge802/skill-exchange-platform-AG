const mongoose = require('mongoose');

const getHealthStatus = async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  const healthData = {
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  };

  return res.status(200).json(healthData);
};

module.exports = {
  getHealthStatus,
};

