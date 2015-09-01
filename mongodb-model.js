var mongoose = require('mongoose');

var BoardSchema = new mongoose.Schema({
	posts: { 
		type: [{
			name: String,
			message: String,
			time: String
		}],
		default: []
	},
	canvas: {
		cache: {
			type: [{
				url: String,
				stage: String,
				mode: String
			}],
			default: []
		},
		cacheLevel: {
			type: Number,
			set: function(n) { return Math.round(n); },
			default: -1
		}
	},
	lastModified: { type: Number, default: Date.now() }
});
var Board = mongoose.model('Board', BoardSchema);

mongoose.connect('mongodb://localhost/board', function(err) {
	if (err) throw err;
	console.log('Connected to MongoDB Successfully.');
});

module.exports = Board;
