/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userShema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  email: {
    type: String,
    required: [true, 'Please tell us your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same!',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userShema.pre('save', async function (next) {
  //Chỉ chạy hàm khi password thay đổi
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //Delete passwordConfirm filed
  this.passwordConfirm = undefined;
  next();
});

userShema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});
userShema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userShema.methods.changePasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangeAt) {
    const changeTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );
    console.log(changeTimestamp, JWTtimestamp);
    return JWTtimestamp < changeTimestamp;
  }
  return false;
};

userShema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userShema);

module.exports = User;
