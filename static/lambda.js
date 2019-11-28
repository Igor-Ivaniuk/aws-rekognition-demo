var AWS = require('aws-sdk');

// Create DynamoDB client
var ddb = new AWS.DynamoDB();
//Create s3 client
var s3 = new AWS.S3();
//Create rekognition client
var rekognition = new AWS.Rekognition();

//Bucket Name
var bucketName = "salaunch-fiveguys";

exports.handler = async (event) => {

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

    let s3Data = await upload.promise();

    if(s3Data) {
        console.log("\nSuccessfully uploaded photo.", "\n");
    }
    else{
        console.log("\nERRRO: Unable to upload photo to S3", "\n");
        return errorResponse;
    }


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
    
    let rekognitionData = await rekognition.indexFaces(rekognitionParams).promise();
    if (rekognitionData) {
        console.log("\nSuccessfully added image to rekognition", rekognitionData, "\n");
        faceId = rekognitionData['FaceRecords'][0]['Face']['FaceId'];
        imageId = rekognitionData['FaceRecords'][0]['Face']['ImageId'];
        console.log("\nFACE ID: ", faceId, "\n");
        console.log("\nIMAGE ID: ",imageId, "\n");
    }
    else {
        console.log("\nERROR: Unable to index face", "\n"); // an error occurred
        return errorResponse;
    }

    //
    // Put the metadata of the image in DynamoDB
    //
    var params = {
        TableName: 'faces',
        Item: {
            faceId: { S: faceId },
            imageId: { S: imageId },
            imageURL: { S: event['imageURL'] },
            name: { S: event['name'] }
        }
    };
    
    let dynamoData = await ddb.putItem(params).promise();
    if (dynamoData) {
        console.log("\nSuccessfully added metadata to DynamoDB", "\n", dynamoData);
    } else {
        console.log("\nERROR: Unable to add metedata to DynamoDB", "\n", dynamoData);
        return errorResponse;
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Success!')
    };

    return response;
};