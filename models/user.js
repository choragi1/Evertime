const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    _id : Number,
    email : String,
    id : String,
    name : String,
    pw : String,
    joinDate : String,
    auth : String,
    nickname : String
})

module.exports = mongoose.model('User',userSchema);