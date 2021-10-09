const mongoose = require("mongoose");
const freecommentSchema = new mongoose.Schema(
  {
    _id: {type :Number,required: true,},
    comment: {type : String,required: true,},
    parent: {type : Number,required: true,},
    parentcomment: {type : Number,default:null},
    date: {type : String,required: true,},
    writer: {type : String,required: true,},
    depth: {type : Number,required: true,default:0},
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("FreeComment", freecommentSchema);
