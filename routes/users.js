
const express    = require('express');
const router  	 = express.Router();
const mysql   	 = require('mysql');
const md5 	  	 = require('md5');
const nodemailer = require('nodemailer');
const jwt 		 = require('jsonwebtoken');
const ids 		 = require('short-id');
//const msg91 	 = require("msg91")("293709Acw4BM9a5i5d79ef53", "CNTVRS", "4" );
const msg91 = require("msg91")("288173AUfcVTmta5d467059", "CNTVRS", "4" );




// **********  API  *********** //
router.get('/messages', (req, res) => {
	console.log("Testing Router in users.js");
	//res.send('Re2 Testing router in Browser! (^_^) ');
	res.end();
});


/* OTP for Email/Phone/Username/UserId */


/* Customer Sign-Up by Email/Phone */
router.post("/api/customer_signup", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var business_user_type  	     = req.body.business_user_type;
	var system_user_type 			 = req.body.system_user_type;
	var user_state  	   	  		 = req.body.user_state ;
	var contact_person_name  	   	 = req.body.contact_person_name ;
	var org_name  	   	  		 	 = req.body.org_name ;
	var contact_person_email  	   	 = req.body.contact_person_email ;
	var org_email  	   	  		 	 = req.body.org_email ;
	var contact_person_phone  	   	 = req.body.contact_person_phone ;
	var org_phone  	   	  		 	 = req.body.org_phone ;
	var username  	  				 = req.body.username;
	var password   	  				 = req.body.password;
	var email   	  				 = req.body.email;
	var phone   	  				 = req.body.phone;
	var provisions_to_apps   	  	 = req.body.provisions_to_apps;
	var roles   	  				 = req.body.roles;
	var groups   	  				 = req.body.groups;
	var reviews 					 = req.body.reviews;
	var card_info 					 = req.body.card_info;
	var payment_info 				 = req.body.payment_info;
	var customer_team_tbl   	  	 = req.body.customer_team_tbl;
	var customers_customer_tbl   	 = req.body.customers_customer_tbl;
	var randomNo					 = Date.now() +  Math.floor(Math.random()*(999-100+1)+100);
	var reg_id   	  				 = ids.generate();
	var registrar_app_id   	  		 = ids.generate();
	var app_table_type				 = team_table = customer_table = sqlCheck = master_client = admin_cust_id = "";
	var data 						 = [];
	var contact_person_flag = organztn_flag = signup_user_flag = user_exist_flag = false;


	/* If User_Type_Acc_to_Business_Logic == Personal_Account */
	if((business_user_type !== null) && (business_user_type !== '') && (business_user_type == '0')){
		if((contact_person_name !== null) && (contact_person_name !== '') && ((contact_person_email !== null) || (contact_person_phone !== null) || (contact_person_email !== '') || (contact_person_phone !== ''))){
			contact_person_flag = true;
		}else{
			contact_person_flag = false;
		}


	/* If User_Type_Acc_to_Business_Logic == Organizational_User */
	}else if((business_user_type !== null) && (business_user_type !== '') && (business_user_type == "1")){
		if((org_name !== null) && (org_name !== '') && ((org_email !== null) || (org_phone !== null) || (org_email !== '') || (org_phone !== ''))){
			organztn_flag = true;
		}else{
			organztn_flag = false;
		}	
	}

	/* If User_Type_Acc_to_System == Customers-Team / Customers-Client */	
	if((system_user_type !== '') && ((system_user_type == "customer_team") || (system_user_type == "customer_client"))){
		if((master_client !== null) && (master_client !== '')){
			signup_user_flag = true;
		}else{
			signup_user_flag = false;
		}
	}else if((system_user_type != "customer_team") || (system_user_type != "customer_client")){
			signup_user_flag = true;
	}

	/* If API Asks for Customer-Team-Table to be created */
	if(customer_team_tbl == "yes"){
			team_table =  "team_table_" + randomNo;
	}else{
			team_table =  "";
	}


	/* If API Asks for Customer-Team-Table to be created */
	if(customer_team_tbl == "yes"){
			team_table =  "team_table_" + randomNo;
	}else{
			team_table =  "";
	}

	/* If API Asks for Customers-Customer-Table to be created */
	if(customers_customer_tbl == "yes"){
			customer_table =  "customer_table_" + randomNo;
	}else{
			customer_table =  "";
	}

	/* Section for Inserting User Data */
	if((signup_user_flag !== false) && ((organztn_flag !== false) || (contact_person_flag !== false))){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count  	  = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
				}

				/* Check Whether User Exists or not */
				if(app_table_type != ""){
					var user_table = app_table_type + "_users";

					if((org_email !== null && org_email !== '') || (org_phone !== null && org_phone !== '')){
						sqlCheck = "SELECT * FROM "+ user_table +" WHERE (phone = '"+ phone +"' OR email = '"+ email +"' OR org_email = '"+ org_email +"' OR org_phone = '"+ org_phone +"') AND app_id = '"+ app_id_pk +"' ";

					}
					else if((contact_person_email !== null && contact_person_email !== '') || (contact_person_phone !== null && contact_person_phone !== '')){
						sqlCheck = "SELECT * FROM "+ user_table +" WHERE (phone = '"+ phone +"' OR email = '"+ email +"' OR contact_person_email = '"+ contact_person_email +"' OR contact_person_phone = '"+ contact_person_phone +"') AND app_id = '"+ app_id_pk +"' ";
					}

					mysqlConnection.query(sqlCheck,(err, rows, fields)=>{
						if(!err){
							var count = rows.length;

							/* Insert into Table if User Does Not Already Exists */
							if(count > 0){
								res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'User already exists!'
								});
							}else{
								if((contact_person_email != org_email) && (contact_person_phone != org_phone)){
									mysqlConnection.query('INSERT INTO '+ user_table +' (business_user_type, system_user_type, user_state, master_client, contact_person_name, org_name, contact_person_email, org_email, admin_cust_id, contact_person_phone, org_phone, username, password, email, phone, provisions_to_apps, roles, groups, reg_id, registrar_app_id, app_id, email_state, phone_state, reviews, card_info, payment_info, customer_team_tbl, customers_customer_tbl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?)', [business_user_type, system_user_type, user_state, master_client, contact_person_name, org_name, contact_person_email, org_email, admin_cust_id, contact_person_phone, org_phone, username, md5(password), email, phone, provisions_to_apps, roles, groups, reg_id, registrar_app_id, app_id_pk, '0', '0', reviews, card_info, payment_info, team_table, customer_table], (err, rows, fields)=>{
										if(!err){

											/* Create dynamic Customer-Team table */
											if(customer_team_tbl == "yes"){
												mysqlConnection.query("CREATE TABLE `" + team_table + "` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key', `business_user_type` enum('0','1') DEFAULT '0' COMMENT '''0''= Personal Account, ''1''=''Organizational User,''', `system_user_type` varchar(255) DEFAULT NULL COMMENT 'super_admin / super_admin_team / customer / customer_team / customer_client',`user_state` enum('0','1','2','3','4','5') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''''No Password,''2''=''Active'',''3''=''Deactivated'',''4''=''Blocked'',''5''=''Removed''',`email_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`phone_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`master_client` varchar(255) DEFAULT NULL COMMENT 'Master Client',`reg_id` varchar(255) DEFAULT NULL COMMENT 'Registration-ID (cannot be edited by API ever)',`registrar_app_id` varchar(255) DEFAULT NULL COMMENT 'Registrar-App-ID (cannot be edited by API ever)',`admin_cust_id` int(11) DEFAULT '0' COMMENT 'Admin Customer ID',`provisions_to_apps` text COMMENT 'Provisions to 3rd Party Applications (Just stores the string provided by 3rd party application ,no other meaning)',`app_id` varchar(100) DEFAULT NULL COMMENT 'Foreign Key  app_master table',`roles` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`groups` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`connected_to` enum('0','1') DEFAULT NULL COMMENT '''0''=''Personal Account'', ''1''=''Other Account''s Registration ID''',`connected_as` enum('0','1') DEFAULT NULL COMMENT '''0''=''Individual'', ''1''=''Dynamic Post Name''',`contact_person_photo` text COMMENT 'Contact Person Photo',`contact_person_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Name ',`org_name` varchar(255) DEFAULT NULL COMMENT 'Organization Name',`contact_person_email` varchar(255) DEFAULT NULL COMMENT 'Contact Person Email  (Unique Field)',`org_email` varchar(255) DEFAULT NULL COMMENT 'Organization Email (Unique Field)',`contact_person_phone` varchar(255) DEFAULT NULL COMMENT 'Contact Person Phone Number (Unique Field)',`org_phone` varchar(255) DEFAULT NULL COMMENT 'Organization Phone Number (Unique Field)',`username` varchar(255) DEFAULT NULL,`password` varchar(255) DEFAULT NULL,`email` text COMMENT 'User Email',`phone` varchar(255) DEFAULT NULL COMMENT 'User Phone Number', `org_reg_id` varchar(255) DEFAULT NULL COMMENT 'Main Operator of which organization',`dob` date DEFAULT NULL COMMENT 'Contact Person Date of Birth / Organization Establishment Date',`about_user` text COMMENT 'Information about User',`country_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Country Name', `address` text COMMENT 'Contact Person Full Address',`pincode` varchar(100) DEFAULT NULL COMMENT 'Contact Person pincode',`profile_link` text COMMENT 'User Profile Link',`gender` enum('male','female','other') DEFAULT NULL COMMENT 'User Gender (Male / Female / Other)',`election_id` varchar(100) DEFAULT NULL COMMENT 'Govt ID Proof - Election ID (Encrypted)',`election_id_img` text COMMENT 'File Upload of Election ID',`citizenship_id` varchar(255) DEFAULT NULL COMMENT 'National ID / Citizenship ID',`citizenship_id_img` text COMMENT 'File Upload of National ID / Citizenship ID',`aadhar_id` varchar(255) DEFAULT NULL COMMENT 'Biometric / Aadhar ID', `aadhar_id_img` text COMMENT 'File Upload of Biometric ID / Aadhar ID',`passport_no` varchar(255) DEFAULT NULL COMMENT 'Passport Number',`driving_license` varchar(255) DEFAULT NULL COMMENT 'Driving License',`driving_license_img` text COMMENT 'File Upload of Driving License',`trust_score` varchar(255) DEFAULT NULL COMMENT 'Trust Score of User',`wealth_score` varchar(255) DEFAULT NULL COMMENT 'Wealth Score of User',`response_score` varchar(255) DEFAULT NULL COMMENT 'Response Score Of User',`win_score` varchar(255) DEFAULT NULL COMMENT 'Win Score of User',`critical_time_score` varchar(255) DEFAULT NULL COMMENT 'Critical Time Score of User',`avg_rating` varchar(255) DEFAULT NULL COMMENT 'Average Rating of User',`total_rating` varchar(255) DEFAULT NULL COMMENT 'Total Number of Ratings of User',`reviews` varchar(255) DEFAULT NULL COMMENT 'Reviews of User', `card_info` varchar(255) DEFAULT NULL COMMENT 'Card Info of User',`payment_info` varchar(255) DEFAULT NULL COMMENT 'Payment Info of User',`login_status` enum('0','1') DEFAULT '0' COMMENT '''0''=''Not Logged In'', ''1''=''Logged In''', `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of Record Creation',`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Time of Record Updation') ENGINE=InnoDB DEFAULT CHARSET=latin1");

											}


											/* Create dynamic Customer's-Customer table */
											if(customers_customer_tbl == "yes"){
												mysqlConnection.query("CREATE TABLE `" + customer_table + "` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key', `business_user_type` enum('0','1') DEFAULT '0' COMMENT '''0''= Personal Account, ''1''=''Organizational User,''', `system_user_type` varchar(255) DEFAULT NULL COMMENT 'super_admin / super_admin_team / customer / customer_team / customer_client',`user_state` enum('0','1','2','3','4','5') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''''No Password,''2''=''Active'',''3''=''Deactivated'',''4''=''Blocked'',''5''=''Removed''',`email_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`phone_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`master_client` varchar(255) DEFAULT NULL COMMENT 'Master Client',`reg_id` varchar(255) DEFAULT NULL COMMENT 'Registration-ID (cannot be edited by API ever)',`registrar_app_id` varchar(255) DEFAULT NULL COMMENT 'Registrar-App-ID (cannot be edited by API ever)',`admin_cust_id` int(11) DEFAULT '0' COMMENT 'Admin Customer ID',`provisions_to_apps` text COMMENT 'Provisions to 3rd Party Applications (Just stores the string provided by 3rd party application ,no other meaning)',`app_id` varchar(100) DEFAULT NULL COMMENT 'Foreign Key  app_master table',`roles` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`groups` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`connected_to` enum('0','1') DEFAULT NULL COMMENT '''0''=''Personal Account'', ''1''=''Other Account''s Registration ID''',`connected_as` enum('0','1') DEFAULT NULL COMMENT '''0''=''Individual'', ''1''=''Dynamic Post Name''',`contact_person_photo` text COMMENT 'Contact Person Photo',`contact_person_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Name ',`org_name` varchar(255) DEFAULT NULL COMMENT 'Organization Name',`contact_person_email` varchar(255) DEFAULT NULL COMMENT 'Contact Person Email  (Unique Field)',`org_email` varchar(255) DEFAULT NULL COMMENT 'Organization Email (Unique Field)',`contact_person_phone` varchar(255) DEFAULT NULL COMMENT 'Contact Person Phone Number (Unique Field)',`org_phone` varchar(255) DEFAULT NULL COMMENT 'Organization Phone Number (Unique Field)',`username` varchar(255) DEFAULT NULL,`password` varchar(255) DEFAULT NULL,`email` text COMMENT 'User Email',`phone` varchar(255) DEFAULT NULL COMMENT 'User Phone Number', `org_reg_id` varchar(255) DEFAULT NULL COMMENT 'Main Operator of which organization',`dob` date DEFAULT NULL COMMENT 'Contact Person Date of Birth / Organization Establishment Date',`about_user` text COMMENT 'Information about User',`country_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Country Name', `address` text COMMENT 'Contact Person Full Address',`pincode` varchar(100) DEFAULT NULL COMMENT 'Contact Person pincode',`profile_link` text COMMENT 'User Profile Link',`gender` enum('male','female','other') DEFAULT NULL COMMENT 'User Gender (Male / Female / Other)',`election_id` varchar(100) DEFAULT NULL COMMENT 'Govt ID Proof - Election ID (Encrypted)',`election_id_img` text COMMENT 'File Upload of Election ID',`citizenship_id` varchar(255) DEFAULT NULL COMMENT 'National ID / Citizenship ID',`citizenship_id_img` text COMMENT 'File Upload of National ID / Citizenship ID',`aadhar_id` varchar(255) DEFAULT NULL COMMENT 'Biometric / Aadhar ID', `aadhar_id_img` text COMMENT 'File Upload of Biometric ID / Aadhar ID',`passport_no` varchar(255) DEFAULT NULL COMMENT 'Passport Number',`driving_license` varchar(255) DEFAULT NULL COMMENT 'Driving License',`driving_license_img` text COMMENT 'File Upload of Driving License',`trust_score` varchar(255) DEFAULT NULL COMMENT 'Trust Score of User',`wealth_score` varchar(255) DEFAULT NULL COMMENT 'Wealth Score of User',`response_score` varchar(255) DEFAULT NULL COMMENT 'Response Score Of User',`win_score` varchar(255) DEFAULT NULL COMMENT 'Win Score of User',`critical_time_score` varchar(255) DEFAULT NULL COMMENT 'Critical Time Score of User',`avg_rating` varchar(255) DEFAULT NULL COMMENT 'Average Rating of User',`total_rating` varchar(255) DEFAULT NULL COMMENT 'Total Number of Ratings of User',`reviews` varchar(255) DEFAULT NULL COMMENT 'Reviews of User', `card_info` varchar(255) DEFAULT NULL COMMENT 'Card Info of User',`payment_info` varchar(255) DEFAULT NULL COMMENT 'Payment Info of User',`login_status` enum('0','1') DEFAULT '0' COMMENT '''0''=''Not Logged In'', ''1''=''Logged In''', `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of Record Creation',`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Time of Record Updation') ENGINE=InnoDB DEFAULT CHARSET=latin1");

											}


											res.json({
													'status'   		  : '200',
													'message'         : 'success',
													'data'            : 'Successfully Signed Up!',
													'registration_id' : reg_id
											});

											/* Trigger welcome EMAIL if EMAIL not empty (START) */
											if(((contact_person_email != '') || (org_email != '')) && (email != '')){

												var nodemailer = require('nodemailer');
												var transporter = nodemailer.createTransport({
												  //service: 'gmail',
												  host: "smtp.gmail.com",
												  port: 587,
												  secure: false, // true for 465, false for other ports
												  auth: {
												     user: 'shyamdemo2018@gmail.com', // generated ethereal user
													 pass: 'hjtrgqurebsusywx' // generated ethereal password
												  }
												});

												var mailOptions = {
												  from: 'rituparna.chakraborty@shyamfuture.com',
												  to: email,
												  subject: 'Welcome!',
												  text: 'Welcome to Connectiverse!'
												};

												//console.log(mailOptions);
												transporter.sendMail(mailOptions, function(error, info){
												  if (error) {
												    console.log(error);
												  } else {
												    console.log('Email sent: ' + info.response);
												  }
												});

											}else{
												res.json({
													'status'   : '200',
													'message'  : 'error',
													'data'	   : 'Contact Person Email / Organization Email cannot be blank!'
												});
											} 
											/* Trigger welcome EMAIL if EMAIL not empty (END) */


											/* Trigger welcome SMS if PHONE-NO not empty (START) */
											if(((contact_person_phone != '') || (org_phone != '')) && (phone != '')){
												msg91.send(phone, "MESSAGE", function(err, response){
													if (err) {
												    console.log(err);
												  } else {
												    console.log('SMS sent: ' + response);
												  }
												});

											}else{
												res.json({
													'status'   : '200',
													'message'  : 'error',
													'data'	   : 'Contact Person Phone No / Organization Phone No cannot be blank!'
												});
											}
											/* Trigger welcome SMS if PHONE-NO not empty (END) */


										}else{
											console.log(err);
										}
									});
								}
								else if(contact_person_email == org_email){
									res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Contact Person Email and Organization Email cannot be same!'
									});
								}
								else if(contact_person_phone == org_phone){
									res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Contact Person Phone and Organization Phone cannot be same!'
									});
								}
							}
						}
						else{
							console.log(err);
						}
					});
				}

			}
			else{
				console.log(err);
			}
		});

	}
	else{
		res.json({
			'status'   : '200',
			'message'  : 'error',
			'data'	   : 'Please enter Master-Client information for Customer-Team / Customer-Client'
		});
	}
		
});


