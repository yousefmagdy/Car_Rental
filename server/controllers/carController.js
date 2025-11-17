const Car = require('../models/Car');
const { isValidObjectId } = require('../utils/validators');

// @desc    Get all cars with pagination
// @route   GET /api/cars?page=1&limit=10
const getCars = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await Car.countDocuments();

    // Fetch paginated cars
    const cars = await Car.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: cars.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: cars,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
const getCar = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid car ID');
      error.statusCode = 400;
      return next(error);
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      const error = new Error('Car not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new car
// @route   POST /api/cars
const createCar = async (req, res, next) => {
  try {
    const car = await Car.create(req.body);

    res.status(201).json({
      success: true,
      data: car,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.message = 'License plate already exists';
      error.statusCode = 400;
    }
    next(error);
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
const updateCar = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid car ID');
      error.statusCode = 400;
      return next(error);
    }

    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      const error = new Error('Car not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.message = 'License plate already exists';
      error.statusCode = 400;
    }
    next(error);
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
const deleteCar = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid car ID');
      error.statusCode = 400;
      return next(error);
    }

    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      const error = new Error('Car not found');
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
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
};

