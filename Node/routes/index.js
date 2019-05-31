var express = require('express');
var session = require('express-session');
var multer = require('multer');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var router = express.Router();

router.use(session({secret: 'secret',
			    resave: false,
			    saveUninitialized: true,
			    cookie: { secure: false,
			     		  path  : '/'}}));

params=[{location:'antalya', start_date:'2019-04-10', end_date:'2019-04-12'}];

const multerConfig = {
    
	storage: multer.diskStorage({
	 //Setup where the user's file will go
	 	destination: function(req, file, callback) {
	         callback(null, "./public/images");
	    },
	    filename: function(req, file, callback) {
	         callback(null, file.originalname);
	    }
	})
};

function adminOnly(req, res, next){
	if (req.session.user) {
	  	if(req.session.role != "admin"){
	  		req.session.error = 'Not authenticated to visit this page!';
	  		res.redirect('/policies');
	  	}
	  	else{
	  		next();
	  	}
  	} else {
    req.session.error = 'Please login!';
    res.redirect('/home');
  }
}

function designer(req, res, next){
	if (req.session.user) {
	  	if(req.session.role == "designer" || req.session.role == "admin"){
	  		next();
	  	}
	  	else{
	  		req.session.error = 'Not authenticated to visit this page!';
	  		res.redirect('/policies');
	  	}
  	} else {
    req.session.error = 'Please login!';
    res.redirect('/home');
  }
}

function restrict(req, res, next) {
  if (req.session.user) {
  		next();
  } else {
    req.session.error = 'Please login!';
    res.redirect('/home');
  }
}
function out(req, res, next){
	if (req.session.user) {
        req.session.destroy();
        next();
    }
    else{
    	next();
    }
}

router.get('/', function(req, res){
  res.redirect('/home');
});

router.get('/home', function(req, res, next) {
  res.render('home', {error: req.session.error});
});

router.get('/deneme', function(req, res, next) {
  res.render('denemeler', {id: req.session.user, img: req.session.img, city: req.session.city });
});

router.get('/policies', restrict, function(req, res) {
	console.log('\x1b[35m', req.session.user+" on policies");
   res.render('policies', {id: req.session.user, img: req.session.img, city: req.session.city, role: req.session.role })
});

router.get('/profile', restrict, function(req, res) {
	console.log('\x1b[35m', req.session.user+" on profile");
   res.render('profile', {id: req.session.user, img: req.session.img, city: req.session.city, role: req.session.role })
});

router.get('/users', adminOnly, function(req, res) {
	console.log('\x1b[35m', req.session.user+" on users");
   res.render('users', {id: req.session.user, img: req.session.img, city: req.session.city })
});

router.get('/parameters', designer, function(req, res) {
	console.log('\x1b[35m', req.session.user+" on parameters");
   res.render('parameters', { id: req.session.user, img: req.session.img, city: req.session.city, role: req.session.role });
});

router.get('/steps', restrict, function(req, res) {
	console.log('\x1b[35m', req.session.user+" on steps");
   res.render('steps', { id: req.session.user, img: req.session.img, city: req.session.city, role: req.session.role });
});

router.get('/messages', designer, function(req, res) {
	console.log('\x1b[35m', req.session.user+" on messages");
   res.render('messages', { id: req.session.user, img: req.session.img, city: req.session.city });
});

router.get('/logout', restrict, function(req, res) {
	console.log('\x1b[31m', req.session.user+" logged out");
	req.session.destroy();
   	res.render('home');
});

router.get('/api/search', function(req, res){
   res.send(params);
});

router.post('/api', function(req, res) {
    var loc = req.body.location;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    params.push({location: loc, start_date: start_date, end_date: end_date});
    res.setHeader("Content-Type", "application/json");
    res.redirect('/search');
});

router.post('/login', function(req, res) {
    var id = req.body.username;
    var pw = req.body.password; 

    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: ""
	});

	con.connect(function(err) {
	  if (err) throw err;
	  con.query("SELECT * FROM users WHERE UserName=?",[id], function (err, result, fields) {
	    if (err) throw err;
	    if(result.length >0){
	    	bcrypt.compare(pw, result[0].UserPassword, function(err, resul) {
			  if(resul) {
			   // Passwords match
			   	req.session.user = id;  
		    	req.session.role = result[0].role;
		    	req.session.city = result[0].city;
			    req.session.img=result[0].image;
			    console.log('\x1b[32m', req.session.user+" logged in");
			    res.redirect('/policies');
			  } else {
			   // Passwords don't match
			   	req.session.error=1;
        		res.redirect('/home');
			  } 
			});
	    	
        }
        else {
        	req.session.error=1;
        	res.redirect('/home');
        }
	  });
	});
});

