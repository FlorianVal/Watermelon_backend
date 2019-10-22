const bcrypt = require('bcrypt'),
  saltRounds = 10;
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = function(app, db) {
  //TODO create also wallet
  //create new user
  app.post("/v1/users", function(req, res) {
    let first_name = req.body.first_name,
      last_name = req.body.last_name,
      email = req.body.email,
      password = req.body.password,
      is_admin = JSON.parse(req.body.is_admin),
      api_key = Math.random().toString(36).substring(7);;

    bcrypt.hash(password, saltRounds, function(err, hash) {
      let query = `INSERT INTO users (first_name, last_name, email, password, is_admin, api_key) VALUES ('${first_name}', '${last_name}', '${email}', '${hash}', ${is_admin}, '${api_key} ')`;
      console.log(query);
      db.query(query, function(err, result, fields) {
        let id_query = `SELECT * FROM users WHERE email="${email}"`;
        db.query(id_query, function(errid, resultid, fields) {
          let id = resultid[0].id;
          res.status(200).send({
            "id": id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "access_token": api_key,
            "is_admin": is_admin
          })
        });
      });
    });
  });

  //get all users
  app.post("/v1/login", function(req, res) {
    let email = req.body.email,
      password = req.body.password;
    //get hash of password
    if (!email) {
      console.log("no mail");
      res.status(401).send("no email specified")
    } else if (!password) {
      res.status(401).send("no pass specified")
    } else {
      let pass_query = `SELECT password FROM users WHERE email='${email}'`;
      console.log(email);
      db.query(pass_query, function(err, result, fields) {
        if (err) {
          console.log("Error login 1");
          res.status(500).send("Error")
        };
        if (result.length > 0) {
          bcrypt.compare(password, result[0].password).then(function(crypt_res) {
            //success
            if (crypt_res == true) {
              let api_query = `SELECT api_key FROM users WHERE email='${email}'`;
              db.query(api_query, function(err, result_api, fields) {
                // wrong response serialization
                res.status(200).send({"access_token":result_api[0].api_key});
                console.log(result_api[0].api_key);
              })
            } else {
              console.log("no password match");
              res.status(401).send("Password do not match")
            }
          })
        } else {
          console.log("no user");
          res.status(401).send("User not found")
        }
      });
    }
  });
}