/* Customer-Team Sign-Up by Email */
router.post("/api/customers_member_signup", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var business_user_type  	     = req.body.business_user_type;
	var system_user_type 			 = req.body.system_user_type;
	var user_state  	   	  		 = req.body.user_state ;
	var master_client  	   	  		 = req.body.master_client ;
	var contact_person_name  	   	 = req.body.contact_person_name ;
	var org_name  	   	  		 	 = req.body.org_name ;
	var contact_person_email  	   	 = req.body.contact_person_email ;
	var org_email  	   	  		 	 = req.body.org_email ;
	var contact_person_phone  	   	 = req.body.contact_person_phone ;
	var admin_cust_id  	   	 		 = req.body.master_client ;
	// var customer_id  	   	 		 = req.body.customer_id ;
	var org_phone  	   	  		 	 = req.body.org_phone ;
	var username  	  				 = req.body.username;
	var password   	  				 = req.body.password;
	var email   	  				 = req.body.email;
	var phone   	  				 = req.body.phone;
	var provisions_to_apps   	  	 = req.body.provisions_to_apps;
	var roles   	  				 = req.body.roles;
	var groups   	  				 = req.body.groups;
	var reviews 					 = req.body.reviews;
	var card_info 					 = req.body.card_info;
	var payment_info 				 = req.body.payment_info;
	var reg_id   	  				 = ids.generate();
	var registrar_app_id   	  		 = ids.generate();
	var app_table_type				 = table = "";
	var data 						 = [];
	var contact_person_flag = organztn_flag = signup_user_flag = user_exist_flag = false;

	/* If User_Type_Acc_to_Business_Logic == Personal_Account */
	if((business_user_type !== null) && (business_user_type !== '') && (business_user_type == '0')){
		if((contact_person_name !== null) && (contact_person_name !== '') && ((contact_person_email !== null) || (contact_person_phone !== null) || (contact_person_email !== '') || (contact_person_phone !== ''))){
			contact_person_flag = true;
		}else{
			contact_person_flag = false;
		}


	/* If User_Type_Acc_to_Business_Logic == Organizational_User */
	}else if((business_user_type !== null) && (business_user_type !== '') && (business_user_type == "1")){
		if((org_name !== null) && (org_name !== '') && ((org_email !== null) || (org_phone !== null) || (org_email !== '') || (org_phone !== ''))){
			organztn_flag = true;
		}else{
			organztn_flag = false;
		}	
	}

	/* If User_Type_Acc_to_System == Customers-Team / Customers-Client */	
	if((system_user_type !== '') && ((system_user_type == "customer_team") || (system_user_type == "customer_client"))){
		if((master_client !== null) && (master_client !== '')){
			signup_user_flag = true;
		}else{
			signup_user_flag = false;
		}
	}else if((system_user_type != "customer_team") || (system_user_type != "customer_client")){
			signup_user_flag = true;
	}


	/* Section for Inserting User Data */
	if((signup_user_flag !== false) && ((organztn_flag !== false) || (contact_person_flag !== false))){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count  	  = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
				}

				/* Check Whether User Exists or not */
				if(app_table_type != ""){
					var user_table = app_table_type + "_users";
					mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE id = ? AND app_id = ?', [admin_cust_id, app_id_pk],(err, rows, fields)=>{
						if(!err){
							var count = rows.length;

							/* Insert into Table if User Does Not Already Exists */
							if(count > 0){
								/* If API System User Type is "Customer-Team" */
								if(system_user_type == "customer_team"){
										table =  rows[0].customer_team_tbl;

								/* If API System User Type is "Customer's-Customer" */
								}else if(system_user_type == "customer_client"){
										table =  rows[0].customers_customer_tbl;
								}							
								

								if((org_email !== null && org_email !== '') || (org_phone !== null && org_phone !== '')){
									sqlCheck = "SELECT * FROM "+ user_table +" WHERE (phone = '"+ phone +"' OR email = '"+ email +"' OR org_email = '"+ org_email +"' OR org_phone = '"+ org_phone +"') AND app_id = '"+ app_id_pk +"' ";

								}
								else if((contact_person_email !== null && contact_person_email !== '') || (contact_person_phone !== null && contact_person_phone !== '')){
									sqlCheck = "SELECT * FROM "+ user_table +" WHERE (phone = '"+ phone +"' OR email = '"+ email +"' OR contact_person_email = '"+ contact_person_email +"' OR contact_person_phone = '"+ contact_person_phone +"') AND app_id = '"+ app_id_pk +"' ";
								}


								if((contact_person_email != org_email) && (contact_person_phone != org_phone)){
									mysqlConnection.query('INSERT INTO `'+ table +'` (business_user_type, system_user_type, user_state, master_client, contact_person_name, org_name, contact_person_email, org_email, admin_cust_id, contact_person_phone, org_phone, username, password, email, phone, provisions_to_apps, roles, groups, reg_id, registrar_app_id, app_id, email_state, phone_state, reviews, card_info, payment_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?)', [business_user_type, system_user_type, user_state, master_client, contact_person_name, org_name, contact_person_email, org_email, admin_cust_id, contact_person_phone, org_phone, username, md5(password), email, phone, provisions_to_apps, roles, groups, reg_id, registrar_app_id, app_id_pk, '0', '0', reviews, card_info, payment_info], (err, rows, fields)=>{
										if(!err){
											res.json({
													'status'   		  : '200',
													'message'         : 'success',
													'data'            : 'Successfully Signed Up!',
													'registration_id' : reg_id
											});

											/* Trigger welcome EMAIL if EMAIL not empty (START) */
											if(((contact_person_email != '') || (org_email != '')) && (email != '')){

												var nodemailer = require('nodemailer');
												var transporter = nodemailer.createTransport({
												  //service: 'gmail',
												  host: "smtp.gmail.com",
												  port: 587,
												  secure: false, // true for 465, false for other ports
												  auth: {
												     user: 'shyamdemo2018@gmail.com', // generated ethereal user
													 pass: 'hjtrgqurebsusywx' // generated ethereal password
												  }
												});

												var mailOptions = {
												  from: 'rituparna.chakraborty@shyamfuture.com',
												  to: email,
												  subject: 'Welcome!',
												  text: 'Welcome to Connectiverse!'
												};

												//console.log(mailOptions);
												transporter.sendMail(mailOptions, function(error, info){
												  if (error) {
												    console.log(error);
												  } else {
												    console.log('Email sent: ' + info.response);
												  }
												});

											}else{
												res.json({
													'status'   : '200',
													'message'  : 'error',
													'data'	   : 'Contact Person Email / Organization Email cannot be blank!'
												});
											} 
											/* Trigger welcome EMAIL if EMAIL not empty (END) */


											/* Trigger welcome SMS if PHONE-NO not empty (START) */
											if(((contact_person_phone != '') || (org_phone != '')) && (phone != '')){
												msg91.send(phone, "Conectvrse-WELCOME", function(err, response){
													if (err) {
												    console.log(err);
												  } else {
												    console.log('SMS sent: ' + response);
												  }
												});

											}else{
												res.json({
													'status'   : '200',
													'message'  : 'error',
													'data'	   : 'Contact Person Phone No / Organization Phone No cannot be blank!'
												});
											}
											/* Trigger welcome SMS if PHONE-NO not empty (END) */


										}else{
											console.log(err);
										}
									});
								}
								else if(contact_person_email == org_email){
									res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Contact Person Email and Organization Email cannot be same!'
									});
								}
								else if(contact_person_phone == org_phone){
									res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Contact Person Phone and Organization Phone cannot be same!'
									});
								}
							}
						}
						else{
							console.log(err);
						}
					});
				}

			}
			else{
				console.log(err);
			}
		});

	}
	else{
		res.json({
			'status'   : '200',
			'message'  : 'error',
			'data'	   : 'Please enter Master-Client information for Customer-Team / Customer-Client'
		});
	}
		
});


/* Customer Team / Customer's-Customer Tables Create Separately */
router.post("/api/customers_member_table_create", (req, res) => { 
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var master_client_reg_id  	   	 = req.body.master_client_reg_id ;
	var admin_cust_reg_id  	   	 	 = req.body.master_client_reg_id ;
	var customer_team_tbl   	  	 = req.body.customer_team_tbl;
	var customers_customer_tbl   	 = req.body.customers_customer_tbl;
	var randomNo					 = Date.now() +  Math.floor(Math.random()*(999-100+1)+100);
	var reg_id   	  				 = ids.generate();
	var registrar_app_id   	  		 = ids.generate();
	var app_table_type				 = team_table = customer_table = "";
	var data 						 = [];
	var contact_person_flag = organztn_flag = signup_user_flag = user_exist_flag = false;


	/* If API Asks for Customer-Team-Table to be created */
	if(customer_team_tbl == "yes"){
			team_table  =  "team_table_" + randomNo;
	}

	/* If API Asks for Customers-Customer-Table to be created */
	if(customers_customer_tbl == "yes"){
			customer_table 	=  "customer_table_" + randomNo;
	}

	/* Section for Inserting User Data */
	if(admin_cust_reg_id != ""){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
				}

				/* Check Whether User Exists or not */
				if(app_table_type != ""){
					var user_table = app_table_type + "_users";
					mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE reg_id = ? AND app_id = ?', [admin_cust_reg_id, app_id_pk],(err, rows, fields)=>{
						if(!err){
							var count = rows.length;
							var admin_cust_id = rows[0].id;

							/* Insert into Table if User Does Not Already Exists */
							if(count > 0){

										/** FOR CUSTOMER'S TEAM DATA ENTRY ***/
										if(customer_team_tbl == "yes"){
											/* Update Customer Table Record */
											mysqlConnection.query("UPDATE "+ user_table +" SET customer_team_tbl = '"+ team_table +"' WHERE id = '"+ admin_cust_id +"' ");

											/* Create Customer-Team table dynamically */
											mysqlConnection.query("CREATE TABLE `" + team_table + "` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key', `business_user_type` enum('0','1') DEFAULT '0' COMMENT '''0''= Personal Account, ''1''=''Organizational User,''', `system_user_type` varchar(255) DEFAULT NULL COMMENT 'super_admin / super_admin_team / customer / customer_team / customer_client',`user_state` enum('0','1','2','3','4','5') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''''No Password,''2''=''Active'',''3''=''Deactivated'',''4''=''Blocked'',''5''=''Removed''',`email_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`phone_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`master_client` varchar(255) DEFAULT NULL COMMENT 'Master Client',`reg_id` varchar(255) DEFAULT NULL COMMENT 'Registration-ID (cannot be edited by API ever)',`registrar_app_id` varchar(255) DEFAULT NULL COMMENT 'Registrar-App-ID (cannot be edited by API ever)',`admin_cust_id` int(11) DEFAULT '0' COMMENT 'Admin Customer ID',`provisions_to_apps` text COMMENT 'Provisions to 3rd Party Applications (Just stores the string provided by 3rd party application ,no other meaning)',`app_id` varchar(100) DEFAULT NULL COMMENT 'Foreign Key  app_master table',`roles` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`groups` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`connected_to` enum('0','1') DEFAULT NULL COMMENT '''0''=''Personal Account'', ''1''=''Other Account''s Registration ID''',`connected_as` enum('0','1') DEFAULT NULL COMMENT '''0''=''Individual'', ''1''=''Dynamic Post Name''',`contact_person_photo` text COMMENT 'Contact Person Photo',`contact_person_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Name ',`org_name` varchar(255) DEFAULT NULL COMMENT 'Organization Name',`contact_person_email` varchar(255) DEFAULT NULL COMMENT 'Contact Person Email  (Unique Field)',`org_email` varchar(255) DEFAULT NULL COMMENT 'Organization Email (Unique Field)',`contact_person_phone` varchar(255) DEFAULT NULL COMMENT 'Contact Person Phone Number (Unique Field)',`org_phone` varchar(255) DEFAULT NULL COMMENT 'Organization Phone Number (Unique Field)',`username` varchar(255) DEFAULT NULL,`password` varchar(255) DEFAULT NULL,`email` text COMMENT 'User Email',`phone` varchar(255) DEFAULT NULL COMMENT 'User Phone Number', `org_reg_id` varchar(255) DEFAULT NULL COMMENT 'Main Operator of which organization',`dob` date DEFAULT NULL COMMENT 'Contact Person Date of Birth / Organization Establishment Date',`about_user` text COMMENT 'Information about User',`country_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Country Name', `address` text COMMENT 'Contact Person Full Address',`pincode` varchar(100) DEFAULT NULL COMMENT 'Contact Person pincode',`profile_link` text COMMENT 'User Profile Link',`gender` enum('male','female','other') DEFAULT NULL COMMENT 'User Gender (Male / Female / Other)',`election_id` varchar(100) DEFAULT NULL COMMENT 'Govt ID Proof - Election ID (Encrypted)',`election_id_img` text COMMENT 'File Upload of Election ID',`citizenship_id` varchar(255) DEFAULT NULL COMMENT 'National ID / Citizenship ID',`citizenship_id_img` text COMMENT 'File Upload of National ID / Citizenship ID',`aadhar_id` varchar(255) DEFAULT NULL COMMENT 'Biometric / Aadhar ID', `aadhar_id_img` text COMMENT 'File Upload of Biometric ID / Aadhar ID',`passport_no` varchar(255) DEFAULT NULL COMMENT 'Passport Number',`driving_license` varchar(255) DEFAULT NULL COMMENT 'Driving License',`driving_license_img` text COMMENT 'File Upload of Driving License',`trust_score` varchar(255) DEFAULT NULL COMMENT 'Trust Score of User',`wealth_score` varchar(255) DEFAULT NULL COMMENT 'Wealth Score of User',`response_score` varchar(255) DEFAULT NULL COMMENT 'Response Score Of User',`win_score` varchar(255) DEFAULT NULL COMMENT 'Win Score of User',`critical_time_score` varchar(255) DEFAULT NULL COMMENT 'Critical Time Score of User',`avg_rating` varchar(255) DEFAULT NULL COMMENT 'Average Rating of User',`total_rating` varchar(255) DEFAULT NULL COMMENT 'Total Number of Ratings of User',`reviews` varchar(255) DEFAULT NULL COMMENT 'Reviews of User', `card_info` varchar(255) DEFAULT NULL COMMENT 'Card Info of User',`payment_info` varchar(255) DEFAULT NULL COMMENT 'Payment Info of User',`login_status` enum('0','1') DEFAULT '0' COMMENT '''0''=''Not Logged In'', ''1''=''Logged In''', `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of Record Creation',`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Time of Record Updation') ENGINE=InnoDB DEFAULT CHARSET=latin1");
										}

										

										/** FOR CUSTOMER'S CUSTOMER DATA ENTRY ***/
										if(customers_customer_tbl == "yes"){
											/* Update Customer Table Record */
											mysqlConnection.query("UPDATE "+ user_table +" SET customers_customer_tbl = '"+ customer_table +"' WHERE id = '"+ admin_cust_id +"' ");

											/* Create dynamic Customer's-Customer table */
											mysqlConnection.query("CREATE TABLE `" + customer_table + "` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key', `business_user_type` enum('0','1') DEFAULT '0' COMMENT '''0''= Personal Account, ''1''=''Organizational User,''', `system_user_type` varchar(255) DEFAULT NULL COMMENT 'super_admin / super_admin_team / customer / customer_team / customer_client',`user_state` enum('0','1','2','3','4','5') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''''No Password,''2''=''Active'',''3''=''Deactivated'',''4''=''Blocked'',''5''=''Removed''',`email_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`phone_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`master_client` varchar(255) DEFAULT NULL COMMENT 'Master Client',`reg_id` varchar(255) DEFAULT NULL COMMENT 'Registration-ID (cannot be edited by API ever)',`registrar_app_id` varchar(255) DEFAULT NULL COMMENT 'Registrar-App-ID (cannot be edited by API ever)',`admin_cust_id` int(11) DEFAULT '0' COMMENT 'Admin Customer ID',`provisions_to_apps` text COMMENT 'Provisions to 3rd Party Applications (Just stores the string provided by 3rd party application ,no other meaning)',`app_id` varchar(100) DEFAULT NULL COMMENT 'Foreign Key  app_master table',`roles` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`groups` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`connected_to` enum('0','1') DEFAULT NULL COMMENT '''0''=''Personal Account'', ''1''=''Other Account''s Registration ID''',`connected_as` enum('0','1') DEFAULT NULL COMMENT '''0''=''Individual'', ''1''=''Dynamic Post Name''',`contact_person_photo` text COMMENT 'Contact Person Photo',`contact_person_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Name ',`org_name` varchar(255) DEFAULT NULL COMMENT 'Organization Name',`contact_person_email` varchar(255) DEFAULT NULL COMMENT 'Contact Person Email  (Unique Field)',`org_email` varchar(255) DEFAULT NULL COMMENT 'Organization Email (Unique Field)',`contact_person_phone` varchar(255) DEFAULT NULL COMMENT 'Contact Person Phone Number (Unique Field)',`org_phone` varchar(255) DEFAULT NULL COMMENT 'Organization Phone Number (Unique Field)',`username` varchar(255) DEFAULT NULL,`password` varchar(255) DEFAULT NULL,`email` text COMMENT 'User Email',`phone` varchar(255) DEFAULT NULL COMMENT 'User Phone Number', `org_reg_id` varchar(255) DEFAULT NULL COMMENT 'Main Operator of which organization',`dob` date DEFAULT NULL COMMENT 'Contact Person Date of Birth / Organization Establishment Date',`about_user` text COMMENT 'Information about User',`country_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Country Name', `address` text COMMENT 'Contact Person Full Address',`pincode` varchar(100) DEFAULT NULL COMMENT 'Contact Person pincode',`profile_link` text COMMENT 'User Profile Link',`gender` enum('male','female','other') DEFAULT NULL COMMENT 'User Gender (Male / Female / Other)',`election_id` varchar(100) DEFAULT NULL COMMENT 'Govt ID Proof - Election ID (Encrypted)',`election_id_img` text COMMENT 'File Upload of Election ID',`citizenship_id` varchar(255) DEFAULT NULL COMMENT 'National ID / Citizenship ID',`citizenship_id_img` text COMMENT 'File Upload of National ID / Citizenship ID',`aadhar_id` varchar(255) DEFAULT NULL COMMENT 'Biometric / Aadhar ID', `aadhar_id_img` text COMMENT 'File Upload of Biometric ID / Aadhar ID',`passport_no` varchar(255) DEFAULT NULL COMMENT 'Passport Number',`driving_license` varchar(255) DEFAULT NULL COMMENT 'Driving License',`driving_license_img` text COMMENT 'File Upload of Driving License',`trust_score` varchar(255) DEFAULT NULL COMMENT 'Trust Score of User',`wealth_score` varchar(255) DEFAULT NULL COMMENT 'Wealth Score of User',`response_score` varchar(255) DEFAULT NULL COMMENT 'Response Score Of User',`win_score` varchar(255) DEFAULT NULL COMMENT 'Win Score of User',`critical_time_score` varchar(255) DEFAULT NULL COMMENT 'Critical Time Score of User',`avg_rating` varchar(255) DEFAULT NULL COMMENT 'Average Rating of User',`total_rating` varchar(255) DEFAULT NULL COMMENT 'Total Number of Ratings of User',`reviews` varchar(255) DEFAULT NULL COMMENT 'Reviews of User', `card_info` varchar(255) DEFAULT NULL COMMENT 'Card Info of User',`payment_info` varchar(255) DEFAULT NULL COMMENT 'Payment Info of User',`login_status` enum('0','1') DEFAULT '0' COMMENT '''0''=''Not Logged In'', ''1''=''Logged In''', `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of Record Creation',`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Time of Record Updation') ENGINE=InnoDB DEFAULT CHARSET=latin1");
										}


										res.json({
												'status'   		  : '200',
												'message'         : 'success',
												'data'            : 'Table created successfully!',
										});


							}
							else{
								res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Customer does not exist!'
									});
							}

						}
						else{
							console.log(err);
						}
					});
				}

			}
			else{
				console.log(err);
			}
		});

	}
	else{
		res.json({
			'status'   : '200',
			'message'  : 'error',
			'data'	   : 'Please enter Master-Client information for Customer-Team / Customer-Client'
		});
	}
		
});


