var img = chrome.extension.getURL("icon16.png");
var chat;
var start_date = new Date();
var today = new Date().getTime();
var startTime = new Date().getTime();
var startDay = new Date().getDate();
var master = {};
var trusted_chats;
var UPDATE_ID;
var trust_key = '$#trusted';
var watcher_key = '@w$';
var last_act = '@la$';
var lPlace = '@$lp';
var BOT_OFF = false;
var firstRun = true;
var ADMIN_CHAT;
var dBase;
var allowed_cities = '';

/*= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
= = = = = = = = = = = = = = = = = settings = = = = = = = = = = = = = = = = = = =
= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =*/
var ADMIN_ID = ''; //adminid в телеге
var BOT_TOKEN = ''; //токен бота в телеге
var adresses = []; // адреса, на которые бот ориентируется (пример: ['Yubileyny','Korolyov'])
var forward_chat_id = 123; // числовое значение; id чата, куда форвардится сообщение по команде /username   
var have_no_trust = ''; //сообщение, которое отправляется недоверенным агентам
var agents_limit = 0; //лимит на количество агентов в сообщении
var informFractionAgent = false; //выдавать сообщения по энлайтам
var trusted_word = '/trustmepls';
var noobText = ''; // Сообщение, отправляемое от бота в комм новым игрокам
var HELP_TEXT = '/radius (Королёв и ближайшие окрестности); %0A /everywhere (все, кого бот засёк); %0A /watchto nickname (проследить за кем-то - 5 действий); %0A /gde nickname (где последний раз был замечен); %0A /nextcycle (до отсечки); %0A /whereresist (покажет рзстов); %0A /whereenlight (покажет энлайтов)';
var hello_text = 'Привет. Это бот, который поможет тебе связаться с другими агентами Просвещения. Для того, чтобы они могли найти тебя, тебе нужно установить идентификатор с помощью Settings-Username, очень желательно, чтобы он совпадал с твоим ником в Ингресс. Обрати внимание, что это не имя/фамилия, а альтернатива твоему номеру телефона для связи с тобой. %0A Если ты испытываешь непреодолимые трудности в установке юзернейма, ты можешь сообщить просто свой телефон, который привязан к Telegram. %0A%0A Сообщить ник/номер живым агентам можно с помощью команды /username @your_username. Будь уверен, что его не увидит никто лишний.';
var command_forward = '/frwrdmess'; //команда просто форвардит сообщение

/*= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
= = = = = = = = = = = = = = = = = = = = //settings = = = = = = = = = = = = = = = 
= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =*/

$(document).ready(function() {
    if (window.location.href.indexOf("www.ingress.com/intel") != -1) {
        init();
    }
});

function init() {
    if (adresses != null && adresses.length > 0) {
        for (var i = 0; i < adresses.length; i++)
            allowed_cities += '$' + adresses[i] + '$';
    }
    allowed_cities = allowed_cities.toLowerCase();
    dBase = new helperD();
    setInterval(function() {
        fillPlayersArray()
    }, 30000); //парсинг страницы intel
    setInterval(function() {
        getMessages();
    }, 3000); //проверка сообщений телеграмма
    setInterval(function() {
        checkReload();
    }, 30000); //перезагрузка страницы 
    setInterval(function() {
        checkNewPlayers();
    }, 15000); //проверка на новых игроков

}