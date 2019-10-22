const express = require('express');
const bcrypt = require('bcrypt'),
  saltRounds = 10;
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const fs = require('fs');

let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "Watermelon_backend",
  port: "8889"
});

// will use json for data
index = 0

app.use(bodyParser.urlencoded({"extended": true}));
app.use(function(req, res, next) {
  console.log(index);
  index += 1
  console.log(req.url);
  console.log(req.method);
  console.log(req.headers);
  console.log(req.body);
  console.log("End of request \n");
  next()
})

require('./src/unauth_users')(app, db);
//middleware
app.use(function(req, res, next) {
  if ("x-auth-token" in req.headers) {
    let token = req.headers["x-auth-token"];
    let query = `SELECT * FROM users WHERE api_key='${token}'`;
    db.query(query, function(err, result, fields) {
      if (err) {
        res.status(401).send("Error")
      };
      if (result.length > 0) {
        req.body.active_user = result[0]
        next();
      } else {
        console.log(result);
        console.log("Access denied no api key match");
        res.status(401).send("Access denied");
      }
    });
  } else {
    console.log("No access in headers");
    res.status(401).send("Access denied");
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
