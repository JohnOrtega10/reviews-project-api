const multer = require('multer');
const { AppError } = require('./appError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    cb(new AppError(400, 'Must provida an image as a file'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = { upload };
