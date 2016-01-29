/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are splitted in several files in the gulp directory
 */

'use strict';

var gulp = require('gulp');
var wrench = require('wrench');
var $ = require('gulp-load-plugins')({lazy: true});

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
});


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('docker', ['build'], $.shell.task([
  'docker build -t smartpark-eventmgr .'
]));

gulp.task('deploy', ['docker'], $.shell.task([
  'docker run -d -p 8081:8081 --restart=always -e NODE_ENV=production --name eventmgr smartpark-eventmgr'
]));
