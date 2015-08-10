var Tokenizer = {};

// Required Libs
var wordcut = require("wordcut");
wordcut.init();

Tokenizer.removeEmoji = function(text){

  // var mapObj = {
  //   cat:"😍",
  //   dog:"goat",
  //   goat:"cat"
  // };
  // var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
  // textArray[i] = str.replace(re, function(matched){
  //   return mapObj[matched];
  // });
  // console.log('remove');
  var emojis = [
    '[:;][\- ]*[\)\(]', // smiley, frown
    'T[_]+T', // T_T
    '^[_]*^', // ^_^
    '<3',
    '\r',
    '\ud83d[\ude00-\ude4f]', 
    '[\u2702-\u27B0]',
    '[\uE000-\uF8FF]', // private use
    '[\u2600-\u26FF]', // Miscellaneous Symbols
    '[\u2000-\u206F]', // General Punctuation
    '[\u20D0-\u20FF]', // Combining Diacritical Marks for Symbols
    '[\u2100-\u214F]', // Combining Diacritical Marks for Symbols
    '[\u2190-\u21FF]', // Arrows
    '[\u2300-\u23FF]', // Miscellaneous Technical
    '[\u25A0-\u25FF]', // Geometric Shapes
    '[\u2900-\u297F]', // Supplemental Arrows-B
    '[\u2B00-\u2BFF]', // Miscellaneous Symbols and Arrows
    '[\u3000-\u303F]', // CJK Symbols and Punctuation
    '\u00A9', // ©
    '\u00AE', // ®
    '\ud83c[\udf00-\udff0]', // Emoticons
    '\ud83d[\ude00-\ude4f]', // Emoticons
    '\ud83d[\ude80-\udec0]', // Emoticons
    '\ud83d[\udc0b-\uddff]', // Emoticons
  ];

  var re = new RegExp(emojis.join("|"),"gi");

  var result = text.replace(re, "");

  return result;
}

Tokenizer.tokenize = function(text){

  text = this.removeEmoji(text);

  var tokenizedString = wordcut.cut(text);
  var tokenizedArray = tokenizedString.split("|");

  return tokenizedArray;

};

Tokenizer.tokenizeArray = function(textArray){

  results = [];

  for(i in textArray){
    results.push(this.tokenize(textArray[i]));
  }
  
  return results;

};

module.exports = Tokenizer;

// Test Cases
// console.log(Tokenizer.tokenize('เค้าบอกห้ามฝากร้าน\rฝากใจละกันเนอะ😃'));
// console.log(Tokenizer.tokenize('😃😃😃😃'));
// console.log(Tokenizer.tokenize('😃'));
// console.log(Tokenizer.tokenize('T_T'));
// console.log(Tokenizer.tokenize('#ฝากร้านเสื้อผ้าราคาเริ่มต้น250บาท'));
// console.log(Tokenizer.tokenize('#ฝากร้านเสื้อผ้าราคาเริ่มต้น2บาท'));
console.log(Tokenizer.tokenize('น่ารักคะ ฝากร้านหน่อยคะ #Charl&Kieth #fashionbag #vickbabybaslam #ขายถูกๆๆๆๆๆรีบไลน์มาเลยนะคะ'));
// console.log(Tokenizer.tokenizeArray(['เค้าบอกห้ามฝากร้าน\rฝากใจละกันเนอะ😃', '😃😃😃😃', '😃', '', 'a']));
// console.log(Tokenizer.removeEmoji('T_T'));
