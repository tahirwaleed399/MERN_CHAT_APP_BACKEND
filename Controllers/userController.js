const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { catchAsyncErrors } = require("../Utils/catchAsyncErrors");
const NewErrorHandler = require("../Utils/NewErrorHandler");
const { jsonResponce } = require("../Utils/responce");


exports.updateMe = catchAsyncErrors(async (req, res, next) => {
  const { name, email } = req.body;
  const updateObj = { name, email };
  const user = await User.findByIdAndUpdate(req.user.id, updateObj, {
    runValidators: true,
    new: true,
  });
  jsonResponce(res, 201, true, user);
});
exports.deleteMe = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  console.log(user);
  user.active = false;
  await user.save({ validateBeforeSave: false });

  jsonResponce(res, 201, true, { message: "User Deleted Successfully" });
});
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          {
            name: { $regex: req.query.search, $options: "i" },
          },
          {
            email: { $regex: req.query.search, $options: "i" },
          },
        ],
      }
    : {};


    const users = await User.find(keyword).find({_id : {$ne : req.user._id}});
 
    jsonResponce(res , 200 , true , users);
     
});
