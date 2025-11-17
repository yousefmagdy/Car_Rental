const Client = require('../models/Client');
const { isValidObjectId } = require('../utils/validators');

// @desc    Get all clients with pagination
// @route   GET /api/clients?page=1&limit=10
const getClients = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await Client.countDocuments();

    // Fetch paginated clients
    const clients = await Client.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: clients.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
const getClient = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid client ID');
      error.statusCode = 400;
      return next(error);
    }

    const client = await Client.findById(req.params.id);

    if (!client) {
      const error = new Error('Client not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new client
// @route   POST /api/clients
const createClient = async (req, res, next) => {
  try {
    const client = await Client.create(req.body);

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      error.statusCode = 400;
    }
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
const updateClient = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid client ID');
      error.statusCode = 400;
      return next(error);
    }

    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      const error = new Error('Client not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      error.statusCode = 400;
    }
    next(error);
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
const deleteClient = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      const error = new Error('Invalid client ID');
      error.statusCode = 400;
      return next(error);
    }

    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      const error = new Error('Client not found');
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
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};

