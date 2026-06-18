const express = require('express');
const router = express.Router();
const {
  addVehicle,
  getMyVehicles,
  updateVehicle,
  setDefaultVehicle,
  deleteVehicle
} = require('../controllers/vehicle.controller');
const { protect } = require('../middleware/auth.middleware');
const { vehicleValidation, validate, validateObjectId } = require('../middleware/validation.middleware');

// Tutte le routes richiedono autenticazione
router.use(protect);

router.route('/')
  .get(getMyVehicles)
  .post(vehicleValidation, validate, addVehicle);

router.route('/:vehicleId')
  .put(updateVehicle)
  .delete(deleteVehicle);

router.put('/:vehicleId/set-default', setDefaultVehicle);

module.exports = router;
