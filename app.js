const express = require('express');
const bcrypt = require('bcrypt'),
  saltRounds = 10;
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

// will use json for data
app.use(bodyParser.json());

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

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
