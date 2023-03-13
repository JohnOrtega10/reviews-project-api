//Models
const { Review } = require('../models/review.model');

//Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

exports.reviewExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findOne({ where: { id, status: 'active' } });

  if (!review) {
    return next(new AppError(404, 'Review not found with given id'));
  }

  req.review = review;
  next();
});

exports.protectReviewOwner = catchAsync(async (req, res, next) => {
  const { id } = req.currentUser;
  const { userId } = req.review;

  if (id !== userId) {
    return next(new AppError(400, 'You cant update other users review'));
  }
  next();
});
