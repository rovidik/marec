(function () {
    'use strict';

    function myUAExtension() {
        // Слухаємо відкриття картки фільму
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                // Створюємо кнопку
                var button = $(`<div class="full-start__button selector">
                    <svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="white"/></svg>
                    <span>Дивитися UA</span>
                </div>`);

                // Обробка натискання
                button.on('hover:enter', function () {
                    Lampa.Select.show({
                        title: 'Українські джерела',
                        items: [
                            {title: 'UAKino (Пошук)', source: 'uakino'},
                            {title: 'HDRezka UA', source: 'rezka'}
                        ],
                        onSelect: function (item) {
                            // Формуємо запит пошуку за назвою фільму
                            var query = encodeURIComponent(e.data.movie.title || e.data.movie.name);
                            var url = item.source === 'uakino' 
                                ? 'https://uakino.me' + query
                                : 'https://rezka.ag' + query;
                            
                            window.open(url, '_blank');
                        }
                    });
                });

                // Додаємо кнопку в блок кнопок на сторінці фільму
                e.object.container.find('.full-start__buttons').append(button);
            }
        });
    }

    // Запуск плагіна
    if (window.appready) myUAExtension();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') myUAExtension();
    });
})();