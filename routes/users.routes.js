const express = require('express');

//Controllers
const {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserReviews
} = require('../controllers/users.controller');

//Middlewares
const { validateSession } = require('../middlewares/auth.middleware');
const { upload } = require('../utils/multer');
const router = express.Router();

router.post('/', upload.single('profilePicture'), createUser);
router.post('/login', loginUser);

router.use(validateSession);
router.get('/profile', getUserProfile);
router.patch('/profile', upload.single('profilePicture'), updateUserProfile);
router.get('/profile/reviews', getUserReviews);

module.exports = { routerUsers: router };
