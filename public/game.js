var statemap = {
    "ask": "Please ask a question.",
    "answer": "Please answer the question.",
    "defeat": "Loser.",
    "loading": "Loading...",
    "connected": "Connection established.",
    "connecting": "Connecting websocket...",
    "ditched": "Other player lost connection",
    "disconnected": "Connection lost.",
    "victory": "Winner.",
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

    html += '<div class="face" id="face' + i + '" onclick="toggle_face(' + i + ')">' + facenames[i] + '<br><img src="/face/' + facetype + '/' + i + '.jpg"></div>';
}
$('#faces').html(html);

$('#question-form').submit(function() {
    send_question();
    return false;
});

$('#victory-form').submit(function() {
    send_victory();
    return false;
});

$('#yes-form').submit(function() {
    send_answer('yes');
    return false;
});

$('#no-form').submit(function() {
    send_answer('no');
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

    var oldstate = state;

    if (d['state'] != undefined) {
        set_state(d['state']);

        if (d['state'] == 'victory') {
            if (d['face'] != undefined) {
                $('#history').html($('#history').html() + '<br>Opponent guessed <b>' + facenames[d['face']] + '</b>.');
            }
            if (d['realface'] != undefined) {
                $('#history').html($('#history').html() + '<br><b>You won!</b> Your opponent\'s face was <b>' + facenames[d['realface']] + '</b>.');
            } else {
                $('#history').html($('#history').html() + '<br><b>You won!</b>');
            }
        } else if(d['state'] == 'defeat') {
            if (oldstate == 'wait-question') {
                $('#history').html($('#history').html() + '<br>Opponent guessed corectly.');
            }
            $('#history').html($('#history').html() + '<br><b>You lost!</b> Your opponent\'s face was ' + facenames[d['face']] + '.');
        }
    }

    if (d['answer'] != undefined)
        $('#history').html($('#history').html() + '<br><b>Answer: </b>' + d['answer']);

    if (d['question'] != undefined)
        $('#history').html($('#history').html() + '<br><b>Question: </b>' + d['question']);

    redraw_inputs();
}

ws.onclose = function() {
    if (state != 'ditched' && state != 'victory' && state != 'defeat')
        set_state('disconnected');

    $('#input').attr('readonly', true);
    $('#victory').attr('disabled', true);
    $('#submitter').attr('disabled', true);

    redraw_inputs();
}

function send_victory() {
    ws.send(JSON.stringify({"type":"victory", "face":final_face}));
    $('#history').html($('#history').html() + '<br><b>It\'s ' + facenames[final_face] + '.</b>');
}

function send_question() {
    var text = $('#input').val();

    if (text == '')
        return;

    $('#input').val('');

    $('#history').html($('#history').html() + '<br><b>Question: </b>' + text);

    ws.send(JSON.stringify({"type":"question", "text":text}));
}

function send_answer(ans) {
    $('#history').html($('#history').html() + '<br><b>Answer: </b>' + ans);

    ws.send(JSON.stringify({"type":"answer", "answer":ans}));
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

    redraw_inputs();
}

function set_state(s) {
    $('#state').html(statemap[s] ? statemap[s] : s);
    state = s;
}

function redraw_inputs() {
    $('#input').attr('readonly', state != 'answer' && state != 'ask');
    $('#victory').attr('disabled', state != 'answer' && state != 'ask');
    $('#submitter').attr('disabled', state != 'answer' && state != 'ask');
    $('#yes-button').attr('disabled', state != 'answer' && state != 'ask');
    $('#no-button').attr('disabled', state != 'answer' && state != 'ask');

    if (state == 'wait-partner' || state == 'wait-answer' || state == 'ask') {
        if (remaining_faces == 1) {
            for (var i = 1; i <= nfaces; i++) {
                if ($('#face' + i).css('opacity') >= 1) {
                    $('#victory').html("It's " + facenames[i] + "!");
                    final_face = i;
                    break;
                }
            }
            $('#question-input').css('display', 'none');
            $('#answer-input').css('display', 'none');
            $('#victory-input').css('display', 'block');
        } else {
            $('#question-input').css('display', 'block');
            $('#answer-input').css('display', 'none');
            $('#victory-input').css('display', 'none');
        }
    } else {
        $('#question-input').css('display', 'none');
        $('#answer-input').css('display', 'block');
        $('#victory-input').css('display', 'none');
    }
}
