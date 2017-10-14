'use strict';
const validator = require('./validator');
const PipelineTrigger = require('./pipelineTrigger');
const log = require('../../utils/log');

class Message {
  constructor(event) {
    this.event = event;
    this.event.body = JSON.parse(event.body);
  }

  handle() {
    if (this.isPing()) {
      return Promise.resolve('Success');
    } else {
      const validator = new Validator(this.event);
      return validator.validate()
        .then(res => new PipelineTrigger(this.event))
        .then(trigger => trigger.send());
    }
  }

  isPing() {
    log.info('Checking to see if message is ping');
    return this.event.headers['X-GitHub-Event'] === 'ping';
  }
};

module.exports = Message;
