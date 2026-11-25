const multer = require('multer');

function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  // Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds the 5MB limit. Please upload a smaller file.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // Custom validation or file filter error
  if (err.message && err.message.includes('Invalid image file format')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}

module.exports = errorHandler;

