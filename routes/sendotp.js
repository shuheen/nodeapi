var express = require('express');
var nodemailer = require("nodemailer");
var dbConnect = require('./dbConnect');
var app = express();
/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "mail.shuaibkhan@gmail.com",
        pass: "zgeyhdatoslogozw"
    }
});
/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/

// app.get('/', function (req, res) {
//     res.sendfile('index.html');
// });



//// Generate 8 Digit OTP with Random Number and Characters ////





function generateOtp() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function sendotp(otp, email) {
    // var otp = loginroutes.generateOtp();
    var mailOptions = {
        to: email,
        subject: "SecureHomez OTP Verification",
        text: "Your OTP for Account Verification is " + otp + "."
    }
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            // return false;
            console.log("Error")
        } else {
            console.log("Sent")
        }
    });
};

//// Insert OTP in Database and Send to Email Id Against a User
exports.saveAndSendOtp = function (req, res) {
    let genOtp = generateOtp();
    let insQuery = "update registerOTP set otp='" + genOtp + "' WHERE email='" + req.body.email + "'";
    dbConnect.query(insQuery, function (error) {
        if (error) {
            return false;
        } else {
            let getOtpQuery = "SELECT otp FROM registerOTP WHERE email='" + req.body.email + "'";
            dbConnect.query(getOtpQuery, function (error, results) {
                if (error) {
                    res.send({
                        msg: "Error"
                    })
                } else {
                    var savedOtp = results[0].otp;
                    sendotp(savedOtp, req.body.email);
                    res.send({
                        msg: "Success"
                    })
                }
            });
        }
    });
}




function timeDifference(timestamp1, timestamp2) {
    var difference = timestamp1 - timestamp2;
    var daysDifference = Math.floor(difference / 1000 / 60);

    return daysDifference;
}


//// Insert OTP in Database and Send to Email Id Against a User
exports.verifyOtp = function (req, res) {
    let now = new Date();
    let getOtpQuery = "SELECT otp FROM registerOTP WHERE email='" + req.body.email + "'";
    getSavedOtp = dbConnect.query(getOtpQuery, function (error, results) {
        if (error) {
            res.send({
                msg: "Error"
            })
        } else {
            let savedOtp = results[0].otp;
            let getUpdateTime = "SELECT updated FROM registerOTP WHERE email='" + req.body.email + "'";
            getSavedUpdatedTime = dbConnect.query(getUpdateTime, function (error, results) {
                if (error) {
                    res.send({
                        msg: "Error"
                    })
                } else {
                    let updateTimeInMs = new Date(results[0].updated).getTime();
                    let now = new Date().getTime();
                    let getTimeDifference = timeDifference(now, updateTimeInMs);
                    if (getTimeDifference > 15) {
                        res.send({
                            msg: "OTP Expired!!"
                        })
                    } else {
                        if (savedOtp !== req.body.otp) {
                            res.send({
                                msg: "Wrong OTP!!"
                            });
                        } else {
                            res.send({
                                msg: "Success"
                            })
                        }
                    }
                }
            })
        }
    })
}