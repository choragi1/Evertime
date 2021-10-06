const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    _id : Number,
    date : String,
    post_content : String,
    post_title : String,
    viewcounts : Number,
    writer : String,
    recommend : Number,
    commentcnt : Number,
    likeusers : Array
})

module.exports = mongoose.model('Post',postSchema);