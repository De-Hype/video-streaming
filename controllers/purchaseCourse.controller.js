const https = require("https");
require("dotenv").config();
const Courses = require("../models/courses.model");
const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");

module.exports.InitializePayment = catchAsync(async (req, res, next) => {
  // const {id} = req.body;

  const params = JSON.stringify({
    email: `${req.body.email}` || "test@gmail.com",
    currency: "NGN",
    channels: ["card"],
    amount: `${req.body.amount}00` || 20000,
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

module.exports.VerifyPayment = catchAsync(async (req, res, next) => {
  const reference = req.params.reference
  try {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.Paystack_Secret_Key}`
      }
    }


    const apiReq = https.request(options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        console.log(JSON.parse(data));
        return res.status(200).json(JSON.parse(data));
      });
    });

    apiReq.on('error', (error) => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    });

    // End the request
    apiReq.end();

  } catch (error) {
    // Handle any errors that occur during the request
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});
