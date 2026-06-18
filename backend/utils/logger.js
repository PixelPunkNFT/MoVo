const Log = require('../models/Log.model');

const createLog = async ({ action, category, user, description, details = {}, ip, userAgent, severity = 'info' }) => {
  try {
    await Log.create({ action, category, user, description, details, ip, userAgent, severity });
  } catch (err) {
    console.error('Errore salvataggio log:', err.message);
  }
};

const logAction = (req, action, category, description, details = {}, severity = 'info') => {
  return createLog({
    action,
    category,
    user: req.user?._id,
    description,
    details,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    severity,
  });
};

module.exports = { createLog, logAction };
