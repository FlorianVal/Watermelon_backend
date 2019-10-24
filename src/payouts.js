module.exports = function(app, db) {
  app.get('/v1/payouts', function(req, res) {
    let query = `SELECT * FROM payouts WHERE wallet_id=${req.body.active_user_wallet.id}`;
    if (req.body.active_user.is_admin == true) {
      query = "SELECT * FROM payouts"
    }
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Error")
        return
      };
      res.send(JSON.stringify(result));
    });
  })

  app.post('/v1/payouts', function(req, res) {
    let wallet_id = req.body.wallet_id,
      amount = req.body.amount;
    if (wallet_id == undefined || amount == undefined) {
      console.log("A field is undefined while creating payin");
      res.status(400).send("Please specify all argument to create payin")
      return
    }

    console.log("payin for ", wallet_id, " with amount : ", amount);
    let query = `INSERT INTO payouts (wallet_id, amount) VALUES ('${wallet_id}','${amount}')`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Error")
        return
      };
      let id_query = `SELECT id FROM payouts WHERE wallet_id = ${wallet_id}`
      db.query(id_query, function(err, resultid, fields) {
        if (err) {
          res.status(500).send('error')
          return
        }
        if (!result || result.length == 0) {
          res.status(404).send("No wallet found")
          return
        }
        let id = resultid[resultid.length-1].id
        res.status(200).send({
          "id": id,
          "wallet_id": wallet_id,
          "amount": parseInt(amount)
        });
      });
    });
  });

  app.get('/v1/payouts/:id', function(req, res) {
    let id = res.req.params.id
    let query = `SELECT * FROM payouts WHERE id=${id}`;

    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Error")
        return
      };
      if(!result || result.length == 0){
        res.status(404).send("payin not found")
        return
      }
      res.status(200).send(result[0]);
    });
  })
};
