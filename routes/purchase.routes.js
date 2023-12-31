const { InitializePayment } = require("../controllers/purchaseCourse.controller");

const router = require("express").Router();
require("dotenv").config();

router.post("/initialize-payment", InitializePayment);


module.exports = router;