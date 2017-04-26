'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

module.exports.handler = (event, context, callback) => {
  logDirectory()
    .then( res => callback(null, res))
    .catch( err => callback(err));
};

const logDirectory = () => {
  return new Promise( (resolve, reject) => {
    require('lambda-git')();
    setTimeout(() => {
      const exec = require('child_process').exec;
      //&& npm i && npm run deploy -- --stage TEST
      //  && git --version
      // && export GIT_TEMPLATE_DIR=/tmp/git/usr/share/git-core/templates && export GIT_EXEC_PATH=/tmp/git/usr/libexec/git-core
      // && export HOME=/tmp
      // const bash = 'ls && cp -R ./templates /tmp && cd /tmp/templates && ls && node --version && git --version';
      const bash = 'git --version';
      // no aws cli installed, will need to get access keys in env. to be able to call serverless deploy
      // const bash = 'cd /tmp && ls';
      exec(bash, (err, stdout, stderr) => {
        if (err) {
          log.error('err', err);
          reject(err);
        } else {
          log.trace('stdout', stdout);
          log.trace('stderr', stderr);
          resolve(stdout);
        }
      });
    }, 3 * 1000);
    
  });
};

const getRepoFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message).repository;
};
