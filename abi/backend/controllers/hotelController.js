const fs = require('fs');
const path = require('path');
const db = require('../config/db');

/**
 * Helper to remove local uploaded file
 */
function removeUploadedImage(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return;
  // Only remove if it belongs to local /uploads/ directory
  if (imagePath.startsWith('/uploads/')) {
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.warn('[Cleanup] Failed to unlink file:', fullPath, err.message);
      }
    }
  }
}

/**
 * @route   GET /api/hotels
 * @desc    Fetch hotels with search, filter, sort and pagination
 * @access  Public
 */
async function getHotels(req, res, next) {
  try {
    const {
      search = '',
      minPrice,
      maxPrice,
      category,
      rating,
      location,
      amenities,
      sortBy = 'best_match',
      page = 1,
      limit = 5
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 5);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Search by title or description
    if (search && search.trim() !== '') {
      whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Min price
    if (minPrice !== undefined && minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        whereConditions.push(`price >= $${paramIndex}`);
        queryParams.push(min);
        paramIndex++;
      }
    }

    // Max price
    if (maxPrice !== undefined && maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        whereConditions.push(`price <= $${paramIndex}`);
        queryParams.push(max);
        paramIndex++;
      }
    }

    // Category filter
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      whereConditions.push(`category ILIKE $${paramIndex}`);
      queryParams.push(`%${category.trim()}%`);
      paramIndex++;
    }

    // Rating filter (minimum rating)
    if (rating !== undefined && rating !== '' && rating !== 'all') {
      const r = parseFloat(rating);
      if (!isNaN(r)) {
        whereConditions.push(`rating >= $${paramIndex}`);
        queryParams.push(r);
        paramIndex++;
      }
    }

    // Location filter
    if (location && location.trim() !== '') {
      whereConditions.push(`location ILIKE $${paramIndex}`);
      queryParams.push(`%${location.trim()}%`);
      paramIndex++;
    }

    // Amenities filter
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      for (const amenity of amenitiesList) {
        if (amenity && amenity.trim() !== '') {
          whereConditions.push(`amenities ILIKE $${paramIndex}`);
          queryParams.push(`%${amenity.trim()}%`);
          paramIndex++;
        }
      }
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Determine Sort Clause
    let orderClause = 'ORDER BY id DESC';
    switch (sortBy) {
      case 'price_asc':
        orderClause = 'ORDER BY price ASC';
        break;
      case 'price_desc':
        orderClause = 'ORDER BY price DESC';
        break;
      case 'rating_desc':
        orderClause = 'ORDER BY rating DESC, price ASC';
        break;
      case 'best_match':
      default:
        orderClause = 'ORDER BY rating DESC, id DESC';
        break;
    }

    // Count Query for total matching records
    const countSql = `SELECT COUNT(*) AS total FROM hotels ${whereClause}`;
    const countResult = await db.query(countSql, queryParams);
    const totalCount = parseInt(countResult.rows[0].total, 10) || 0;

    // Data Query with Pagination
    const dataParams = [...queryParams, limitNum, offset];
    const dataSql = `
      SELECT * FROM hotels 
      ${whereClause} 
      ${orderClause} 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await db.query(dataSql, dataParams);

    res.json({
      success: true,
      count: dataResult.rows.length,
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: dataResult.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/hotels/:id
 * @desc    Fetch single hotel by ID
 * @access  Public
 */
async function getHotelById(req, res, next) {
  try {
    const { id } = req.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotel ID format.' });
    }

    const result = await db.query('SELECT * FROM hotels WHERE id = $1', [hotelId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/hotels
 * @desc    Create a new hotel
 * @access  Public
 */
async function createHotel(req, res, next) {
  try {
    const {
      title,
      description,
      latitude,
      longitude,
      price,
      rating,
      category,
      location,
      amenities
    } = req.body;

    // Validation
    const errors = {};
    if (!title || !title.trim()) {
      errors.title = 'Hotel title is required.';
    }

    if (!description || !description.trim()) {
      errors.description = 'Hotel description is required.';
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = 'Price must be a valid number greater than 0.';
    }

    const parsedLat = parseFloat(latitude);
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      errors.latitude = 'Latitude must be a valid number between -90 and 90.';
    }

    const parsedLng = parseFloat(longitude);
    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      errors.longitude = 'Longitude must be a valid number between -180 and 180.';
    }

    // Image path determination
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/hotels/${req.file.filename}`;
    } else if (req.body.image && req.body.image.trim()) {
      imagePath = req.body.image.trim();
    } else {
      errors.image = 'Hotel image is required.';
    }

    if (Object.keys(errors).length > 0) {
      // If validation fails and file was uploaded, remove uploaded file
      if (req.file) {
        removeUploadedImage(imagePath);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors
      });
    }

    const parsedRating = rating ? parseFloat(rating) : 4.5;
    const finalCategory = category && category.trim() ? category.trim() : 'Luxury Hotels';
    const finalLocation = location && location.trim() ? location.trim() : 'City Center';
    const finalAmenities = amenities && amenities.trim()
      ? amenities.trim()
      : 'Free Wi-Fi, Swimming Pool, Parking, Restaurant, Air Conditioning';

    const insertSql = `
      INSERT INTO hotels (
        title, description, image, latitude, longitude, price, 
        rating, category, location, amenities, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(insertSql, [
      title.trim(),
      description.trim(),
      imagePath,
      parsedLat,
      parsedLng,
      parsedPrice,
      parsedRating,
      finalCategory,
      finalLocation,
      finalAmenities
    ]);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully!',
      data: result.rows[0]
    });
  } catch (err) {
    if (req.file) {
      removeUploadedImage(`/uploads/hotels/${req.file.filename}`);
    }
    next(err);
  }
}

/**
 * @route   PUT /api/hotels/:id
 * @desc    Update existing hotel
 * @access  Public
 */
async function updateHotel(req, res, next) {
  try {
    const { id } = req.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotel ID format.' });
    }

    // Check if hotel exists
    const existing = await db.query('SELECT * FROM hotels WHERE id = $1', [hotelId]);
    if (existing.rows.length === 0) {
      if (req.file) {
        removeUploadedImage(`/uploads/hotels/${req.file.filename}`);
      }
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    const currentHotel = existing.rows[0];

    const {
      title,
      description,
      latitude,
      longitude,
      price,
      rating,
      category,
      location,
      amenities
    } = req.body;

    const errors = {};
    if (!title || !title.trim()) {
      errors.title = 'Hotel title is required.';
    }

    if (!description || !description.trim()) {
      errors.description = 'Hotel description is required.';
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = 'Price must be a valid number greater than 0.';
    }

    const parsedLat = parseFloat(latitude);
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      errors.latitude = 'Latitude must be a valid number between -90 and 90.';
    }

    const parsedLng = parseFloat(longitude);
    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      errors.longitude = 'Longitude must be a valid number between -180 and 180.';
    }

    if (Object.keys(errors).length > 0) {
      if (req.file) {
        removeUploadedImage(`/uploads/hotels/${req.file.filename}`);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors
      });
    }

    // Determine image: if new file uploaded, update and optionally remove old file
    let newImagePath = currentHotel.image;
    if (req.file) {
      newImagePath = `/uploads/hotels/${req.file.filename}`;
      // Remove previous local file if it was local
      if (currentHotel.image && currentHotel.image.startsWith('/uploads/')) {
        removeUploadedImage(currentHotel.image);
      }
    } else if (req.body.image && req.body.image.trim()) {
      newImagePath = req.body.image.trim();
    }

    const parsedRating = rating !== undefined ? parseFloat(rating) : currentHotel.rating;
    const finalCategory = category && category.trim() ? category.trim() : currentHotel.category;
    const finalLocation = location && location.trim() ? location.trim() : currentHotel.location;
    const finalAmenities = amenities && amenities.trim() ? amenities.trim() : currentHotel.amenities;

    const updateSql = `
      UPDATE hotels 
      SET 
        title = $1, 
        description = $2, 
        image = $3, 
        latitude = $4, 
        longitude = $5, 
        price = $6, 
        rating = $7, 
        category = $8, 
        location = $9, 
        amenities = $10, 
        updated_at = NOW() 
      WHERE id = $11 
      RETURNING *
    `;

    const result = await db.query(updateSql, [
      title.trim(),
      description.trim(),
      newImagePath,
      parsedLat,
      parsedLng,
      parsedPrice,
      parsedRating,
      finalCategory,
      finalLocation,
      finalAmenities,
      hotelId
    ]);

    res.json({
      success: true,
      message: 'Hotel updated successfully!',
      data: result.rows[0]
    });
  } catch (err) {
    if (req.file) {
      removeUploadedImage(`/uploads/hotels/${req.file.filename}`);
    }
    next(err);
  }
}

/**
 * @route   DELETE /api/hotels/:id
 * @desc    Delete hotel by ID and remove uploaded image
 * @access  Public
 */
async function deleteHotel(req, res, next) {
  try {
    const { id } = req.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotel ID format.' });
    }

    const existing = await db.query('SELECT * FROM hotels WHERE id = $1', [hotelId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    const hotel = existing.rows[0];

    // Remove local image file if applicable
    if (hotel.image && hotel.image.startsWith('/uploads/')) {
      removeUploadedImage(hotel.image);
    }

    await db.query('DELETE FROM hotels WHERE id = $1', [hotelId]);

    res.json({
      success: true,
      message: 'Hotel deleted successfully!'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};

