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


app.get('/login', function(req, res) {
	if(req.session.logged){
		res.redirect("/dashboard");
	}else{
	res.render('login',{
		title: 'Iniciar sesión'
	});
	}
});

app.post('/login', function(req, res){
	var user = req.body.txtUser;
	var pass = req.body.txtPass;
	BD.query('SELECT Email, Password from usuarios WHERE Email = ? AND Password = ?',[user, pass],
		function(error, result, row){
			if(!error){
				if(result.length>0){
					req.session.logged = user;
					res.redirect('/dashboard');
				}else{
					res.redirect('/login');
				}
			}
		});
});

app.get('/salir', function(req, res) {
        delete req.session.logged;
        res.redirect('/');
 });
