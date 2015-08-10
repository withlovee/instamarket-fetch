module.exports = function(mongoose) {
  
  var Comment = mongoose.model('Comment', {
    id: String,
    user_id: Number,
    text: String,
    from: {
      username: String,
      profile_picture: String,
      id: Number,
      full_name: String
    },
    created_time: Number,
    post_id: String,
    ads: Number,
    rand: Number
  });

  return Comment;

}