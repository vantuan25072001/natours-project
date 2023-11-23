/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const correctPassword = require('../models/userModel');
const changePasswordAfter = require('../models/userModel');
const createPasswordResetToken = require('../models/userModel');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

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

exports.protect = catchAsync(async (req, res, next) => {
  //1. Get token và kiểm tra nó.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }
  //2. Verification token (giải mã token tạo ra từ id và khóa )
  // (thành công => trả về khóa và thực hiện tiếp routes)
  // (thất bại =>  trả về lỗi và không thực hiện tiếp routes)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. Kiểm tra nếu user still exists
  // Khi đang xác thực token người dùng bị xóa ,nghĩa là không đăng nhập(không có tài khoản) => nên vẫn có thể vào được tuyến đường.
  // Hoặc là khi mà người dùng đổi mật khẩu trong khi mã token đã được xác nhận , thì người dùng vẫn đến tuyến dường đó được.
  //Ví dụ : khi ai đó đánh cắp mã token của mình mà người dùng đổi mật khẩu người dùng.Nhưng mã token vẫn xác nhận được để vào tuyến đường.
  //Token phải đi kèm với id , id tồn tại thì token đúng (và ngược lại).
  //Khi tài khoản bay màu mà vẫn còn token thì nó vẫn qua bước xác minh đó và đến tuyến routes tiếp theo.
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }
  //4. Check if người dùng đổi mật after the token was issues
  // Kiểm tra xem password có đổi sau thời gian tạo token không , nếu token tạo trước thì trả về đúng , có đổi
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again!', 401),
    );
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  console.log(req.user);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get user bassed on POSTed email (ge user từ email)

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  //2. Generate the random reset token (tạo mã token random)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3. Send it to user's email (Gửi nó cho email người đùng)
});

exports.resetPassword = (req, res, next) => {};
