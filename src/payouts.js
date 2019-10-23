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
      console.log("A field is undefined while creating payout");
      res.status(400).send("Please specify all argument to create payout")
      return
    }
    console.log("payout for ", wallet_id, " with amount : ", amount);
    let query = `INSERT INTO payouts (wallet_id, amount) VALUES ('${wallet_id}','${amount}')`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Error")
        return
      };
      res.send({
        "wallet_id": wallet_id,
        "amount": amount
      });
    });
  });
};
