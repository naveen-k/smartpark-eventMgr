'use strict';
var os = require("os");
var pkg;


var Version = function(server) {
	if(process.env.NODE_ENV === 'production') {
		pkg = require('../package.json');
	} else {
		pkg = require('../../package.json');
	}
	server.get('/about', function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin','*');
		res.send(200, {host: os.hostname(), version: pkg.version});
		return next();
	});

	server.get('/ping', function (req, res, next) {
    res.send('pong');
    return next();
	});

};

module.exports = Version;