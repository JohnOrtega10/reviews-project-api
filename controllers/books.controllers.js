const { Op } = require('sequelize');

//Models
const { Author } = require('../models/author.model');
const { Book } = require('../models/book.model');
const { Category } = require('../models/category.model');
const { Review } = require('../models/review.model');
const { User } = require('../models/user.model');

//Utils
const { catchAsync } = require('../utils/catchAsync');
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.createBook = catchAsync(async (req, res, next) => {
  const { authorId, categoryId, title, summary, publicationDate } = req.body;

  const { secure_url: coverImage } = await uploadToCloudinary(
    req.file,
    `${title}`.toLowerCase(),
    'users/profiles'
  );

  const books = await Book.create({
    authorId,
    categoryId,
    title,
    summary,
    publicationDate,
    coverImage
  });

  res.status(201).json({
    status: 'success',
    data: {
      books
    }
  });
});

exports.getBookById = catchAsync(async (req, res, next) => {
  const { book } = req;

  res.status(200).json({
    status: 'success',
    data: {
      book
    }
  });
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
  const { query: title, author, category, order } = req.body;

  const filterAuthor = {};
  if (author.length) {
    filterAuthor.id = author;
  }

  const filterCategory = {};
  if (category.length) {
    filterCategory.id = category;
  }

  let filterOrder = [];
  if (order === 'ASC') {
    filterOrder = ['rating', 'ASC'];
  } else if (order === 'DESC') {
    filterOrder = ['rating', 'DESC'];
  } else {
    filterOrder = ['publicationDate', 'DESC'];
  }

  let books;
  books = await Book.findAll({
    order: [filterOrder],
    where: {
      status: 'active',
      title: { [Op.iLike]: `%${title}%` }
    },
    include: [
      { model: Author, where: filterAuthor },
      { model: Category, where: filterCategory }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: {
      books
    }
  });
});

exports.getReviewsByBook = catchAsync(async (req, res, next) => {
  const { book } = req;
  const { order } = req.query;

  let filterOrder = [];
  if (order === 'ASC') {
    filterOrder = ['rating', 'ASC'];
  } else if (order === 'DESC') {
    filterOrder = ['rating', 'DESC'];
  } else {
    filterOrder = ['updatedAt', 'DESC'];
  }

  const reviews = await Review.findAll({
    order: [filterOrder],
    where: { bookId: book.id, status: 'active' },
    include: { model: User }
  });

  res.status(201).json({
    status: 'success',
    data: { reviews }
  });
});

exports.getAllRelatedBooks = catchAsync(async (req, res, next) => {
  const { book } = req;

  const books = await Book.findAll({
    where: {
      status: 'active',
      [Op.not]: [{ id: book.id }],
      [Op.or]: [{ categoryId: book.categoryId }, { authorId: book.authorId }]
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      books
    }
  });
});

//CATEGORIES
exports.createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name
  });

  res.status(201).json({
    status: 'success',
    data: { newCategory }
  });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({ where: { status: 'active' } });

  res.status(200).json({
    status: 'success',
    data: { categories }
  });
});

//AUTHORS
exports.createAuthor = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newAuthor = await Author.create({
    name
  });

  res.status(201).json({
    status: 'success',
    data: { newAuthor }
  });
});

exports.getAllAuthors = catchAsync(async (req, res, next) => {
  const authors = await Author.findAll({ where: { status: 'active' } });

  res.status(200).json({
    status: 'success',
    data: { authors }
  });
});
