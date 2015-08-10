module.exports = function(mongoose) {
  
  var Schema = mongoose.Schema;
  
  var PostOriginal = mongoose.model('PostOriginal', new Schema({}, { strict: false }));

  return PostOriginal;

}