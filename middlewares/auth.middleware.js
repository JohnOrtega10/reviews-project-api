const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//Models
const { User } = require('../models/user.model');

//Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

dotenv.config({ path: './.env' });

const validateSession = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(401, 'Invalid session.'));
  }

  const { id } = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({
    where: { id, status: 'active' }
  });

  if (!user) {
    return next(new AppError(401, 'Invalid session.'));
  }

  req.currentUser = user;

  next();
});

const protectAdmin = catchAsync(async (req, res, next) => {
  if (req.currentUser.role !== 'admin') {
    return next(new AppError(403, 'Unauthorized access.'));
  }

  next();
});

module.exports = {
  validateSession,
  protectAdmin
};
