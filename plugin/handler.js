/*   основной метод, смотрит команду и отправляет ответ  */
function findAnswer(word, chat_id, message_id) {
    trusted_chats = dBase.get(trust_key);
    var trusted = false;
    if (trusted_chats == null || trusted_chats == undefined) trusted_chats = '' + ADMIN_ID + ',';

    if (trusted_chats.indexOf(chat_id) != -1) {
        trusted = true;
    }
    if (word == trusted_word && trusted_chats.indexOf(chat_id) == -1) { //доверяем
        trusted = true;
        trusted_chats += chat_id + ',';
        dBase.add(trust_key, trusted_chats);
        return 'готово!';
    }

    if (word != null && word != '' && word != undefined) word = word.toLowerCase();

    if (word == '/start')
        return hello_text;

    else if (word.indexOf('/username') != -1) {
        var array = word.split(' ');
        var username = array[1];
        sendForward(username, chat_id, message_id);
        return;
    } else if (!trusted) {
        return have_no_trust
    } else if (word == '/whereresist')
        return getPlayers('whereresist');

    else if (word == '/whereenlight')
        return getPlayers('whereenlight');

    else if (word.indexOf('/gde') != -1 || word.indexOf('/where') != -1) {
        word = word.replace('@', '');
        if (word == '/gde' || word == '/where') return 'Укажите ник! Пример /gde ada';
        dBase.findAgent(word.replace('/gde ', '@').replace('/where ', '@').toLowerCase(), chat_id);
    } else if (word == '/chatid')
        return chat_id;

    else if (word == '/messageid')
        return message_id;

    else if (word == command_forward) {
        sendForward(word, chat_id, message_id);
        return;
    }
    //все кто был замечен
    else if (word == '/ктотут' || word == '/everywhere')
        return getPlayers('all');

    //все вокруг Королёва	
    else if (word == '/whoiswhere' || word.replace('/', '').toLowerCase() == 'radius')
        return getPlayers('$radius$');

    //определённый город	
    else if (allowed_cities.indexOf('$' + word.replace('/', '').toLowerCase() + '$') != -1)
        return getPlayers(word.replace('/', ''));

    else if (word == '/globalscore')
        return getGlobalScore();

    else if (word == '/regionalscore')
        return getRegionalScore();

    //наблюдаем за игроком; пример команды: /watchto @player 5
    else if (word.indexOf('/watchto') != -1) {
        var steps = 5;
        var p_nickname;
        var array = word.split(' ');
        p_nickname = array[1];

        if (word == '/watchto' || array.length < 3) return 'Укажите ник и количество, пример: /watchto ada 5';
        if (!isNaN(parseInt(array[2])))
            steps = parseInt(array[2]);

        watchTo(p_nickname.replace('@', '').toLowerCase(), chat_id, steps);
        return 'Посмотрим, что делает @' + array[1].replace('@', '') + ': ' + steps + '';
    }
    //перезапуск бота
    else if (word == '/123reload') {
        setTimeout(reloadPage, 2000);
        return 'restarting...';
    }
    //порталы
    else if (word == '/portals')
        return 'пока не реализовано';

    else if (word == '/quote')
        return getRandomSoviet();

    else if (word == '/help')
        return HELP_TEXT;

    else if (word == '/nextcycle')
        return $('#rs_cycle_end_time').find('.number').text();

    //admin commands
    else if (word == '/123isalive')
        return isAlive();

    else if (word == '/123how_long') {
        return how_long();
    } else if (word == '/123when') {
        var now = new Date().getTime();
        return (now - startTime);
    } else if (word == '/123reload') {
        return 'restarting...';
        setTimeout(reloadPage, 2000);
    } else if (word == '/123off') {
        BOT_OFF = true;
        sendAnswer('(test function) bot on working computer is off...', ADMIN_ID);
        return '(test function) bot on working computer is off...';
    } else if (word == '/123on') {
        BOT_OFF = false;
        return 'I\'M BACK!!!';
    } else return 'команда не найдена(';

}
//при запуске брать последнее местоположение игрока из localStorage
//запускать только если игрок уже есть в localStorage (чтобы не засорять ошибочными никами/лишними людьми)
var watchTo = function(nickname, chat_id, count) {
    var nicknameW = nickname.replace('@', '').toLowerCase();
    nickname = '@' + nickname;
    chat_id = chat_id + '';
    var key = watcher_key + nicknameW;
    var watcher = dBase.get(key);
    var player = dBase.get(nickname);

    if (player != null && player != undefined) {
        if (watcher != null) {
            watcher[chat_id] = {};
            watcher[chat_id].count = count;
            watcher[lPlace] = player.portalName;
            watcher[last_act] = player.time;
            dBase.add(key, watcher);
        } else {
            var watcher = {};
            watcher[chat_id] = {};
            watcher[chat_id] = {
                count: count
            };
            watcher[lPlace] = player.portalName;
            watcher[last_act] = player.time;
            dBase.add(key, watcher);
        }
    }
}

