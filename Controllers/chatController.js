const { catchAsyncErrors } = require("../Utils/catchAsyncErrors");
const NewErrorHandler = require("../Utils/NewErrorHandler");
const Chat = require("../Models/Chat");
const User = require("../Models/User");
const { jsonResponce } = require("../Utils/responce");
// 1 on 1 chat
exports.accessRoute = catchAsyncErrors(async function (req, res, next) {
  const { userId } = req.body;
  console.log(req.body)
  if (!userId) return next(new NewErrorHandler("User id not provided", 400));
  if (userId == req.user._id)
    return next(
      new NewErrorHandler("Cannot Create Chat with your own account", 400)
    );
  let isChat = await Chat.find({
    isGroupChat: { $ne: true },
    $and: [
      {
        users: { $elemMatch: { $eq: req.user._id } },
      },
      {
        users: { $elemMatch: { $eq: userId } },
      },
    ],
  })
    .populate("users")
    .populate("latestMessage");
  console.log(isChat);

  // dont know what does it do
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name profile email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    const createdChat = await Chat.create(chatData);

    const FullChat = await Chat.findById(createdChat._id).populate(
      "users",
      "-password"
    );
    res.status(200).send(FullChat);
    jsonResponce(res , 200 , true, Fullchat)
  }
});

exports.fetchChats = catchAsyncErrors(async function (req, res, next) {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("groupAdmin", "-password")
    .sort({ updatedAt: -1 });
  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name profile email",
  });
  jsonResponce(res, 200, true, chats);
});

exports.createGroupChat = catchAsyncErrors(async function (req, res, next) {
  let { name, users } = req.body;
  if (!name || !users)
    return next(new NewErrorHandler("Please Fill All Fields", 400));
  users = JSON.parse(users);
  if (users.length < 2)
    return next(
      new NewErrorHandler("Group Chat Cannot Be Created By 1 user", 400)
    );

  users.push(req.user);
  console.log(req.user);
  console.log(users);
  const groupChat = await Chat.create({
    chatName: name,
    users: users,
    isGroupChat: true,
    groupAdmin: req.user,
  });
  const fetchedChat = await Chat.findById(groupChat._id);
  jsonResponce(res, 200, true, groupChat);
});

exports.renameGroupChat = catchAsyncErrors(async function (req, res, next) {
  const { chatId, name } = req.body;
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: name,
    },
    {
      new: true,
    }
  );

  jsonResponce(res , 201 , true , chat);
});
exports.addUser = catchAsyncErrors(async function(req , res , next){
    const { chatId, userId } = req.body;
    
if(userId === req.user._id)  return next(new NewErrorHandler('You cannot add yourself', 400));
    // check if the requester is admin
  
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
 

  
    if (!added) {

        return next(new NewErrorHandler('Not found group chat', 400));
    } else {
   

        jsonResponce(res , 200 , true , added);
    }


});
exports.removeUser = catchAsyncErrors(async function(req , res , next){
    const { chatId, userId } = req.body;

    if(userId === req.user.id) return next(new NewErrorHandler('You Cannot remove yourself', 400));

    // check if the requester is admin
    console.log({ chatId, userId } );
  
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

  
    if (!removed) {
        return next(new NewErrorHandler('Not found group chat', 400));
    } else {
        jsonResponce(res , 200 , true , removed);
    }
});