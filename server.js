// example using express.js:
var express = require('express')
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var yaml = require('write-yaml');
var morgan = require('morgan');
const fs = require('fs');
const join = require('path').join;
const mongoose = require('mongoose'); 
const models = join(__dirname, 'app/models');


// // Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

  const User = mongoose.model('User');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(morgan('dev'));

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

   // Make sure this comes after the express session   
   app.use(passport.initialize());
   app.use(passport.session());


   passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, email,done, password ) { // callback with email and password from our form

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'local.email' :  email }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
            return done(err);

        // if no user is found, return the message
        if (!user)
            return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, user);
    });

}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
      done(err, user);
  });
});


const userName = 'user';
const password = 'password123';

app.use(express.static(__dirname + '/public'));


// route for Home-Page
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.route('/login')
  .get((req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  })
  .post((req, res) => {
    console.log(req.body)
    passport.authenticate('local', { successRedirect: '/enterDetails', failureRedirect: '/enterDetails', })(req, res)
});

app.get('/enterDetails', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/enterDetails.html'));
})
app.post('/generateYamlFile', function (req, res) {
  var data = { users: [{ user: req.body }] };
  yaml('data/'+req.body['User Name']+'.yml', data, function (err) {
    res.redirect('/');
  });
});
mongoose.connect('mongodb://localhost/my_database', { useNewUrlParser: true });

app.listen(8081);
