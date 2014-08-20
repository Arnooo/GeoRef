var fs = require('fs');
    path = require('path'),
    exec = require('child_process').exec;

var xplorer = {
  tree:{},
  rootURL:'/',
  current_path:'/',
  current_image:0,
  setGPSCoordinate:function(gpsCoordinate, imageURL, callback){
      var self = this;
      exec("exiftool -exif:gpslatitude="+gpsCoordinate[0]+" -exif:gpslongitude="+gpsCoordinate[1]+" '"+ imageURL+"'",  
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
//                 callback(new Error("Error executing exiftool on "+imageURL), null);
            }
            else{
            }
      });
  },
  readInfo:function(imageURL, callback){
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
  read: function(dir_path, imgID, callback){
    var self = this;
//     console.log(dir_path);
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
        
        console.log("xplorer");
        var url = decodeURIComponent(req.path),
            query = req.query;
            
        if(query.gps && query.image){
            //console.log(query);
            var str =decodeURIComponent(query.gps);
            str = str.replace("LatLng\(","");
            str = str.replace("\)","");
            var argsList = str.split(", ");
            console.log(argsList[0]+ " "+argsList[1]);
            if(argsList.length > 1)
            {
                self.setGPSCoordinate(argsList, query.image);    
            }
        }
        
        if(query.img){
            self.current_image = parseInt(query.img);
        }
            
        if(query.folder){
            self.current_path = query.folder;
        }
        
        self.read(self.current_path, self.current_image, function(err, data){
            req.xplorer = data;
            return next(err);
        });

    };
  }

};


module.exports = xplorer;