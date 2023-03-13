const express = require('express');

//Controllers
const {
  getAllBooks,
  createBook,
  createAuthor,
  createCategory,
  getAllAuthors,
  getBookById,
  getAllCategories,
  getReviewsByBook,
  getAllRelatedBooks
} = require('../controllers/books.controllers');

//Middlewares
const {
  validateSession,
  protectAdmin
} = require('../middlewares/auth.middleware');
const { bookExists } = require('../middlewares/books.middleare');
const { upload } = require('../utils/multer');

const router = express.Router();

router.get('/authors', getAllAuthors);
router.get('/categories', getAllCategories);
router.post('/filtered', getAllBooks);
router.get('/related/:id', bookExists, getAllRelatedBooks);
router.get('/reviews/:id', bookExists, getReviewsByBook);
router.get('/:id', bookExists, getBookById);

router.use(validateSession, protectAdmin);
router.post('/', upload.single('coverImage'), createBook);
router.post('/categories', createCategory);
router.post('/authors', createAuthor);

module.exports = { routerBooks: router };
