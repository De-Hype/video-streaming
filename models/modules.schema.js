const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  module_name: {
    type: String,
    required: true,
  },
  firebase_id: {
    type: String,
    required: true,
  },
 
  subscriptionRequired: {
    type: Boolean,
    required: true,
    default: false,
  }
});

const Modules = mongoose.model("module", moduleSchema);
module.exports = Modules;
