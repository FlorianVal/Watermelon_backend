const express = require('express');
const bcrypt = require('bcrypt'),
  saltRounds = 10;
const app = express();
var cors = require('cors');
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
/*table = ["payins", "wallets", "payouts", "cards", "transfers", "users"]
for (i in table) {
  let empty_query = `DELETE FROM ${table[i]}`
  db.query(empty_query, function(err, result, fields) {
    if (err) {
      console.log(err);
      console.log("can't clean database");
      return
    }
  })
}*/
// will use json for data
index = 0

app.use(bodyParser.urlencoded({
  "extended": true
}));
app.use(cors())
app.use(function(req, res, next) {
  console.log("\n///////////////////////////////////");
  console.log(index);
  index += 1
  console.log(req.url);
  console.log(req.method);
  console.log(req.headers);
  console.log(req.body);
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
        console.log(err);
        res.status(401).send("Error")
        return
      };
      if (result.length > 0) {
        req.body.active_user = result[0]
        let wallet_query = `SELECT * FROM wallets WHERE user_id=${req.body.active_user.id}`
        db.query(wallet_query, function(err, result, fields) {
          if (err) {
            console.log(err);
            res.status(401).send("Error")
            return
          };
          req.body.active_user_wallet = result[0]
          console.log("Done through firewall\nActive user:");
          console.log(req.body.active_user);
          next();

        })
      } else {
        console.log(token);
        console.log("Access denied no api key match");
        res.status(401).send("Access denied");
        return
      }
    });
  } else {
    console.log("No access token in headers");
    res.status(401).send("Access denied");
    return
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
