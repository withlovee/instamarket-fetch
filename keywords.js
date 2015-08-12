Keywords = {};

var fs = require('fs');
var Q = require("q");

Keywords.dict = {};

Keywords.countKeywords = function(filename){

  var data = this.getKeywords(filename);

  for(i in data){
    var word = data[i];
    if(word in this.dict){
      this.dict[word] += 1;
    } else {
      this.dict[word] = 1;
    }
  }

  console.log(this.dict);

  console.log(Object.keys(this.dict).length);

};

Keywords.getKeywords = function(filename){

  var data = fs.readFileSync(filename,'utf8');
  data = data.split('\n\r');

  return data;

};

module.exports = Keywords;
// Keywords.countKeywords('data/keywords.txt');
