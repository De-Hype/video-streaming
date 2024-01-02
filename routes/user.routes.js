const { Register, Login } = require("../controllers/user.controller");

const router = require("express").Router();

router.post("/register", Register);

router.patch("/login", Login);

module.exports = router;
