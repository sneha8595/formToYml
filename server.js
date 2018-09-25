// example using express.js:
var express = require('express')
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var yaml = require('write-yaml');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static(__dirname + '/public'));
app.post('/generateYamlFile', function(req, res){
  yaml('.formData.yml', req.body, function(err) {
    if(err){
        res.redirect('/');
    }
    res.end();
  });
});
app.listen(8080);