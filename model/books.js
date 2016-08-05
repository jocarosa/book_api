var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
   id       : String,
   name     : String,
   toTrade  : Number,
   userReqT : String,
   emailUser: String,
   img      : String,
 
});

module.exports = mongoose.model('Book', Book);