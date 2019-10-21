const bcrypt = require('bcrypt'),
  saltRounds = 10;


module.exports = function(app, db) {
  //TODO create also wallet
  //create new user
  app.post("/v1/users", function(req, res) {
    console.log(req.body);
    console.log("creating user...");
    let first_name = req.body.first_name,
      last_name = req.body.last_name,
      email = req.body.email,
      password = req.body.password,
      is_admin = 0,
      api_key = Math.random().toString(36).substring(15);
    bcrypt.hash(password, saltRounds, function(err, hash) {
      let query = `INSERT INTO users (first_name, last_name, email, password, is_admin, api_key) VALUES ('${first_name}', '${last_name}', '${email}', '${hash}', '${is_admin}', '${api_key} ')`;
      db.query(query, function(err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify({
          "first_name": first_name,
          "last_name": last_name,
          "email": email,
          "access_token": api_key
        }));
      });
    });
  });

  //get all users
  app.get("/v1/log", function(req, res) {
    let email = req.body.email,
      password = req.body.password;

    //get hash of password
    let pass_query = `SELECT password FROM users WHERE email='${email}'`;
    console.log(email);
    db.query(pass_query, function(err, result, fields) {
      if (err) throw err;
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password).then(function(crypt_res) {
          //success
          if (crypt_res == true) {
            let api_query = `SELECT api_key FROM users WHERE email='${email}'`;
            db.query(api_query, function(err, result, fields) {
              res.status(400);
              res.send(result.api_key);
              console.log(result.api_key);
            })
          }
          else {
            res.send("Password do not match")
          }
        })
      } else {
        res.status(404)
        res.send("User not found")
      }
    });
  });
}
