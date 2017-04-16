'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });

module.exports.hello = (event, context, callback) => {
  
};

const createStack = () => {
  const params = {
    StackName: '', // Get info from github event - repo & branch
    TemplateBody: '',
    OnFailure: 'ROLLBACK',
    Capabilities: [ 'CAPABILITY_IAM' ],
    Parameters: [ // repo name, branch name, github access token
      {
        ParameterKey: '',
        ParameterValue: ''
      },
    ],
  };
  return cloudFormation.createStack(params).promise();
}
