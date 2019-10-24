module.exports = function(app, db) {
  function return_cards(id, res) {
    let query = `SELECT id, last_4, brand, expired_at, user_id FROM cards WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("SQL error")
        return
      }
      res.status(200).send(result[0]);
    });
  }

  //return all cards if admin else return card of user
  app.get('/v1/cards', function(req, res) {
    console.log("Get cards");
    let query = `SELECT * FROM cards WHERE user_id=${req.body.active_user.id}`
    if (req.body.active_user.is_admin == true) {
      query = "SELECT * FROM cards"
    }
    console.log(query);
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Can't get cards")
        return
      };
      console.log(result);
      res.status(200).send(result)
    });
  });

  app.post('/v1/cards', function(req, res) {
    console.log("Post cards");
    let last_4 = req.body.last_4,
      brand = req.body.brand,
      expired_at = req.body.expired_at,
      user_id = req.body.active_user.id;

    if (brand == undefined || last_4 == undefined || expired_at == undefined) {
      console.log("A field is undefined while creating card");
      res.status(400).send("Please specify all argument to create card")
      return
    }

    //check date
    if (expired_at.split("/").length > 1) {
      var date = new Date(expired_at.split("/")[0], expired_at.split("/")[1], expired_at.split("/")[2], 0, 0, 0, 0)
    } else {
      var date = new Date(expired_at.split("-")[0], expired_at.split("-")[1], expired_at.split("-")[2], 0, 0, 0, 0)
    }

    if (date.getTime() < Date.now()) {
      console.log("Invalid date");
      res.status(400).send("Invalid date")
      return
    }

    console.log(last_4, " added to db");
    let query = `INSERT INTO cards (last_4,brand,expired_at,user_id) VALUES ('${last_4}','${brand}','${expired_at}','${user_id}')`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(400).send("Can't create card")
        return
      };

      let id_query = `SELECT * FROM cards WHERE last_4='${last_4}' AND brand='${brand}' AND expired_at='${expired_at}' AND user_id='${user_id}'`;
      db.query(id_query, function(err, result_id, fields) {
        if (err) {
          console.log(err);
          res.status(500).send("Can't create card")
          return
        };
        console.log(JSON.stringify(result_id));
        res.status(200).send(result_id[0])
      })
    });
  });

  app.put('/v1/cards/:id', function(req, res) {
    console.log("Put cards");
    let id = req.params.id;
    let select_query = `SELECT * FROM cards WHERE id=${id}`
    db.query(select_query, function(err, result, fields) {
      if (err) {
        res.status(400).send('error')
        return
      }
      if (!result) {
        res.status(404).send('card not found')
        return
      } else if (result.length == 0) {
        res.status(404).send('card not found')
        return
      }
      console.log(result[0]);
      let user_id = result[0].user_id


      if (req.body.active_user.is_admin == 0 && user_id != req.body.active_user.id) {
        console.log("Can't edit a user without admin perms or beign the user");
        res.status(401).send("Forbidden")
        return
      }
      let query = "UPDATE cards";
      let conditions = ["last_4", "brand", "expired_at", "user_id"];
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
      console.log(query);
      db.query(query, function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(500).send("SQL Error")
          return
        };
        return_cards(id, res)
      });

    });
  });

  app.get('/v1/cards/:id', function(req, res) {
    let id = req.params.id;
    //if("$" == id[0]){
    //  id = id.slice(1,id.length);
    //}
    let query = `SELECT * FROM cards WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(400).send("Error")
        return
      };
      console.log(JSON.stringify(result));
      if (result.length > 0) {
        res.status(200).send(result[0]);
      } else {
        res.status(404).send("No card found")
      }
    });
  });

  app.delete('/v1/cards/:id', function(req, res) {
    let id = req.params.id;
    if ("$" == id[0]) {
      id = id.slice(1, id.length);
    }
    let select_query = `SELECT * FROM cards WHERE id=${id}`
    db.query(select_query, function(err, result, fields) {
      if (err) {
        res.status(400).send('error')
        return
      }
      if (!result) {
        res.status(404).send('card not found')
        return
      } else if (result.length == 0) {
        res.status(404).send('card not found')
        return
      }
      let query = `DELETE FROM cards WHERE id=${id}`;
      db.query(query, function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(500).send("Error")
          return
        };
        res.status(204).send(JSON.stringify("Success"));
      });
    });

  });
}
