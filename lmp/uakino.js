(function () {
    'use strict';

    function myUAExtension(api) {
        // Додаємо нову кнопку або джерело
        Lampa.Component.add('my_ua_source', {
            title: 'Українське кіно',
            icon: '<svg>...</svg>', // SVG іконка
            onSelect: function() {
                // Логіка переходу на сайт або виклику API
                Lampa.Select.show({
                    title: 'Виберіть сервіс',
                    items: [
                        {title: 'UAKino', url: 'https://uakino.me'},
                        {title: 'HDRezka (UA)', url: 'https://rezka.ag'}
                    ],
                    onSelect: function(item) {
                        Lampa.Activity.push({
                            url: item.url,
                            title: item.title,
                            component: 'web_view'
                        });
                    }
                });
            }
        });
    }

    // Реєстрація плагіна в системі Lampa
    if (window.appready) myUAExtension(window.Lampa);
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') myUAExtension(window.Lampa);
        });
    }
})();