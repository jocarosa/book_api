var bodyparser    = require('body-parser');
var express       = require('express');
var app           = express();
var route         = require('./routes/rutas.js');
var mongoose      = require('mongoose');
var session       = require('express-session');
var http          = require('http');
var server        = http.createServer(app);
var io            = require('socket.io').listen(server);


require('dotenv').config();

app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

app.use(session({
  secret: 'ssshhhhh'
}));

mongoose.connect(process.env.MONGO_URI);

route(app,io); 

server.listen(process.env.PORT,function(){
  console.log('app listening  on port '+ process.env.PORT);
});
