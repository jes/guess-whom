var windowURL = window.URL || window.webkitURL;
var input = $('#file-input')[0];
var canvas = $('#faces-canvas')[0];

var faces = [];

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

$('#plus90-button').click(function() {
    angle_change(1);
});

$('#minus90-button').click(function() {
    angle_change(-1);
});

$('#undo-button').click(function() {
    undo();
});

$('#clear-button').click(function() {
    clear_canvas();
});

$('#faces-canvas').mousedown(function() {
    start_drag();
});
$('#faces-canvas').mousemove(function() {
    update_drag();
});
$('#faces-canvas').mouseup(function() {
    end_drag();
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

    ctx.fillStyle = 'rgba(255,0,0,0.5)';

    for (var i = 0; i < faces.length; i++) {
        draw_rectangle(ctx, faces[i]);
    }

    if (in_drag) {
        var w = enddragx - startdragx;
        var h = enddragy - startdragy;
        var d = w > h ? w : h;
        if (d > 5)
            draw_rectangle(ctx, [startdragx, startdragy, d]);
    }
}

function draw_rectangle(ctx, f) {
    ctx.fillRect(f[0] - f[2], f[1] - f[2], f[2]*2, f[2]*2);
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

function undo() {
    faces.pop();
    rerender();
}

function clear_canvas() {
    faces.length = 0;
    rerender();
}

var in_drag;
var startdragx, startdragy;
var enddragx, enddragy;

function start_drag() {
    window.event.preventDefault();

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
    if (!in_drag)
        return;

    in_drag = false;

    var w = enddragx - startdragx;
    var h = enddragy - startdragy;
    var d = w > h ? w : h;
    if (d > 5)
        faces.push([startdragx, startdragy, d]);

    rerender();
}
