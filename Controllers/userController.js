const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { catchAsyncErrors } = require("../Utils/catchAsyncErrors");
const { jsonResponce } = require("../Utils/responce");
const NewErrorHandler = require("../Utils/NewErrorHandler");

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
  await user.save({validateBeforeSave:false});
  
  jsonResponce(res, 201, true, { message: "User Deleted Successfully" });
});
