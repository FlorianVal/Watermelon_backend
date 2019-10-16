module.exports = function(app, db) {
  app.get('/v1/wallets/:id', function(req, res) {
    console.log(req.params);
    var wallet_id = req.params.id;
    var total_amount = 0;
    total_amount = get_amount_payouts(wallet_id, db, total_amount, res)

  });
};


function get_amount_payouts(wallet_id, db, total_amount, res) {
  let query_payouts = `SELECT * FROM payouts WHERE wallet_id = ${wallet_id}`;
  db.query(query_payouts, function(err, result, fields) {
    if (result.length == 0) return res.send("404: Wallet not found")
    if (err) return res.send("500");
    for (let index in result) {
      total_amount -= +JSON.stringify(result[index].amount);
    }
    get_amount_payins(wallet_id, db, total_amount, res)
  });
}

function get_amount_payins(wallet_id, db, total_amount, res) {
  let query_payins = `SELECT * FROM payins WHERE wallet_id = ${wallet_id}`;
  db.query(query_payins, function(err, result, fields) {
    if (err) throw err;
    for (let index in result) {
      total_amount += +JSON.stringify(result[index].amount);
    }
    get_amount_transfers_credited(wallet_id, db, total_amount, res)
  });
}

function get_amount_transfers_credited(wallet_id, db, total_amount, res) {
  let query_transfers_credited = `SELECT * FROM transfers WHERE credited_wallet_id = ${wallet_id}`;
  db.query(query_transfers_credited, function(err, result, fields) {
    if (err) throw err;
    for (let index in result) {
      total_amount += +JSON.stringify(result[index].amount);
    }
    get_amount_transfers_debited(wallet_id, db, total_amount, res)
  });
}

function get_amount_transfers_debited(wallet_id, db, total_amount, res) {
  let query_transfers_debited = `SELECT * FROM transfers WHERE debited_wallet_id = ${wallet_id}`;
  db.query(query_transfers_debited, function(err, result, fields) {
    if (err) throw err;
    for (let index in result) {
      total_amount -= +JSON.stringify(result[index].amount);
    }
    res.send(JSON.stringify(total_amount));
  });
}
