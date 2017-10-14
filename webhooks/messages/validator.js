'use strict';
const crypto = require('crypto');
const log = require('../../utils/log');

class Validator {
  constructor(event) {
    log.debug('Creating new validator for github event', event);
    this.headers = event.headers;
    this.bodyString = JSON.stringify(event.body);
    this.secret = process.env.GITHUB_WEBHOOK_SECRET;
  }

  isValid() {
    log.info('Checking to see if event is valid');
    const isValid = this.hasValidHeaders() && this.hasValidSignature();
    log.info(`Event ${ isValid ? 'is' : 'isn\'t' } valid`);
    return isValid;
  }

  hasValidHeaders() {
    const validHeaders = this.headers['X-Hub-Signature']
                    && this.headers['X-GitHub-Event']
                    && this.headers['X-GitHub-Delivery'];
    log.info('Event has valid headers', validHeaders);
    return validHeaders;
  }

  hasValidSignature() {
    log.info('Checking to see if event has valid auth');
    const signature = this.signRequestBody();
    log.info('Supplied signature', this.headers['X-Hub-Signature']);
    log.info('Computed signature', signature);
    const validSignature = this.headers['X-Hub-Signature'] === signature;
    log.info('Event has valid signature', validSignature);
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