/* Send Forgot-Password OTP */
router.post('/api/send_otp', (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client_reg_id  	   	 = req.body.master_client_reg_id ;
	var username  	  				 = req.body.username;
	var email   	  				 = req.body.email;
	var phone   	  				 = req.body.phone;
	var otp = Math.floor(1000 + Math.random() * 9000);

		if(email != ''){
				var nodemailer = require('nodemailer');
				var transporter = nodemailer.createTransport({
				  //service: 'gmail',
				  host: "smtp.gmail.com",
				  port: 587,
				  secure: false, // true for 465, false for other ports
				  auth: {
				     user: 'shyamdemo2018@gmail.com', // generated ethereal user
					 pass: 'hjtrgqurebsusywx' // generated ethereal password
				  }
				});

				var mailOptions = {
				  from   : 'rituparna.chakraborty@shyamfuture.com',
				  to     : email,
				  subject: 'OTP (Connectiverse)',
				  text   : 'Your OTP is :'+otp
				};

				transporter.sendMail(mailOptions, function(error, info){
				  if (error) {
				    console.log(error);
				  } else {
				    console.log('Email sent: ' + info.response);
				  }
				});
				res.json({
					'status'   : '200',
					'message'  : 'success',
					'data'	   : {"otp" : otp}
				});

		}

		else if(phone != ''){
			//console.log("Phone is working");
			//var msg91 = require("msg91")("288173AUfcVTmta5d467059", "CAR001", "4" );
			// var msg91 	 = require("msg91")("293709Acw4BM9a5i5d79ef53", "CNTVRS", "4" );
				msg91.send(phone, "Your OTP is: "+otp, function(err, response){
				    // console.log(err);
				    // console.log(response);
				    res.json({
						'status'   : '200',
						'message'  : 'success',
						'data'	   : {"otp" : otp}
					});
				});

		}
		else{
			res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Email-Id / Phone-number cannot be blank!'
			});
		}

});


/* Update Password for Forgot Password */
router.post('/api/update_forgot_password', (req, res) => {
	var app_id     	  		 = req.body.app_id;
	var app_secret	  	     = req.body.app_secret;
	var system_user_type     = req.body.system_user_type;
	var master_client_reg_id = req.body.master_client_reg_id ;
	var admin_cust_reg_id 	 = req.body.master_client_reg_id ;
	var username  	  	     = req.body.username;
	var email   	  	     = req.body.email;
	var phone   	  		 = req.body.phone;
	var password   	  		 = req.body.password;
	//var otp = Math.floor(1000 + Math.random() * 9000);

	if((email != '') || (phone != '')){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
					var user_table = app_table_type + "_users";
				}
			}
			else{
				console.log(err);
			}

			/* If user is Admin-Customer (start)*/
			if((system_user_type == "customer") && ((username !== '') || (email !== '') || (phone !== '')) ){
				/* Check Whether Customer Exists or not */
				if(app_table_type != ""){
					var user_table = app_table_type + "_users";
					mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE username = ? AND (email = ? OR phone = ?) AND FIND_IN_SET(?, app_id)>0', [username, email, phone, app_id_pk],(err, rows, fields)=>{
						if(!err){
							var count = rows.length;

							/* Successfully Update Password */
							if(count > 0){
								var user_id_pk  = rows[0].id;
								mysqlConnection.query('UPDATE '+ user_table +' SET password = ? WHERE id = ?', [md5(password), user_id_pk], (err, rows, fields)=>{
									if(!err){
										res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : 'Password updated successfully!'
										});
									}
									else{
										console.log(err);
									}
								});


								
							}else{
								res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Please provide correct email-id / phone-number !'
								});
							}
						}
						else{
							console.log(err);
						}
					});
				}
				/* Update Password for Customer (end) */
			}
			/* If user is Admin-Customer (end)*/

			/* If user is Customer-Team / Customer's-customer (start)*/
			else if(((system_user_type == "customer_team") || (system_user_type == "customer_client")) && ((username !== '') || (email !== '') || (phone !== '')) && (admin_cust_reg_id !== '')){
				/* Check if User with provided credentials exists */
				mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					if(!err){
						var count_admin_user = rows.length;
						var customer_id 	 = rows[0].id;
						if(count_admin_user > 0){
							/* Select Table */
							if(system_user_type == "customer_team"){
								var selected_table = rows[0].customer_team_tbl;

							}else if(system_user_type == "customer_client"){
								var selected_table = rows[0].customers_customer_tbl;
							}
						//}

						if(count_admin_user > 0){
							/* Check whether Customer-Team Member / Customer's-customer exists */
							mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE username = ? AND (email = ? OR phone = ?) AND FIND_IN_SET(?, app_id)>0 AND admin_cust_id = ?', [username, email, phone, app_id_pk, customer_id],(err, rows, fields)=>{
								if(!err){
									var count   = rows.length;
									
									if(count>0){
										var user_id = rows[0].id;
										/* MySQL Update Query */
										mysqlConnection.query('UPDATE '+ selected_table +' SET password = ? WHERE id = ?', [md5(password), user_id], (err, rows, fields)=>{
											if(!err){
												res.json({
														'status'   : '200',
														'message'  : 'success',
														'data'	   : 'Password updated successfully!'
												});
											}
											else{
												console.log(err);
											}
										});
									}else{
										res.json({
												'status'   : '200',
												'message'  : 'error',
												'data'	   : 'Please provide correct email-id / phone-number / password / admin-customer-registration-id!'
										});
									}
									
								}else{
									console.log(err);
								}
							});								
						}else{
							res.json({
									'status'   : '200',
									'message'  : 'error',
									'data'	   : 'Please provide correct master-client / admin-user-id!'
							});
						}
						/* If user is Customer-Team / Customer's-customer (start)*/

						/* If User with provided credentials does not exist */
						}else{
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Admin-User does not exist!'
							});
						}

					}else{
						console.log(err);
					}
				});

			}
			/* If user is Customer-Team / Customer's-customer (end)*/

		});
	}else{
		res.json({
				'status'   : '200',
				'message'  : 'error',
				'data'	   : 'Email-Id / Phone-number cannot be blank!'
		});
	}

});


/* Login by Email/Username/Phone and Password */
router.post("/api/login_by_password", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client_reg_id 	   	 = req.body.master_client_reg_id;
	var admin_cust_reg_id 			 = req.body.master_client_reg_id;
	var username  	  				 = req.body.username;
	var password   	  				 = req.body.password;
	var email   	  				 = req.body.email;
	var phone   	  				 = req.body.phone;
	var data 						 = [];
	
	if((email != '') || (username != '') || (phone != '')){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
					var user_table = app_table_type + "_users";
				}

				/* When Log-in User-type is Customer */
				if(user_table != "" && system_user_type == "customer"){					
					// mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE (contact_person_email = ? OR org_email = ? OR contact_person_phone = ? OR org_phone = ? OR username = ?) AND password = ? AND app_id = ?', [email, email, phone, phone, username, md5(password), app_id_pk],(err, rows, fields)=>{

					/* Check Whether Customer Exists or not */
					mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE (email = ? OR phone = ? OR username = ?) AND password = ? AND FIND_IN_SET("'+ app_id_pk +'", app_id)', [email, phone, username, md5(password)], (err, rows, fields)=>{
						if(!err){
							var count = rows.length;

							/* Successfully Log-In */
							if(count > 0){
								var user_id = rows[0].id;
								mysqlConnection.query('UPDATE '+ user_table +' SET login_status = ? WHERE reg_id = ? OR email = ? OR phone = ? OR username = ?', ['1', user_id, email, phone, username], (err, rows, fields)=>{
									if(!err){
										res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : 'Succesfully logged in!'
										});
									}
									else{
										console.log(err);
									}
								});
								
							}else{
								res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Please provide correct email-id / phone-number / password!'
								});
							}
						}
						else{
							console.log(err);
						}
					});
				}

				/* When Log-in User-type is Customer-Team / Customer's-Customer */				
				else if(user_table !== '' && admin_cust_reg_id !== "" && admin_cust_reg_id !== null && (system_user_type == "customer_team" || system_user_type == "customer_client")){
					/* Check Whether Customer-Team Member / Customer's-Customer Exists or not */
					mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" ',(err, rows, fields)=>{
						if(!err){
							var count_admin_user = rows.length;
							var customer_id = rows[0].id;
							/* Select the table */
							if(system_user_type == "customer_team"){
								selected_table = rows[0].customer_team_tbl;

							}else if(system_user_type == "customer_client"){
								selected_table = rows[0].customers_customer_tbl;
							}

							if(count_admin_user > 0){
								/* Successfully Log-In */
								mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE (email = ? OR phone = ? OR username = ?) AND password = ? AND admin_cust_id = ? AND FIND_IN_SET("'+ app_id_pk +'", app_id)', [email, phone, username, md5(password), customer_id], (err, rows, fields)=>{
									if(!err){
										var count = rows.length;

										if(count>0){
											var member_id = rows[0].id;
											mysqlConnection.query('UPDATE '+ selected_table +' SET login_status = ? WHERE id = ?', ['1', member_id], (err, rows, fields)=>{
												if(!err){
													res.json({
															'status'   : '200',
															'message'  : 'success',
															'data'	   : 'Succesfully logged in!'
													});
												}
												else{
													console.log(err);
												}
											});
										}else{
											res.json({
													'status'   : '200',
													'message'  : 'error',
													'data'	   : 'Please provide correct email-id / phone-number / password!'
											});
										}
										
									}else{
										console.log(err);
									}
								});								
							}else{
								res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Please provide correct master-client / admin-user-id!'
								});
							}
						}

						else{
							console.log(err);
						}
					});
				}

				/* If Incorrect App-ID / App-Secret is provided by API */
				else{
						res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Please provide correct App-id / App-secret!'
						});
				}

			}
			else{
				console.log(err);
			}
		});

	}
	else{
		res.json({
				'status'   : '200',
				'message'  : 'error',
				'data'	   : 'Email-id / Phone number cannot be blank !'
		});
	}

});

/* Login by Email/Username/Phone and Password */
router.post("/api/login_by_otp", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client_reg_id 	   	 = req.body.master_client_reg_id;
	var admin_cust_reg_id 			 = req.body.master_client_reg_id;
	var username  	  				 = req.body.username;
	var email   	  				 = req.body.email;
	var phone   	  				 = req.body.phone;
	var data 						 = [];
	
	if((email != '') || (username != '') || (phone != '')){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
					var user_table = app_table_type + "_users";
				}

				/* When Log-in User-type is Customer */
				if(user_table != "" && system_user_type == "customer"){					
					// mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE (contact_person_email = ? OR org_email = ? OR contact_person_phone = ? OR org_phone = ? OR username = ?) AND password = ? AND app_id = ?', [email, email, phone, phone, username, md5(password), app_id_pk],(err, rows, fields)=>{

					/* Check Whether Customer Exists or not */
					mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE (email = ? OR phone = ? OR username = ?) AND FIND_IN_SET("'+ app_id_pk +'", app_id)', [email, phone, username], (err, rows, fields)=>{
						if(!err){
							var count = rows.length;

							/* Successfully Log-In */
							if(count > 0){
								var user_id = rows[0].id;
								mysqlConnection.query('UPDATE '+ user_table +' SET login_status = ? WHERE reg_id = ? OR email = ? OR phone = ? OR username = ?', ['1', user_id, email, phone, username], (err, rows, fields)=>{
									if(!err){
										res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : 'Succesfully logged in!'
										});
									}
									else{
										console.log(err);
									}
								});
								
							}else{
								res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Please provide correct email-id / phone-number / password!'
								});
							}
						}
						else{
							console.log(err);
						}
					});
				}

				/* When Log-in User-type is Customer-Team / Customer's-Customer */				
				else if(user_table !== '' && admin_cust_reg_id !== "" && admin_cust_reg_id !== null && (system_user_type == "customer_team" || system_user_type == "customer_client")){
					/* Check Whether Customer-Team Member / Customer's-Customer Exists or not */
					mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" ',(err, rows, fields)=>{
						if(!err){
							var count_admin_user = rows.length;
							var customer_id = rows[0].id;
							/* Select the table */
							if(system_user_type == "customer_team"){
								selected_table = rows[0].customer_team_tbl;

							}else if(system_user_type == "customer_client"){
								selected_table = rows[0].customers_customer_tbl;
							}

							if(count_admin_user > 0){
								/* Successfully Log-In */
								mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE (email = ? OR phone = ? OR username = ?) AND admin_cust_id = ? AND FIND_IN_SET("'+ app_id_pk +'", app_id)', [email, phone, username, customer_id], (err, rows, fields)=>{
									if(!err){
										var count = rows.length;

										if(count>0){
											var member_id = rows[0].id;
											mysqlConnection.query('UPDATE '+ selected_table +' SET login_status = ? WHERE id = ?', ['1', member_id], (err, rows, fields)=>{
												if(!err){
													res.json({
															'status'   : '200',
															'message'  : 'success',
															'data'	   : 'Succesfully logged in!'
													});
												}
												else{
													console.log(err);
												}
											});
										}else{
											res.json({
													'status'   : '200',
													'message'  : 'error',
													'data'	   : 'Please provide correct email-id / phone-number / password!'
											});
										}
										
									}else{
										console.log(err);
									}
								});								
							}else{
								res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Please provide correct master-client / admin-user-id!'
								});
							}
						}

						else{
							console.log(err);
						}
					});
				}

				/* If Incorrect App-ID / App-Secret is provided by API */
				else{
						res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Please provide correct App-id / App-secret!'
						});
				}

			}
			else{
				console.log(err);
			}
		});

	}
	else{
		res.json({
				'status'   : '200',
				'message'  : 'error',
				'data'	   : 'Email-id / Phone number cannot be blank !'
		});
	}

});

