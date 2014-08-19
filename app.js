// Usage example with ExpressJS
var fs = require('fs'),
    xplorer = require('./xplorer'),
    express = require('express'),
    util = require('util'),
    port = 3000;
    
var gData = {
//     layout:false,
    xplorer:0,
    viewer:0
};

function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}
    
var app = (parseFloat(express.version)<3.0) ? express.createServer() : express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');  

app.configure(function(){
    app.use(express.static(getUserHome()));
    app.use(xplorer.middleware({rootURL:getUserHome()}));
});

app.get('/', function(req, res){
  res.redirect('/xplore');
});

app.get('/xplore*', function(req, res){
  gData.xplorer = req.xplorer;
  res.render('xplorer.ejs', gData);
});

app.get('/viewer*', function(req, res){
    gData.viewer = req.viewer;
    res.render('viewer.ejs', gData);

});


app.listen(port);
console.log('georef listening on localhost:' + port);
