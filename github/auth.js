'use strict';
const crypto = require('crypto');
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

class GHAuth {
  constructor(headers, body, secret) {
    this.headers = headers;
    this.body = body;
    this.secret = secret;
  }

  isValid() {
    log.trace('Checking to see if event is valid');
    return this.hasValidHeaders() && this.hasValidSignature();
  }

  hasValidHeaders() {
    const validHeaders = this.headers['X-Hub-Signature']
                    && this.headers['X-GitHub-Event']
                    && this.headers['X-GitHub-Delivery'];
    log.trace('Has valid headers:', validHeaders);
    return validHeaders;
  }

  hasValidSignature() {
    log.trace('Checking to see if event has valid auth');
    const signature = this.signRequestBody();
    log.trace('Supplied signature', this.headers['X-Hub-Signature']);
    log.trace('Computed signature', signature);
    const validSignature = this.headers['X-Hub-Signature'] === signature;
    log.trace('Has valid signature', validSignature);
    return validSignature;
  }

  signRequestBody() {
    const signature = crypto.createHmac('sha1', this.secret)
                          .update(this.body, 'utf-8')
                          .digest('hex');
    return `sha1=${signature}`;
  }
};

module.exports = GHAuth;
