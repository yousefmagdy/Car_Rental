const Rental = require('../models/Rental');
const Car = require('../models/Car');
const { isValidObjectId } = require('../utils/validators');

// @desc    Get all rentals with pagination
// @route   GET /api/rentals?page=1&limit=10
const getRentals = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await Rental.countDocuments();

    // Fetch paginated rentals
    const rentals = await Rental.find()
      .populate('car', 'brand model licensePlate')
      .populate('client', 'firstName lastName email')
      .populate('employee', 'firstName lastName position')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: rentals.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rentals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rental
// @route   GET /api/rentals/:id
const getRental = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid rental ID');
      error.statusCode = 400;
      return next(error);
    }

    const rental = await Rental.findById(req.params.id)
      .populate('car')
      .populate('client')
      .populate('employee');

    if (!rental) {
      const error = new Error('Rental not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: rental,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new rental
// @route   POST /api/rentals
const createRental = async (req, res, next) => {
  try {
    const { car: carId, client: clientId, employee: employeeId, startDate, endDate, totalCost } = req.body;

    // Validate ObjectIds
    if (!isValidObjectId(carId)) {
      const error = new Error('Invalid car ID');
      error.statusCode = 400;
      return next(error);
    }
    if (!isValidObjectId(clientId)) {
      const error = new Error('Invalid client ID');
      error.statusCode = 400;
      return next(error);
    }
    if (!isValidObjectId(employeeId)) {
      const error = new Error('Invalid employee ID');
      error.statusCode = 400;
      return next(error);
    }

    // Validate total cost
    if (totalCost !== undefined && (isNaN(totalCost) || totalCost < 0)) {
      const error = new Error('Total cost must be a positive number');
      error.statusCode = 400;
      return next(error);
    }

    // Validate dates - SERVER-SIDE VALIDATION (cannot be bypassed by client)
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Use server time, not client time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const error = new Error('Invalid date format');
      error.statusCode = 400;
      return next(error);
    }

    // Normalize start date to midnight for comparison
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    // Check if start date is in the past (server-side check)
    if (startDateOnly < today) {
      const error = new Error('Start date cannot be in the past');
      error.statusCode = 400;
      return next(error);
    }

    // Check if end date is after start date
    if (end <= start) {
      const error = new Error('End date must be after start date');
      error.statusCode = 400;
      return next(error);
    }

    // Check if car exists
    const car = await Car.findById(carId);
    
    if (!car) {
      const error = new Error('Car not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if car is in maintenance
    if (car.status === 'maintenance') {
      const error = new Error('Car is currently in maintenance');
      error.statusCode = 400;
      return next(error);
    }

    // Check for overlapping active rentals
    const overlappingRentals = await Rental.find({
      car: carId,
      status: 'active',
      $or: [
        // New rental starts during existing rental
        { startDate: { $lte: start }, endDate: { $gte: start } },
        // New rental ends during existing rental
        { startDate: { $lte: end }, endDate: { $gte: end } },
        // New rental completely encompasses existing rental
        { startDate: { $gte: start }, endDate: { $lte: end } },
      ],
    });

    if (overlappingRentals.length > 0) {
      const error = new Error('Car is already booked for the selected dates');
      error.statusCode = 400;
      return next(error);
    }

    // Create the rental
    const rental = await Rental.create(req.body);

    const populatedRental = await Rental.findById(rental._id)
      .populate('car', 'brand model licensePlate')
      .populate('client', 'firstName lastName email')
      .populate('employee', 'firstName lastName position');

    res.status(201).json({
      success: true,
      data: populatedRental,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rental
// @route   PUT /api/rentals/:id
const updateRental = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid rental ID');
      error.statusCode = 400;
      return next(error);
    }

    const oldRental = await Rental.findById(req.params.id);

    if (!oldRental) {
      const error = new Error('Rental not found');
      error.statusCode = 404;
      return next(error);
    }

    // Validate dates if they're being updated
    const { car: carId, client: clientId, employee: employeeId, startDate, endDate, totalCost } = req.body;

    if (startDate || endDate) {
      const start = new Date(startDate || oldRental.startDate);
      const end = new Date(endDate || oldRental.endDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        const error = new Error('Invalid date format');
        error.statusCode = 400;
        return next(error);
      }

      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());

      // Check if start date is in the past (only for active rentals)
      if (oldRental.status === 'active' && startDateOnly < today) {
        const error = new Error('Start date cannot be in the past for active rentals');
        error.statusCode = 400;
        return next(error);
      }

      // Check if end date is after start date
      if (end <= start) {
        const error = new Error('End date must be after start date');
        error.statusCode = 400;
        return next(error);
      }

      // Check for overlapping rentals (exclude current rental from check)
      const targetCarId = carId || oldRental.car;
      
      const overlappingRentals = await Rental.find({
        _id: { $ne: req.params.id }, // Exclude current rental
        car: targetCarId,
        status: 'active',
        $or: [
          { startDate: { $lte: start }, endDate: { $gte: start } },
          { startDate: { $lte: end }, endDate: { $gte: end } },
          { startDate: { $gte: start }, endDate: { $lte: end } },
        ],
      });

      if (overlappingRentals.length > 0) {
        const error = new Error('Car is already booked for the selected dates');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Validate total cost if provided
    if (totalCost !== undefined && (isNaN(totalCost) || totalCost < 0)) {
      const error = new Error('Total cost must be a positive number');
      error.statusCode = 400;
      return next(error);
    }

    // Validate ObjectIds if provided
    if (carId && !isValidObjectId(carId)) {
      const error = new Error('Invalid car ID');
      error.statusCode = 400;
      return next(error);
    }
    if (clientId && !isValidObjectId(clientId)) {
      const error = new Error('Invalid client ID');
      error.statusCode = 400;
      return next(error);
    }
    if (employeeId && !isValidObjectId(employeeId)) {
      const error = new Error('Invalid employee ID');
      error.statusCode = 400;
      return next(error);
    }

    // Check car status if car is being changed
    if (carId && carId !== oldRental.car.toString()) {
      const car = await Car.findById(carId);
      
      if (!car) {
        const error = new Error('Car not found');
        error.statusCode = 404;
        return next(error);
      }

      if (car.status === 'maintenance') {
        const error = new Error('Car is currently in maintenance');
        error.statusCode = 400;
        return next(error);
      }
    }

    const rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('car', 'brand model licensePlate')
      .populate('client', 'firstName lastName email')
      .populate('employee', 'firstName lastName position');

    res.status(200).json({
      success: true,
      data: rental,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete rental
// @route   DELETE /api/rentals/:id
const deleteRental = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid rental ID');
      error.statusCode = 400;
      return next(error);
    }

    const rental = await Rental.findByIdAndDelete(req.params.id);

    if (!rental) {
      const error = new Error('Rental not found');
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
  getRentals,
  getRental,
  createRental,
  updateRental,
  deleteRental,
};

