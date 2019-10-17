var express      = require('express');
const app        = express();
const bodyParser = require('body-parser');
const mysql 	 = require('mysql');
//const mongoose   = require('mongoose');

app.use(bodyParser.json());


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});




// ********  Connect to MySql ********* //
// var mysqlConnection = mysql.createConnection({
// 	host 	 : 'localhost',
// 	user     : 'root',
// 	password : '',
// 	database : 'sso'
// });

// mysqlConnection.connect((err) => {
// 	if(!(err))
// 		console.log("DB connection succeeded");
// 	else
// 		console.log("DB Connectoin Failed! \n Error: " + JSON.stringify(err, undefined, 2));
// });




// **********  PORT  ********* //
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port: ${port}...`));







// ********  Router  ******** //
const router = require('./routes/users.js');

// router.get('/messages', (req, res) => {
// 	console.log("Testing Router");
// 	//res.send('Re2 Testing router in Browser! (^_^) ');
// 	res.end();
// });

app.use(router);







// **********  API  ********* //
app.get('/', function(req, res) {
    // render to views/index.ejs template file
    //res.render('index', {title: 'My Node.js Application'});
    res.send('Welcome to My Node.js Application');
});



