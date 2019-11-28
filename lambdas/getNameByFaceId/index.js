exports.handler = async function (event) {
    console.log(event.faceId)
    // Load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    // Set the region 
    AWS.config.update({
        region: 'eu-west-1'
    });

    // Create DynamoDB document client
    var docClient = new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10'
    });

    var params = {
        TableName: 'faces',
        Key: {
            // "faceId": '5317040f-f936-45e8-bbab-f9c8605c259e'     
            "faceId": event.faceId
        }
    };

    let response = {
        statusCode: 000,
        body: ""
    }

    let data = await docClient.get(params).promise();

    if (data) {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        response.statusCode = 200
        response.body = data
    } else {
        console.error("Unable to find item");
        response.statusCode = 404
    };

    console.log("Response: " + JSON.stringify(response))
    return response;
};
