const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require("../models/user.model");
const catchAsync = require("../utils/errors/catchAsync");
require("dotenv").config();

module.exports.Register = catchAsync(async (req, res, next) => {
    
});
module.exports.Login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    return next(new AppError("User does not exist", 402));
  }
  const isPasswordValid = await bcrypt.compare(password, findUser.password);
  if (!isPasswordValid) {
    return next(new AppError("Incorrect login details", 402));
  }
  const user_auth = jwt.sign({ id: User._id }, process.env.Jwt_Secret_Key);
  res.cookie("user_auth", user_auth, {
    httpOnly: true,
  });
  res
    .status(202)
    .json({ status: "ok", message: "User succesfully logged in", findUser });
});
