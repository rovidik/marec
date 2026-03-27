(function () {
    'use strict';

    function initAppleTVPlugin() {
        // 1. СТИЛІ ІНТЕРФЕЙСУ (Glassmorphism & tvOS Layout)
        const style = `
            <style>
                :root { --atv-bg: #0d0d0d; --atv-glass: rgba(40, 40, 40, 0.7); }
                body, .background__layer { background-color: var(--atv-bg) !important; font-family: -apple-system, system-ui, sans-serif !important; }
                
                /* Картки та Фокус */
                .card { border-radius: 16px !important; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important; background: transparent !important; }
                .card:focus, .card.active { transform: scale(1.1) translateY(-10px) !important; box-shadow: 0 30px 60px rgba(0,0,0,0.8) !important; z-index: 10; border: 2px solid rgba(255,255,255,0.5) !important; }
                .card__img { border-radius: 16px !important; }

                /* Меню та Хедер */
                .menu { background: var(--atv-glass) !important; backdrop-filter: blur(30px) !important; border: none !important; width: 260px !important; }
                .menu__item { border-radius: 12px !important; margin: 6px 15px !important; transition: 0.2s; }
                .menu__item.active { background: #fff !important; color: #000 !important; }
                
                /* Плеєр */
                .player-panel { background: rgba(20,20,20,0.7) !important; backdrop-filter: blur(40px) !important; border-radius: 30px 30px 0 0 !important; }
                .player-panel__timeline-view { background: #fff !important; }

                /* Ефект при бездіяльності */
                .is--idle .header, .is--idle .menu { opacity: 0; transform: translateY(-10px); transition: 0.5s; }

                /* Екран заставки */
                #atv-saver { display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; background:#000; transition: opacity 1s; }
            </style>
        `;
        $('body').append(style);

        // 2. ЗАМІНА ЛОГОТИПУ
        const appleIcon = '<svg viewBox="0 0 384 512" width="28" fill="white" style="margin-right:8px;vertical-align:middle;"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>';
        $('.header__logo').html(appleIcon + '<span style="font-weight:700;font-size:24px;letter-spacing:-1px">tv</span>');

        // 3. ЗВУК ТА ЗАСТАВКИ
        const clickSound = new Audio('https://www.soundjay.com');
        clickSound.volume = 0.15;

        const videoList = [
            'https://video-ssl.itunes.apple.com',
            'https://video-ssl.itunes.apple.com'
        ];

        $('body').append('<div id="atv-saver"><video id="atv-video" style="width:100%;height:100%;object-fit:cover;" muted loop></video></div>');
        
        let idleTimer;
        function resetIdle() {
            $('#atv-saver').fadeOut(500);
            document.getElementById('atv-video').pause();
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                const vid = document.getElementById('atv-video');
                vid.src = videoList[Math.floor(Math.random() * videoList.length)];
                $('#atv-saver').fadeIn(1000);
                vid.play();
            }, 120000); // 2 хв
        }

        $(document).on('keydown', function(e) {
            resetIdle();
            if ([37,38,39,40].includes(e.keyCode)) {
                clickSound.currentTime = 0;
                clickSound.play().catch(()=>{});
            }
        });

        resetIdle();
    }

    if (window.appready) initAppleTVPlugin();
    else Lampa.Listener.follow('app', (e) => { if (e.type == 'ready') initAppleTVPlugin(); });
})();