router.post('/addPolicy', function(req, res) {
    var username = req.session.user;
    var policyName = req.body.policyName; 
    var cityName = req.body.cityName;
    var policyFeature = req.body.feature;
    var policyGoal = req.body.goal; 
    var policyAction = req.body.policyAction;
    var policyImpact = req.body.impact; 

    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: ""
	});

	con.connect(function(err) {
	  if (err) throw err;
	  var values= [username, policyName, policyFeature, policyGoal, policyAction, policyImpact, cityName];
	  let sql= "INSERT INTO policies (UserName, PolicyName, Features, Goals, Actions, Impacts, city) VALUES (?)";
	  con.query(sql,[values], function (err, result, fields) {
		if (err) throw err;
		res.redirect('/policies');		    
	  });
	});
});

router.post('/editPolicy', function(req, res) {
    var policyId = req.body.policyId;
    var policyName = req.body.policyName; 
    var policyFeature = req.body.feature;
    var policyGoal = req.body.goal; 
    var policyAction = req.body.policyAction;
    var policyImpact = req.body.impact; 

    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: ""
	});

	con.connect(function(err) {
	  if (err) throw err;
	  var values= [policyName, policyFeature, policyGoal, policyAction, policyImpact, policyId];
	  let sql= "UPDATE policies SET PolicyName =?, Features=?, Goals=?, Actions=?, Impacts=? WHERE ID = ?";
	  con.query(sql, values, function (err, result, fields) {
		if (err) throw err;
	  });

	  var valuescontent= [policyName, policyId];
	  let sqlcontent= "UPDATE contents SET PolicyName =? WHERE policyID = ?";
	  con.query(sqlcontent, valuescontent, function (err, result, fields) {
		if (err) throw err;
		res.redirect('/policies');		    
	  });
	});  
});

router.post('/deletePolicy', function(req, res) {
    var policyId = req.body.policyId;

    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: ""
	});

	con.connect(function(err) {
	  if (err) throw err;
	  var values= [policyId];
	  let sql= "DELETE FROM policies WHERE ID = ?";
	  con.query(sql, values, function (err, result, fields) {
		if (err) throw err;
		res.redirect('/policies');		    
	  });
	});
});

router.post('/changePassword', function(req, res) {
    var username = req.session.user;
    var oldpass = req.body.oldpassword; 
    var newpass = req.body.newpassword;

    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: ""
	});
	con.connect(function(err) {
		con.query("SELECT * FROM users WHERE UserName=?",[username], function (err, result, fields) {
	    if (err) throw err;
	    if(result.length >0){
	    	bcrypt.compare(oldpass, result[0].UserPassword, function(err, resul) {
			  if(resul) {
			   // Passwords match
			   	  bcrypt.hash(newpass, 10, function(err, hash) {
				  var values= [hash, username];
					  let sql= "Update users SET UserPassword=? WHERE UserName = ?";
					  con.query(sql,values, function (err, result, fields) {
						if (err) throw err;
						res.redirect('/profile');		    
					  });
				});
			  } else {
			   // Passwords don't match
			   	req.session.error="Your username or password is wrong2!";
        		res.redirect('/profile');
			  } 
			});
	    	
        }
        else {
        	req.session.error="Your username or password is wrong!";
        	res.redirect('/profile');
        }
	  });
	});
});

router.post('/addUser', function(req, res) {
    var UserName = req.body.UserName; 
    var UserPassword = "1234"; 
    var image = req.body.image;
    var role = req.body.role;
    var city = req.body.cityName;
    var realname = req.body.Realname;
    var surname = req.body.Surname; 
    var email = req.body.Email;

    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: ""
	});

	con.connect(function(err) {
	  if (err) throw err;
	  bcrypt.hash(UserPassword, 10, function(err, hash) {
		  var values= [UserName, hash, image, role, city, realname, surname, email];
			  let sql= "INSERT INTO users (UserName, UserPassword, image, role, city, realname, surname, email) VALUES (?)";
			  con.query(sql,[values], function (err, result, fields) {
				if (err) throw err;
				res.redirect('/users');		    
			  });
		});
	  
	});
});

router.post('/editUser', function(req, res) {
    var policyId = req.body.policyId;
    var userName = req.body.userName; 
    var role = req.body.role;
    var realname = req.body.realname; 
    var surname = req.body.surname;
    var email = req.body.email; 

    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: ""
	});

	con.connect(function(err) {
	  if (err) throw err;
	  var values= [userName, role, realname, surname, email, policyId];
	  let sql= "UPDATE users SET UserName =?, role=?, realname=?, surname=?, email=? WHERE ID = ?";
	  con.query(sql, values, function (err, result, fields) {
		if (err) throw err;
		res.redirect('/users');		    
	  });
	});
});

router.post('/deleteUser', function(req, res) {
    var policyId = req.body.policyId;

    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: ""
	});

	con.connect(function(err) {
	  if (err) throw err;
	  var values= [policyId];
	  let sql= "DELETE FROM users WHERE ID = ?";
	  con.query(sql, values, function (err, result, fields) {
		if (err) throw err;
		res.redirect('/users');		    
	  });
	});
});

module.exports = router;