var express = require('express');
var app = module.exports = express();

app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
	res.render('home',{
		title: 'SIICOM-MX '
	});
});