const mongoose = require('mongoose');

require('dotenv').config();

module.exports = () => {
    function connect() {
        mongoose.connect(process.env.DB_URL,
            { dbName: 'todoapp',
            useNewUrlParser: true,
        }, function(err) {
            if(err){
                console.error('mongodb connection error', err);
            }
            console.log('mongodb connected');
        });
    }
    connect();
    mongoose.connection.on('disconnected', connect);
    require('../models/user','../models/post','../models/qnapost','../models/freecomment','../models/qnacomment');
}