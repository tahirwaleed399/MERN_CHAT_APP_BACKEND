let express = require('express');
const  userController = require('../Controllers/userController');
const  authController = require('../Controllers/authController');

let router = express.Router() 
router.patch('/update-me', authController.protectRoute,userController.updateMe);
router.delete('/delete-me', authController.protectRoute,userController.deleteMe);
router.get('/get-users' , authController.protectRoute,userController.getUsers)
module.exports = router;