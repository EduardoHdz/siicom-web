var express = require('express');
var mysql = require('mysql');
const nodemailer = require("nodemailer");
var multer = require('multer');
var upload = multer({dest: './uploads/'});
var fs = require('fs');
var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'd6F3Efeq';
var app = module.exports = express();

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
	BD.query("SELECT Foto, Nombre, Email, userLvl FROM técnicos WHERE Email = ?", [req.session.logged],
		function(err, result){
			res.send(result);
		});
});

//============= SECCIÓN EMAIL ============================\\

 let smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "desarrollo.siicom@gmail.com",
            pass: "siicom*2017"
        }
    });

 var rand, mailOptions, host, link;
    /// email verification request
    app.get('/send/:id',function(req,res){
        host=req.get('host'); //remplace ip address to 'host' to make it universal
        //link="http://"+req.get('host')+"/verify?id="+rand+"&mail="+req.query.to;
        link="http://"+"10.150.193.14:3000"+"/login";
        var mail = req.params.id;

        BD.query('SELECT Nombre, Password FROM técnicos WHERE Email = ?',[mail], function(err, result){
        	var contra = decrypt(result[0].Password);
        	mailOptions={
        	from: '"SIICOM-MX" <desarrollo.siicom@gmail.com>',
            to : mail,
            subject : "[SIICOM-MEX] Password.",
            html : "Hola "+result[0].Nombre+",<br>La contraseña de acceso para esta cuenta ha sido enviada.<br>Su contraseña es: &nbsp; "+contra+" <br><a href="+link+">Logearse en la plataforma.</a>" 
	        }
	        console.log(mailOptions); // Show details of mailOptions in console
	        smtpTransport.sendMail(mailOptions, function(error, response){
	         if(error){
	         	console.log(error);
	            res.end("error");
	         }else{
	            res.end("sent");
	             }
	         });

        });
        
    });

//============= SECCIÓN DE PERFIL ============================\\

app.get('/settings/:id',login,function(req, res){
	if(req.params.id == req.session.logged){
		BD.query('SELECT * from Técnicos WHERE Email = ?',[req.params.id],
			function(err, result){
				res.render('profile',{title: "Perfíl",data:result});
			});
	}else{
		res.redirect('/dashboard');
	}
});

app.post('/upProfile', login, function(req, res){
	if(req.body.Email == req.session.logged){
		BD.query('UPDATE técnicos set Nombre = ?, Tel = ?, IDNextel = ? WHERE Email = ?', [req.body.Nombre, req.body.Tel, req.body.IDNextel, req.session.logged],
			function(err, result){
				res.redirect('/settings/'+req.session.logged);
			});
	}
});

