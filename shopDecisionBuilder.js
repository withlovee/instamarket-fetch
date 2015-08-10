var ShopDecisionBuilder = {};

// Required Libs
var Q = require("q");
var _ = require("underscore");
var async = require("async");
var mongoose = require('mongoose');
var prompt = require('prompt');
var fs = require('fs');

var tokenizer = require('./tokenizer.js');

// Load Config
var config = require('./config.js');
var clientId = config.clientId;

// Load Models
var Comment = require('./models/comment.js')(mongoose);
var Post = require('./models/post.js')(mongoose);

ShopDecisionBuilder.getComments = function(limit){

  var deferred = Q.defer();

  rand = Math.random() * 10000000;

  var options = {
    // text: '/เคส/',
    // text: '/น่ารัก/',
    // text: /โลโก้/,
    // text: /กระเป๋า/,
    // text: /สวย/,
    // text: /ขาย/,
    text: /รายงาน/,
    // text: /shop/,
    // text: /ฝากร้าน/,
    ads: { $exists: false },
    // rand: { $gt: rand }
  };

  // count = 559573;
  console.log(rand);


  Comment.find(options)
  // .skip(rand)
  .limit(limit)
  // .select({ text: 1, _id: 0 })
  .exec(function(err, results){
    if(err){
      deferred.reject('Error getComments')
    } else {
      console.log(results);
      deferred.resolve(results);
    }
  });
  return deferred.promise;

};

ShopDecisionBuilder.saveDecision = function(_id, decision){

  var deferred = Q.defer();
  Comment.findByIdAndUpdate(_id, { $set: { ads: decision } }, function(err, raw) {
    if (err) {
      console.log(err);
      deferred.reject(err);
    }
    else{
      console.log('Saved: ', raw);
      deferred.resolve();
    }
  });
}

// Count number of hashtags in the string
ShopDecisionBuilder.hashtagNum = function(text){

  var count = (text.match(/#/g) || []).length;

  return count;

};

ShopDecisionBuilder.writeKeywords = function(text){

  var deferred = Q.defer();

  if(text.length == 0){
    deferred.resolve();
  }
  else{

    fs.appendFile("data/keywords.txt", text.join('\n\r') + '\n\r' , function(err) {
        if(err) return deferred.reject(err);

        deferred.resolve();
        console.log("Added");
    });

  }

  return deferred.promise;

};

ShopDecisionBuilder.promptKeywords = function(){

  var deferred = Q.defer();

  prompt.start();

  prompt.get(['keywordIndexes'], function (err, result) {
    if(err) { return onErr(err); }
    if(result.keywordIndexes == ''){
      deferred.resolve([]);
      return;
    }
    // console.log('keywordIndexes: ' + result.keywordIndexes);
    var resultArray = result.keywordIndexes.split(' ');
    resultArray = _.map(resultArray, function(num){ return parseInt(num) });
    deferred.resolve(resultArray);
    // console.log(resultArray);
  });

  function onErr(err) {
    console.log(err);
    deferred.reject(err);
  }

  return deferred.promise;

};

ShopDecisionBuilder.printArray = function(array){

  for(i in array){
    console.log(i + ' ' + array[i]);
  }

}

ShopDecisionBuilder.promptDecision = function(){

  var deferred = Q.defer();

  prompt.start();

  prompt.get(['decision true:1, false:2, none:3'], function (err, result) {
    if(err) { return onErr(err); }
    decision = result['decision true:1, false:2, none:3'];
    deferred.resolve(parseInt(decision));
    return;
  });

  function onErr(err) {
    console.log(err);
    deferred.reject(err);
  }

  return deferred.promise;

}

ShopDecisionBuilder.getOne = function(){
  x = this;
  return function(callback){
    original = "";
    tokenizedText = [];

    x.getComments(1)
    .then(function(comments){

      // save originals for future use
      original = comments[0];
      originalText = original.text;

      // tokenize
      tokenizedText = tokenizer.tokenize(originalText);
      hashtagNum = x.hashtagNum(originalText);

      console.log(JSON.stringify(originalText));
      x.printArray(tokenizedText);
      console.log('#Hashtag: ' + hashtagNum);

      return x.promptKeywords();

    })
    .then(function(keywordIndexes){

      keywords = []
      for(i in keywordIndexes){
        keyword = tokenizedText[keywordIndexes[i]];
        keywords.push(keyword);
      }

      console.log(keywords);
      return x.writeKeywords(keywords);

    })
    .then(function(){
      return x.promptDecision();
    })
    .then(function(decision){
      return x.saveDecision(original._id, decision);
    })
    .then(function(){
      callback(null);
    })
    .catch(function(err){
      callback(err);
    })
  };
};

ShopDecisionBuilder.init = function(){
  mongoose.connect(config.mongoConnection);
  // this.getOne();
  async.forever(
    this.getOne(),
    function(err){
      console.log('Async err: ' + err);
    }
  );

};

module.exports = ShopDecisionBuilder;

ShopDecisionBuilder.init();
// console.log(Tokenizer.removeEmoji(testCases));

