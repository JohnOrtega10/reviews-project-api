const express = require('express');

//Controllers
const {
  createReview,
  deleteReview,
  updateReview,
  getAllReviews
} = require('../controllers/reviews.controller');

//Middlewares
const { validateSession } = require('../middlewares/auth.middleware');
const {
  protectReviewOwner,
  reviewExists
} = require('../middlewares/reviews.middleware');
const router = express.Router();

router.use(validateSession);
router.post('/', createReview);
router.get('/', getAllReviews);

router.put('/:id', reviewExists, protectReviewOwner, updateReview);
router.delete('/:id', reviewExists, protectReviewOwner, deleteReview);

module.exports = { routerReviews: router };
