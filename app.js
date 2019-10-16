const express = require('express');
const bcrypt = require('bcrypt'),
  saltRounds = 10;
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

// will use json for data
app.use(bodyParser.json());
app.use(function(req,res,next){
  res.status(404);
});

let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "Watermelon",
  port: "8889"
});

require('./src/users')(app, db);
require('./src/cards')(app, db);
require('./src/wallet')(app, db);
require('./src/payins')(app, db);
require('./src/payouts')(app, db);
require('./src/transfers')(app, db);


app.listen(8000, function() {
  console.log('Example app listening on port 8000!');
});
