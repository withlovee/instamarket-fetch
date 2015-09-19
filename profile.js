var ProfileController = {};

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

// Connect to DB
mongoose.connect(config.mongoConnection);

var currentReq = 0;

var defaultConcurrency = 20;

var concurrency = defaultConcurrency;


ProfileController.process = function(){

  this.findUsers(concurrency)

  .then(function(userIds){
    return this.fetchUsers(userIds);
  }.bind(this))

  .then(function(profiles){
    return this.saveProfile(profiles);
  }.bind(this))

  .catch(function(error) {
    console.log(error);
  })

  .fin(function(){
    this.process(); // Repeat it recursively
  }.bind(this));

};

ProfileController.findUsers = function(limit){

  var deferred = Q.defer();

  User.find({
    get_info: false
  })
  .limit(limit)
  .select({ id: 1, _id: 0 })
  .exec(function(err, results){
    if(err){
      deferred.reject('Error findUsers')
    } else {
      ids = _.map(results, function(obj, key){ return obj.id; });
      // console.log(ids);
      deferred.resolve(ids);
    }
  });

  return deferred.promise;
};

ProfileController.fetchUsers = function(userIds){

  var deferred = Q.defer();

  console.log("[before] Total User ID: " + userIds.length);

  getUsersFunction = userIds.map(function(postId){ 
    return this.fetchOneUser(postId);
  }.bind(this));

  async.parallel(getUsersFunction, function(err, results){
    if(err){
      deferred.reject(new Error(err));
    } else {
      results = [].concat.apply([], results);
      // console.log(results);
      console.log('[done] Total Users: ' + results.length);
      console.log('---------------------------------');
      deferred.resolve(results);
    }

  });

  return deferred.promise;
};

ProfileController.saveProfile = function(profiles){

  var deferred = Q.defer();

  async.eachLimit(profiles, 100, function(profile, callback) {

    if(typeof profile === 'number'){
      var id = profile;
      var bio = '--private--';
      var setValues = {
        get_info: true
      };
    } else {
      var id = parseInt(profile.id);
      var bio = profile.bio;
      var setValues = {
        counts: profile.counts,
        bio: profile.bio,
        website: profile.website,
        get_info: true
      };
    }

    User.update({id: id}, { $set: setValues }, function(err, raw) {
      if (err) {
        console.log('Err: ' + id + ' ' + err);
        callback('err');
      }
      else{
        console.log(('Saved['+ id +']: '), raw);
        console.log(bio);
        console.log('---------------------------------');
        callback();
      }
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

ProfileController.fetchOneUser = function(userId){
  return function(callback){

    var called = false;

    setTimeout(function(){
      if(!called)
        return callback('Unexpected Error ' + userId, []);
    }, 1000 * 60 * 3);

    https.get({
      host: 'api.instagram.com',
      path: '/v1/users/'+ userId +'/?client_id=' + clientId,
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
          console.log('not json: ' + userId + ' ' + e);
          callback('Not json: ' + userId + ' ' + e, []);
          return 0;
        }
        if(!json.data){ // Handling various errors
          if(json.error_type == "OAuthRateLimitException"){
            setTimeout(function(){
              callback('OAuthRateLimitException: ' + json.error_message + ' ' + userId, []);
              concurrency = 1;
              return 0;
            }, 1000 * 60 * 2); 

          }
          else if(json.meta.error_type == "APINotAllowedError"){
            return callback(null, userId);
          }
          else if(json.meta.error_type == "APINotFoundError"){
            return callback(null, userId);
          }
          else{
            console.log('not found: ' + userId);
            console.log(JSON.parse(body));
            return callback('Error', {});
          }
        }
        else{
          concurrency = defaultConcurrency;
          var data = json.data;

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
        console.log('catch on error: ' + userId + ' ' + e);
      }

    });
  }
};

module.exports = ProfileController;

ProfileController.process()
