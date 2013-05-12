var windowURL = window.URL || window.webkitURL;
var input = $('#file-input')[0];
var canvas = $('#faces-canvas')[0];

$('#file-input').change(function() {
    var file = input.files[0];

    if (!file)
        return;

    var url = windowURL.createObjectURL(file);
    var ctx = canvas.getContext('2d');
    var image = new Image();

    image.onload = function() {
        ctx.drawImage(image, 0, 0, 900, 675);
    };

    image.src = url;
});