var checkWatcher = function(player) {
    var nickname = player.id;
    var lastPlace = player.portalName;
    var lastActivity = player.lastActivity;
    var time = player.time;


    var nicknameW = nickname.replace('@', '').toLowerCase();
    var key = watcher_key + nicknameW;
    var watcher = dBase.get(key);
    if (watcher != null && watcher != undefined) {
        var label = false;
        for (w in watcher) {
            if (w != lPlace && w != last_act && watcher[w] != null && watcher[lPlace] != lastPlace && (new Date(watcher[last_act]) < new Date(player.time))) {
                label = true;
                watcher[w].count = watcher[w].count - 1;
                var answer = player.nickname + ' был замечен рядом с порталом ' + lastPlace + ' (' + player.full_address + ') в ' + player.time + ' (' + watcher[w].count + ')';
                if (watcher[w].count < 1) {
                    watcher[w] = null;
                }
                sendAnswer(answer, w);
            }
        }
        if (label) {
            watcher[lPlace] = lastPlace;
            dBase.add(key, watcher);
        }
    }
}

function getRandomSoviet() {
    return 'скоро буду возвращать советы';
}


function checkNewPlayers() {
    $('.pl_content.pl_player').each(function(index) {
        if ($(this).text().indexOf('has completed training.') != -1) {
            var noobName = $($(this).find('span')[1]).attr('data-playerstr'); //$(this).find('span').attr('data-playerstr');

            if (localStorage.getItem(noobName.toLowerCase()) == null) {
                console.log('new player!!!');
                console.log('noobName = ' + noobName);
                //add in localStorage
                var player = {};
                player.nickname = noobName;
                player.id = player.nickname.toLowerCase();
                dBase.add(player.id, player);

                //пишем новым игрокам в ингресс
                $('[id="message"]').val('' + noobName + noobText);
                $('[id="pl_tab_fac"]').click();
                setTimeout(clickSubmit, 100);

            }
        }
    })
}

function clickSubmit() {
    $('[type=submit][value="Transmit"]').click();
    $('[id="pl_tab_all"]').click();
}

function getPlayers(city) {
    console.log('city : ' + city);
    city = city.toLowerCase();
    var result = '';

    var sortable = [];
    for (var player in master)
        sortable.push([player, getSeconds(master[player].time)])

    sortable.sort(function(a, b) {
        return a[1] - b[1]
    });

    if (city == 'all') {
        for (var i = 0; i < sortable.length; i++) {
            var none_limit = (agents_limit == 0) ? true : false;
            if (master[sortable[i][0]] != null) {
                if (none_limit || (!none_limit && i < agents_limit_)) {
                    result += master[sortable[i][0]].nickname + ' ' + master[sortable[i][0]].time.split(' ')[0] + ' ' + master[sortable[i][0]].portalName + ' ';
                    if (master[sortable[i][0]].portalAdress != 'undefined' && master[sortable[i][0]].portalAdress != 'null')
                        result += ' (' + master[sortable[i][0]].portalAdress + ')';
                    result += '%0A';
                }
            }
        }
    } else if (city == '$radius$') { //player.inRange
        for (var i = 0; i < sortable.length; i++) {
            var none_limit = (agents_limit == 0) ? true : false;
            if (master[sortable[i][0]] != null) {

                if (none_limit || (!none_limit && i < agents_limit_)) {
                    if (master[sortable[i][0]].inRange) {
                        result += master[sortable[i][0]].nickname + ' ' + master[sortable[i][0]].time.split(' ')[0] + ' ' + master[sortable[i][0]].portalName + ' (' + master[sortable[i][0]].portalAdress + ')' + '%0A';
                    }
                }
            }
        }
    } else if (city == 'whereresist') { //player.inRange
        for (var i = 0; i < sortable.length; i++) {
            var none_limit = (agents_limit == 0) ? true : false;
            if (master[sortable[i][0]] != null) {

                if (none_limit || (!none_limit && i < agents_limit_)) {
                    if (!master[sortable[i][0]].good) {
                        result += master[sortable[i][0]].nickname + ' ' + master[sortable[i][0]].time.split(' ')[0] + ' ' + master[sortable[i][0]].portalName + ' (' + master[sortable[i][0]].portalAdress + ')' + '%0A';
                    }
                }
            }
        }
    } else if (city == 'whereenlight') { //player.inRange
        for (var i = 0; i < sortable.length; i++) {
            var none_limit = (agents_limit == 0) ? true : false;
            if (master[sortable[i][0]] != null) {

                if (none_limit || (!none_limit && i < agents_limit_)) {
                    if (master[sortable[i][0]].good) {
                        result += master[sortable[i][0]].nickname + ' ' + master[sortable[i][0]].time.split(' ')[0] + ' ' + master[sortable[i][0]].portalName + ' (' + master[sortable[i][0]].portalAdress + ')' + '%0A';
                    }
                }
            }
        }
    } else {
        for (var i = 0; i < sortable.length; i++) {
            var none_limit = (agents_limit == 0) ? true : false;
            if (master[sortable[i][0]] != null) {

                if (none_limit || (!none_limit && i < agents_limit_)) {
                    if (master[sortable[i][0]].portalAdress != 'undefined' && master[sortable[i][0]].portalAdress != 'null' && master[sortable[i][0]].portalAdress.toLowerCase().indexOf(city) != -1) {
                        result += master[sortable[i][0]].nickname + ' ' + master[sortable[i][0]].time.split(' ')[0] + ' ' + master[sortable[i][0]].portalName + ' (' + master[sortable[i][0]].portalAdress + ')' + '%0A';
                    }
                }
            }
        }
    }

    return result;
}

