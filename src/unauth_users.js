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
      api_key = Math.random().toString(36).substring(7);

    if (req.body.is_admin == undefined) {
      is_admin = 0
    } else {
      is_admin = JSON.parse(req.body.is_admin)
    }

    if (first_name == undefined || last_name == undefined || email == undefined || password == undefined) {
      console.log("A field is undefined while creating user");
      res.status(400).send("Please specify all argument to create user")
      return
    }
    if(email.split("@").length == 1){
      console.log("Wrong email");
      res.status(400).send("Wrong email")
      return
    }
    bcrypt.hash(password, saltRounds, function(err, hash) {
      let query = `INSERT INTO users (first_name, last_name, email, password, is_admin, api_key) VALUES ('${first_name}', '${last_name}', '${email}', '${hash}', ${is_admin}, '${api_key} ')`;
      console.log(query);
      db.query(query, function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(400).send("SQL error")
          return
        }

        let id_query = `SELECT * FROM users WHERE email="${email}"`;
        db.query(id_query, function(id_err, result_id, fields) {
          if (id_err) {
            console.log(err);
            res.status(500).send("SQL error")
            return
          }
          let id = result_id[0].id;

          //create wallet
          let wallet_query = `INSERT INTO wallets (user_id) VALUES (${id})`
          db.query(wallet_query, function(wallet_err, wallet_res, wallet_fields) {
            if (wallet_err) {
              console.log(wallet_err);
              res.status(500).send("SQL error")
              return
            }

            res.status(200).send({
              "id": id,
              "first_name": first_name,
              "last_name": last_name,
              "email": email,
              "access_token": api_key,
              "is_admin": is_admin
            });
          });
        });
      });
    });
  });

  //get all users
  app.post("/v1/login", function(req, res) {
    let email = req.body.email,
      password = req.body.password;

    if (email == undefined || password == undefined) {
      console.log("A field is undefined while creating user");
      res.status(400).send("Please specify all argument to create user")
      return
    }
    //get hash of password
    let pass_query = `SELECT password FROM users WHERE email='${email}'`;
    console.log(email);
    db.query(pass_query, function(err, result, fields) {
      if (err) {
        console.log("Error login 1");
        res.status(500).send("Error")
        return
      };

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password).then(function(crypt_res) {
          //success
          if (crypt_res == true) {
            let api_query = `SELECT api_key FROM users WHERE email='${email}'`;
            db.query(api_query, function(err, result_api, fields) {
              // wrong response serialization
              res.status(200).send({
                "access_token": result_api[0].api_key
              });
              console.log(result_api[0].api_key);
            })
          } else {
            console.log("no password match");
            res.status(401).send("Password do not match")
            return
          }
        })
      } else {
        console.log("no user");
        res.status(401).send("User not found")
      }
    });
  });
}
