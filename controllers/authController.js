/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const correctPassword = require('../models/userModel');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1. Kiểm tra xem email password có tồn tại không
  if (!email || !password) {
    next(new AppError('Please provide email and password! ', 400));
  }
  //2. Tìm kiếm xem có trong db không. Tìm kiếm theo email vì password trong db bị băm
  const user = await User.findOne({ email }).select('+password');
  //3. Kiểm tra xem password nhập vào có bằng password trong db không.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('InCorrect email or password ', 401));
  }
  //4. Trả về token và res nếu đúng thông tin đăng nhập
  const token = signToken(user._id);

  res.status(200).json({
    message: 'success',
    token,
  });
});
