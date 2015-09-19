var CommentController = {};

// Required Libs
var Q = require("q");
var _ = require("underscore");
var async = require("async");
var https = require("https");
var mongoose = require('mongoose');

// Load Config
var config = require('./config.js');
var clientId = config.clientId;

// Load Models
var Comment = require('./models/comment.js')(mongoose);
var Post = require('./models/post.js')(mongoose);

// Connect to DB
mongoose.connect(config.mongoConnection);

var currentReq = 0;

var defaultConcurrency = 10;

var concurrency = defaultConcurrency;


CommentController.fromNewPosts = function(){

  var postsFetched = [];

  this.findPosts(concurrency)

  .then(function(postIds){
    postsFetched = postIds;
    return this.fetchComments(postIds);
  }.bind(this))

  .then(function(comments){
    console.log('Saving...');
    return this.saveComments(comments);
  }.bind(this))

  .then(function(){
    return this.markFetched(postsFetched);
  }.bind(this))

  .catch(function(error) {
    console.log(error);
  })

  .fin(function(){
    console.log('next');
    this.fromNewPosts(); // Repeat it recursively
  }.bind(this));

};

CommentController.findPosts = function(limit){

  var deferred = Q.defer();

  // var pattern = /((ไม่|ม่าย|ห้าม|หยุด|งด|อย่า|เลิก|(no) ).*(ฝาก( )?ร้าน)|พัก(การ)?ฝากร้าน|(no) (shop))/i

  var pattern = /(ไม่|ม่าย|ห้าม|หยุด|งด|อย่า|เลิก|พัก|(no|NO|No) )( )?((สะดวก)?(รับ|มี)?(การ)?(ฝาก|ฝาก( )?ร้าน))|(no|No|NO) (shop|Shop|SHOP)|((ง ด|ไ ม่) ฝ า ก ร้ า น)/i

  Post.find({
    location_name: { $not: pattern }, 
    comments_fetched: { $exists: false } 
  })
  .limit(limit)
  .select({ id: 1, _id: 0 })
  .exec(function(err, results){
    if(err){
      deferred.reject('Error findPosts (posts collection)')
    } else {
      ids = _.map(results, function(obj, key){ return obj.id; });
      // console.log(ids);
      deferred.resolve(ids);
    }
  });

  return deferred.promise;
};

CommentController.fetchComments = function(postIds){

  var deferred = Q.defer();

  console.log("Total Post ID: " + postIds.length);

  getCommentsFunction = postIds.map(function(postId){ 
    return this.fetchCommentsFromOnePost(postId);
  }.bind(this));

  async.parallel(getCommentsFunction, function(err, results){
    if(err){
      deferred.reject(new Error(err));
    } else {
      results = [].concat.apply([], results);
      // console.log(results);
      console.log('Total Comments: ' + results.length);
      deferred.resolve(results);
    }

  });

  return deferred.promise;
};

CommentController.saveComments = function(comments){

  var deferred = Q.defer();

  async.eachLimit(comments, 1, function(comment, callback) {

    var aComment = new Comment(comment);

    aComment.save(function(err){
      if(err){
        console.log('Err: ' + comment.id + ' ' + comment.username);
        console.log(err);
      }
      callback();
    });

  }, function(err){
      if(err) {
        console.log('Error in async each: ' + err);
        deferred.reject(new Error(err));
      } else {
        deferred.resolve();
      }
  });

  return deferred.promise;
};

CommentController.markFetched = function(postIds){

  var deferred = Q.defer();

  async.each(postIds, function(id, callback) {

    console.log('mark fetched ' + id);
    Post.update({ id: id }, { $set: { comments_fetched: true }}, function(err){
      if(err){
        console.log('Error markFetched: ' + id);
        console.log(err);
      }
      callback();
    });

  }, function(err){
      if(err) {
        console.log('Error in async each markFetched: ' + err);
        deferred.reject(new Error(err));
      } else {
        deferred.resolve();
      }
  });

  return deferred.promise;
};

CommentController.listAdsAllowedPosts = function(){

  Post.aggregate( [
   { $group: { _id: "$location_name", count: { $sum: 1 } } },
   { $match: { _id: { $ne: "null" } } },
   { $sort: { count: -1 } },
   // { $limit: 5 }
  ], function(err, results){
    if(err){
      console.log('Error ' + err)
    } else {
      results = _.map(results, function(obj, key){ return obj._id + '(' + obj.count + ')'});
      console.log(results);
    }
  });

}


CommentController.fetchCommentsFromOnePost = function(postId){
  return function(callback){

    var called = false;

    setTimeout(function(){
      if(!called)
        return callback('Unexpected Error ' + postId, []);
    }, 1000 * 60 * 3);

    https.get({
      host: 'api.instagram.com',
      path: '/v1/media/'+ postId +'/comments?client_id=' + clientId,
    }, function(res){

      var bodyChunks = [];

      res.on('data', function(chunk) {

        bodyChunks.push(chunk);

      }).on('end', function() {

        if(called) return 0;

        called = true;

        var body = Buffer.concat(bodyChunks);

        try{
          var json = JSON.parse(body);
        } catch(e) {
          console.log('not json: ' + postId + ' ' + e);
          callback('Not json: ' + postId + ' ' + e, []);
          return 0;
        }
        if(!json.data){ // Handling various errors
          if(json.error_type == "OAuthRateLimitException"){
            setTimeout(function(){
              callback('OAuthRateLimitException: ' + json.error_message + ' ' + postId, []);
              concurrency = 1;
              return 0;
            }, 1000 * 60 * 2); 

          }
          else if(json.meta.error_message == "Invalid Media ID"){
            console.log('Invalid Media ID: ' + postId);
            return callback(null, []);
          }
          else{
            console.log('not found: ' + postId);
            console.log(JSON.parse(body));
            return callback('Error', []);
          }
        }
        else{
          concurrency = defaultConcurrency;
          var data = json.data;
          currentReq = currentReq + 1;
          console.log('success ' + currentReq + ':' + postId + " length: " + data.length);

          for(i in data){
            data[i].post_id = postId;
            data[i].username = data[i].from.username; 
          }
          return callback(null, data);
        }

      });

    }).on('error', function(e) {
      console.log('on error ' + e.message);
      if(called) return 0;

      called = true;

      try{
        return callback(e.message, []);
      } catch(e) {
        console.log('catch on error: ' + postId + ' ' + e);
      }

    });
  }
};

module.exports = CommentController;

CommentController.fromNewPosts()
