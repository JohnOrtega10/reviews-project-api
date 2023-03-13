const { Sequelize } = require('sequelize');

//Models
const { Book } = require('../models/book.model');
const { Review } = require('../models/review.model');

//Utis
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

exports.createReview = catchAsync(async (req, res, next) => {
  const { id: userId } = req.currentUser;
  const { bookId, rating, text } = req.body;

  const book = await Book.findOne({
    where: { id: bookId },
    include: { model: Review }
  });

  if (!book) {
    return next(new AppError(404, 'Book not found with given id.'));
  }

  const existingReview = await Review.findOne({
    where: { bookId, userId }
  });

  let newReview;
  if (!existingReview) {
    newReview = await Review.create({
      userId,
      bookId,
      rating,
      text
    });
  } else {
    if (existingReview.status === 'active') {
      return next(
        new AppError(401, 'There is already an active review for this user')
      );
    } else {
      newReview = await existingReview.update({
        rating,
        text,
        status: 'active'
      });
    }
  }

  const result = await Review.findOne({
    where: {
      bookId,
      status: 'active'
    },
    attributes: [
      [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating']
    ]
  });

  await book.update({ rating: parseFloat(result.dataValues.averageRating) });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { id: userId } = req.currentUser;

  const reviews = await Review.findAll({
    where: { userId },
    include: { model: Book }
  });

  res.status(200).json({
    status: 'success',
    data: {
      reviews
    }
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { review } = req;
  const { newRating, newText } = req.body;

  await review.update({ rating: newRating, text: newText });

  const avgRating = await Review.findOne({
    where: {
      bookId: review.bookId,
      status: 'active'
    },
    attributes: [
      [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating']
    ]
  });

  const book = await Book.findOne({ where: { id: review.bookId } });
  await book.update({ rating: parseFloat(avgRating.dataValues.averageRating) });

  res.status(204).json({ status: 'success' });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { review } = req;

  await review.update({ status: 'deleted' });

  const avgRating = await Review.findOne({
    where: {
      bookId: review.bookId,
      status: 'active'
    },
    attributes: [
      [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating']
    ]
  });

  const book = await Book.findOne({ where: { id: review.bookId } });
  await book.update({ rating: parseFloat(avgRating.dataValues.averageRating) });

  res.status(204).json({ status: 'success' });
});
