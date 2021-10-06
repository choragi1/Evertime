const mongoose = require('mongoose');
const counterSchema = new mongoose.Schema({
    _id : ObjectId,
    name : String,
    totalMember : String,
    currentMember : String,
    auth : String,
    nickname : String
})

module.exports = mongoose.model('User',counterSchema);