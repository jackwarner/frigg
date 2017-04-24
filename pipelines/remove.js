'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });

module.exports.handler = (event, context, callback) => {
  
};

const deleteStack = () => {
  const params = {
    StackName: '', // Get info from github event - repo & branch
  };
  return cloudFormation.deleteStack(params).promise();
}
