const https = require("https");
require("dotenv").config();
const Courses = require("../models/courses.model");
const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const User = require("../models/user.model");

module.exports.InitializePayment = catchAsync(async (req, res, next) => {
  const subscriber_id = req.body.metadata.user_id;
  const product_ids = req.body.metadata.cart_id;
  const email = req.body.email;
  const amount = req.body.amount;
  let initialAmount = 0;
  //[{id:46656565656, quantity:2},{id:4shshsgg5656, quantity:3}, ]
  //Checking to see if the user is even valid
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User with provided details does not exist", 402));
  }
  if (user.id != subscriber_id) {
    return next(new AppError("Invalid user details", 402));
  }
  //Checking to see prices for items that i am getting, actually tallies with the total amount
  //We will fetch all courses with provided id
  const coursesFetched = await Courses.find({ _id: { $in: product_ids } });
  // console.log(coursesFetched)
  if (coursesFetched.length === 0) {
    return next(
      new AppError(
        "Payment failed because, course with any of the ID's not found",
        405
      )
    );
  }
  //Iterate through their prices, and on each iteration, we add the sum of the items
  for (const courses of coursesFetched) {
    initialAmount += courses.price;
  }
  //We compare if the sum that we are getting actually equals the amount we are paying
  if (amount !== initialAmount) {
    return next(
      new AppError(
        `Payment failed because you tried pay insufficient amount. Please pay ${initialAmount} Naira`,
        402
      )
    );
  }

  const params = JSON.stringify({
    first_name: `${user.first_name}`,
    last_name: `${user.last_name}`,
    email,
    currency: "NGN",
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
        const subscriber_id = result.data.metadata.user_id;
        const product_ids = result.data.metadata.cart_id;
        const user = await User.findOne({ email });
        if (!user) {
          return next(
            new AppError("User with provided details does not exist", 402)
          );
        }
        // console.log(user.id)
        if (user.id != subscriber_id) {
          return next(new AppError("Invalid user details", 402));
        }
        const courseFetched = await Courses.find({ _id: { $in: product_ids } });

        if (!courseFetched) {
          return next(
            new AppError("Course with provided details does not exist", 402)
          );
        }

        // if (user.courses.some(value => product_ids.includes(value))) {
        //   return next(new AppError("Course already added to the user", 402));
        // }

        //Add the course to our users array
        user.courses.concat(product_ids);

        await user.populate("courses");

        user.courses.forEach((item) => {
          item.lessons.forEach((lesson) => {
            lesson.subscriptionRequired = false;
          });
        });

        //Now lets store the id of the user in our Subscribers model

        return res.json(courseFetched);
        for (const courses of courseFetched) {
          const subscribersArray = Object;
        }

        //  courseFetched.every(courses=>{
        //   // courses.subscribers.includes(subscriber_id)
        //   if (courses.subscribers.includes(subscriber_id)) {
        //     return next(
        //       new AppError("This user already has access to this course ", 402)
        //     );
        //   }
        // })

        courseFetched.forEach(async (courses) => {
          courses.subscribers.push(subscriber_id);
          await courses.save();
        });

        await user.save();
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
