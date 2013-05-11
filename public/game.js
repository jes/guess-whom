var statemap = {
    "ask": "Please ask a question.",
    "answer": "Please answer the question.",
    "loading": "Loading...",
    "connecting": "Connecting websocket...",
    "disconnected": "Connection lost!",
    "wait-answer": "Waiting for partner to answer...",
    "wait-partner": "Waiting for a partner - send this link: <a href=\"" + gameurl + "\">" + gameurl + "</a>",
    "wait-question": "Waiting for partner to ask a question...",
};

var state = 'loading';;

var remaining_faces = nfaces - 1;

var html = '';
for (var i = 1; i <= nfaces; i++) {
    if (i == faceid)
        continue;

    html += '<div class="face" id="face' + i + '" onclick="toggle_face(' + i + ')">' + facenames[i] + '<br><img src="/face/' + i + '.jpg"></div>';
}
$('#faces').html(html);

$('#q-and-a').submit(function() {
    send_text();
    return false;
});

set_state('connecting');

var ws = new WebSocket('ws://mojolicious-dev:3000/ws/game/' + gameid);

ws.onopen = function() {
    console.log("Connection opened!");
}

ws.onmessage = function(msg) {
    console.log("Received message: " + msg.data);

    var d = JSON.parse(msg.data);

    if (d['state']) {
        set_state(d['state']);
    }

    if (d['answer']) {
        $('#history').html($('#history').html() + '<br><b>Answer: </b>' + d['answer']);
    }

    if (d['question']) {
        $('#history').html($('#history').html() + '<br><b>Question: </b>' + d['question']);
    }

    $('#input').attr('readonly', state != 'answer' && state != 'ask');
    $('#submitter').attr('disabled', state != 'answer' && state != 'ask');
}

ws.onclose = function() {
    set_state('disconnected');

    $('#input').attr('readonly', true);
    $('#submitter').attr('disabled', true);
}

function send_text() {
    var text = $('#input').val();
    $('#input').val('');

    if (state == 'ask') {
        $('#history').html($('#history').html() + '<br><b>Question: </b>' + text);
    } else if (state == 'answer') {
        $('#history').html($('#history').html() + '<br><b>Answer: </b>' + text);
    }

    ws.send(text);
}

function toggle_face(i) {
    var opacity = $('#face' + i).css('opacity');

    if (opacity < 1) {
        remaining_faces++;
        $('#face' + i).css('opacity', '1.0');
    } else {
        remaining_faces--;
        $('#face' + i).css('opacity', '0.3');
    }
}

function set_state(s) {
    $('#state').html(statemap[s] ? statemap[s] : s);
    state = s;
}
