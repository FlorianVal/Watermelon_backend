module.exports = function(app, db) {

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
        res.send(JSON.stringify({ "first_name" : first_name, "last_name": last_name, "email": email, "access_token": api_key}));
      });
    });
  });

  //get all users
  app.get("/v1/users", function(req, res) {
    let query = 'SELECT * FROM users';
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify(result));
    });
  });

  //get one user with id
  app.get("/v1/users/:id", function(req, res) {
    let id = req.params.id;
    let query = `SELECT * FROM users WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify(result));
    });
  });

  //update one user
  //TODO implement api key and pass
  //
  app.put('/v1/users/:id', function(req, res) {
    let id = req.params.id;
    let query = "UPDATE users";
    let conditions = ["first_name", "last_name", "email", "password", "is_admin", "api_key"];
    for (let index in conditions) {
      if (conditions[index] in req.body) {
        if (query.indexOf("SET") < 0) {
          query += " SET";
        } else {
          query += " AND";
        }
        query += ` ${conditions[index]}='${req.body[conditions[index]]}'`;
      }
    }
    query += ` WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify("Success"));
    });
  });

  //delete one user_id
  app.delete('/v1/users/:id', function(req, res) {
    let id = req.params.id;
    let query = `DELETE FROM users WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify("Success"));
    });
  });
}
