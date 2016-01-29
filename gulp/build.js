'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var args = require('yargs').argv;

var $ = require('gulp-load-plugins')({
  lazy: true,
  pattern: ['gulp-*', 'del']
});

gulp.task('clean', function () {
  return $.del([path.join(conf.paths.dist, '/')]);
});

gulp.task('copy-server', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });

  return gulp.src([
    path.join(conf.paths.src, '/**/*.{js,json}')
  ])
    .pipe(fileFilter)
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('copy-package', function() {

	return gulp.src([
	  path.join('.', '/package.json')
	])
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('build', ['copy-server', 'copy-package']);