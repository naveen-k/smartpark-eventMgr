'use strict';

/**
 * Serve app. For dev purpose.
 */
var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var gulp       = require('gulp');
var nodemon    = require('gulp-nodemon');

function startServer(location, node_env) {
	nodemon({
	    script: path.join(location, '/index.js')
	  , ext: 'js html'
	  , env: { 'NODE_ENV': node_env }
	});
};

gulp.task('serve:dist', ['build'], function () {
  startServer(conf.paths.dist, 'production');
});

gulp.task('serve', function () {
  startServer(conf.paths.src, 'development');
});
