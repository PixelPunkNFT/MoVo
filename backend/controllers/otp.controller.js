const Otp = require('../models/Otp.model');
const User = require('../models/User.model');
const { sendOtpEmail } = require('../utils/mail');
const { logAction } = require('../utils/logger');

// @desc    Invia codice OTP via email
// @route   POST /api/otp/send
// @access  Private
exports.sendOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: 'Nessuna email associata al tuo account'
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { user: user._id, type: 'verification' },
      {
        user: user._id,
        email: user.email,
        code,
        type: 'verification',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false
      },
      { upsert: true, new: true }
    );

    try {
      await sendOtpEmail(user.email, code);
    } catch (emailErr) {
      console.error('Errore invio email OTP:', emailErr);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 OTP for', user.email, ':', code);
    }

    logAction(req, 'send_otp', 'otp', 'OTP inviato', { email: req.body.email });

    res.json({
      success: true,
      message: 'Codice di verifica inviato alla tua email'
    });
  } catch (error) {
    console.error('Errore invio OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'invio del codice',
      error: error.message
    });
  }
};

// @desc    Verifica codice OTP
// @route   POST /api/otp/verify
// @access  Private
exports.verifyOtp = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Il codice è obbligatorio'
      });
    }

    const otp = await Otp.findOne({
      user: req.user._id,
      type: 'verification',
      expiresAt: { $gt: new Date() },
      verified: false
    });

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Nessun codice valido trovato. Richiedi un nuovo codice.'
      });
    }

    if (otp.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Codice errato. Riprova.'
      });
    }

    otp.verified = true;
    await otp.save();

    await User.findByIdAndUpdate(req.user._id, { isPhoneVerified: true });

    logAction(req, 'verify_otp', 'otp', 'OTP verificato con successo');

    res.json({
      success: true,
      message: 'Account verificato con successo'
    });
  } catch (error) {
    console.error('Errore verifica OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la verifica del codice',
      error: error.message
    });
  }
};
