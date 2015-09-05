var app = module.parent.exports;
var io = app.get('io');

var url = require('url');
var Board = require('./mongodb-model');
var pathnameRegExp = /^\/boards\/([0-9a-z]+)$/;

var logger = require('./log-config').getLogger('post');

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

	try {
		Board.findOne({ _id: boardId }, function(err, board) {
			if (err) throw err;
			if (!board) return;
			socket.join(boardId);
			socket.emit('cacheInitialize', board.canvas);
		});

		const PostsMaxLen = 500;
		const NameMaxLen = 20;
		const MessageMaxLen = 100;
		var formatDate = function(date) {
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var hh = (hours > 9) ? hours : '0' + hours;
			var mm = (minutes > 9) ? minutes : '0' + minutes;
			return hh + ':' + mm;
		};
		socket.on('post', function(post) {
			Board.findOne({ _id: boardId }, function(err, board) {
				try {
					console.log(err);
					if (err) throw err;
					if (!board) throw new Error('Not Found');
					if (post.name > NameMaxLen || post.message > MessageMaxLen) {
						return;
					}
					var now = new Date();
					post.time =  formatDate(now);
					board.posts.push(post);
					if (board.posts.length > PostsMaxLen) {
						board.posts = board.posts.slice(board.posts.length - PostsMaxLen);
					}
					board.lastModified = Date.now();
					board.save(function(err) {
						try {
							if (err) throw err;
							io.to(boardId).emit('newPost', post);
							logger.info(socket.handshake.address + ': posted ' + post.message + ' to board ' + boardId + ' as ' + post.name);
						} catch (e) {
							logger.fatal(socket.handshake.address + ': attempted to post ' + post.message + ' to board ' + boardId + ' as ' + post.name + ' but failed');
							logger.fatal(e.name + ':' + e.message);
						}
					});
				} catch (e) {
					logger.fatal(socket.handshake.address + ': attempted to post ' + post.message + ' to board ' + boardId + ' as ' + post.name + ' but failed');
					logger.fatal(e.name + ':' + e.message);
				}
			});
		});

		const CacheMaxLen = 15
		socket.on('cache', function(canvas) {
			if (canvas.cache.length > CacheMaxLen) {
				canvas.cache = canvas.cache.slice(canvas.cache.length - CacheMaxLen);
				canvas.cacheLevel = CacheMaxLen - 1;
			}
				Board.findOne({ _id: boardId }, function(err, board) {
					try {
						if (err) throw err;
						board.canvas = canvas;
						board.lastModified = Date.now();
						board.save(function(err) {
							try {
								if (err) throw err;
								socket.broadcast.to(boardId).emit('cacheUpdate', canvas);
							} catch (e) {
								logger.fatal(socket.handshake.address + ': attempted to cache to board ' + boardId + ' but failed');
								logger.fatal(e.name + ':' + e.message);
							}
						});
					} catch (e) {
						logger.fatal(socket.handshake.address + ': attempted to cache to board ' + boardId + ' but failed');
						logger.fatal(e.name + ':' + e.message);
					}
				});
		});
	} catch (e) {
		logger.warn('invalid socket connection: ip ' + socket.handshake.address + ' page ' + socket.handshake.headers.referrer);
	}
});
