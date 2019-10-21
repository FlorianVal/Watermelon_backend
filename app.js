const express = require('express');
const bcrypt = require('bcrypt'),
  saltRounds = 10;
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');


let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "Watermelon",
  port: "8889"
});

// will use json for data
app.use(bodyParser.json());

require('./src/unauth_users')(app, db);

//middleware
app.use(function(req, res, next) {
  if ("x-auth-token" in req.headers) {
    let token = req.headers["x-auth-token"];
    let query = `SELECT * FROM users WHERE api_key='${token}'`;
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      if (result.length > 0) {
        req.body.active_user = result[0]
        next();
      } else {
        res.send("Access denied");
      }
    });
  } else {
    res.send("Access denied");
  }
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
