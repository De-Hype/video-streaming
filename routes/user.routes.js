
const router = require("express").Router();


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
)
