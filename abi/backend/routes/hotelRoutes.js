const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const upload = require('../middleware/upload');

// Base route: /api/hotels

// @route   GET /api/hotels
// @desc    Get hotels with search, filter, sort and pagination
router.get('/', hotelController.getHotels);

// @route   GET /api/hotels/:id
// @desc    Get single hotel by ID
router.get('/:id', hotelController.getHotelById);

// @route   POST /api/hotels
// @desc    Create a new hotel with image upload
router.post('/', upload.single('image'), hotelController.createHotel);

// @route   PUT /api/hotels/:id
// @desc    Update hotel by ID with optional image replacement
router.put('/:id', upload.single('image'), hotelController.updateHotel);

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel by ID and clean up image file
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;

