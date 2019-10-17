
const express    = require('express');
const router  	 = express.Router();
const mysql   	 = require('mysql');
const md5 	  	 = require('md5');
const nodemailer = require('nodemailer');
const jwt 		 = require('jsonwebtoken');




// **********  API  *********** //

router.get('/messages', (req, res) => {
	console.log("Testing Router in users.js");
	//res.send('Re2 Testing router in Browser! (^_^) ');
	res.end();
});



/* New User Sign-Up(Step 1) + Send Verification Email */
router.post("/api/user_create_email", (req, res) => {	
	var email     = req.body.email;
	var username  = req.body.userid;
	var role 	  = req.body.role;
	var unique_id = req.body.unique_id;//id5d15c87bd4167
	var website   = "http://localhost:3000/api/user_verify_email";//req.body.website;//'www.shyamfuture.com';

	mysqlConnection.query('SELECT * FROM users WHERE email = ?', [req.body.email], (err, rows, fields)=>{			
		if(!err){
			var count = rows.length;

			//if end-user already has an account registered with SSO
			if(count){
				res.send("You already have an account! Do you want to merge your account?" + res.id);
			}

			//if end-user does not have any account registered with SSO
			else{
				mysqlConnection.query('INSERT INTO users (username, email, role) VALUES (?, ?, ?)', [username, email, role], (err, rows, fields)=>{
					if(!err){
						jwt.sign({useremail : email}, 'secretkey', (err, token) => {
								//send mail using nodemailer
								// async..await is not allowed in global scope, must use a wrapper
								async function main(){				
									console.log("Mail Send Succes!!!!");
								 	// create reusable transporter object using the default SMTP transport
								  	let transporter = nodemailer.createTransport({
									    host: "smtp.gmail.com",
									    port: 587,
									    secure: false, // true for 465, false for other ports
									    auth: {
									      user: 'shyamdemo2018@gmail.com', // generated ethereal user
									      pass: 'hjtrgqurebsusywx' // generated ethereal password
									    }
								  	});

								  	// send mail with defined transport object
								  	let info = await transporter.sendMail({
										from: 'shyamdemo2018@gmail.com', // sender address
									    to  : req.body.email, // list of receivers //, baz@example.com
									    subject: 'Verify Email', // Subject line
									//    text: "Hello world?", // plain text body
									    html: "Please <a href='"+ website +"?token="+ token +"&id="+ rows.insertId +"&unique_id="+ unique_id +"'>click here</a> to verify your email!" // html body
								  	});

								  	// console.log("Message sent: %s", info.messageId);
								  	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
								}
								main().catch(console.error);

								res.json({
									'status' : '200',
									'message': 'Verification email sent!',
									'token'	 : token
								});
							});
						
					}
					else{
						console.log(err);
					}
			 	});
			}			
		}

		//if there is an error in SQL query
		else{
			console.log(err);
		}

	});
});



/* New User Sign-Up(Step 1) + Send Verification Email */
router.post("/api/user_merge_account", (req, res) => {	
	var email     	  = req.body.email;
	var username  	  = req.body.username;
	var role 	  	  = req.body.role;
	var app_unique_id = req.body.app_unique_id;//id5d15c87bd4167
	var website       = "http://localhost:3000/api/user_verify_email";//req.body.website;//'www.shyamfuture.com';

	mysqlConnection.query('SELECT * FROM users WHERE email = ?', [req.body.email], (err, rows, fields)=>{			
		if(!err){
			var count 			  = rows.length;
			var existing_username = rows.username;


			//if end-user already has an account registered with SSO
			if(count){
				mysqlConnection.query('UPDATE users SET username = ? WHERE email = ?', [username, email], (err, rows, fields)=>{
					if(!err){
						res.json({
								'status': '200',
								'message': 'Account merged successfully. Your new username for all apps is: '+username
						});
					}
					else{
						console.log(err);
					}
				});
				//res.send("You already have an account! Do you want to merge your account?" + res.id);
			}			
		}

		//if there is an error in SQL query
		else{
			console.log(err);
		}

	});
});


