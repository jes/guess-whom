var statemap = {
    "ask": "Please ask a question.",
    "answer": "Please answer the question.",
    "loading": "Loading...",
    "wait-answer": "Waiting for partner to answer...",
    "wait-partner": "Waiting for a partner - send this link: <a href=\"http://mojolicious-dev:3000/join-game/" + gameid + "\">http://mojolicious-dev:3000/join-game/" + gameid + "</a>",
    "wait-question": "Waiting for partner to ask a question...",
};

var state = 'loading';

var remaining_hookers = nhookers - 1;

var html = '';
for (var i = 1; i <= nhookers; i++) {
    if (i == hookerid)
        continue;

    html += '<div style="float: left" id="hooker' + i + '" onclick="toggle_hooker(' + i + ')">' + hookernames[i] + '<br><img src="/hooker/' + i + '.jpg"></div>';
}
$('#hookers').html(html);

$('#q-and-a').submit(function() {
    send_text();
    return false;
});

var ws = new WebSocket('ws://mojolicious-dev:3000/game/' + gameid);

ws.onopen = function() {
    console.log("Connection opened!");
}

ws.onmessage = function(msg) {
    console.log("Received message: " + msg.data);

    var d = JSON.parse(msg.data);

    if (d['state']) {
        state = d['state'];
        $('#state').html(statemap[state] ? statemap[state] : state);
    }

    if (d['answer']) {
        $('#history').html($('#history').html() + '<br><b>Answer: </b>' + d['answer']);
    }

    if (d['question']) {
        $('#history').html($('#history').html() + '<br><b>Question: </b>' + d['question']);
    }
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

function toggle_hooker(i) {
    var opacity = $('#hooker' + i).css('opacity');

    if (opacity < 1) {
        remaining_hookers++;
        $('#hooker' + i).css('opacity', '1.0');
    } else {
        remaining_hookers--;
        $('#hooker' + i).css('opacity', '0.4');
    }
}
