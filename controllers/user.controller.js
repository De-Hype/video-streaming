const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
require("dotenv").config();

module.exports.Register = catchAsync(async (req, res, next) => {
  const { first_name, last_name, email, gender,  password } = req.body;
  const findUser = await User.findOne({ email });

  if (findUser) {
    return next(new AppError("User already exist", 403));
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const createUser = await User.create({
    first_name,
    last_name,
    email,
    gender,
    password: hashedPassword,
  });
  // const {password, ...userDetails} = createUser

  // await createUser.save();
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
  const passwordMatch = await bcrypt.compare(password, findUser.password);

  if (!passwordMatch) {
    return next(new AppError("Incorrect login details", 402));
  }
  findUser.lastLogin = new Date();
  await findUser.save();

  const user_auth = jwt.sign({ id: findUser._id }, process.env.Jwt_Secret_Key);
  res.cookie("user_auth", user_auth, {
    httpOnly: true,
  });
  res
    .status(202)
    .json({ status: "ok", message: "User succesfully logged in", findUser });
});

module.exports.FetchAllUsers = catchAsync(async (req, res, next) => {
  //Get Number of all registered students
  const fetchAllUsers = await User.find();
  if (fetchAllUsers.length <= 0) {
    return next(new AppError("No users found", 402));
  }
  const numOfStudent = fetchAllUsers.length;
  //Check that users passwords is not returned
  res
    .status(200)
    .json({
      status: "ok",
      message: "All users fetched succesfully.",
      studentNumber: numOfStudent,
      fetchAllUsers,
    });

  //Get the total number of courses
});

module.exports.FetchUsersByGender = catchAsync(async (req, res, next) => {
  //Get Number of all registered students
  const {requiredGender} = req.query;
  const gender = requiredGender == undefined ? 'male' : requiredGender
  // date ==undefined ? 7 : date;
  const fetchUsersGender = await User.find({gender});
  if (fetchUsersGender.length <= 0) {
    return next(new AppError("No users found", 402));
  }
 
  res
    .status(200)
    .json({
      status: "ok",
      message: "All users fetched succesfully.",
      studentNumber: numOfStudent,
      fetchAllUsers,
    });

  //Get the total number of courses
});