module.exports = function(app, db) {
  function return_cards(id, res) {
    let query = `SELECT last_4, brand, expired_at, user_id FROM cards WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("SQL error")
        return
      }
      res.status(200).send(JSON.stringify(result));
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
      res.status(200).send(JSON.stringify(result))
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
    console.log(last_4, " added to db");
    let query = `INSERT INTO cards (last_4,brand,expired_at,user_id) VALUES ('${last_4}','${brand}','${expired_at}','${user_id}')`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Can't create card")
        return
      };
      res.status(200).send({"last_4": last_4,"brand": brand, "expired_at":expired_at})
    });
  });

  app.put('/v1/cards/:id', function(req, res) {
    console.log("Put cards");
    let id = req.params.id;
    if (req.body.active_user.is_admin == 0 && id != req.body.active_user.id) {
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

  app.delete('/v1/cards/:id', function(req, res) {
    let id = req.params.id;
    let query = `DELETE FROM cards WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Error")
        return
      };
      res.status(200).send(JSON.stringify("Success"));
    });
  });
}
