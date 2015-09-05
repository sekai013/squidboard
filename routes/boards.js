var express = require('express');
var router = express.Router();

var Board = require('../mongodb-model');
var BoardConfig = require('../board-view-config');
var pkgjson = require('../package.json');

var logger = require('../log-config').getLogger('create');

router.get('/:id', function(req, res, next) {
	Board.findOne({ _id: req.params.id }, function(err, board) {
		if (err) return next();
		if (!board) return next();
		var config = BoardConfig.new();
		config.board = board;
		config.name = true;
		config.package = pkgjson;
		res.render('board', config);
	});
});

router.post('/create', function(req, res, next) {
	var board = new Board();
	board.save(function(err) {
		if (err) {
			err = new Error('Internal Server Error');
			err.status = 500;
			logger.fatal(req.ip + ': attempted to create board but failed');
			return next(err);
		}
		logger.info(req.ip + ': created board ' + board._id);
		res.redirect('/boards/' + board._id);
	});
});


module.exports = router;
