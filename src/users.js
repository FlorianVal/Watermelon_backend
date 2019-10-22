module.exports = function(app, db) {

  //get all users
  app.get("/v1/users", function(req, res) {
    console.log("get users");
    let query = 'SELECT id, first_name, last_name, email, is_admin FROM users';
    db.query(query, function(err, result, fields) {
      if (err) {
        res.status(500).send("Error")
      };
      res.send(JSON.stringify(result));
    });
  });

  //get one user with id
  app.get("/v1/users/:id", function(req, res) {
    console.log("get user by id");

    let id = req.params.id;
    let query = `SELECT * FROM users WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        res.status(500).send("Error")
      };
      res.send(JSON.stringify(result));
    });
  });

  //update one user
  app.put('/v1/users/:id', function(req, res) {
    console.log("Put user by id");
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
      if (err) {
        res.status(500).send("Error")
      };
      res.send(JSON.stringify("Success"));
    });
  });

  //delete one user_id
  app.delete('/v1/users/:id', function(req, res) {
    let id = req.params.id;
    let query = `DELETE FROM users WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        res.status(500).send("Error")
      };
      res.status(204).send("Done");
    });
  });
}
