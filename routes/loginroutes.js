// var salt = require('./salt.js');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var dbConnect = require('./dbConnect');






//// Register User////
exports.register = function (req, res) {
    var thisPass = req.body.password;
    var today = new Date();

    bcrypt.genSalt(saltRounds, function (err, response) {
        // console.log("Response is: " + response);
        // console.log("Error is : " + err);
        console.log(thisPass);
        bcrypt.hash(thisPass, saltRounds).then(function (hash) {
            // Store hash in your password DB.
            var userinfo = {
                "name": req.body.name,
                "email": req.body.email,
                "phone": req.body.phone,
                "password": hash,
                "salt": response,
                "androidid": req.body.androidid,
                "token": req.body.token,
                "adstatus": req.body.adstatus,
                "created": today
            }
            dbConnect.query('SELECT email FROM userinfo', function (error, results) {
                if (error) {
                    res.send({
                        msg: error
                    })
                } else {
                    var found = results.some(function (el) {
                        return el.email.toUpperCase() === req.body.email.toUpperCase();
                    });
                    if (!found) {
                        dbConnect.query('INSERT INTO userinfo SET ?', userinfo, function (error, results, fields) {
                            if (error) {
                                //console.log("error ocurred", error);
                                res.send({
                                    msg: error
                                })
                            } else {
                                res.send({
                                    msg: "Success"
                                });
                                insertInOTPTable(req.body.email);
                            }
                        });
                    } else {
                        res.send({
                            msg: "Email Already Exist!!"
                        });
                    }
                }

            });

        });
    });

}




//// Login ////
exports.login = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    dbConnect.query('SELECT * FROM userinfo WHERE email = ?', [email], function (error, results, fields) {
        if (error) {
            // console.log("error ocurred",error);
            res.send({
                msg: "Error"
            })
        } else {
            if (results.length > 0) {
                let verified = bcrypt.compareSync(password, results[0].password);

                if (verified) {
                    res.json({
                        msg: 'Success',
                        result: {
                            "name": results[0].name,
                            "email": results[0].email,
                            "phone": results[0].phone,
                            "auth": true
                        },
                    })
                } else {
                    res.json({
                        msg: 'Fail'
                    })
                }
            } else {
                res.json({
                    msg: 'Fail'
                })
            }
        }
    });
}



function insertInOTPTable(email) {
    let now = new Date();
    let info = {
        "email": email,
        "otp": "",
        "updated": now
    }
    dbConnect.query('INSERT INTO registerOTP SET ?', info, function (error, results, fields) {
        if (error) {
            return false
        } else {
            return true
        }
    });
}