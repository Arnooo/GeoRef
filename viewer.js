
var viewer = {
    data:0,
    middleware: function(inData){
        var self = this;
        return function(req, res, next){
            
            console.log("viewer");
            var url = decodeURIComponent(req.path);
            var query = req.query;
            
            console.log(inData);
            req.viewer = {currentImage:0};
            if(inData){
                self.data = inData;
            }

            if(query.img){
                req.viewer.currentImage = parseInt(query.img);
                next();
            }
            else{
                next();
            }
        };
    }
};

module.exports = viewer;