/* Get Logged-In Users on a 3rd Party Application */
router.post("/api/logged_in_users", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client_reg_id 		 = req.body.master_client_reg_id;
	var admin_cust_reg_id 			 = req.body.master_client_reg_id;
	var selected_table				 = "";
	var data 						 = [];

	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type = rows[0].table_type;
				var app_id_pk  = rows[0].id;
			}		
			var users_table = app_table_type + "_users";

			/* List of Logged-in Customers */
			if(users_table !== '' && system_user_type == "customer"){
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE FIND_IN_SET("'+ app_id_pk +'", app_id) AND user_state = ? AND login_status = ?', ['2', '1'],(err, rows, fields)=>{
						if(!err){
							var count = rows.length;
							if(count>0){
								res.json({
									'status'   : '200',
									'message'  : 'success',
									'data'	   : rows
								});
							}else{
								res.json({
									'status'   : '200',
									'message'  : 'There are no logged-in users!',
									'data'	   : []
								});
							}
						}
						else{
							console.log(err);
						}
				});

			}


			/* List of Logged-in Customer-Team Members / Customer's-Customers */
			else if(users_table !== '' && admin_cust_reg_id !== "" && admin_cust_reg_id !== null && (system_user_type == "customer_team" || system_user_type == "customer_client")){
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					if(!err){
						var customer_id = rows[0].id;

						/* Select the table */
						if(system_user_type == "customer_team"){
							selected_table = rows[0].customer_team_tbl;

						}else if(system_user_type == "customer_client"){
							selected_table = rows[0].customers_customer_tbl;
						}
						
						mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE FIND_IN_SET("'+ app_id_pk +'", app_id) AND user_state = ? AND login_status = ?', ['2', '1'], (err, rows, fields)=>{
							if(!err){
								var count = rows.length;
								if(count>0){
									res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : rows
									});

								}else{
										res.json({
											'status'   : '200',
											'message'  : 'There are no logged-in users!',
											'data'	   : []
										});
								}
							}
							else{
								console.log(err);
							}
						});

					}else{
						console.log(err);
					}

				});
			}


			/* If Incorrect App-ID / App-Secret is provided by API */
			else{
					res.json({
							'status'   : '200',
							'message'  : 'error',
							'data'	   : 'Please provide correct App-id / App-secret!'
					});
			}


		}else{
			console.log(err);
		}
	});

});

/* Search User / Get Profile Data */
router.post("/api/search_cust_user", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client  	   	  		 = req.body.master_client;
	var colms_to_search   			 = req.body.colms_to_search;//coulums to be searched - may be 'all'/specific columns
	var val_to_search   			 = req.body.val_to_search;//the value to be searched
	var type_of_search   			 = req.body.type_of_search;//may be 'partial'/'exact'
	var output_requirement   		 = req.body.output_requirement;//may be 'all'/'boolean'/specific Columns
	var app_table_type				 = app_permission = sqlQryExact = sqlQryPartial = sensitiveColms = sensitiveColmsNew = nonSensitiveColmsList = nonSensitiveColmsListNew = non_sensitive_colm = non_sensitive_colm_output = "";
	var data = sensitive_data_colms = arr = arr1 = arr2 = [];
	var arr1 = [];
	var contact_person_flag = organztn_flag = signup_user_flag = user_exist_flag = false;



	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = "'+ app_id +'" AND app_secret = "'+ app_secret +'" ', (err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type  = rows[0].table_type;
				var app_id_pk   = rows[0].id;
				app_permission  = rows[0].permission;	
				var users_table = app_table_type + "_users";

				var colmns_arr  = colms_to_search.split(",");
					colmns_arr.forEach((v) => {
						sqlQryExact     = sqlQryExact + v + " = '" + val_to_search + "' OR ";
						sqlQryPartial 	= sqlQryPartial + v + " LIKE '%" + val_to_search + "%' OR ";
					});
		 		// var sqlQryNewExact   = sqlQryExact.substring(0,sqlQryExact.length -3) + " AND app_id = '"+ app_id_pk +"' ";
		 		// var sqlQryNewPartial = sqlQryPartial.substring(0,sqlQryPartial.length -3)+ " AND app_id = '"+ app_id_pk +"' ";
				//FIND_IN_SET("'+app_id_pk+'", app_id)
				var sqlQryNewExact   = sqlQryExact.substring(0,sqlQryExact.length -3) + " AND FIND_IN_SET('"+app_id_pk+"', app_id) ";
		 		var sqlQryNewPartial = sqlQryPartial.substring(0,sqlQryPartial.length -3)+ " AND FIND_IN_SET('"+app_id_pk+"', app_id) ";

				/* If App Has Permission To Return Sensitive Data (start)*/
				if(app_permission == '1'){
				 	/* If 'Type-OF-Search' == 'Exact' (start)*/
				 	if(type_of_search == "exact"){
				 		/* If 'Return-Type' == 'All' */
				 		if(output_requirement == "all"){
				 			mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
									if(!err){
										var count = rows.length;
										if(count>0){
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : rows
											});
										}
										else{
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : data
											});
										}
									}
									else{
										console.log(err);
									}
							});

				 		}

				 		/* If 'Return-Type' == 'Boolean' */
				 		else if(output_requirement == "boolean"){
				 			mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
									if(!err){
										var count = rows.length;
										if(count>0){
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : true
											});
										}
										else{
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : false
											});
										}
									}
									else{
										console.log(err);
									}
							});

				 		}

				 		/* If 'Return-Type' == Specific Columns */
				 		else {
				 			mysqlConnection.query('SELECT '+ output_requirement +' FROM '+ users_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
									if(!err){
										var count = rows.length;
										if(count>0){
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : rows
											});
										}
										else{
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : data
											});
										}
									}
									else{
										console.log(err);
									}
							});

				 		}

					}
					/* If 'Type-OF-Search' == 'Exact' (end)*/

				 	/* If 'Type-OF-Search' == 'Partial' (start)*/
				 	else if(type_of_search == "partial"){
				 		/* If 'Return-Type' == 'All' */
				 		if(output_requirement == "all"){
				 			mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
									if(!err){
										var count = rows.length;
										if(count>0){
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : rows
											});
										}
										else{
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : data
											});
										}
									}
									else{
										console.log(err);
									}
							});

				 		}

				 		/* If 'Return-Type' == 'Boolean' */
				 		else if(output_requirement == "boolean"){
				 			mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
									if(!err){
										var count = rows.length;
										if(count>0){
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : true
											});
										}
										else{
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : false
											});
										}
									}
									else{
										console.log(err);
									}
							});

				 		}

				 		/* If 'Return-Type' == Specific Columns */
				 		else{
				 			mysqlConnection.query('SELECT '+ output_requirement +' FROM '+ users_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
									if(!err){
										var count = rows.length;
										if(count>0){
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : rows
											});
										}
										else{
											res.json({
												'status'   : '200',
												'message'  : 'success',
												'data'	   : data
											});
										}
									}
									else{
										console.log(err);
									}
							});

				 		}
				 	}
				 	/* If 'Type-OF-Search' == 'Partial' (end)*/

				}
				/* If App Has Permission To Return Sensitive Data (end)*/


				/* If App Does Not Have Permission To Return Sensitive Data (start) */
				else if(app_permission == '0'){
					/* SQL Query to fetch Sensitive Columns */
					mysqlConnection.query("SELECT * FROM sensitive_data WHERE type = '2' ", (err, rows, fields)=>{
						if(!err){
							var count = rows.length;
							if(count > 0){
								var rows_arr  = rows;
								var len = rows_arr.length;
								for (var i = 0; i < len; i++) {
									arr.push({
										col_name: rows_arr[i].col_name,
									});
								}


								mysqlConnection.query("SHOW COLUMNS FROM "+ users_table , (err, rows, fields)=>{
									if(!err){
										var count = rows.length;
										if(count > 0){
											var rows_arr1  = rows;
											var len = rows_arr1.length;
											for (var i = 0; i < len; i++) {
												arr1.push({
													col_name: rows_arr1[i].Field,											
												});
											}

										}
									}

									/* Get non-sensitive columns (start)*/
									for( var i=arr1.length - 1; i>=0; i--){
										for( var j=0; j<arr.length; j++){
											if(arr1[i] && (arr1[i].col_name === arr[j].col_name)){
												arr1.splice(i, 1);
											}
										}
									}

									arr1.forEach((v) => {
										nonSensitiveColmsList = nonSensitiveColmsList + v['col_name'] + ", ";
									});
									nonSensitiveColmsListNew  = nonSensitiveColmsList.substring(0,nonSensitiveColmsList.length -2);
									/* Get non-sensitive columns (end)*/


									/* Remove sensitive coulmns from requested-output columns (start)*/
									var output_arr = output_requirement.split(',');								 			
									for( var i=arr.length - 1; i>=0; i--){
										for( var j=0; j<output_arr.length; j++){
										  if(arr[i] && (arr[i].col_name == output_arr[j])){
										 	output_arr.splice(j, 1);
											}
										}											
									}

									output_arr.forEach((v) => {
										non_sensitive_colm = non_sensitive_colm + v + ", ";
									});
									non_sensitive_colm_output  = non_sensitive_colm.substring(0,non_sensitive_colm.length -2);
									/* Remove sensitive coulmns from requested-output columns (start)*/	

	
									/* If 'Type-OF-Search' == 'Exact' (start)*/
								 	if(type_of_search == "exact"){
								 		/* If 'Return-Type' == 'All' */
								 		if(output_requirement == "all"){
								 			mysqlConnection.query('SELECT '+ nonSensitiveColmsListNew +' FROM '+ users_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : rows
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : []
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

								 		/* If 'Return-Type' == 'Boolean' */
								 		else if(output_requirement == "boolean"){
								 			mysqlConnection.query('SELECT '+ nonSensitiveColmsListNew +' FROM '+ users_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : true
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : false
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

								 		/* If 'Return-Type' == Specific Columns */
								 		else {
								 			mysqlConnection.query('SELECT '+ non_sensitive_colm_output +' FROM '+ users_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : rows
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : []
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

									}
									/* If 'Type-OF-Search' == 'Exact' (end)*/

									/* If 'Type-OF-Search' == 'Partial' (start)*/
								 	else if(type_of_search == "partial"){
								 		/* If 'Return-Type' == 'All' */
								 		if(output_requirement == "all"){
								 			mysqlConnection.query('SELECT '+ nonSensitiveColmsListNew +' FROM '+ users_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : rows
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : data
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

								 		/* If 'Return-Type' == 'Boolean' */
								 		else if(output_requirement == "boolean"){
								 			mysqlConnection.query('SELECT '+ nonSensitiveColmsListNew +' FROM '+ users_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : true
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : false
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

								 		/* If 'Return-Type' == Specific Columns */
								 		else{
								 			mysqlConnection.query('SELECT '+ non_sensitive_colm_output +' FROM '+ users_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : rows
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : data
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}
								 	}
								 	/* If 'Type-OF-Search' == 'Partial' (end)*/

								});
							}

							/* Check Type Of Search */
						}
						else{
							console.log(err);
						}
					});
					
				}
				/* If App Does Not Have Permission To Return Sensitive Data (end) */

			}
		}

		else{
			console.log(err);
		}

	});

});


/* Search User / Get Profile Data */
router.post("/api/search_user", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client_reg_id  	   	 = req.body.master_client_reg_id;
	var admin_cust_reg_id  	   	  	 = req.body.master_client_reg_id;
	var colms_to_search   			 = req.body.colms_to_search;//coulums to be searched - may be 'all'/specific columns
	var val_to_search   			 = req.body.val_to_search;//the value to be searched
	var type_of_search   			 = req.body.type_of_search;//may be 'partial'/'exact'
	var output_requirement   		 = req.body.output_requirement;//may be 'all'/'boolean'/specific Columns
	var app_table_type				 = app_permission = sqlQryExact = sqlQryPartial = sensitiveColms = sensitiveColmsNew = nonSensitiveColmsList = nonSensitiveColmsListNew = non_sensitive_colm = non_sensitive_colm_output = "";
	var contact_person_flag = organztn_flag = signup_user_flag = user_exist_flag = false;
	var admin_cust_id  = "";
	var type_of_fields = "";
	var type_of_table  = "";
	var data  = [];
	var sensitive_data_colms = [];
	var arr   = [];
	var arr2  = [];



	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = "'+ app_id +'" AND app_secret = "'+ app_secret +'" ', (err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type  = rows[0].table_type;
				var app_id_pk   = rows[0].id;
				app_permission  = rows[0].permission;	
				var users_table = app_table_type + "_users";

				/* If User is Customer-Team-Member */
				if(system_user_type == "customer_team"){
					type_of_fields = "customer_team_tbl, id";
					type_of_table  = "customer_team_tbl";

				/* If User is Customer's-Customer */
				}else if(system_user_type == "customer_client"){
					type_of_fields = "customers_customer_tbl, id";
					type_of_table  = "customers_customer_tbl";
				}
				

				var colmns_arr  = colms_to_search.split(",");
					colmns_arr.forEach((v) => {
						sqlQryExact     = sqlQryExact + v + " = '" + val_to_search + "' OR ";
						sqlQryPartial 	= sqlQryPartial + v + " LIKE '%" + val_to_search + "%' OR ";
					});
		 		
				var sqlQryNewExact   = sqlQryExact.substring(0,sqlQryExact.length -3) + " AND app_id = '" + app_id_pk + "'  AND admin_cust_id = '"+ admin_cust_id +"' ";
		 		var sqlQryNewPartial = sqlQryPartial.substring(0,sqlQryPartial.length -3)+ " AND app_id = '" + app_id_pk + "' AND admin_cust_id = '"+ admin_cust_id +"' ";


		 		mysqlConnection.query('SELECT '+ type_of_fields +' FROM '+ users_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" AND FIND_IN_SET ("'+ app_id_pk +'",app_id) ',(err, rows, fields)=>{
					if(!err){
						var countCustRows = rows.length;
						if(countCustRows>0){			
							var chosen_table  = rows[0][type_of_table];
							var admin_cust_id = rows[0].id;

								/* If App Has Permission To Return Sensitive Data (start)*/
								if(app_permission == '1'){
								 	/* If 'Type-OF-Search' == 'Exact' (start)*/
								 	if(type_of_search == "exact"){
								 		/* If 'Return-Type' == 'All' */
								 		if(output_requirement == "all"){ 
								 			mysqlConnection.query('SELECT * FROM '+ chosen_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : rows
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : data
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

								 		/* If 'Return-Type' == 'Boolean' */
								 		else if(output_requirement == "boolean"){
								 			mysqlConnection.query('SELECT * FROM '+ chosen_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : true
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : false
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

								 		/* If 'Return-Type' == Specific Columns */
								 		else {
								 			mysqlConnection.query('SELECT '+ output_requirement +' FROM '+ chosen_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : rows
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : data
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

									}
									/* If 'Type-OF-Search' == 'Exact' (end)*/

								 	/* If 'Type-OF-Search' == 'Partial' (start)*/
								 	else if(type_of_search == "partial"){
								 		/* If 'Return-Type' == 'All' */
								 		if(output_requirement == "all"){
								 			mysqlConnection.query('SELECT * FROM '+ chosen_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : rows
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : data
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

								 		/* If 'Return-Type' == 'Boolean' */
								 		else if(output_requirement == "boolean"){
								 			mysqlConnection.query('SELECT * FROM '+ chosen_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : true
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : false
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}

								 		/* If 'Return-Type' == Specific Columns */
								 		else{
								 			mysqlConnection.query('SELECT '+ output_requirement +' FROM '+ chosen_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
													if(!err){
														var count = rows.length;
														if(count>0){
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : rows
															});
														}
														else{
															res.json({
																'status'   : '200',
																'message'  : 'success',
																'data'	   : data
															});
														}
													}
													else{
														console.log(err);
													}
											});

								 		}
								 	}
								 	/* If 'Type-OF-Search' == 'Partial' (end)*/

								}
								/* If App Has Permission To Return Sensitive Data (end)*/


								/* If App Does Not Have Permission To Return Sensitive Data (start) */
								else if(app_permission == '0'){
									/* SQL Query to fetch Sensitive Columns */
									mysqlConnection.query("SELECT * FROM sensitive_data WHERE type = '2' ", (err, rows, fields)=>{
										if(!err){
											var count = rows.length;
											if(count > 0){
												var rows_arr  = rows;
												var len = rows_arr.length;
												for (var i = 0; i < len; i++) {
													arr.push({
														col_name: rows_arr[i].col_name,
													});
												}
											}
		

												
												mysqlConnection.query("SHOW COLUMNS FROM "+ chosen_table , (err, rows1, fields)=>{
													if(!err){
														var count1 = rows1.length;
														if(count1 > 0){
															var arr1 = [];
															var rows_arr1 = rows1;
															var len = rows_arr1.length;
															for (var i = 0; i < len; i++) {
																arr1.push({
																	col_name: rows_arr1[i].Field								
																});
															}

														}
													}

													//console.log("Array ==>", arr);//*********
													//console.log("Array 1==>", arr1);//*********

													/* Get non-sensitive columns (start)*/
													for( var i=arr1.length - 1; i>=0; i--){
														for( var j=0; j<arr.length; j++){
															if(arr1[i] && (arr1[i].col_name === arr[j].col_name)){
																arr1.splice(i, 1);
															}
															
														}
													}

													arr1.forEach((v) => {
														nonSensitiveColmsList = nonSensitiveColmsList + v['col_name'] + ", ";
													});
													nonSensitiveColmsListNew  = nonSensitiveColmsList.substring(0,nonSensitiveColmsList.length -2);
													/* Get non-sensitive columns (end)*/


													/* Remove sensitive coulmns from requested-output columns (start)*/
													var output_arr = output_requirement.split(',');								 			
													for( var i=arr.length - 1; i>=0; i--){
														for( var j=0; j<output_arr.length; j++){
														  if(arr[i] && (arr[i].col_name == output_arr[j])){
														 	output_arr.splice(j, 1);
															}
														}											
													}

													output_arr.forEach((v) => {
														non_sensitive_colm = non_sensitive_colm + v + ", ";
													});
													non_sensitive_colm_output  = non_sensitive_colm.substring(0,non_sensitive_colm.length -2);
													/* Remove sensitive coulmns from requested-output columns (start)*/	

					
													/* If 'Type-OF-Search' == 'Exact' (start)*/
												 	if(type_of_search == "exact"){
												 		/* If 'Return-Type' == 'All' */
												 		if(output_requirement == "all"){
												 			mysqlConnection.query('SELECT '+ nonSensitiveColmsListNew +' FROM '+ chosen_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
																	if(!err){
																		var count = rows.length;
																		if(count>0){
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : rows
																			});
																		}
																		else{
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : []
																			});
																		}
																	}
																	else{
																		console.log(err);
																	}
															});

												 		}

												 		/* If 'Return-Type' == 'Boolean' */
												 		else if(output_requirement == "boolean"){
												 			mysqlConnection.query('SELECT '+ nonSensitiveColmsListNew +' FROM '+ chosen_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
																	if(!err){
																		var count = rows.length;
																		if(count>0){
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : true
																			});
																		}
																		else{
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : false
																			});
																		}
																	}
																	else{
																		console.log(err);
																	}
															});

												 		}

												 		/* If 'Return-Type' == Specific Columns */
												 		else {
												 			mysqlConnection.query('SELECT '+ non_sensitive_colm_output +' FROM '+ chosen_table +' WHERE '+ sqlQryNewExact,(err, rows, fields)=>{
																	if(!err){
																		var count = rows.length;
																		if(count>0){
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : rows
																			});
																		}
																		else{
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : []
																			});
																		}
																	}
																	else{
																		console.log(err);
																	}
															});

												 		}

													}
													/* If 'Type-OF-Search' == 'Exact' (end)*/

													/* If 'Type-OF-Search' == 'Partial' (start)*/
												 	else if(type_of_search == "partial"){
												 		/* If 'Return-Type' == 'All' */
												 		if(output_requirement == "all"){
												 			mysqlConnection.query('SELECT '+ nonSensitiveColmsListNew +' FROM '+ chosen_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
																	if(!err){
																		var count = rows.length;
																		if(count>0){
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : rows
																			});
																		}
																		else{
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : data
																			});
																		}
																	}
																	else{
																		console.log(err);
																	}
															});

												 		}

												 		/* If 'Return-Type' == 'Boolean' */
												 		else if(output_requirement == "boolean"){
												 			mysqlConnection.query('SELECT '+ nonSensitiveColmsListNew +' FROM '+ chosen_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
																	if(!err){
																		var count = rows.length;
																		if(count>0){
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : true
																			});
																		}
																		else{
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : false
																			});
																		}
																	}
																	else{
																		console.log(err);
																	}
															});

												 		}

												 		/* If 'Return-Type' == Specific Columns */
												 		else{
												 			mysqlConnection.query('SELECT '+ non_sensitive_colm_output +' FROM '+ chosen_table +' WHERE '+ sqlQryNewPartial,(err, rows, fields)=>{
																	if(!err){
																		var count = rows.length;
																		if(count>0){
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : rows
																			});
																		}
																		else{
																			res.json({
																				'status'   : '200',
																				'message'  : 'success',
																				'data'	   : data
																			});
																		}
																	}
																	else{
																		console.log(err);
																	}
															});

												 		}
												 	}
												 	/* If 'Type-OF-Search' == 'Partial' (end)*/

												});
											//}

											/* Check Type Of Search */
										}
										else{
											console.log(err);
										}
									});
									
								}
								/* If App Does Not Have Permission To Return Sensitive Data (end) */


						}
					}else{
						console.log(err);
					}

				});

			}
		}

		else{
			console.log(err);
		}

	});

});


