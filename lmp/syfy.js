(function () {
    'use strict';

    /**
     * STUDIOS MASTER (Unified)
     * Developed by: Syvyj
     * Version: 1.2.0
     * Description: Unified studio collections for Lampa (Netflix, HBO, Disney+, etc.)
     * 
     * This plugin is a community development. 
     * Credits to the creator for curation and logic.
     */

    var SERVICE_CONFIGS = {
        'syfy': {
            title: 'Syfy',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>',
            categories: [
                { "title": "Хіти телеканалу Syfy", "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "popularity.desc" } },
                { "title": "Космічні подорожі та Наукова Фантастика", "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "10765", "with_keywords": "3801", "sort_by": "vote_average.desc" } },
                { "title": "Містика, Жахи та Фентезі", "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "9648,10765", "without_keywords": "3801", "sort_by": "popularity.desc" } }
            ]
        },
        
    };

    // -----------------------------------------------------------------
    // COMPONENTS
    // -----------------------------------------------------------------

    function StudiosMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = SERVICE_CONFIGS[object.service_id];

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var categories = config.categories;
            var network = new Lampa.Reguest();
            var status = new Lampa.Status(categories.length);

            status.onComplite = function () {
                var fulldata = [];
                Object.keys(status.data).sort(function (a, b) { return a - b; }).forEach(function (key) {
                    var data = status.data[key];
                    if (data && data.results && data.results.length) {
                        var cat = categories[parseInt(key)];
                        Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                        fulldata.push({
                            title: cat.title,
                            results: data.results,
                            url: cat.url,
                            params: cat.params,
                            service_id: object.service_id // pass for 'View All' context
                        });
                    }
                });

                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            categories.forEach(function (cat, index) {
                var params = [];
                params.push('api_key=' + Lampa.TMDB.key());
                params.push('language=' + Lampa.Storage.get('language', 'uk'));

                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }

                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));

                network.silent(url, function (json) {
                    status.append(index.toString(), json);
                }, function () {
                    status.error();
                });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    function StudiosView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        function buildUrl(page) {
            var params = [];
            params.push('api_key=' + Lampa.TMDB.key());
            params.push('language=' + Lampa.Storage.get('language', 'uk'));
            params.push('page=' + page);

            if (object.params) {
                for (var key in object.params) {
                    var val = object.params[key];
                    if (val === '{current_date}') {
                        var d = new Date();
                        val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    }
                    params.push(key + '=' + val);
                }
            }
            return Lampa.TMDB.api(object.url + '?' + params.join('&'));
        }

        comp.create = function () {
            var _this = this;
            network.silent(buildUrl(1), function (json) {
                _this.build(json);
            }, this.empty.bind(this));
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            network.silent(buildUrl(object.page), resolve, reject);
        };

        return comp;
    }

    // -----------------------------------------------------------------
    // INJECTION
    // -----------------------------------------------------------------

    function startPlugin() {
        if (window.plugin_studios_master_ready) return;
        window.plugin_studios_master_ready = true;

        // Branding
      //   Lampa.Noty.show('Studios Master by Syvyj розгорнуто');

        // Register components
        Lampa.Component.add('studios_main', StudiosMain);
        Lampa.Component.add('studios_view', StudiosView);

        // Inject CSS for wide cards once
        if (!$('#studios-unified-css').length) {
            $('body').append(`
                <style id="studios-unified-css">
                    .studios_main .card--wide { width: 18.3em !important; }
                    .studios_view .card--wide { width: 18.3em !important; }
                    .studios_view .category-full { padding-top: 1em; }
                </style>
            `);
        }

        // Function to render menu buttons
        function addMenuButtons() {
            var menu = $('.menu .menu__list').eq(0);
            if (!menu.length) return;

            // Iterate through all configs and add buttons
            Object.keys(SERVICE_CONFIGS).forEach(function (sid) {
                var conf = SERVICE_CONFIGS[sid];

                // Avoid duplicates
                if (menu.find('.menu__item[data-sid="' + sid + '"]').length) return;

                var btn = $(`<li class="menu__item selector" data-action="studios_action_${sid}" data-sid="${sid}">
                    <div class="menu__ico">${conf.icon}</div>
                    <div class="menu__text">${conf.title}</div>
                </li>`);

                btn.on('hover:enter', function () {
                    Lampa.Activity.push({
                        title: conf.title,
                        component: 'studios_main',
                        service_id: sid,
                        page: 1
                    });
                });

                // Append to the menu
                menu.append(btn);
            });
        }

        // Initialize
        if (window.appready) {
            addMenuButtons();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') addMenuButtons();
            });
        }

        // Safety check to ensure buttons appear even if DOM changes
        setInterval(function () {
            if (window.appready && $('.menu .menu__list').eq(0).length) {
                addMenuButtons();
            }
        }, 3000);
    }

    if (!window.plugin_studios_master_ready) startPlugin();
})();