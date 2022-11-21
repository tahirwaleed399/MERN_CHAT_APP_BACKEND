let express = require("express");
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");
const chatController = require("../Controllers/chatController");

let router = express.Router();

router
  .route("/chat")
  .post(authController.protectRoute, chatController.accessRoute);
router
  .route("/chats")
  .get(authController.protectRoute, chatController.fetchChats);
router.post(
  "/group-chat",
  authController.protectRoute,
  chatController.createGroupChat
);
router.post(
  "/rename-group-chat",
  authController.protectRoute,
  chatController.renameGroupChat
);
router.patch(
  "/add-user-to-group-chat",
  authController.protectRoute,
  chatController.addUser
);
router.patch(
  "/remove-user-from-group-chat",
  authController.protectRoute,
  chatController.removeUser
);
module.exports = router;