/* Update User */
router.post("/api/update_user", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client_reg_id  	   	 = req.body.master_client_reg_id ;
	var admin_cust_reg_id  	   	     = req.body.master_client_reg_id ;
	var user_reg_id   	  			 = req.body.user_reg_id;
	var username  	  				 = req.body.username;
	var email   	  				 = req.body.email;
	var phone   	  				 = req.body.phone;
	var colms_to_update   			 = req.body.colms_to_update;//'N' no of columns can be here
	var val_to_update   			 = req.body.val_to_update;//data of respective columns
	var sqlQryExact				 	 = selected_table = "";
	var data 						 = [];

	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type = rows[0].table_type;
				var app_id_pk  = rows[0].id;
			}		
			var users_table = app_table_type + "_users";

			/* Map each column with its corrsponding value (to update) [start]*/
			var colmns_arr = colms_to_update.split(',');					 			
			var values_arr = val_to_update.split(',');								 			
			for( var i=0; i<colmns_arr.length; i++){
				for( var j=0; j<values_arr.length; j++){
				  if(i == j){
				 	sqlQryExact = sqlQryExact + colmns_arr[i] + " = '" + values_arr[j] + "' , ";
					}
				}											
			}
			var sqlQryNewExact = sqlQryExact.substring(0,sqlQryExact.length -2);
			/* Map each column with its corrsponding value (to update) [end]*/

	 		
			/* Replace undefined values with blank values */
	 		if(username === undefined){
	 			username = "";
	 		}
	 		if(user_reg_id === undefined){
	 			user_reg_id = "";
	 		}
	 		if(email === undefined){
	 			email = "";
	 		}
	 		if(phone === undefined){
	 			phone = "";
	 		}


	 		/* If user is Admin-Customer (start)*/
			if((system_user_type == "customer") && ((username !== '') || (email !== '') || (phone !== '')) && (user_reg_id !== '')){
				/* Check if User with provided credentials exists */
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE (email = "'+ email +'" OR phone = "'+ phone +'" OR username = "'+ username +'") AND reg_id = "'+ user_reg_id +'" AND system_user_type = "'+ system_user_type +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					if(!err){
						var count_user = rows.length;

						/* Update User Data */
						if(count_user > 0){
							var user_id_pk = rows[0].id;
							mysqlConnection.query('UPDATE '+ users_table +' SET '+ sqlQryNewExact +' WHERE (reg_id = "'+ user_reg_id +'" OR email = "'+ email +'" OR phone = "'+ phone +'" OR username = "'+ username +'") AND system_user_type = "'+ system_user_type +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
							if(!err){
								mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE id = "'+ user_id_pk +'" ', (err, rows, fields)=>{
									if(!err){
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : rows //'Successfully updated user information!'
										});
									}else{
										console.log(err);
									}
								});
								
							}
							else{
								console.log(err);
							}
						});

						/* If User with provided credentials does not exist */
						}else{
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'User does not exist!'
							});
						}

					}else{
						console.log(err);
					}
				});			
			}
			/* If user is Admin-Customer (end)*/

			/* If user is Customer-Team / Customer's-customer (start)*/
			else if(((system_user_type == "customer_team") || (system_user_type == "customer_client")) && ((username !== '') || (email !== '') || (phone !== '')) && (admin_cust_reg_id !== '')){
				/* Check if User with provided credentials exists */
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					if(!err){
						var count_admin_user = rows.length;
						var customer_id 	 = rows[0].id;
						if(count_admin_user > 0){
							/* Select Table */
							if(system_user_type == "customer_team"){
								selected_table = rows[0].customer_team_tbl;

							}else if(system_user_type == "customer_client"){
								selected_table = rows[0].customers_customer_tbl;
							}
						//}

						if(count_admin_user > 0){
							/* Check whether Customer-Team Member / Customer's-customer exists */
							mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE reg_id = "'+ user_reg_id +'" AND admin_cust_id = "'+ customer_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
								if(!err){
									var count   = rows.length;
									var user_id = rows[0].id;
									if(count>0){
										/* MySQL Update Query */
										mysqlConnection.query('UPDATE '+ selected_table +' SET '+ sqlQryNewExact +' WHERE (reg_id = "'+ user_reg_id +'" OR email = "'+ email +'" OR phone = "'+ phone +'" OR username = "'+ username +'") AND system_user_type = "'+ system_user_type +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
											if(!err){
												/* Fetch Updated details of User */
												mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE id = "'+ user_id +'" ', (err, rows, fields)=>{
													if(!err){
														res.json({
															'status'   : '200',
															'message'  : 'success',
															'data'	   : rows //'Successfully updated user information!'
														});
													}else{
														console.log(err);
													}
												});
												
											}
											else{
												console.log(err);
											}
										});
									}else{
										res.json({
												'status'   : '200',
												'message'  : 'error',
												'data'	   : 'Please provide correct email-id / phone-number / password / user-id!'
										});
									}
									
								}else{
									console.log(err);
								}
							});								
						}else{
							res.json({
									'status'   : '200',
									'message'  : 'error',
									'data'	   : 'Please provide correct master-client / admin-user-id!'
							});
						}
						/* If user is Customer-Team / Customer's-customer (start)*/

						/* If User with provided credentials does not exist */
						}else{
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Admin-User does not exist!'
							});
						}

					}else{
						console.log(err);
					}
				});

			}
			/* If user is Customer-Team / Customer's-customer (end)*/


			/* If blank credentials are provided by API */
			else{
					res.json({
							'status'   : '200',
							'message'  : 'error',
							'data'	   : 'Please provide correct credentials!'
					});
			}

		}
		else{
			console.log(err);
		}
	});

});


/* Get All Details of User for Merge */
router.post("/api/user_details_for_merge", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client  	   	  		 = req.body.master_client ;
	//var username  	  				 = req.body.username;
	//var password   	  				 = req.body.password;
	var email   	  				 = req.body.email;
	var phone   	  				 = req.body.phone;
	var data 						 = [];
	
	if((email != '') || (username != '') || (phone != '')){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
				}
			}
			

			/* Check Whether User Exists or not */
			if(app_table_type != ""){
				var user_table = app_table_type + "_users";
				mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE (email = ? OR phone = ?)', [email, phone],(err, rows, fields)=>{
					if(!err){
							var count = rows.length;

							/* Successfully Log-In */
							if(count > 0){
								// mysqlConnection.query('UPDATE '+ user_table +' SET login_status = ? WHERE id = ? OR email = ? OR phone = ? OR username = ?', ['1', user_id, email, phone, username], (err, rows, fields)=>{
								// 	if(!err){
								res.json({
										'status'   : '200',
										'message'  : 'success',
										'data'	   : rows
								});
							}
							else{
								res.json({
										'status'   : '200',
										'message'  : 'success',
										'data'	   : data
								});
							}
								//});

							
					}else{
						res.json({
							'status'   : '200',
							'message'  : 'error',
							'data'	   : 'Please provide correct Email-id / Phone number !'
						});
					}
				});
					//}
			}else{
					res.json({
							'status'   : '200',
							'message'  : 'error',
							'data'	   : 'User not found!'
					});
			}
		});

	}else{
			res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Email-id / Phone number cannot be blank !'
			});
	}

});

