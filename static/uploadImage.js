

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
            var div = document.createElement("div");
            div.style.width = "100px";
            div.style.height = "100px";
            div.style.color = "green";
            div.innerHTML = "Bad guy added!";
            var element = document.getElementById("buttonInput");
            element.parentNode.removeChild(element);
            document.getElementById("main").appendChild(div);
            
          });
    };
    reader.readAsDataURL(image);
}