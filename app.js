// Usage example with ExpressJS
var fs = require('fs'),
    xplorer = require('./xplorer'),
    viewer = require('./viewer'),
    express = require('express'),
    util = require('util'),
    port = 3000;
    
var gData = {
    xplorer:0,
    viewer:0,
    rootURL:getUserHome()
};

function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}
    
var app = (parseFloat(express.version)<3.0) ? express.createServer() : express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');  

app.configure(function(){
    app.use(express.static(getUserHome()));
    app.use(xplorer.middleware(gData));
//     app.use(viewer.middleware(gData));
});

app.get('/', function(req, res){
    res.redirect('/xplore');
});

app.get('/xplore*', function(req, res){
    gData.xplorer = req.xplorer;
    res.render('xplorer.ejs', gData);
});

app.get('/viewer*', function(req, res){
    gData.xplorer = req.xplorer;
//     gData.xplorer.currentImage = gData.viewer.currentImage;
    res.render('viewer.ejs', gData);
});

app.listen(port);
console.log('georef listening on localhost:' + port);
