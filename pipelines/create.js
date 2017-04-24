'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const GitHubApi = require('github');
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

module.exports.handler = (event, context, callback) => {
  getRepo(getRepoFromEvent(event))
  // createStack(event)
    .then( res => callback(null, res))
    .catch( err => callback(err));
};

const createStack = event => {
  const params = {
    Capabilities: [ 'CAPABILITY_IAM' ],
    NotificationARNs: [ process.env.SAVE_PIPELINE_STATUS_TOPIC ],
    OnFailure: 'ROLLBACK',
    Parameters: [ // repo name, branch name, github access token
      {
        ParameterKey: '',
        ParameterValue: ''
      },
    ],
    StackName: event.repository.name, // Get info from github event - repo & branch
    TemplateBody: require('./template.yml'),
  };
  return cloudFormation.createStack(params).promise();
}

const getRepo = repository => {
  log.trace('get repo content with repository information', repository);
  

  return new Promise( (resolve, reject) => {
    const params = {
      owner: repository.owner,
      repo: repository.name,
      archive_format: 'tarball',
      ref: 'master'
    };
    log.trace('Calling github api with params', params);
    
    let github = new GitHubApi({
      protocol: 'https',
      host: 'api.github.com',
      headers: { 'user-agent': 'frigg-local' },
      followRedirects: false
    });

    github.authenticate({
      type: 'token',
      token: process.env.GITHUB_TOKEN
    });
    github.repos.getArchiveLink(params, (err, res) => {
      if (err) {
        log.trace('err', err);
        reject(err);
      } else {
        log.trace('res', res);
        resolve(res);
      }
      reject(err);
    });
  });
}

const getRepoFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message).repository;
};
