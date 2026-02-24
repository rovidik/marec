(function () {
    'use strict';

    // --- ПОЛІФІЛИ ТА КОНФІГУРАЦІЯ ---
    if (typeof Promise === 'undefined') { window.Promise = function(e){/*...*/}; }
    
    var JACRED_URL = Lampa.Storage.get('jacred_url') || 'jacred.xyz';
    var PROXY_LIST = [
        'http://well-informed-normal-function.anvil.app',
        'http://api.allorigins.win'
    ];
    
    var ICON_UA = 'https://rovidik.github.io';
    var ICON_STREAM = 'https://rovidik.github.io';

    // --- СТИЛІ (Додано брендові рамки) ---
    var style = document.createElement('style');
    style.textContent = `
        .surs_quality_row { width: 100%; margin: 0.4em 0; clear: both; }
        .surs_quality_box { 
            display: inline-flex; align-items: center; 
            background: rgba(255, 255, 255, 0.08); padding: 4px 10px; 
            border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        .icon-brand { width: 1.4em; height: 1.4em; margin-right: 8px; border-radius: 3px; object-fit: contain; }
        .brand-makhno { border: 1px solid #ff5500; background: #000; }
        .brand-uaflix { border: 1px solid #e50914; background: #000; }
        .quality-item { font-weight: bold; margin-right: 5px; }
        .seeds_info { margin-left: 8px; color: #2ecc71; font-size: 0.8em; }
        .q_4k_text { color: #f1c40f; }
        .q_1080_text { color: #3498db; }
    `;
    document.head.appendChild(style);

    // --- ДОПОМІЖНІ ФУНКЦІЇ ---
    function parseQuality(t) {
        t = t.toLowerCase();
        if (/\b(2160p|4k)\b/.test(t)) return 2160;
        if (/\b(1080p|fhd|bdremux)\b/.test(t)) return 1080;
        if (/\b(720p|hd)\b/.test(t)) return 720;
        return 480;
    }

    function getSourcePriority(title) {
        var t = title.toLowerCase();
        if (t.indexOf('makhno') !== -1) return 10;
        if (t.indexOf('uaflix') !== -1 || t.indexOf('uafix') !== -1) return 9;
        if (t.indexOf('toloka') !== -1 || t.indexOf('hurtom') !== -1) return 8;
        return 0;
    }

    function fastFetch(url) {
        return fetch(url).then(r => r.text()).catch(() => "[]");
    }

    // --- ОСНОВНА ЛОГІКА ПОШУКУ ---
    function runSearch(movie, callback) {
        var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
        var title = movie.title || movie.name;
        if (!title || !year) return;

        var url = 'https://' + JACRED_URL + '/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;
        
        fastFetch(url).then(function(data) {
            var all = [];
            try { all = JSON.parse(data); } catch(e) {}
            if (!Array.isArray(all) || all.length === 0) return;

            var uaRx = /(ukr|ua|ukrainian|укр|україн|toloka|mazepa|hurtom|uafilm|makhno|uaflix|uafix)/i;
            
            var filtered = all.filter(function(i) {
                return uaRx.test(i.title + (i.details || "")) && i.title.indexOf(year) !== -1;
            });

            if (filtered.length > 0) {
                var best = filtered.sort(function(a, b) {
                    var pA = getSourcePriority(a.title), pB = getSourcePriority(b.title);
                    if (pB !== pA) return pB - pA;
                    return parseQuality(b.title) - parseQuality(a.title);
                })[0];

                var lowTitle = best.title.toLowerCase();
                var brandHtml = '<img src="' + ICON_UA + '" class="icon-brand">';
                
                if (lowTitle.indexOf('makhno') !== -1) {
                    brandHtml = '<img src="https://makhnostudio.com" class="icon-brand brand-makhno" title="MAKHNO">';
                } else if (lowTitle.indexOf('uaflix') !== -1 || lowTitle.indexOf('uafix') !== -1) {
                    brandHtml = '<img src="https://uafix.net" class="icon-brand brand-uaflix" title="UAFLIX">';
                }

                var q = parseQuality(best.title);
                var qClass = q >= 2160 ? 'q_4k_text' : (q >= 1080 ? 'q_1080_text' : '');

                var html = $(`
                    <div class="surs_quality_row">
                        <div class="surs_quality_box">
                            ${brandHtml}
                            <span class="quality-item ${qClass}">${q >= 2160 ? '4K' : q + 'p'}</span>
                            <img src="${ICON_STREAM}" style="width:1.2em; opacity:0.6; margin:0 5px">
                            <span class="seeds_info">S:${best.seeders || 0}</span>
                        </div>
                    </div>
                `);
                callback(html);
            }
        });
    }

    // --- ІНТЕГРАЦІЯ В LAMPA ---
    function startPlugin() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var container = e.object.render().find('.full-start__buttons');
                runSearch(e.data.movie, function(html) {
                    container.append(html);
                });
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });

})();