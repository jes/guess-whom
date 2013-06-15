var ws = new WebSocket('ws://' + ws_hostname + '/ws/lobby/' + facetype);

ws.onopen = function() {
    add_output('sys', '* Connected');
}

ws.onmessage = function(msg) {
    console.log("Received message: " + msg.data);

    var d = JSON.parse(msg.data);

    switch(d['type']) {
    case 'chat':
        add_output('chat', '<b>&lt;' + d['sender'] + '&gt;</b> ' + d['message']);
        break;
    case 'join':
        add_output('sys', '* ' + d['joiner'] + ' has joined the lobby');
        break;
    case 'quit':
        add_output('sys', '* ' + d['quitter'] + ' has left the lobby');
        break;
    }
}

ws.onclose = function() {
    add_output('sys', '* Lost connection to server');
}

function add_output(type, html) {
    $('#lobby-text').html($('#lobby-text').html() + '<div class="chat-' + type + '">' + html + '</div>');
}

$('#chat-input').bind('keypress', function (e) {
    if (e.keyCode === 13)
        send_chat();
});

function send_chat() {
    if ($('#chat-input').val() !== '') {
        ws.send(JSON.stringify({"type":"chat", "message":$('#chat-input').val()}));
        add_output('self', '<b>&lt;You&gt;</b> ' + $('#chat-input').val());
        $('#chat-input').val('');
    }
    return false;
}
