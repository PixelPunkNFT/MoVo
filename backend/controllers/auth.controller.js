const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { generateToken } = require('../middleware/auth.middleware');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../utils/mail');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { logAction } = require('../utils/logger');

// @desc    Registra nuovo utente
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, dateOfBirth, gender } = req.body;

    // Controlla se l'utente esiste già
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email già registrata'
      });
    }

    // Controlla se il telefono esiste già
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Numero di telefono già registrato'
      });
    }

    // Crea utente
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      gender
    });

    // Genera token
    const token = generateToken(user._id);

    logAction(req, 'register', 'auth', `Nuovo utente registrato: ${email}`, { userId: user._id, email });

    res.status(201).json({
      success: true,
      message: 'Registrazione completata con successo',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profilePhoto: user.profilePhoto,
          role: user.role || 'user',
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione',
      error: error.message
    });
  }
};

// @desc    Login utente
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Controlla se l'utente esiste e includi la password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      logAction(req, 'login_failed', 'auth', `Tentativo login fallito: ${email}`, { email, reason: 'utente_non_trovato' }, 'warning');
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    // Controlla la password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      logAction(req, 'login_failed', 'auth', `Tentativo login fallito: ${email}`, { email, reason: 'password_errata' }, 'warning');
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    // Aggiorna lastSeen e isOnline
    user.lastSeen = new Date();
    user.isOnline = true;
    await user.save({ validateModifiedOnly: true });

    // Genera token
    const token = generateToken(user._id);

    logAction(req, 'login', 'auth', `Login effettuato: ${email}`, { userId: user._id, email });

    res.json({
      success: true,
      message: 'Login effettuato con successo',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          profilePhoto: user.profilePhoto,
          bio: user.bio,
          dateOfBirth: user.dateOfBirth,
          age: user.age,
          gender: user.gender,
          rating: user.rating,
          totalReviews: user.totalReviews,
          vehicles: user.vehicles,
          role: user.role || 'user',
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          nearbyAlerts: user.nearbyAlerts,
          preferences: user.preferences
        },
        token
      }
    });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il login',
      error: error.message
    });
  }
};

// @desc    Get profilo utente corrente
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          profilePhoto: user.profilePhoto,
          bio: user.bio,
          dateOfBirth: user.dateOfBirth,
          age: user.age,
          gender: user.gender,
          rating: user.rating,
          totalReviews: user.totalReviews,
          totalRidesAsDriver: user.totalRidesAsDriver,
          totalRidesAsPassenger: user.totalRidesAsPassenger,
          vehicles: user.vehicles,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          isIDVerified: user.isIDVerified,
          nearbyAlerts: user.nearbyAlerts,
          favoriteVenues: user.favoriteVenues,
          role: user.role || 'user',
          preferences: user.preferences,
          socialLinks: user.socialLinks,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Errore get me:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del profilo',
      error: error.message
    });
  }
};

// @desc    Aggiorna profilo utente
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'bio', 'gender', 'profilePhoto', 'preferences', 'socialLinks', 'dateOfBirth'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    logAction(req, 'update_profile', 'user', `Profilo aggiornato`, { updatedFields: Object.keys(updates) });

    res.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      data: { user }
    });
  } catch (error) {
    console.error('Errore aggiornamento profilo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento del profilo',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      logAction(req, 'forgot_password_not_found', 'auth', `Richiesta reset password per email inesistente: ${email}`, { email }, 'warning');
      return res.status(404).json({
        success: false,
        message: 'Nessun account trovato con questa email'
      });
    }

    // Genera reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minuti
    
    await user.save({ validateModifiedOnly: true });

    logAction(req, 'forgot_password', 'auth', `Richiesta reset password inviata: ${email}`, { email });

    try {
      await sendResetPasswordEmail(user.email, resetToken);
    } catch (emailErr) {
      console.error('Errore invio email reset:', emailErr);
    }
    
    res.json({
      success: true,
      message: 'Email di reset inviata. Controlla la tua casella di posta',
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Errore forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il reset della password',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      logAction(req, 'reset_password_invalid_token', 'auth', `Tentativo reset password con token non valido`, {}, 'warning');
      return res.status(400).json({
        success: false,
        message: 'Token non valido o scaduto'
      });
    }

    // Imposta nuova password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save({ validateModifiedOnly: true });

    logAction(req, 'reset_password', 'auth', `Password reimpostata per: ${user.email}`, { userId: user._id });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reimpostata con successo',
      data: { token }
    });
  } catch (error) {
    console.error('Errore reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il reset della password',
      error: error.message
    });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Aggiorna stato online
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date()
    });

    logAction(req, 'logout', 'auth', `Logout effettuato`);

    res.json({
      success: true,
      message: 'Logout effettuato con successo'
    });
  } catch (error) {
    console.error('Errore logout:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il logout',
      error: error.message
    });
  }
};

// @desc    Upload foto profilo
// @route   POST /api/auth/upload-photo
// @access  Private
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nessuna foto caricata'
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profiles',
      transformation: [{ width: 500, height: 500, crop: 'fill', quality: 'auto' }],
    });

    fs.unlink(req.file.path, () => {});

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: result.secure_url },
      { new: true }
    ).select('-password');

    logAction(req, 'upload_photo', 'user', `Foto profilo aggiornata`);

    res.json({
      success: true,
      message: 'Foto profilo aggiornata',
      data: { user }
    });
  } catch (error) {
    console.error('Errore upload foto:', error);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({
      success: false,
      message: 'Errore durante il caricamento della foto',
      error: error.message
    });
  }
};

// @desc    Attiva/disattiva notifiche vicine
// @route   PUT /api/auth/nearby-alerts
exports.toggleNearbyAlerts = async (req, res) => {
  try {
    const { enabled } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { nearbyAlerts: enabled }, { new: true });
    res.json({ success: true, data: { nearbyAlerts: user.nearbyAlerts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Salva posizione corrente
// @route   PUT /api/auth/location
exports.saveLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      lastLocation: { type: 'Point', coordinates: [longitude, latitude] }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Salva locali preferiti
// @route   PUT /api/auth/favorite-venues
exports.saveFavoriteVenues = async (req, res) => {
  try {
    const { venueIds } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { favoriteVenues: venueIds }, { new: true });
    res.json({ success: true, data: { favoriteVenues: user.favoriteVenues } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
