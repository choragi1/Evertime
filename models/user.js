const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const userSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
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
    googleId : {
      type : Number
    },
    kakaoId : {
      type : Number
    },
    facebookId : {
      type : Number
    }
  },
  {
    versionKey: false,
  }
);

userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);