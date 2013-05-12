var windowURL = window.URL || window.webkitURL;
var input = $('#file-input')[0];
var canvas = $('#faces-canvas')[0];

var angle = 1;

var image = new Image();
image.onload = function() {
    rerender();
};

$('#file-input').change(function() {
    var file = input.files[0];

    if (!file)
        return;

    image.src = windowURL.createObjectURL(file);
});

function rerender() {
    var dim = scale(image, 900, 900);

    var ctx = canvas.getContext('2d');

    ctx.save();
    ctx.translate(900/2, 900/2);
    ctx.rotate(angle * Math.PI/2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-900/2, -900/2, 900, 900);
    ctx.drawImage(image, -dim.w/2, -dim.h/2, dim.w, dim.h);
    ctx.restore();

    var w = enddragx - startdragx;
    var h = enddragy - startdragy;

    var d = w > h ? w : h;

    ctx.fillStyle = 'rgba(255,0,0,0.5)';

    if (d > 5)
        ctx.fillRect(startdragx - d, startdragy - d, d*2, d*2);
}

function scale(img, w, h) {
    var wfactor = img.width / w;
    var hfactor = img.height / h;

    if (wfactor > hfactor) {
        return { w: w, h: img.height / wfactor };
    } else {
        return { w: img.width / hfactor, h: h };
    }
}

function angle_change(amt) {
    angle += amt;
    while (angle < 0)
        angle += 4;

    angle = angle % 4;

    rerender();
}

var in_drag;
var startdragx, startdragy;
var enddragx, enddragy;

function start_drag() {
    in_drag = true;

    startdragx = enddragx = window.event.clientX - canvas.getBoundingClientRect().left;
    startdragy = enddragy = window.event.clientY - canvas.getBoundingClientRect().top;

    rerender();
}

function update_drag() {
    if (!in_drag)
        return;

    enddragx = window.event.clientX - canvas.getBoundingClientRect().left;
    enddragy = window.event.clientY - canvas.getBoundingClientRect().top;

    rerender();
}

function end_drag() {
    in_drag = false;

    rerender();
}
