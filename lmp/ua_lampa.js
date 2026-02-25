(function () {
    'use strict';

    Lampa.Plugins.add({
        id: 'makhno_ua_vfinal',
        name: 'Makhno [UA]',
        description: 'Український контент',
        version: '1.1.0',
        ready: function () {
            var network = new Lampa.Reguest();
            var api_base = 'https://makhno.lme.isroot.in';
            var ua_markers = ['ukr', 'ua', 'українськ', 'цікава ідея', 'незупиняй', 'hdrezka ua', 'dniprofilm', 'postmodern', 'taktreba'];

            // Створюємо компонент пошуку
            function MakhnoComponent(object) {
                var comp = this;
                
                this.search = function (object, data) {
                    var first = (data && data.length) ? data[0] : (data || {});
                    var movie = object.movie || {};
                    
                    var url = api_base + '/search?source=makhno';
                    url += '&title=' + encodeURIComponent(first.title || movie.title || movie.name || '');
                    if (movie.imdb_id) url += '&imdb_id=' + movie.imdb_id;
                    if (movie.id) url += '&tmdb_id=' + movie.id;

                    network.silent(url, function (json) {
                        if (!json || !json.ok || !json.items) return object.component.empty();
                        
                        var result = json.items;
                        var is_serial = movie.number_of_seasons || first.serial || movie.name;

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
                            object.component.onSeries(result);
                        } else {
                            if (result.voices) result.voices = process(result.voices);
                            object.component.onMovie(result);
                        }
                    }, function () {
                        object.component.empty();
                    });
                };
            }

            // РЕЄСТРУЄМО ДЖЕРЕЛО В ПАРСЕРІ
            Lampa.Source.add('makhno_ua', {
                title: 'Makhno [UA]',
                type: 'video',
                search: function (object, data) {
                    var comp = new MakhnoComponent(object);
                    comp.search(object, data);
                }
            });
        }
    });
})();