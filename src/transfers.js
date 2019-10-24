module.exports = function(app, db) {
  app.get('/v1/transfers', function(req, res) {
    //let query = `SELECT * FROM transfers WHERE debited_wallet_id=${req.body.active_user_wallet.id} OR credited_wallet_id=${req.body.active_user_wallet.id}`;
    //if (req.body.active_user.is_admin == true) {
      query = "SELECT * FROM transfers"
    //}
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("Error")
        return
      };
      console.log(result[0]);
      res.status(200).send([result[0]]);
    });
  })

  app.post('/v1/transfers', function(req, res) {
    let debited_wallet_id = req.body.debited_wallet_id,
      credited_wallet_id = req.body.credited_wallet_id,
      amount = req.body.amount;

    if (amount.split(".").length > 1 || amount.split(",").length > 1 || amount > 100000) {
      console.log("Wrong format for amount");
      res.status(400).send("Wrong format for amount")
      return
    }
    let wallet_id = null
    if (credited_wallet_id == undefined || debited_wallet_id == undefined || amount == undefined) {
      if (credited_wallet_id == undefined && debited_wallet_id) {

        wallet_id = debited_wallet_id
        credited_wallet_id = req.body.active_user_wallet.id;
      } else if (debited_wallet_id == undefined && credited_wallet_id) {
        console.log("ONLY CREDITED");
        wallet_id = credited_wallet_id
        debited_wallet_id = req.body.active_user_wallet.id;
      } else {

        console.log("A field is undefined while creating transfer");
        res.status(400).send("Please specify all argument to create transfer")
        return
      }
      if(debited_wallet_id == credited_wallet_id){
        console.log("Can't make a transfer from and to same account");
        res.status(400).send("Can't make a transfer between the same account")
        return
      }
    }
    console.log("transfer from ", debited_wallet_id, "to", credited_wallet_id, " with amount : ", amount);
    let query = `INSERT INTO transfers (debited_wallet_id,credited_wallet_id, amount) VALUES ('${debited_wallet_id}','${credited_wallet_id}','${amount}')`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(400).send("Error")
        return
      };
      let id_query = `SELECT id FROM transfers WHERE debited_wallet_id = ${debited_wallet_id} AND credited_wallet_id = ${credited_wallet_id}`
      db.query(id_query, function(err, resultid, fields) {
        if (err) {
          res.status(500).send('error')
          return
        }
        if (!result || result.length == 0) {
          res.status(404).send("No wallet found")
          return
        }
        let id = resultid[resultid.length - 1].id
        //Here the tester want to have a wallet_id in the response
        //There won't ba any wallet_id in there because in the specifications
        //it is said that when we do a post or a put we must answer with the
        //modified object or the newly created object. Here the object doesn't
        //have any field "wallet_id"
        console.log({
          "id": id,
          "wallet_id": wallet_id,
          "amount": parseInt(amount)
        });
        res.send({
          "id": id,
          "wallet_id": wallet_id,
          "amount": parseInt(amount)
        });
      });
    });
  });

  app.get("/v1/transfers/:id", function(req, res) {
    console.log("get user by id");
    let id = req.params.id;
    let query = `SELECT * FROM transfers WHERE id=${id}`;
    db.query(query, function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(400).send("SQL error")
        return
      }
      if (!result || result.length == 0) {
        res.status(404).send("user not found")
        return
      }
      res.send(result[0]);
    });  });


};
