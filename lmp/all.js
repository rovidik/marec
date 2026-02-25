(function () {
  "use strict";

  var timer = setInterval(function () {
    if (typeof Lampa !== "undefined") {
      clearInterval(timer);

      Lampa.Utils.putScriptAsync(
        [
          "http://wtch.ch/m", // Онлайн без преміум
          "https://lampame.github.io/main/bo.js", // Бандера Онлайн (UA джерела)
          
          "https://nb557.github.io", // Мод на онлайн джерела
          "https://nb557.github.io", // Полегшений онлайн
          "https://nb557.github.io", // Попередні релізи
          "https://nb557.github.io", // Рейтинги та описи
          "https://nb557.github.io", // U-Store (колекція плагінів)
          "https://bywolf88.github.io", // Wolf Cinema
          "https://kp-lampa.pages.dev", // Інтеграція Kinopoisk/TMDB
          "https://nemiroff.github.io", // Рейтинги від Nemiroff
          "https://nemiroff.github.io", // Скидання налаштувань
          "https://nemiroff.github.io", // VOD сервіси

          "https://nemiroff.github.io", // Сповіщення

          // "https://plugins.lampa.stream",
          // "https://lampa.stream",
          // "https://lampa.stream",

          "https://cub.red", // E-Torrents від CUB

          "http://lampa.mx", // Стандартний онлайн-каталог

          "https://lampame.github.io", // Скарбниця (UA контент)

          "https://icantrytodo.github.io/lampa/torrent_styles_v2.js", // Стиль торентів
          "https://darkestclouds.github.io/plugins/easytorrent/easytorrent.min.js", // Рекомендація торрентів
          "https://nemiroff.github.io", // Додаткові трекери
        ],
        function () {},
      );
    }
  }, 200);
})();
