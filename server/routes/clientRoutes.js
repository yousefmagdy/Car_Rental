const express = require('express');
const router = express.Router();
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { clientValidation, handleValidationErrors } = require('../middleware/sanitize');

router.route('/').get(getClients).post(clientValidation, handleValidationErrors, createClient);

router.route('/:id').get(getClient).put(clientValidation, handleValidationErrors, updateClient).delete(deleteClient);

module.exports = router;
