module.exports = function(app, db) {
  app.get('/v1/transfers', function(req, res) {
    let query = `SELECT * FROM transfers WHERE debited_wallet_id=${req.body.active_user_wallet.id} OR credited_wallet_id=${req.body.active_user_wallet.id}`;
    if (req.body.active_user.is_admin == true) {
      query = "SELECT * FROM transfers"
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

  app.post('/v1/transfers', function(req, res) {
    let debited_wallet_id = req.body.debited_wallet_id,
      credited_wallet_id = req.body.credited_wallet_id,
      amount = req.body.amount;
      if (credited_wallet_id == undefined || debited_wallet_id == undefined || amount == undefined) {
        console.log("A field is undefined while creating transfer");
        res.status(400).send("Please specify all argument to create transfer")
        return
      }
    console.log("transfer from ", debited_wallet_id, "to", credited_wallet_id, " with amount : ", amount);
    let query = `INSERT INTO transfers (debited_wallet_id,credited_wallet_id, amount) VALUES ('${debited_wallet_id}','${credited_wallet_id}','${amount}')`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Error")
        return
      };
      res.send({
        "debited_wallet_id": debited_wallet_id,
        "credited_wallet_id": credited_wallet_id,
        "amount": amount
      });
    });
  });
};
