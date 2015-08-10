var PostController = {};

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
var User = require('./models/user.js')(mongoose);
var Post = require('./models/post.js')(mongoose);
var PostOriginal = require('./models/post_original.js')(mongoose);

// Connect to DB
mongoose.connect(config.mongoConnection);

var numberOfReq = 80;

var currentReq = 0;


function getLocation(location){
  if(location == null){
    return 'null';
  }
  if('name' in location){
    return location.name;
  } else {
    return 'null';
  }
}

function getCaption(caption){
  if(caption == null){
    return 'null';
  }
  if('text' in caption){
    return caption.text;
  } else {
    return 'null';
  }
}

function savePosts(posts){

  var deferred = Q.defer();

  async.each(posts, function(post, callback) {
    // console.log('save post ' + post.id);
    var postObj = new Post({
      id: post.id,
      user_id: post.user.id,
      comment_count: post.comments.count,
      like_count: post.likes.count,
      type: post.type,
      users_in_photo: post.users_in_photo,
      caption: getCaption(post.caption),
      created_time: new Date(parseInt(post.created_time) * 1000),
      images: post.images,
      location_name: getLocation(post.location)
    });

    postObj.save(function(err){
      if(err){
        console.log('Err: ' + post.id + ' ' + post.user);
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

}

function savePostOriginals(posts){

  var deferred = Q.defer();

  async.each(posts, function(post, callback) {
    // console.log('save original ' + post.id);

    var postObj = new PostOriginal(post);

    postObj.save(function(err){
      if(err){
        console.log('Err: ' + post.id + ' ' + post.user);
        console.log(err);
      }
      callback();
    });

  }, function(err){
      if(err) {
        console.log('Error in savePostOriginals async.each: ' + err);
        deferred.reject(new Error(err));
      } else {
        deferred.resolve();
      }
  });

  return deferred.promise;

}

PostController.getNewUsers = function(){

  var deferred = Q.defer();

  User.find({
    posts_fetched: { $exists: false } 
  })
  .select({ id: 1, _id: 0 })
  .exec(function(err, results){
    if(err){
      deferred.reject('Error getNewUsers')
    } else {
      ids = _.map(results, function(obj, key){ return obj.id; });
      // console.log(ids.length);
      deferred.resolve(ids);
    }
  });

  return deferred.promise;
}

PostController.markFetched = function(userId){

  var deferred = Q.defer();


  User.update({ id: userId }, { $set: { posts_fetched: true, last_fetched: new Date(Date.now()) }}, function(err){
    if(err){
      console.log('Error markFetched: ' + userId);
      console.log(err);
      deferred.reject(err);
    }
    else{
      console.log('Mark Fetched: ' + userId);
      deferred.resolve();
    }

  });

  return deferred.promise;
}

PostController.getAndSavePosts = function(userId, cursor){

  var deferred = Q.defer();

  if(cursor){
    var options = cursor;
  } else {
    var options = {
        host: 'api.instagram.com',
        path: '/v1/users/' + userId + '/media/recent?client_id=' + clientId,
      };
  }

  https.get(options, function(res) {
    var bodyChunks = [];

    res.on('data', function(chunk) {
      // console.log('on data');
      bodyChunks.push(chunk);

    })
    .on('error', function(err){
      console.log('Error HTTPs ' + err);
      deferred.resolve(cursor);
    })
    .on('end', function() {
      console.log('on end');
      var body = Buffer.concat(bodyChunks);
      var data = JSON.parse(body);
      var posts = data.data;

      Q.all([
        savePosts(posts),
        savePostOriginals(posts)
      ]).fin(function() {
        console.log('saved: ' + userId);

        if(!('next_url' in data.pagination)) {
          deferred.reject('Done this user');
        } else {
          // console.log('Find next');
          deferred.resolve(data.pagination.next_url);
        }
      });

    });

  });

  return deferred.promise
  .then(function(cursor){
    console.log('Cursor: ' + cursor);
    return this.getAndSavePosts(userId, cursor);
  }.bind(this))
  .catch(function(err){
    console.log(err);
  });

}

PostController.fetchPostsFromUser = function(userId){

  return function(callback){
    this.getAndSavePosts(userId, null)
    .then(function(){
      return this.markFetched(userId);
    }.bind(this))
    .then(function(){
      console.log('Done! ' + userId);
      callback(null);
    })
    .catch(function(error) {
      console.log(error);
      callback(error);
      //remove all posts of id and close connection
    })
  }.bind(this);

}

PostController.fetchPostsFromUsers = function(userIds){

  var deferred = Q.defer();

  fetchMap = userIds.map(function(userId){ 
    return this.fetchPostsFromUser(userId);
  }.bind(this));

  async.series(fetchMap, function(err){
    if(err){
      deferred.reject(err);
    }
    deferred.resolve(null);
  });

  return deferred.promise;

};

PostController.fetchPostsFromNewUsers = function(){

  var postsFetched = [];
  var currentId = null;

  this.getNewUsers()
  .then(function(userIds){
    return this.fetchPostsFromUsers(userIds);
  }.bind(this))
  .then(function(){
    console.log('Done!!');
  })
  .catch(function(error) {
    console.log(error);
  })
  .fin(function () {
    mongoose.connection.close();
  });



};



module.exports = PostController;

PostController.fetchPostsFromNewUsers()