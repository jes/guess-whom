var statemap = {
    "ask": "Please ask a question.",
    "answer": "Please answer the question.",
    "defeat": "You lost.",
    "loading": "Loading...",
    "connected": "Connection established.",
    "connecting": "Connecting websocket...",
    "ditched": "Other player lost connection",
    "disconnected": "Connection lost.",
    "victory": "You won!",
    "wait-answer": "Waiting for partner to answer...",
    "wait-partner": "Waiting for a partner - send this link: <a href=\"" + gameurl + "\">" + gameurl + "</a>",
    "wait-question": "Waiting for partner to ask a question...",
};

var state = 'loading';;

var remaining_faces = nfaces - 1;
var final_face;

var html = '';
for (var i = 1; i <= nfaces; i++) {
    if (i == faceid)
        continue;

    html += '<div class="face" id="face' + i + '" onclick="toggle_face(' + i + ')">' + facenames[i] + '<br><img src="/face/' + i + '.jpg"></div>';
}
$('#faces').html(html);

$('#q-and-a').submit(function() {
    send_question();
    return false;
});

set_state('connecting');

var ws = new WebSocket('ws://mojolicious-dev:3000/ws/game/' + gameid);

ws.onopen = function() {
    set_state('connected');
}

ws.onmessage = function(msg) {
    console.log("Received message: " + msg.data);

    var d = JSON.parse(msg.data);

    if (d['state'])
        set_state(d['state']);

    if (d['answer'])
        $('#history').html($('#history').html() + '<br><b>Answer: </b>' + d['answer']);

    if (d['question'])
        $('#history').html($('#history').html() + '<br><b>Question: </b>' + d['question']);

    if (d['state'] && d['state'] == 'victory') {
        $('#history').html($('#history').html() + '<br><b>Winner!</b>');
    } else if(d['state'] && d['state'] == 'defeat') {
        $('#history').html($('#history').html() + '<br><b>Loser!</b> The correct answer was ' + facenames[d['face']] + '.');
    }

    $('#input').attr('readonly', state != 'answer' && state != 'ask');
    $('#victory').attr('disabled', state != 'answer' && state != 'ask');
    $('#submitter').attr('disabled', state != 'answer' && state != 'ask');
}

ws.onclose = function() {
    if (state != 'ditched' && state != 'victory' && state != 'defeat')
        set_state('disconnected');

    $('#input').attr('readonly', true);
    $('#victory').attr('disabled', true);
    $('#submitter').attr('disabled', true);
}

function send_question() {
    if ($('#victory-input').css('display') == 'block')
        send_victory();
    else
        send_text();
}

function send_victory() {
    ws.send(JSON.stringify({"type":"victory", "face":final_face}));
    $('#history').html($('#history').html() + '<br><b>It\'s ' + facenames[final_face] + '.</b>');
}

function send_text() {
    var text = $('#input').val();

    if (text == '')
        return;

    $('#input').val('');

    if (state == 'ask') {
        $('#history').html($('#history').html() + '<br><b>Question: </b>' + text);
    } else if (state == 'answer') {
        $('#history').html($('#history').html() + '<br><b>Answer: </b>' + text);
    }

    ws.send(JSON.stringify({"type":"question-or-answer", "text":text}));
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

    if (remaining_faces == 1) {
        for (var i = 1; i <= nfaces; i++) {
            if ($('#face' + i).css('opacity') >= 1) {
                $('#victory').html("It's " + facenames[i] + "!");
                final_face = i;
                break;
            }
        }
        $('#question-input').css('display', 'none');
        $('#victory-input').css('display', 'block');
    } else {
        $('#question-input').css('display', 'block');
        $('#victory-input').css('display', 'none');
    }
}

function set_state(s) {
    $('#state').html(statemap[s] ? statemap[s] : s);
    state = s;
}
