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
/*
app.use(function(req, res, next){
  res.status(404);
  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
});
*/


app.get('/dashboard', login, function(req, res) {
	res.render('dashboard',{
		title: 'Dashboard '
	});
});

app.get('/client', login, function(req, res){
		res.render('clientes',{title:"Clientes"});
});

app.get('/technical',login, function(req, res){
	res.render('Tecnicos',{title: "Técnicos"});
});

app.get('/Tservices',login, function(req, res){
	res.render('TServicios',{title: "Tipo de Servicios"});
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

//============= SECCIÓN DE CLIENTES ============================\\

app.get('/infoClients', login, function(req, res){
	BD.query("SELECT * from clientes", function(err, result){
		res.send(result);
	});
});

app.post('/client',login,function(req, res){
	BD.query("INSERT INTO clientes (Nombre, DireccionNeni, Tel, RFC) VALUES (?,?,?,?)",[req.body.Nombre, req.body.DireccionNeni, req.body.Tel, req.body.RFC],
		function(err, result){
			if(!err){
			res.redirect('/client');
			}
		});
});

app.get('/editClient/:id', login, function(req, res){
	BD.query("SELECT * from clientes WHERE idCliente = ?",[req.params.id], function(err, result){
		res.send(result);
	});
});

app.post('/upClient',login, function(req, res){
	BD.query('UPDATE clientes set Nombre = ?, DireccionNeni = ?, Tel = ?, RFC = ? WHERE idCliente = ?',[req.body.Nombre, req.body.DireccionNeni, req.body.Tel, req.body.RFC, req.body.idCliente],
		function(err, result){
			res.redirect('/client');
		});

});

app.get('/delClient/:id', login, function(req, res){
	BD.query("DELETE from clientes WHERE idCliente = ?",[req.params.id], function(err, result){
		if(!err){
			res.send("done");
		}else{
			res.send(err);
		}
	});
});

//============= SECCIÓN DE TÉCNICOS ============================\\

app.get('/infoTech', login, function(req, res){
	BD.query("SELECT * from técnicos", function(err, result){
		res.send(result);
	});
});

app.post('/technical',login,function(req, res){
	BD.query("INSERT INTO técnicos (Nombre, Tel, IDNextel, Puesto) VALUES (?,?,?,?)",[req.body.Nombre, req.body.Tel, req.body.IDNextel, req.body.Puesto],
		function(err, result){
			if(!err){
			res.redirect('/technical');
			}
		});
});

app.get('/editTech/:id', login, function(req, res){
	BD.query("SELECT * from técnicos WHERE idTécnico = ?",[req.params.id], function(err, result){
		res.send(result);
	});
});

app.post('/upTech',login, function(req, res){
	BD.query('UPDATE técnicos set Nombre = ?, Tel = ?, IDNextel = ?, Puesto = ? WHERE idTécnico = ?',[req.body.Nombre, req.body.Tel, req.body.IDNextel, req.body.Puesto, req.body.idTécnico],
		function(err, result){
			res.redirect('/technical');
		});

});

app.get('/delTech/:id', login, function(req, res){
	BD.query("DELETE from técnicos WHERE idTécnico = ?",[req.params.id], function(err, result){
		if(!err){
			res.send("done");
		}else{
			res.send(err);
		}
	});
});

 //============= SECCIÓN DE TIPO DE SERVICIO ============================\\
app.get('/infoTS', login, function(req, res){
	BD.query("SELECT * from tiposervicios", function(err, result){
		res.send(result);
	});
});

app.post('/tipoServ',login,function(req, res){
	BD.query("INSERT INTO tiposervicios (Nombre, Descripcion) VALUES (?,?)",[req.body.Nombre, req.body.Descripcion],
		function(err, result){
			if(!err){
			res.redirect('/Tservices');
			}
		});
});

app.get('/editTipoServ/:id', login, function(req, res){
	BD.query("SELECT * from tiposervicios WHERE idTipoServicio = ?",[req.params.id], function(err, result){
		res.send(result);
	});
});

app.post('/upTipoServ',login, function(req, res){
	BD.query('UPDATE tiposervicios set Nombre = ?, Descripcion = ? WHERE idTipoServicio = ?',[req.body.Nombre, req.body.Descripcion, req.body.idTipoServicio],
		function(err, result){
			res.redirect('/Tservices');
		});

});

app.get('/delTipoServ/:id', login, function(req, res){
	BD.query("DELETE from tiposervicios WHERE idTipoServicio = ?",[req.params.id], function(err, result){
		if(!err){
			res.send("done");
		}else{
			res.send(err);
		}
	});
});

//============= SECCIÓN DE SERVICIO ============================\\

app.get('/infoS', login, function(req, res){
	BD.query("SELECT * from servicios", function(err, result){
		res.send(result);
	});
});

app.post('/Serv',login,function(req, res){
	BD.query("INSERT INTO servicios (idTécnico, idTipoServicio, Problema, idUsuario, Observaciones, Estatus, idCliente) VALUES (?,?,?,?,?,?)",[req.body.idTecnico, req.body.idTipoServicio, req.body.Problema, req.body.idUsuario, req.body.Observaciones, req.body.Estatus, req.body.idCliente],
		function(err, result){
			console.log(err);
			console.log(result);
			if(!err){
			res.redirect('/services');
			}
		});
});

app.get('/editServ/:id', login, function(req, res){
	BD.query("SELECT * from servicios WHERE idServicio = ?",[req.params.id], function(err, result){
		res.send(result);
	});
});

app.post('/upServ',login, function(req, res){
	BD.query('UPDATE servicios set idTécnico = ?, idTipoServicio = ?, Problema = ?, idUsuario = ?, Observaciones = ?, Estatus = ? WHERE idCliente = ?',[req.body.idTecnico, req.body.idTipoServicio, req.body.Problema, req.body.idUsuario, req.body.Observaciones, req.body.Estatus, req.body.idCliente],
		function(err, result){
			res.redirect('/services');
		});
});

app.get('/ServDone/:id',login, function(req, res){
	BD.query('UPDATE servicios set Estatus = ?',[3, req.params.id],
		function(err, result){
			if(!err){
			res.send("done");
		}else{
			res.send(err);
		}
	});
});

app.get('/delServ/:id', login, function(req, res){
	BD.query("DELETE from servicios WHERE idServicio = ?",[req.params.id], function(err, result){
		if(!err){
			res.send("done");
		}else{
			res.send(err);
		}
	});
});



app.use(function(req, res, next) { 
 res.status(404).render('404', { url: req.url });
});


