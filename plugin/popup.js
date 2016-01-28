window.onload = function() {
    init();

    document.getElementById("btn_submit").onclick = function() {
        apply();
    };

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.method == "getSettings") {
            console.log('send from localstorage');
            sendResponse({
                settings: localStorage.getItem('settings')
            });
        } else {
            sendResponse({}); // snub them
            console.log('send empty');
        }
    });

};

function apply() {

    var settings = {};
    settings.bot_token = document.getElementById('bot_token').value;
    settings.adminID = document.getElementById('AdminID').value;
    settings.places = document.getElementById('places').value;
    settings.help = document.getElementById('help').value;

    localStorage.setItem('settings', JSON.stringify(settings));

}

function handleLocalStorageResult(data) {
    console.log(data);
    alert(data);
}

function init() {

    var bot_token = localStorage.getItem('$bot_token$');
    var adminID = localStorage.getItem('$adminID$');
    var places = localStorage.getItem('$places$');
    var help = localStorage.getItem('$help$');

    putData('bot_token', bot_token);
    putData('adminID', adminID);
    putData('help', help);

    var b = false;
    if (places != null) {
        var result = '';
        for (var i = 0; i < places.length; i++) {
            result += places[i] + ', ';
            b = true;
        }
    }
    if (b) result = result.substring(0, result.length - 1);

}

var putData = function(el, data) {
    document.getElementById(el)
    if (el) {
        el.value = data;
    }
}