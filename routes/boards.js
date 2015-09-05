var express = require('express');
var router = express.Router();

var Board = require('../mongodb-model');
var BoardConfig = require('../board-view-config');

router.get('/:id', function(req, res, next) {
	Board.findOne({ _id: req.params.id }, function(err, board) {
		if (err) return next();
		if (!board) return next();
		var config = BoardConfig.new();
		config.board = board;
		config.name = true;
		res.render('board', config);
	});
});

router.post('/create', function(req, res, next) {
	var board = new Board();
	board.save(function(err) {
		if (err) {
			err = new Error('Internal Server Error');
			err.status = 500;
			return next(err);
		}
		res.redirect('/boards/' + board._id);
	});
});


module.exports = router;
