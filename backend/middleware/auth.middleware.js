const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Proteggi le routes - verifica JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Controlla se il token è nell'header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Assicurati che il token esista
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Non autorizzato ad accedere a questa route'
    });
  }

  try {
    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ottieni l'utente dal token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Controlla se l'utente è attivo
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account disabilitato. Contatta il supporto.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token non valido o scaduto'
    });
  }
};

// Verifica che l'utente abbia almeno un veicolo
exports.requireVehicle = async (req, res, next) => {
  if (!req.user.vehicles || req.user.vehicles.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Devi aggiungere almeno un veicolo per pubblicare un passaggio'
    });
  }
  next();
};

// Verifica che l'utente sia verificato
exports.requireVerification = async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Devi verificare la tua email per accedere a questa funzionalità'
    });
  }
  next();
};

// Admin middleware
exports.admin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato. Solo gli amministratori possono accedere a questa risorsa.'
    });
  }
};

// Genera JWT Token
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};
