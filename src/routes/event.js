'use strict';
var Joi = require('joi');
var Service = require('./../event/lib/cassandra/service');
var config = require('./../event/config.json');



var GarageRoute = function(server, socket) {
	server.get('/api/events', function(req, res) {
		res.setHeader('Access-Control-Allow-Origin','*');

		var params = req.params;
        var service = new Service(config);
        service.list(params, function(err, result) {
            if(err) {
				res.send(500, err);
			} 
			else {
				res.send(200, result);
			}
        });
	});

	server.get('/api/events/:garage_id', function(req, res) {
		res.setHeader('Access-Control-Allow-Origin','*');
		
		var params = { garage_id : req.params.garage_id };
		var service = new Service(config);
		service.listByGarage(params, function(err, result) {
			if(err) {
				res.send(500, err);	
			} 
			else {
				res.send(200, result);
			}
			
		});
	});

	server.post('/api/events', function(req, res) {
		res.setHeader('Access-Control-Allow-Origin','*');

		var service = new Service(config);
		service.create(req.body, function(err, result) {
			if(err) {
				 res.send(500, err);
			}
			else {
				socket.broadcastGarages();
				res.send(200, result);
			}
			
		});
	});

	server.del('/api/events/:id', function(req, res) {
		res.setHeader('Access-Control-Allow-Origin','*');

		var service = new Service(config);
		var params = { id : req.params.id };
		service.delete(params, function(err, result) {
			if(err) {
				res.send(500, err);
			} 
			else {
				socket.broadcastGarages();
				res.send(200, result);
			}
		});
	});

	server.put('/api/events', function(req, res) {
		res.setHeader('Access-Control-Allow-Origin','*');

		var service = new Service(config);
		service.update(req.body, function(err, result) {
			if(err) {
				res.send(500, err);
			} 
			else {
				socket.broadcastGarages();
				res.send(200, result);
			}
		});
	});

};

module.exports = GarageRoute;