app.post('/photoProfile/:id', upload.array('foto', 1),login, function(req, res){
				console.log(req.files[0]);

 		if(req.files[0].mimetype == "image/jpg" || req.files[0].mimetype == "image/jpeg"){
 			 fs.createReadStream('./uploads/'+req.files[0].filename).pipe(fs.createWriteStream('./public/fotos/Técnicos/'+req.params.id+'-'+"foto de perfil.jpg")); 
			   path = "../fotos/Técnicos/"+req.params.id+'-'+"foto de perfil.jpg";
			   BD.query('UPDATE técnicos set Foto = ? WHERE idTécnico = ?',[path, req.params.id],function(err, result){
			   		console.log("La foto se ha a registrado con: "+path+" errores: "+err+" resultado: "+result);
			   		fs.unlink('./uploads/'+req.files[0].filename); 
		      	 	res.send('done');
			   });

 		}else if(req.files[0].mimetype == "image/png"){
 			fs.createReadStream('./uploads/'+req.files[0].filename).pipe(fs.createWriteStream('./public/fotos/Técnicos/'+req.params.id+'-'+"foto de perfil.png")); 
			   path = "../fotos/Técnicos/"+req.params.id+'-'+"foto de perfil.png";
			   BD.query('UPDATE técnicos set Foto = ? WHERE idTécnico = ?',[path, req.params.id],function(err, result){
			   		console.log("La foto se ha a registrado con: "+path+" errores: "+err+" resultado: "+result);
			   		fs.unlink('./uploads/'+req.files[0].filename); 
		      	 	res.send('done');
			   });
 		}else{
 			res.send('Archivo no soportado');
 		}
			  
		       
 
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
	BD.query('UPDATE técnicos set Nombre = ?, Tel = ?, Email = ?, IDNextel = ?, Puesto = ? WHERE idTécnico = ?',[req.body.Nombre, req.body.Tel, req.body.Email, req.body.IDNextel, req.body.Puesto, req.body.idTécnico],
		function(err, result){
			console.log(err);
			console.log(result);
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

// SELECT b.idBebedero idBebedero, cor.Nombre idCorral, b.Capacidad Capacidad, b.Nombre Nombre, b.Descripcion Descripcion from bebedero b LEFT JOIN corral cor ON b.idCorral = cor.idCorral 

app.get('/infoS', login, function(req, res){
	//BD.query('SELECT *, DATE_FORMAT(Fecha, "%d/%m/%Y") Fecha from servicios WHERE stats = 1', function(err, result){
		BD.query('SELECT s.idServicio idServicio, ts.Nombre idTipoServicio, t.Nombre idTécnico, u.Nombre idUsuario , s.Problema Problema, s.Observaciones Observaciones, s.Estatus Estatus, DATE_FORMAT(Fecha, "%d/%m/%Y") Fecha from servicios s LEFT JOIN tiposervicios ts ON s.idTipoServicio = ts.idTipoServicio LEFT JOIN técnicos t ON s.idTécnico = t.idTécnico LEFT JOIN usuarios u ON s.idUsuario = u.idUsuario WHERE stats = 1', function(err, result){
		res.send(result);
	});
});

app.get('/infoSD', login, function(req, res){
	BD.query('SELECT sd.idServDone, sd.idServicio, s.Problema, s.Observaciones, s.Estatus , DATE_FORMAT(sd.Fecha, "%d/%m/%Y") Fecha from servdone sd LEFT JOIN servicios s ON sd.idServicio = s.idServicio ORDER BY sd.idServDone DESC', function(err, result){
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
	BD.query("SELECT u.idUsuario idUsuario, u.Nombre Nombre, u.Extención Extención, u.Email Email, u.PassEmail PassEmail, c.Nombre idCliente, i.NombreEquip idInventario from usuarios u LEFT JOIN clientes c ON u.idCliente = c.idCliente LEFT JOIN inventario i ON u.idInventario = i.idInventario", function(err, result){
		res.send(result);
	});
});

app.post('/user',login,function(req, res){
	BD.query("INSERT INTO usuarios (Nombre, Extención, Email, PassEmail, idCliente, idInventario) VALUES (?,?,?,?,?,?)",[req.body.Nombre, req.body.Extencion, req.body.Email, req.body.PassEmail, req.body.idCliente, req.body.idInventario],
		function(err, result){
			if(!err){
			res.redirect('/user');
			}
		});
});

app.get('/editUser/:id', login, function(req, res){
	BD.query("SELECT * from usuarios WHERE idUsuario = ?",[req.params.id], function(err, result){
		res.send(result);
	});
});

app.post('/upUsuario',login, function(req, res){
	BD.query('UPDATE usuarios set Nombre = ?, Extención = ?, Email = ?, PassEmail = ?, idCliente = ?, idInventario = ? WHERE idUsuario = ?',[req.body.Nombre, req.body.Extencion, req.body.Email, req.body.PassEmail, req.body.idCliente, req.body.idInventario, req.body.idUsuario],
		function(err, result){
			res.redirect('/user');
		});

});

app.get('/delUser/:id', login, function(req, res){
	BD.query("DELETE from usuarios WHERE idUsuario = ?",[req.params.id], function(err, result){
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

 //============= SECCIÓN DE HISTORIAL ============================\\
app.get('/infoH', login, function(req, res){
	BD.query('SELECT h.idHistorial idHistorial, c.Nombre idCliente, u.Nombre idUsuario, h.EquipoV, h.EquipoN, DATE_FORMAT(h.Fecha, "%d/%m/%Y") Fecha from historial h LEFT JOIN clientes c ON h.idCliente = c.idCliente LEFT JOIN usuarios u ON h.idUsuario = u.idUsuario', function(err, result){
		res.send(result);
	});
});

app.post('/record',login,function(req, res){
	BD.query('INSERT INTO historial (idCliente, idUsuario, EquipoV, EquipoN, Fecha) VALUES (?,?,?,?,NOW())',[req.body.Empresa, req.body.Usuario, req.body.EquipoV, req.body.EquipoN],
		function(err, result){
			console.log(err);
			console.log(result);
			if(!err){
			res.redirect('/record');
			}
		});
});

app.get('/editHis/:id', login, function(req, res){
	BD.query("SELECT * from historial WHERE idHistorial = ?",[req.params.id], function(err, result){
		res.send(result);
	});
});

app.post('/upHis',login, function(req, res){
	BD.query('UPDATE historial set idCliente = ?, idUsuario = ?, EquipoV = ?, EquipoN = ? WHERE idHistorial = ?',[req.body.Empresa, req.body.Usuario, req.body.EquipoV, req.body.EquipoN, req.body.idHistorial],
		function(err, result){
			res.redirect('/record');
		});

});

app.get('/delHis/:id', login, function(req, res){
	BD.query("DELETE from historial WHERE idHistorial = ?",[req.params.id], function(err, result){
		if(!err){
			res.send("done");
		}else{
			res.send(err);
		}
	});
});

 //============= ERROR 404 NOT FOUND ============================\\
app.use(function(req, res, next) { 
 res.status(404).render('404', { url: req.url });
});


