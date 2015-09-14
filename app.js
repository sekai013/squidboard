var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('./log-config');

var app = module.exports = express();
var server = require('http').Server(app);

var io = require('socket.io')(server);
app.set('io', io);
require('./io-chat-server');

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger.connectLogger(logger.getLogger('system')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var routeIndex = require('./routes/index');
var routeBoard = require('./routes/boards');
var api = require('./routes/api');

app.use('/', routeIndex);
app.use('/boards', routeBoard);
app.use('/api/v' + api.version, api.router);

// remove old data from database
var Board = require('./mongodb-model');
var hour = 1000 * 60 * 60;
var removeInterval =  3 * hour;
var removeTime = 24 * hour;

var removeOldData = function() {
	Board.find({ lastModified: {
		$lt: Date.now() - removeTime
	} }, function(err, boards) {
		if (err) throw err;
		boards.forEach(function(board) {
			board.remove();
		});
	});
};

setInterval(removeOldData, removeInterval);
removeOldData();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(app.get('port'), function() {
	console.log(new Date() + ': Server Running.');
});
