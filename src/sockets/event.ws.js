var Service = require('./../event/lib/cassandra/service');
var config = require('./../event/config.json');

module.exports = function(io) {
 
    var self = this;
    var event = io.of('/event');
 
    event.on('connection', function(socket) {
 
        socket.on('getAllEvents', function() {
            console.log("********************")
             console.log('event.ws.js getAllEvents');
            dispatchAllEvent(socket);
        });
        
        socket.on('getGarageEvent', function(options, callback) {
            var params = { garage_id : options.garage_id };
            console.log('event.ws.js getEvent',params);
            var service = new Service(config);
            service.listByGarage(params, function(err, result) {
               console.log('event.ws.js getEvent callback',params);
                callback(err, result);
            });
        });
 
        socket.on('saveEvent', function(data, callback) {
             var service = new Service(config);
             console.log('event.ws.js saveEvent',data);
            service.create(data, function(err, result) {
                if(err) {
                     callback(err, result);
                }
                else {
                    callback(err, result);
                     var garage = {
                          garage_id:data.garage_id
                     };
                    dispatchGarageEvent(socket,garage);
                }
                
            });
        });
 
        socket.on('deleteEvents', function(options, callback) {
            console.log('event.ws.js deleteEvents',options);
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
        //dispatchAllEvent(socket);
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
            console.log(result)
            io.of('/event').emit('getAllEvents', result);
        });
    }
    function dispatchGarageEvent(socket,input) {
         console.log('event.ws.js dispatchGarageEvent',input);
        var params = { garage_id : input.garage_id };
         var service = new Service(config);
         service.listByGarage(params, function(err, result) {
               io.of('/event').emit('getAllEvents', result);
         });
    }
    return self;
}