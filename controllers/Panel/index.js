var express = require('express');
var mysql = require('mysql');
var app = module.exports = express();

app.set('views', __dirname + '/views');

function conexionBD(){ // Create database conection
	var client = mysql.createConnection({
		host: '127.0.0.1',
		user: 'root',
		password: '',
		database: 'siicomtec',
		port: '3306'
	});
	return client;
}

var BD = conexionBD();

function login(req, res, next) {
	if(req.session.logged){
		next();
	}else{
		res.redirect('/login');
	}
}

function admin(req, res, next) {
	BD.query("SELECT userLvl FROM usuarios WHERE Email = ?", [req.session.logged],
		function(err, result){
			if(result[0].userLvl == "1"){
				next();
			}else if(result[0].userLvl == "0"){
				console.log("No cuenta con suficientes privilegios.")
				res.redirect('/dashboard');
			}else{
				res.redirect('/login');
			}
		});
}

app.get('/dashboard', login, function(req, res) {
	res.render('dashboard',{
		title: 'Dashboard '
	});
});

app.get('/client', login, function(req, res){
	BD.query("SELECT * from clientes", function(err, result){
		res.render('clientes',{title:"Clientes"});
	});
});

app.get('/technical',login, function(req, res){
	res.render('Tecnicos',{title: "Técnicos"});
});

app.get('/services',login, function(req, res){
	res.render('Servicios',{title: "Servicios"});
});

app.get('/record',login, function(req, res){
	res.render('Historial',{title: "Historial"});
});

app.get('/user',admin, function(req, res){
	res.render('Usuarios',{title: "Usuarios"});
});

app.get('/infoUser',login, function(req, res){
	BD.query("SELECT Nombre, Email, userLvl FROM usuarios WHERE Email = ?", [req.session.logged],
		function(err, result){
			res.send(result);
		});
});


app.get('/infoClients', login, function(req, res){
	BD.query("SELECT * from clientes", function(err, result){
		res.send(result);
	});
});

