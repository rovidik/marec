(function () {
    'use strict';

    var api_base = 'https://makhno.lme.isroot.in';

    function createV2(sourceKey) {
        return function v2(component, _object) {
            var network = new Lampa.Reguest();
            var object = _object;
            var ua_markers = ['ukr', 'ua', 'українськ', 'цікава ідея', 'незупиняй', 'hdrezka ua', 'dniprofilm', 'postmodern', 'taktreba'];

            this.search = function (_object, data) {
                object = _object;
                var first = (data && data.length) ? data[0] : (data || {});
                
                search({
                    title: first.title || first.name || object.movie.title || object.movie.name,
                    imdb_id: first.imdb_id || object.movie.imdb_id,
                    tmdb_id: first.tmdb_id || object.movie.id,
                    serial: (object.movie.name || object.movie.first_air_date) ? 1 : 0
                });
            };

            // Функція додавання префікса [UA] та сортування
            function markUA(items) {
                if (!items) return [];
                return items.map(function(item) {
                    var name = (item.name || item.title || item.display_name || '').toLowerCase();
                    var is_ua = ua_markers.some(function(m) { return name.indexOf(m) !== -1; });
                    
                    if (is_ua) {
                        item.priority = true;
                        // Додаємо візуальну позначку, якщо її ще немає
                        if (item.name && item.name.indexOf('[UA]') === -1) {
                            item.name = '[UA] ' + item.name;
                        } else if (item.title && item.title.indexOf('[UA]') === -1) {
                            item.title = '[UA] ' + item.title;
                        }
                    }
                    return item;
                }).sort(function(a, b) { 
                    return (b.priority ? 1 : 0) - (a.priority ? 1 : 0); 
                });
            }

            function search(params) {
                var url = Lampa.Utils.addUrlComponent(api_base + '/search', 'source=' + sourceKey);
                url = Lampa.Utils.addUrlComponent(url, 'title=' + encodeURIComponent(params.title));
                if (params.imdb_id) url = Lampa.Utils.addUrlComponent(url, 'imdb_id=' + params.imdb_id);
                if (params.tmdb_id) url = Lampa.Utils.addUrlComponent(url, 'tmdb_id=' + params.tmdb_id);

                network.silent(url, function (json) {
                    if (!json || !json.ok || !json.items) return component.empty();
                    
                    var data = json.items;

                    if (params.serial) {
                        // Для серіалів маркуємо сезони/озвучки
                        if (data.seasons) data.seasons = markUA(data.seasons);
                        component.onSeries(data);
                    } else {
                        // Для фільмів маркуємо список озвучок
                        if (data.voices) data.voices = markUA(data.voices);
                        component.onMovie(data);
                    }
                    
                    component.loading = false;
                }, function () {
                    component.empty();
                });
            }

            this.destroy = function () {
                network.clear();
            };
        };
    }

    function startPlugin() {
        if (window.ua_makhno_v3_ready) return;
        window.ua_makhno_v3_ready = true;

        // Реєстрація в Lampa
        Lampa.Component.add('makhno_ua', createV2('makhno'));
        Lampa.Source.add('makhno_ua', { title: 'Makhno [UA]', type: 'video' });
        
        console.log('UA Plugin: Пріоритет [UA] активовано');
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();