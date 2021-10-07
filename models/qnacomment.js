const mongoose = require('mongoose');
const qnacommentSchema = new mongoose.Schema({
    _id : Number,
    comment : String,
    parent : Number,
    date : String,
    writer : String,
    depth : Number
})

module.exports = mongoose.model('QnaComment',qnacommentSchema);