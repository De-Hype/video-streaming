const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/errors/catchAsync");
const hashPassword = require("../utils/hashPassword");
const AppError = require("../utils/errors/AppError");
const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");

const firebaseConfig = require("../utils/firebase.config");
const Admin = require("../models/admin.model");
require("dotenv").config();

module.exports.AdminRegister = catchAsync(async (req, res, next) => {
  let { first_name, last_name, email, password } = req.body;
  const file = req.file;
  const findUser = await Admin.findOne({ email });
  if (findUser) {
    return next(new AppError("User already exist", 402));
  }

  const filename =
    crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);
  //Initialize a firebase application
  initializeApp(firebaseConfig);
  // Initialize Cloud Storage and get a reference to the service
  const storage = getStorage();
  // Create file metadata including the content type
  const metadata = {
    contentType: req.file.mimetype,
  };
  const storageRef = ref(storage, filename);
  // Upload the file in the bucket storage
  const snapshot = await uploadBytesResumable(
    storageRef,
    encryptedFile,
    metadata
  );
  // Grab the public url
  const downloadURL = await getDownloadURL(snapshot.ref);
  const hashedPassword = hashPassword(password);

  const createUser = await User({
    first_name,
    last_name,
    profile_picture: downloadURL,
    email,
    password: `${hashedPassword}`,
  });

  await createUser.save();
  return res.status(202).json({
    status: "ok",
    message: "User account created succesfully",
    createUser,
  });
});

module.exports.AdminLogin = catchAsync(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;
  const findUser = await Admin.findOne({ email });
  if (!findUser) {
    return next(new AppError("User does not exist", 402));
  }
  if (findUser.password !== hashPassword(password)) {
    return next(new AppError("Incorrect login details", 402));
  }
  const tokenExpiration = rememberMe ? "7d" : "1d";
  const secureOption =
    req.protocol === "https" || process.env.NODE_ENV !== "development"
      ? true
      : false;

  const user_auth = jwt.sign({ id: findUser._id }, process.env.Jwt_Secret_Key, {
    expiresIn: tokenExpiration,
  });

  res.cookie("user_auth", user_auth, {
    httpOnly: true,
    secure: secureOption,
  });
  res
    .status(202)
    .json({ status: "ok", message: "User succesfully logged in", findUser });
});
