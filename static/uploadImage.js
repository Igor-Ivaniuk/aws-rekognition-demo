

function uploadImage()
{
    var name = document.getElementById("nameInput").value;
    var image = document.getElementById("fileInput").files[0];

    var reader = new FileReader();
    reader.onload = function() {

        var binaryString = this.result;
        var data = JSON.stringify({ "name": name, "imageData": binaryString });
        console.log(data);
        $.post("https://rbsxsslare.execute-api.eu-west-1.amazonaws.com/default/uploadImage", data, function(result){
            $("span").html(result);
          });
    };
    reader.readAsDataURL(image);
}