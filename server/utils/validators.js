const mongoose = require('mongoose');

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Middleware to validate MongoDB ObjectId from request params
 * @param {string} paramName - The name of the parameter to validate (default: 'id')
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    if (!isValidObjectId(req.params[paramName])) {
      const error = new Error(`Invalid ${paramName}`);
      error.statusCode = 400;
      return next(error);
    }
    next();
  };
};

module.exports = {
  isValidObjectId,
  validateObjectId,
};

