const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    post_content: {
      type: String,
      required: true,
    },
    post_title: {
      type: String,
      required: true,
    },
    writer: {
      type: String,
      required: true,
    },
    viewcounts: {
      type: Number,
      required: true,
      default: 0,
    },

    recommend: {
      type: Number,
      required: true,
      default: 0,
    },
    commentcnt: {
      type: Number,
      required: true,
      default: 0,
    },
    likeusers: {
      type: Array,
      required: true,
      default: [],
    },
    depth: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

postSchema.index({post_title : 'text', post_content : 'text', writer : 'text'})

module.exports = mongoose.model("Post", postSchema);
