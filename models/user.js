module.exports = function(mongoose) {
  
  var User = mongoose.model('users', {
    username: String,
    profile_picture: String,
    id: Number,
    full_name: String,
    following: [String],
    get_info: { type: Boolean, default: false },
    find_following: { type: Boolean, default: false },
    last_check: { type: Date, default: Date.now },
    last_fetched: { type: Date, default: Date.now },
    posts_fetched: Boolean,
    influencer: { type: Boolean, default: false }
  });

  return User;

}