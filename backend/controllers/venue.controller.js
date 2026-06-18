const Venue = require('../models/Venue.model');

// @desc    Get all venues
// @route   GET /api/venues
exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: { venues } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get venue by ID
// @route   GET /api/venues/:id
exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Locale non trovato' });
    res.json({ success: true, data: { venue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create venue (admin)
// @route   POST /api/venues
exports.createVenue = async (req, res) => {
  try {
    const { name, address, city, type, music, location, description, website, phone, image } = req.body;

    const exists = await Venue.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) return res.status(400).json({ success: false, message: 'Questo locale esiste già' });

    const venue = await Venue.create({
      name, address, city, type, music, location, description, website, phone, image,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Locale creato con successo', data: { venue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update venue (admin)
// @route   PUT /api/venues/:id
exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!venue) return res.status(404).json({ success: false, message: 'Locale non trovato' });
    res.json({ success: true, message: 'Locale aggiornato con successo', data: { venue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete venue (admin - soft delete)
// @route   DELETE /api/venues/:id
exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!venue) return res.status(404).json({ success: false, message: 'Locale non trovato' });
    res.json({ success: true, message: 'Locale disattivato con successo' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search venues
// @route   GET /api/venues/search
exports.searchVenues = async (req, res) => {
  try {
    const q = req.query.q || '';
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const venues = await Venue.find({
      isActive: true,
      name: new RegExp(escaped, 'i')
    }).sort({ name: 1 }).limit(8);
    res.json({ success: true, data: { venues } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
