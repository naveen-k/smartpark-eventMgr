'use strict';
var uuid = require('node-uuid');
var Joi = require('joi');

var Model = function(args) {
  var self = this;

  var _eventSchema = {
      garage_id: Joi.string().required(),
      description: Joi.string().required(),
      image_url : Joi.string().optional(),
      category: Joi.string().required(),
      spot: Joi.string().required()
  };


  self.Event = class Event {
    constructor(args) {
      if(!args) { args = {} };
      this.garage_id = args.garage_id;
      this.description = args.description;
      this.category = args.category;
      this.image_url = args.image_url||'';
      this.spot = args.spot;
      this.time = args.time;
      this.id = args.id;
    }
    isValid() {
      return Joi.validate(this, Joi.object().keys(_eventSchema)).error;
    }
  }
  self.AddEvent = class Event {
    constructor(args) {
      if(!args) { args = {} };
      this.garage_id = args.garage_id;
      this.description = args.description;
      this.category = args.category;
      this.image_url = args.image_url||'';
      this.spot = args.spot;
    }
    isValid() {
      return Joi.validate(this, Joi.object().keys(_eventSchema)).error;
    }
  }

  self.PageResult = class {
    constructor() {
      this.pages = 0;
      this.currentPage = 0;
      this.count = 0;
      this.list = [];
    }
  }

  self.Response = class {
    constructor(args) {
      if(!args) { args = {} };
      this.success = false || args.success;
      this.message = null || args.message;
      this.data = null;
    }
  }

  self.Schema = {
    Event: _eventSchema
  }

  return self;
}

module.exports = new Model();