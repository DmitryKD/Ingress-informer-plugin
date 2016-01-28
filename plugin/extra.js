/*bot admin functions */
function checkStartWordFromAdmin(data) {
    for (var i = data.result.length - 1; i >= 0; i--) {
        console.log('fromId: ' + data.result[i].message.from.id);
        console.log('text : ' + data.result[i].message.text);
        if (data.result[i].message.from.id == ADMIN_ID && data.result[i].message.text == '/wakeup') {
            firstRun = false;
            ADMIN_CHAT = data.result[i].message.chat.id;
            sendAnswer('I\'M COMPLETE!!!', ADMIN_CHAT);
            UPDATE_ID = data.result[i].update_id;
        }
    }
}

var checkLastRequest = function(data) {
    var lastRequest = localStorage.getItem('@$lastRequestUpdateId');
    for (var i = data.result.length - 1; i >= 0; i--) {
        if (lastRequest == undefined || lastRequest == 'undefined' || lastRequest == null || data.result[i].update_id > lastRequest) {
            localStorage.setItem('@$lastRequestUpdateId', data.result[i].update_id);


            //add request in localStorage
            var lastReq = localStorage.getItem('@$lastRequestNameAndId');
            if (data.result[i].message.from.id != ADMIN_ID) {
                if (lastReq == null) lastReq = '';
                lastReq += 'from: ' + data.result[i].message.from.id + '-' + data.result[i].message.from.username + ', request: ' + data.result[i].message.text;
                localStorage.setItem('@$lastRequestNameAndId', lastReq);
            }


            firstRun = false;
            UPDATE_ID = data.result[i].update_id;
            var answer = findAnswer(data.result[i].message.text, data.result[i].message.from.id);

            if (!BOT_OFF && answer != undefined && answer != '') sendAnswer(answer, data.result[i].message.from.id);
        }
    }
}

function checkReload() { //3600000
    var nowDate = new Date().getDate();
    var now = new Date().getTime();
    if (((now - startTime) > 3600000) || startDay < nowDate) {
        reloadPage();
    }
}

function reloadPage() {
    window.location.reload();
}

function isAlive() {
    return 'YES!';
}

function how_long() {
    return msToHMS(startTime);
}

function logerr(err) {
    console.log(err);
}


var customEvent = document.createEvent('Event');
customEvent.initEvent('myCustomEvent', true, true);

function fireCustomEvent(data) {
    console.log(data);
}