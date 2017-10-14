'use strict';
const Webhook = require('./webhook');
const cf = require('../../lib/cloudformation');
const log = require('../../lib/log');

const CONFIG_KEY = 'github-webhook-config.json';

module.exports.github = (event, context) => {
  log.info('Receiving event for github configuration', event);
  log.info('Request type', event.RequestType);

  let webhook = new Webhook(event);
  webhook.configure()
    .then(res => cf.respond(event, context, res.message, res.err))
    .catch(res => cf.respond(event, context, res.message, res.err))
};
