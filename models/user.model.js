const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  courses: [
    {
      type: mongoose.Types.ObjectId,
      ref: "course",
    },
  ],
});

const User = mongoose.model("user", courseSchema);
module.exports = User;
