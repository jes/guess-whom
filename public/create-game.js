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
        var dim = scale(image, 900, 675);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.drawImage(image, 0, 0, dim.w, dim.h);
    };

    image.src = url;
});

function scale(img, w, h) {
    var wfactor = img.width / w;
    var hfactor = img.height / h;

    if (wfactor > hfactor) {
        console.log("wf");
        return { w: w, h: img.height / wfactor };
    } else {
        console.log("hfactor = " + hfactor);
        return { w: img.width / hfactor, h: h };
    }
};
