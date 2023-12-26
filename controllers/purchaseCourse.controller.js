const Courses = require("../models/courses.model");
const catchAsync = require("../utils/errors/catchAsync");

module.exports.UserPurchaseCourse = catchAsync(async (req, res, next) => {
    const {id} = req.body;

    //We are going to add the course id to our course collection.

    //We are going to change the isSubscription check of all the lessons in the module for this user 
    const AllCourses = await Courses.find();
    res.status(202).json({
      status: "ok",
      success: true,
      message: "Course fetched succesfully",
      AllCourses,
    });
  });