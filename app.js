const express = require('express');
const bcrypt = require('bcrypt'),
      saltRounds = 10,
      myPlaintextPassword = 's0/\/\P4$$w0rD',
      someOtherPlaintextPassword = 'not_bacon';
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

app.post("/users", function(req, res) {
  console.log(req.body);
  let first_name = req.body.first_name,
      last_name = req.body.last_name,
      email = req.body.email,
      password = req.body.password,
      is_admin = 0,
      api_key = Math.random().toString(36).substring(7);
  bcrypt.hash(password, saltRounds, function(err, hash) {
    let query = `INSERT INTO users (first_name, last_name, email, password, is_admin, api_key) VALUES ('${first_name}', '${last_name}', '${email}', '${hash}', '${is_admin}', '${api_key} ')`;
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify("Success"));
    });
    bcrypt.compare(password, hash).then(function(res) {
      console.log(res);
  });
  });

});


app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
