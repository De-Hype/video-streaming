const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    unique: true,
  },
  last_name: {
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
      unique:true,
    },
  ],
},{timestamps:true});

const User = mongoose.model("user", userSchema);
module.exports = User;
