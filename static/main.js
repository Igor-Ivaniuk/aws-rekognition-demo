var emotionTexts = {
    "CALM": "Tengo sueño, ¡necesito la energía de AWS!",
    "SAD": "Los servidores on-prem me entristecen...",
    "CONFUSED": "No entiendo esta demo, voy a preguntarle a un SA",
    "HAPPY": "¡Me encanta la inteligencia artificial!",
    "ANGRY": "El hambre me tiene de mal humor...",
    "DISGUSTED": "¿Algún médico en la sala?",
    "SURPRISED": "¡Hala! ¡como mola esta demo!"
  };

  var rekognition = null;
  var camWidth = 0;
  var camHeight = 0;

  function startRekognition() {
    AWS.config.region = 'eu-west-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: '<YOUR-IDENTITY-POOL-HERE>',
    });
    rekognition = new AWS.Rekognition();
  }

  function getAndListLabels() {

      let mainEmotion = null

      Webcam.snap(function(data_uri) {

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