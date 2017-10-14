'use strict';
const validator = require('./validator');
const PipelineEvent = require('./pipelineEvent');
const log = require('../../utils/log');

class Message {
  constructor(event) {
    log.debug('Creating new webhook message from event', event);
    event.body = JSON.parse(event.body);
    this.event = event;
  }

  handle() {
    if (this.isPing()) {
      return Promise.resolve('Success');
    } else if (this.isValidGitHubMessage()) {
      const pipelineEvent = new PipelineEvent(this.event);
      return pipelineEvent.handle();
    } else {
      return Promise.reject('Not a valid GitHub event');
    }
  }

  isPing() {
    log.info('Checking to see if message is ping');
    return this.event.headers['X-GitHub-Event'] === 'ping';
  }

  isValidGitHubMessage() {
    log.info('Checking to see if message is valid github message');
    const validator = new Validator(this.event);
    return validator.isValid();
  }
};

module.exports = Message;
