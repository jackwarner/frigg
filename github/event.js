'use strict';
const crypto = require('crypto');
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

class GHEvent {

  constructor(payload, secret) {
    log.trace('Instantiating event from GitHub', payload);
    this.payload = payload;
    this.headers = payload.headers;
    this.event = payload.headers['X-GitHub-Event'];
    this.rawBody = payload.body;
    this.body = JSON.parse(payload.body);
    this.action = payload.body.action;
    this.secret = secret;
  }

  getBody() {
    return this.body;
  }

  isValid() {
    log.trace('Checking to see if event is valid');
    return this.hasValidHeaders() && this.hasValidSignature();
  }

  isPertinent() {
    log.trace('Checking to see if event is pertinent');
    const validEvents = ['create', 'delete', 'repository', 'push'];
    return validEvents.indexOf(this.event) > -1;
  }

  shouldCreatePipeline() {
    return (this.event === 'repository' && this.action === 'created')
          || this.event === 'create';
  }

  shouldUpdatePipeline() {
    return this.event === 'push';
  }

  shouldRemovePipeline() {
    return (this.event === 'repository' && this.action === 'deleted')
          || this.event === 'delete';
  }

  hasValidHeaders() {
    const validHeaders = this.headers['X-Hub-Signature']
                    && this.headers['X-GitHub-Event']
                    && this.headers['X-GitHub-Delivery'];
    log.trace('Has valid headers:', validHeaders);
    return validHeaders;
  }

  hasValidSignature() {
    const signature = this.signRequestBody();
    log.trace('Supplied signature', this.headers['X-Hub-Signature']);
    log.trace('Computed signature', signature);
    const validSignature = this.headers['X-Hub-Signature'] === signature;
    log.trace('Has valid signature', validSignature);
    return validSignature;
  }

  signRequestBody() {
    const signature = crypto.createHmac('sha1', this.secret)
                          .update(this.rawBody, 'utf-8')
                          .digest('hex');
    return `sha1=${signature}`;
  }

  pipelineFileAdded() {

  }

  pipelineFileModified() {
    // this.body.commits.find( commit => commit.)
  }

  pipelineFileRemoved() {

  }

};

module.exports = GHEvent;
