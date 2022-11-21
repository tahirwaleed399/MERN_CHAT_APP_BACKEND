let express = require('express');
const  authController = require('../Controllers/authController');
let router = express.Router()
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/update-password',authController.protectRoute, authController.updatePassword);
router.get('/is-authenticated',authController.protectRoute, authController.isAuthenticated);
router.get('/get-user',authController.protectRoute, authController.getUser);
router.get('/logout',authController.protectRoute, authController.logout);
module.exports = router;