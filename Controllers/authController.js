const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { catchAsyncErrors } = require("../Utils/catchAsyncErrors");
const { jsonResponce } = require("../Utils/responce");
const { promisify } = require("util");
const NewErrorHandler = require("../Utils/NewErrorHandler");
const { sendMail } = require("../Utils/email");
const { json } = require("express");
const crypto = require("crypto");

exports.logout = catchAsyncErrors(async function (req, res, next) {
  res
    .status(200)
    .cookie("jwt", null, {
      expiresIn: Date.now(),
    })
    .json({
      success: true,
    });
});
exports.getUser = catchAsyncErrors(async function (req, res, next) {
  jsonResponce(res, 200, true, { user: req.user });
});
exports.isAuthenticated = catchAsyncErrors(async function (req, res, next) {
  jsonResponce(res, 200, true, "User is Authenticated");
});
const signToken = (id,res) => {
 const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
  let cookieOptions = {
    expires : new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000)),
    httpOnly : true ,
  }
  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true ;
  res.cookie('jwt',token, cookieOptions)
  
  return (token);
};
exports.signUp = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  // It is a big security flaw 😡
  // const user =await  User.create(req.body);
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    photo: req.body.photo ? req.body.photo : undefined,
  });

  const token = signToken(user._id,res);

  jsonResponce(res, 201, true, { token, user });
});
exports.signIn = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new NewErrorHandler("Please Enter Email Or Password"), 401);
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new NewErrorHandler("User Not Found"), 404);
  if (!(await user.comparePasswords(password, user.password)))
    return next(new NewErrorHandler("Incorrect Email Or Password"), 401);
  const token = signToken(user._id,res);

  jsonResponce(res, 200, true, { token, user });
});

exports.protectRoute = catchAsyncErrors(async function (req, res, next) {

  
  let token;
  // 1  : Checks if the token is according the state we defined while siging and logging in



  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if(req.cookies){
    token = req.cookies.jwt
  }
  // 2: Checks if the token is valid and verified or not

  if (!token) return next(new NewErrorHandler("You are not logged in 😟"), 401);
  // promisify makes normal function promise functions and we call that instantly here
  const { id, iat } = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  

  // 3  : Checks if the user exists

  let user = await User.findById(id);

  if (!user) return next(new NewErrorHandler("User has been Deleted", 404));
  // 4 : Checks user has changed the password or not



  if (await user.isPasswordChanged(iat))
    return next( new NewErrorHandler("User has changed password", 401));

  req.user = user;
  // ACCESS GRANTED
  next();
});

exports.restrictTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(
        new NewErrorHandler("You have no access to this recource", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new NewErrorHandler("No user Found"), 404);

  let resetToken = await user.createResetPasswordToken();
  user.save({ validateBeforeSave: false });
  let resetURl = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;
  try {
    let responce = await sendMail(
      email,
      "Reset Password Token",
      `
    Hi Your Reset Password Token  is
    "${resetToken}"
    copy and paste it in app`
    );
    jsonResponce(res, 200, true, responce);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    jsonResponce(res, 500, false, { err, message: "Failed to Send Mail" });
    user.save({ validateBeforeSave: false });
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token, password, confirmPassword } = req.body;
  if (!token)
    return next(new NewErrorHandler("Please get token first then try", 400));

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user)
    return next(new NewErrorHandler("Token is invalid or expired", 401));

  if (password === confirmPassword) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.password = password;
    user.confirmPassword = confirmPassword;
    user.save();
  } else {
    return next(
      new NewErrorHandler("Password and confirmPassword not matched", 400)
    );
  }
  const jwtToken = signToken(user._id,res);
  jsonResponce(res, 200, true, { token : jwtToken });
});

exports.updatePassword = catchAsyncErrors(async function (req, res, next) {
  const { oldPassword, password, confirmPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  let isOldPasswordCorrect = await user.comparePasswords(
    oldPassword,
    user.password
  );


  if (!isOldPasswordCorrect)
    return next(new NewErrorHandler("Old password Does not matched", 401));
  if (!(password === confirmPassword))
    return next(
      new NewErrorHandler(
        " password and confirm password Does not matched",
        401
      )
    );
user.password= password;
user.confirmPassword= confirmPassword;
let updatedUser = await user.save();
const token = signToken(updatedUser.id ,res);



// find by id and update will  not work 
jsonResponce(res , 201 , true , {token , user : updatedUser})
});
