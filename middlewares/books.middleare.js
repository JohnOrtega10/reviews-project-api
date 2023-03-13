//Models
const { Author } = require('../models/author.model');
const { Book } = require('../models/book.model');
const { Category } = require('../models/category.model');
const { Review } = require('../models/review.model');
const { User } = require('../models/user.model');

//Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

exports.bookExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const book = await Book.findOne({
    where: {
      id,
      status: 'active'
    },
    include: [
      {
        model: Review,
        required: false,
        where: { status: 'active' },
        include: {
          model: User,
          attributes: { exclude: ['password'] }
        }
      },
      { model: Author },
      { model: Category }
    ]
  });

  if (!book) {
    return next(new AppError(404, 'Book not found with given id.'));
  }

  req.book = book;
  next();
});
