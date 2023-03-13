const { User } = require('../models/user.model');
const { Review } = require('../models/review.model');
const { Book } = require('../models/book.model');
const { Category } = require('../models/category.model');
const { Author } = require('../models/author.model');

const initModels = () => {
  User.hasMany(Review);
  Review.belongsTo(User);

  Book.hasMany(Review);
  Review.belongsTo(Book);

  Category.hasMany(Book);
  Book.belongsTo(Category);

  Author.hasMany(Book);
  Book.belongsTo(Author);
};

module.exports = { initModels };
