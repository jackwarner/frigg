'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const GHAuth = require('./auth');
const PipelineEvent = require('./pipelineEvent');

class GHEvent {
  constructor(payload, secret) {
    log.trace('Instantiating event from payload', payload);
    this.event = payload.headers['X-GitHub-Event'];
    this.auth = new GHAuth(payload.headers, payload.body, process.env.GITHUB_WEBHOOK_SECRET);
    this.pipelineEvent = new PipelineEvent(payload.headers['X-GitHub-Event'], payload.body.action, JSON.parse(payload.body));
  }

  isValid() {
    return this.auth.isValid();
  }

  isPertinent() {
    log.trace('Checking to see if event is pertinent');
    const validEvents = ['create', 'delete', 'repository', 'push'];
    return validEvents.indexOf(this.event) > -1;
  }

  sendPipelineEvent() {
    return this.pipelineEvent.send();
  }

};

module.exports = GHEvent;
