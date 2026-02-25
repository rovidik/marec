(function () {
    'use strict';

    Lampa.Component.add('makhno_ua', function (component, _object) {
        var network = new Lampa.Reguest();
        var api_base = 'https://makhno.lme.isroot.in';

        this.search = function (object, data) {
            var movie = object.movie || {};
            var url = api_base + '/search?source=makhno&title=' + encodeURIComponent(movie.title || movie.name || '');
            if (movie.imdb_id) url += '&imdb_id=' + movie.imdb_id;

            network.silent(url, function (json) {
                if (json && json.ok && json.items) {
                    // Якщо серіал
                    if (movie.number_of_seasons || movie.name) {
                        component.onSeries(json.items);
                    } else {
                        component.onMovie(json.items);
                    }
                } else component.empty();
            }, function () {
                component.empty();
            });
        };
        this.destroy = function () { network.clear(); };
    });

    Lampa.Source.add('makhno_ua', {
        title: 'Makhno [UA]',
        type: 'video',
        search: function (object, data) {
            var comp = new (Lampa.Component.get('makhno_ua'))(this, object);
            comp.search(object, data);
        }
    });

    console.log('Makhno [UA] Loaded');
})();