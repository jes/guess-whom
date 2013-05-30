var statemap = {
    "ask": "Please ask a question.",
    "answer": "Please answer the question.",
    "defeat": "Loser.",
    "loading": "Loading...",
    "connected": "Connection established.",
    "connecting": "Connecting websocket...",
    "ditched": "Other player lost connection.",
    "disconnected": "Connection lost.",
    "victory": "Winner.",
    "wait-answer": "Waiting for partner to answer...",
    "wait-partner": "Waiting for a partner - send this link: <a href=\"" + gameurl + "\">" + gameurl + "</a>",
    "wait-question": "Waiting for partner to ask a question...",
};

var time_left = 0;
var timer_running = {
    "ask": true,
    "answer": true,
    "wait-answer": true,
    "wait-question": true,
};

var state = 'loading';

var faceid;
var remaining_faces = nfaces - 1;
var final_face;
var guessed_face;

$('#question-form').submit(function() {
    send_question();
    return false;
});

$('#victory').click(function() {
    send_victory();
});

$('#yes-button').click(function() {
    send_answer('yes');
});

$('#no-button').click(function() {
    send_answer('no');
});

set_state('connecting');

self.setInterval(function() {
    if (timer_running[state]) {
        time_left -= 0.1;
        update_timer();
    } else {
        reset_timer();
    }
}, 100);

var ws = new WebSocket('ws://' + ws_hostname + '/ws/game/' + gameid);

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
            if (d['timeout']) {
                history_add('sys', 'self', 'Opponent timed out.');
            }
            if (d['face'] != undefined) {
                history_add('opponent', 'self', '<b>Opponent:</b> It\'s ' + facenames[d['face']] + '.');
            }
            if (d['realface'] != undefined) {
                $('#opponent-face').html(facenames[d['realface']] + '<br><img src="/face/' + facetype + '/' + d['realface'] + '.jpg">');
                history_add('sys', 'self', '<b>You won!</b> Your opponent\'s ' + singular + ' was <b>' + facenames[d['realface']] + '</b>.');
            } else {
                $('#opponent-face').html(facenames[guessed_face] + '<br><img src="/face/' + facetype + '/' + guessed_face + '.jpg">');
                history_add('sys', 'self', '<b>You won!</b>');
            }
        } else if(d['state'] == 'defeat') {
            if (d['timeout']) {
                history_add('sys', 'self', 'You timed out.');
            } else if (oldstate == 'wait-question') {
                history_add('opponent', 'self', '<b>Opponent:</b> It\'s ' + facenames[faceid] + '.');
            }
            $('#opponent-face').html(facenames[d['face']] + '<br><img src="/face/' + facetype + '/' + d['face'] + '.jpg">');
            history_add('sys', 'self', '<b>You lost!</b> Your opponent\'s ' + singular + ' was ' + facenames[d['face']] + '.');
        }
    }

    if (d['answer'] != undefined)
        history_add('opponent', 'opponent', '<b>Opponent: </b>' + d['answer']);

    if (d['question'] != undefined)
        history_add('opponent', 'self', '<b>Opponent: </b>' + d['question']);

    if (d['faceid'] != undefined) {
        faceid = d['faceid'];
        draw_faces();
    }

    if (d['timer'] != undefined) {
        time_left = d['timer'];
    }

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
    guessed_face = final_face;
    ws.send(JSON.stringify({"type":"victory", "face":final_face}));
    history_add('self', 'opponent', '<b>You: </b>It\'s ' + facenames[final_face] + '.');
}

function send_question() {
    var text = $('#input').val();

    if (text == '')
        return;

    $('#input').val('');

    history_add('self', 'opponent', '<b>You: </b> ' + text);

    ws.send(JSON.stringify({"type":"question", "text":text}));
}

function send_answer(ans) {
    history_add('self', 'self', '<b>You: </b>' + ans);

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
    $('#question-input').css('display', 'none');
    $('#victory-input').css('display', 'none');
    $('#answer-input').css('display', 'none');

    if (state == 'ask') {
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
    } else if (state == 'answer') {
        $('#answer-input').css('display', 'block');
    }
}

function history_add(who, showby, html) {
    $('#history').html($('#history').html() + '<div class="history by-' + showby + ' text-' + who + '">' + html + '</div><br>');
}

function draw_faces() {
    var html = '';
    for (var i = 1; i <= nfaces; i++) {
        if (i == faceid)
            continue;

        html += '<div class="face" id="face' + i + '" onclick="toggle_face(' + i + ')">' + facenames[i] + '<br><img src="/face/' + facetype + '/' + i + '.jpg"></div>';
    }
    $('#faces').html(html);

    $('#myface').html(facenames[faceid] + '<br><img src="/face/' + facetype + '/' + faceid + '.jpg">');
}

function reset_timer() {
    $('#timer').html('');
}

function update_timer() {
    $('#timer').html(parseInt(time_left) + "s");
}
