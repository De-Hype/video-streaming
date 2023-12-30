const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const catchAsync = require("../utils/errors/catchAsync");
const hashPassword = require("../utils/hashPassword");
const AppError = require("../utils/errors/AppError");
require("dotenv").config();

module.exports.Register = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser) {
    return next(new AppError("User already exist", 402));
  }
  const hashedPassword = hashPassword(password);
  

  const createUser = await User({
    email,
    password: `${hashedPassword}`,
  });
  console.log(hashedPassword);
  await createUser.save();
  return res.status(202).json({
    status: "ok",
    message: "User account created succesfully",
    createUser,
  });
});

module.exports.Login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    return next(new AppError("User does not exist", 402));
  }
  if (findUser.password !== hashPassword(password)) {
    return next(new AppError("Incorrect login details", 402));
  }

  const user_auth = jwt.sign({ id: findUser._id }, process.env.Jwt_Secret_Key);
  res.cookie("user_auth", user_auth, {
    httpOnly: true,
  });
  res
    .status(202)
    .json({ status: "ok", message: "User succesfully logged in", findUser });
});
