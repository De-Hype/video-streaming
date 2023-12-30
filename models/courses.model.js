const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
  lessons: [
    {
      lesson_name: {
        type: String,
        required: true,
      },
      sections: [
        {
          course_name: {
            type: String,
            required: true,
          },
          firebase_url: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  subscribers: [
    {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  ],
});

const Courses = mongoose.model("course", courseSchema);
module.exports = Courses;

//This will include course name, course author (Should make reference), courses array,
