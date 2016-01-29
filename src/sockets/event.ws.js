var Service = require('./../event/lib/cassandra/service');
var config = require('./../event/config.json');

module.exports = function(io) {
 
    var self = this;
    var event = io.of('/event');
 
    event.on('connection', function(socket) {
 
        socket.on('getAllEvents', function() {
            dispatchAllEvent(socket);
        });
        
        socket.on('getEvent', function(options, callback) {
            var params = { id : options.id };
            var service = new Service(config);
            service.listByGarage(params, function(err, result) {
                callback(err, result);
                //io.of('/garage').emit('getGarage', result);
            });
        });
 
        socket.on('saveEvent', function(data, callback) {
             var service = new Service(config);
            service.createEvent(data, function(err, result) {
                if(err) {
                     callback(err, result);
                }
                else {
                    callback(err, result);
                    dispatchAllEvent(socket);
                }
                
            });
        });
 
        socket.on('deleteEvents', function(options, callback) {
                var params = { id : options.id };
                var service = new Service(config);
                service.delete(params, function(err, result) {
                    if(err) {
                        callback(err, result);
                    }else {
                        callback(err, result);
                        dispatchAllEvent(socket);
                    }
                    
            });
        });
 
        // On connection send all the todos, to save one round trip
        dispatchAllEvent(socket);
    });
    
    this.dispatchAllEvent = function(){
        var params = {};
         var service = new Service(config);
        service.list(params, function(err, result) {
            io.of('/event').emit('getAllEvents', result);
        });
    }
    
    function dispatchAllEvent(socket) {
        var params = {};
         var service = new Service(config);
        service.list(params, function(err, result) {
            io.of('/event').emit('getAllEvents', result);
        });
    }
 
    return self;
}