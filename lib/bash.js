'use strict';
const exec = require('child_process').exec;
const log = require('winston');
log.level = process.env.LOG_LEVEL;

class Bash {

  execute(command) {
    return new Promise((resolve, reject) => {
      log.info('Running bash command', command)
      exec(command, (err, stdout, stderr) => {
        if (err) {
          log.error('Error running bash command', err);
          reject(err);
        } else {
          log.info('Command output', stdout);
          log.info('Command error', stderr);
          resolve(stdout);
        }
      });
    });
  }

};

module.exports = Bash;
