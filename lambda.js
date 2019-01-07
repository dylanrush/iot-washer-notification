'use strict';

const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();
const sfStateMachineArn = 'arn:aws:states:us-east-1:088831977567:stateMachine:washer-notification-machine';
var deviceMap = new Map([
  ["SINGLE", {duration: 60000 * 37, 
              topicArn: "arn:aws:sns:us-east-1:088831977567:aws-iot-button-sns-topic",
              message: "Your washer has finished washing",
              }],
  ["DOUBLE", {duration: 60000 * 107,
              topicArn: "arn:aws:sns:us-east-1:088831977567:aws-iot-button-sns-topic",
              message: "Your dryer has finished drying"
              }],
  ["LONG", {duration: 0,
              topicArn: "arn:aws:sns:us-east-1:088831977567:noop",
              message: "This is a noop, nobody should read this."
              }]
  ]);

exports.handler = (event, context, callback) => {
  var data = deviceMap.get(event.clickType);
  var nowDate = new Date();
  var nextDate = new Date(nowDate.getTime() + data.duration);
  var sfExecutionInput = {
    clickType: event.clickType,
    pressedTime: nowDate,
    expirydate: nextDate,
    originalEvent: event,
    metadata: data
    };
  var sfExecutionParams = {
    stateMachineArn: sfStateMachineArn,
    input: JSON.stringify(sfExecutionInput)
  };
  var sfListExecutionParams = {
    stateMachineArn: sfStateMachineArn,
    statusFilter: 'RUNNING'
  };
  stepfunctions.listExecutions(sfListExecutionParams, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     {
      for(var i=0; i<data.executions.length; i++) {
        var sfStopExecutionParams = {
          executionArn: data.executions[i]
        };
        stepfunctions.stopExecution(sfStopExecutionParams, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
        });
      }
    }
  });
  stepfunctions.startExecution(sfExecutionParams, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

};
