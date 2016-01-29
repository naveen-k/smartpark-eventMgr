'use strict';

var Emitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var Verror = require('verror');
var bunyan = require('bunyan');
var DbClient = require('./dbClient');
var Model = require('./../models');
var async = require('async');


var log = bunyan.createLogger({
  name        : 'EventService',
  level       : process.env.LOG_LEVEL || 'info',
  stream      : process.stdout,
  serializers : bunyan.stdSerializers
});


var Service = function(configuration) {
  Emitter.call(this);
  var self = this;
  var continueWith = null;
  var db = new DbClient();
  var config = configuration;
  var Table = null;

  if(!config) {
    config = {};
    config.db = {};
    config.db.host = process.env.DB_HOST || '127.0.0.1';
    config.db.port = process.env.DB_PORT || '9042';
    config.db.keyspace = process.env.DB_KEYSPACE || 'sample';
  }

  log.info({}, 'EventService() Initialized');

  //////////////////////// INITIALIZATION DONE

  var countEvents = function(params) {
    // WARNING THIS IS AN EXPENSIVE CALL DO WE WANT TO DO THIS???
    var query = 'SELECT COUNT(*) FROM events;';

    self.emit('send-data', new Model.PageResult());

     db.instance.Event.execute_query(query, null, function(err, result) {
       if(err) {
        return self.emit('send-error', err, 'Failed to Get Count');
       }

      if(length === 0) {
        var pageResult = new Model.PageResult();
        return self.emit('send-data', pageResult);
      }

      params.length = length;
      return self.emit('list-events', params);
     });
  };

    // Check against the DB to make sure the propery doesn't already exist.
  var uniqueCheck = function(args) {
    self.emit('create-event', args);


    /*  EXAMPLE TO UNIQUE CHECK

    var query = { property1: args.property1 };
    table.exists(query, function(err, exists) {
      if(err) {
        return self.emit('send-error', err, 'Failed to Save Event');
      }

      if(exists) {
        return self.emit('send-error', null, 'Duplicate Event');
      }

      return self.emit('createEvent', args);
    });
    */
  };

  // CREATE
  var createEvent = function(args) {
    var dto = new Model.AddEvent(args);
    var valid = dto.isValid();
    if(valid !== null) {
      return self.emit('send-error', valid, 'Invalid Object');
    }
    var row = new Table(dto);
    row.save(function(err) {
      if(err) {
        let error = new Verror(err, 'CREATEEVENTFAILURE');
        return self.emit('send-error', error, 'Failed to Create Event');
      }
      return self.emit('send-data', dto);
    });
  };

  // READ
  var readEvent = function(args) {
    Table.findOne(args, function(err, result) {
      var dto = new Model.Event(result);
      if(err) {
        return self.emit('send-error', err, 'Failed to Read Event');
      }
      return self.emit('send-data', dto);
    });
  };

  // UPDATE
  var updateEvent = function(args) {
    var options = {ttl: 86400, if_exists: true};
    var id = args.id;
    var changes = new Model.Event(args);
    var valid = changes.isValid();

    if(valid !== null) {
      return self.emit('send-error', valid, 'Invalid Object');
    } else {
      delete changes.id;
    }

    Table.update({id: id}, changes, options, function(err){
      if(err) {
        return self.emit('send-error', err, 'Failed to Update Event');
      }
      changes.id = id;
      return self.emit('send-data', changes);
    });
  };

  // DELETE
  var deleteEvent = function(args) {
    Table.delete({id: args.id}, function(err, result) {
      if(err) {
        if(err.message.indexOf('Invalid Value: "1" for Field: id') >= 0) {
          return self.emit('send-data', false);
        }
        else {
          return self.emit('send-error', err, 'Failed to Delete Event');
        }
      }
      return self.emit('send-data', true);
    });
  };

  // Get List from the Database for all garage
  var listEvents = function(params) {
    var pageResult = new Model.PageResult();

    if(params.pageIndex === undefined || params.pageIndex === null) {
      params.pageIndex = 0;
    }
    if(params.pageSize === undefined || params.pageSize === null) {
      params.pageSize = 50;
    }
    pageResult.currentPage = parseInt(params.pageIndex);
    pageResult.pageSize = parseInt(params.pageSize);
    pageResult.list = [];

    var filter = {};
    filter.$limit = parseInt(params.pageSize) || 10;
    filter.$skip = (params.pageSize) * parseInt(params.pageIndex) || 0;

    Table.find(filter, function(err, rows){
      if(err) return self.emit('send-error', err, 'Failed to Get Event List');

      for(var row of rows) {
        pageResult.list.push(new Model.Event(row));
      }
      return self.emit('send-data', pageResult);
    });
  };
  // Get List from the Database for a garage
  var listEventsForGarageBydate = function(params) {
    var pageResult = new Model.PageResult();
    pageResult.list = [];

   var query = {
        garage_id: params.garage_id 
    }
    Table.find(query, function(err, rows){
      if(err) return self.emit('send-error', err, 'Failed to Get Event List');

      for(var row of rows) {
        pageResult.list.push(new Model.Event(row));
      }
      return self.emit('send-data', pageResult);
    });
  };
  

  // Create an Okay Result
  var sendData = function(data) {
    var result = new Model.Response();
    result.success = true;
    result.message = 'All Good';
    result.data = data;
    log.debug(result, 'EventService.sendData() received');

    if(continueWith) {
      continueWith(null, result);
    }
  };

  // Create a Bad Result
  var sendError = function(err, message) {
    var result = new Model.Response();
    result.success = false;
    result.message = message;
    log.error(err, 'EventService.sendError');

    if(continueWith) {
      continueWith(null, result);
    }
  };

  var openConnection = function(eventHandler, args) {    
    log.info('param :',args, 'EventService.openConnection()');
    db.connect(config.db, function(err, db) {
     if(err) {
        
        let error = new Verror(err, 'ECONNREFUSED');
        log.info(error, 'openConnection() error');
        return self.emit('send-error', error, 'Database Connection Failure');
      }

      if(db.instance.Event === undefined) {
        let error = new Verror(err, 'TABLENOTFOUND');
        log.info(error, 'openConnection() undefined');
        return self.emit('send-error', error, 'Database Connection Failure');
      }
      Table = db.instance.Event;
      Table.find({}, function(err, result) {
        if(result.length === 0) {
          log.info('Loaded Default Data', 'EventService.openConnection()');
          var data = require('./data.json');
          for (var value of data) {
            var model = new Table(new Model.Event(value));

            //TODO: HOW DO I HANDLE FOR LOOP HERE TO LOAD MORE THEN ONE Event???
            model.save(function(err){
              if(err) {
                let error = new Verror(err, 'DEFAULTDATALOAD');
                log.info(error, 'openConnection() DEFAULTDATALOAD');
                return self.emit('send-error', error, 'Database Connection Failure');
              }
              return self.emit(eventHandler, args);
            });
          }
        } else {
           log.info(args, 'EventService.openConnection()');
          return self.emit(eventHandler, args);
        }
      });
    });
  };

  /////////////////////////////////////////

  self.create = function(input, done) {
    log.info({}, 'EventService.create()');
    log.debug(input, 'EventService.create()');
		continueWith = done;
    openConnection('create-event', input);
  };

  self.read = function(input, done) {
    log.info(input, 'EventService.read()');
    log.debug(input, 'EventService.read()');
		continueWith = done;
    openConnection('read-event', input);
  };
  self.update = function(input, done) {
    log.info({}, 'EventService.update()');
    log.debug(input, 'EventService.update()');
		continueWith = done;
    openConnection('update-event', input);
  };
  self.delete = function(input, done) {
    log.info(input, 'EventService.delete()');
    log.debug(input, 'EventService.delete()');
		continueWith = done;
    openConnection('delete-event', input);
  };
  self.list = function(input, done) {
    log.info(input, 'EventService.list()');
    log.debug(input, 'EventService.list()');
    continueWith = done;
    openConnection('list-events', input);
  };
  self.listByGarage = function(input, done) {
    log.info(input, 'EventService.listByGarage()');
    log.debug(input, 'EventService.listByGarage()');
    continueWith = done;
    openConnection('list-garage-events', input);
  };
  self.close = function() {
    db.close();
  };


  // Event Wireup
  self.on('count-events', countEvents);
  self.on('create-event', createEvent);
  self.on('update-event', updateEvent);
  self.on('read-event', readEvent);
  self.on('list-events', listEvents);
  self.on('list-garage-events', listEventsForGarageBydate);
  self.on('delete-event', deleteEvent);
  self.on('send-data', sendData);
  self.on('send-error', sendError);

  return self;
};

util.inherits(Service, Emitter);
module.exports = Service;
