(function () {
    'use strict';

    function createV2(sourceKey) {
        return function v2(component, _object) {
            var network = new Lampa.Reguest();
            var api_base = 'https://makhno.lme.isroot.in';
            var ua_markers = ['ukr', 'ua', 'українськ', 'цікава ідея', 'незупиняй', 'hdrezka ua', 'dniprofilm', 'postmodern'];

            this.search = function (object, data) {
                var first = (data && data.length) ? data[0] : (data || {});
                var url = api_base + '/search?source=' + sourceKey + '&title=' + encodeURIComponent(first.title || object.movie.title || object.movie.name);
                
                if (object.movie.imdb_id) url += '&imdb_id=' + object.movie.imdb_id;

                network.silent(url, function (json) {
                    if (!json || !json.ok || !json.items) return component.empty();
                    
                    var result = json.items;
                    var processItems = function(list) {
                        if (!list) return [];
                        return list.map(function(item) {
                            var name = (item.name || item.title || '').toLowerCase();
                            if (ua_markers.some(function(m) { return name.indexOf(m) !== -1; })) {
                                item.priority = true;
                                if (item.name && item.name.indexOf('[UA]') === -1) item.name = '[UA] ' + item.name;
                            }
                            return item;
                        }).sort(function(a, b) { return (b.priority ? 1 : 0) - (a.priority ? 1 : 0); });
                    };

                    if (object.movie.number_of_seasons || first.serial) {
                        if (result.seasons) result.seasons = processItems(result.seasons);
                        component.onSeries(result);
                    } else {
                        if (result.voices) result.voices = processItems(result.voices);
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

    // РЕЄСТРАЦІЯ ЧЕРЕЗ СТАНДАРТНИЙ ОБ'ЄКТ ПЛАГІНІВ
    var plugin_init = function () {
        // Додаємо компонент
        Lampa.Component.add('makhno_ua', createV2('makhno'));

        // Додаємо в джерела
        Lampa.Source.add('makhno_ua', {
            title: 'Makhno [UA]',
            type: 'video',
            search: function (object, data) {
                var comp = new (Lampa.Component.get('makhno_ua'))(this, object);
                comp.search(object, data);
            }
        });
        console.log('Makhno [UA]: Реєстрація завершена');
    };

    if (window.Lampa) {
        Lampa.Plugins.add({
            id: 'makhno_ua',
            name: 'Makhno [UA]',
            description: 'Український контент',
            version: '1.0.2',
            ready: plugin_init
        });
    }
})();