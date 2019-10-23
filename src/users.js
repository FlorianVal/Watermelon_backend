const bcrypt = require('bcrypt'),
  saltRounds = 10;

module.exports = function(app, db) {
  function return_user(id, res) {
    let query = `SELECT id, first_name, last_name, email, is_admin FROM users WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("SQL error")
        return
      }
      res.send(JSON.stringify(result));
    });
  }

  //get all users
  app.get("/v1/users", function(req, res) {
    console.log("get users");
    let query = 'SELECT id, first_name, last_name, email, is_admin FROM users';
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("SQL error")
        return
      }
      res.send(JSON.stringify(result));
    });
  });

  //get one user with id
  app.get("/v1/users/:id", function(req, res) {
    console.log("get user by id");
    let id = req.params.id;
    return_user(id, res)
  });

  //update one user
  app.put('/v1/users/:id', function(req, res) {
    let id = req.params.id;

    //check if user is admin or user himself
    console.log(req.body.active_user.id);
    //if (req.body.active_user.is_admin == 0 && id != req.body.active_user.id) {
    //  console.log("Can't edit a user without admin perms or beign the user");
    //  res.status(401).send("Forbidden")
    //  return
    //}
    console.log("Put user by id");
    let query = "UPDATE users";
    let conditions = ["first_name", "last_name", "email", "password", "is_admin", "api_key"];
    for (let index in conditions) {
      if (conditions[index] in req.body) {
        if (query.indexOf("SET") < 0) {
          query += " SET";
        } else {
          query += " AND";
        }

        //specific handling
        if (conditions[index] == "password") {
          bcrypt.hash(req.body[conditions[index]], saltRounds, function(err, hash) {
            req.body[conditions[index]] = hash
          });
        } else if (conditions[index] == "is_admin") {
          if (req.body[conditions[index]] == 'true') {
            req.body[conditions[index]] = 1
          } else if (req.body[conditions[index]] == 'false') {
            req.body[conditions[index]] = 0
          }
        }

        query += ` ${conditions[index]}='${req.body[conditions[index]]}'`;
      }
    }
    query += ` WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("SQL Error")
        return
      };
      return_user(id, res)
    });
  });

  //delete one user_id
  app.delete('/v1/users/:id', function(req, res) {
    let id = req.params.id;

    //if (req.body.active_user.is_admin == 0 && id != req.body.active_user.id) {
    //  console.log("Can't edit a user without admin perms or beign the user");
    //  res.status(401).send("Forbidden")
    //  return
    //}



    //remove wallets
    let wallet_query = `DELETE FROM wallets WHERE user_id=${id}`;
    db.query(wallet_query, function(wallet_err, result, fields) {
      if (wallet_err) {
        console.log(wallet_err);
        res.status(500).send("Error")
        return
      };
      let cards_query = `DELETE FROM cards WHERE user_id=${id}`;
      db.query(cards_query, function(cards_err, result, fields) {
        if (cards_err) {
          console.log(cards_err);
          res.status(500).send("Error")
          return
        };
        let query = `DELETE FROM users WHERE id=${id}`;
        db.query(query, function(err, result, fields) {
          if (err) {
            console.log(err);
            res.status(500).send("Error")
            return
          };
          res.status(200).send("Done");

        });
      });
    });
  });
}
