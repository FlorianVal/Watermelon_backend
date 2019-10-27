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
      if (!result || result.length == 0) {
        res.status(404).send("user not found")
        return
      }
      if (result[0].is_admin == 1) {
        result[0].is_admin = true
      }
      if (result[0].is_admin == 0) {
        result[0].is_admin = false
      }
      res.send(result[0]);
    });
  }

  //get all users
  app.get("/v1/users", function(req, res) {
    console.log("get users");
    let query = `SELECT id, first_name, last_name, email, is_admin FROM users WHERE id=${req.body.active_user.id}`
    if (req.body.active_user.is_admin == true) {
      query = 'SELECT id, first_name, last_name, email, is_admin FROM users';
    }
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("SQL error")
        return
      }
      console.log("Send result of get users :");
      if (result[0].is_admin == 1) {
        result[0].is_admin = true
      }
      if (result[0].is_admin == 0) {
        result[0].is_admin = false
      }
      console.log(JSON.stringify(result));
      res.status(200).send(JSON.stringify(result));
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

    let id_query = `SELECT id FROM users WHERE id = ${id}`
    db.query(id_query, function(err, resultid, fields) {
      if (err) {
        console.log(err);
        res.status(500).send('error')
        return
      }
      if (!resultid || resultid.length == 0) {
        console.log("no wallet for this user");
        res.status(404).send("Not found")
        return
      }
      console.log(req.body.active_user.id);
      if (req.body.active_user.is_admin == 0 && id != req.body.active_user.id) {
        console.log("Can't edit a user without admin perms or beign the user");
        res.status(403).send("Forbidden")
        return
      }
      console.log("Put user by id");
      let query = "UPDATE users";
      let conditions = ["first_name", "last_name", "email", "password", "is_admin", "api_key"];
      var i = 0
      console.log("FORLOOP\n");
      for (let index in conditions) {
        if (conditions[index] in req.body) {
          i = 1
          if (conditions[index] == "email") {
            if (req.body[conditions[index]].split("@").length == 1) {
              console.log("Wrong email");
              res.status(400).send("Wrong email")
              return
            }
          }
        }
      }
      if (i == 0) {
        res.status(400).send("No modification specified")
        return
      }
      for (let index in conditions) {
        if (conditions[index] in req.body) {
          if (query.indexOf("SET") < 0) {
            query += " SET";
          } else {
            query += " ,";
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

          query += ` ${conditions[index]}="${req.body[conditions[index]]}"`;
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
  });

  //delete one user_id
  app.delete('/v1/users/:id', function(req, res) {
    let id = req.params.id;


    console.log("DELETE user :");
    console.log(id);
    let id_query = `SELECT id FROM wallets WHERE user_id = ${id}`
    db.query(id_query, function(err, resultid, fields) {
      if (err) {
        console.log(err);
        res.status(500).send('error')
        return
      }
      if (!resultid || resultid.length == 0) {
        console.log("no wallet for this user");
        res.status(404).send("Not found")
        return
      }
      if (req.body.active_user.is_admin == 0 && id != req.body.active_user.id) {
        console.log("Can't edit a user without admin perms or beign the user");
        res.status(403).send("Forbidden")
        return
      }
      console.log("WALLET :");
      console.log(resultid);
      let wallet_id = resultid[0].id
      console.log(wallet_id);
      let payins_query = `DELETE FROM payins WHERE wallet_id=${wallet_id}`;
      db.query(payins_query, function(payins_err, result, fields) {
        if (payins_err) {
          console.log(payins_err);
          res.status(500).send("Error")
          return
        };
        //let transfers_query = `DELETE FROM transfers WHERE debited_wallet_id=${wallet_id} OR credited_wallet_id=${wallet_id}`;
        //db.query(transfers_query, function(transfers_err, result, fields) {
        //  if (transfers_err) {
        //    console.log(transfers_err);
        //    res.status(500).send("Error")
        //    return
        //  };
        let payouts_query = `DELETE FROM payouts WHERE wallet_id=${wallet_id}`;
        db.query(payouts_query, function(payouts_err, result, fields) {
          if (payouts_err) {
            console.log(payouts_err);
            res.status(500).send("Error")
            return
          };
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
                console.log("User deleted");
                res.status(204).send("Done");

                //});
              });
            });
          });
        });
      });
    });
  });
}
