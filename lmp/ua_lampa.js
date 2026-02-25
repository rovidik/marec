(function () {
    'use strict';

    // Функція створення компонента пошуку
    function createV2(sourceKey) {
        return function v2(component, _object) {
            var network = new Lampa.Reguest();
            var api_base = 'https://makhno.lme.isroot.in';
            var ua_markers = ['ukr', 'ua', 'українськ', 'цікава ідея', 'незупиняй', 'hdrezka ua', 'dniprofilm', 'postmodern', 'taktreba', 'голос на всю'];

            this.search = function (object, data) {
                var first = (data && data.length) ? data[0] : (data || {});
                var movie = object.movie || {};
                
                // Формуємо прямий URL для Android-клієнта
                var url = api_base + '/search?source=' + sourceKey;
                url += '&title=' + encodeURIComponent(first.title || movie.title || movie.name || '');
                if (movie.imdb_id) url += '&imdb_id=' + movie.imdb_id;
                if (movie.id) url += '&tmdb_id=' + movie.id;

                network.silent(url, function (json) {
                    if (!json || !json.ok || !json.items) return component.empty();
                    
                    var result = json.items;
                    var is_serial = movie.number_of_seasons || first.serial || movie.name;

                    // Маркування UA та сортування
                    var process = function(list) {
                        if (!list) return [];
                        return list.map(function(item) {
                            var name = (item.name || item.title || '').toLowerCase();
                            if (ua_markers.some(function(m) { return name.indexOf(m) !== -1; })) {
                                item.priority = true;
                                if (item.name && !item.name.includes('[UA]')) item.name = '[UA] ' + item.name;
                            }
                            return item;
                        }).sort(function(a, b) { return (b.priority ? 1 : 0) - (a.priority ? 1 : 0); });
                    };

                    if (is_serial) {
                        if (result.seasons) result.seasons = process(result.seasons);
                        component.onSeries(result);
                    } else {
                        if (result.voices) result.voices = process(result.voices);
                        component.onMovie(result);
                    }
                }, function () {
                    component.empty();
                });
            };

            this.destroy = function () {
                network.clear();
            };
        };
    }

    // РЕЄСТРАЦІЯ ПЛАГІНА ДЛЯ ANDROID
    var plugin_id = 'makhno_ua_vfinal_' + Math.floor(Math.random() * 1000); // Рандомний ID для обходу кешу
    
    Lampa.Plugins.add({
        id: plugin_id,
        name: 'Makhno [UA] Pro',
        description: 'Український контент для Android',
        version: '1.0.5',
        ready: function () {
            Lampa.Component.add('makhno_ua_pro', createV2('makhno'));

            // Додаємо в Парсер
            Lampa.Source.add('makhno_ua_pro', {
                title: 'Makhno [UA]',
                type: 'video',
                search: function (object, data) {
                    var comp = new (Lampa.Component.get('makhno_ua_pro'))(this, object);
                    comp.search(object, data);
                }
            });
            console.log('Makhno [UA] Pro: Запущено на Android');
        }
    });
})();