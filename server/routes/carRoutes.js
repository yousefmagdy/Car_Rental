const express = require('express');
const router = express.Router();
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
} = require('../controllers/carController');
const { carValidation, handleValidationErrors } = require('../middleware/sanitize');

router.route('/').get(getCars).post(carValidation, handleValidationErrors, createCar);

router.route('/:id').get(getCar).put(carValidation, handleValidationErrors, updateCar).delete(deleteCar);

module.exports = router;

