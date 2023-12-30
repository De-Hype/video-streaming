const { Register, Login } = require("../controllers/user.controller");

const router = require("express").Router();

router.post("/register", Register);

router.post("/login", Login);


module.exports = router;
