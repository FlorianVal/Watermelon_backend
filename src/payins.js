module.exports = function(app, db) {
  app.get('/v1/payins', function(req, res) {
    let query = `SELECT * FROM payins WHERE wallet_id=${req.body.active_user_wallet.id}`;
    if (req.body.active_user.is_admin == true) {
      query = "SELECT * FROM payins"
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

  app.post('/v1/payins', function(req, res) {
    let wallet_id = req.body.wallet_id,
      amount = req.body.amount;
    if (wallet_id == undefined || amount == undefined) {
      console.log("A field is undefined while creating payin");
      res.status(400).send("Please specify all argument to create payin")
      return
    }
    console.log("payin for ", wallet_id, " with amount : ", amount);
    let query = `INSERT INTO payins (wallet_id, amount) VALUES ('${wallet_id}','${amount}')`;
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
