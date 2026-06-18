const { body, param, query, validationResult } = require('express-validator');

// Middleware per controllare gli errori di validazione
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errori di validazione',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validazioni per registrazione
exports.registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('Il nome deve essere tra 2 e 50 caratteri'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Il cognome è obbligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('Il cognome deve essere tra 2 e 50 caratteri'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .isEmail().withMessage('Inserisci un\'email valida')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Il telefono è obbligatorio')
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
    .withMessage('Inserisci un numero di telefono valido'),
  
  body('password')
    .notEmpty().withMessage('La password è obbligatoria')
    .isLength({ min: 6 }).withMessage('La password deve essere almeno 6 caratteri'),
  
  body('dateOfBirth')
    .notEmpty().withMessage('La data di nascita è obbligatoria')
    .isISO8601().withMessage('Formato data non valido')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18) {
        throw new Error('Devi avere almeno 18 anni');
      }
      return true;
    })
];

// Validazioni per login
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .isEmail().withMessage('Inserisci un\'email valida')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La password è obbligatoria')
];

// Validazioni per aggiungere veicolo
exports.vehicleValidation = [
  body('plateNumber')
    .trim()
    .notEmpty().withMessage('La targa è obbligatoria')
    .matches(/^[A-Z]{2}[0-9]{3}[A-Z]{2}$/i).withMessage('Formato targa non valido (es: AB123CD)')
    .toUpperCase(),
  
  body('brand')
    .trim()
    .notEmpty().withMessage('La marca è obbligatoria'),
  
  body('model')
    .trim()
    .notEmpty().withMessage('Il modello è obbligatorio'),
  
  body('color')
    .trim()
    .notEmpty().withMessage('Il colore è obbligatorio'),
  
  body('year')
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage('Anno non valido')
];

// Validazioni per creare un ride
exports.createRideValidation = [
  body('vehicleId')
    .notEmpty().withMessage('Il veicolo è obbligatorio'),
  
  body('departure.address')
    .trim()
    .notEmpty().withMessage('L\'indirizzo di partenza è obbligatorio'),
  
  body('departure.city')
    .trim()
    .notEmpty().withMessage('La città di partenza è obbligatoria'),
  
  body('departure.location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Le coordinate di partenza sono obbligatorie'),
  
  body('departure.dateTime')
    .notEmpty().withMessage('La data e ora di partenza sono obbligatorie')
    .isISO8601().withMessage('Formato data non valido')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('La data di partenza deve essere nel futuro');
      }
      return true;
    }),
  
  body('destination.name')
    .trim()
    .notEmpty().withMessage('Il nome del locale è obbligatorio'),
  
  body('destination.address')
    .trim()
    .notEmpty().withMessage('L\'indirizzo di destinazione è obbligatorio'),
  
  body('destination.location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Le coordinate di destinazione sono obbligatorie'),
  
  body('availableSeats')
    .isInt({ min: 1, max: 8 }).withMessage('I posti disponibili devono essere tra 1 e 8'),
  
  body('pricePerSeat')
    .isFloat({ min: 0 }).withMessage('Il prezzo deve essere un numero positivo'),
  
  body('distance')
    .isFloat({ min: 0 }).withMessage('La distanza deve essere un numero positivo'),
  
  body('estimatedDuration')
    .isInt({ min: 1 }).withMessage('La durata stimata deve essere almeno 1 minuto')
];

// Validazioni per prenotare un ride
exports.bookRideValidation = [
  body('seatsBooked')
    .isInt({ min: 1, max: 4 }).withMessage('Puoi prenotare da 1 a 4 posti'),
  
  body('passengerNote')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('La nota non può superare 300 caratteri')
];

// Validazioni per recensione
exports.reviewValidation = [
  body('overallRating')
    .isInt({ min: 1, max: 5 }).withMessage('Il rating deve essere tra 1 e 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Il commento non può superare 500 caratteri'),
  
  body('ratings.punctuality')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Il rating puntualità deve essere tra 1 e 5'),
  
  body('ratings.cleanliness')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Il rating pulizia deve essere tra 1 e 5'),
  
  body('ratings.communication')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Il rating comunicazione deve essere tra 1 e 5'),
  
  body('ratings.behavior')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Il rating comportamento deve essere tra 1 e 5')
];

// Validazione ObjectId MongoDB
exports.validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage(`${paramName} non valido`)
];
