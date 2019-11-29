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
        body: JSON.stringify("Fail!")
    };
    

    //
    // Upload to image to S3
    //

    //Convert base64 string to byte buffer
    var json = JSON.parse(event.body);
    var imageBase64 = json.imageData.split(',');
    const buffer = Buffer.from(imageBase64[1], 'base64');
    //Generate image key
    var dateTime = new Date();
    var imageKey = "images/" + dateTime.getTime() + json.name + ".jpg";
    console.log(imageKey);
    console.log(json)
    var upload = new AWS.S3.ManagedUpload({
        params: {
            Bucket: bucketName,
            Key: imageKey,
            Body: buffer
        }
    });

    let s3Data = await upload.promise();

    if(s3Data) {
        console.log("\nSuccessfully uploaded photo.", "\n");
    }
    else{
        console.log("\nERROR: Unable to upload photo to S3", "\n");
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
                Name: imageKey
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
            imageURL: { S: imageKey },
            name: { S: json.name }
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
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        },
        statusCode: 200,
        body: JSON.stringify("Success!")
    };

    return response;
};