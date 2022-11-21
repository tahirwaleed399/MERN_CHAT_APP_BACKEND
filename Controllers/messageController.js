const jwt = require("jsonwebtoken");
const Chat = require("../Models/Chat");
const Message = require("../Models/Message");
const User = require("../Models/User");
const { catchAsyncErrors } = require("../Utils/catchAsyncErrors");
const NewErrorHandler = require("../Utils/NewErrorHandler");
const { jsonResponce } = require("../Utils/responce");
// sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     content: { type: String, trim: true },
//     chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
//     readBy: 
exports.createMessage = catchAsyncErrors(async (req,res,next)=>{
const {content ,chatId } = req.body ;

if(!content || !chatId ) return next(NewErrorHandler('Please Enter All REquired Requirements' , 400));

const newChat = {
    sender : req.user._id,
    content ,
    chat : chatId,
}

let message = await Message.create(newChat);
message = await (await message.populate('sender' , 'name profile')).populate('chat');

message = await User.populate(message , {
    path :'chat.users'
})

jsonResponce(res , 201 , true , message)




});


exports.getMesseges = catchAsyncErrors(async function(req , res , next){
    const {chatId}= req.params;

    const chat = await Chat.findOne({
        users : {$in : req.user._id},
        _id : chatId
    });
    if(!chat) return next(new NewErrorHandler('No Chat Found' , 404));
  const messeges = await (await Message.find({chat:chatId}).populate('sender','email , name , profile').populate('chat')).reverse();
jsonResponce(res , 200 , true , messeges);

})