/* Merge User */
router.post("/api/merge_user", (req, res) => { //******* NEED TO DELETE PREV RECORDS OF THIS USER *******
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var customer1_reg_id	  		 = req.body.customer1_reg_id;
	var customer2_reg_id	  		 = req.body.customer2_reg_id;
	var app_secret	  				 = req.body.app_secret;
	var business_user_type  	     = req.body.business_user_type;
	var system_user_type 			 = 'customer';
	var user_state  	   	  		 = req.body.user_state ;
	var email_state  	   	  		 = req.body.email_state ;
	var phone_state  	   	  		 = req.body.phone_state ;
	var contact_person_name  	   	 = req.body.contact_person_name ;
	var org_name  	   	  		 	 = req.body.org_name ;
	var contact_person_email  	   	 = req.body.contact_person_email ;
	var org_email  	   	  		 	 = req.body.org_email ;
	var contact_person_phone  	   	 = req.body.contact_person_phone ;
	var org_phone  	   	  		 	 = req.body.org_phone ;
	var username  	  				 = req.body.username;
	var password   	  				 = req.body.password;
	var email   	  				 = req.body.email;
	var phone   	  				 = req.body.phone;
	var provisions_to_apps   	  	 = req.body.provisions_to_apps;
	var roles   	  				 = req.body.roles;
	var groups   	  				 = req.body.groups;
	var registrar_app_id   	  		 = req.body.registrar_app_id;
	var app_ids   	  				 = req.body.app_ids;
	var connected_to   	  			 = req.body.connected_to;
	var connected_as   	  			 = req.body.connected_as;
	var contact_person_photo   	  	 = req.body.contact_person_photo;
	var org_reg_id   	  			 = req.body.org_reg_id;
	var dob   	  				 	 = req.body.dob;
	var about_user   	  			 = req.body.about_user;
	var country_name   	  			 = req.body.country_name;
	var address   	  				 = req.body.address;
	var pincode   	  				 = req.body.pincode;
	var profile_link   	  			 = req.body.profile_link;
	var gender   	  				 = req.body.gender;
	var election_id   	  			 = req.body.election_id;
	var election_id_img   	  		 = req.body.election_id_img;
	var citizenship_id   	  		 = req.body.citizenship_id;
	var citizenship_id_img   	  	 = req.body.citizenship_id_img;
	var aadhar_id   	  			 = req.body.aadhar_id;
	var aadhar_id_img   	  		 = req.body.aadhar_id_img;
	var passport_no   	  			 = req.body.passport_no;
	var passport_no_img   	  		 = req.body.passport_no_img;
	var driving_license   	  		 = req.body.driving_license;
	var driving_license_img   	  	 = req.body.driving_license_img;
	var trust_score   	  			 = req.body.trust_score;
	var wealth_score   	  			 = req.body.wealth_score;
	var response_score   	  		 = req.body.response_score;
	var win_score   	  			 = req.body.win_score;
	var critical_time_score   	  	 = req.body.critical_time_score;
	var avg_rating   	  			 = req.body.avg_rating;
	var total_rating   	  			 = req.body.total_rating;
	var login_status   	  			 = req.body.login_status;
	var reviews   	  				 = req.body.reviews;
	var card_info   	  			 = req.body.card_info;
	var payment_info   	  			 = req.body.payment_info;
	//	var existing_cust_team_tlbs   	 = req.body.existing_cust_team_tlbs;//existing customer team tables that need to be merged(comma-separated)
//	var existing_cust_client_tlbs    = req.body.existing_cust_client_tlbs;//existing customer's customer tables that need to be merged(comma-separated)
	var customer_team_tbl   	  	 = req.body.customer_team_tbl;//(yes/no) => if 'yes': new customer_team_table is created 
	var customers_customer_tbl   	 = req.body.customers_customer_tbl;//(yes/no) => if 'yes': new customers_customer_table is created 
	var reg_id   	  				 = ids.generate();
	var registrar_app_id   	  		 = ids.generate();
	var randomNo					 = Date.now() +  Math.floor(Math.random()*(999-100+1)+100);
	var app_table_type				 = "";
	var team_table 					 = "";
	var customer_table 	             = ""; 
	var data 						 = [];
	var contact_person_flag 		 = false;
	var organztn_flag				 = false;
	var signup_user_flag			 = false;
	var user_exist_flag				 = false;
	var cust1_team_tbl 			 	 = "";
	var cust2_team_tbl 			 	 = "";
	var cust1_cust_tbl 			 	 = "";
	var cust2_cust_tbl 			 	 = "";

	/* If User_Type_Acc_to_Business_Logic == Personal_Account */
	if((business_user_type !== null) && (business_user_type !== '') && (business_user_type == '0')){
		if((contact_person_name !== null) && (contact_person_name !== '') && ((contact_person_email !== null) || (contact_person_phone !== null) || (contact_person_email !== '') || (contact_person_phone !== ''))){
			contact_person_flag = true;
		}else{
			contact_person_flag = false;
		}


	/* If User_Type_Acc_to_Business_Logic == Organizational_User */
	}else if((business_user_type !== null) && (business_user_type !== '') && (business_user_type == "1")){
		if((org_name !== null) && (org_name !== '') && ((org_email !== null) || (org_phone !== null) || (org_email !== '') || (org_phone !== ''))){
			organztn_flag = true;
		}else{
			organztn_flag = false;
		}	
	}

	/* If User_Type_Acc_to_System == Customers-Team / Customers-Client */	
	if((system_user_type !== '') && ((system_user_type == "customer_team") || (system_user_type == "customer_client"))){
		if((master_client !== null) && (master_client !== '')){
			signup_user_flag = true;
		}else{
			signup_user_flag = false;
		}
	}else if((system_user_type != "customer_team") || (system_user_type != "customer_client")){
			signup_user_flag = true;
	}


	/* If API Asks for Customer-Team-Table to be created */
	if(customer_team_tbl == "yes"){
			team_table  =  "team_table_" + randomNo;
	}

	/* If API Asks for Customers-Customer-Table to be created */
	if(customers_customer_tbl == "yes"){
			customer_table 	=  "customer_table_" + randomNo;
	}


	/* Section for Inserting User Data */
	if((signup_user_flag !== false) && ((organztn_flag !== false) || (contact_person_flag !== false))){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count  	  = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
				}
				var users_table = app_table_type + "_users";
			
						//***    UNION ALL DO HERE  (start)    **///
						/* Create new row in database-table */		
						if((contact_person_email != org_email) && (contact_person_phone != org_phone)){
							mysqlConnection.query('INSERT INTO '+ users_table +' (business_user_type, system_user_type, user_state, email_state, phone_state, reg_id, contact_person_name, org_name, contact_person_email, org_email, contact_person_phone, org_phone, username, password, email, phone, provisions_to_apps, roles, groups,  registrar_app_id, app_id, connected_to, connected_as, contact_person_photo, org_reg_id, dob, about_user, country_name, address, pincode, profile_link, gender, election_id, election_id_img, citizenship_id, citizenship_id_img, aadhar_id, aadhar_id_img, passport_no, passport_no_img, driving_license, driving_license_img, trust_score, wealth_score, response_score, win_score, critical_time_score, avg_rating, total_rating, login_status, reviews, card_info, payment_info, customer_team_tbl, customers_customer_tbl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [business_user_type, system_user_type, user_state, email_state, phone_state, reg_id, contact_person_name, org_name, contact_person_email, org_email, contact_person_phone, org_phone, username, md5(password), email, phone, provisions_to_apps, roles, groups, registrar_app_id, app_ids, connected_to, connected_as, contact_person_photo, org_reg_id, dob, about_user, country_name, address, pincode, profile_link, gender, election_id, election_id_img, citizenship_id, citizenship_id_img, aadhar_id, aadhar_id_img, passport_no, passport_no_img, driving_license, driving_license_img, trust_score, wealth_score, response_score, win_score, critical_time_score, avg_rating, total_rating, login_status, reviews, card_info, payment_info, team_table, customer_table], (err, rows, fields)=>{
								if(!err){
									var last_inserted_id = rows.insertId;									

									/* Create dynamic Customer-Team table */
									if(customer_team_tbl == "yes"){
										mysqlConnection.query("CREATE TABLE `" + team_table + "` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key', `business_user_type` enum('0','1') DEFAULT '0' COMMENT '''0''= Personal Account, ''1''=''Organizational User,''', `system_user_type` varchar(255) DEFAULT NULL COMMENT 'super_admin / super_admin_team / customer / customer_team / customer_client',`user_state` enum('0','1','2','3','4','5') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''''No Password,''2''=''Active'',''3''=''Deactivated'',''4''=''Blocked'',''5''=''Removed''',`email_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`phone_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`master_client` varchar(255) DEFAULT NULL COMMENT 'Master Client',`reg_id` varchar(255) DEFAULT NULL COMMENT 'Registration-ID (cannot be edited by API ever)',`registrar_app_id` varchar(255) DEFAULT NULL COMMENT 'Registrar-App-ID (cannot be edited by API ever)',`admin_cust_id` int(11) DEFAULT '0' COMMENT 'Admin Customer ID',`provisions_to_apps` text COMMENT 'Provisions to 3rd Party Applications (Just stores the string provided by 3rd party application ,no other meaning)',`app_id` varchar(100) DEFAULT NULL COMMENT 'Foreign Key  app_master table',`roles` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`groups` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`connected_to` enum('0','1') DEFAULT NULL COMMENT '''0''=''Personal Account'', ''1''=''Other Account''s Registration ID''',`connected_as` enum('0','1') DEFAULT NULL COMMENT '''0''=''Individual'', ''1''=''Dynamic Post Name''',`contact_person_photo` text COMMENT 'Contact Person Photo',`contact_person_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Name ',`org_name` varchar(255) DEFAULT NULL COMMENT 'Organization Name',`contact_person_email` varchar(255) DEFAULT NULL COMMENT 'Contact Person Email  (Unique Field)',`org_email` varchar(255) DEFAULT NULL COMMENT 'Organization Email (Unique Field)',`contact_person_phone` varchar(255) DEFAULT NULL COMMENT 'Contact Person Phone Number (Unique Field)',`org_phone` varchar(255) DEFAULT NULL COMMENT 'Organization Phone Number (Unique Field)',`username` varchar(255) DEFAULT NULL,`password` varchar(255) DEFAULT NULL,`email` text COMMENT 'User Email',`phone` varchar(255) DEFAULT NULL COMMENT 'User Phone Number', `org_reg_id` varchar(255) DEFAULT NULL COMMENT 'Main Operator of which organization',`dob` date DEFAULT NULL COMMENT 'Contact Person Date of Birth / Organization Establishment Date',`about_user` text COMMENT 'Information about User',`country_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Country Name', `address` text COMMENT 'Contact Person Full Address',`pincode` varchar(100) DEFAULT NULL COMMENT 'Contact Person pincode',`profile_link` text COMMENT 'User Profile Link',`gender` enum('male','female','other') DEFAULT NULL COMMENT 'User Gender (Male / Female / Other)',`election_id` varchar(100) DEFAULT NULL COMMENT 'Govt ID Proof - Election ID (Encrypted)',`election_id_img` text COMMENT 'File Upload of Election ID',`citizenship_id` varchar(255) DEFAULT NULL COMMENT 'National ID / Citizenship ID',`citizenship_id_img` text COMMENT 'File Upload of National ID / Citizenship ID',`aadhar_id` varchar(255) DEFAULT NULL COMMENT 'Biometric / Aadhar ID', `aadhar_id_img` text COMMENT 'File Upload of Biometric ID / Aadhar ID',`passport_no` varchar(255) DEFAULT NULL COMMENT 'Passport Number',`driving_license` varchar(255) DEFAULT NULL COMMENT 'Driving License',`driving_license_img` text COMMENT 'File Upload of Driving License',`trust_score` varchar(255) DEFAULT NULL COMMENT 'Trust Score of User',`wealth_score` varchar(255) DEFAULT NULL COMMENT 'Wealth Score of User',`response_score` varchar(255) DEFAULT NULL COMMENT 'Response Score Of User',`win_score` varchar(255) DEFAULT NULL COMMENT 'Win Score of User',`critical_time_score` varchar(255) DEFAULT NULL COMMENT 'Critical Time Score of User',`avg_rating` varchar(255) DEFAULT NULL COMMENT 'Average Rating of User',`total_rating` varchar(255) DEFAULT NULL COMMENT 'Total Number of Ratings of User',`reviews` varchar(255) DEFAULT NULL COMMENT 'Reviews of User', `card_info` varchar(255) DEFAULT NULL COMMENT 'Card Info of User',`payment_info` varchar(255) DEFAULT NULL COMMENT 'Payment Info of User',`login_status` enum('0','1') DEFAULT '0' COMMENT '''0''=''Not Logged In'', ''1''=''Logged In''', `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of Record Creation',`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Time of Record Updation') ENGINE=InnoDB DEFAULT CHARSET=latin1");

									}


									/* Create dynamic Customer's-Customer table */
									if(customers_customer_tbl == "yes"){
										mysqlConnection.query("CREATE TABLE `" + customer_table + "` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key', `business_user_type` enum('0','1') DEFAULT '0' COMMENT '''0''= Personal Account, ''1''=''Organizational User,''', `system_user_type` varchar(255) DEFAULT NULL COMMENT 'super_admin / super_admin_team / customer / customer_team / customer_client',`user_state` enum('0','1','2','3','4','5') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''''No Password,''2''=''Active'',''3''=''Deactivated'',''4''=''Blocked'',''5''=''Removed''',`email_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`phone_state` enum('0','1') DEFAULT '0' COMMENT '''0''=''Verification Pending'', ''1''=''Verified''',`master_client` varchar(255) DEFAULT NULL COMMENT 'Master Client',`reg_id` varchar(255) DEFAULT NULL COMMENT 'Registration-ID (cannot be edited by API ever)',`registrar_app_id` varchar(255) DEFAULT NULL COMMENT 'Registrar-App-ID (cannot be edited by API ever)',`admin_cust_id` int(11) DEFAULT '0' COMMENT 'Admin Customer ID',`provisions_to_apps` text COMMENT 'Provisions to 3rd Party Applications (Just stores the string provided by 3rd party application ,no other meaning)',`app_id` varchar(100) DEFAULT NULL COMMENT 'Foreign Key  app_master table',`roles` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`groups` text COMMENT 'Just stores the string provided by 3rd party application (no other meaning)',`connected_to` enum('0','1') DEFAULT NULL COMMENT '''0''=''Personal Account'', ''1''=''Other Account''s Registration ID''',`connected_as` enum('0','1') DEFAULT NULL COMMENT '''0''=''Individual'', ''1''=''Dynamic Post Name''',`contact_person_photo` text COMMENT 'Contact Person Photo',`contact_person_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Name ',`org_name` varchar(255) DEFAULT NULL COMMENT 'Organization Name',`contact_person_email` varchar(255) DEFAULT NULL COMMENT 'Contact Person Email  (Unique Field)',`org_email` varchar(255) DEFAULT NULL COMMENT 'Organization Email (Unique Field)',`contact_person_phone` varchar(255) DEFAULT NULL COMMENT 'Contact Person Phone Number (Unique Field)',`org_phone` varchar(255) DEFAULT NULL COMMENT 'Organization Phone Number (Unique Field)',`username` varchar(255) DEFAULT NULL,`password` varchar(255) DEFAULT NULL,`email` text COMMENT 'User Email',`phone` varchar(255) DEFAULT NULL COMMENT 'User Phone Number', `org_reg_id` varchar(255) DEFAULT NULL COMMENT 'Main Operator of which organization',`dob` date DEFAULT NULL COMMENT 'Contact Person Date of Birth / Organization Establishment Date',`about_user` text COMMENT 'Information about User',`country_name` varchar(255) DEFAULT NULL COMMENT 'Contact Person Country Name', `address` text COMMENT 'Contact Person Full Address',`pincode` varchar(100) DEFAULT NULL COMMENT 'Contact Person pincode',`profile_link` text COMMENT 'User Profile Link',`gender` enum('male','female','other') DEFAULT NULL COMMENT 'User Gender (Male / Female / Other)',`election_id` varchar(100) DEFAULT NULL COMMENT 'Govt ID Proof - Election ID (Encrypted)',`election_id_img` text COMMENT 'File Upload of Election ID',`citizenship_id` varchar(255) DEFAULT NULL COMMENT 'National ID / Citizenship ID',`citizenship_id_img` text COMMENT 'File Upload of National ID / Citizenship ID',`aadhar_id` varchar(255) DEFAULT NULL COMMENT 'Biometric / Aadhar ID', `aadhar_id_img` text COMMENT 'File Upload of Biometric ID / Aadhar ID',`passport_no` varchar(255) DEFAULT NULL COMMENT 'Passport Number',`driving_license` varchar(255) DEFAULT NULL COMMENT 'Driving License',`driving_license_img` text COMMENT 'File Upload of Driving License',`trust_score` varchar(255) DEFAULT NULL COMMENT 'Trust Score of User',`wealth_score` varchar(255) DEFAULT NULL COMMENT 'Wealth Score of User',`response_score` varchar(255) DEFAULT NULL COMMENT 'Response Score Of User',`win_score` varchar(255) DEFAULT NULL COMMENT 'Win Score of User',`critical_time_score` varchar(255) DEFAULT NULL COMMENT 'Critical Time Score of User',`avg_rating` varchar(255) DEFAULT NULL COMMENT 'Average Rating of User',`total_rating` varchar(255) DEFAULT NULL COMMENT 'Total Number of Ratings of User',`reviews` varchar(255) DEFAULT NULL COMMENT 'Reviews of User', `card_info` varchar(255) DEFAULT NULL COMMENT 'Card Info of User',`payment_info` varchar(255) DEFAULT NULL COMMENT 'Payment Info of User',`login_status` enum('0','1') DEFAULT '0' COMMENT '''0''=''Not Logged In'', ''1''=''Logged In''', `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of Record Creation',`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Time of Record Updation') ENGINE=InnoDB DEFAULT CHARSET=latin1");

									}


									/* Fetch Cust-Team and Cust-Client table Values of Admin-Customer-1 */
									mysqlConnection.query('SELECT customer_team_tbl, customers_customer_tbl FROM '+ users_table +' WHERE reg_id = "'+ customer1_reg_id +'" ', (err, rows, fields)=>{
										if(!err){
											var count_cust1_rows = rows.length;
											if(count_cust1_rows){
												var cust1_team_tbl = rows[0].customer_team_tbl;
												var cust1_cust_tbl = rows[0].customers_customer_tbl;

												/* Fetch Cust-Team and Cust-Client table Values of Admin-Customer-2 */
												mysqlConnection.query('SELECT customer_team_tbl, customers_customer_tbl FROM '+ users_table +' WHERE reg_id = "'+ customer2_reg_id +'" ', (err, rows, fields)=>{
													if(!err){
														var count_cust2_rows = rows.length;

														if(count_cust2_rows){
															var cust2_team_tbl = rows[0].customer_team_tbl;
															var cust2_cust_tbl = rows[0].customers_customer_tbl;

														}else{
															res.json({
																'status'   		  : '200',
																'message'         : 'success',
																'data'            : 'Please provide correct Customer-2-Reg-Id!'
															});
														}

													/* Merge Two Customer's-Customer Tables Data and Insert Into Newly Created Customer's-Customer Table */
													if(customers_customer_tbl == "yes"){
														mysqlConnection.query('INSERT INTO '+ customer_table +' (business_user_type, system_user_type, user_state, email_state, phone_state, master_client, reg_id, registrar_app_id, admin_cust_id, provisions_to_apps, app_id, roles, groups, connected_to, connected_as, contact_person_photo, contact_person_name, org_name, contact_person_email, org_email, contact_person_phone, org_phone, username, password, email, phone, org_reg_id, dob, about_user, country_name, address, pincode, profile_link, gender, election_id, election_id_img, citizenship_id, citizenship_id_img, aadhar_id, aadhar_id_img, passport_no, driving_license, driving_license_img, trust_score, wealth_score, response_score, win_score, critical_time_score, avg_rating, total_rating, reviews, card_info, payment_info, login_status, created_at, modified_at) SELECT business_user_type, system_user_type, user_state, email_state, phone_state, master_client, reg_id, registrar_app_id, admin_cust_id, provisions_to_apps, app_id, roles, groups, connected_to, connected_as, contact_person_photo, contact_person_name, org_name, contact_person_email, org_email, contact_person_phone, org_phone, username, password, email, phone, org_reg_id, dob, about_user, country_name, address, pincode, profile_link, gender, election_id, election_id_img, citizenship_id, citizenship_id_img, aadhar_id, aadhar_id_img, passport_no, driving_license, driving_license_img, trust_score, wealth_score, response_score, win_score, critical_time_score, avg_rating, total_rating, reviews, card_info, payment_info, login_status, created_at, modified_at FROM '+ cust1_cust_tbl +' UNION ALL  SELECT business_user_type, system_user_type, user_state, email_state, phone_state, master_client, reg_id, registrar_app_id, admin_cust_id, provisions_to_apps, app_id, roles, groups, connected_to, connected_as, contact_person_photo, contact_person_name, org_name, contact_person_email, org_email, contact_person_phone, org_phone, username, password, email, phone, org_reg_id, dob, about_user, country_name, address, pincode, profile_link, gender, election_id, election_id_img, citizenship_id, citizenship_id_img, aadhar_id, aadhar_id_img, passport_no, driving_license, driving_license_img, trust_score, wealth_score, response_score, win_score, critical_time_score, avg_rating, total_rating, reviews, card_info, payment_info, login_status, created_at, modified_at FROM '+ cust2_cust_tbl , (err, rows, fields)=>{
															if(!err){

																/* Get Last-Inserted ID */

																/* Update Admin-Customer-ID in Customer-Team and Customer's-Customer Table*/
																mysqlConnection.query('SELECT id FROM '+ customer_table, (err, rows, fields)=>{
																	if(!err){
																		var total_rows_client = rows.length;
																		for(var c=1; c<=total_rows_client; c++){
																			mysqlConnection.query('UPDATE '+ customer_table +' SET  admin_cust_id = "'+ last_inserted_id +'" AND master_client = "'+ last_inserted_id +'" WHERE id = '+c);
																		}
																	}else{
																		console.log(err);
																	}
																});

																/*Delete existing customer's-customer tables from database*/
																mysqlConnection.query('DROP TABLE '+ cust1_cust_tbl);
																mysqlConnection.query('DROP TABLE '+ cust2_cust_tbl);
																//}

															}else{
																console.log(err);
															}
														});
													}

													/* Merge Two Customer's-Team Tables Data and Insert Into Newly Created Customer's-Team Table */
													if(customer_team_tbl == "yes"){
														mysqlConnection.query('INSERT INTO '+ team_table +' (business_user_type, system_user_type, user_state, email_state, phone_state, master_client, reg_id, registrar_app_id, admin_cust_id, provisions_to_apps, app_id, roles, groups, connected_to, connected_as, contact_person_photo, contact_person_name, org_name, contact_person_email, org_email, contact_person_phone, org_phone, username, password, email, phone, org_reg_id, dob, about_user, country_name, address, pincode, profile_link, gender, election_id, election_id_img, citizenship_id, citizenship_id_img, aadhar_id, aadhar_id_img, passport_no, driving_license, driving_license_img, trust_score, wealth_score, response_score, win_score, critical_time_score, avg_rating, total_rating, reviews, card_info, payment_info, login_status, created_at, modified_at) SELECT business_user_type, system_user_type, user_state, email_state, phone_state, master_client, reg_id, registrar_app_id, admin_cust_id, provisions_to_apps, app_id, roles, groups, connected_to, connected_as, contact_person_photo, contact_person_name, org_name, contact_person_email, org_email, contact_person_phone, org_phone, username, password, email, phone, org_reg_id, dob, about_user, country_name, address, pincode, profile_link, gender, election_id, election_id_img, citizenship_id, citizenship_id_img, aadhar_id, aadhar_id_img, passport_no, driving_license, driving_license_img, trust_score, wealth_score, response_score, win_score, critical_time_score, avg_rating, total_rating, reviews, card_info, payment_info, login_status, created_at, modified_at FROM '+ cust1_team_tbl +' UNION ALL  SELECT business_user_type, system_user_type, user_state, email_state, phone_state, master_client, reg_id, registrar_app_id, admin_cust_id, provisions_to_apps, app_id, roles, groups, connected_to, connected_as, contact_person_photo, contact_person_name, org_name, contact_person_email, org_email, contact_person_phone, org_phone, username, password, email, phone, org_reg_id, dob, about_user, country_name, address, pincode, profile_link, gender, election_id, election_id_img, citizenship_id, citizenship_id_img, aadhar_id, aadhar_id_img, passport_no, driving_license, driving_license_img, trust_score, wealth_score, response_score, win_score, critical_time_score, avg_rating, total_rating, reviews, card_info, payment_info, login_status, created_at, modified_at FROM '+ cust2_team_tbl , (err, rows, fields)=>{
															if(!err){
																/*Delete existing customer-team tables from database*/
																mysqlConnection.query('DROP TABLE '+ cust1_team_tbl);
																mysqlConnection.query('DROP TABLE '+ cust2_team_tbl);

															}else{
																console.log(err);
															}
														});


														/* Delete Customer1 and Customer2 Tables in Database */
														//admin_cust_id



													}
													

													}else{
														console.log(err);
													}
												});


											}else{
												res.json({
													'status'   		  : '200',
													'message'         : 'success',
													'data'            : 'Please provide correct Customer-1-Reg-Id!'
												});
											 }

										}else{
											console.log(err);
										}
									});
									

									/*Send API Response*/
									res.json({
											'status'   		  : '200',
											'message'         : 'success',
											'data'            : 'Successfully Signed Up!',
											'registration_id' : reg_id
									});


								}else{
									console.log(err);
								}
							});
						}
						//***    UNION ALL DO HERE  (end)   **///
						
						else if(contact_person_email == org_email){
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Contact Person Email and Organization Email cannot be same!'
							});
						}
						else if(contact_person_phone == org_phone){
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Contact Person Phone and Organization Phone cannot be same!'
							});
						}

				}
				else{
					console.log(err);
				}
			});

	}
	else{
		console.log(err);
	}
		
});


