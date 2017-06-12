'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Validator = require('./validator');
const Processer = require('./processer');

class Payload {
  constructor(payload) {
    const body = JSON.parse(payload.body);
    log.trace('Instantiating event from payload', payload);
    this.event = payload.headers['X-GitHub-Event'];
    this.auth = new Validator(payload.headers, payload.body, process.env.GITHUB_WEBHOOK_SECRET);
    this.processer = new Processer(payload.headers['X-GitHub-Event'], body.action, body);
  }

  isValid() {
    return this.auth.isValid();
  }

  isPertinent() {
    log.trace('Checking to see if event is pertinent');
    const validEvents = ['create', 'delete', 'repository', 'push'];
    return validEvents.indexOf(this.event) > -1;
  }

  processEvent() {
    return this.processer.send();
  }

};

module.exports = Payload;
