var mongoose = require('mongoose');
var dbUri = 'mongodb://heroku_mfjm6bzl:ckpds560rhme8k0tu88p02tnoa@ds035713.mongolab.com:35713/heroku_mfjm6bzl';

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

mongoose.connect(dbUri, function(err) {
	if (err) throw err;
	console.log('Connected to MongoDB Successfully.');
});

module.exports = Board;
