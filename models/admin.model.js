const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
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
  profile_picture: {
    type: String,
    required: true,
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

const Admin = mongoose.model("admin", adminSchema);
module.exports = Admin;
