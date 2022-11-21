const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, "Name Should Be At least of 3 characters"],
    maxlength: [80, "Name Cannot Cross 80 Characters"],
    required: [true, "Name is Required"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is Required "],
    lowercase: true,
    validate: [validator.isEmail, "Email Should be Correct"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
    minLength: [8, "Password should be at least of 8 chaaracters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Password is Required"],
    validate: {
      // it will only work on save and create method not on findIdandUpdate likewise
      validator: function (el) {
        return el === this.password;
      },

      message: "Password Should be matched",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre(/^find/, async function (next) {
 this.find({active : {$ne : false }});
  next();
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.comparePasswords = async function (
  enteredPassword,
  originalPassword
) {
  return await bcrypt.compare(enteredPassword, originalPassword);
};
userSchema.methods.createResetPasswordToken = async function () {
  const token = await crypto.randomBytes(48).toString("hex");
  // we will save after hashing it so no one will able to read it
  console.log(token);

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};
userSchema.methods.isPasswordChanged = async function (JWT_TIMESTAMP) {
  if (!!this.passwordChangedAt) {
    const changedStamps = new Date(this.passwordChangedAt).getTime() / 1000;
    return changedStamps > JWT_TIMESTAMP;
  }
  //false means not changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
