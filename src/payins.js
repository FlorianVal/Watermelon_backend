module.exports = function(app, db) {
  app.get('/v1/payins', function(req, res) {
    let query = "SELECT * FROM payins";
    db.query(query, function(err, result, fields) {
      if (err){
  res.status(500).send("Error")
};      res.send(JSON.stringify(result));
    });
  })

  app.post('/v1/payins', function(req, res) {
    let wallet_id = req.body.wallet_id,
      amount = req.body.amount;
    console.log("payin for ",wallet_id," with amount : ",amount);
    let query = `INSERT INTO payins (wallet_id, amount) VALUES ('${wallet_id}','${amount}')`;
    db.query(query, function(err, result, fields) {
      if (err){
  res.status(500).send("Error")
};      res.send(JSON.stringify("Success"));
    });
  });
};
