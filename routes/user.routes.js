const { Register, Login, FetchAllUsers } = require("../controllers/user.controller");

const router = require("express").Router();

router.post("/register", Register);

router.patch("/login", Login);
router.get('/all-users',FetchAllUsers )

module.exports = router;
