// Email ARN
var topicARN = 'arn:aws:sns:eu-west-1:637530424188:fiveguysemail'

var sentNotifications = new Set();

function publishToSNS(faceId, message) {
    if (sentNotifications.has(faceId)) {
        // Do nothign to not spam emails
    } else {
        // Create publish parameters
        var params = {
            Message: message,
            TopicArn: topicARN
        }
        // Create promise and SNS service object
        var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

        // Handle promise's fulfilled/rejected states
        publishTextPromise.then(
            function (data) {
                console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
                console.log("MessageID is " + data.MessageId);
            }).catch(
                function (err) {
                    console.error(err, err.stack);
                });
        sentNotifications.add(faceId);
        console.log("Email sent");
    }
}
