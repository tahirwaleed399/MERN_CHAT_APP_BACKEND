// It should always be on first
process.on("uncaughtException", (err) => {
  console.log("Shutting down the server due to Uncaught Exception 🔥");
  console.log(err);

  process.exit(1);
});
const app = require("./app");
const dotenv = require("dotenv");
const { connectMongoDb } = require("./database");
dotenv.config({ path: "./Config/config.env" });
const PORT = process.env.PORT || 5700;
const cloudinary = require("cloudinary");
const { Server } = require("socket.io");

connectMongoDb();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const server = app.listen(PORT, () => {
  console.log("Server Listening on " + PORT);
});

const io = new Server(server, {
  /* options */
});

io.on("connection", (socket) => {

  socket.on("setup", (userData) => {


if(userData){
  socket.join(userData._id);
  socket.emit(`connected`);
}
  });

  socket.on('join chat' , (room)=>{
    socket.join(room);
  })

  socket.on('new message' , (newMessegeRecieved)=>{
    console.log('new messege called')
    console.log(newMessegeRecieved)
    const chat = newMessegeRecieved.chat;
   
    if(!chat.users) return  console.log('No Chat.users in it')
    chat.users.forEach((user)=>{
      if (user._id == newMessegeRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved" , newMessegeRecieved);
    })

  })
  socket.on('typing' , (room)=> socket.to(room).emit('typing'))
  socket.on('stop typing' , (room)=> socket.to(room).emit('stop typing'))
});

process.on("unhandledRejection", (err) => {
  console.log("Shutting down the server due to Unhandled Rejection 🔥");
  console.log(err);

  server.close(() => {
    process.exit(1);
  });
});
