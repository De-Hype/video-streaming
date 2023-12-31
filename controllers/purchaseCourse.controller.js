const https = require("https");
require("dotenv").config();
const Courses = require("../models/courses.model");
const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const User = require("../models/user.model");

module.exports.InitializePayment = catchAsync(async (req, res, next) => {
  // const {id} = req.body;

  const params = JSON.stringify({
    email: `${req.body.email}` || "test@gmail.com",
    currency: "NGN",
    channels: ["card"],
    amount: `${req.body.amount}00` || 20000,
    metadata: req.body.metadata,
  });
  console.log(req.body.metdata);

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
        console.log(JSON.parse(data));
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
//This endpoint will be sent to the success page of the frontend
module.exports.VerifyPayment = catchAsync(async (req, res, next) => {
  const reference = req.params.reference;

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.Paystack_Secret_Key}`,
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = "";

    apiRes.on("data", (chunk) => {
      data += chunk;
    });

    apiRes.on("end", async () => {
      const result = JSON.parse(data);

      if (result.status != false && result.data.status === "success") {
        const email = result.data.customer.email;
        const user = await User.findOne({ email });
        if (!user) {
          return next(
            new AppError("User with provided details does not exist", 402)
          );
        }

        const product_id = result.data.metadata.cart_id;
        if (user.courses.includes(product_id)) {
          return next(new AppError("Course already added to the user", 402));
        }
        
        //Add the course to our users array
        user.courses.push(product_id);

        await user.populate('courses')
        

       
        
        user.courses[0].lessons.forEach((lesson) => {
          lesson.subscriptionRequired = false;
        });
        await user.save();
        // await course.save();
        
        //We have to fetch the ID of the item we paid for via the metadata
        //We have to add the item to our users courses section
        //We have to update all subscriptionRequired to false for this particular user
        return res.status(200).json({ user,  result });
      }

      return next(new AppError(`${result.message}`, 402));
    });
  });

  apiReq.on("error", (error) => {
    res.status(500).json({ error: "An error occurred" });
  });

  // End the request
  apiReq.end();
});
