'use strict';
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const exec = require('child_process').exec;

class Bash {

  execute(command) {
    return new Promise((resolve, reject) => {
      log.trace('Running bash command', command)
      this.exec(command, (err, stdout, stderr) => {
        if (err) {
          log.error('Error running bash command', err);
          reject(err);
        } else {
          log.trace('Command output', stdout);
          log.trace('Command error', stderr);
          resolve();
        }
      });
    });
  }

};

module.exports = Bash;
