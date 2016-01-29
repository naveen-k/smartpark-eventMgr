/*jslint node: true, indent: 2 */

'use strict';
var restify = require('restify');
var routes  = require('./routes/');
var bunyan = require('bunyan');

var ip_addr = '127.0.0.1';
var port    =  '8082';

var log = bunyan.createLogger({
  name        : 'smartpark-event',
  level       : process.env.LOG_LEVEL || 'info',
  stream      : process.stdout,
  serializers : bunyan.stdSerializers
});

var server = restify.createServer({
  name : 'smartpark-event',
  version: '1.0.0',
  log: log
});

server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());
server.use(restify.gzipResponse());
server.pre(restify.pre.sanitizePath());
server.use(restify.CORS());

/*jslint unparam:true*/
// Default error handler. Personalize according to your needs.
server.on('uncaughtException', function (req, res, err) {
  console.log('Error!');
  console.log(err);
  res.send(500, { success : false });
});
/*jslint unparam:false*/

server.on('after', restify.auditLogger({ log: log }));

var socket = require('./sockets')(server);
routes(server, socket);

server.listen(port, function(){
    log.info('%s listening at %s ', server.name , server.url);
});
