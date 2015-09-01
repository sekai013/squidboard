var app = module.parent.exports;
var io = app.get('io');

var url = require('url');
var Board = require('./mongodb-model');
var pathnameRegExp = /^\/board\/([0-9a-z]+)$/;

var getBoardId = function(socket) {
	// if connection is valid, return id of target board
	// else (e.g., connected from non-board page like /about) return null
	var originUrl  = socket.handshake.headers.referer;
	var pathname   = url.parse(originUrl).pathname;
	var execResult = pathnameRegExp.exec(pathname);

	return (execResult === null) ? null : execResult[1];
}

io.on('connection', function(socket) {
	var boardId = getBoardId(socket);

	socket.join(boardId);
	Board.findOne({ _id: boardId }, function(err, board) {
		if (err) throw err;
		if (!board) return;
		socket.emit('cacheInit', board.canvas);
	});

	socket.on('post', function(post) {
		Board.findOne({ _id: boardId }, function(err, board) {
			if (err) throw err;
			board.posts.push(post);
			board.lastModified = Date.now();
			board.save(function(err) {
				if (err) throw err;
				io.to(boardId).emit('newPost', post);
			});
		});
	});

	socket.on('cache', function(canvas) {
		Board.findOne({ _id: boardId }, function(err, board) {
			if (err) throw err;
			board.canvas = canvas;
			board.lastModified = Date.now();
			board.save(function(err) {
				if (err) throw err;
				io.to(boardId).emit('cacheRenewed', canvas);
			});
		});
	});
});
