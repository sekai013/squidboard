var express = require('express');
var router = express.Router();

var Board = require('../mongodb-model');

const BadRequest = { "statusCode": 400 }
const NotFound = {
	"statusCode": 404, 
	"board": {}
}
const InternalServerError = {
	"statusCode": 500,
	"boardId": ""
}

router.get('/boards/:id', function(req, res, next) {
	Board.findOne({ _id: req.params.id }, function(err, board) {
		if (err) return res.json(NotFound);
		if (!board) return res.json(NotFound);
		res.json({ "statusCode": 200, "board": board });
	});
});

router.post('/create', function(req, res, next) {
	var board = new Board();
	board.save(function(err) {
		if (err) return res.json(InternalServerError);
		res.json({ "statusCode": 200, "boardId": board._id });
	});
});

router.use(function(req, res, next) {
	res.json(BadRequest);
});

exports.router = router;
exports.version = 0;