/* List of Team Members of an Admin Customer for all 3rd-Party Apps sharing same User-Table (private/public) */
	// router.post("/api/team_member_list_by_usertbl", (req, res) => {
	// 	var system_user_type			 = req.body.system_user_type;
	// 	var admin_cust_id   	  		 = req.body.admin_cust_id;
	// 	var app_id   	  		 		 = req.body.app_id;
	// 	var app_secret   	  		 	 = req.body.app_secret;
	// 	var selected_table   			 = app_table_type = "";
	// 	var data 						 = [];
			
	// 	/* Replace undefined values with blank values */
	// 	if(admin_cust_id === undefined){
	// 		admin_cust_id = "";
	// 	}
			
	// 	if((admin_cust_id !== '')){
	// 		/* Fetch The Table-Type */
	// 		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = "'+ app_id +'" AND app_secret = "'+ app_secret +'" ', (err, rows, fields)=>{
	// 			if(!err){
	// 					var count = rows.length;
	// 					if(count>0){
	// 						app_table_type = rows[0].table_type;
	// 						var app_id_pk  = rows[0].id;
	// 					}		
	// 					var users_table = app_table_type + "_users";

	// 					/* SQL Query */
	// 					mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE id = "'+ admin_cust_id +'" AND system_user_type = "customer" ', (err, rows, fields)=>{
	// 						if(!err){
	// 							var count_admin_user = rows.length;
	// 							if(count_admin_user > 0){
	// 								/* Select Table */
	// 								if(system_user_type == "customer_team"){
	// 									selected_table = rows[0].customer_team_tbl;

	// 								}else if(system_user_type == "customer_client"){
	// 									selected_table = rows[0].customers_customer_tbl;
	// 								}

	// 								mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE admin_cust_id = "'+ admin_cust_id +'"', (err, rows, fields)=>{
	// 									if(!err){
	// 										var count_admin_user = rows.length;
	// 										if(count_admin_user > 0){
	// 											res.json({
	// 												'status'   : '200',
	// 												'message'  : 'success',
	// 												'data'	   : rows
	// 											});
	// 										}else{
	// 											res.json({
	// 												'status'   : '200',
	// 												'message'  : 'success',
	// 												'data'	   : data
	// 											});
	// 										}
	// 									}else{
	// 										console.log(err);
	// 									}
	// 								});
	// 							}
	// 							else{
	// 								res.json({
	// 									'status'   : '200',
	// 									'message'  : 'error',
	// 									'data'	   : 'Please provide correct Admin-Customer-Id!'
	// 								});
	// 							}

	// 						}else{
	// 							console.log(err);
	// 						}
	// 					});

	// 			}else{
	// 				res.json({
	// 					'status'   : '200',
	// 					'message'  : 'success',
	// 					'data'	   : 'Please provide correct App-ID and App-Secret!'
	// 				});
	// 			}
	// 		});

	// 	}else{
	// 			res.json({
	// 					'status'   : '200',
	// 					'message'  : 'error',
	// 					'data'	   : 'Admin-Customer-Id cannot be blank!'
	// 			});
	// 	}

	// });
router.post("/api/team_member_list_by_usertbl", (req, res) => {
	var admin_cust_reg_id   	  	 = req.body.admin_cust_reg_id;
	var app_id   	  		 		 = req.body.app_id;
	var app_secret   	  		 	 = req.body.app_secret;
	var selected_table   			 = app_table_type = "";
	var data 						 = [];
		
	/* Replace undefined values with blank values */
	if(admin_cust_reg_id === undefined){
		admin_cust_reg_id = "";
	}
		
	if((admin_cust_reg_id !== '')){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
				}		
				var users_table = app_table_type + "_users";

				/* SQL Query */
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" AND system_user_type = "customer" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					if(!err){
						var count_admin_user = rows.length;
						if(count_admin_user > 0){
							selected_table    = rows[0].customer_team_tbl;
							var admin_cust_id = rows[0].id;

							mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE admin_cust_id = "'+ admin_cust_id +'" ', [],(err, rows, fields)=>{
								if(!err){
									var count_admin_user = rows.length;
									if(count_admin_user > 0){
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : rows
										});
									}else{
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : data
										});
									}
								}else{
									console.log(err);
								}
							});
						}
						else{
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Please provide correct Admin-Customer-Id!'
							});
						}

					}else{
						console.log(err);
					}
				});

			}
			else{
				res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Please provide correct App-ID and App-Secret!'
				});
			}
		});

	}else{
			res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Please provide correct Admin-Customer-Id!'
			});
	}

});


/* List of Team Members of an Admin Customer for a particular Registrar App (private/public) */
router.post("/api/team_member_list_by_app", (req, res) => {
	var admin_cust_id   	  		 = req.body.admin_cust_id;
	var app_id   	  		 		 = req.body.app_id;
	var app_secret   	  		 	 = req.body.app_secret;
	var selected_table   			 = app_table_type = "";
	var data 						 = [];
		
	/* Replace undefined values with blank values */
	if(admin_cust_id === undefined){
		admin_cust_id = "";
	}
		
	if((admin_cust_id !== '')){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				var count = rows.length;
				if(count>0){
					app_table_type = rows[0].table_type;
					var app_id_pk  = rows[0].id;
				}		
				var users_table = app_table_type + "_users";

				/* SQL Query */
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE id = "'+ admin_cust_id +'" AND system_user_type = "customer" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					if(!err){
						var count_admin_user = rows.length;
						if(count_admin_user > 0){
							selected_table = rows[0].customer_team_tbl;

							mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE admin_cust_id = "'+ admin_cust_id +'" AND app_id = "'+ app_id_pk +'" ', [],(err, rows, fields)=>{
								if(!err){
									var count_admin_user = rows.length;
									if(count_admin_user > 0){
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : rows
										});
									}else{
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : data
										});
									}
								}else{
									console.log(err);
								}
							});
						}
						else{
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Please provide correct Admin-Customer-Id!'
							});
						}

					}else{
						console.log(err);
					}
				});

				// mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE admin_cust_id = "'+ admin_cust_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					// 	if(!err){
					// 		var count_user = rows.length;
					// 		if(count_user > 0){
					// 				res.json({
					// 					'status'   : '200',
					// 					'message'  : 'success',
					// 					'data'	   : rows
					// 				});
					// 		}else{
					// 			res.json({
					// 					'status'   : '200',
					// 					'message'  : 'success',
					// 					'data'	   : data
					// 				});
					// 		}

					// 	}else{
					// 		console.log(err);
					// 	}
				// });

			}
			else{
				res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Please provide correct App-ID and App-Secret!'
				});
			}
		});

	}else{
			res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Please provide correct Admin-Customer-Id!'
			});
	}

});


/* List of Customers of an Admin Customer for all 3rd-Party Apps sharing same User-Table (private/public) */
	// router.post("/api/customer_list_by_usertbl", (req, res) => {
	// 	var admin_cust_reg_id   	  	 = req.body.admin_cust_reg_id;
	// 	var app_id   	  		 		 = req.body.app_id;
	// 	var app_secret   	  		 	 = req.body.app_secret;
	// 	var selected_table   			 = app_table_type = "";
	// 	var data 						 = [];
	// 	//var user_table_type				 = req.body.user_table_type;	
	// 	//var users_table					 = user_table_type + "_users";

	// 	/* Replace undefined values with blank values */
	// 	if(admin_cust_reg_id === undefined){
	// 		admin_cust_reg_id = "";
	// 	}
			
	// 	if((admin_cust_reg_id !== '')){
	// 		/* Fetch The Table-Type */
	// 		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
	// 			if(!err){
	// 				var count = rows.length;
	// 				if(count>0){
	// 					app_table_type = rows[0].table_type;
	// 					var app_id_pk  = rows[0].id;
	// 				}		
	// 				var users_table = app_table_type + "_users";

	// 				/* SQL Query */
	// 				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE admin_cust_id = ? AND system_user_type = ?', [admin_cust_id, 'customer_client'],(err, rows, fields)=>{
	// 					if(!err){
	// 						var count_user = rows.length;
	// 						if(count_user > 0){
	// 								res.json({
	// 									'status'   : '200',
	// 									'message'  : 'success',
	// 									'data'	   : rows
	// 								});
	// 						}else{
	// 							res.json({
	// 									'status'   : '200',
	// 									'message'  : 'success',
	// 									'data'	   : data
	// 								});
	// 						}

	// 					}else{
	// 						console.log(err);
	// 					}
	// 				});

	// 			}else{
	// 					res.json({
	// 						'status'   : '200',
	// 						'message'  : 'success',
	// 						'data'	   : 'Please provide correct App-ID and App-Secret!'
	// 					});
	// 				}
	// 			});

	// 	}else{
	// 			res.json({
	// 					'status'   : '200',
	// 					'message'  : 'error',
	// 					'data'	   : 'Please provide correct Admin-Customer-Id!'
	// 			});
	// 	}

	// });
router.post("/api/customer_list_by_usertbl", (req, res) => {
	var admin_cust_reg_id   	  	 = req.body.admin_cust_reg_id;
	var app_id   	  		 		 = req.body.app_id;
	var app_secret   	  		 	 = req.body.app_secret;
	var selected_table   			 = app_table_type = "";
	var data 						 = [];
		
	/* Replace undefined values with blank values */
	if(admin_cust_reg_id === undefined){
		admin_cust_reg_id = "";
	}
		
	if((admin_cust_reg_id !== '')){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				app_table_type  = rows[0].table_type;
				var app_id_pk   = rows[0].id;		
				var users_table = app_table_type + "_users";

				/* SQL Query */
				// mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE admin_cust_id = ? AND system_user_type = ? AND registrar_app_id = ?', [admin_cust_id, 'customer_team', registrar_app_id],(err, rows, fields)=>{

				/* SQL Query */
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" AND system_user_type = "customer" ', (err, rows, fields)=>{
					if(!err){
						var count_admin_user = rows.length;
						var admin_cust_id 	 = rows[0].id;
						if(count_admin_user > 0){
							selected_table = rows[0].customers_customer_tbl;

							mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE admin_cust_id = "'+ admin_cust_id +'" ', (err, rows, fields)=>{
								if(!err){
									var count_admin_user = rows.length;
									if(count_admin_user > 0){
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : rows
										});
									}else{
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : data
										});
									}
								}else{
									console.log(err);
								}
							});
						}
						else{
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Please provide correct Admin-Customer-Id!'
							});
						}

					}else{
						console.log(err);
					}
				});

			}
			else{
				res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Please provide correct App-ID and App-Secret!'
				});
			}
		});

	}else{
			res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Please provide correct Admin-Customer-Id!'
			});
	}

});


/* List of Customers of an Admin Customer for a particular Registrar App (private/public) */
router.post("/api/customer_list_by_app", (req, res) => {
	var admin_cust_reg_id   	  	 = req.body.admin_cust_reg_id;
	var app_id   	  		 		 = req.body.app_id;
	var app_secret   	  		 	 = req.body.app_secret;
	var selected_table   			 = app_table_type = "";
	var data 						 = [];
		
	/* Replace undefined values with blank values */
	if(admin_cust_reg_id === undefined){
		admin_cust_reg_id = "";
	}
		
	if((admin_cust_reg_id !== '')){
		/* Fetch The Table-Type */
		mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
			if(!err){
				app_table_type  = rows[0].table_type;
				var app_id_pk   = rows[0].id;		
				var users_table = app_table_type + "_users";

				/* SQL Query */
				// mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE admin_cust_id = ? AND system_user_type = ? AND registrar_app_id = ?', [admin_cust_id, 'customer_team', registrar_app_id],(err, rows, fields)=>{

				/* SQL Query */
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" AND system_user_type = "customer" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					if(!err){
						var count_admin_user = rows.length;
						var admin_cust_id 	 = rows[0].id;
						if(count_admin_user > 0){
							selected_table = rows[0].customers_customer_tbl;

							mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE admin_cust_id = "'+ admin_cust_id +'" AND app_id = "'+ app_id_pk +'" ', (err, rows, fields)=>{
								if(!err){
									var count_admin_user = rows.length;
									if(count_admin_user > 0){
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : rows
										});
									}else{
										res.json({
											'status'   : '200',
											'message'  : 'success',
											'data'	   : data
										});
									}
								}else{
									console.log(err);
								}
							});
						}
						else{
							res.json({
								'status'   : '200',
								'message'  : 'error',
								'data'	   : 'Please provide correct Admin-Customer-Id!'
							});
						}

					}else{
						console.log(err);
					}
				});

			}
			else{
				res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Please provide correct App-ID and App-Secret!'
				});
			}
		});

	}else{
			res.json({
					'status'   : '200',
					'message'  : 'error',
					'data'	   : 'Please provide correct Admin-Customer-Id!'
			});
	}

});


/* List of Admin Customers for a Self App (private/public) */
router.post("/api/admin_customer_list_by_usertbl", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var selected_table   			 = app_table_type = "";
	var data 						 = [];

	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type = rows[0].table_type;
				var app_id_pk  = rows[0].id;
			}		
			var users_table = app_table_type + "_users";

			/* SQL Query */
			mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE admin_cust_id = ? AND system_user_type = ? ', ['0', 'customer'],(err, rows, fields)=>{
				if(!err){
					var count_user = rows.length;
					if(count_user > 0){
							res.json({
								'status'   : '200',
								'message'  : 'success',
								'data'	   : rows
							});
					}else{
						res.json({
								'status'   : '200',
								'message'  : 'success',
								'data'	   : data
							});
					}

				}else{
					console.log(err);
				}
			});

		}
		else{
			res.json({
					'status'   : '200',
					'message'  : 'success',
					'data'	   : 'Please provide correct App-ID and App-Secret!'
			});
		}
	});

});


