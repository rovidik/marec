(function () {
    'use strict';

    // Конфігурація
    var JACRED_URL = Lampa.Storage.get('jacred_url') || 'jacred.xyz';
    var TORRSERVE_URL = Lampa.Storage.get('torrserve_url') || '127.0.0.1:8090';
    
    // Додаємо http якщо забули
    if (TORRSERVE_URL && TORRSERVE_URL.indexOf('http') !== 0) {
        TORRSERVE_URL = 'http://' + TORRSERVE_URL;
    }

    // СТИЛІ (Стандартний метод для старих браузерів)
    var style = document.createElement('style');
    style.type = 'text/css';
    var css = '.ua_quality_btn { display: inline-flex; align-items: center; background: rgba(255,255,255,0.1); padding: 10px 18px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.1); cursor: pointer; margin-top: 10px; }' +
              '.ua_quality_btn:hover { background: #fff; color: #000; }' +
              '.ua_icon { width: 1.8em; height: 1.8em; margin-right: 12px; border-radius: 4px; }' +
              '.ua_text { font-weight: bold; font-size: 1.1em; }';
    if (style.styleSheet) style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // Функція пошуку
    function runSearch(movie, callback) {
        var title = movie.title || movie.name;
        var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
        var url = 'https://' + JACRED_URL + '/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (all) {
                if (!all || !all.length) return;

                var uaRx = /(makhno|uaflix|uafix|ukr|ua|toloka|hurtom)/i;
                var found = all.filter(function(i) {
                    return uaRx.test(i.title + (i.details || ""));
                });

                if (found.length > 0) {
                    found.sort(function(a, b) { return (parseInt(b.seeders) || 0) - (parseInt(a.seeders) || 0); });

                    var isMakhno = found.some(function(i) { return i.title.toLowerCase().indexOf('makhno') !== -1; });
                    var icon = isMakhno ? 'https://makhnostudio.com' : 'https://uafix.net';

                    var btn = $('<div class="ua_quality_btn"><img src="'+icon+'" class="ua_icon"><span class="ua_text">UA: Makhno & UAFLIX</span></div>');
                    
                    btn.on('click', function () {
                        Lampa.Select.show({
                            title: 'Якість UA 🇺🇦',
                            items: found.map(function(i) {
                                return { title: i.title, subtitle: i.size || '?? GB', item: i };
                            }),
                            onSelect: function (sel) {
                                var magnet = sel.item.magnet || sel.item.link;
                                var videoUrl = TORRSERVE_URL + '/stream?link=' + encodeURIComponent(magnet) + '&index=1&play';
                                Lampa.Player.play({
                                    url: magnet,
                                    title: title,
                                    video: { url: videoUrl }
                                });
                            }
                        });
                    });
                    callback(btn);
                }
            },
            error: function() { console.log('UA Plugin: Jacred error'); }
        });
    }

    // Запуск
    function init() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                runSearch(e.data.movie, function (html) {
                    e.object.render().find('.full-start__buttons').append(html);
                });
            }
        });
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();