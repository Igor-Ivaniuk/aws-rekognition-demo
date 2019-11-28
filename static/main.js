var rekognition = null;
var camWidth = 0;
var camHeight = 0;

function initAWS() {
    AWS.config.region = 'eu-west-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: params.cognitoPool,
    });
}

function startRekognition() {
    rekognition = new AWS.Rekognition();
}

function getAndListLabels() {

    let mainEmotion = null

    Webcam.snap(function (data_uri) {

        var imageBlob = dataURItoBlob(data_uri);
        var params = {
            Image: {
                Bytes: imageBlob
            }
        };
        var params1 = {
            Attributes: ["ALL"],
            Image: {
                Bytes: imageBlob
            }
        };

        rekognition.detectFaces(params1, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                $("#faceBox").empty();
                if (data.FaceDetails.length > 0) {
                    let faceBox = document.getElementById("faceBox")
                    faceBox.style.top = (data.FaceDetails[0].BoundingBox.Top * camHeight) + "px"
                    faceBox.style.left = (data.FaceDetails[0].BoundingBox.Left * camWidth) + "px"
                    faceBox.style.height = (data.FaceDetails[0].BoundingBox.Height * camHeight) + "px";
                    faceBox.style.width = (data.FaceDetails[0].BoundingBox.Width * camWidth) + "px";
                    faceBox.style.visibility = "visible";
                } else {
                    document.getElementById("faceBox").style.visibility = "hidden";
                }
            }
        });

        rekognition.recognizeCelebrities(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                $("#faceCelebrity").empty();
                $("#faceCelebrityText").empty();
                if (data.CelebrityFaces.length > 0) {
                    let faceCelebrity = document.getElementById("faceCelebrity")
                    faceCelebrity.style.top = (data.CelebrityFaces[0].Face.BoundingBox.Top * camHeight) + "px"
                    faceCelebrity.style.left = (data.CelebrityFaces[0].Face.BoundingBox.Left * camWidth) + "px"
                    faceCelebrity.style.height = (data.CelebrityFaces[0].Face.BoundingBox.Height * camHeight) + "px";
                    faceCelebrity.style.width = (data.CelebrityFaces[0].Face.BoundingBox.Width * camWidth) + "px";

                    let faceCelebrityText = document.getElementById("faceCelebrityText")
                    faceCelebrityText.innerHTML = data.CelebrityFaces[0].Name + ' in da house! (Sure about it for ' + data.CelebrityFaces[0].MatchConfidence + '%)';
                    if (data.CelebrityFaces[0].MatchConfidence > 90) {
                        faceCelebrity.style.visibility = "visible";
                        faceCelebrityText.style.visibility = "visible";
                    }
                    console.log(data);
                } else {
                    document.getElementById("faceCelebrity").style.visibility = "hidden";
                    document.getElementById("faceCelebrityText").style.visibility = "hidden";
                }
            }
        });

        var searchByCollectionParams = {
            CollectionId: "known-faces",
            FaceMatchThreshold: 90,
            Image: {
                Bytes: imageBlob
            }
        };

        rekognition.searchFacesByImage(searchByCollectionParams, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                $("#faceBadGuy").empty();
                $("#faceBadGuyText").empty();
                if (data.FaceMatches.length > 0) {


                    let faceBadGuy = document.getElementById("faceBadGuy")
                    faceBadGuy.style.top = (data.SearchedFaceBoundingBox.Top * camHeight) + "px"
                    faceBadGuy.style.left = (data.SearchedFaceBoundingBox.Left * camWidth) + "px"
                    faceBadGuy.style.height = (data.SearchedFaceBoundingBox.Height * camHeight) + "px";
                    faceBadGuy.style.width = (data.SearchedFaceBoundingBox.Width * camWidth) + "px";

                    // faceCollection.style.top = (data.FaceMatches[0].Face.BoundingBox.Top * camHeight) + "px"
                    // faceCollection.style.left = (data.FaceMatches[0].Face.BoundingBox.Left * camWidth) + "px"
                    // faceCollection.style.height = (data.FaceMatches[0].Face.BoundingBox.Height * camHeight) + "px";
                    // faceCollection.style.width = (data.FaceMatches[0].Face.BoundingBox.Width * camWidth) + "px";

                    $.getJSON("https://rbsxsslare.execute-api.eu-west-1.amazonaws.com/api/face-metadata" + "?faceId=" + data.FaceMatches[0].Face.FaceId,
                    function(nameResponse) {
                        let faceBadGuyText = document.getElementById("faceBadGuyText");
                        faceBadGuyText.innerHTML = 'Unwanted person!!! It is '+nameResponse.body.Item.name+' (Sure about it for ' + data.FaceMatches[0].Face.Confidence + '%)';
                        faceBadGuyText.style.visibility = "visible";
                    });

                    faceBadGuy.style.visibility = "visible";
                } else {
                    document.getElementById("faceBadGuy").style.visibility = "hidden";
                    document.getElementById("faceBadGuyText").style.visibility = "hidden";
                }
            }
        });

    });
}

function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Uint8Array(array);
}