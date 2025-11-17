const { body, validationResult } = require('express-validator');

// Sanitization utility functions
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  
  // Remove potentially dangerous characters and scripts
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URIs
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
};

// Additional escape function for HTML entities
const escapeHtml = (value) => {
  if (typeof value !== 'string') return value;
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validation rules for different entities
const carValidation = [
  body('brand').trim().notEmpty().withMessage('Brand is required')
    .isLength({ min: 2, max: 50 }).withMessage('Brand must be 2-50 characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('model').trim().notEmpty().withMessage('Model is required')
    .isLength({ min: 1, max: 50 }).withMessage('Model must be 1-50 characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  
  body('color').trim().notEmpty().withMessage('Color is required')
    .isLength({ min: 2, max: 30 }).withMessage('Color must be 2-30 characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('licensePlate').trim().notEmpty().withMessage('License plate is required')
    .isLength({ min: 2, max: 15 }).withMessage('License plate must be 2-15 characters')
    .escape()
    .toUpperCase()
    .customSanitizer(sanitizeString),
  
  body('dailyRate').isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
  
  body('status').optional().isIn(['available', 'maintenance']).withMessage('Invalid status'),
];

const clientValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .escape(),

  body('phone').trim().notEmpty().withMessage('Phone is required')
    .isLength({ min: 10, max: 20 }).withMessage('Phone must be 10-20 characters')
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone must contain only numbers, spaces, and +-() characters')
    .escape()
    .customSanitizer(sanitizeString),

  body('driverLicense').trim().notEmpty().withMessage('Driver license is required')
    .isLength({ min: 5, max: 20 }).withMessage('Driver license must be 5-20 characters')
    .escape()
    .toUpperCase()
    .customSanitizer(sanitizeString),
  
  body('address').trim().notEmpty().withMessage('Address is required')
    .isLength({ min: 2, max: 200 }).withMessage('Address must be 5-200 characters')
    .escape()
    .customSanitizer(sanitizeString),
];

const employeeValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .escape(),
  
  body('phone').trim().notEmpty().withMessage('Phone is required')
    .isLength({ min: 10, max: 20 }).withMessage('Phone must be 10-20 characters')
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone must contain only numbers, spaces, and +-() characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('position').trim().notEmpty().withMessage('Position is required')
    .isLength({ min: 2, max: 50 }).withMessage('Position must be 2-50 characters')
    .escape()
    .customSanitizer(sanitizeString),
  
  body('hireDate').isISO8601().withMessage('Invalid hire date format')
    .toDate(),
];

const rentalValidation = [
  body('car').notEmpty().withMessage('Car is required')
    .isMongoId().withMessage('Invalid car ID'),
  body('client').notEmpty().withMessage('Client is required')
    .isMongoId().withMessage('Invalid client ID'),
  body('employee').notEmpty().withMessage('Employee is required')
    .isMongoId().withMessage('Invalid employee ID'),
  body('startDate').notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format')
    .toDate(),
  body('endDate').notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .toDate(),
  body('totalCost').notEmpty().withMessage('Total cost is required')
    .isFloat({ min: 0 }).withMessage('Total cost must be a positive number'),
  body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages,
    });
  }
  
  next();
};

module.exports = {
  carValidation,
  clientValidation,
  employeeValidation,
  rentalValidation,
  handleValidationErrors,
  sanitizeString,
  escapeHtml,
};