/* New User Sign-Up Step-2 (When User clicks on Email Verification Link) */
router.post("/api/user_verify_email/:token/:id/:username", verifyToken, (req, res) => {
	var userid   = req.body.id;
	var username = req.body.username;

	jwt.verify(req.token, 'secretkey', (err, authData) => {
		//Set user status as "active"
		if(!err){
			// res.json({
			// 	'message': "User Verified!",
			// 	authData
			// });
			mysqlConnection.query('SELECT * FROM users WHERE id = ? AND username = ?', [userid, username], (err, rows, fields)=>{			
			if(!err){
				var count = rows.length;				

				//if end-user already has an account registered with SSO
				if(count>0){
					mysqlConnection.query('UPDATE users SET is_active = ? WHERE id = ? AND username = ?', ['1', userid, username], (err, rows, fields)=>{
						if(!err){
							res.json({
									'status'   : '200',
									'message'  : 'User email verified!',
									'userid'   : userid,
									'username' : username,
									'is_active': 'active'
							});
						}
						else{
							console.log(err);
						}
					});
				}else{
					res.json({
								'status' : '403',
								'message': 'User not found!'
							});
					}
				}
			});
		}


		//Send error response
		else{
			console.log(err);
		}
	});
});


/* New User Sign-Up Step-3 (When User enters Password) */
router.post("/api/user_create_password", (req, res) => {	
	var password = req.body.password;
	var userid   = req.body.id;

	mysqlConnection.query('UPDATE users SET password = ? WHERE id = ?', [md5(password), userid], (err, rows, fields)=>{
		if(!err){
			res.json({
					'status': '200',
					'message': 'Password created succesfully!'
			});
		}
		else{
			console.log(err);
		}
	});
});


/* Login API */
router.post("/api/user_login", (req, res) => {
	var app_id     	  = req.body.app_id;
	var app_secret	  = req.body.app_secret;
	var user_type  	  = req.body.user_type;
	var master_client = req.body.master_client;
	var email  	   	  = req.body.email ;
	var username  	  = req.body.username;
	var phone 	   	  = req.body.phone;
	var password   	  = req.body.password;
	//console.log(md5(password)); return false;
	

	/* When user will Login using email and password */
	if(email !== null && email !== '') {
		var sql = 'SELECT u.* FROM users u LEFT JOIN app_master m on u.app_unique_id = m.unique_id LEFT JOIN user_app_rel r on r.app_id = m.id WHERE u.email = ' + mysql.escape(email) + ' AND u.password = ' + mysql.escape(md5(password)) + ' AND u.app_unique_id = ' + mysql.escape(app_id) +' AND r.role = '+ mysql.escape(user_type) + ' GROUP BY u.id';


	//	var sql = 'SELECT *, users.app_unique_id as appUniqueId FROM users u WHERE `email` = ' + mysql.escape(email) + ' AND `password` = ' + mysql.escape(md5(password)) + ' AND `app_unique_id` = '+ mysql.escape(app_id) + ' LEFT JOIN app_master m on u.app_unique_id = m.unique_id LEFT JOIN user_app_rel r on r.app_id = m.id AND r.role = '+ mysql.escape(user_type) + ' ';
		//console.log(sql); return false;

		mysqlConnection.query(sql, (err, rows, fields)=>{
//		mysqlConnection.query('SELECT * FROM `users` WHERE `email` = ? AND `password` = ? AND `app_unique_id` = ?', [username, md5(password), app_id], (err, rows, fields)=>{
			if(!err){
				var count = rows.length;				
				if(count>0){
					res.json({
							'status'   : '200',
							'message'  : 'Succesfully logged in!',
							'data'	   : rows 
					});
				}else{
					res.json({
							'status'   : '200',
							'message'  : 'Please provide valid email/password !',
							'data'	   : rows
					});
				}
			}
			else{
				console.log(err);
			}
		});

	}

	/* When user will Login using username and password */
	else if(username !== null && username !== '') {
		var sql = 'SELECT u.* FROM users u LEFT JOIN app_master m on u.app_unique_id = m.unique_id LEFT JOIN user_app_rel r on r.app_id = m.id WHERE u.username = ' + mysql.escape(username) + ' AND u.password = ' + mysql.escape(md5(password)) + ' AND u.app_unique_id = ' + mysql.escape(app_id) +' AND r.role = '+ mysql.escape(user_type) + ' GROUP BY u.id';

		mysqlConnection.query(sql, (err, rows, fields)=>{
	//	mysqlConnection.query('SELECT * FROM users WHERE username = ? AND password = ? AND app_unique_id = ?', [username, md5(password), app_id], (err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					res.json({
							'status'   : '200',
							'message'  : 'Succesfully logged in!',
							'data'	   : rows 
					});
				}else{
					res.json({
							'status'   : '200',
							'message'  : 'Please provide valid username/password!',
							'data'	   : rows
					});
				}
			}
			else{
				console.log(err);
			}
		});

	}

	/* When user will Login using phone-number and password */
	else if(phone !== null && phone !== ''){
		var sql = 'SELECT u.* FROM users u LEFT JOIN app_master m on u.app_unique_id = m.unique_id LEFT JOIN user_app_rel r on r.app_id = m.id WHERE u.phone = ' + mysql.escape(phone) + ' AND u.password = ' + mysql.escape(md5(password)) + ' AND u.app_unique_id = ' + mysql.escape(app_id) +' AND r.role = '+ mysql.escape(user_type) + ' GROUP BY u.id';

	mysqlConnection.query(sql, (err, rows, fields)=>{
	//	mysqlConnection.query('SELECT * FROM users WHERE phone = ? AND password = ? AND app_unique_id = ?', [username, md5(password), app_id], (err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					res.json({
							'status'   : '200',
							'message'  : 'Succesfully logged in!',
							'data'	   : rows 
					});
				}else{
					res.json({
							'status'   : '200',
							'message'  : 'Please provide valid phone-number/password!',
							'data'	   : rows
					});
				}
			}
			else{
				console.log(err);
			}
		});
	}
});



