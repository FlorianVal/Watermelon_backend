module.exports = function(app, db) {
  app.get('/v1/wallets/:id', function(req, res) {
      console.log("get wallet with id");
      var wallet_id = req.params.id;
      var total_amount = 0;
      if (req.body.active_user.is_admin == true) {
        //do every wallet
      }
      let query_payouts = `SELECT * FROM payouts WHERE wallet_id = ${wallet_id}`; db.query(query_payouts, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("SQL error");
        return

      }
      for (let index in result) {
        total_amount -= +JSON.stringify(result[index].amount);
      }
      let query_payins = `SELECT * FROM payins WHERE wallet_id = ${wallet_id}`;
      db.query(query_payins, function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(500).send("Error")
          return
        };
        for (let index in result) {
          total_amount += +JSON.stringify(result[index].amount);
        }
        let query_transfers_credited = `SELECT * FROM transfers WHERE credited_wallet_id = ${wallet_id}`;
        db.query(query_transfers_credited, function(err, result, fields) {
          if (err) {
            console.log(err);
            res.status(500).send("Error")
            return
          };
          for (let index in result) {
            total_amount += +JSON.stringify(result[index].amount);
          }
          let query_transfers_debited = `SELECT * FROM transfers WHERE debited_wallet_id = ${wallet_id}`;
          db.query(query_transfers_debited, function(err, result, fields) {
            if (err) {
              console.log(err);
              res.status(500).send("Error")
              return
            };
            for (let index in result) {
              total_amount -= +JSON.stringify(result[index].amount);
            }
            res.status(200).send({
              "wallet_id": wallet_id,
              "balance": total_amount
            });
          });
        });
      });
    });
  });
};
