// example using express.js:
var express = require('express')
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var yaml = require('write-yaml');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser());
app.use(morgan('dev'));

app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}));

const userName = 'user';
const password = 'password123';

app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect('/enterDetails');
  } else {
    next();
  }
};


// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
  res.redirect('/login');
});

app.route('/login')
  .get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  })
  .post((req, res) => {
    if (req.body.userName === userName && req.body.password === password) {
      req.session.user = userName + password;
      res.redirect('/enterDetails')
    }
    else {
      res.redirect('/');
    }
  });
app.get('/enterDetails', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(path.join(__dirname, '/public/enterDetails.html'));
  }
  else {
    res.redirect('/login');
  }
})
app.post('/generateYamlFile', function (req, res) {
  var data = { users: [{ user: req.body }] };
  yaml('formData.yml', data, function (err) {
    res.redirect('/');
  });
});
app.listen(8080);