function sendForward(word, chat_id, message_id) {
    console.log('word: ' + word);

    var url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/';
    url += 'forwardMessage?chat_id=' + forward_chat_id;
    url += '&from_chat_id=' + chat_id;
    url += '&message_id=' + message_id;


    var data = '';
    var dataType = '';
    $.ajax({
        type: "GET",
        url: url,
        data: data,
        success: checkAnswer,
        dataType: dataType
    });
}

function getGlobalScore() {
    var resist = $('[id="global_score"]').find('.RESISTANCE').find('.meta_team_score').text();
    var enl = $('[id="global_score"]').find('.ENLIGHTENED').find('.meta_team_score').text();
    return ('Enlightened ' + enl + ' : ' + resist + ' Resistance');
}

function getRegionalScore() {
    var resist = $('.RESISTANCE.rs_score').text();
    var enl = $('.ENLIGHTENED.rs_score').text();
    return ('Enlightened ' + enl + ' : ' + resist + ' Resistance');
}

function findAgent(nick, chat_id) {
    DATABASE.searchAgent(nick, chat_id);
}



function fillPlayersArray() {
    master = {};
    var agent_names = '';
    chat = $('.plext').each(function(el) {
        var player = {};
        player.time = getTwentyFourHourTime($(this).find('.pl_timestamp').text().replace('PM', ' pm').replace('AM', ' AM'));
        var date = new Date();
        var dateandtime = player.time + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        player.lastActivity = Date.parse(dateandtime.replace('AM', ''));
        player.timeStamp = new Date().getTime();
        player.nickname = $(this).find('.pl_nudge_player').attr('data-playerstr');
        player.lowname = player.nickname.toLowerCase();
        player.id = player.lowname;

        if ($(this).find('.pl_nudge_player').attr('class').indexOf('ENLIGHTENED') != -1)
            player.good = true;
        else player.good = false;


        var portal_el = $(this).find('.pl_portal_name');
        var portal_adr = $(this).find('.pl_portal_address');
        try {

            player.portalName = $($(portal_el)[0]).text();
            player.portal_lat = $($(portal_el)[0]).attr('data-plat');
            player.portal_lon = $($(portal_el)[0]).attr('data-plng');
            player.portalAdress = '';
            player.inRange = false;

            var adress = $($(portal_adr)[0]).text();

            for (var i = 0; i < adresses.length; i++) {
                if (adress.indexOf(adresses[i]) != -1) {
                    player.portalAdress = adresses[i];
                    player.inRange = true;
                }
            } else player.portalAdress = adress;

            player.full_address = adress;

        } catch (ex) {
            console.log('ex' + ex)
        };

        if (player.portalName != null && player.portalName != '' && player.portalName != undefined) {
            var old_player = dBase.get(player.id);
            if (player.time.indexOf('NaN') == -1) {
                master['' + player.nickname] = player;
                if (old_player == null || (new Date(old_player.time) < new Date(player.time))) {
                    dBase.add(player.id, player);
                    checkWatcher(player);
                }
            }
        }

    });
}


var testH = function() {
    console.log('handler was born');
}

