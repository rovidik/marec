(function () {
    'use strict';

    function CombinedUA(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        
        this.create = function () {
            var _this = this;
            // Масив запитів до обох джерел
            var sources = [
                { name: 'UAFLIX', url: 'https://api.uaflix.example' },
                { name: 'Makhno', url: 'https://makhno.example' }
            ];

            sources.forEach(function(src) {
                network.silent(src.url + encodeURIComponent(object.search), function (data) {
                    if (data && data.results) {
                        data.results.forEach(function (item) {
                            var card = Lampa.Template.get('card', {
                                title: '[' + src.name + '] ' + (item.title || item.name),
                                release_year: item.year
                            });
                            
                            card.on('hover:enter', function () {
                                Lampa.Player.play({
                                    url: item.video_url || item.link,
                                    title: item.title || item.name
                                });
                            });
                            items.push(card);
                        });
                        _this.show();
                    }
                });
            });
            return scroll.render();
        };

        this.show = function () {
            items.forEach(function (item) { scroll.append(item); });
        };
    }

    function startPlugin() {
        Lampa.Component.add('ua_combined', CombinedUA);
        
        // Додавання пункту "UA КІНО (Makhno/UAFLIX)" у бокове меню
        var menu_item = $('<div class="menu__item selector" data-action="ua_combined">' +
            '<div class="menu__ico"><svg>...</svg></div>' +
            '<div class="menu__text">UA КІНО</div>' +
            '</div>');
            
        menu_item.on('hover:enter', function() {
            Lampa.Activity.push({
                type: 'ua_combined',
                title: 'Український пошук',
                search: object.search || '' 
            });
        });
        
        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();