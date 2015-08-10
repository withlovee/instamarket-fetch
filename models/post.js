module.exports = function(mongoose) {
  
  var Schema = mongoose.Schema;
  
  var Post = mongoose.model('Post', {
    id: String,
    user_id: Number,
    comment_count: Number,
    like_count: Number,
    type: String,
    users_in_photo: [],
    caption: String,
    created_time: Date,
    images: Schema.Types.Mixed,
    location_name: String,
    ads_able: Boolean,
    comments_fetched: Boolean
  });
  return Post;

}