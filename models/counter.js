const mongoose = require("mongoose");
const counterSchema = new mongoose.Schema(
  {
    _id: Number,
    name: String,
    current: Number,
    total: Number,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Counter", counterSchema);
