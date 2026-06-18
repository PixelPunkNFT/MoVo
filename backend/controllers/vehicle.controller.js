const User = require('../models/User.model');

// @desc    Aggiungi veicolo
// @route   POST /api/vehicles
// @access  Private
exports.addVehicle = async (req, res) => {
  try {
    const { plateNumber, brand, model, color, year, photos } = req.body;

    // Controlla se la targa esiste già
    const existingVehicle = await User.findOne({
      'vehicles.plateNumber': plateNumber.toUpperCase()
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Questa targa è già registrata nel sistema'
      });
    }

    const user = await User.findById(req.user._id);

    // Determina se questo sarà il veicolo di default
    const isDefault = user.vehicles.length === 0;

    const newVehicle = {
      plateNumber: plateNumber.toUpperCase(),
      brand,
      model,
      color,
      year,
      photos: photos || [],
      isDefault,
      verified: false
    };

    user.vehicles.push(newVehicle);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Veicolo aggiunto con successo',
      data: {
        vehicle: user.vehicles[user.vehicles.length - 1]
      }
    });
  } catch (error) {
    console.error('Errore aggiunta veicolo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiunta del veicolo',
      error: error.message
    });
  }
};

// @desc    Get tutti i veicoli dell'utente
// @route   GET /api/vehicles
// @access  Private
exports.getMyVehicles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        vehicles: user.vehicles
      }
    });
  } catch (error) {
    console.error('Errore get veicoli:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei veicoli',
      error: error.message
    });
  }
};

// @desc    Aggiorna veicolo
// @route   PUT /api/vehicles/:vehicleId
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { brand, model, color, year, photos } = req.body;

    const user = await User.findById(req.user._id);
    const vehicle = user.vehicles.id(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veicolo non trovato'
      });
    }

    // Aggiorna campi
    if (brand) vehicle.brand = brand;
    if (model) vehicle.model = model;
    if (color) vehicle.color = color;
    if (year) vehicle.year = year;
    if (photos) vehicle.photos = photos;

    await user.save();

    res.json({
      success: true,
      message: 'Veicolo aggiornato con successo',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Errore aggiornamento veicolo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento del veicolo',
      error: error.message
    });
  }
};

// @desc    Imposta veicolo come default
// @route   PUT /api/vehicles/:vehicleId/set-default
// @access  Private
exports.setDefaultVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const user = await User.findById(req.user._id);

    const vehicle = user.vehicles.id(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veicolo non trovato'
      });
    }

    // Rimuovi default da tutti i veicoli
    user.vehicles.forEach(v => {
      v.isDefault = false;
    });

    // Imposta questo come default
    vehicle.isDefault = true;

    await user.save();

    res.json({
      success: true,
      message: 'Veicolo impostato come predefinito',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Errore set default veicolo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'impostazione del veicolo predefinito',
      error: error.message
    });
  }
};

// @desc    Rimuovi veicolo
// @route   DELETE /api/vehicles/:vehicleId
// @access  Private
exports.deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const user = await User.findById(req.user._id);

    const vehicle = user.vehicles.id(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veicolo non trovato'
      });
    }

    const wasDefault = vehicle.isDefault;
    vehicle.remove();

    // Se era default e ci sono altri veicoli, imposta il primo come default
    if (wasDefault && user.vehicles.length > 0) {
      user.vehicles[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Veicolo rimosso con successo'
    });
  } catch (error) {
    console.error('Errore rimozione veicolo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la rimozione del veicolo',
      error: error.message
    });
  }
};
