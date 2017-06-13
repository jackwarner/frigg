'use strict';
const crypto = require('crypto');
const log = require('winston');
log.level = process.env.LOG_LEVEL;

class Validator {
  constructor(headers, body, secret) {
    this.headers = headers;
    this.body = body;
    this.secret = secret;
  }

  isValid() {
    log.info('Checking to see if event is valid');
    return this.hasValidHeaders() && this.hasValidSignature();
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
                          .update(this.body, 'utf-8')
                          .digest('hex');
    return `sha1=${signature}`;
  }
};

module.exports = Validator;
