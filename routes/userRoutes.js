const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
//Bảo vệ các tuyến đường sau thời điểm này (như middleware)
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
//GET ID after use ID GET USER
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
//Middleware trước khi chạy các tuyến đường sau phải là admin
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
