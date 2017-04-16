'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });

module.exports.hello = (event, context, callback) => {
  
};

const deleteStack = () => {
  const params = {
    StackName: '', // Get info from github event - repo & branch
    TemplateBody: '',
    Capabilities: [ 'CAPABILITY_IAM' ],
    Paramters: [
      {
        ParameterKey: '',
        ParameterValue: ''
      },
    ],

  };
  return cloudFormation.updateStack(params).promise();
}
