{
  "StartAt": "WaitUntil",
  "States": {
  "WaitUntil" : {
      "Type": "Wait",
      "TimestampPath": "$.expirydate",
      "Next": "PublishMessage"
  },
    "PublishMessage": {
      "Type": "Task",
      "Resource": "arn:aws:states:::sns:publish",
      "Parameters": {
        "TopicArn.$": "$.metadata.topicArn",
        "Message.$": "$.metadata.message"
      },
      "End": true
    }
  }
}
