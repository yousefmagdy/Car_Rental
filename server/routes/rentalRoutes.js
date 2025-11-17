const express = require('express');
const router = express.Router();
const {
  getRentals,
  getRental,
  createRental,
  updateRental,
  deleteRental,
} = require('../controllers/rentalController');
const { rentalValidation, handleValidationErrors } = require('../middleware/sanitize');

router.route('/').get(getRentals).post(rentalValidation, handleValidationErrors, createRental);

router.route('/:id').get(getRental).put(rentalValidation, handleValidationErrors, updateRental).delete(deleteRental);

module.exports = router;

