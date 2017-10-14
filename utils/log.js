'use strict';
const log = require('winston');
log.level = process.env.LOG_LEVEL;

module.exports = log;
