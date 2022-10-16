let express = require('express');
const  authController = require('../Controllers/authController');
let router = express.Router()
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/update-password',authController.protectRoute, authController.updatePassword);

module.exports = router;