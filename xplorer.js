var fs = require('fs');
    path = require('path'),
    exec = require('child_process').exec;

var xplorer = {
  tree:{},
  rootURL:'/',
  current_path:'/',
  current_image:0,
  map:{
      zoom:8,
      gps:0
  },
  setGPSCoordinate:function(gps, imageURL, callback){
      console.log("setGPSCoordinate");
      var self = this;
//       console.log("exiftool -exif:gpslatitude="+gps.lat+"-exif:gpslatituderef="+gps.latRef+" -exif:gpslongitude="+gps.lng+" -exif:gpslongituderef="+gps.lngRef+" '"+ imageURL+"'");
      exec("exiftool -exif:gpslatitude="+gps.lat+" -exif:gpslatituderef="+gps.latRef+" -exif:gpslongitude="+gps.lng+" -exif:gpslongituderef="+gps.lngRef+" '"+ imageURL+"'",  
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
//             if (error !== null) {
            callback();
//             }
//             else{
//             }
      });
  },
  readInfo:function(imageURL, callback){
      console.log("readInfo");
      var self = this;
      exec("exiftool -n -j '"+imageURL+"'",  
        function (error, stdout, stderr) {
            if (error !== null) {
                callback(new Error("Error executing exiftool on "+imageURL), null);
            }
            else{
                self.tree.imagetree[self.tree.currentImage].info = JSON.parse(stdout)[0];
                callback(null, self.tree);
            }
      });
      
  },
  read: function(callback){
      console.log("read");
    var self = this;
    var dir_path = self.current_path;
    var imgID = self.current_image;
    fs.readdir(dir_path, function (err, files) { // '/' denotes the root folder
      if (err) throw err;
      var data = {
        dir_path:dir_path,
        foldertree:[],
        imagetree:[],
        currentImage:imgID
      };

      var isHiddenRegex = /^\./;
      var isImageRegex = /\b.(JPG|jpg|bmp|jpeg|gif|png|tif)\b$/;
      for (var i=0; i<files.length; i++){
        if(!isHiddenRegex.test(files[i])){
          var full_path = path.join(dir_path, files[i]);

          var file = {
            name: files[i],
            full_path: encodeURIComponent(full_path),
            url: encodeURIComponent(full_path),
            info:"empty"
          };

          var stats = fs.lstatSync(full_path);
          if (!err && stats.isDirectory()) { //conditing for identifying folders
            data.foldertree.push(file);
          }
          else if(isImageRegex.test(file.name)){
            file.url=path.relative('http://localhost:3000/',full_path);
            data.imagetree.push(file);
          }
          else{
            //data.foldertree.push(files[i]);
          }
        }
      };
      self.tree = data;
     // console.log(self.tree);
      if(data.imagetree.length > 0){
          
          if(self.tree.currentImage > data.imagetree.length -1){
              self.tree.currentImage = 0;
              self.current_image = 0;
          }
          else if(self.tree.currentImage < 0){
              self.tree.currentImage = data.imagetree.length - 1;
              self.current_image = data.imagetree.length -1;
          }
          self.readInfo(decodeURIComponent(self.tree.imagetree[self.tree.currentImage].full_path), callback);
      }
      else{
          callback(err, data);
      }
    });
  },
  middleware: function(opt){
    var self = this;
    if(opt){
        self.current_path = opt.rootURL;
        self.current_image = 0;
        self.rootURL = opt.rootURL;
    }
    return function(req, res, next){
        var url = decodeURIComponent(req.path),
            query = req.query;
            
        if(query.img){
            self.current_image = parseInt(query.img);
        }
        
        if(query.folder){
            self.current_path = query.folder;
        }
        
        if(query.zoom){
            self.map.zoom = query.zoom;
        }
        
        if(query.gpsLat && query.gpsLatRef &&
            query.gpsLng && query.gpsLngRef &&
            query.image){
            var gps={
                lat:query.gpsLat,
                latRef:query.gpsLatRef,
                lng:query.gpsLng,
                lngRef:query.gpsLngRef
            };
            self.map.gps = gps;
            self.setGPSCoordinate(gps, query.image, function(){
                self.read(function(err, data){
                    req.xplorer = data;
                    req.map = self.map;
                    return next(err);
                });
            }); 
        }
        else{
            self.read(function(err, data){
                req.xplorer = data;
                req.map = self.map;
                return next(err);
            });
        }
    };
  }

};


module.exports = xplorer;