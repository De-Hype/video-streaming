const https = require("https");
require("dotenv").config();
const Courses = require("../models/courses.model");
const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const User = require("../models/user.model");

module.exports.InitializePayment = catchAsync(async (req, res, next) => {
  const params = JSON.stringify({
    email: `${req.body.email}`,
    currency: "NGN",
    channels: ["card"],
    amount: `${req.body.amount}00`,
    metadata: req.body.metadata,
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

        await user.populate("courses");

        user.courses[0].lessons.forEach((lesson) => {
          lesson.subscriptionRequired = false;
        });
        await user.save();
        //Now lets store the id of the user in our Subscribers model
        const subscriber_id = result.data.metadata.user_id;
        const courseFetched = await Courses.findOne({ subscriber_id });
        if (!courseFetched) {
          return next(
            new AppError("Course with provided details does not exist", 402)
          );
        }
        if (courseFetched.subscribers.includes(subscriber_id)) {
          return next(
            new AppError("This user already has access to this course ", 402)
          );
        }
        courseFetched.subscribers.push(subscriber_id);
        await courseFetched.save();

        return res.status(200).json({ user, courseFetched, result });
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
