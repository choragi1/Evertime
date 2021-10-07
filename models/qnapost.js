const mongoose = require('mongoose');
const qnapostSchema = new mongoose.Schema({
    _id : Number,
    date : String,
    post_content : String,
    post_title : String,
    viewcounts : Number,
    writer : String,
    recommend : Number,
    commentcnt : Number,
    likeusers : Array,
    depth : Number
})

module.exports = mongoose.model('QnaPost',qnapostSchema);