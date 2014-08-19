
var viewer = {
    xplorerData:0,
    middleware: function(xplorerData){
        var self = this;
        return function(req, res, next){
            var url = decodeURIComponent(req.path);
            var regex = /viewer/;
            req.viewer = {currentImage:0};
            if(xplorerData){
                self.xplorerData = xplorerData;
            }

            if(regex.test(url)){
                urlArray = url.split("/img=");
                if(urlArray.length > 1)
                {
                    req.viewer.currentImage = parseInt(urlArray[1]);
                }
                next();
            }
            else{
                next();
            }
        };
    }
};

module.exports = viewer;