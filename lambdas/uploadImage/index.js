var AWS = require('aws-sdk');

// Create DynamoDB client
var ddb = new AWS.DynamoDB();
//Create s3 client
var s3 = new AWS.S3();
//Create rekognition client
var rekognition = new AWS.Rekognition();

//Bucket Name
var bucketName = "salaunch-fiveguys";

exports.handler = (event) => {

    //Setup error response
    const errorResponse = {
        statusCode: 500,
        body: JSON.stringify('Fail!')
    };
    

    //
    // Upload to image to S3
    //

    //Convert base64 string to byte buffer
    const buffer = Buffer.from(event['imageData'], 'base64');

    var upload = new AWS.S3.ManagedUpload({
        params: {
            Bucket: bucketName,
            Key: event['imageURL'],
            Body: buffer
        }
    });

    var promise = upload.promise();

    promise.then(
        function (data) {
            console.log("Successfully uploaded photo.");
        },
        function (err) {
            console.log("There was an error uploading your photo: ", err.message);
            return errorResponse;
        }
    );


    //
    // Add Image to Rekognition Collection
    //

    var faceId = null;
    var imageId = null;

    var rekognitionParams = {
        CollectionId: "known-faces",
        DetectionAttributes: [
        ],
        Image: {
            S3Object: {
                Bucket: bucketName,
                Name: event['imageURL']
            }
        }
    };
    
    rekognition.indexFaces(rekognitionParams, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            return errorResponse;
        }
        else {
            console.log("Added image to rekognition", data);
            faceId = data['FaceRecords'][0]['Face']['FaceId'];
            imageId = data['FaceRecords'][0]['Face']['ImageId'];
            console.log('\n FACEID:', faceId);
            console.log(imageId);
        }
    });

    //
    // Put the metadata of the image in DynamoDB
    //
    console.log("HHHHHHHHHHHHHHHHHHHHHH");
    var params = {
        TableName: 'faces',
        Item: {
            faceId: { S: faceId },
            imageId: { S: imageId },
            imageURL: { S: event['imageURL'] },
            name: { S: event['name'] }
        }
    };
    console.log(params);
    ddb.putItem(params, function (err, data) {
        if (err) {
            console.log("Error", err);
            return errorResponse;
        } else {
            console.log("Successfully added metadata to DynamoDB", data);
        }
    });

    const response = {
        statusCode: 200,
        body: JSON.stringify('Success!')
    };

    return response;
};