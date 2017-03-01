//app.js

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');

var app = express();

// modulos
var home = require('./controllers/home');
var panel = require('./controllers/Panel');
var login = require('./controllers/login');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(cookieParser());

app.use(session({ secret: 'siicom-mx' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// rutas
app.use(home);
app.use(login);
app.use(panel);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Servidor corriendo en puerto ' + app.get('port'));
});