/* Get List of Customers (clients) of an Admin Customer for a particular 3rd Party Application */
router.post("/api/customer_users_all", (req, res) => {
	//var regn_id     = req.body.userid;
	var email       = req.body.email;
	var appuniqueid = req.body.unique_app_id;
	mysqlConnection.query('SELECT * FROM users WHERE app_unique_id = ? AND email = ? AND role = ?', [appuniqueid, email, 'customer'],(err, rows, fields)=>{
		if(!err){
			//console.log(rows[0].id);
			res.send(rows);
		}
		else{
			console.log(err);
		}
	});
});


/* Get a particular user details */
router.post("/api/user_details", (req, res) => {
	var regn_id  = req.body.id;
	var email    = req.body.email;
	var phone    = req.body.phone;
	var username = req.body.username;

	mysqlConnection.query('SELECT * FROM users WHERE id = ? OR email = ? OR phone = ? OR username = ?', [regn_id, email, phone, username], (err, rows, fields)=>{
		if(!err){
			//console.log(rows[0].id);
			var count = rows.length;
			if(count>0){
				res.send(rows);
			}else{
				res.json({
					'status': '403',
					'message': 'User does not exist!'
				});
			}
		}
		else{
			console.log(err);
		}
	});
});


/* Delete a particular user */
router.post("/api/user_delete", (req, res) => {
	var app_id        = req.body.app_id;
	var app_secret    = req.body.app_secret;
	var update_type   = req.body.update_type;
	var master_client = req.body.master_client;
	var delete_type   = req.body.delete_type;
	var user_id 	  = req.body.user_id;
	var email 		  = req.body.email ;
	var phone 		  = req.body.phone_number  ;
	var username 	  = req.body.username  ;

	/* For Hard-Delete */
	if(delete_type == "hard"){
		mysqlConnection.query('DELETE FROM users WHERE id = ? OR email = ? OR phone = ? OR username = ? AND app_unique_id = ?', [user_id, email, phone, username, app_id], (err, rows, fields)=>{
			if(!err){
				res.json({
						'status'   : '200',
						'message'  : 'User deleted successfully',
				});
			}
			else{
				console.log(err);
			}
		});
	}

	/* For Soft-Delete */
	else if(delete_type == "soft"){
		mysqlConnection.query('UPDATE users SET is_deleted = ? , is_active = ? id = ? OR email = ? OR phone = ? OR username = ? AND app_unique_id = ?', ['1', '0', user_id, email, phone, username, app_id], (err, rows, fields)=>{
			if(!err){
				res.json({
						'status'   : '200',
						'message'  : 'User deleted successfully',
				});
			}
			else{
				console.log(err);
			}
		});

	}
	
});



/** Verify Token **/
function verifyToken(req, res, next){
	//FORMAT OF TOKEN
	//Authorization: Bearer <access_token>

	//Get auth header value
	const bearerHeader 	  = req.headers['authorization'];	
	//Check if bearer is undefined
	if(typeof bearerHeader !== 'undefined'){		
		const bearer      = bearerHeader.split(' '); //Split at the space		
		const bearerToken = bearer[1]; //Get access_token from array		
		req.token 		  = bearerToken; //Set the token		
		next(); //Next middleware

	}else{
		//Forbidden
		res.sendStatus(403);
	}
}




// ********  Connect to MySql ********* //
var mysqlConnection = mysql.createConnection({
	host 	 : 'localhost',
	user     : 'root',
	password : '',
	database : 'sso'
});

mysqlConnection.connect((err) => {
	if(!(err))
		console.log("DB connection succeeded");
	else
		console.log("DB Connectoin Failed! \n Error: " + JSON.stringify(err, undefined, 2));
});




// ********  EXPORTS  ********* //
module.exports = router;