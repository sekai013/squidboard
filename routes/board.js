var express = require('express');
var router = express.Router();

var Board = require('../mongodb-model');
var BoardConfig = require('../board-config');

router.get('/:id', function(req, res, next) {
	Board.findOne({ _id: req.params.id }, function(err, board) {
		if (err) next(err);
		if (!board) next();
		var config = BoardConfig.new();
		config.board = board;
		res.render('board', config);
	});
});

router.post('/create', function(req, res, next) {
	var board = new Board();
	board.save(function(err) {
		if (err) next(err);
		res.redirect('/board/' + board._id);
	});
});

module.exports = router;
