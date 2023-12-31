const https = require("https");
require("dotenv").config();
const Courses = require("../models/courses.model");
const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");

module.exports.InitializePayment = catchAsync(async (req, res, next) => {
  // const {id} = req.body;

  const params = JSON.stringify({
    email: "customer@email.com",
    amount: "20000",
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.Paystack_Secret_Key}`,
      "Content-Type": "application/json",
    },
  };

  const reqPaystack = https
    .request(options, (resPaystack) => {
      let data = "";

      resPaystack.on("data", (chunk) => {
        data += chunk;
      });

      resPaystack.on("end", () => {
        // console.log(JSON.parse(data));
        return res.json(JSON.parse(data));
      });
    })
    .on("error", (error) => {
      // console.error(error);
      throw new Error(`${error.message}`);
    });

  reqPaystack.write(params);
  reqPaystack.end();
  //We are going to add the course id to our course collection.

  //We are going to change the isSubscription check of all the lessons in the module for this user
});

module.exports.VerifyPayment = catchAsync(async (req, res, next) => {});
