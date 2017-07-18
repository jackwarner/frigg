'use strict';
const crypto = require('crypto');
const log = require('../lib/log');

class Validator {
  constructor(event) {
    this.headers = event.headers;
    this.bodyString = event.body;
    this.secret = process.env.GITHUB_WEBHOOK_SECRET;
  }

  validate() {
    log.info('Checking to see if event is valid');
    if (this.hasValidHeaders() && this.hasValidSignature()) {
      log.info('Event is valid');
      return Promise.resolve();
    } else {
      log.info('Event not a valid GitHub event, rejecting');
      return Promise.reject(new Error('Event isn\'t valid'));
    }
  }

  isPing() {
    log.info('Checking to see if event is ping');
    return this.headers['X-GitHub-Event'] === 'ping';
  }

  hasValidHeaders() {
    const validHeaders = this.headers['X-Hub-Signature']
                    && this.headers['X-GitHub-Event']
                    && this.headers['X-GitHub-Delivery'];
    log.info('Has valid headers:', validHeaders);
    return validHeaders;
  }

  hasValidSignature() {
    log.info('Checking to see if event has valid auth');
    const signature = this.signRequestBody();
    log.info('Supplied signature', this.headers['X-Hub-Signature']);
    log.info('Computed signature', signature);
    const validSignature = this.headers['X-Hub-Signature'] === signature;
    log.info('Has valid signature', validSignature);
    return validSignature;
  }

  signRequestBody() {
    const signature = crypto.createHmac('sha1', this.secret)
                          .update(this.bodyString, 'utf-8')
                          .digest('hex');
    return `sha1=${signature}`;
  }
};

module.exports = Validator;
