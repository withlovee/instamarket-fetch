var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/instamarket');

var Comment = mongoose.model('comments', { name: String });

var aComment = new Comment({ name: 'Vee'});

aComment.save(function(err){
	if(err)
		console.log(err)
	else
		showAllComments();
});

function showAllComments(){
	Comment.find(function (err, comments) {
		if (err) return console.error(err);
		console.log(comments);
	})	
}
