(function () {
    'use strict';

    // Функція безпечного запиту через проксі (виправляє Script Error / CORS)
    function safeFetch(url) {
        var proxy = 'https://cors-anywhere.herokuapp.com'; // Можна змінити на свій проксі
        return fetch(url).then(function(r) {
            if (!r.ok) throw new Error('Network response was not ok');
            return r.json();
        }).catch(function(e) {
            console.log('Fetch error:', e.message);
            return null;
        });
    }

    var JACRED_URL = Lampa.Storage.get('jacred_url') || 'jacred.xyz';
    var TORRSERVE_URL = Lampa.Storage.get('torrserve_url') || '127.0.0.1:8090';
    
    // Перевіряємо наявність протоколу
    if (TORRSERVE_URL.indexOf('http') !== 0) TORRSERVE_URL = 'http://' + TORRSERVE_URL;

    var style = document.createElement('style');
    style.textContent = `
        .ua_quality_btn { display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.1); padding: 10px 18px; border-radius: 12px; border: 2px solid rgba(255, 255, 255, 0.1); cursor: pointer; margin-top: 10px; }
        .ua_quality_btn.online:hover { background: #fff; color: #000; border-color: #2ecc71; }
        .ua_icon { width: 1.8em; height: 1.8em; margin-right: 12px; }
        .ua_text { font-weight: bold; }
    `;
    document.head.appendChild(style);

    function runSearch(movie, callback) {
        var title = movie.title || movie.name;
        var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
        var url = 'https://' + JACRED_URL + '/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;

        safeFetch(url).then(function (all) {
            if (!all || !Array.isArray(all)) return;

            var uaRx = /(makhno|uaflix|uafix|ukr|ua|toloka|hurtom)/i;
            var found = all.filter(function(i) {
                return uaRx.test(i.title + (i.details || ""));
            });

            if (found.length > 0) {
                found.sort(function(a, b) { return (parseInt(b.seeders) || 0) - (parseInt(a.seeders) || 0); });

                var isMakhno = found.some(function(i) { return i.title.toLowerCase().indexOf('makhno') !== -1; });
                var icon = isMakhno ? 'https://makhnostudio.com' : 'https://uafix.net';

                var btn = $('<div class="ua_quality_btn online"><img src="'+icon+'" class="ua_icon"><span class="ua_text">UA Джерела</span></div>');
                
                btn.on('click', function () {
                    Lampa.Select.show({
                        title: 'Оберіть UA якість',
                        items: found.map(function(i) {
                            return { title: i.title, subtitle: i.size, item: i };
                        }),
                        onSelect: function (sel) {
                            var playUrl = TORRSERVE_URL + '/stream?link=' + encodeURIComponent(sel.item.magnet || sel.item.link) + '&index=1&play';
                            Lampa.Player.play({ url: sel.item.magnet, title: title, video: { url: playUrl } });
                        }
                    });
                });
                callback(btn);
            }
        });
    }

    function start() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                runSearch(e.data.movie, function (html) {
                    e.object.render().find('.full-start__buttons').append(html);
                });
            }
        });
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });
})();