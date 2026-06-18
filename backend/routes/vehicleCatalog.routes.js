const express = require('express');
const router = express.Router();
const { getAll, getBrands, getModelsByBrand, create, update, delete: deleteVehicle } = require('../controllers/vehicleCatalog.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/brands', getBrands);
router.get('/models/:brand', getModelsByBrand);
router.get('/', getAll);
router.post('/', protect, admin, create);
router.put('/:id', protect, admin, update);
router.delete('/:id', protect, admin, deleteVehicle);

module.exports = router;
