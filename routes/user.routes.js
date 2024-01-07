const {
  Register,
  Login,
  FetchAllUsers,
  FetchUsersByGender,
} = require("../controllers/user.controller");

const router = require("express").Router();

router.post("/register", Register);

router.patch("/login", Login);
router.get("/all-users", FetchAllUsers);
router.get("/fetch-by-gender", FetchUsersByGender);

module.exports = router;
