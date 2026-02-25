(function () {
    'use strict';

    // Основний API для українського контенту
    var api_base = 'https://makhno.lme.isroot.in';

    function createV2(sourceKey) {
        return function v2(component, _object) {
            var network = new Lampa.Reguest();
            var object = _object;
            var selected = null;
            var series = null;
            var episodes_cache = {};
            var filter_items = { season: [], voice: [] };
            var choice = { season: 0, voice: 0, voice_name: '' };
            
            var disabled_source_codes = {
                NO_RESULTS: true, NOT_FOUND: true, CONTENT_REMOVED: true,
                MISSING_IMDB_OR_TMDB: true, INVALID_TMDB_ID: true, NO_STREAMS: true
            };

            this.search = function (_object, data) {
                object = _object;
                if (!data || !data.length) return component.doesNotAnswer();
                var first = data[0] || {};
                
                search({
                    title: first.title || first.name || object.movie.title || object.movie.name,
                    original_title: first.orig_title || first.original_title || object.movie.original_title,
                    imdb_id: first.imdb_id || object.movie.imdb_id,
                    tmdb_id: first.tmdb_id || object.movie.id,
                    kinopoisk_id: first.kp_id || first.kinopoisk_id,
                    year: getYear(object.movie || {}),
                    serial: getSerial(object.movie || {})
                });
            };

            function getYear(movie) {
                var date = movie.release_date || movie.first_air_date || movie.year || '';
                return (date + '').slice(0, 4);
            }

            function getSerial(movie) {
                return (movie.name || movie.first_air_date) ? 1 : 0;
            }

            function apiBase() {
                return api_base;
            }

            function addParam(url, key, value) {
                if (!value) return url;
                return Lampa.Utils.addUrlComponent(url, key + '=' + encodeURIComponent(value));
            }

            function search(params) {
                var url = apiBase() + '/search';
                url = addParam(url, 'source', sourceKey);
                url = addParam(url, 'title', params.title);
                url = addParam(url, 'imdb_id', params.imdb_id);
                url = addParam(url, 'tmdb_id', params.tmdb_id);
                url = addParam(url, 'serial', params.serial);

                network.silent(url, function (json) {
                    if (!json || !json.ok || !json.items.length) {
                        component.empty();
                        return;
                    }
                    
                    // Якщо знайдено кілька варіантів (для уточнення)
                    if (json.items.length > 1 && !object.clarification) {
                        component.similars(json.items.map(function (item) {
                            return {
                                title: item.title,
                                year: item.year,
                                ref: item.ref,
                                serial: item.serial
                            };
                        }));
                    } else {
                        // Логіка завантаження першого знайденого стріму
                        var selected = json.items[0];
                        // Тут зазвичай викликається перехід до плеєра або списку серій
                        component.pushError('Знайдено: ' + selected.title + '. Налаштуйте виклик loadContent.');
                    }
                }, function () {
                    component.empty();
                });
            }

            this.destroy = function () {
                network.clear();
            };
        };
    }

    // Реєстрація плагіна в системі Lampa
    function startPlugin() {
        window.makhno_plugin = true;
        
        // Додаємо джерело Makhno (UA) та BBE
        Lampa.Component.add('makhno', createV2('makhno'));
        Lampa.Component.add('bbe', createV2('bbe'));
        
        // Додаємо в налаштування пріоритет української мови
        console.log('UA Plugin: Initialized');
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') startPlugin();
    });
})();