/* List of Admin Customers for a Self App (private/public) */
router.post("/api/admin_customer_list_under_selfapp", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var data 						 = [];

	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type = rows[0].table_type;
				var app_id_pk  = rows[0].id;
			}		
			var users_table = app_table_type + "_users";

			/* SQL Query */
			//mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE admin_cust_id = ? AND system_user_type = ? AND app_id = ?', ['0', 'customer', app_id_pk],(err, rows, fields)=>{//FIND_IN_SET('Gaurav',Name);
			mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE admin_cust_id = ? AND system_user_type = ? AND FIND_IN_SET("'+app_id_pk+'", app_id)', ['0', 'customer'],(err, rows, fields)=>{
				if(!err){
					var count_user = rows.length;
					if(count_user > 0){
							res.json({
								'status'   : '200',
								'message'  : 'success',
								'data'	   : rows
							});
					}else{
						res.json({
								'status'   : '200',
								'message'  : 'success',
								'data'	   : data
							});
					}

				}else{
					console.log(err);
				}
			});

		}
		else{
			res.json({
					'status'   : '200',
					'message'  : 'success',
					'data'	   : 'Please provide correct App-ID and App-Secret!'
			});
		}
	});

});


/* Logout User */
router.post("/api/logout_user", (req, res) => {
	var app_id     	  				 = req.body.app_id;
	var app_secret	  				 = req.body.app_secret;
	var system_user_type 			 = req.body.system_user_type;
	var master_client_reg_id  	   	 = req.body.master_client_reg_id ;
	var admin_cust_reg_id 			 = req.body.master_client_reg_id;
	var user_reg_id   	  			 = req.body.user_reg_id;
	// var username  	  				 = req.body.username;
	// var email   	  				 = req.body.email;
	// var phone   	  				 = req.body.phone;
	var selected_table				 = "";
	var data 						 = [];

	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type = rows[0].table_type;
				var app_id_pk  = rows[0].id;
			}		
			var users_table = app_table_type + "_users";

			if((user_reg_id != '')){
				/* Fetch The Table-Type */
				mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
					if(!err){
						var count = rows.length;
						if(count>0){
							app_table_type = rows[0].table_type;
							var app_id_pk  = rows[0].id;
							var user_table = app_table_type + "_users";
						}

						/* When Log-in User-type is Customer */
						if(user_table != "" && system_user_type == "customer"){
							/* Check Whether Customer Exists or not */
							mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE reg_id = "'+ user_reg_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
								if(!err){
									var count = rows.length;

									/* Successfully Log-Out */
									if(count > 0){
										var user_id = rows[0].id;
										mysqlConnection.query('UPDATE '+ user_table +' SET login_status = ? WHERE id = ?', ['0', user_id], (err, rows, fields)=>{
											if(!err){
												res.json({
														'status'   : '200',
														'message'  : 'success',
														'data'	   : 'Succesfully logged out!'
												});
											}
											else{
												console.log(err);
											}
										});
										
									}else{
										res.json({
												'status'   : '200',
												'message'  : 'error',
												'data'	   : 'Please provide correct user-id!'
										});
									}
								}
								else{
									console.log(err);
								}
							});
						}

						/* When Log-in User-type is Customer-Team Member / Customer's-Customer */				
						else if(user_table !== '' && admin_cust_reg_id !== "" && admin_cust_reg_id !== null && (system_user_type == "customer_team" || system_user_type == "customer_client")){
							/* Check Whether Cuatomer-Team Member / Customer's-Customer Exists or not */
							mysqlConnection.query('SELECT * FROM '+ user_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" ',(err, rows, fields)=>{
								if(!err){
									var count_admin_user = rows.length;
									var customer_id = rows[0].id; 
									/* Select the table */
									if(system_user_type == "customer_team"){
										selected_table = rows[0].customer_team_tbl;

									}else if(system_user_type == "customer_client"){
										selected_table = rows[0].customers_customer_tbl;
									}

									if(count_admin_user > 0){
										/* Successfully Log-Out */
										mysqlConnection.query('SELECT * FROM '+ selected_table +' WHERE reg_id = "'+ user_reg_id +'" AND admin_cust_id = "'+ customer_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
											if(!err){
												var count = rows.length;
												if(count>0){
													mysqlConnection.query('UPDATE '+ selected_table +' SET login_status = ? WHERE reg_id = ? AND admin_cust_id = ?', ['0', user_reg_id, customer_id], (err, rows, fields)=>{
														if(!err){
															res.json({
																	'status'   : '200',
																	'message'  : 'success',
																	'data'	   : 'Succesfully logged out!'
															});
														}
														else{
															console.log(err);
														}
													});
												}else{
													res.json({
															'status'   : '200',
															'message'  : 'error',
															'data'	   : 'Please provide correct email-id / phone-number / password / user-id!'
													});
												}
												
											}else{
												console.log(err);
											}
										});								
									}else{
										res.json({
												'status'   : '200',
												'message'  : 'error',
												'data'	   : 'Please provide correct master-client / admin-user-id!'
										});
									}
								}

								else{
									console.log(err);
								}
							});
						}

						/* If Incorrect App-ID / App-Secret is provided by API */
						else{
								res.json({
										'status'   : '200',
										'message'  : 'error',
										'data'	   : 'Please provide correct App-id / App-secret!'
								});
						}

					}
					else{
						console.log(err);
					}
				});

			}
			else{
				res.json({
						'status'   : '200',
						'message'  : 'error',
						'data'	   : 'Please provide correct credentials!'
				});
			}

		}
		else{
			console.log(err);
		}
	});

});


/* Delete a particular Customer */
router.post("/api/delete_customer", (req, res) => {
	var app_id         	  = req.body.app_id;
	var app_secret     	  = req.body.app_secret;
	var system_user_type  = req.body.system_user_type;
	//var master_client     = req.body.master_client;
	var delete_type    	  = req.body.delete_type;
	var user_reg_id 	  = req.body.user_reg_id;
	var email 		   	  = req.body.email;
	var phone 		   	  = req.body.phone_number;
	var username 	   	  = req.body.username;
	var app_table_type 	  = update_type_flag =  "";
	var data 		   	  = [];

	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type = rows[0].table_type;
				app_id_pk = rows[0].id;
			}
		
			var users_table = app_table_type + "_users";

			// /* If User_Type_Acc_to_System == Customers-Team / Customers-Client */	
			// if((system_user_type !== '') && ((system_user_type == "customer_team") || (system_user_type == "customer_client"))){
			// 	if((master_client !== null) && (master_client !== '')){
			// 		update_type_flag = true;
			// 	}else{
			// 		update_type_flag = false;
			// 	}
			// }else if((system_user_type != "customer_team") || (system_user_type != "customer_client")){
			// 		update_type_flag = true;
			// }


			if(user_reg_id !== "" && users_table !== null && system_user_type == "customer"){
					/* For Hard-Delete */
					if(delete_type == "hard"){
						mysqlConnection.query('DELETE FROM '+ users_table +' WHERE (reg_id = ? OR email = ? OR phone = ? OR username = ?) AND FIND_IN_SET("'+ app_id_pk +'", app_id)', [user_reg_id, email, phone, username], (err, rows, fields)=>{ 
							if(!err){
								res.json({
										'status'   : '200',
										'message'  : 'User deleted successfully',
										'data'	   : []
								});
							}
							else{
								console.log(err);
							}
						});
					}

					/* For Soft-Delete */
					else if(delete_type == "soft"){
						mysqlConnection.query('UPDATE '+ users_table +' SET user_state = ? WHERE (reg_id = ? OR email = ? OR phone = ? OR username = ?) AND FIND_IN_SET("'+ app_id_pk +'", app_id)', ['5', user_reg_id, email, phone, username], (err, rows, fields)=>{
							if(!err){
								res.json({
										'status'   : '200',
										'message'  : 'Customer deleted successfully',
										'data'	   : []
								});
							}
							else{
								console.log(err);
							}
						});
					}

			}else{
				res.json({
					'status'   : '200',
					'message'  : 'Please provide correct customer information!',
					'data'	   : []
				});
			}

		}
		else{
			console.log(err);
		}
	});

});


/* Delete a particular Customer-Team / Customer's-Team User */
router.post("/api/delete_customer_member", (req, res) => {
	var app_id         	  	 = req.body.app_id;
	var app_secret     	  	 = req.body.app_secret;
	var system_user_type 	 = req.body.system_user_type;
	var master_client_reg_id = req.body.master_client_reg_id;
	var admin_cust_reg_id    = req.body.master_client_reg_id;
	var delete_type    	     = req.body.delete_type;
	var user_reg_id 	   	 = req.body.user_reg_id;
	var email 		   	 	 = req.body.email;
	var phone 		   	 	 = req.body.phone_number;
	var username 	   	 	 = req.body.username;
	var app_table_type 	 	 = del_table = "";
	var update_type_flag 	 = false;
	var data 		   	 	 = [];

	/* Fetch The Table-Type */
	mysqlConnection.query('SELECT * FROM app_master WHERE app_id = ? AND app_secret = ?', [app_id, app_secret],(err, rows, fields)=>{
		if(!err){
			var count = rows.length;
			if(count>0){
				app_table_type = rows[0].table_type;
				app_id_pk = rows[0].id;
			}		
			var users_table = app_table_type + "_users";

			/* If User_Type_Acc_to_System == Customers-Team / Customers-Client */	
			if((system_user_type !== '') && ((system_user_type == "customer_team") || (system_user_type == "customer_client"))){
				if((master_client_reg_id !== null) && (master_client_reg_id !== '')){
					update_type_flag = true;
				}else{
					update_type_flag = false;
				}
			}


			if((update_type_flag == true) && (user_reg_id !== '')){
				/* Select Table Type */
				mysqlConnection.query('SELECT * FROM '+ users_table +' WHERE reg_id = "'+ admin_cust_reg_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
					if(!err){
						var admin_cust_id = rows[0].id;

						/* Select the table */
						if(system_user_type == "customer_team"){
							del_table = rows[0].customer_team_tbl;

						}else if(system_user_type == "customer_client"){
							del_table = rows[0].customers_customer_tbl;
						}
						

						//if(del_table !== ""){
							/* For Hard-Delete */
							if(delete_type == "hard"){
								mysqlConnection.query('DELETE FROM '+ del_table +' WHERE reg_id = "'+ user_reg_id +'" AND admin_cust_id = "'+ admin_cust_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{ 
									if(!err){
										res.json({
												'status'   : '200',
												'message'  : 'User deleted successfully',
												'data'	   : []
										});
									}
									else{
										console.log(err);
									}
								});
							}

							/* For Soft-Delete */
							else if(delete_type == "soft"){
								mysqlConnection.query('UPDATE '+ del_table +' SET user_state = "5" WHERE reg_id = "'+ user_reg_id +'" AND admin_cust_id = "'+ admin_cust_id +'" AND FIND_IN_SET("'+ app_id_pk +'", app_id)', (err, rows, fields)=>{
									if(!err){
										res.json({
												'status'   : '200',
												'message'  : 'User deleted successfully',
												'data'	   : []
										});
									}
									else{
										console.log(err);
									}
								});
							}
						//}

					}else{
						console.log(err);
					}

				});

			}else{
				res.json({
					'status'   : '200',
					'message'  : 'Please provide master-client information / user information!',
					'data'	   : []
				});
			}

		}
		else{
			console.log(err);
		}
	});

});


/* Login API */
// router.post("/api/user_login", (req, res) => {
	// 	var app_id     	  				 = req.body.app_id;
	// 	var app_secret	  				 = req.body.app_secret;
	// 	var business_user_type  	     = req.body.business_user_type;
	// 	var system_user_type 			 = req.body.system_user_type;
	// 	var user_state  	   	  		 = req.body.user_state ;
	// 	var master_client  	   	  		 = req.body.master_client ;
	// 	var contact_person_name  	   	 = req.body.contact_person_name ;
	// 	var org_name  	   	  		 	 = req.body.org_name ;
	// 	var contact_person_email  	   	 = req.body.contact_person_email ;
	// 	var org_email  	   	  		 	 = req.body.org_email ;
	// 	var contact_person_phone  	   	 = req.body.contact_person_phone ;
	// 	var org_phone  	   	  		 	 = req.body.org_phone ;
	// 	var username  	  				 = req.body.username;
	// 	var phone 	   	  	   			 = req.body.phone;
	// 	var password   	  				 = req.body.password;
	// 	//console.log(md5(password)); return false;
		

	// 	/* When user will Login using email and password */
	// 	if(email !== null && email !== '') {
	// 		var sql = 'SELECT u.* FROM users u LEFT JOIN app_master m on u.app_unique_id = m.unique_id LEFT JOIN user_app_rel r on r.app_id = m.id WHERE u.email = ' + mysql.escape(email) + ' AND u.password = ' + mysql.escape(md5(password)) + ' AND u.app_unique_id = ' + mysql.escape(app_id) +' AND r.role = '+ mysql.escape(user_type) + ' GROUP BY u.id';


	// 	//	var sql = 'SELECT *, users.app_unique_id as appUniqueId FROM users u WHERE `email` = ' + mysql.escape(email) + ' AND `password` = ' + mysql.escape(md5(password)) + ' AND `app_unique_id` = '+ mysql.escape(app_id) + ' LEFT JOIN app_master m on u.app_unique_id = m.unique_id LEFT JOIN user_app_rel r on r.app_id = m.id AND r.role = '+ mysql.escape(user_type) + ' ';
	// 		//console.log(sql); return false;

	// 		mysqlConnection.query(sql, (err, rows, fields)=>{
	// //		mysqlConnection.query('SELECT * FROM `users` WHERE `email` = ? AND `password` = ? AND `app_unique_id` = ?', [username, md5(password), app_id], (err, rows, fields)=>{
	// 			if(!err){
	// 				var count = rows.length;				
	// 				if(count>0){
	// 					res.json({
	// 							'status'   : '200',
	// 							'message'  : 'Succesfully logged in!',
	// 							'data'	   : rows 
	// 					});
	// 				}else{
	// 					res.json({
	// 							'status'   : '200',
	// 							'message'  : 'Please provide valid email/password !',
	// 							'data'	   : rows
	// 					});
	// 				}
	// 			}
	// 			else{
	// 				console.log(err);
	// 			}
	// 		});

	// 	}

	// 	/* When user will Login using username and password */
	// 	else if(username !== null && username !== '') {
	// 		var sql = 'SELECT u.* FROM users u LEFT JOIN app_master m on u.app_unique_id = m.unique_id LEFT JOIN user_app_rel r on r.app_id = m.id WHERE u.username = ' + mysql.escape(username) + ' AND u.password = ' + mysql.escape(md5(password)) + ' AND u.app_unique_id = ' + mysql.escape(app_id) +' AND r.role = '+ mysql.escape(user_type) + ' GROUP BY u.id';

	// 		mysqlConnection.query(sql, (err, rows, fields)=>{
	// 	//	mysqlConnection.query('SELECT * FROM users WHERE username = ? AND password = ? AND app_unique_id = ?', [username, md5(password), app_id], (err, rows, fields)=>{
	// 			if(!err){
	// 				var count = rows.length;
	// 				if(count>0){
	// 					res.json({
	// 							'status'   : '200',
	// 							'message'  : 'Succesfully logged in!',
	// 							'data'	   : rows 
	// 					});
	// 				}else{
	// 					res.json({
	// 							'status'   : '200',
	// 							'message'  : 'Please provide valid username/password!',
	// 							'data'	   : rows
	// 					});
	// 				}
	// 			}
	// 			else{
	// 				console.log(err);
	// 			}
	// 		});

	// 	}

	// 	/* When user will Login using phone-number and password */
	// 	else if(phone !== null && phone !== ''){
	// 		var sql = 'SELECT u.* FROM users u LEFT JOIN app_master m on u.app_unique_id = m.unique_id LEFT JOIN user_app_rel r on r.app_id = m.id WHERE u.phone = ' + mysql.escape(phone) + ' AND u.password = ' + mysql.escape(md5(password)) + ' AND u.app_unique_id = ' + mysql.escape(app_id) +' AND r.role = '+ mysql.escape(user_type) + ' GROUP BY u.id';

	// 	mysqlConnection.query(sql, (err, rows, fields)=>{
	// 	//	mysqlConnection.query('SELECT * FROM users WHERE phone = ? AND password = ? AND app_unique_id = ?', [username, md5(password), app_id], (err, rows, fields)=>{
	// 			if(!err){
	// 				var count = rows.length;
	// 				if(count>0){
	// 					res.json({
	// 							'status'   : '200',
	// 							'message'  : 'Succesfully logged in!',
	// 							'data'	   : rows 
	// 					});
	// 				}else{
	// 					res.json({
	// 							'status'   : '200',
	// 							'message'  : 'Please provide valid phone-number/password!',
	// 							'data'	   : rows
	// 					});
	// 				}
	// 			}
	// 			else{
	// 				console.log(err);
	// 			}
	// 		});
	// 	}
// });


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


router.post("/api/sendMail", () => {
		var nodemailer = require('nodemailer');

		var transporter = nodemailer.createTransport({
		  //service: 'gmail',
		  host: "smtp.gmail.com",
		  port: 587,
		  secure: false, // true for 465, false for other ports
		  auth: {
		    // user: 'kalyanachar@gmail.com',
		    // pass: 'Kallol321@'
		     user: 'shyamdemo2018@gmail.com', // generated ethereal user
			 pass: 'hjtrgqurebsusywx' // generated ethereal password
		  }
		});

		var mailOptions = {
		  from: 'kalyanachar@gmail.com',
		  to: 'kalyan.acharya@shyamfuture.com',
		  subject: 'Sending Email using Node.js',
		  text: 'That was easy!'
		};

		console.log(mailOptions);
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email sent: ' + info.response);
		  }
		});
})

// router.post("/api/testapi", () => {
// 	var tableName = "customers";


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