var express = require('express');
var router = express.Router();

var pkgjson = require('../package.json');

router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'イカボード',
		package: pkgjson
	});
});

module.exports = router;
