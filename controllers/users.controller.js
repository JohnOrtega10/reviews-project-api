const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//Models
const { User } = require('../models/user.model');
const { Review } = require('../models/review.model');
const { Book } = require('../models/book.model');

//Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { filterAllowedFields } = require('../utils/filterAllowedFields');

dotenv.config({ path: './.env' });

exports.createUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const user = await User.findOne({ where: { email } });

  if (user) {
    return next(new AppError(401, 'The email is already registered.'));
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  let profilePicture =
    'https://res.cloudinary.com/dgs8gu1rp/image/upload/v1678739936/reviews-project/users/profiles/default-photo_uu1wyw.png';

  if (req.file) {
    const { secure_url } = await uploadToCloudinary(
      req.file,
      `${firstName}-${lastName}`.toLowerCase(),
      'users/profiles'
    );

    profilePicture = secure_url;
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    profilePicture,
    role
  });

  newUser.password = undefined;

  res.status(201).json({
    status: 'sucess',
    data: {
      newUser
    }
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email, status: 'active' }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError(401, 'Invalid credentials.'));
  }

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(200).json({
    status: 'success',
    data: {
      token
    }
  });
});

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  currentUser.password = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      user: currentUser
    }
  });
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const data = filterAllowedFields(req.body, 'firstName', 'lastName');

  if (req.file) {
    const { secure_url } = await uploadToCloudinary(
      req.file,
      `${currentUser.firstName}-${currentUser.lastName}`.toLowerCase(),
      'users/profiles'
    );

    data.profilePicture = secure_url;
  }
  await currentUser.update(data);

  res.status(204).json({ status: 'success' });
});

exports.getUserReviews = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const reviews = await Review.findAll({
    where: { userId: currentUser.id, status: 'active' },
    include: [{ model: Book }, { model: User }]
  });

  res.status(200).json({ status: 'success', data: { reviews } });
});
