const rateLimit = require('express-rate-limit');

// Rate limiter generale per API
exports.apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minuti
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // massimo 100 richieste
  message: {
    success: false,
    message: 'Troppe richieste da questo IP, riprova tra qualche minuto'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter per autenticazione (più restrittivo)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // massimo 5 tentativi
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Troppi tentativi di login. Riprova tra 15 minuti'
  }
});

// Rate limiter per creazione contenuti
exports.createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 10, // massimo 10 creazioni all'ora
  message: {
    success: false,
    message: 'Hai raggiunto il limite di creazioni. Riprova tra un\'ora'
  }
});

// Rate limiter per messaggi
exports.messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // massimo 30 messaggi al minuto
  message: {
    success: false,
    message: 'Stai inviando messaggi troppo velocemente. Rallenta un po\''
  }
});
