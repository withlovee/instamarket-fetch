var SearchController = {};

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

SearchController.saveUsers = function(users){

  var deferred = Q.defer();

  async.eachLimit(users, 10, function(user, callback) {

    console.log('save user ' + user.username);

    var aUser = new User(user);

    aUser.save(function(err){
      if(err){
        console.log('Err: ' + comment.id + ' ' + user.username);
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

SearchController.searchOneUser = function(username){
  return function(callback){
    https.get({
        host: 'api.instagram.com',
        path: '/v1/users/search?q='+ username +'&client_id=' + clientId,
      }, function(res){

        var bodyChunks = [];

      res.on('data', function(chunk) {

        bodyChunks.push(chunk);

      }).on('end', function() {

        var body = Buffer.concat(bodyChunks);
        var data = JSON.parse(body).data;

        if(!data){
          console.log('not found: ' + postId);
          console.log(body);
          callback(null, []);
        }
        else{
          console.log("found: " + data[0].username);
          data[0].influencer = true;
          callback(null, data[0]);
        }


      });

    }).on('error', function(e) {
      console.log('ERROR: ' + e.message);
      callback('Error', []);
    });
  }
};

SearchController.searchUsers = function(usernames){

  var deferred = Q.defer();
  var calls = [];
  var comments = [];
  console.log("Total usernames: " + usernames.length);

  searchUsers = usernames.map(function(username){ 
    return this.searchOneUser(username);
  }.bind(this));

  async.series(searchUsers, function(err, results){
    if(err){
      deferred.reject(new Error(err));
    }
    results = [].concat.apply([], results);
    // console.log(results);
    console.log('Total Users: ' + results.length);
    deferred.resolve(results);

  });

  return deferred.promise;
};

SearchController.getUserIds = function(usernames){

  this.searchUsers(usernames)
  .then(function(users){
    console.log('Saving..');
    return this.saveUsers(users);
  }.bind(this))
  .then(function(){
    console.log('Done!');
    mongoose.connection.close();
  })
  .catch(function(error) {
    console.log(error);
    mongoose.connection.close();
  })
  .done();
  

}



module.exports = SearchController;

//names = ["aum_patchrapa", "chomismaterialgirl", "boy_pakorn", "chermarn", "vjwoonsen", "davikah", "margie_rasri", "mario_mm38", "toeyjarinporn", "minpechaya", "mark_prin", "tukky66", "supassra_sp", "jirayu_jj", "aom_sushar", "ppanward", "opalpanisara", "nanarybena", "nuneworanuch", "vic_to_ri_a2", "annethong", "poydtreechada", "taewaew_natapohn", "mint_chalida", "aey_pornthip", "janienineeleven", "maypitchy", "khunfour", "pimtha", "warattaya", "m1keangelo", "sorrayuth9111", "marchutavuth", "lekteeradetch", "lydiasarunrat", "sunny_suwanmethanont", "apitsada", "ningpanita", "push_dj", "kootee", "pearypie", "madame_mod", "prayalundberg", "poh_natthawut", "aimeemorakot", "lilwanmai", "icepreechaya", "weir19", "momomama1234", "kwanusa9", "hanongh", "mewnittha", "guess", "a_supachai1", "babymelony", "mattperanee", "sananthachat", "earlyboysd", "bank_thiti", "tubtimofficial", "pinenerize", "seanjindachot", "gracekanklao", "iamkratae", "pornchita", "mootono29", "nookzii", "duearisara", "pooklook_fonthip", "woodytalk", "golfpichaya", "kaojirayu_9", "burnfirebaifern", "levis", "kanchai", "appleminiberry", "charattha_j", "nickkunatip", "alexrendell", "aofpongsak", "boompanadda", "gunnapat23", "pang_ornjira", "knomjeankulamas", "ohnsri1000", "djeaky", "shahkrit", "cmcamel", "mintvongvasana", "gypso_ramita", "twheat", "kaewffk", "toptapp_nc", "sara_legge", "sonyuke", "pampam_dp", "nathparis", "dailycherie", "ayasakai", "bitoeyrsiam"];
//names = ["bitoeyrsiam"]; // manually added
SearchController.getUserIds(names);