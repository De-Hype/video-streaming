const upload = require("../utils/multer");
const { AdminRegister, AdminLogin } = require("../controllers/admin.controller");
const router = require("express").Router();
require("dotenv").config();

router.post("/register", upload.single("picture"), AdminRegister);
router.patch("/login",  AdminLogin);

module.exports = router;
