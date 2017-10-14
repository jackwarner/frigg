'use strict';
const Webhook = require('./webhook');
const cf = require('../../utils/cloudformation');
const log = require('../../utils/log');

const CONFIG_KEY = 'github-webhook-config.json';

module.exports.github = (event, context) => {
  log.debug('Received event to configure github webhook', event);

  let webhook = new Webhook(event);
  webhook.configure()
    .then(res => cf.respond(event, context, res.message, res.err))
    .catch(res => cf.respond(event, context, res.message, res.err))
};
