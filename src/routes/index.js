/*jslint node: true, stupid: true */
'use strict';
var fs = require('fs');

module.exports = function (server, socket) {
	console.log(__dirname);
  fs.readdirSync(__dirname).forEach(function (file) {
    if (file.substr(-3, 3) === '.js' && file !== 'index.js') {
      require('./' + file.replace('.js', ''))(server, socket);
    }
  });
};
