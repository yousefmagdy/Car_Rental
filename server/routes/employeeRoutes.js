const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { employeeValidation, handleValidationErrors } = require('../middleware/sanitize');

router.route('/').get(getEmployees).post(employeeValidation, handleValidationErrors, createEmployee);

router.route('/:id').get(getEmployee).put(employeeValidation, handleValidationErrors, updateEmployee).delete(deleteEmployee);

module.exports = router;

