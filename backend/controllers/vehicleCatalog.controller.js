const VehicleCatalog = require('../models/VehicleCatalog.model');

// @desc    Get all catalog vehicles
// @route   GET /api/vehicle-catalog
exports.getAll = async (req, res) => {
  try {
    const { brand } = req.query;
    const query = { isActive: true };
    if (brand) query.brand = new RegExp(`^${brand}$`, 'i');
    const vehicles = await VehicleCatalog.find(query).sort({ brand: 1, model: 1 });
    res.json({ success: true, data: { vehicles } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get distinct brands
// @route   GET /api/vehicle-catalog/brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await VehicleCatalog.distinct('brand', { isActive: true });
    res.json({ success: true, data: { brands: brands.sort() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get models by brand
// @route   GET /api/vehicle-catalog/models/:brand
exports.getModelsByBrand = async (req, res) => {
  try {
    const vehicles = await VehicleCatalog.find({
      brand: new RegExp(`^${req.params.brand}$`, 'i'),
      isActive: true
    }).sort({ model: 1 });
    res.json({ success: true, data: { vehicles } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create catalog vehicle (admin)
// @route   POST /api/vehicle-catalog
exports.create = async (req, res) => {
  try {
    const { brand, model, yearStart, yearEnd } = req.body;
    const exists = await VehicleCatalog.findOne({
      brand: new RegExp(`^${brand}$`, 'i'),
      model: new RegExp(`^${model}$`, 'i')
    });
    if (exists) return res.status(400).json({ success: false, message: 'Questo modello esiste già nel catalogo' });
    const vehicle = await VehicleCatalog.create({ brand: brand.toUpperCase(), model, yearStart, yearEnd });
    res.status(201).json({ success: true, message: 'Veicolo aggiunto al catalogo', data: { vehicle } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update catalog vehicle (admin)
// @route   PUT /api/vehicle-catalog/:id
exports.update = async (req, res) => {
  try {
    const vehicle = await VehicleCatalog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Veicolo non trovato nel catalogo' });
    res.json({ success: true, message: 'Veicolo aggiornato nel catalogo', data: { vehicle } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete catalog vehicle (admin - soft delete)
// @route   DELETE /api/vehicle-catalog/:id
exports.delete = async (req, res) => {
  try {
    const vehicle = await VehicleCatalog.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Veicolo non trovato' });
    res.json({ success: true, message: 'Veicolo rimosso dal catalogo' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
