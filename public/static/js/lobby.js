var ws = new WebSocket('ws://' + ws_hostname + '/ws/lobby/' + facetype);

ws.onopen = function() {
    add_output('sys', '* Connected');
}

ws.onmessage = function(msg) {
    console.log("Received message: " + msg.data);

    var d = JSON.parse(msg.data);

    if (d['type'] == 'chat') {
        add_output('chat', '<b>&lt;' + d['sender'] + '&gt;</b> ' + d['message']);
    }
}

ws.onclose = function() {
    add_output('sys', '* Lost connection to server');
}

function add_output(type, html) {
    $('#lobby-text').html($('#lobby-text').html() + '<div class="chat-' + type + '">' + html + '</div>');
}

function send_chat() {
    ws.send(JSON.stringify({"type":"chat", "message":$('#chat-input').val()}));
    add_output('self', '<b>&lt;You&gt;</b> ' + $('#chat-input').val());
    $('#chat-input').val('');
    return false;
}
