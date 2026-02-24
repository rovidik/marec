javascript
(function () {
    'use strict';

    var JACRED_URL = Lampa.Storage.get('jacred_url') || 'jacred.xyz';
    var TORRSERVE_URL = Lampa.Storage.get('torrserve_url') || '127.0.0.1:8090';
    
    var MAX_SIZE_4K = 50 * 1024 * 1024 * 1024;
    var MAX_SIZE_HD = 20 * 1024 * 1024 * 1024;

    var style = document.createElement('style');
    style.textContent = `
        .ua_quality_btn { 
            display: inline-flex; align-items: center; 
            background: rgba(255, 255, 255, 0.1); padding: 10px 18px; 
            border-radius: 12px; border: 2px solid rgba(255, 255, 255, 0.1); 
            cursor: pointer; transition: 0.2s; margin-top: 10px;
        }
        .ua_quality_btn.online:hover { background: #fff; color: #000; border-color: #2ecc71; }
        .ua_quality_btn.offline { border-color: #e74c3c; opacity: 0.8; }
        .ua_quality_btn.offline .ua_text { color: #e74c3c; }
        .ua_icon { width: 1.8em; height: 1.8em; margin-right: 12px; border-radius: 4px; }
        .ua_text { font-weight: bold; font-size: 1.1em; }
        .status_dot { width: 8px; height: 8px; border-radius: 50%; margin-left: 10px; }
        .dot_online { background: #2ecc71; box-shadow: 0 0 5px #2ecc71; }
        .dot_offline { background: #e74c3c; }
    `;
    document.head.appendChild(style);

    function checkTorrServe(callback) {
        fetch('http://' + TORRSERVE_URL + '/echo', { method: 'GET' })
            .then(() => callback(true))
            .catch(() => callback(false));
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        var k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'], i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function play(item, movie) {
        checkTorrServe(function(online) {
            if (!online) return Lampa.Noty.show('TorrServe (' + TORRSERVE_URL + ') не відповідає!');
            
            var url = item.magnet || item.link;
            Lampa.Player.play({
                url: url,
                title: movie.title || movie.name,
                video: {
                    title: item.title,
                    url: 'http://' + TORRSERVE_URL + '/stream?link=' + encodeURIComponent(url) + '&index=1&play'
                }
            });
            Lampa.Player.playlist([{ title: item.title, url: url }]);
        });
    }

    function showQualityMenu(items, movie) {
        Lampa.Select.show({
            title: 'Якість UA (Makhno/UAFLIX) 🇺🇦',
            items: items.map(i => ({
                title: (i.title.match(/\d{3,4}p|4K/i) || 'HD').toString().toUpperCase(),
                subtitle: formatBytes(i.size) + ' | S:' + (i.seeders || 0),
                item: i
            })),
            onSelect: function (selected) { play(selected.item, movie); },
            onBack: function () { Lampa.Controller.toggle('full_start'); }
        });
    }

    function runSearch(movie, callback) {
        var title = movie.title || movie.name;
        var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
        var url = 'https://' + JACRED_URL + '/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;

        fetch(url).then(r => r.json()).then(function (all) {
            if (!Array.isArray(all)) return;

            var uaRx = /(makhno|uaflix|uafix|ukr|ua|toloka|hurtom)/i;
            var found = all.filter(i => {
                var isUA = uaRx.test(i.title + (i.details || ""));
                var size = parseInt(i.size) || 0;
                var q = i.title.toLowerCase();
                if (!isUA) return false;
                return (q.includes('2160') || q.includes('4k')) ? size <= MAX_SIZE_4K : size <= MAX_SIZE_HD;
            });

            if (found.length > 0) {
                found.sort((a, b) => (parseInt(b.seeders) || 0) - (parseInt(a.seeders) || 0));
                
                checkTorrServe(function(online) {
                    var isMakhno = found.some(i => i.title.toLowerCase().includes('makhno'));
                    var icon = isMakhno ? 'https://makhnostudio.com' : 'https://uafix.net';
                    var statusClass = online ? 'online' : 'offline';
                    var statusText = online ? 'Дивитись (UA)' : 'TorrServe Offline';
                    var dotClass = online ? 'dot_online' : 'dot_offline';

                    var btn = $(`
                        <div class="ua_quality_btn ${statusClass}" id="ua_selector">
                            <img src="${icon}" class="ua_icon">
                            <span class="ua_text">${statusText}</span>
                            <div class="status_dot ${dotClass}"></div>
                        </div>
                    `);

                    btn.on('hover:enter click', function () {
                        if (online) showQualityMenu(found, movie);
                        else Lampa.Noty.show('Перевірте запуск TorrServe на ' + TORRSERVE_URL);
                    });
                    callback(btn);
                });
            }
        }).catch(e => console.error('UA Plugin Error', e));
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