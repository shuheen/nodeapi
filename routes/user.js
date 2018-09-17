var dbConnect = require('./dbConnect');

// Fetch All Details of User by Email Id
exports.getUserDetails = function (req, res) {
    dbConnect.query('SELECT * FROM userinfo WHERE email = "' + req.body.email + '" ', function (error, results) {
        if (error) {
            res.send({
                msg: error
            })
        } else {
            res.send(results);
        }
    });
}