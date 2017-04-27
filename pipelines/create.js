'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

module.exports.handler = (event, context, callback) => {
  deployPipelineForRepository(getRepoFromEvent(event))
    .then( res => callback(null, res))
    .catch( err => callback(err));
};

const deployPipelineForRepository = repo => {
  return new Promise( (resolve, reject) => {
    require('lambda-git')();
    setTimeout(() => {
      const exec = require('child_process').exec;
      const dir = `/tmp/${repo.owner}/${repo.name}/master`;
      const cleanDir = `rm -rf ${dir} && mkdir -p ${dir}`;
      const cloneRepo = `git clone -b master --single-branch https://${process.env.GITHUB_TOKEN}@github.com/${repo.owner}/${repo.name}.git`;
      const setAWSCredentials = `set AWS_ACCESS_KEY=${process.env.AWS_ACCESS_KEY} && set AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}`;
      const buildPipeline = `cd ${repo.name}/pipeline && npm i && npm run deploy`
      const bash = `${cleanDir} && cd ${dir} && ${cloneRepo} && ${setAWSCredentials} && ${buildPipeline}`;
      console.log('Executing:', bash);
      
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