/* ----- network functions -------- */

function getMessages() {
    var url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/getUpdates';
    if (UPDATE_ID != null) url += '?offset=' + UPDATE_ID;
    var data = '';
    var dataType = '';
    $.ajax({
        type: "GET",
        url: url,
        data: data,
        success: handleRequest,
        dataType: dataType
    });
}

var handleRequest = function(data) {
    //console.log('data.ok: ' + data.ok);

    if (firstRun) {
        checkLastRequest(data);
    } else if (data.ok == true) {
        for (var i = 0; i < data.result.length; i++) {
            var word = data.result[i].message.text;
            var new_update = data.result[i].update_id;
            if (new_update > UPDATE_ID) {
                localStorage.setItem('@$lastRequestUpdateId', new_update);
                console.log('New request from ' + data.result[i].message.from.first_name + ', username: ' + data.result[i].message.from.username + ' request: ' + word);
                UPDATE_ID = new_update;
                chatId = data.result[i].message.chat.id;
                var message_id = data.result[i].message.message_id;

                if (word == '/123on') {
                    BOT_OFF = false;
                }
                /*кладём в localStorage запрос*/
                var req_key = '#$request';
                var req = dBase.get(req_key);
                if (req == null || req == undefined) req = {};
                req[data.result[i].message.chat.id] = {
                    name: data.result[i].message.from.first_name,
                    username: data.result[i].message.from.username
                };
                dBase.add(req_key, req);

                var answer = findAnswer(word, chatId, message_id);
                if (!BOT_OFF && answer != undefined && answer != '') sendAnswer(answer, chatId);

            }
        }
    }
}

function sendAnswer(answer, chatId) {
    //console.log('answer: ' + answer);
    if (answer == '' || answer == ' ') answer += 'empty';
    answer = answer.replace('))', ')').replace('((', '(');
    var url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage?';
    if (chatId != null)
        url += 'chat_id=' + chatId;

    url += '&text=' + answer;

    var data = '';
    var dataType = '';
    $.ajax({
        type: "GET",
        url: url,
        data: data,
        success: checkAnswer,
        dataType: dataType
    });
}

/* ========= INSERT / UPDATE / SELECT ======== */
/*   *    *     *      *      *    *   */
var helperD = function() {
        add = function(key, obj) {
                var objStr = JSON.stringify(obj);
                localStorage.setItem(key, objStr);
            },
            get = function getBase(key) {
                var objStr = localStorage.getItem(key);
                if (objStr != null) {
                    return JSON.parse(objStr);
                } else {
                    return null;
                }
            },
            getWatcher = function(nickname) {
                var watcher_key = 'w@' + nickname;
                var objStr = localStorage.getItem(watcher_key);

                if (objStr != null) {
                    return JSON.parse(objStr);
                } else {
                    return null;
                }
            },
            findAgent = function(key, chat_id) {
                var objStr = localStorage.getItem(key);
                var result = 'Не найден!';

                if (objStr != null) {
                    var player = JSON.parse(objStr);
                    if (informFractionAgent && player.good)
                        sendAnswer('Это секретная информация!'); //если enl
                    else {
                        result = 'Последний раз ' + player.nickname + ' был рядом с порталом "' + player.portalName + '" в ' + player.time;
                    }
                }

                sendAnswer(result, chat_id);
            }

        return {
            add: add,
            get: get,
            getWatcher: getWatcher,
            findAgent: findAgent
        };
    }
    /* =================================== */




/* ========= helper functions ======== */
/*   *    *     *      *      *    *   */
/* =================================== */
function checkAnswer(resp) {
    if (resp.ok != true && resp.ok != 'true')
        console.log('resp.ok != true, resp: ' + resp);
}



function getTwentyFourHourTime(amPmString) {
    var dd = start_date.getDate() + '';
    var month = start_date.getMonth() + 1 + '';

    var d = new Date("1/1/2013 " + amPmString);
    var hh = d.getHours();
    var mm = d.getMinutes();
    var mm = mm + '';
    if (mm.length < 2) mm = '0' + mm;
    if (dd.length < 2) dd = '0' + dd;
    if (month.length < 2) month = '0' + month;

    var nowTime = hh + ':' + mm + ' ' + month + '.' + dd;
    return nowTime;
}

function msToHMS(ms) {
    var seconds = ms / 1000;
    var hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    var result = hours + ":" + minutes; //+":"+seconds;
    return result;
}

function getSeconds(time) {
    var t1 = time.split(' ');
    var t2 = t1[0].split(':');
    return Date.UTC(1970, 0, 1, t2[0], t2[1]) / 1000;
}