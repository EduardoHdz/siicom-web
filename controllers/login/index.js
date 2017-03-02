var express = require('express');
var mysql = require('mysql');
var app = module.exports = express();

var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'd6F3Efeq';

        //Encrypt incoming data 
    function encrypt(text){
          var cipher = crypto.createCipher(algorithm,password)
          var crypted = cipher.update(text,'utf8','hex')
          crypted += cipher.final('hex');
      return crypted;
    }
     



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
	var pass = encrypt(req.body.txtPass);
	BD.query('SELECT Email, Password from técnicos WHERE Email = ? AND Password = ?',[user, pass],
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
