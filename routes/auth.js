const User = require("../models/user.model");
const catchAsync = require("../utils/errors/catchAsync");
const router = require("express").Router();
require("dotenv").config();

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    const findUser = await User.findOne({ email });
  if (findUser) {
    return next(new AppError("User already exist", 402));
  }
  
  const createUser = await User({
    email,
    password
  });
  await createUser.save();
  res.status(202).json({status:'ok', createUser})
  })
);

router.post(
  "/login",
  catchAsync(async (req, res, next) => {
  const {email, password} = req.body;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    return next(new AppError("User does not exist", 402));
  }
  if (password != findUser.password){
    return next(new AppError("Incorrect password", 402));
  }
  
  res.cookie("user_auth", findUser._id, {
    httpOnly: true,
  });
  res
    .status(202)
    .json({ status: "ok", message: "User succesfully logged in", findUser });
}))
