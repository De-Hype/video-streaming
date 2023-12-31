const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: false,
  },
  courses: [
    {
      type: mongoose.Types.ObjectId,
      ref: "course",
    },
  ],
});

const User = mongoose.model("user", userSchema);
module.exports = User;
