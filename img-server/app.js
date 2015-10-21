var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');

var redis = require("redis"),
    client = redis.createClient();

var clientId = 'a9d23ffa605a432d8398fece792821ad';

client.on("error", function (err) {
    console.log("Error " + err);
});



http.createServer(function (req, res) {

  var request = url.parse(req.url, true);
  // var action = request.pathname;
  console.log(request.pathname);
  if(/\/img\//.test(request.pathname)){

    var username = request.pathname.match(/\/img\/(.*)/)[1];

    if(!username){
      res.writeHead(404);
      res.end('Bye');
      return;
    }

    getImage(username, function(img){
      res.writeHead(200, {'Content-Type': 'image/png' });
      res.end(img, 'binary');
    });

  } else {
    res.writeHead(404);
    res.end('Bye');
    return;
  }
}).listen(8080);
console.log('Server running at http://128.199.169.81:8080/');

var getImage = function(username, callback){

  client.get(username, function(err, reply) {

    if(reply){
      callback(fs.readFileSync('img/' + username + '.jpg'));
      return;
    } else {
      https.get({
        host: 'api.instagram.com',
        path: '/v1/users/'+ username +'/?client_id=' + clientId,
      }, function(res){

        var bodyChunks = [];

        res.on('data', function(chunk) {

          bodyChunks.push(chunk);

        }).on('end', function() {

          var body = Buffer.concat(bodyChunks);
          try{
            var json = JSON.parse(body);
          } catch(e) {
            console.log('not json: ' + username);
            callback(readImg('placeholder'));
            return;
          }
          if(!json.data){ // Handling various errors
            callback(readImg('placeholder'));
            return;
          }

          var data = json.data;

          var request = https.get(json.data.profile_picture, function(res){
              var imagedata = '';
              res.setEncoding('binary');

              res.on('data', function(chunk){
                  imagedata += chunk;
              })

              res.on('end', function(){
                  fs.writeFile('img/' + username + '.jpg', imagedata, 'binary', function(err){
                      if(err){
                        callback(readImg('placeholder'));
                        return;
                      }
                      console.log('File saved. ' + username);
                      markFetched(username);
                      callback(readImg(username));
                  })
              })
          });

        });

      }).on('error', function(e) {
        console.log('on error ' + e.message);
        callback(readImg('placeholder'));
        return;
      });
    }
  });

};

var readImg = function(filename){
  return fs.readFileSync('img/' + filename + '.jpg');
};

var markFetched = function(username){
  client.set(username, Date.now(), redis.print);
};
