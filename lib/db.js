// Mongoose 설정
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URL,{ dbName: "todoapp", useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
	console.log("DB connected");
});

module.exports = mongoose