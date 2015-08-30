var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');

const BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('nodemon', function(callback) {
	var started = false;
	return nodemon({ script: 'app.js' })
		.on('start', function() {
			if(!started) {
				callback();
				started = true;
			}})
		.on('restart', function() {
			setTimeout(function() {
				browserSync.reload({ stream: false });
			}, BROWSER_SYNC_RELOAD_DELAY);
		});
});

gulp.task('browserSync', ['nodemon'], function() {
	browserSync.init({
		proxy: 'http://localhost:3000',
		files: ['public/**/*.*', 'views/*.ejs'],
		port: 4000,
		open: true
	});
});

gulp.task('default', ['browserSync'], function() {
});
