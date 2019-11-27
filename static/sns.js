// Email ARN
var topicARN = 'arn:aws:sns:eu-west-1:637530424188:fiveguysemail'

function startSNS()
{
    // Load the AWS SDK
    var AWS = require('aws-sdk');
    // Set region
    AWS.config.update({region: 'eu-west-1'});
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: '<YOUR-IDENTITY-POOL-HERE>',
    });
}

function publishToSNS(message)
{
    // Create publish parameters
    var params = {
        Message: message,
        TopicArn: topicARN
    }
    // Create promise and SNS service object
    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function(data) {
        console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
        }).catch(
        function(err) {
        console.error(err, err.stack);
        });
}
