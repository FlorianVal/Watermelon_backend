module.exports = function(app, db) {

  //return all cards if admin else return card of user
  app.get('/v1/cards', function(req, res) {
    if (req.body.active_user.is_admin == 1) {
      let query = "SELECT * FROM cards"
    }
    else{
      let query = `SELECT * FROM cards WHERE user_id=${req.body.active_user.id}`
    }
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify(result));
    });
  });

  app.post('/v1/cards', function(req, res) {
    let last_4 = req.body.last_4,
      brand = req.body.brand,
      expired_at = req.body.expired_at,
      user_id = req.body.active_user.id;
    console.log(last_4, " added to db");
    let query = `INSERT INTO cards (last_4,brand,expired_at,user_id) VALUES ('${last_4}','${brand}','${expired_at}','${user_id}')`;
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify("Success"));
    });
  });

  app.put('/v1/cards/:id', function(req, res) {
    let id = req.params.id;
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
      if (err) throw err;
      res.send(JSON.stringify("Success"));
    });
  });

  app.delete('/v1/cards/:id', function(req, res) {
    let id = req.params.id;
    let query = `DELETE FROM cards WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify("Success"));
    });
  });
}
