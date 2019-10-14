module.exports = function(app, db)
  app.get('/v1/wallets/:id', function(req, res) {
    var user_id = req.params.id;
    var total_amount = 0;
    let query = `SELECT * FROM wallets WHERE user_id = ${id}`;
    // get wallet id
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify("Success"));
      var wallet_id=result.id;

      // TODO TEST et add payout et transfer
      let query = `SELECT * FROM payins WHERE wallet_id = ${wallet_id}`;
      db.query(query, function(err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
        for(let index in result){
          total_amount += result[index].amount;
        }
      });

      let query = `SELECT * FROM payout WHERE wallet_id = ${wallet_id}`;
      db.query(query, function(err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
        for(let index in result){
          total_amount -= result[index].amount;
        }
      });
    });
});
};
