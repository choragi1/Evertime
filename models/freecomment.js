const mongoose = require('mongoose');
const freecommentSchema = new mongoose.Schema({
    _id : Number,
    comment : String,
    parent : Number,
    date : String,
    writer : String
})

module.exports = mongoose.model('Freecomment',freecommentSchema);