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
     
     //Decrypt incoming data
    function decrypt(text){
          var decipher = crypto.createDecipher(algorithm,password)
          var dec = decipher.update(text,'hex','utf8')
          dec += decipher.final('utf8');
      return dec;
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

function login(req, res, next) {
	if(req.session.logged){
		next();
	}else{
		res.redirect('/login');
	}
}

function admin(req, res, next) {
	if(req.session.logged){
		BD.query("SELECT userLvl FROM técnicos WHERE Email = ?", [req.session.logged],
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
	}else{
		res.redirect('/login');
	}
}


app.get('/dashboard', login, function(req, res) {
	res.render('dashboard',{
		title: 'Dashboard '
	});
});

app.get('/client', login, function(req, res){
		res.render('clientes',{title:"Clientes"});
});

app.get('/technical',admin, function(req, res){
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

app.get('/user',login, function(req, res){
	res.render('Usuarios',{title: "Usuarios"});
});

app.get('/inventario',login, function(req, res){
	res.render('Inventario',{title: "Inventario"});
});

app.get('/infoUser',login, function(req, res){
	BD.query("SELECT Nombre, Email, userLvl FROM técnicos WHERE Email = ?", [req.session.logged],
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
	var pass = encrypt(req.body.Password);
	BD.query("INSERT INTO técnicos (Nombre, Tel, Email, Password, IDNextel, Puesto, userLvl) VALUES (?,?,?,?,?,?,?)",[req.body.Nombre, req.body.Tel, req.body.Email, pass, req.body.IDNextel, req.body.Puesto, req.body.userLvl],
		function(err, result){
			console.log(err);
			console.log(result);
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
	BD.query('SELECT *, DATE_FORMAT(Fecha, "%d/%m/%Y") Fecha from servicios WHERE stats = 1', function(err, result){
		res.send(result);
	});
});

app.get('/infoSD', login, function(req, res){
	BD.query('SELECT *, DATE_FORMAT(Fecha, "%d/%m/%Y") Fecha from servdone ORDER BY idServDone DESC', function(err, result){
		res.send(result);
	});
});

app.post('/Serv',login,function(req, res){
	BD.query("INSERT INTO servicios (idTécnico, idTipoServicio, Problema, idUsuario, Observaciones, Estatus, Fecha, stats) VALUES (?,?,?,?,?,?,NOW(),?)",[req.body.idTecnico, req.body.idTipoServicio, req.body.Problema, req.body.idUsuario, req.body.Observaciones, req.body.Estatus,1],
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
	BD.query('UPDATE servicios set idTécnico = ?, idTipoServicio = ?, Problema = ?, idUsuario = ?, Observaciones = ?, Estatus = ? WHERE idServicio = ?',[req.body.idTecnico, req.body.idTipoServicio, req.body.Problema, req.body.idUsuario, req.body.Observaciones, req.body.Estatus, req.body.idServicio],
		function(err, result){
			res.redirect('/services');
		});
});

app.get('/ServDone/:id',login, function(req, res){
	BD.query('INSERT INTO servdone (idServicio, Fecha) VALUES (?,now())',[req.params.id],
		function(err, result){
			BD.query("UPDATE servicios set stats = 0, Estatus = ? WHERE idServicio = ?",["Terminado",req.params.id], function(err, result){
			if(!err){
				res.send("done");
			}else{
				res.send(err);
			}
		});
	});
});

app.get('/delServ/:id', login, function(req, res){
	BD.query("UPDATE servicios set stats = 0  WHERE idServicio = ?",[req.params.id], function(err, result){
		if(!err){
			res.send("done");
		}else{
			res.send(err);
		}
	});
});

 //============= SECCIÓN DE Usuarios ============================ PENDIENTE \\ 
app.get('/infouS', login, function(req, res){
	BD.query("SELECT * from usuarios", function(err, result){
		res.send(result);
	});
});

app.post('/user',login,function(req, res){
	BD.query("INSERT INTO usuarios (Nombre, Descripcion) VALUES (?,?)",[req.body.Nombre, req.body.Descripcion],
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

//============= SECCIÓN DE INVENTARIO ============================\\
app.get('/infoInv', login, function(req, res){
	BD.query("SELECT * from inventario", function(err, result){
		res.send(result);
	});
});

app.post('/inventario',login,function(req, res){
	BD.query("INSERT INTO inventario (Usuario, PassEquip, NombreEquip, MAC, IPEquip, SO, Marca, Modelo, Procesador, RAM, HDD, Estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[req.body.Usuario, req.body.PassEquip, req.body.NombreEquip, req.body.MAC, req.body.IPEquip, req.body.SO, req.body.Marca, req.body.Modelo, req.body.Procesador, req.body.RAM, req.body.HDD, req.body.Estado],
		function(err, result){
			if(!err){
			res.redirect('/inventario');
			}
		});
});

app.get('/editInventario/:id', login, function(req, res){
	BD.query("SELECT * from inventario WHERE idInventario = ?",[req.params.id], function(err, result){
		res.send(result);
	});
});

app.post('/upInv',login, function(req, res){
	BD.query('UPDATE inventario set Usuario = ?, PassEquip = ?, NombreEquip = ?, MAC = ?, IPEquip = ?, SO = ?, Marca = ?, Modelo = ?, Procesador = ?, RAM = ?, HDD = ?, Estado = ? WHERE idInventario = ?',[req.body.Usuario, req.body.PassEquip, req.body.NombreEquip, req.body.MAC, req.body.IPEquip, req.body.SO, req.body.Marca, req.body.Modelo, req.body.Procesador, req.body.RAM, req.body.HDD, req.body.Estado, req.body.idInventario],
		function(err, result){
			res.redirect('/inventario');
		});

});

app.get('/delInv/:id', login, function(req, res){
	BD.query("DELETE from inventario WHERE idInventario = ?",[req.params.id], function(err, result){
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


