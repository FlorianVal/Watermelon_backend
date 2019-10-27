module.exports = function(app, db) {
  app.get('/v1/wallets', function(req, res) {
    console.log("get wallet with id");
    //need to implement something which was disagreed by the teacher because of
    //the amazing testing program which is totaly not in agreement with the
    //project sheet and the teacher.
    let id_query = `SELECT id FROM wallets WHERE user_id = ${req.body.active_user.id}`
    db.query(id_query, function(err, result, fields) {
      if (err) {
        res.status(500).send('error')
        return
      }
      if (!result || result.length == 0) {
        res.status(404).send("No wallet found")
        return
      }
      var wallet_id = JSON.stringify(result[0].id)
      var total_amount = 0;

      let query_payouts = `SELECT * FROM payouts WHERE wallet_id = ${wallet_id}`;
      db.query(query_payouts, function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(500).send("SQL error");
          return

        }
        console.log(total_amount);
        for (let index in result) {
          total_amount -= +JSON.stringify(result[index].amount);
          console.log(total_amount);

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
            console.log(total_amount);

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
              console.log(total_amount);

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
                console.log(total_amount);

              }
              console.log([{
                "wallet_id": wallet_id,
                "balance": total_amount
              }]);
              res.status(200).send([{
                "wallet_id": wallet_id,
                "balance": total_amount
              }]);
            });
          });
        });
      });
    });
  });


  app.get('/v1/wallets/:id', function(req, res) {
    console.log("get wallet with id");
    //need to implement something which was disagreed by the teacher because of
    //the amazing testing program which is totaly not in agreement with the
    //project sheet and the teacher.
    let id =req.params.id
    let id_query = `SELECT id FROM wallets WHERE id = ${id}`
    db.query(id_query, function(err, result, fields) {
      if (err) {
        res.status(500).send('error')
        return
      }
      if (!result || result.length == 0) {
        res.status(404).send("No wallet found")
        return
      }
      var wallet_id = JSON.stringify(result[0].id)
      var total_amount = 0;

      let query_payouts = `SELECT * FROM payouts WHERE wallet_id = ${wallet_id}`;

      db.query(query_payouts, function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(500).send("SQL error");
          return

        }
        console.log(total_amount);
        for (let index in result) {
          total_amount -= +JSON.stringify(result[index].amount);
          console.log(total_amount);

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
            console.log(total_amount);

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
              console.log(total_amount);

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
                console.log(total_amount);

              }
              console.log([{
                "wallet_id": wallet_id,
                "balance": total_amount
              }]);
              res.status(200).send({
                "wallet_id": wallet_id,
                "balance": total_amount
              });
            });
          });
        });
      });
    });
  });
};
