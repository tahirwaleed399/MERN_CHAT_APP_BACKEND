let express = require('express');
const  authController = require('../Controllers/authController');
const  messageController = require('../Controllers/messageController');
let router = express.Router()
router.route('/message').post(authController.protectRoute ,messageController.createMessage);
router.route('/message/:chatId').get(authController.protectRoute ,messageController.getMesseges);

module.exports = router;