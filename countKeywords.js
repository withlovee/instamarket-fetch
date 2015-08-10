CountKeywords = {};

var fs = require('fs');
var Q = require("q");

CountKeywords.dict = {};

CountKeywords.init = function(filename){

  var data = fs.readFileSync(filename,'utf8');
  data = data.split('\n\r');
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

CountKeywords.init('data/keywords.txt');
