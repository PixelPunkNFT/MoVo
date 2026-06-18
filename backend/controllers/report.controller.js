const Report = require('../models/Report.model');

// @desc    Crea segnalazione
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Tutti i campi sono obbligatori (targetType, targetId, reason)'
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason
    });

    res.status(201).json({
      success: true,
      message: 'Segnalazione inviata. Il nostro team la verificherà.',
      data: { report }
    });
  } catch (error) {
    console.error('Errore creazione report:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'invio della segnalazione',
      error: error.message
    });
  }
};
