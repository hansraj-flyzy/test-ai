const mongoose = require('mongoose');
console.log("Connecting to DB");
mongoose.connect("mongodb://127.0.0.1:27017");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("DB Connected");
});

module.exports = mongoose;