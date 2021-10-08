const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    pw: {
      type: String,
      required: true,
    },
    joinDate: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
      default: "normal",
    },
    nickname: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
