module.exports = function(server) {
    var io = require('socket.io').listen(server.server);
    // io.set('origins','*');
    io.set( 'origins', '*:*' );
 	var self = this;
    io.on('connection', function(socket) {
    	console.log("Client Connected")
    });
    
    var events = require('./event.ws.js')(io);
    this.broadcastEvents = function(cb){     
       events.dispatchAllEvent(cb)
    }
    
    return self;
}