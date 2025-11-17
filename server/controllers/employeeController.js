const Employee = require('../models/Employee');
const { isValidObjectId } = require('../utils/validators');

// @desc    Get all employees with pagination
// @route   GET /api/employees?page=1&limit=10
const getEmployees = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await Employee.countDocuments();

    // Fetch paginated employees
    const employees = await Employee.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
const getEmployee = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid employee ID');
      error.statusCode = 400;
      return next(error);
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
const createEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.message = 'Email already exists';
      error.statusCode = 400;
    }
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid employee ID');
      error.statusCode = 400;
      return next(error);
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.message = 'Email already exists';
      error.statusCode = 400;
    }
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid employee ID');
      error.statusCode = 400;
      return next(error);
    }

    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

