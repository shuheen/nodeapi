var express = require("express");
var login = require('./routes/loginroutes');
var sendotp = require('./routes/sendotp');
var user = require('./routes/user');
var bodyParser = require('body-parser');
var app = express();
var http = require('http'); // 3. HTTP server
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


/**
 * Get port from environment and store in Express.
 */
var port = process.env.PORT; // 2. Using process.env.PORT
app.set('port', port);
// console.log("Server Running on Port: " + process.env.PORT)

/**
 * Create HTTP server.
 */
var server = http.createServer(app);
var router = express.Router();
// test route
router.get('/', function (req, res) {
    res.json({
        message: 'welcome to our upload module apis'
    });
});
//route to handle user registration
router.post('/register', login.register);
router.post('/login', login.login);
router.post('/saveAndSendOtp', sendotp.saveAndSendOtp);
router.post('/verifyOtp', sendotp.verifyOtp);
router.post('/getUserDetails', user.getUserDetails);
app.use('/api', router);
app.listen(5000);