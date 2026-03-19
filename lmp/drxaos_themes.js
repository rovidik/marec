    /*
                                                                            
    ║  ┌────────────────────────────────────────────────────────────────────────┐ ║
    ║  │  💰 ПОДДЕРЖКА РАЗРАБОТЧИКА / SUPPORT THE DEVELOPER                     │ ║
    ║  │                                                                         │ ║
    ║  │  🇷🇺 Если вам нравится плагин и вы хотите поблагодарить копейкой:         │ ║
    ║  │  🇺🇦 Якщо вам подобається плагін і ви хочете подякувати копійчиною:       │ ║
    ║  │  🇬🇧 If you like the plugin and want to say thanks:                       │ ║
    ║  │                                                                         │ ║
    ║  │  💳 USDT (TRC-20):  TBLUWM16Eiufc6GLJaMGxaFy7oTBiDgar8                    ║
    ║  │                                                                           ║ 
    ║  │                                                                         │ ║
    ║  │  🙏 Каждый донат мотивирует на дальнейшую разработку!                 │  ║
    ║  │  🙏 Кожен донат мотивує на подальший розвиток!                         │  ║
    ║  │  🙏 Every donation motivates further development!                      │  ║
    ║  └────────────────────────────────────────────────────────────────────────┘  ║
    ║                                                                              ║
    ║  Спасибо за использование! / Дякую за використання! / Thank you for using!   ║
    ║                                                                              ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    */

/*
 * ============================================================================
 * DRXAOS Themes v3.0 - Premium Theme Plugin for Lampa
 * ============================================================================
 * 
 * LAMPA 3.0.7 COMPATIBILITY UPDATE
 * 
 * Changes in v3.0:
 * ✓ Full compatibility with Lampa 3.0.7 (app_digital: 307)
 * ✓ Enhanced API validation on initialization
 * ✓ Element.prototype polyfills for addClass/removeClass/toggleClass/hasClass
 * ✓ Safe Storage operations with error handling
 * ✓ jQuery compatibility layer ($)
 * ✓ Improved error logging and diagnostics
 * ✓ All original functionality preserved
 * 
 * Features:
 * - 9 premium themes (Midnight, Crimson, Ocean, Forest, Sunset, Slate, Lavender, Emerald, Amber)
 * - Dynamic quality badges (4K/FHD/HD/SD/CAM)
 * - Season progress indicators
 * - TMDB integration (logos, original titles, metadata)
 * - JacRed quality detection
 * - Hero mode (MADNESS) with enhanced movie/series details
 * - Performance optimizations for Android TV/Fire TV
 * 
 * Requirements:
 * - Lampa 3.0.x+ (app_digital >= 30x)
 * - TMDB API key (built-in fallback included)
 * - Optional: JacRed URL for torrent quality detection
 * 
 * ============================================================================
 */

/* jshint esversion: 6, bitwise: false */
(function() {
    'use strict';
var drxaosCardDataExtractor = null;
var drxaosSafeGetCardData = function() { return null; };
var drxaosFocusLocks = {};
function drxaosEnterFocusLock(source) {
    try {
        source = source || 'global';
        drxaosFocusLocks[source] = Date.now();
        if (document.body) {
            document.body.classList.add('drxaos-focus-locked');
        }
    } catch(e) {
        
    }
}
function drxaosLeaveFocusLock(source) {
    try {
        if (source) {
            delete drxaosFocusLocks[source];
        } else {
            drxaosFocusLocks = {};
        }
        if (!drxaosIsFocusLockActive() && document.body) {
            document.body.classList.remove('drxaos-focus-locked');
        }
    } catch(e) {
        
    }
}
function drxaosIsFocusLockActive() {
    try {
        for (var key in drxaosFocusLocks) {
            if (Object.prototype.hasOwnProperty.call(drxaosFocusLocks, key)) {
                return true;
            }
        }
    } catch(e) {
        
    }
    return false;
}


  // ============================================================================
  // LAMPA 3.0.5 COMPATIBILITY LAYER
  // ============================================================================

  // Check Lampa API availability


  // Safe Storage wrapper functions
  function drxaosSafeGet(key, defaultValue) {
    try {
      if (!window.Lampa || !Lampa.Storage) return defaultValue;
      var value = Lampa.Storage.get(key, defaultValue);
      return value !== undefined ? value : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  function drxaosSafeSet(key, value) {
    try {
      if (!window.Lampa || !Lampa.Storage) return false;
      Lampa.Storage.set(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function drxaosIsUtilitiesEnabled() {
    return drxaosSafeGet('drxaos_utils_button', 'on') !== 'off';
  }

  function drxaosNetworkTimeout() {
    var timeout = CONFIG && CONFIG.NETWORK && CONFIG.NETWORK.TIMEOUT_MS;
    return typeof timeout === 'number' && timeout > 0 ? timeout : 10000;
  }

  function drxaosFetchWithTimeout(url, options, timeoutMs) {
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timeout = typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : drxaosNetworkTimeout();
    var opts = options ? Object.assign({}, options) : {};
    if (controller) {
      opts.signal = controller.signal;
    }
    return new Promise(function(resolve, reject) {
      var timerId = setTimeout(function() {
        if (controller) {
          try { controller.abort(); } catch (abortErr) {}
        }
        reject(new Error('Fetch timeout after ' + timeout + 'ms'));
      }, timeout);
      fetch(url, opts).then(function(response) {
        clearTimeout(timerId);
        resolve(response);
      }).catch(function(err) {
        clearTimeout(timerId);
        reject(err);
      });
    });
  }

  function drxaosParseProxyList(raw) {
    if (!raw || typeof raw !== 'string') return [];
    return raw.split(/[\n,]+/).map(function(item) {
      return item.trim();
    }).filter(function(item) {
      return item.length > 0;
    });
  }

  function drxaosGetProxyMode() {
    return drxaosSafeGet('drxaos_proxy_mode', 'auto');
  }

  function drxaosGetJacredProxyList(defaultList) {
    var mode = drxaosGetProxyMode();
    if (mode === 'off') return [];
    if (mode === 'custom') {
      var custom = drxaosSafeGet('drxaos_proxy_custom', '');
      var parsed = drxaosParseProxyList(custom).filter(function(item) {
        return /^https?:\/\//i.test(item);
      });
      return parsed.length ? parsed : [];
    }
    return Array.isArray(defaultList) ? defaultList.slice() : [];
  }
  if (!window.Lampa) {
    return;
  }
  if (window.Lampa && Lampa.Controller && Lampa.Controller.listener && typeof Lampa.Controller.listener.follow === 'function') {
    try {
      Lampa.Controller.listener.follow('toggle', function(event) {
        if (!event || !event.name) return;
        if (event.name === 'menu') {
          drxaosEnterFocusLock('menu-controller');
        } else if (event.name !== 'menu') {
          drxaosLeaveFocusLock('menu-controller');
        }
      });
    } catch(lockError) {
      
    }
  }

  // Validate critical APIs
  var requiredAPIs = ['Storage', 'SettingsApi', 'Activity', 'Listener', 'Template'];
  var missingAPIs = [];

  for (var i = 0; i < requiredAPIs.length; i++) {
    if (!Lampa[requiredAPIs[i]]) {
      missingAPIs.push(requiredAPIs[i]);
    }
  }

  if (missingAPIs.length > 0) {
    return;
  }

  // Ensure Element.prototype methods exist (from app.min.js polyfills)
  if (typeof Element !== 'undefined') {
    // addClass
    if (!Element.prototype.addClass) {
      Element.prototype.addClass = function(classes) {
        var self = this;
        classes.split(' ').forEach(function(c) {
          if (c && self.classList) {
            self.classList.add(c);
          }
        });
        return this;
      };
    }

    // removeClass
    if (!Element.prototype.removeClass) {
      Element.prototype.removeClass = function(classes) {
        var self = this;
        classes.split(' ').forEach(function(c) {
          if (c && self.classList) {
            self.classList.remove(c);
          }
        });
        return this;
      };
    }

    // toggleClass
    if (!Element.prototype.toggleClass) {
      Element.prototype.toggleClass = function(classes, status) {
        var self = this;
        classes.split(' ').forEach(function(c) {
          if (!c) return;
          var has = self.classList.contains(c);
          if (status && !has) {
            self.classList.add(c);
          } else if (!status && has) {
            self.classList.remove(c);
          }
        });
        return this;
      };
    }

    // hasClass
    if (!Element.prototype.hasClass) {
      Element.prototype.hasClass = function(className) {
        return this.classList && this.classList.contains(className);
      };
    }
  }

  // jQuery compatibility check
  var $ = window.jQuery || (window.Lampa && window.Lampa.$);
  if (!$) {
  }


  // ============================================================================

    var DRXAOS_TITLE_LOGO_CACHE = {};
    var DRXAOS_TITLE_LOGO_PENDING = {};
    var DRXAOS_ORIGINAL_NAME_CACHE = {};
    var DRXAOS_ORIGINAL_NAME_PENDING = {};
    var DRXAOS_CARD_DATA_STORAGE = new WeakMap();
    var DRXAOS_CARD_DATA_INDEX = new Map();
    var DRXAOS_HERO_DETAIL_CACHE = {};
    var DRXAOS_COUNTRY_CACHE = {};
    var DRXAOS_COUNTRY_PENDING = {};
    var DRXAOS_LINE_ID_COUNTER = 0;
    var XUYAMPISHE_STYLE_ID = 'drxaos-xuyampishe-style';
    var drxaosFocusClassObserver = null;
    var XUYAMPISHE_CORE_CSS = '';
    var DRXAOS_GLOBAL_CSS = '';

    function drxaosIsValidCard(card) {
        if (!card || !card.nodeType || card.nodeType !== 1) return false;
        var activity = typeof card.closest === 'function' ? card.closest('.activity') : null;
        if (!activity) return false;
        if (card.closest('.menu') || card.closest('.head') || card.closest('.selectbox') || card.closest('.settings')) return false;
        return true;
    }

    function drxaosIsContentControllerActive() {
        try {
            if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.enabled === 'function') {
                var enabled = Lampa.Controller.enabled();
                return !!(enabled && enabled.name === 'content');
            }
        } catch (e) {}
        return false;
    }

    function drxaosIsUiBlockingState() {
        if (typeof document !== 'undefined' && document.body) {
            if (document.body.classList.contains('menu--open') || document.body.classList.contains('head--active')) return true;
        }
        try {
            if (window.Lampa && Lampa.Modal && typeof Lampa.Modal.opened === 'function' && Lampa.Modal.opened()) return true;
        } catch (e) {}
        return false;
    }

    var DRXAOS_CACHE_DEFAULT_TTL = 72 * 60 * 60 * 1000;
    var DRXAOS_CACHE_DEFAULT_LIMIT = 100 * 1024;
    var drxaosQualityCacheStore = null;
    var drxaosTmdbCacheStore = null;
    var drxaosJacredCacheStore = null;
    var BUILTIN_TMDB_KEY = '4ef0d7355d9ffb5151e987764708ce96';

    function drxaosSupportsLampaStorage() {
        return !!(window.Lampa &&
            Lampa.Storage &&
            typeof Lampa.Storage.get === 'function' &&
            typeof Lampa.Storage.set === 'function');
    }

    function drxaosCloneCacheObject(source) {
        var clone = {};
        if (!source || typeof source !== 'object') {
            return clone;
        }
        Object.keys(source).forEach(function(key) {
            clone[key] = source[key];
        });
        return clone;
    }

    function drxaosSerializeSize(obj) {
        try {
            return JSON.stringify(obj).length;
        } catch (err) {
            return Infinity;
        }
    }

    function createPersistentCache(storageKey, limitBytes, ttl) {
        var memoryCache = {};
        limitBytes = typeof limitBytes === 'number' && limitBytes > 0 ? limitBytes : 0;
        ttl = typeof ttl === 'number' && ttl > 0 ? ttl : DRXAOS_CACHE_DEFAULT_TTL;

        function now() {
            return Date.now();
        }

        function load() {
            var cache = memoryCache;
            if (drxaosSupportsLampaStorage()) {
                try {
                    var stored = Lampa.Storage.get(storageKey);
                    if (typeof stored === 'string') {
                        cache = JSON.parse(stored || '{}') || {};
                    } else if (stored && typeof stored === 'object') {
                        cache = stored;
                    } else {
                        cache = {};
                    }
                } catch (err) {
                    cache = {};
                }
            }
            memoryCache = drxaosCloneCacheObject(cache);
            return drxaosCloneCacheObject(memoryCache);
        }

        function prune(cache, lastKey) {
            var keys = Object.keys(cache);
            var currentTime = now();
            keys.forEach(function(key) {
                var item = cache[key];
                if (!item || typeof item !== 'object' || !item.timestamp || currentTime - item.timestamp > ttl) {
                    delete cache[key];
                }
            });

            if (!limitBytes) {
                return cache;
            }

            var sortedKeys = Object.keys(cache).sort(function(a, b) {
                return cache[a].timestamp - cache[b].timestamp;
            });

            var size = drxaosSerializeSize(cache);
            while (size > limitBytes && sortedKeys.length) {
                var candidate = sortedKeys.shift();
                if (candidate === lastKey && sortedKeys.length === 0) {
                    break;
                }
                delete cache[candidate];
                size = drxaosSerializeSize(cache);
            }

            if (limitBytes && lastKey && cache[lastKey] && drxaosSerializeSize(cache) > limitBytes) {
                delete cache[lastKey];
            }

            return cache;
        }

        function save(cache, lastKey) {
            var normalized = prune(drxaosCloneCacheObject(cache), lastKey);
            memoryCache = normalized;
            if (drxaosSupportsLampaStorage()) {
                try {
                    Lampa.Storage.set(storageKey, normalized);
                } catch (err) {
                    memoryCache = normalized;
                }
            }
        }

        return {
            get: function(key) {
                if (!key) return null;
                var cache = load();
                var item = cache[key];
                if (!item || typeof item !== 'object') {
                    return null;
                }
                if (now() - item.timestamp > ttl) {
                    delete cache[key];
                    save(cache);
                    return null;
                }
                return item.value;
            },
            set: function(key, value) {
                if (!key) return;
                var cache = load();
                cache[key] = {
                    value: value,
                    timestamp: now()
                };
                save(cache, key);
            },
            remove: function(key) {
                if (!key) return;
                var cache = load();
                if (cache.hasOwnProperty(key)) {
                    delete cache[key];
                    save(cache);
                }
            },
            clear: function() {
                memoryCache = {};
                save({});
            }
        };
    }

    function getQualityCacheStore() {
        if (!drxaosQualityCacheStore) {
            drxaosQualityCacheStore = createPersistentCache(
                'drxaos_quality_cache',
                DRXAOS_CACHE_DEFAULT_LIMIT,
                DRXAOS_CACHE_DEFAULT_TTL
            );
        }
        return drxaosQualityCacheStore;
    }

    function getTmdbCacheStore() {
        if (!drxaosTmdbCacheStore) {
            drxaosTmdbCacheStore = createPersistentCache(
                'drxaos_tmdb_cache',
                DRXAOS_CACHE_DEFAULT_LIMIT,
                DRXAOS_CACHE_DEFAULT_TTL
            );
        }
        return drxaosTmdbCacheStore;
    }
    function getJacredCacheStore() {
        if (!drxaosJacredCacheStore) {
            drxaosJacredCacheStore = createPersistentCache(
                'drxaos_jacred_cache',
                DRXAOS_CACHE_DEFAULT_LIMIT,
                DRXAOS_CACHE_DEFAULT_TTL
            );
        }
        return drxaosJacredCacheStore;
    }

    function drxaosIsTvDevice() {
        try {
            if (window.Lampa && Lampa.Platform) {
                if (typeof Lampa.Platform.tvbox === 'function' && Lampa.Platform.tvbox()) return true;
                if (typeof Lampa.Platform.is === 'function' && Lampa.Platform.is('android')) return true;
            }
        } catch (e) {}
        var ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
        return /Android|Android TV|Google TV|Smart ?TV|SMART-TV|HbbTV|Tizen|Web0S|WebOS|NetCast|AppleTV|AFT|TV/i.test(ua);
    }

    // 🚀 PERFORMANCE MODE INITIALIZATION
    (function initPerformanceMode() {
        try {
            if (typeof document !== 'undefined' && document.body) {
                if (drxaosIsTvDevice()) {
                    document.body.classList.add('drxaos-low-perf');
                }
            }
        } catch(e) {}
    })();

    try {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('drxaos_season_cache')) {
            localStorage.removeItem('drxaos_season_cache');
        }
    } catch (cacheCleanupError) {
    }

    XUYAMPISHE_CORE_CSS = /* css */ `
/* ===================================================================
   ФИНАЛЬНОЕ РЕШЕНИЕ - ВСЕ РАЗДЕЛЫ И ВСЕ РЯДЫ ОДИНАКОВЫЕ
   =================================================================== */

/* УМЕНЬШЕНИЕ HERO СНИЗУ - МИНИМАЛЬНЫЙ ОТСТУП */
body.drxaos-xuyampishe-active .drxaos-xu-info {
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-info__body {
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
}

/* ОТСТУП ОТ HERO-ПАНЕЛИ - НИЗКИЙ Z-INDEX */
body.drxaos-xuyampishe-active .drxaos-xu-info__tags.drxaos-hero-tags {
    margin-bottom: clamp(10px, 1.5vh, 20px) !important;
    position: relative !important;
    z-index: 1 !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-info {
    position: relative !important;
    z-index: 1 !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-info * {
    z-index: 1 !important;
}

/* ОТСТУП СВЕРХУ ДЛЯ ВСЕХ РАЗДЕЛОВ (НЕ ТОЛЬКО ПЕРВОГО) */
body.drxaos-xuyampishe-active .drxaos-xu-container {
    margin-top: clamp(6px, 1vh, 18px) !important;
    position: relative !important;
    z-index: 1 !important;
}

/* ПЕРВЫЙ РАЗДЕЛ - БЕЗ ДОПОЛНИТЕЛЬНОГО ОТСТУПА */
body.drxaos-xuyampishe-active .drxaos-xu-container:first-child {
    margin-top: 0 !important;
}

/* ВСЕ items-line - УБИРАЕМ ПУСТОЕ ПРОСТРАНСТВО + ПОДНИМАЕМ */
body.drxaos-xuyampishe-active .drxaos-xu-container .items-line,
body.drxaos-xuyampishe-active .items-cards > .items-line,
body.drxaos-xuyampishe-active .scroll-line > .items-line,
body.drxaos-xuyampishe-active .items-linebody > .items-line {
    transform: translateY(0) !important;
    margin-top: clamp(-6px, -1vh, 0px) !important;
    padding-top: clamp(6px, 1vh, 12px) !important;
    margin-bottom: clamp(18px, 2.4vh, 28px) !important;
    padding-bottom: clamp(16px, 2.8vh, 28px) !important;
    min-height: auto !important;
    will-change: transform !important;

    z-index: 1 !important;
}

/* ЗАГОЛОВКИ РЯДОВ - АБСОЛЮТНЫЙ ПРИОРИТЕТ ПОВЕРХ HERO-ПАНЕЛИ */
body.drxaos-xuyampishe-active .drxaos-xu-container {
    position: relative !important;
    z-index: 1 !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-info {
    position: relative !important;
    z-index: 1 !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-info * {
    z-index: 1 !important;
    position: relative !important;
}

body.drxaos-xuyampishe-active .items-line {
    position: relative !important;
    z-index: 10 !important;
}

body.drxaos-xuyampishe-active .items-line__head {
    margin-top: 0 !important;
    padding-top: 0 !important;
    position: relative !important;
    z-index: 100000 !important;
    transform: none !important;
    isolation: isolate !important;
    pointer-events: auto !important;
}

body.drxaos-xuyampishe-active .items-line__head * {
    z-index: 100000 !important;
    position: relative !important;
    pointer-events: auto !important;
}

body.drxaos-xuyampishe-active .items-line__title {
    position: relative !important;
    z-index: 100001 !important;
    isolation: isolate !important;
    background: transparent !important;
    pointer-events: auto !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

body.drxaos-xuyampishe-active .items-line__more {
    position: relative !important;
    z-index: 100000 !important;
    pointer-events: auto !important;
}

/* ЗАГОЛОВКИ РЯДОВ ПОВЕРХ HERO-ПАНЕЛИ - ДОПОЛНИТЕЛЬНАЯ ЗАЩИТА */
body.drxaos-xuyampishe-active .items-line__head .items-line__title {
    position: relative !important;
    z-index: 100002 !important;
    isolation: isolate !important;
    pointer-events: auto !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

/* ГАРАНТИРОВАННАЯ ВИДИМОСТЬ ЗАГОЛОВКОВ ПОВЕРХ HERO-ПАНЕЛИ */
body.drxaos-xuyampishe-active .drxaos-xu-container .items-line__head,
body.drxaos-xuyampishe-active .drxaos-xu-container .items-line__title {
    position: relative !important;
    z-index: 100003 !important;
    isolation: isolate !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .items-line__head .items-line__title {
    position: relative !important;
    z-index: 100004 !important;
    isolation: isolate !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

/* items-line__body - OVERFLOW VISIBLE (GLOBAL) */
html body .items-line__body {
    overflow: visible !important;
}

/* КАРТОЧКИ - OVERFLOW VISIBLE (GLOBAL) */
html body .items-line .card,
html body .items-line .card__view,
html body .items-line .card__title {
    overflow: visible !important;
}

/* ТВ ПРАВИЛА */
@media (min-width: 1280px) {
    body.drxaos-xuyampishe-active .drxaos-xu-info__tags.drxaos-hero-tags {
        margin-bottom: clamp(15px, 2vh, 30px) !important;
    }

    body.drxaos-xuyampishe-active .drxaos-xu-container {
        margin-top: clamp(40px, 5vh, 80px) !important;
    }

    body.drxaos-xuyampishe-active .drxaos-xu-container:first-child {
        margin-top: 0 !important;
    }

    body.drxaos-xuyampishe-active .items-line {
        transform: translateY(0) !important;
        margin-top: clamp(-12px, -1.5vh, -4px) !important;
        margin-bottom: clamp(44px, 3.6vh, 68px) !important;
        padding-bottom: clamp(52px, 6.5vh, 90px) !important;
    }


    /* ОТКЛЮЧЕНИЕ BACKDROP У HERO НА TV */
body.drxaos-xuyampishe-active .drxaos-xu-info::before,
body.drxaos-xuyampishe-active .drxaos-xu-info::after {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    background: none !important;
    box-shadow: none !important;
}

    body.drxaos-xuyampishe-active .drxaos-xu-info {
        background: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
    }

}

/* TV FIX - ОТМЕНА ПРИЖИМАНИЯ К НИЗУ С СОХРАНЕНИЕМ СКРОЛЛА */
@media (min-width: 1280px) {
    body.drxaos-xuyampishe-active .activity,
    body.drxaos-xuyampishe-active .activity__body,
    body.drxaos-xuyampishe-active .scroll,
    body.drxaos-xuyampishe-active .scroll__body {
        align-items: flex-start !important;
        justify-content: flex-start !important;
    }

    body.drxaos-xuyampishe-active .drxaos-xu-container,
    body.drxaos-xuyampishe-active .items-cards,
    body.drxaos-xuyampishe-active .scroll-line {
        position: static !important;
    }
}




@media (min-width: 1280px) and (hover: none) and (pointer: coarse) {
    body.drxaos-xuyampishe-active .items-line,
    body.drxaos-xuyampishe-active .items-line:first-of-type {
        transform: translateY(clamp(-150px, -10vh, -200px)) !important;
        margin-bottom: clamp(150px, 10vh, 200px) !important;
        padding-bottom: clamp(80px, 9vh, 140px) !important;
    }
}

/* ===================================================================
   КОНЕЦ РЕШЕНИЯ
   =================================================================== */
`;

    DRXAOS_GLOBAL_CSS = /* css */ `
   /* UNWRAPPED LAYOUT */
   .full-start-new__buttons.drxaos-buttons-unwrapped,
   .full-start__buttons.drxaos-buttons-unwrapped {
       display: flex !important;
       flex-wrap: wrap !important;
       align-items: center !important;
       justify-content: flex-start !important;
       gap: var(--drxaos-chip-gap, clamp(0.15rem, 0.15vw, 0.15rem)) !important;
       width: -moz-fit-content !important;
       width: fit-content !important;
       max-width: 100% !important;
       padding: 0 !important;
       margin: clamp(0.15rem, 0.6vw, 0.4rem) 0 !important;
       background: none !important;
       border: none !important;
       box-shadow: none !important;
       flex: 0 0 auto !important;
       align-self: flex-start !important;
   }
   .full-start-new__buttons::-webkit-scrollbar,
   .full-start__buttons::-webkit-scrollbar {
       display: none;
   }

   /* LOGO STYLING (DrXAOS Enhanced) */
   .drxaos-hero-title-has-logo,
   .full-start-new__title.drxaos-has-logo {
       /* Glow removed as requested */
       background: none !important;
       overflow: visible !important;
       position: relative !important;
       z-index: 10 !important;
   }
   /* NUCLEAR LOGO STYLES - BALANCED VERSION */
   html body .drxaos-hero-title-logo,
   html body .drxaos-title-logo,
   img.drxaos-title-logo,
   img.drxaos-hero-title-logo {
       /* SIZE FIX */
       max-height: 150px !important; /* REDUCED to fit buttons */
       max-width: 80% !important; 
       width: auto !important;
       height: auto !important;
       object-fit: contain !important;
       display: block !important;
       margin-bottom: 5px !important; /* REDUCED margin */

       /* UNIVERSAL STYLE: Works for both Dark and Light logos */
       filter: 
           /* 1. Thin Dark Outline: Defines edges of light logos (like "The Boys") */
           drop-shadow(0 1px 0 rgba(0,0,0,0.5))
           drop-shadow(0 -1px 0 rgba(0,0,0,0.5))
           drop-shadow(1px 0 0 rgba(0,0,0,0.5))
           drop-shadow(-1px 0 0 rgba(0,0,0,0.5))

           /* 2. Soft White Glow: Lifts dark logos (like "Predator") off the background */
           drop-shadow(0 0 15px rgba(255,255,255,0.15))
           
           /* 3. Slight Pop */
           brightness(1.05) !important;
       
       -webkit-filter: 
           drop-shadow(0 1px 0 rgba(0,0,0,0.5))
           drop-shadow(0 -1px 0 rgba(0,0,0,0.5))
           drop-shadow(1px 0 0 rgba(0,0,0,0.5))
           drop-shadow(-1px 0 0 rgba(0,0,0,0.5))
           drop-shadow(0 0 15px rgba(255,255,255,0.15))
           brightness(1.05) !important;
       
       opacity: 1 !important;
       transition: none !important;
   }
   
   /* Ensure Logo Styles survive Low-Perf mode on TV */
   body.drxaos-low-perf .drxaos-hero-title-has-logo,
   body.drxaos-low-perf .full-start-new__title.drxaos-has-logo {
       background: none !important;
       overflow: visible !important;
   }
   /* Redundant override for Low-Perf to be absolutely sure */
   body.drxaos-low-perf .drxaos-hero-title-logo,
   body.drxaos-low-perf .drxaos-title-logo {
       filter: 
           drop-shadow(0 1px 0 rgba(0,0,0,0.5))
           drop-shadow(0 -1px 0 rgba(0,0,0,0.5))
           drop-shadow(1px 0 0 rgba(0,0,0,0.5))
           drop-shadow(-1px 0 0 rgba(0,0,0,0.5))
           drop-shadow(0 0 15px rgba(255,255,255,0.15))
           brightness(1.05) !important;
       -webkit-filter: 
           drop-shadow(0 1px 0 rgba(0,0,0,0.5))
           drop-shadow(0 -1px 0 rgba(0,0,0,0.5))
           drop-shadow(1px 0 0 rgba(0,0,0,0.5))
           drop-shadow(-1px 0 0 rgba(0,0,0,0.5))
           drop-shadow(0 0 15px rgba(255,255,255,0.15))
           brightness(1.05) !important;
       opacity: 1 !important;
   }

   /* Full Start Text Color Overrides - Nuclear White */
   html body .full-start__pg,
   html body .full-start__tag,
   html body .full-start-new__tag,
   html body .full-start__status,
   html body .full-start__status.surs_quality,
   html body .full-start-new__details,
   html body .full-start-new__details *,
   html body .full-start-new__reactions,
   html body .full-start-new__reactions *,
   html body .reaction__count,
   html body .full-start__status span,
   html body .full-start__status div {
       color: #ffffff !important;
       -webkit-text-fill-color: #ffffff !important;
       /* Smoother Outline using multiple soft shadows instead of pixelated hard shadow */
       text-shadow: 
           0 0 2px #808080, 
           0 0 1px #808080 !important;
       -webkit-text-stroke: 0 !important;
   }

   /* NUCLEAR BUTTON CLEANUP - ULTIMATE */
   html body .full-start__button,
   html body .drxaos-btn,
   html body .selector,
   html body .view--online,
   html body .view--torrent,
   html body .lampac--button {
       background: transparent !important;
       background-color: transparent !important;
       background-image: none !important;
       border: none !important;
       box-shadow: none !important;
       outline: none !important;
       transition: all 0.3s ease !important;
   }
   
   /* Kill pseudo-elements background if any */
   html body .full-start__button::before,
   html body .full-start__button::after,
   html body .drxaos-btn::before,
   html body .drxaos-btn::after {
       background: transparent !important;
       border: none !important;
       box-shadow: none !important;
   }

   /* Hover State */
   html body .full-start__button:hover,
   html body .drxaos-btn:hover {
       background: var(--theme-primary, #2955b3) !important;
       background-color: var(--theme-primary, #2955b3) !important;
       box-shadow: 0 0 20px rgba(41, 85, 179, 0.6) !important;
       border: none !important;
       transform: none !important; /* FIXED: Disable scale */
       z-index: 100 !important;
       color: #fff !important;
   }

   /* ANDROID TV FIX: Disable :hover styles AND .hover class to prevent phantom focus */
   body.drxaos-android-mobile .full-start__button:hover,
   body.drxaos-android-mobile .drxaos-btn:hover,
   body.drxaos-android-mobile .full-start__button.hover,
   body.drxaos-android-mobile .drxaos-btn.hover {
       background: transparent !important;
       background-color: transparent !important;
       box-shadow: none !important;
       transform: none !important;
       color: var(--text-main, #f8fafc) !important;
   }
   
   html body .full-start__button svg,
   html body .drxaos-btn svg {
       width: 28px !important;
       height: 28px !important;
       filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) !important;
   }

   /* PERFORMANCE OVERRIDES */
   body.drxaos-low-perf .card, 
   body.drxaos-low-perf .card__view,
   body.drxaos-low-perf .drxaos-xu-info,
   body.drxaos-low-perf * {
       backdrop-filter: none !important;
       -webkit-backdrop-filter: none !important;
       box-shadow: none !important;
       filter: none !important;
       transition: none !important; /* Disable animations on low-end */
   }
   body.drxaos-low-perf .card.focus {
       box-shadow: none !important; /* Remove all custom shadows/lines */
       border: none !important;
       outline: none !important;
   }
   
   /* AGGRESSIVE CLEANUP for Shadows/Gradients above/below rows */
   body.drxaos-low-perf .items-line,
   body.drxaos-low-perf .items-line__body,
   body.drxaos-low-perf .items-line__title,
   body.drxaos-low-perf .category-title,
   body.drxaos-low-perf .scroll__content,
   body.drxaos-low-perf .card,
   body.drxaos-low-perf .card__view {
       box-shadow: none !important;
       background-image: none !important;
       text-shadow: none !important;
       mask-image: none !important;
       -webkit-mask-image: none !important;
   }

   body.drxaos-low-perf .items-line::before,
   body.drxaos-low-perf .items-line::after,
   body.drxaos-low-perf .items-line__body::before,
   body.drxaos-low-perf .items-line__body::after,
   body.drxaos-low-perf .scroll__content::before,
   body.drxaos-low-perf .scroll__content::after {
       display: none !important;
       content: none !important;
       background: none !important;
       box-shadow: none !important;
   }
   body.drxaos-low-perf .drxaos-badge-base {
       text-shadow: 1px 1px 0 #000 !important; /* Simple text shadow */
   }

   /* TV CLEANUP: Aggressively remove gradients and darkenings */
   body.drxaos-low-perf .drxaos-hero-panel .drxaos-hero-overlay,
   body.drxaos-low-perf .drxaos-hero-panel .drxaos-hero-content,
   body.drxaos-low-perf .drxaos-hero-panel .drxaos-hero-text {
       background: transparent !important;
       background-image: none !important;
       mask-image: none !important;
       -webkit-mask-image: none !important;
       box-shadow: none !important;
   }
   body.drxaos-low-perf .drxaos-hero-bg {
       mask-image: none !important;
       -webkit-mask-image: none !important;
       /* Ensure image is visible */
       opacity: 1 !important;
   }
   /* Remove pseudo-elements on Hero that might cause darkening */
   body.drxaos-low-perf .drxaos-hero-panel::after,
   body.drxaos-low-perf .drxaos-hero-panel::before,
   body.drxaos-low-perf .drxaos-hero-bg::after,
   body.drxaos-low-perf .drxaos-hero-bg::before,
   body.drxaos-low-perf .drxaos-hero-overlay::after,
   body.drxaos-low-perf .drxaos-hero-overlay::before {
       display: none !important;
       content: none !important;
   }
   
   /* Row Cleanup - Remove darkenings above/below card rows */
   body.drxaos-low-perf .items-line,
   body.drxaos-low-perf .items-line__body,
   body.drxaos-low-perf .scroll__content {
       background: transparent !important;
       box-shadow: none !important;
   }
   /* Remove pseudo-elements on Rows that might be shadows/gradients */
   body.drxaos-low-perf .items-line::after,
   body.drxaos-low-perf .items-line::before,
   body.drxaos-low-perf .items-line__body::after,
   body.drxaos-low-perf .items-line__body::before {
       display: none !important;
       background: none !important;
   }

   /* ANDROID COMPATIBILITY */
@supports (-webkit-appearance: none) {
    .card .card__quality,
    .card .card-quality,
    .card .card__next-episode,
    .card .card__status,
    .card .card__season,
    .card .card__runtime,
    .card .card__country,
    .card .card__year,
    .card .card--content-type {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        backface-visibility: hidden;
    }
}
body.drxaos-madness-mode .activity.drxaos-heroized .card:not(.madness-card):not(.madness-item):not(.madness__item):not([data-madness-card]):not([data-component="madness-card"]) {
    display: none !important;
}
/* В MADNESS РЕЖИМЕ ВСЕ РЯДЫ ДОЛЖНЫ БЫТЬ ВИДИМЫ ДЛЯ ЗАГРУЗКИ */
body.drxaos-madness-mode .items-line {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}
/* В MADNESS РЕЖИМЕ ВСЕ КАРТОЧКИ ДОЛЖНЫ БЫТЬ ВИДИМЫ ДЛЯ ЗАГРУЗКИ */
body.drxaos-madness-mode .card,
body.drxaos-madness-mode .madness-card,
body.drxaos-madness-mode .madness-item,
body.drxaos-madness-mode .madness__item,
body.drxaos-madness-mode [data-madness-card],
body.drxaos-madness-mode [data-component="madness-card"] {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}
/* В MADNESS РЕЖИМЕ ВСЕ ЭЛЕМЕНТЫ КАРТОЧЕК ДОЛЖНЫ БЫТЬ ВИДИМЫ */
body.drxaos-madness-mode .card__view,
body.drxaos-madness-mode .card__poster,
body.drxaos-madness-mode .card__img,
body.drxaos-madness-mode .card__title {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}
/* В MADNESS РЕЖИМЕ КАРТОЧКИ ДОЛЖНЫ БЫТЬ В РЕЖИМЕ RENDER ДЛЯ ЗАГРУЗКИ */
body.drxaos-madness-mode .card {
    opacity: 1 !important;
}
body.drxaos-madness-mode .card.layer--render,
body.drxaos-madness-mode .card__view.layer--render {
    opacity: 1 !important;
    visibility: visible !important;
}
body:not(.drxaos-madness-mode) .madness-card,
body:not(.drxaos-madness-mode) .madness-item,
body:not(.drxaos-madness-mode) .madness__item,
body:not(.drxaos-madness-mode) [data-madness-card],
body:not(.drxaos-madness-mode) [data-component="madness-card"] {
    display: none !important;
}
body.drxaos-xuyampishe-active .activity.drxaos-heroized .card:not(.card--wide):not(.madness-card):not(.madness-item):not(.madness__item):not([data-madness-card]):not([data-component="madness-card"]) {
    display: none !important;
}

/* УДАЛЕНИЕ ФОНОВ И ЗОЛОТОЙ ТЕКСТ ДЛЯ ВСЕХ ПЛАШЕК */
body .card .card__quality,
body .card .card-quality,
body .card .card__next-episode,
body .card .card-next-episode,
body .card .card__status,
body .card .card__season,
body .card .card__runtime,
body .card .card__country,
body .card .card--country,
body .card .card__year,
body .card .card--year,
body .card .card--content-type,
body .card .card__rate,
body .card .card__vote,
body .card .card__age,
body .card.card--wide .card__quality,
body .card.card--wide .card-quality,
body .card.card--wide .card__next-episode,
body .card.card--wide .card__status,
body .card.card--wide .card__season,
body .card.card--wide .card__runtime,
body .card.card--wide .card__country,
body .card.card--wide .card__year,
body .card.card--wide .card--content-type,
body .card.card--wide .card__rate,
body .card.card--wide .card__vote,
body .card.card--wide .card__age,
body .layer--visible .card__quality,
body .layer--render .card__quality,
body .selector .card__quality,
body .card__type,
body .card--content-type,
body .card--country,
body .card--season-progress,
body .card--season-complete,
body .card-quality,
body .card-quality.camrip,
body .card-next-episode {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: 0 !important;
    border-color: transparent !important;
    color: #FFD700 !important;
    font-weight: 700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}

body .card .card__year,
body .card .card__date,
body .card .card__country,
body .card .card__season,
body .card .card__status,
body .card .card__age,
body .card .card-age,
body .card .year,
body .card [class*="year"]:not(.card--year):not(.drxaos-badge-base),
body .card [data-type="year"],
body .card [data-role="year"] {
    display: none !important;
}

:root { --drx-row-lift: 0px; }
body.drx-row-lift .items-line:first-of-type {
    transform: translateY(var(--drx-row-lift));
    will-change: transform;
}
body.drx-row-lift .items-line:first-of-type .card,
body.drx-row-lift .items-line:first-of-type .card__view,
body.drx-row-lift .items-line:first-of-type .card__title {
    overflow: visible !important;
}

/* ANDROID MOBILE - УБИРАЕМ ФОН У ПЛАШЕК */
body.drxaos-android-mobile .card .card__quality,
body.drxaos-android-mobile .card .card-quality,
body.drxaos-android-mobile .card .card__next-episode,
body.drxaos-android-mobile .card .card-next-episode,
body.drxaos-android-mobile .card .card__status,
body.drxaos-android-mobile .card .card__season,
body.drxaos-android-mobile .card .card__runtime,
body.drxaos-android-mobile .card .card__country,
body.drxaos-android-mobile .card .card--country,
body.drxaos-android-mobile .card .card__year,
body.drxaos-android-mobile .card .card--year,
body.drxaos-android-mobile .card .card--content-type,
body.drxaos-android-mobile .card .card__rate,
body.drxaos-android-mobile .card .card__vote,
body.drxaos-android-mobile .card .card__age {
    background: none !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: 0 !important;
    border-color: transparent !important;
}

body.drxaos-xuyampishe-active {
    --drxaos-xu-hero-base-height: 100vh;
    --drxaos-xu-hero-height: 100vh;
    --drxaos-xu-hero-top: 0px;
}

body.drxaos-xuyampishe-active .drxaos-xu-container {
    position: relative;
    overflow: visible;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide {
    width: 18.4em;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .card-more__box {
    width: 18.4em !important;
    padding-bottom: 95% !important;
    padding: 0 calc(var(--drxaos-card-badge-inset) / 2) !important;
    border-radius: var(--drxaos-card-radius, 0.5em) !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    filter: none !important;
    -webkit-filter: none !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide + .card-more .card-more__box {
    width: 18.4em !important;
    padding-bottom: 95% !important;
    padding: 0 !important;
    border-radius: var(--drxaos-card-radius, 0.5em) !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    filter: none !important;
    -webkit-filter: none !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .card-more {
    width: 18.4em !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide .card-watched {
    display: none !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide .card__view {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
}

body.drxaos-xuyampishe-active .drxaos-xu-background,
body.drxaos-xuyampishe-active .drxaos-xu-overlay {
    pointer-events: none;
}

body.drxaos-xuyampishe-active .drxaos-xu-background {
    position: fixed;
    left: 0;
    right: 0;
    top: var(--drxaos-xu-hero-top);
    height: var(--drxaos-xu-hero-height);
    width: 100%;
    object-fit: cover;
    object-position: center top;
    background-color: transparent;
    opacity: 1 !important;
    transition: none !important;
    pointer-events: none;
    z-index: -1;
    mask-image: none !important;
    -webkit-mask-image: none !important;
    filter: none !important;
    -webkit-filter: none !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-background.loaded {
    background-color: transparent;
    box-shadow: none;
    opacity: 1 !important;
    mask-image: none !important;
    -webkit-mask-image: none !important;
}

/* Полностью убираем любые затемнения hero-панели */
body.drxaos-xuyampishe-active .drxaos-hero-panel,
body.drxaos-xuyampishe-active .drxaos-hero-overlay,
body.drxaos-xuyampishe-active .drxaos-hero-panel::after,
body.drxaos-xuyampishe-active .drxaos-hero-bg::after,
body.drxaos-xuyampishe-active .drxaos-hero-overlay::after {
    background: none !important;
    background-image: none !important;
    box-shadow: none !important;
    mask-image: none !important;
    -webkit-mask-image: none !important;
}
/* Ensure BG image is visible but without gradients */
body.drxaos-xuyampishe-active .drxaos-hero-bg {
    background-color: transparent !important;
    box-shadow: none !important;
    opacity: 1 !important;
    filter: none !important;
    -webkit-filter: none !important;
    mask-image: none !important;
    -webkit-mask-image: none !important;
}
body.drxaos-xuyampishe-active .drxaos-hero-overlay {
    display: none !important;
}
/* Remove darkening below card rows */
body.drxaos-xuyampishe-active .items-line,
body.drxaos-xuyampishe-active .items-line__body,
body.drxaos-xuyampishe-active .items-line::after,
body.drxaos-xuyampishe-active .items-line__body::after,
body.drxaos-xuyampishe-active .scroll__content::after {
    background: none !important;
    box-shadow: none !important;
    mask-image: none !important;
    -webkit-mask-image: none !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-overlay {
    display: none !important;
    background: none !important;
    background-image: none !important;
    box-shadow: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
}
/* Force remove any pseudo elements on container that might cause darkening */
body.drxaos-xuyampishe-active .drxaos-xu-container::before,
body.drxaos-xuyampishe-active .drxaos-xu-container::after {
    display: none !important;
    content: none !important;
    background: none !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-overlay {
    position: fixed;
    left: 0;
    right: 0;
    top: var(--drxaos-xu-hero-top);
    height: var(--drxaos-xu-hero-height);
    pointer-events: none;
    background: none;
    z-index: 0;
}

body.drxaos-xuyampishe-active .drxaos-xu-info {
    position: relative;
    padding: clamp(18px, 2.8vh, 24px) clamp(20px, 4vw, 64px) clamp(24px, 3.2vh, 42px);
    min-height: clamp(300px, 32vw, 460px);
    z-index: 2;
    margin-bottom: clamp(8px, 1.6vh, 18px);
    overflow: hidden;
}

body.drxaos-xuyampishe-active .drxaos-xu-info__body {
    width: clamp(280px, 78%, 880px);
    padding-top: clamp(8px, 1.6vh, 18px);
}

body.drxaos-xuyampishe-active .drxaos-xu-info__meta {
    color: rgba(255, 255, 255, 0.65);
    margin-bottom: clamp(10px, 1.8vh, 20px);
    font-size: clamp(1.05em, 2.4vh, 1.35em);
    min-height: 1em;
    display: inline-flex !important;
    width: auto !important;
    flex-wrap: wrap !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-info__meta span {
    color: #fff;
}

body.drxaos-xuyampishe-active .drxaos-xu-info__title {
    font-size: clamp(2.2em, 4.5vw, 3.6em);
    font-weight: 600;
    margin-bottom: clamp(12px, 2vh, 18px);
    min-height: clamp(72px, 10vh, 140px);
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.25;
}

body.drxaos-xuyampishe-active .drxaos-xu-info__title.drxaos-hero-title-has-logo {
    font-size: 0;
    line-height: 0;
    min-height: clamp(72px, 10vh, 140px);
    display: flex;
    align-items: flex-end;
}

body.drxaos-xuyampishe-active .drxaos-xu-info__title img {
    max-height: clamp(56px, 10vh, 128px);
    width: auto;
    object-fit: contain;
    display: block;
}

body.drxaos-xuyampishe-active .drxaos-xu-info__tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6em;
    margin-bottom: clamp(10px, 2vh, 20px);
    font-size: 1.05em;
}
body.drxaos-xuyampishe-active .drxaos-xu-info__tags .drxaos-hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    padding: 0.25em 0.85em;
    border-radius: 999px;
    font-weight: 600;
    letter-spacing: 0.01em;
    transition: none;
    border: 1px solid transparent;
}
body.drxaos-xuyampishe-active .drxaos-xu-info__tags .drxaos-hero-tag-quality {
    background: linear-gradient(135deg, rgba(12, 12, 16, 0.92), rgba(40, 40, 48, 0.92));
    border-color: rgba(255, 214, 94, 0.42);
    color: #ffd369;
}
body.drxaos-xuyampishe-active .drxaos-xu-info__tags .drxaos-hero-tag-quality--camrip,
body.drxaos-xuyampishe-active .drxaos-xu-info__tags .drxaos-hero-tag-quality--missing {
    background: linear-gradient(135deg, rgba(229, 57, 53, 0.95), rgba(211, 47, 47, 0.95));
    border-color: rgba(255, 205, 210, 0.65);
    color: #fff;
}
body.drxaos-xuyampishe-active .drxaos-xu-info__tags .drxaos-hero-tag-season {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(59, 130, 246, 0.95));
    border-color: rgba(191, 219, 254, 0.72);
    color: #f8fafc;
}
body.drxaos-xuyampishe-active .drxaos-xu-info__tags .drxaos-hero-tag-season--complete {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
    border-color: rgba(187, 247, 208, 0.72);
}
body.drxaos-xuyampishe-active .drxaos-xu-info__tags .drxaos-hero-tag-next {
    background: linear-gradient(135deg, rgba(255, 112, 67, 0.95), rgba(255, 64, 129, 0.95));
    border-color: rgba(255, 205, 178, 0.75);
    color: #fff;
}

body.drxaos-xuyampishe-active .drxaos-xu-info__tag,
body.drxaos-xuyampishe-active .drxaos-xu-info__meta.drxaos-hero-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    padding: 0.2em 0.75em;
    border-radius: 999px;
    background: #000000;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    font-weight: 600;
    letter-spacing: 0.01em;
    color: #fff;
}

body.drxaos-xuyampishe-active .items-line__head {
    display: flex;
    align-items: center;
    gap: clamp(8px, 1.2vw, 16px);
    margin-bottom: clamp(20px, 2.8vh, 36px);
    position: relative;
    z-index: 3;
    padding-top: clamp(6px, 1vh, 14px);
}
body.drxaos-xuyampishe-active .activity.drxaos-heroized .items-line {
    /* display: none !important; DISABLED for native scrolling */
}
body.drxaos-xuyampishe-active .activity.drxaos-heroized .items-line.drxaos-line-active {
    display: block !important;
}
body.full-screen.drxaos-xuyampishe-active .activity.drxaos-heroized .items-line {
    /* display: none !important; DISABLED for native scrolling */
}
body.full-screen.drxaos-xuyampishe-active .activity.drxaos-heroized .items-line.drxaos-line-active {
    display: block !important;
}

body.drxaos-xuyampishe-active .items-line__head svg {
    flex: 0 0 auto;
}

body.drxaos-xuyampishe-active .items-line__title {
    margin: 0;
}

body.drxaos-xuyampishe-active .card__quality,
body.drxaos-xuyampishe-active .card__type,
body.drxaos-xuyampishe-active .card__country,
body.drxaos-xuyampishe-active .card__badge,
body.drxaos-xuyampishe-active .card-quality,
body.drxaos-xuyampishe-active .card__next-episode,
body.drxaos-xuyampishe-active .card__episode-date {
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    display: flex !important;
    align-items: center;
}

body.drxaos-xuyampishe-active .head,
body.drxaos-xuyampishe-active .head__body {
    background: transparent !important;
    box-shadow: none !important;
    pointer-events: auto !important; /* FIXED */
    z-index: 15 !important; /* FIXED: Above content (10), below modals */
}
body.drxaos-xuyampishe-active .head__container,
body.drxaos-xuyampishe-active .head__gradient {
    background: transparent !important;
    box-shadow: none !important;
    pointer-events: none !important;
    z-index: 15 !important;
}
body.drxaos-xuyampishe-active .head__body.focus,
body.drxaos-xuyampishe-active .head.focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    transform: none !important;
}
body.drxaos-xuyampishe-active .head__body > *,
body.drxaos-xuyampishe-active .head > * {
    pointer-events: auto !important;
}

/* УДАЛЕНЫ ВСЕ ПРАВИЛА ДЛЯ HEAD - ВОЗВРАЩАЕМ К СТАНДАРТНОМУ ПОВЕДЕНИЮ */
body.drxaos-xuyampishe-active .drxaos-xu-background {
    z-index: -1 !important;
    pointer-events: none !important;
}
body.drxaos-xuyampishe-active .drxaos-xu-overlay {
    z-index: 0 !important;
    pointer-events: none !important;
}
/* КАРТОЧКИ ДОЛЖНЫ БЫТЬ ВЫШЕ OVERLAY, ЧТОБЫ НЕ БЫЛИ ТУСКЛЫМИ */
body.drxaos-xuyampishe-active .drxaos-xu-container .card,
body.drxaos-xuyampishe-active .drxaos-xu-container .items-line,
body.drxaos-xuyampishe-active .drxaos-xu-container .items-line__body {
    position: relative !important;
    z-index: 10 !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-card-title {
    margin-top: 0.65em;
    font-size: 1.08em;
    font-weight: 600;
    color: #fff;
    text-align: left;
    max-width: 100%;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.35;
    pointer-events: none;
}

body.drxaos-xuyampishe-active .drxaos-hero-title {
    font-size: clamp(1.2em, 2.5vw, 2em) !important;
    font-weight: 600 !important;
    letter-spacing: 0.01em;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-wrap: break-word;
    word-break: break-word;
}

body.drxaos-xuyampishe-active .drxaos-hero-title.drxaos-hero-title-has-logo {
    font-size: 0 !important;
    line-height: 0 !important;
    display: block !important;
    overflow: visible !important;
    -webkit-line-clamp: unset !important;
    line-clamp: unset !important;
    -webkit-box-orient: unset !important;
}

body.drxaos-xuyampishe-active .drxaos-hero-title.drxaos-hero-title-has-logo img {
    max-height: clamp(110px, 16vh, 220px);
    width: auto;
    object-fit: contain;
    display: block;
}

body.light--version.drxaos-xuyampishe-active .drxaos-xu-card-title {
    color: #111;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .card-watched {
    display: none !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-container .card__promo {
    display: none;
}

body.advanced--animation:not(.no--animation).drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide.focus .card__view,
body.advanced--animation:not(.no--animation).drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide.hover .card__view {
    animation: none !important;
}

body.advanced--animation:not(.no--animation).drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide.animate-trigger-enter .card__view {
    animation: none !important;
}

@media (max-width: 1600px) {
    body.drxaos-xuyampishe-active .drxaos-xu-info__body {
        width: 72%;
    }
}

@media (max-width: 1280px) {
    body.drxaos-xuyampishe-active .drxaos-xu-info__body {
        width: 100%;
    }
}


/* УДАЛЕНИЕ ФОНА ДЛЯ РЕЙТИНГА */
.card__vote,
.card--vote,
.card .card__vote,
.card__vote.drxaos-badge-visible,
.card__vote.show {
    background: none !important;
    background-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}
/* ПОЛНОЕ УДАЛЕНИЕ РАМКИ ДЛЯ РЕЙТИНГА */
.card__vote,
.card--vote,
.card .card__vote,
.card__vote.drxaos-badge-visible,
.card__vote.show,
.card__vote.drxaos-badge-visible.show {
    border: none !important;
    border-color: transparent !important;
    border-width: 0 !important;
    border-style: none !important;
    outline: none !important;
    box-shadow: none !important;
}


/* ЗОЛОТОЙ ТЕКСТ ДЛЯ РЕЙТИНГА */
.card__vote,
.card--vote,
.card .card__vote {
    color: #FFD700 !important;
    font-weight: 700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}

/* ВОССТАНОВЛЕНИЕ И СТИЛИЗАЦИЯ СЕЗОНОВ */
.card-seasons,
.card__season,
.card--season,
.card .card-seasons,
.card .card__season {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    background: none !important;
    background-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    /* Золотой текст с черной обводкой как у других плашек */
    color: #FFD700 !important;
    font-weight: 700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}





/* ========================================================= */
/* ANDROID MOBILE FIX - МИНИМАЛЬНЫЕ ПРАВИЛА                  */
/* ========================================================= */
/* УДАЛЕНО: Все агрессивные CSS правила убраны чтобы не ломать базовый интерфейс */

/* УВЕЛИЧЕНИЕ ШИРИНЫ КАРТОЧЕК В ОБЫЧНОМ РЕЖИМЕ ДЛЯ ТВ */
@media (min-width: 1280px) {
    body:not(.drxaos-xuyampishe-active) .card:not(.card--small):not(.card--category):not(.card--collection):not(.card--radio):not(.card--explorer) {
        width: 15.5em !important;
        min-width: 15.5em !important;
    }
    body:not(.drxaos-xuyampishe-active) .items-cards .card:not(.card--small):not(.card--category):not(.card--collection):not(.card--radio):not(.card--explorer) {
        width: 15.5em !important;
        min-width: 15.5em !important;
    }
}

/* ИСПРАВЛЕНИЕ ВИДИМОСТИ КАРТОЧЕК В MADNESS РЕЖИМЕ НА ТВ */
/* УНИВЕРСАЛЬНОЕ ПРАВИЛО ДЛЯ ПОДНЯТИЯ ПЕРВОГО РЯДА - РАБОТАЕТ ВЕЗДЕ */


@media (min-width: 1280px) {
    body.drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide {
        margin-bottom: clamp(20px, 2.5vh, 40px) !important;
    }
    body.drxaos-xuyampishe-active .drxaos-xu-container .card.card--wide .card__view {
        min-height: auto !important;
        overflow: visible !important;
    }
    body.drxaos-xuyampishe-active .drxaos-xu-card-title {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        display: block !important;
        -webkit-line-clamp: unset !important;
        line-clamp: unset !important;
    }
    body.drxaos-xuyampishe-active .drxaos-xu-container .items-line__body {
        padding-bottom: clamp(40px, 5vh, 80px) !important;
    }
    /* ПОДНЯТИЕ ПЕРВОГО РЯДА КАРТОЧЕК В КАЖДОМ РАЗДЕЛЕ НА ТВ */
    
}

/* ПОДНЯТИЕ ПЕРВОГО РЯДА КАРТОЧЕК В КАЖДОМ РАЗДЕЛЕ НА ТВ - ДОПОЛНИТЕЛЬНОЕ ПРАВИЛО ДЛЯ ТВ УСТРОЙСТВ С ПУЛЬТОМ */
@media (min-width: 1280px) and (hover: none) and (pointer: coarse) {
    
    body.drxaos-xuyampishe-active .drxaos-xu-container .items-line:first-of-type .card,
    body.drxaos-xuyampishe-active .drxaos-xu-container .items-line:first-of-type .card__view,
    body.drxaos-xuyampishe-active .drxaos-xu-container .items-line:first-of-type .card__title,
    body.drxaos-xuyampishe-active .items-cards > .items-line:first-of-type .card,
    body.drxaos-xuyampishe-active .items-cards > .items-line:first-of-type .card__view,
    body.drxaos-xuyampishe-active .items-cards > .items-line:first-of-type .card__title,
    body.drxaos-xuyampishe-active .scroll-line > .items-line:first-of-type .card,
    body.drxaos-xuyampishe-active .scroll-line > .items-line:first-of-type .card__view,
    body.drxaos-xuyampishe-active .scroll-line > .items-line:first-of-type .card__title,
    body.drxaos-xuyampishe-active .items-line__body > .items-line:first-of-type .card,
    body.drxaos-xuyampishe-active .items-line__body > .items-line:first-of-type .card__view,
    body.drxaos-xuyampishe-active .items-line__body > .items-line:first-of-type .card__title {
        overflow: visible !important;
    }
}


/* УМЕНЬШЕНИЕ full-person__photo - МАЛЕНЬКИЙ КРУГ */
body.drxaos-xuyampishe-active .full-person__photo {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    min-height: 30px !important;
    max-width: 30px !important;
    max-height: 30px !important;
    flex-shrink: 0 !important;
}

body.drxaos-xuyampishe-active .full-person__photo svg {
    width: 18px !important;
    height: 18px !important;
}


/* КОНТЕЙНЕР РЯДОВ ВЫШЕ HERO */
body.drxaos-xuyampishe-active .drxaos-xu-container {
    position: relative !important;
    z-index: 10 !important;
}

body.drxaos-xuyampishe-active .items-cards {
    position: relative !important;
    z-index: 10 !important;
}


/* ЗАПРЕТИТЬ АВТОФОКУС НА КНОПКЕ СМЕНЫ ТЕМ */
body.drxaos-xuyampishe-active .drxaos-xu-theme-button {
    pointer-events: auto !important;
}

body.drxaos-xuyampishe-active .drxaos-xu-theme-button:focus {
    outline: none !important;
}

/* Убираем автофокус через CSS */
body.drxaos-xuyampishe-active .drxaos-xu-theme-button:not(:hover):not(:active) {
    opacity: 0.7 !important;
}


/* ФИКСАЦИЯ РАЗМЕРА ПАНЕЛИ КНОПОК */
body.drxaos-xuyampishe-active .full-start-new__buttons,
body.drxaos-xuyampishe-active .drxaos-buttons-unwrapped {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    gap: 1em !important;
    min-height: 60px !important;
    font-size: 1em !important;
    padding: 10px !important;
    width: auto !important;
    max-width: 100% !important;
}

/* ФИКСАЦИЯ РАЗМЕРА КНОПОК ВНУТРИ (КРУГЛЫЕ) */
body.drxaos-xuyampishe-active .full-start-new__buttons .drxaos-btn,
body.drxaos-xuyampishe-active .full-start-new__buttons .full-start__button {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-direction: column !important;
    width: 65px !important;
    height: 65px !important;
    min-width: 65px !important;
    min-height: 65px !important;
    max-width: 65px !important;
    max-height: 65px !important;
    padding: 8px !important;
    font-size: 0.8em !important;
    gap: 4px !important;
    border-radius: 50% !important;
}

/* SVG ИКОНКИ КНОПОК */
body.drxaos-xuyampishe-active .full-start-new__buttons svg {
    width: 26px !important;
    height: 26px !important;
    min-width: 26px !important;
    min-height: 26px !important;
    flex-shrink: 0 !important;
}

/* ТЕКСТ КНОПОК */
body.drxaos-xuyampishe-active .full-start-new__buttons span {
    font-size: 0.7em !important;
    white-space: normal !important;
    text-align: center !important;
    line-height: 1.1 !important;
    max-width: 100% !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

/* SVG LOADER ДЛЯ MODAL-LOADING */
.modal-loading {
    background: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 viewBox%3D%220 0 300 150%22%3E%3Cpath fill%3D%22none%22 stroke%3D%22%23FF156D%22 stroke-width%3D%2215%22 stroke-linecap%3D%22round%22 stroke-dasharray%3D%22300 385%22 stroke-dashoffset%3D%220%22 d%3D%22M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z%22%3E%3Canimate attributeName%3D%22stroke-dashoffset%22 calcMode%3D%22spline%22 dur%3D%222%22 values%3D%22685%3B-685%22 keySplines%3D%220 0 1 1%22 repeatCount%3D%22indefinite%22%3E%3C/animate%3E%3C/path%3E%3C/svg%3E') no-repeat center center !important;
    background-size: contain !important;
    width: 80px !important;
    height: 40px !important;
    margin: 0 auto !important;
}

.modal-pending__loading {
    background: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 viewBox%3D%220 0 300 150%22%3E%3Cpath fill%3D%22none%22 stroke%3D%22%23FF156D%22 stroke-width%3D%2215%22 stroke-linecap%3D%22round%22 stroke-dasharray%3D%22300 385%22 stroke-dashoffset%3D%220%22 d%3D%22M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z%22%3E%3Canimate attributeName%3D%22stroke-dashoffset%22 calcMode%3D%22spline%22 dur%3D%222%22 values%3D%22685%3B-685%22 keySplines%3D%220 0 1 1%22 repeatCount%3D%22indefinite%22%3E%3C/animate%3E%3C/path%3E%3C/svg%3E') no-repeat center center !important;
    background-size: contain !important;
    width: 80px !important;
    height: 40px !important;
    margin: 0 auto !important;
}

/* QUALITY BADGES (HDR / DV / Sound / DUB) */
.drxaos-quality-badges {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin-left: 0.6em;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    vertical-align: middle;
}
.drxaos-quality-badges.show {
    opacity: 1;
    transform: translateY(0);
}
.drxaos-quality-badge {
    display: inline-flex;
    height: 0.8em;
}
.drxaos-quality-badge svg {
    height: 100%;
    width: auto;
    display: block;
}
.drxaos-quality-badge--res svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}
.drxaos-quality-badge--dv svg,
.drxaos-quality-badge--hdr svg,
.drxaos-quality-badge--sound svg,
.drxaos-quality-badge--dub svg {
    color: rgba(255, 255, 255, 0.85);
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

`;



    /*
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                                                                              ║
    ║                        🎨 DRXAOS THEMES PLUGIN 🎨                           ║
    ║                     SOOPER 2025 Style for Lampa&Lampac                      ║
    ║                                                                              ║
    ║  ┌────────────────────────────────────────────────────────────────────────┐  ║
    ║  │  💎 9 PREMIUM THEMES | ⚡ OPTIMIZED | 🎬 TMDB INTEGRATION             │  ║
    ║  └────────────────────────────────────────────────────────────────────────┘  ║
    ║                                                                              ║
    ║  Автор: DrXAOS                                                               ║
    ║  Версия: 2.6 (ATV Performance Optimized)                      
║ 
║ ⚡ PERFORMANCE OPTIMIZATIONS (v2.4):
║    • Removed all backdrop-filter: blur() (25 instances)
║    • Simplified all box-shadow effects
║    • Fixed transparency at 99.5% for all elements
║    • Optimized transitions (transform, opacity only)
║    • Added GPU acceleration (translateZ, will-change)
║    • Removed heavy pseudo-elements
║    • Faster animations (0.15s)
║    • Perfect for Android TV, Fire TV, Google TV
║║
    ║                                                                              ║
    ║                                                                              ║
    ║  ┌────────────────────────────────────────────────────────────────────────┐ ║
    ║  │  💰 ПОДДЕРЖКА РАЗРАБОТЧИКА / SUPPORT THE DEVELOPER                     │ ║
    ║  │                                                                         │ ║
    ║  │  🇷🇺 Если вам нравится плагин и вы хотите поблагодарить копейкой:         │ ║
    ║  │  🇺🇦 Якщо вам подобається плагін і ви хочете подякувати копійчиною:       │ ║
    ║  │  🇬🇧 If you like the plugin and want to say thanks:                       │ ║
    ║  │                                                                         │ ║
    ║  │  💳 USDT (TRC-20):  TBLUWM16Eiufc6GLJaMGxaFy7oTBiDgar8                    ║
    ║  │                                                                           ║ 
    ║  │                                                                         │ ║
    ║  │  🙏 Каждый донат мотивирует на дальнейшую разработку!                 │  ║
    ║  │  🙏 Кожен донат мотивує на подальший розвиток!                         │  ║
    ║  │  🙏 Every donation motivates further development!                      │  ║
    ║  └────────────────────────────────────────────────────────────────────────┘  ║
    ║                                                                              ║
    ║  Спасибо за использование! / Дякую за використання! / Thank you for using!   ║
    ║                                                                              ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    */

var CONFIG = {
        PLUGIN_NAME: 'drxaos_themes',
        VERSION: '2.7.0',
        AUTHOR: 'DrXAOS',
        LAMPA_MIN_VERSION: 305,
        LAMPA_3_SUPPORT: true,
        API: {
            TMDB_URL: 'https://api.themoviedb.org/3',
            JACRED_URL: 'https://sync.jacred.stream'
        },
        PERFORMANCE: {
            DEBOUNCE_DELAY: 0,
            THROTTLE_LIMIT: 0,
            MUTATION_THROTTLE: 0
        },
        NETWORK: {
            TIMEOUT_MS: 10000,
            RETRY_DELAY_MS: 900
        },
        FEATURES: {
            TMDB_INTEGRATION: true,
            JACRED_INTEGRATION: true,
            TRACKS_FIX: true,
            MUTATION_OBSERVER: true,
            UTILITIES_BUTTON: true
        },
        DEBUG: false,
        VERBOSE_LOGGING: false
    };
    CONFIG.FEATURES.UTILITIES_BUTTON = drxaosIsUtilitiesEnabled();
    var DEFAULT_FONT_STACK = "'Netflix Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
    var FONT_PRESETS = [
        { key: 'netflix', label: 'Netflix', stack: DEFAULT_FONT_STACK, href: null },
        { key: 'inter', label: 'Inter', stack: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap&subset=latin,cyrillic' },
        { key: 'roboto', label: 'Roboto', stack: "'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap&subset=latin,cyrillic' },
        { key: 'open_sans', label: 'Open Sans', stack: "'Open Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap&subset=latin,cyrillic' },
        { key: 'pt_sans', label: 'PT Sans', stack: "'PT Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap&subset=latin,cyrillic' },
        { key: 'manrope', label: 'Manrope', stack: "'Manrope', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap&subset=latin,cyrillic' },
        { key: 'rubik', label: 'Rubik', stack: "'Rubik', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap&subset=latin,cyrillic' },
        { key: 'montserrat', label: 'Montserrat', stack: "'Montserrat', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap&subset=latin,cyrillic' },
        { key: 'source_sans', label: 'Source Sans 3', stack: "'Source Sans 3', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;900&display=swap&subset=latin,cyrillic' },
        { key: 'nunito_sans', label: 'Nunito Sans', stack: "'Nunito Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap&subset=latin,cyrillic' }
    ];
    var FONT_PRESET_MAP = FONT_PRESETS.reduce(function(acc, preset) {
        acc[preset.key] = preset;
        return acc;
    }, {});
    var FONT_OPTIONS = FONT_PRESETS.reduce(function(acc, preset) {
        acc[preset.key] = preset.label;
        return acc;
    }, {});
    var drxaosFontLoadErrorNotified = false;
    var DRXAOS_BADGE_OPTIONS = [
        {
            key: 'quality',
            labelKey: 'drxaos_badge_quality',
            descriptionKey: 'drxaos_badge_quality_desc',
            default: 'on',
            selectors: ['.card-quality', '.card__quality', '[data-drxaos-badge="quality"]']
        },
        {
            key: 'status',
            labelKey: 'drxaos_badge_status',
            descriptionKey: 'drxaos_badge_status_desc',
            default: 'on',
            selectors: ['.card-next-episode', '.card__next-episode', '.card__episode-date', '[data-drxaos-badge="next-episode"]']
        },
        {
            key: 'season',
            labelKey: 'drxaos_badge_season',
            descriptionKey: 'drxaos_badge_season_desc',
            default: 'on',
            selectors: ['.card--season-progress', '.card--season-complete', '.card__seasons', '.card-seasons']
        },
        {
            key: 'type',
            labelKey: 'drxaos_badge_type',
            descriptionKey: 'drxaos_badge_type_desc',
            default: 'on',
            selectors: ['.card--content-type', '.card__type']
        },
        {
            key: 'country',
            labelKey: 'drxaos_badge_country',
            descriptionKey: 'drxaos_badge_country_desc',
            default: 'on',
            selectors: ['.card--country', '.card__country']
        },
        {
            key: 'year',
            labelKey: 'drxaos_badge_year',
            descriptionKey: 'drxaos_badge_year_desc',
            default: 'on',
            selectors: ['.card--year', '.card__year', '.card__date', '.card-year', '.card__release-year', '.year']
        }
    ];
    var DRXAOS_BADGE_LOOKUP = DRXAOS_BADGE_OPTIONS.reduce(function(acc, badge) {
        acc[badge.key] = badge;
        return acc;
    }, {});
    function drxaosBadgeStorageKey(key) {
        return 'drxaos_badge_' + key;
    }
    function drxaosGetBadgeSelectors(key, fallbackSelectors) {
        var option = DRXAOS_BADGE_LOOKUP[key];
        var selectors = option && Array.isArray(option.selectors) ? option.selectors.slice() : [];
        if ((!selectors || selectors.length === 0) && Array.isArray(fallbackSelectors)) {
            selectors = fallbackSelectors.slice();
        }
        return selectors;
    }
    var DRXAOS_SECTION_LABELS = {
        sport: ['спорт', 'sport', 'sports'],
        continue: ['продолжить просмотр', 'continue watching', 'continue', 'продолжить'],
        recommend: ['рекомендуем посмотреть', 'recommended', 'recommend', 'recommendations']
    };
    var DRXAOS_SECTION_STATE = {
        key: '',
        label: '',
        action: '',
        checkedAt: 0
    };
    function drxaosNormalizeSectionLabel(str) {
        return (str || '').toString().replace(/\s+/g, ' ').trim().toLowerCase();
    }
    function drxaosResolveSectionKey(action, label) {
        var normalizedAction = (action || '').toString().trim().toLowerCase();
        if (normalizedAction) {
            if (normalizedAction === 'sport' || normalizedAction === 'sports') return 'sport';
            if (normalizedAction.indexOf('continue') === 0) return 'continue';
            if (normalizedAction.indexOf('recommend') === 0) return 'recommend';
        }
        var normalizedLabel = drxaosNormalizeSectionLabel(label);
        if (!normalizedLabel) return '';
        for (var key in DRXAOS_SECTION_LABELS) {
            if (!DRXAOS_SECTION_LABELS.hasOwnProperty(key)) continue;
            if (DRXAOS_SECTION_LABELS[key].indexOf(normalizedLabel) !== -1) {
                return key;
            }
        }
        return '';
    }
    function drxaosCollectSectionCandidates() {
        var candidates = [];
        function pushCandidate(node, explicitLabel) {
            if (!node) return;
            var label = explicitLabel != null ? explicitLabel : (node.textContent || node.getAttribute && node.getAttribute('title') || '');
            var action = (node.dataset && (node.dataset.action || node.dataset.section || node.dataset.type)) || '';
            candidates.push({label: label, action: action});
        }
        try {
            var focusedMenu = document.querySelector('.menu__item.selector.focus, .menu__item.selector.active');
            if (focusedMenu) {
                var textNode = focusedMenu.querySelector('.menu__text');
                pushCandidate(focusedMenu, textNode ? textNode.textContent : focusedMenu.textContent);
            }
            var headTitle = document.querySelector('.head__title');
            if (headTitle) pushCandidate(headTitle, headTitle.textContent);
            var activityTitle = document.querySelector('.activity__title, .activity__head .title');
            if (activityTitle) pushCandidate(activityTitle, activityTitle.textContent);
        } catch (err) {
        }
        return candidates;
    }
    function drxaosFindActiveSection() {
        var candidates = drxaosCollectSectionCandidates();
        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i];
            var key = drxaosResolveSectionKey(candidate.action, candidate.label);
            if (key) {
                return {
                    key: key,
                    label: drxaosNormalizeSectionLabel(candidate.label),
                    action: (candidate.action || '').toString().trim().toLowerCase()
                };
            }
        }
        return { key: '', label: '', action: '' };
    }
    function drxaosUpdateSectionState(force) {
        var now = Date.now();
        if (!force && now - DRXAOS_SECTION_STATE.checkedAt < 400) {
            return DRXAOS_SECTION_STATE;
        }
        var section = drxaosFindActiveSection();
        DRXAOS_SECTION_STATE = {
            key: section.key || '',
            label: section.label || '',
            action: section.action || '',
            checkedAt: now
        };
        if (document.body && document.body.classList) {
            document.body.classList.toggle('drxaos-sport-mode', DRXAOS_SECTION_STATE.key === 'sport');
        }
        return DRXAOS_SECTION_STATE;
    }
    function drxaosIsSportSectionActive() {
        return drxaosUpdateSectionState().key === 'sport';
    }
    function drxaosIsBadgeEnabled(key) {
        if (drxaosIsSportSectionActive()) return false;
        var option = DRXAOS_BADGE_LOOKUP[key];
        if (!option) return true;
        var current = drxaosSafeGet(drxaosBadgeStorageKey(key), option.default || 'on');
        return (current || 'on') !== 'off';
    }
    function drxaosEnsureBadgeDefaults() {
        if (!window.Lampa || !Lampa.Storage) return;
        DRXAOS_BADGE_OPTIONS.forEach(function(option) {
            var storageKey = drxaosBadgeStorageKey(option.key);
            var existing = Lampa.Storage.get(storageKey);
            if (existing == null) {
                drxaosSafeSet(storageKey, option.default || 'on');
            }
        });
    }
    function drxaosRemoveBadgeNodes(root, selectors) {
        if (!root || !selectors) return;
        selectors.forEach(function(selector) {
            try {
                var nodes = root.querySelectorAll(selector);
                nodes.forEach(function(node) {
                    node.remove();
                });
            } catch (err) {
            }
        });
    }
    function drxaosSyncCardBadgeState(cardElement) {
        if (!cardElement || cardElement.nodeType !== 1) return;
        DRXAOS_BADGE_OPTIONS.forEach(function(option) {
            if (!option.selectors) return;
            if (drxaosIsBadgeEnabled(option.key)) return;
            drxaosRemoveBadgeNodes(cardElement, option.selectors);
            if (option.key === 'quality') {
                if (cardElement.dataset) {
                    cardElement.dataset.drxaosQualityStatus = 'disabled';
                    delete cardElement.dataset.drxaosQualityPendingSince;
                }
            }
            if (option.key === 'status') {
                if (cardElement.dataset) {
                    cardElement.dataset.drxaosNextEpisodeStatus = 'disabled';
                    delete cardElement.dataset.drxaosNextEpisodePendingSince;
                }
            }
        });
    }
    function drxaosApplyBadgeSettings() {
        try {
            var cards = document.querySelectorAll('.card, .madness-card, .madness-item, .madness__item, [data-madness-card], [data-component="madness-card"]');
            cards.forEach(drxaosSyncCardBadgeState);
        } catch (err) {
            
        }
        try {
            applySeasonInfo();
        } catch (applyErr) {
            
        }
        if (typeof drxaosScheduleProcessAllCards === 'function') {
            drxaosScheduleProcessAllCards(0);
        } else if (typeof window.drxaosProcessAllCards === 'function') {
            window.drxaosProcessAllCards();
        }
    }
    function drxaosHandleBadgeSettingChange() {
        drxaosApplyBadgeSettings();
    }
    function debounce(func, wait) {
        return function() {
            var context = this, args = arguments;
                func.apply(context, args);
        };
    }
    function throttle(func, limit) {
        return function() {
            var args = arguments;
            var context = this;
                func.apply(context, args);
        };
    }
    function log(message, data) {
        // Логирование отключено
    }
    var logError = function(message, error) {
        // Логирование ошибок отключено
    };
    window.logError = logError;
    window.drxaosPostDefaultsQueue = window.drxaosPostDefaultsQueue || [];
    function scheduleDrxaosApplyAll() {
        if (typeof window.drxaosScheduleApply === 'function') {
            try {
                window.drxaosScheduleApply();
            } catch (e) {
                
            }
        }
    }
    function drxaosGetCardDataStorage() {
        return DRXAOS_CARD_DATA_STORAGE;
    }
    function drxaosNormalizeKeyValue(value) {
        if (value === undefined || value === null) return '';
        return String(value).trim();
    }
    function drxaosExtractYearFromValue(value) {
        var normalized = drxaosNormalizeKeyValue(value);
        if (!normalized) return '';
        var match = normalized.match(/(\d{4})/);
        return match ? match[1] : '';
    }
    function drxaosPushKey(keys, prefix, value) {
        var normalized = drxaosNormalizeKeyValue(value);
        if (!normalized) return;
        var key = prefix + ':' + normalized.toLowerCase();
        if (keys.indexOf(key) === -1) {
            keys.push(key);
        }
    }
    function drxaosCollectCardKeys(cardElement, cardData) {
        var keys = [];
        if (!cardElement) return keys;
        var dataset = cardElement.dataset || {};
        function attr(name) {
            return cardElement.getAttribute ? cardElement.getAttribute(name) : null;
        }
        var idCandidates = [
            dataset.id,
            dataset.cardId,
            dataset.cardID,
            dataset.movieId,
            dataset.tvId,
            dataset.sourceId,
            dataset.lampaId,
            attr('data-id'),
            attr('data-card-id'),
            attr('data-cardID'),
            attr('data-movie-id'),
            attr('data-tv-id'),
            attr('data-source-id'),
            attr('data-lampa-id')
        ];
        idCandidates.forEach(function(candidate) {
            drxaosPushKey(keys, 'id', candidate);
        });
        var tmdbCandidates = [
            dataset.tmdbId,
            dataset.tmdb,
            attr('data-tmdb-id'),
            attr('data-tmdb')
        ];
        tmdbCandidates.forEach(function(candidate) {
            drxaosPushKey(keys, 'tmdb', candidate);
        });
        if (cardData) {
            drxaosPushKey(keys, 'id', cardData.id);
            drxaosPushKey(keys, 'id', cardData.card_id || cardData.cardId);
            drxaosPushKey(keys, 'tmdb', cardData.tmdb_id || cardData.tmdbId);
            drxaosPushKey(keys, 'imdb', cardData.imdb_id || cardData.imdbId);
            drxaosPushKey(keys, 'slug', cardData.slug);
        }
        var title = (cardData && (cardData.title || cardData.name)) ||
                    dataset.title ||
                    dataset.name ||
                    attr('data-title') ||
                    attr('data-name');
        if (!title && cardElement.querySelector) {
            var titleNode = cardElement.querySelector('.card__title, .card-title, .title, .card__name, .name');
            if (titleNode) {
                title = drxaosNormalizeKeyValue(titleNode.textContent);
            }
        }
        if (title) {
            drxaosPushKey(keys, 'title', title);
            var yearCandidate = (cardData && (cardData.year || cardData.release_date || cardData.first_air_date)) ||
                                dataset.year ||
                                dataset.releaseYear ||
                                dataset.releaseDate ||
                                attr('data-year') ||
                                attr('data-release-year') ||
                                attr('data-release-date');
            if (!yearCandidate && cardElement.querySelector) {
                var yearNode = cardElement.querySelector('.card__year, .year, .card__date, .date');
                if (yearNode) {
                    var yearMatch = yearNode.textContent.match(/(\d{4})/);
                    if (yearMatch) yearCandidate = yearMatch[1];
                }
            }
            var year = drxaosExtractYearFromValue(yearCandidate);
            if (year) {
                drxaosPushKey(keys, 'title-year', title + '|' + year);
            }
        }
        return keys;
    }
    function drxaosFirstAvailable() {
        for (var i = 0; i < arguments.length; i++) {
            var candidate = arguments[i];
            if (Array.isArray(candidate)) {
                for (var j = 0; j < candidate.length; j++) {
                    var valueFromArray = drxaosNormalizeKeyValue(candidate[j]);
                    if (valueFromArray) return valueFromArray;
                }
            } else {
                var normalized = drxaosNormalizeKeyValue(candidate);
                if (normalized) return normalized;
            }
        }
        return '';
    }
    function drxaosRememberCardData(cardElement, cardData) {
        if (!cardElement || !cardData) return;
        try {
            var clone = Object.assign({}, cardData);
            if (cardData.payload && typeof cardData.payload === 'object') {
                clone.payload = cardData.payload;
            }
            var keys = drxaosCollectCardKeys(cardElement, cardData);
            if (!keys.length) return;
            keys.forEach(function(key) {
                DRXAOS_CARD_DATA_INDEX.set(key, clone);
            });
        } catch (err) {
            
        }
    }
    function drxaosLookupCardData(cardElement) {
        if (!cardElement) return null;
        try {
            var keys = drxaosCollectCardKeys(cardElement);
            for (var i = 0; i < keys.length; i++) {
                var stored = DRXAOS_CARD_DATA_INDEX.get(keys[i]);
                if (stored) {
                    return Object.assign({}, stored);
                }
            }
        } catch (err) {
            
        }
        return null;
    }
    function drxaosSyncMadnessMode() {
        try {
            if (!document || !document.body) return;
            var hasMadnessCards = document.querySelector('.madness-card, .madness-item, .madness__item, [data-madness-card], [data-component="madness-card"]');
            var hasItemsLine = document.querySelector('.items-line');
            var wasMadness = document.body.classList.contains('drxaos-madness-mode');
            var shouldBeMadness = hasMadnessCards || (hasItemsLine && document.querySelector('.items-cards, .scroll-line'));
            if (shouldBeMadness) {
                document.body.classList.add('drxaos-madness-mode');
                if (!wasMadness) {
                    if (typeof drxaosScheduleProcessAllCards === 'function') {
                        drxaosScheduleProcessAllCards(0);
                    }
                }
            } else {
                document.body.classList.remove('drxaos-madness-mode');
            }
        } catch (err) {
            if (typeof logError === 'function') {
                
            }
        }
    }
    window.drxaosSyncMadnessMode = drxaosSyncMadnessMode;
    function drxaosFetchCardCountries(tmdbId, mediaType) {
        return new Promise(function(resolve) {
            if (!tmdbId || !window.Lampa || !Lampa.TMDB) {
                resolve([]);
                return;
            }
            var tmdbKey = (drxaosSafeGet('tmdb_api_key', undefined) || BUILTIN_TMDB_KEY || '').trim();
            if (!tmdbKey) {
                resolve([]);
                return;
            }
            var type = (mediaType && String(mediaType).toLowerCase() === 'tv') ? 'tv' : 'movie';
            var query = type + '/' + tmdbId + '?language=en-US&api_key=' + tmdbKey;
            var url = Lampa.TMDB.api(query);
            fetch(url).then(function(response) {
                if (!response || !response.ok) {
                    return null;
                }
                return response.json();
            }).then(function(data) {
                if (!data) {
                    resolve([]);
                    return;
                }
                var result = [];
                if (Array.isArray(data.production_countries)) {
                    data.production_countries.forEach(function(item) {
                        if (!item) return;
                        if (item.iso_3166_1) {
                            result.push(String(item.iso_3166_1).trim().toUpperCase());
                        } else if (item.name) {
                            result.push(String(item.name).trim());
                        }
                    });
                }
                if (!result.length && Array.isArray(data.origin_country)) {
                    data.origin_country.forEach(function(code) {
                        if (!code) return;
                        result.push(String(code).trim().toUpperCase());
                    });
                }
                resolve(result.filter(Boolean));
            }).catch(function() {
                resolve([]);
            });
        });
    }
    function drxaosScheduleCountryFetch(cardElement, tmdbId, mediaType) {
        if (!tmdbId) return Promise.resolve([]);
        var type = (mediaType && String(mediaType).toLowerCase() === 'tv') ? 'tv' : 'movie';
        var cacheKey = type + '_' + tmdbId;
        if (DRXAOS_COUNTRY_CACHE.hasOwnProperty(cacheKey)) {
            return Promise.resolve(DRXAOS_COUNTRY_CACHE[cacheKey]);
        }
        if (!DRXAOS_COUNTRY_PENDING[cacheKey]) {
            DRXAOS_COUNTRY_PENDING[cacheKey] = drxaosFetchCardCountries(tmdbId, type).then(function(list) {
                DRXAOS_COUNTRY_CACHE[cacheKey] = Array.isArray(list) ? list : [];
                return DRXAOS_COUNTRY_CACHE[cacheKey];
            }).catch(function() {
                DRXAOS_COUNTRY_CACHE[cacheKey] = [];
                return DRXAOS_COUNTRY_CACHE[cacheKey];
            }).finally(function() {
                delete DRXAOS_COUNTRY_PENDING[cacheKey];
            });
        }
        return DRXAOS_COUNTRY_PENDING[cacheKey];
    }
    function drxaosIsXuyampisheEnabled() {
        return drxaosSafeGet('drxaos_xuyampishe', 'off') === 'on';
    }
    function drxaosUsingMakerXuyampishe() {
        if (!drxaosIsXuyampisheEnabled()) return false;
        if (!drxaosXuyampisheInterface || typeof drxaosXuyampisheInterface.isMakerEnvironment !== 'function') return false;
        try {
            return !!drxaosXuyampisheInterface.isMakerEnvironment();
        } catch (e) {
            return false;
        }
    }
    function ensureXuyampisheStyle() {
        styleManager.setStyle(XUYAMPISHE_STYLE_ID, XUYAMPISHE_CORE_CSS);
    }
    var DRXAOS_INT_INTERFACE_STYLE_ID = 'drxaos-int-interface-style';
    function drxaosGetIntInterfaceWideStyles() {
        return `
            .items-line__title .full-person__photo {
                width: 1.8em !important;
                height: 1.8em !important;
            }
            .items-line__title .full-person--svg .full-person__photo {
                padding: 0.5em !important;
                margin-right: 0.5em !important;
            }
            .items-line__title .full-person__photo {
                margin-right: 0.5em !important;
            }
            .items-line {
                padding-bottom: 4em !important;
            }
            .new-interface-info__head,
            .new-interface-info__details {
                opacity: 0;
                transition: opacity 0.5s ease;
                min-height: 2.2em !important;
            }
            .new-interface-info__head.visible,
            .new-interface-info__details.visible {
                opacity: 1;
            }
            .new-interface .card.card--wide {
                width: 18.3em;
            }
            .new-interface .card.card--small {
                width: 18.3em;
            }
            .new-interface-info {
                position: relative;
                padding: 1.5em;
                height: 27.5em;
            }
            .new-interface-info__body {
                position: absolute;
                z-index: 9999999;
                width: 80%;
                padding-top: 1.1em;
            }
            .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6);
                font-size: 1.3em;
                min-height: 1em;
            }
            .new-interface-info__head span {
                color: #fff;
            }
            .new-interface-info__title {
                font-size: 4em;
                font-weight: 600;
                margin-bottom: 0.3em;
                overflow: hidden;
                -o-text-overflow: '.';
                text-overflow: '.';
                display: -webkit-box;
                -webkit-line-clamp: 1;
                line-clamp: 1;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                line-height: 1.3;
            }
            .new-interface-info__details {
                margin-bottom: 1.6em;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                min-height: 1.9em;
                font-size: 1.3em;
            }
            .new-interface-info__split {
                margin: 0 1em;
                font-size: 0.7em;
            }
            .new-interface-info__description {
                font-size: 1.4em;
                font-weight: 310;
                line-height: 1.3;
                overflow: hidden;
                -o-text-overflow: '.';
                text-overflow: '.';
                display: -webkit-box;
                -webkit-line-clamp: 3;
                line-clamp: 3;
                -webkit-box-orient: vertical;
                width: 65%;
            }
            .new-interface .card-more__box {
                padding-bottom: 95%;
            }
            .new-interface .full-start__background-wrapper {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
            }
            .new-interface .full-start__background {
                position: absolute;
                height: 108%;
                width: 100%;
                top: -5em;
                left: 0;
                opacity: 0;
                object-fit: cover;
                transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .new-interface .full-start__background.active {
                opacity: 1;
            }
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
            }
            .new-interface .card__promo {
                display: none;
            }
            .new-interface .card.card--wide + .card-more .card-more__box {
                padding-bottom: 95%;
            }
            .new-interface .card.card--wide .card-watched {
                display: none !important;
            }
            body.light--version .new-interface-info__body {
                position: absolute;
                z-index: 9999999;
                width: 69%;
                padding-top: 1.5em;
            }
            body.light--version .new-interface-info {
                height: 25.3em;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.focus .card__view {
                animation: animation-card-focus 0.2s;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.animate-trigger-enter .card__view {
                animation: animation-trigger-enter 0.2s forwards;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.focus .card__view {
                animation: animation-card-focus 0.2s;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.animate-trigger-enter .card__view {
                animation: animation-trigger-enter 0.2s forwards;
            }
            .logo-moved-head {
                transition: opacity 0.4s ease;
            }
            .logo-moved-separator {
                transition: opacity 0.4s ease;
            }
            .new-interface .card .card__age,
            .new-interface .card .card__title {
                display: none !important;
            }
        `;
    }
    function drxaosGetIntInterfaceSmallStyles() {
        return `
            .new-interface-info__head,
            .new-interface-info__details {
                opacity: 0;
                transition: opacity 0.5s ease;
                min-height: 2.2em !important;
            }
            .new-interface-info__head.visible,
            .new-interface-info__details.visible {
                opacity: 1;
            }
            .new-interface .card.card--wide {
                width: 18.3em;
            }
            .items-line__title .full-person__photo {
                width: 1.8em !important;
                height: 1.8em !important;
            }
            .items-line__title .full-person--svg .full-person__photo {
                padding: 0.5em !important;
                margin-right: 0.5em !important;
            }
            .items-line__title .full-person__photo {
                margin-right: 0.5em !important;
            }
            .card .card__age,
            .card .card__title {
                display: none !important;
            }
            .new-interface-info {
                position: relative;
                padding: 1.5em;
                height: 19.8em;
            }
            .new-interface-info__body {
                position: absolute;
                z-index: 9999999;
                width: 80%;
                padding-top: 0.2em;
            }
            .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 0.3em;
                font-size: 1.2em;
                min-height: 1em;
            }
            .new-interface-info__head span {
                color: #fff;
            }
            .new-interface-info__title {
                font-size: 3em;
                font-weight: 600;
                margin-bottom: 0.2em;
                overflow: hidden;
                -o-text-overflow: '.';
                text-overflow: '.';
                display: -webkit-box;
                -webkit-line-clamp: 1;
                line-clamp: 1;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                line-height: 1.3;
            }
            .new-interface-info__details {
                margin-bottom: 1.6em;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                min-height: 1.9em;
                font-size: 1.2em;
            }
            .new-interface-info__split {
                margin: 0 1em;
                font-size: 0.7em;
            }
            .new-interface-info__description {
                font-size: 1.3em;
                font-weight: 310;
                line-height: 1.3;
                overflow: hidden;
                -o-text-overflow: '.';
                text-overflow: '.';
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                width: 70%;
            }
            .new-interface .card-more__box {
                padding-bottom: 150%;
            }
            .new-interface .full-start__background-wrapper {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
            }
            .new-interface .full-start__background {
                position: absolute;
                height: 108%;
                width: 100%;
                top: -5em;
                left: 0;
                opacity: 0;
                object-fit: cover;
                transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .new-interface .full-start__background.active {
                opacity: 1;
            }
            .new-interface .full-start__rate {
                font-size: 1.2em;
                margin-right: 0;
            }
            .new-interface .card__promo {
                display: none;
            }
            .new-interface .card.card--wide + .card-more .card-more__box {
                padding-bottom: 95%;
            }
            .new-interface .card.card--wide .card-watched {
                display: none !important;
            }
            body.light--version .new-interface-info__body {
                position: absolute;
                z-index: 9999999;
                width: 69%;
                padding-top: 1.5em;
            }
            body.light--version .new-interface-info {
                height: 25.3em;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.focus .card__view {
                animation: animation-card-focus 0.2s;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.animate-trigger-enter .card__view {
                animation: animation-trigger-enter 0.2s forwards;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.focus .card__view {
                animation: animation-card-focus 0.2s;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.animate-trigger-enter .card__view {
                animation: animation-trigger-enter 0.2s forwards;
            }
            .logo-moved-head {
                transition: opacity 0.4s ease;
            }
            .logo-moved-separator {
                transition: opacity 0.4s ease;
            }
            .new-interface .card .card__age,
            .new-interface .card .card__title {
                display: none !important;
            }
        `;
    }
    function drxaosGetIntInterfaceStyles() {
        var wide = true;
        try {
            if (window.Lampa && Lampa.Storage) {
                wide = Lampa.Storage.get('wide_post') !== false;
            }
        } catch (e) {}
        return wide ? drxaosGetIntInterfaceWideStyles() : drxaosGetIntInterfaceSmallStyles();
    }
    function drxaosEnsureIntInterfaceStyle() {
        try {
            var head = document.head || document.getElementsByTagName('head')[0];
            if (!head) return;
            var css = drxaosGetIntInterfaceStyles();
            var styleEl = document.getElementById(DRXAOS_INT_INTERFACE_STYLE_ID);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = DRXAOS_INT_INTERFACE_STYLE_ID;
                head.appendChild(styleEl);
            }
            if (styleEl.textContent !== css) {
                styleEl.textContent = css;
            }
        } catch (e) {}
    }
    function drxaosRemoveIntInterfaceStyle() {
        try {
            var styleEl = document.getElementById(DRXAOS_INT_INTERFACE_STYLE_ID);
            if (styleEl && styleEl.parentNode) {
                styleEl.parentNode.removeChild(styleEl);
            }
        } catch (e) {}
    }
    function removeXuyampisheStyle() {
        styleManager.removeStyle(XUYAMPISHE_STYLE_ID);
    }
    function drxaosUpdateHeadOffset() {
        var head = document.querySelector('.head');
        var height = head ? head.offsetHeight || 0 : 0;
        document.documentElement.style.setProperty('--drxaos-head-offset', height + 'px');
    }

    
    


    function drxaosAdjustFirstRow() {
        var content = document.querySelector('.content') || document.body;
        var firstLine = content.querySelector('.items-line');
        if (!firstLine) return;

        var vh = window.innerHeight || document.documentElement.clientHeight;
        var rect = firstLine.getBoundingClientRect();
        var overflow = Math.max(0, Math.ceil(rect.bottom - vh + 8));
        var lift = overflow > 0 ? -Math.min(overflow, 160) : 0;

        document.documentElement.style.setProperty('--drx-row-lift', lift + 'px');
        if (lift !== 0) {
            document.body.classList.add('drx-row-lift');
        } else {
            document.body.classList.remove('drx-row-lift');
        }
    }

    function drxaosRunRowAdjust() {
        drxaosAdjustFirstRow();
    }

    if (document.readyState === 'complete') {
        drxaosUpdateHeadOffset();
        drxaosRunRowAdjust();
    } else {
        window.addEventListener('load', function() {
            drxaosUpdateHeadOffset();
            drxaosRunRowAdjust();
        }, { once: true });
    }
    window.addEventListener('resize', drxaosUpdateHeadOffset);
    window.addEventListener('orientationchange', drxaosUpdateHeadOffset);
    function drxaosGetRowNav(activity) {
        if (!activity) return null;
        return activity.querySelector('.drxaos-row-nav');
    }
    function drxaosEnsureRowNav(activity) {
        if (drxaosUsingMakerXuyampishe()) return null;
        if (!activity || !drxaosIsXuyampisheEnabled()) return null;
        var nav = drxaosGetRowNav(activity);
        if (nav) return nav;
        var host = activity.querySelector('.activity__body') || activity;
        if (!host) return null;
        nav = document.createElement('div');
        nav.className = 'drxaos-row-nav drxaos-row-nav--hidden';
        nav.innerHTML = '<div class="drxaos-row-nav__inner"></div>';
        host.appendChild(nav);
        var handleEvent = function(evt) {
            if (!drxaosIsXuyampisheEnabled()) return;
            var trigger = evt.target && evt.target.closest ? evt.target.closest('.drxaos-row-nav__item') : null;
            if (!trigger) return;
            evt.preventDefault();
            drxaosHandleRowNavSelection(activity, trigger.dataset.drxaosLineIndex);
        };
        nav.addEventListener('click', handleEvent);
        nav.addEventListener('keydown', function(evt) {
            var key = evt.key || evt.code;
            if (key !== 'Enter' && key !== ' ' && key !== 'Spacebar') return;
            handleEvent(evt);
        });
        return nav;
    }
    function drxaosHandleRowNavSelection(activity, idx) {
        if (!activity) return;
        var index = parseInt(idx, 10);
        if (isNaN(index)) return;
        var lines = drxaosIndexLines(activity);
        if (!lines.length || index < 0 || index >= lines.length) return;
        drxaosSetActiveLine(activity, lines[index]);
    }
    function drxaosGetLineTitle(line, idx) {
        if (!line) return 'Раздел ' + (idx + 1);
        if (line.dataset && line.dataset.drxaosLineTitle) {
            return line.dataset.drxaosLineTitle;
        }
        var title = '';
        var titleNode = line.querySelector('.items-line__title');
        if (titleNode) title = (titleNode.textContent || '').trim();
        if (!title && line.dataset && line.dataset.title) title = line.dataset.title.trim();
        if (!title) title = 'Раздел ' + (idx + 1);
        if (line.dataset) line.dataset.drxaosLineTitle = title;
        return title;
    }
    function drxaosUpdateRowNav(activity, lines) {
        if (!activity || !drxaosIsXuyampisheEnabled()) return;
        if (!Array.isArray(lines) || !lines.length) {
            var nav = drxaosGetRowNav(activity);
            if (nav) nav.classList.add('drxaos-row-nav--hidden');
            return;
        }
        var navElement = drxaosEnsureRowNav(activity);
        if (!navElement) return;
        var inner = navElement.querySelector('.drxaos-row-nav__inner');
        if (!inner) return;
        var activeIdx = parseInt(activity.dataset.drxaosActiveLineIndex || '0', 10);
        if (isNaN(activeIdx)) activeIdx = 0;
        var fragment = document.createDocumentFragment();
        lines.forEach(function(line, idx) {
            var label = drxaosGetLineTitle(line, idx);
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'drxaos-row-nav__item' + (idx === activeIdx ? ' active' : '');
            btn.dataset.drxaosLineIndex = line.dataset.drxaosLineIndex || String(idx);
            btn.setAttribute('tabindex', '0');
            btn.textContent = label;
            fragment.appendChild(btn);
        });
        inner.textContent = '';
        inner.appendChild(fragment);
        navElement.classList.toggle('drxaos-row-nav--hidden', lines.length <= 1);
        drxaosScrollRowNavToActive(navElement);
    }
    function drxaosHighlightRowNav(activity) {
        if (!drxaosIsContentControllerActive()) return;
        var nav = drxaosGetRowNav(activity);
        if (!nav) return;
        var activeIdx = parseInt(activity.dataset.drxaosActiveLineIndex || '0', 10);
        if (isNaN(activeIdx)) activeIdx = 0;
        var buttons = nav.querySelectorAll('.drxaos-row-nav__item');
        buttons.forEach(function(button) {
            var idx = parseInt(button.dataset.drxaosLineIndex || '0', 10);
            button.classList.toggle('active', idx === activeIdx);
        });
        drxaosScrollRowNavToActive(nav);
    }
    function drxaosScrollRowNavToActive(nav) {
        if (!nav) return;
        var active = nav.querySelector('.drxaos-row-nav__item.active');
        if (!active || typeof active.scrollIntoView !== 'function') return;

        try {
            active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
        } catch (err) {
            // active.scrollIntoView(); // DISABLED: Fallback might be too aggressive
        }
    }
    function drxaosSafeRevealBadge(element) {
        if (!element) return;
        if (typeof revealBadge === 'function') {
            try {
                revealBadge(element);
                return;
            } catch (err) {
                
            }
        }
        element.classList.add('drxaos-badge-visible', 'show');
        element.style.display = 'inline-flex';
        element.style.removeProperty('opacity');
        element.style.opacity = '1';
    }
    window.drxaosSafeRevealBadge = drxaosSafeRevealBadge;
function drxaosResolveCardElement(element) {
    if (!element) return null;
    if (element.classList && element.classList.contains('card')) {
        return element;
    }
    if (typeof element.closest === 'function') {
        var closestCard = element.closest('.card');
        if (closestCard) {
            return closestCard;
        }
    }
    if (element.querySelector) {
        var nestedCard = element.querySelector('.card');
        if (nestedCard) {
            return nestedCard;
        }
    }
    return element;
}
function ensureBadgeHost(cardElement) {
    if (!cardElement) return null;
    var selectors = [
        '.madness-card__poster',
        '.madness-card__image',
        '.madness-card',
        '.madness-item__poster',
        '.madness-item',
        '.madness__poster',
        '.madness__image',
        '.card__view',
        '.card__poster',
        '.card__image',
        '.card-poster',
        '.poster',
        '.card-image',
        '.card__media',
        '.card__cover',
        '.card__thumb',
        '.card__art',
        '.card__background',
        '.poster-card__image',
        '.media-card__poster'
    ];
    var host = null;
    for (var i = 0; i < selectors.length; i++) {
        host = cardElement.querySelector(selectors[i]);
        if (host) break;
    }
    if (!host) {
        var img = cardElement.querySelector('img');
        if (img && img.parentElement) {
            host = img.parentElement;
        }
    }
    if (!host) host = cardElement;
    try {
        var computed = window.getComputedStyle(host);
        if (computed && computed.position === 'static') {
            host.style.position = 'relative';
        }
    } catch (e) {
    }
    return host;
}
function drxaosAttachBadge(cardElement, badgeElement) {
    if (!cardElement || !badgeElement) return null;
    var host = ensureBadgeHost(cardElement);
    if (!host) return null;
    if (badgeElement.parentNode !== host) {
        host.appendChild(badgeElement);
    }
    return host;
}
window.drxaosAttachBadge = drxaosAttachBadge;
function drxaosEnsureBottomBadgeRow(cardElement) {
    var host = ensureBadgeHost(cardElement);
    if (!host) return null;
    var row = host.querySelector('.drxaos-badge-bottom-row');
    if (!row) {
        row = document.createElement('div');
        row.className = 'drxaos-badge-bottom-row';
        host.appendChild(row);
    }
    return row;
}
function extractInlineQuality(payload, cardElement) {
    var values = [];
    function push(value) {
        if (typeof value === 'string' && value.trim()) {
            values.push(value.trim());
        }
    }
    if (payload && typeof payload === 'object') {
        ['quality', 'source_quality', 'release_quality', 'video_quality', 'media_quality', 'label_quality', 'primary_quality'].forEach(function(key) {
            push(payload[key]);
        });
        if (payload.info && typeof payload.info === 'object') {
            ['quality', 'source_quality', 'release_quality'].forEach(function(key) {
                push(payload.info[key]);
            });
        }
        if (payload.extra && typeof payload.extra === 'object') {
            ['quality', 'label', 'tag'].forEach(function(key) {
                push(payload.extra[key]);
            });
        }
        if (payload.card && typeof payload.card === 'object') {
            push(payload.card.quality);
        }
        if (payload.release && typeof payload.release === 'object') {
            push(payload.release.quality);
        }
        if (payload.video && typeof payload.video === 'object') {
            push(payload.video.quality);
        }
        if (payload.media && typeof payload.media === 'object') {
            push(payload.media.quality);
        }
        if (Array.isArray(payload.qualities) && payload.qualities.length) {
            push(payload.qualities[0]);
        }
        if (payload.quality && typeof payload.quality === 'object') {
            Object.keys(payload.quality).forEach(function(key) {
                push(payload.quality[key]);
            });
        }
    }
    if (cardElement) {
        var dataset = cardElement.dataset || {};
        [
            cardElement.getAttribute('data-quality'),
            cardElement.getAttribute('data-release-quality'),
            dataset.quality,
            dataset.releaseQuality,
            dataset.labelQuality,
            dataset.videoQuality
        ].forEach(push);
    }
    return values.find(function(v) { return v; }) || '';
}
function applyQualityBadge(element, qualityText) {
    if (!element) return;
    var value = (qualityText || '').toString().trim();
    if (!value) {
        element.textContent = '-';
        element.classList.remove('camrip');
        element.style.color = '#fde8e8';
        element.style.background = '#ef4444';
        element.style.borderColor = '#ef4444';
        drxaosSafeRevealBadge(element);
        element.dataset.drxaosQualityStatus = 'missing';
        return;
    }
    var normalized = value.toUpperCase();
    element.textContent = normalized;
    var isCam = /\b(CAM|TS|TELE|TELESYNC|TELECINE|TC|SCREENER|SCR|HDTS)\b/.test(normalized);
    if (isCam) {
        element.style.color = '#fde8e8';
        element.style.background = '#ef4444';
        element.style.borderColor = '#ef4444';
        element.classList.add('camrip');
    } else {
        element.style.color = '#ffd369';
        element.style.background = '#000000';
        element.style.borderColor = '#000000';
        element.classList.remove('camrip');
    }
    drxaosSafeRevealBadge(element);
    element.dataset.drxaosQualityStatus = 'success';
}
function showUnknownQualityBadge(element) {
    if (!element) return;
    element.textContent = '-';
    element.classList.remove('camrip');
    element.style.color = '#fde8e8';
    element.style.background = '#ef4444';
    element.style.borderColor = '#ef4444';
    drxaosSafeRevealBadge(element);
    element.dataset.drxaosQualityStatus = 'missing';
    }
    function drxaosHandleLinesMutation(mutations) {
        if (!drxaosIsXuyampisheEnabled() || drxaosUsingMakerXuyampishe()) return;
        
        // GLOBAL FIX: Do not run any layout logic during mutations if scrolling
        // Only run if we are "idle" from a navigation perspective.
        // But even then, MutationObserver fires too often.
        // We should probably rely ONLY on resize/orientation/navigation events for layout updates.
        // drxaosSyncMadnessMode(); // DISABLED: This was causing layout thrashing on scroll.
    }
    window.drxaosLinesHandler = drxaosHandleLinesMutation;
    function drxaosIsMadnessMode() {
        try {
            return document.body && document.body.classList.contains('drxaos-madness-mode');
        } catch (e) {
            return false;
        }
    }
    function drxaosIndexLines(activity) {
        if (drxaosUsingMakerXuyampishe()) {
            return activity ? [].slice.call(activity.querySelectorAll('.items-line')) : [];
        }
        if (!activity) return [];
        var lines = [].slice.call(activity.querySelectorAll('.items-line'));
        var isMadness = drxaosIsMadnessMode();
        lines.forEach(function(line, idx) {
            line.dataset.drxaosLineIndex = idx;
            // DISABLED: Do not force display property, let Lampa handle virtualization
            // line.style.display = '';
        });
        if (activity.classList && activity.classList.contains('drxaos-heroized')) {
            drxaosUpdateRowNav(activity, lines);
        }
        return lines;
    }
    function drxaosEnsureActiveLine(activity) {
        if (drxaosUsingMakerXuyampishe()) return;
        if (drxaosIsMadnessMode()) return;
        // Safety: Don't touch lines if we are in Menu/Head to prevent focus stealing
        if (!drxaosIsContentControllerActive()) return;
        if (!activity) return;
        var lines = drxaosIndexLines(activity);
        if (!lines.length) return;
        var current = activity.querySelector('.items-line.drxaos-line-active');
        if (current) {
            var activeLines = activity.querySelectorAll('.items-line.drxaos-line-active');
            if (activeLines.length > 1) {
                activeLines.forEach(function(lineEl, idx) {
                    if (idx > 0) {
                        lineEl.classList.remove('drxaos-line-active');
                        // lineEl.style.display = 'none'; // DISABLED: Keep lines visible for native scroll
                    } else {
                        lineEl.style.display = '';
                    }
                });
            }
            activity.dataset.drxaosActiveLineIndex = current.dataset.drxaosLineIndex || '0';
            // drxaosHighlightRowNav(activity); // DISABLED: Prevents nav scrolling during auto-activation
            drxaosSyncLineVisibility(activity, current);
            return;
        }
        var idx = parseInt(activity.dataset.drxaosActiveLineIndex || '0', 10);
        if (isNaN(idx)) idx = 0;
        idx = Math.min(Math.max(idx, 0), lines.length - 1);
        drxaosSetActiveLine(activity, lines[idx]);
    }
    function drxaosSyncLineVisibility(activity, activeLine) {
        return;
    }
    function drxaosSetActiveLine(activity, line) {
        if (drxaosUsingMakerXuyampishe()) return;
        if (drxaosIsMadnessMode()) return;
        // Safety: Don't touch lines if we are in Menu/Head
        if (!drxaosIsContentControllerActive()) return;
        if (!activity || !line) return;
        var lines = drxaosIndexLines(activity);
        var current = activity.querySelectorAll('.items-line.drxaos-line-active');
        if (current && current.length) {
            current.forEach(function(item) {
                if (item === line) return;
                item.classList.remove('drxaos-line-active');
                item.style.display = '';
            });
        }
        if (line.classList.contains('drxaos-line-active') && line.style.display !== 'none') {
            return;
        }
        line.classList.add('drxaos-line-active');
        line.style.display = '';
        if (Array.isArray(lines) && lines.length) {
            lines.forEach(function(item) {
                if (item === line) return;
                item.classList.remove('drxaos-line-active');
                item.style.display = '';
            });
        }
        activity.dataset.drxaosActiveLineIndex = line.dataset.drxaosLineIndex || '0';
        drxaosPreloadLine(line);
        // drxaosHighlightRowNav(activity); // DISABLED: Prevents nav scrolling during auto-activation
    }
    function drxaosSwitchLine(activity, direction) {
        if (drxaosUsingMakerXuyampishe()) return;
        if (drxaosIsMadnessMode()) return;
        if (!activity) return;
        var lines = drxaosIndexLines(activity);
        if (!lines.length) return;
        var current = activity.querySelector('.items-line.drxaos-line-active');
        var idx = current ? parseInt(current.dataset.drxaosLineIndex || '0', 10) : 0;
        if (isNaN(idx)) idx = 0;
        var next = (idx + direction + lines.length) % lines.length;
        drxaosSetActiveLine(activity, lines[next]);
    }
    function drxaosBindActivityWheel(activity) {
        // DISABLED: Native scrolling is preferred. Wheel hijacking causes phantom focus and UX issues.
        return; 
    }
    function drxaosUnbindActivityWheel(activity) {
        if (!activity || !activity.__drxaosWheelHandler) return;
        activity.removeEventListener('wheel', activity.__drxaosWheelHandler);
        delete activity.__drxaosWheelHandler;
    }
    function drxaosPreloadLine(line) {
        if (!line || line.dataset.drxaosPreloaded === '1') return;
        var scroll = line.querySelector('.items-line__body .scroll');
        if (!scroll) return;
        line.dataset.drxaosPreloaded = '1';
        /*
        var iterations = 0;
        var lastCount = -1;
        function pump() {
            iterations += 1;
            var cards = line.querySelectorAll('.card').length;
            if (cards === lastCount || iterations > 15) {
                scroll.scrollLeft = 0;
                return;
            }
            lastCount = cards;
            var prev = scroll.scrollLeft;
            scroll.scrollLeft = scroll.scrollWidth;
            if (scroll.scrollLeft === prev) {
                scroll.scrollLeft = 0;
                return;
            }
            requestAnimationFrame(function() {
                scroll.scrollLeft = 0;
                setTimeout(pump, 120);
            });
        }
        pump();
        */
    }
    function drxaosResetHeroPanels() {
        var panels = document.querySelectorAll('.drxaos-hero-panel');
        panels.forEach(function(panel) {
            var activity = panel.closest('.activity');
            if (activity) {
                activity.classList.remove('drxaos-heroized');
                if (activity.dataset) delete activity.dataset.drxaosHeroReady;
                drxaosUnbindActivityWheel(activity);
                if (activity.dataset) delete activity.dataset.drxaosActiveLineIndex;
            }
        });
        var slots = document.querySelectorAll('.drxaos-hero-slot');
        slots.forEach(function(slot) {
            slot.remove();
        });
        document.querySelectorAll('.drxaos-row-nav').forEach(function(nav) {
            nav.remove();
        });
        document.querySelectorAll('.items-line.drxaos-line-active').forEach(function(line) {
            line.classList.remove('drxaos-line-active');
            line.style.removeProperty('display');
        });
        document.querySelectorAll('.items-line').forEach(function(line) {
            line.style.removeProperty('display');
        });
        if (typeof drxaosHeroInitTimer !== 'undefined' && drxaosHeroInitTimer) {
            clearTimeout(drxaosHeroInitTimer);
            drxaosHeroInitTimer = null;
        }
    }
    function drxaosActivateLineFromCard(card) {
        if (!drxaosIsXuyampisheEnabled() || drxaosUsingMakerXuyampishe() || !card) return;
        var line = typeof card.closest === 'function' ? card.closest('.items-line') : null;
        if (!line) return;
        var activity = line.closest('.activity');
        if (!activity) return;
        drxaosEnsureActiveLine(activity);
        drxaosSetActiveLine(activity, line);
    }
    function drxaosResolveCardType(payload, cardElement) {
        if (payload && payload.type) return payload.type;
        if (payload && payload.name && !payload.title) return 'tv';
        if (cardElement && cardElement.classList) {
            if (cardElement.classList.contains('card--tv') || cardElement.classList.contains('tv')) return 'tv';
        }
        return 'movie';
    }
    function drxaosResolveCardId(payload, cardElement) {
        if (payload) {
            if (payload.id) return payload.id;
            if (payload.tmdb_id) return payload.tmdb_id;
            if (payload.card_id) return payload.card_id;
        }
        if (!cardElement) return '';
        var dataset = cardElement.dataset || {};
        return dataset.id ||
            dataset.movieId ||
            dataset.tmdbId ||
            dataset.tvId ||
            cardElement.getAttribute('data-id') ||
            cardElement.getAttribute('data-movie-id') ||
            cardElement.getAttribute('data-tmdb-id') ||
            cardElement.getAttribute('data-tv-id') ||
            '';
    }
    function drxaosHeroNeedsDetails(payload) {
        if (!payload) return false;
        if (!payload.tmdb_id && !payload.id) return true; // Fix for TV: Always enrich if ID missing
        if (drxaosIsTvDevice()) return false;
        if (!payload.overview) return true;
        if (!(payload.backdrop_path || payload.background_image || payload.backdrop || payload.poster_path || payload.img || payload.poster)) return true;
        if (!payload.genres || !payload.genres.length) return true;
        return false;
    }
    function drxaosEnrichHeroPayload(payload, cardElement) {
        return new Promise(function(resolve) {
            if (!payload) {
                resolve(null);
                return;
            }
            // Fix: Allow enrichment on TV if ID is missing
            if (drxaosIsTvDevice() && (payload.tmdb_id || payload.id)) {
                resolve(payload);
                return;
            }
            var id = drxaosResolveCardId(payload, cardElement);
            if (!id || !window.Lampa || !Lampa.TMDB) {
                resolve(payload);
                return;
            }
            var type = drxaosResolveCardType(payload, cardElement);
            var cacheKey = type + '_' + id;
            var heroPersistentCache = getTmdbCacheStore();
            var heroPersistentKey = 'hero:' + cacheKey;
            if (DRXAOS_HERO_DETAIL_CACHE[cacheKey]) {
                resolve(Object.assign({}, payload, DRXAOS_HERO_DETAIL_CACHE[cacheKey]));
                return;
            }
            if (heroPersistentCache) {
                try {
                    var storedHero = heroPersistentCache.get(heroPersistentKey);
                    if (storedHero) {
                        DRXAOS_HERO_DETAIL_CACHE[cacheKey] = storedHero;
                        resolve(Object.assign({}, payload, storedHero));
                        return;
                    }
                } catch (heroCacheErr) {
                }
            }
            var tmdbKey = (drxaosSafeGet('tmdb_api_key', undefined) || BUILTIN_TMDB_KEY || '').trim();
            if (!tmdbKey) {
                resolve(payload);
                return;
            }
            var url = Lampa.TMDB.api(type + '/' + id + '?language=ru-RU&api_key=' + tmdbKey);
            drxaosFetchWithTimeout(url, null, drxaosNetworkTimeout()).then(function(resp) {
                if (!resp.ok) throw new Error('TMDB status ' + resp.status);
                return resp.json();
            }).then(function(details) {
                var normalizedCountries = (details.production_countries || []).map(function(country) {
                    return country && (country.name || country.iso_3166_1) || '';
                }).filter(Boolean);
                if (!normalizedCountries.length) {
                    if (Array.isArray(payload.production_countries) && payload.production_countries.length) {
                        normalizedCountries = payload.production_countries;
                    } else if (Array.isArray(payload.origin_country) && payload.origin_country.length) {
                        normalizedCountries = payload.origin_country;
                    } else if (typeof payload.origin_country === 'string' && payload.origin_country.trim()) {
                        normalizedCountries = [payload.origin_country.trim()];
                    }
                }
                var extra = {
                    overview: details.overview || payload.overview || '',
                    backdrop_path: details.backdrop_path || payload.backdrop_path || '',
                    poster_path: details.poster_path || payload.poster_path || '',
                    runtime: details.runtime || payload.runtime,
                    episode_run_time: details.episode_run_time || payload.episode_run_time,
                    vote_average: typeof details.vote_average === 'number' ? details.vote_average : payload.vote_average,
                    genres: (details.genres && details.genres.length ? details.genres : payload.genres) || [],
                    production_countries: normalizedCountries,
                    release_date: details.release_date || payload.release_date,
                    first_air_date: details.first_air_date || payload.first_air_date,
                    title: details.title || payload.title,
                    name: details.name || payload.name,
                    original_title: details.original_title || payload.original_title,
                    original_name: details.original_name || payload.original_name
                };
                DRXAOS_HERO_DETAIL_CACHE[cacheKey] = extra;
                if (heroPersistentCache) {
                    try {
                        heroPersistentCache.set(heroPersistentKey, extra);
                    } catch (heroPersistErr) {
                    }
                }
                resolve(Object.assign({}, payload, extra));
            }).catch(function() {
                resolve(payload);
            });
        });
    }
    function drxaosStartFocusObserver() {
        if (drxaosFocusClassObserver || typeof MutationObserver === 'undefined') return;
        if (!document.body) return;
        drxaosFocusClassObserver = new MutationObserver(function(mutations) {
            if (!drxaosIsXuyampisheEnabled()) return;
            if (!drxaosIsContentControllerActive()) return;
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') continue;
                var target = mutation.target;
                if (!target || !target.classList) continue;
        if (!target.classList.contains('selector')) continue;
        if (!target.closest || !target.closest('.card')) continue;
        if (target.classList.contains('focus')) {
            drxaosHandleCardActivation(target);
        }
    }
});
        drxaosFocusClassObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }
    function drxaosStopFocusObserver() {
        if (drxaosFocusClassObserver) {
            drxaosFocusClassObserver.disconnect();
            drxaosFocusClassObserver = null;
        }
    }
    var drxaosLastFocusNode = null;
    var drxaosGlobalFocusObserver = null;
    var drxaosFocusJanitorTimer = null;
    var drxaosDisableFocusCleanup = false;
    var DRXAOS_BUTTON_OBSERVERS = new WeakMap();
    function drxaosDedupActionFocus(container) { /* disabled */ }
    function drxaosCleanActionButtonFocus() { /* disabled */ }
    function drxaosStripSiblingButtonFocus(btn) { /* disabled */ }
    function drxaosEnsureButtonFocusObserver(container) { return; }
    function drxaosEnforceSingleFocus(target) { /* disabled */ }
    function drxaosStartGlobalFocusObserver() { return; }
    function drxaosStartFocusJanitor() {
        if (drxaosFocusJanitorTimer) {
            clearInterval(drxaosFocusJanitorTimer);
            drxaosFocusJanitorTimer = null;
        }
        return;
    }
    function drxaosNormalizeFocus() {
        drxaosEnforceSingleFocus(document.activeElement);
    }
    var drxaosHeroUpdateTimer = null;

    function drxaosHandleCardActivation(target) {
        if (!drxaosIsXuyampisheEnabled() || !target) return;
        if (drxaosIsUiBlockingState()) return;
        if (!drxaosIsContentControllerActive()) return;
        if (target.jquery) target = target[0];
        if (target.target && target.target.nodeType === 1) {
            target = target.target;
        }
        var card = typeof target.closest === 'function' ? target.closest('.card') : null;
        if (!card && target.card && target.card.nodeType === 1) {
            card = target.card;
        }
        /*
        if (card && drxaosIsValidCard(card) && card.classList && card.classList.contains('focus')) {
            // Debounced Update to prevent Phantom Focus and Layout Thrashing
            if (drxaosHeroUpdateTimer) clearTimeout(drxaosHeroUpdateTimer);
            drxaosHeroUpdateTimer = setTimeout(function() {
                // DOUBLE CHECK: Ensure we are still focused on the same card after delay
                if (!document.contains(card) || !card.classList.contains('focus')) return;
                
                drxaosActivateLineFromCard(card);
                drxaosUpdateHeroFromCard(card);
            }, drxaosIsTvDevice() ? 150 : 50); // Increased latency for stability
        }
        */
       // FIX: Completely disabled auto-activation from focus observer to prevent phantom jumps
       // The Hero mode should update only on explicit user navigation events, not passive DOM mutations.
       return;
    }
    function DrxaosXuyampisheInfo() {
        this.html = null;
        this.timer = null;
        this.fadeTimer = null;
        this.network = (window.Lampa && Lampa.Reguest) ? new Lampa.Reguest() : null;
        this.loaded = {};
        this.currentUrl = null;
        this.lastRenderId = 0;
    }
    DrxaosXuyampisheInfo.prototype.create = function() {
        if (this.html) return;
        var drxaosMarkup = '' +
            '<div class="new-interface-info">' +
                '<div class="new-interface-info__body">' +
                    '<div class="new-interface-info__head"></div>' +
                    '<div class="new-interface-info__title"></div>' +
                    '<div class="new-interface-info__details"></div>' +
                    '<div class="new-interface-info__description"></div>' +
                '</div>' +
            '</div>';
        if (window.jQuery) {
            this.html = window.jQuery(drxaosMarkup);
        } else {
            var drxaosWrapper = document.createElement('div');
            drxaosWrapper.className = 'new-interface-info';
            drxaosWrapper.innerHTML = '' +
                '<div class="new-interface-info__body">' +
                    '<div class="new-interface-info__head"></div>' +
                    '<div class="new-interface-info__title"></div>' +
                    '<div class="new-interface-info__details"></div>' +
                    '<div class="new-interface-info__description"></div>' +
                '</div>';
            this.html = drxaosWrapper;
        }
    };
    DrxaosXuyampisheInfo.prototype.render = function(asElement) {
        this.create();
        if (window.jQuery && this.html instanceof window.jQuery) {
            return asElement ? this.html[0] : this.html;
        }
        return asElement ? this.html : (window.jQuery ? window.jQuery(this.html) : this.html);
    };
    DrxaosXuyampisheInfo.prototype.update = function(drxaosData, drxaosCardElement) {
        if (!drxaosData) return;
        var drxaosRoot = this.render(true);
        if (!drxaosRoot) return;
        var drxaos$Root = window.jQuery ? window.jQuery(drxaosRoot) : null;
        if (!drxaos$Root) return;

        var drxaosResolvedCardElement = drxaosCardElement ? drxaosResolveCardElement(drxaosCardElement) : null;

        this.lastRenderId = Date.now();

        drxaos$Root.find('.new-interface-info__head,.new-interface-info__details').removeClass('visible');

        var drxaosTitle = drxaos$Root.find('.new-interface-info__title');
        var drxaosDesc = drxaos$Root.find('.new-interface-info__description');
        var drxaosEmptyText = (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') ? Lampa.Lang.translate('full_notext') : '';
        var drxaosDescription = drxaosBuildHeroDescription(drxaosData, drxaosResolvedCardElement);

        drxaosDesc.text(drxaosDescription || drxaosEmptyText);
        clearTimeout(this.fadeTimer);

        if (window.Lampa && Lampa.Background && Lampa.Api && drxaosData.backdrop_path) {
            try {
                Lampa.Background.change(Lampa.Api.img(drxaosData.backdrop_path, 'original'));
            } catch (e) {}
        }

        this.load(drxaosData);

        drxaosTitle.text(drxaosData.title || drxaosData.name || '');
        drxaosTitle.css({ opacity: 1 });
        this.showLogo(drxaosData);
    };
    DrxaosXuyampisheInfo.prototype.showLogo = function(drxaosData) {
        if (!drxaosData) return;
        var drxaosRoot = this.render(true);
        if (!drxaosRoot) return;
        var drxaosTitleNode = drxaosRoot.querySelector('.new-interface-info__title');
        if (!drxaosTitleNode) return;

        var drxaosFallbackTitle = drxaosData.title || drxaosData.name || '';
        drxaosTitleNode.classList.remove('drxaos-hero-title-has-logo');
        drxaosTitleNode.innerHTML = '';
        delete drxaosTitleNode.dataset.pendingCardLogoId;

        if (!drxaosIsTitleLogoEnabled()) {
            drxaosTitleNode.textContent = drxaosFallbackTitle;
            return;
        }

        var drxaosLogoCandidate = {
            id: drxaosData.id || drxaosData.tmdb_id,
            tmdb_id: drxaosData.tmdb_id || drxaosData.id,
            title: drxaosData.title || drxaosData.original_title || '',
            name: drxaosData.name || drxaosData.original_name || ''
        };
        var drxaosNormalizedLogo = drxaosNormalizeLogoMovie(drxaosLogoCandidate);
        if (!drxaosNormalizedLogo) {
            drxaosTitleNode.textContent = drxaosFallbackTitle;
            return;
        }

        var drxaosLogoMeta = drxaosGetTitleLogoMeta(drxaosNormalizedLogo);
        var drxaosCachedLogo = null;
        if (drxaosLogoMeta && DRXAOS_TITLE_LOGO_CACHE.hasOwnProperty(drxaosLogoMeta.cacheKey)) {
            drxaosCachedLogo = DRXAOS_TITLE_LOGO_CACHE[drxaosLogoMeta.cacheKey];
        }

        if (drxaosCachedLogo && drxaosCachedLogo.url) {
            var drxaosCachedImg = document.createElement('img');
            drxaosCachedImg.src = drxaosCachedLogo.url;
            drxaosCachedImg.alt = drxaosCachedLogo.alt || drxaosFallbackTitle || '';
            drxaosCachedImg.className = 'drxaos-hero-title-logo visible';
            drxaosTitleNode.appendChild(drxaosCachedImg);
            drxaosTitleNode.classList.add('drxaos-hero-title-has-logo');
            return;
        }

        var drxaosPendingKey = (drxaosLogoCandidate.id || Date.now()).toString();
        drxaosTitleNode.dataset.pendingCardLogoId = drxaosPendingKey;
        drxaosLoadTitleLogo(drxaosNormalizedLogo).then(function(drxaosLogoResult) {
            if (drxaosTitleNode.dataset.pendingCardLogoId !== drxaosPendingKey) return;
            if (drxaosLogoResult && drxaosLogoResult.url) {
                drxaosTitleNode.innerHTML = '';
                var drxaosLogoImg = document.createElement('img');
                drxaosLogoImg.src = drxaosLogoResult.url;
                drxaosLogoImg.alt = drxaosLogoResult.alt || drxaosFallbackTitle || '';
                drxaosLogoImg.className = 'drxaos-hero-title-logo';
                drxaosTitleNode.appendChild(drxaosLogoImg);
                drxaosTitleNode.classList.add('drxaos-hero-title-has-logo');
                requestAnimationFrame(function() { drxaosLogoImg.classList.add('visible'); });
            } else {
                drxaosTitleNode.textContent = drxaosFallbackTitle;
                drxaosTitleNode.classList.remove('drxaos-hero-title-has-logo');
            }
        }).catch(function() {
            if (drxaosTitleNode.dataset.pendingCardLogoId === drxaosPendingKey) {
                drxaosTitleNode.textContent = drxaosFallbackTitle;
                drxaosTitleNode.classList.remove('drxaos-hero-title-has-logo');
            }
        });
    };
    DrxaosXuyampisheInfo.prototype.load = function(drxaosData) {
        if (!drxaosData || !drxaosData.id) return;
        var drxaosSource = drxaosData.source || 'tmdb';
        if (drxaosSource !== 'tmdb' && drxaosSource !== 'cub') return;
        if (!window.Lampa || !Lampa.TMDB || typeof Lampa.TMDB.api !== 'function') return;

        var drxaosMediaType = drxaosData.media_type === 'tv' || drxaosData.name ? 'tv' : 'movie';
        var drxaosLanguage = Lampa.Storage.get('language') || 'en';
        var drxaosApiKey = (Lampa.TMDB && typeof Lampa.TMDB.key === 'function') ? Lampa.TMDB.key() : (drxaosSafeGet('tmdb_api_key', '') || BUILTIN_TMDB_KEY);
        if (!drxaosApiKey) return;
        var drxaosApiUrl = Lampa.TMDB.api(drxaosMediaType + '/' + drxaosData.id + '?api_key=' + drxaosApiKey + '&append_to_response=content_ratings,release_dates&language=' + drxaosLanguage);

        this.currentUrl = drxaosApiUrl;

        if (this.loaded[drxaosApiUrl]) {
            this.draw(this.loaded[drxaosApiUrl]);
            return;
        }

        clearTimeout(this.timer);
        var drxaosSelf = this;

        this.timer = setTimeout(function() {
            if (!drxaosSelf.network) return;
            drxaosSelf.network.clear();
            drxaosSelf.network.timeout(5000);
            drxaosSelf.network.silent(drxaosApiUrl, function(drxaosResponse) {
                drxaosSelf.loaded[drxaosApiUrl] = drxaosResponse;
                if (drxaosSelf.currentUrl === drxaosApiUrl) {
                    drxaosSelf.draw(drxaosResponse);
                }
            });
        }, 300);
    };
    DrxaosXuyampisheInfo.prototype.draw = function(drxaosDetails) {
        if (!drxaosDetails) return;
        var drxaosRoot = this.render(true);
        if (!drxaosRoot) return;
        var drxaos$Root = window.jQuery ? window.jQuery(drxaosRoot) : null;
        if (!drxaos$Root) return;

        var drxaosYear = ((drxaosDetails.release_date || drxaosDetails.first_air_date || '0000') + '').slice(0, 4);
        var drxaosRating = parseFloat((drxaosDetails.vote_average || 0) + '').toFixed(1);
        var drxaosHeadInfo = [];
        var drxaosDetailsInfo = [];
        var drxaosCountries = [];
        var drxaosAgeRating = '';
        var drxaosDescriptionText = drxaosBuildHeroDescription(drxaosDetails, null);
        if (drxaosDescriptionText) {
            drxaos$Root.find('.new-interface-info__description').text(drxaosDescriptionText);
        }

        if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb) {
            try {
                drxaosCountries = Lampa.Api.sources.tmdb.parseCountries(drxaosDetails);
                if (drxaosCountries.length > 2) drxaosCountries = drxaosCountries.slice(0, 2);
            } catch (e) {}
            try {
                drxaosAgeRating = Lampa.Api.sources.tmdb.parsePG(drxaosDetails);
            } catch (e2) {}
        }

        if (Lampa.Storage.get('rat') !== false) {
            if (drxaosRating > 0) {
                var drxaosRateStyle = '';
                if (Lampa.Storage.get('colored_ratings')) {
                    var drxaosVoteNum = parseFloat(drxaosRating);
                    var drxaosColor = '';

                    if (drxaosVoteNum >= 0 && drxaosVoteNum <= 3) {
                        drxaosColor = 'red';
                    } else if (drxaosVoteNum > 3 && drxaosVoteNum < 6) {
                        drxaosColor = 'orange';
                    } else if (drxaosVoteNum >= 6 && drxaosVoteNum < 7) {
                        drxaosColor = 'cornflowerblue';
                    } else if (drxaosVoteNum >= 7 && drxaosVoteNum < 8) {
                        drxaosColor = 'darkmagenta';
                    } else if (drxaosVoteNum >= 8 && drxaosVoteNum <= 10) {
                        drxaosColor = 'lawngreen';
                    }

                    if (drxaosColor) drxaosRateStyle = ' style="color: ' + drxaosColor + '"';
                }

                drxaosDetailsInfo.push('<div class="full-start__rate"' + drxaosRateStyle + '><div>' + drxaosRating + '</div><div>TMDB</div></div>');
            }
        }

        if (Lampa.Storage.get('ganr') !== false) {
            if (drxaosDetails.genres && drxaosDetails.genres.length > 0) {
                drxaosDetailsInfo.push(
                    drxaosDetails.genres
                        .slice(0, 2)
                        .map(function(drxaosGenre) {
                            return Lampa.Utils.capitalizeFirstLetter(drxaosGenre.name);
                        })
                        .join(' | ')
                );
            }
        }

        if (Lampa.Storage.get('vremya') !== false) {
            if (drxaosDetails.runtime) {
                drxaosDetailsInfo.push(Lampa.Utils.secondsToTime(drxaosDetails.runtime * 60, true));
            }
        }

        if (Lampa.Storage.get('seas') !== false && drxaosDetails.number_of_seasons) {
            drxaosDetailsInfo.push('<span class="full-start__pg" style="font-size: 0.9em;">Сезонов ' + drxaosDetails.number_of_seasons + '</span>');
        }

        if (Lampa.Storage.get('eps') !== false && drxaosDetails.number_of_episodes) {
            drxaosDetailsInfo.push('<span class="full-start__pg" style="font-size: 0.9em;">Эпизодов ' + drxaosDetails.number_of_episodes + '</span>');
        }

        if (Lampa.Storage.get('year_ogr') !== false) {
            if (drxaosAgeRating) {
                drxaosDetailsInfo.push('<span class="full-start__pg" style="font-size: 0.9em;">' + drxaosAgeRating + '</span>');
            }
        }

        if (Lampa.Storage.get('status') !== false) {
            var drxaosStatusText = '';

            if (drxaosDetails.status) {
                switch (drxaosDetails.status.toLowerCase()) {
                    case 'released':
                        drxaosStatusText = 'Выпущенный';
                        break;
                    case 'ended':
                        drxaosStatusText = 'Закончен';
                        break;
                    case 'returning series':
                        drxaosStatusText = 'Онгоинг';
                        break;
                    case 'canceled':
                        drxaosStatusText = 'Отменено';
                        break;
                    case 'post production':
                        drxaosStatusText = 'Скоро';
                        break;
                    case 'planned':
                        drxaosStatusText = 'Запланировано';
                        break;
                    case 'in production':
                        drxaosStatusText = 'В производстве';
                        break;
                    default:
                        drxaosStatusText = drxaosDetails.status;
                        break;
                }
            }

            if (drxaosStatusText) {
                drxaosDetailsInfo.push('<span class="full-start__status" style="font-size: 0.9em;">' + drxaosStatusText + '</span>');
            }
        }

        var drxaosYearCountry = [];
        if (drxaosYear !== '0000') drxaosYearCountry.push('<span>' + drxaosYear + '</span>');
        if (drxaosCountries.length > 0) drxaosYearCountry.push(drxaosCountries.join(', '));

        if (drxaosYearCountry.length > 0) {
            drxaosDetailsInfo.push(drxaosYearCountry.join(', '));
        }

        drxaos$Root.find('.new-interface-info__head').empty().append(drxaosHeadInfo.join(', ')).toggleClass('visible', drxaosHeadInfo.length > 0);
        drxaos$Root.find('.new-interface-info__details').html(drxaosDetailsInfo.join('<span class="new-interface-info__split">&#9679;</span>') + '<span class="drxaos-quality-badges"></span>').addClass('visible');

        try {
            var drxaosHeroBadgesContainer = drxaos$Root.find('.drxaos-quality-badges');
            if (drxaosHeroBadgesContainer.length && drxaosDetails) {
                drxaosAnalyzeQualityBadges(drxaosDetails, drxaos$Root);
            }
        } catch (badgeErr) {}
    };
    DrxaosXuyampisheInfo.prototype.empty = function() {
        if (!this.html) return;
        var drxaosRoot = this.render(true);
        if (!drxaosRoot || !window.jQuery) return;
        window.jQuery(drxaosRoot).find('.new-interface-info__head,.new-interface-info__details').text('').removeClass('visible');
    };
    DrxaosXuyampisheInfo.prototype.reset = function() {
        this.empty();
    };
    DrxaosXuyampisheInfo.prototype.destroy = function() {
        clearTimeout(this.fadeTimer);
        clearTimeout(this.timer);
        if (this.network) this.network.clear();
        this.loaded = {};
        this.currentUrl = null;

        if (this.html) {
            if (window.jQuery && this.html instanceof window.jQuery) {
                this.html.remove();
            } else if (this.html.parentNode) {
                this.html.parentNode.removeChild(this.html);
            }
        }

        this.html = null;
    };
    var drxaosXuyampisheInterface = (function() {
        var drxaosActiveStates = new Set();
        var drxaosMakerPatched = false;

        function drxaosIsMakerEnvironment() {
            return !!(window.Lampa && Lampa.Maker && typeof Lampa.Maker.map === 'function' && Lampa.Manifest && Lampa.Manifest.app_digital >= 300);
        }

        function drxaosXuyShouldUse(object) {
            if (!drxaosIsXuyampisheEnabled()) return false;
            if (!drxaosIsMakerEnvironment()) return false;
            if (!object) return false;
            if (window.innerWidth < 767) return false;
            if (window.Lampa && Lampa.Platform && typeof Lampa.Platform.screen === 'function' && Lampa.Platform.screen('mobile')) return false;
            if (object.title === 'Избранное') return false;
            return true;
        }

        function drxaosXuyEnsureState(mainInstance) {
            if (mainInstance.__drxaosXuyState) {
                return mainInstance.__drxaosXuyState;
            }
            var drxaosState = drxaosXuyCreateState(mainInstance);
            mainInstance.__drxaosXuyState = drxaosState;
            return drxaosState;
        }

        function drxaosXuyCreateState(mainInstance) {
            var drxaosInfoPanel = new DrxaosXuyampisheInfo();
            drxaosInfoPanel.create();

            var drxaosBackgroundWrapper = document.createElement('div');
            drxaosBackgroundWrapper.className = 'full-start__background-wrapper';

            var drxaosBackgroundPrimary = document.createElement('img');
            drxaosBackgroundPrimary.className = 'full-start__background';
            var drxaosBackgroundSecondary = document.createElement('img');
            drxaosBackgroundSecondary.className = 'full-start__background';

            drxaosBackgroundWrapper.appendChild(drxaosBackgroundPrimary);
            drxaosBackgroundWrapper.appendChild(drxaosBackgroundSecondary);

            var drxaosState = {
                main: mainInstance,
                info: drxaosInfoPanel,
                background: drxaosBackgroundWrapper,
                infoElement: null,
                backgroundTimer: null,
                backgroundLast: '',
                attached: false,
                attach: function() {
                    if (this.attached) return;
                    if (!drxaosXuyShouldUse(mainInstance && mainInstance.object)) return;

                    var drxaosContainer = mainInstance.render(true);
                    if (!drxaosContainer) return;

                    drxaosContainer.classList.add('new-interface');

                    if (!drxaosBackgroundWrapper.parentElement) {
                        drxaosContainer.insertBefore(drxaosBackgroundWrapper, drxaosContainer.firstChild || null);
                    }

                    var drxaosInfoElement = drxaosInfoPanel.render(true);
                    this.infoElement = drxaosInfoElement;

                    if (drxaosInfoElement && drxaosInfoElement.parentNode !== drxaosContainer) {
                        if (drxaosBackgroundWrapper.parentElement === drxaosContainer) {
                            drxaosContainer.insertBefore(drxaosInfoElement, drxaosBackgroundWrapper.nextSibling);
                        } else {
                            drxaosContainer.insertBefore(drxaosInfoElement, drxaosContainer.firstChild || null);
                        }
                    }

                    if (mainInstance.scroll && typeof mainInstance.scroll.minus === 'function') {
                        mainInstance.scroll.minus(drxaosInfoElement);
                    }

                    this.attached = true;
                    drxaosActiveStates.add(this);
                },
                update: function(drxaosData, drxaosCardElement) {
                    if (!drxaosData) return;
                    drxaosInfoPanel.update(drxaosData, drxaosCardElement);
                    this.updateBackground(drxaosData);
                },
                updateBackground: function(drxaosData) {
                    var drxaosShowBackground = Lampa.Storage.get('show_background', true);
                    var drxaosBackdropUrl = drxaosData && drxaosData.backdrop_path && drxaosShowBackground ? Lampa.Api.img(drxaosData.backdrop_path, 'original') : '';

                    if (drxaosBackdropUrl === this.backgroundLast) return;

                    clearTimeout(this.backgroundTimer);
                    var drxaosSelf = this;

                    this.backgroundTimer = setTimeout(function() {
                        if (!drxaosBackdropUrl) {
                            drxaosBackgroundPrimary.classList.remove('active');
                            drxaosBackgroundSecondary.classList.remove('active');
                            drxaosSelf.backgroundLast = '';
                            return;
                        }

                        var drxaosNextLayer = drxaosBackgroundPrimary.classList.contains('active') ? drxaosBackgroundSecondary : drxaosBackgroundPrimary;
                        var drxaosPrevLayer = drxaosBackgroundPrimary.classList.contains('active') ? drxaosBackgroundPrimary : drxaosBackgroundSecondary;

                        var drxaosImage = new Image();
                        drxaosImage.onload = function() {
                            if (drxaosBackdropUrl !== drxaosSelf.backgroundLast) return;

                            drxaosNextLayer.src = drxaosBackdropUrl;
                            drxaosNextLayer.classList.add('active');

                            setTimeout(function() {
                                if (drxaosBackdropUrl !== drxaosSelf.backgroundLast) return;
                                drxaosPrevLayer.classList.remove('active');
                            }, 100);
                        };

                        drxaosSelf.backgroundLast = drxaosBackdropUrl;
                        drxaosImage.src = drxaosBackdropUrl;
                    }, 100);
                },
                reset: function() {
                    drxaosInfoPanel.empty();
                },
                destroy: function() {
                    clearTimeout(this.backgroundTimer);
                    drxaosInfoPanel.destroy();

                    var drxaosContainer = mainInstance.render(true);
                    if (drxaosContainer) {
                        drxaosContainer.classList.remove('new-interface');
                    }

                    if (this.infoElement && this.infoElement.parentNode) {
                        this.infoElement.parentNode.removeChild(this.infoElement);
                    }

                    if (drxaosBackgroundWrapper && drxaosBackgroundWrapper.parentNode) {
                        drxaosBackgroundWrapper.parentNode.removeChild(drxaosBackgroundWrapper);
                    }

                    this.attached = false;
                    drxaosActiveStates.delete(this);
                }
            };

            return drxaosState;
        }

        function drxaosIntExtendResultsWithStyle(drxaosData) {
            if (!drxaosData) return;
            if (Array.isArray(drxaosData.results)) {
                var drxaosWide = true;
                try {
                    drxaosWide = Lampa.Storage.get('wide_post') !== false;
                } catch (e) {}
                var drxaosStyleName = drxaosWide ? 'wide' : 'small';
                if (window.Lampa && Lampa.Utils && typeof Lampa.Utils.extendItemsParams === 'function') {
                    Lampa.Utils.extendItemsParams(drxaosData.results, {
                        style: { name: drxaosStyleName }
                    });
                } else {
                    drxaosData.results.forEach(function(drxaosItem) {
                        if (!drxaosItem) return;
                        drxaosItem.params = drxaosItem.params || {};
                        drxaosItem.params.style = drxaosItem.params.style || {};
                        drxaosItem.params.style.name = drxaosStyleName;
                    });
                }
            }
        }

        function drxaosIntHandleCard(drxaosState, drxaosCard) {
            if (!drxaosCard || drxaosCard.__drxaosXuyCard) return;
            if (typeof drxaosCard.use !== 'function' || !drxaosCard.data) return;

            drxaosCard.__drxaosXuyCard = true;
            drxaosCard.params = drxaosCard.params || {};
            drxaosCard.params.style = drxaosCard.params.style || {};

            var drxaosTargetStyle = Lampa.Storage.get('wide_post') !== false ? 'wide' : 'small';
            drxaosCard.params.style.name = drxaosTargetStyle;

            if (drxaosCard.render && typeof drxaosCard.render === 'function') {
                var drxaosCardElement = drxaosCard.render(true);
                if (drxaosCardElement) {
                    var drxaosCardNode = drxaosCardElement.jquery ? drxaosCardElement[0] : drxaosCardElement;
                    if (drxaosCardNode && drxaosCardNode.classList) {
                        if (drxaosTargetStyle === 'wide') {
                            drxaosCardNode.classList.add('card--wide');
                            drxaosCardNode.classList.remove('card--small');
                        } else {
                            drxaosCardNode.classList.add('card--small');
                            drxaosCardNode.classList.remove('card--wide');
                        }
                    }
                }
            }

            drxaosCard.use({
                onFocus: function() {
                    var drxaosCardElement = drxaosCard.render ? drxaosCard.render(true) : null;
                    drxaosState.update(drxaosCard.data, drxaosCardElement);
                },
                onHover: function() {
                    var drxaosCardElement = drxaosCard.render ? drxaosCard.render(true) : null;
                    drxaosState.update(drxaosCard.data, drxaosCardElement);
                },
                onTouch: function() {
                    var drxaosCardElement = drxaosCard.render ? drxaosCard.render(true) : null;
                    drxaosState.update(drxaosCard.data, drxaosCardElement);
                },
                onDestroy: function() {
                    delete drxaosCard.__drxaosXuyCard;
                }
            });
        }

        function drxaosIntGetCardData(drxaosCard, drxaosResults, drxaosIndex) {
            drxaosIndex = drxaosIndex || 0;
            if (drxaosCard && drxaosCard.data) return drxaosCard.data;
            if (drxaosResults && Array.isArray(drxaosResults.results)) {
                return drxaosResults.results[drxaosIndex] || drxaosResults.results[0];
            }
            return null;
        }

        function drxaosIntFindCardData(drxaosElement) {
            if (!drxaosElement) return null;
            var drxaosNode = drxaosElement && drxaosElement.jquery ? drxaosElement[0] : drxaosElement;
            while (drxaosNode && !drxaosNode.card_data) {
                drxaosNode = drxaosNode.parentNode;
            }
            return drxaosNode && drxaosNode.card_data ? drxaosNode.card_data : null;
        }

        function drxaosIntGetFocusedCardElement(drxaosItems) {
            var drxaosContainer = drxaosItems && typeof drxaosItems.render === 'function' ? drxaosItems.render(true) : null;
            if (!drxaosContainer || !drxaosContainer.querySelector) return null;
            return drxaosContainer.querySelector('.selector.focus') || drxaosContainer.querySelector('.focus');
        }

        function drxaosIntHandleLineAppend(drxaosItems, drxaosLine, drxaosData) {
            if (drxaosLine.__drxaosXuyLine) return;
            drxaosLine.__drxaosXuyLine = true;

            var drxaosState = drxaosXuyEnsureState(drxaosItems);

            var drxaosProcessCard = function(drxaosCard) {
                drxaosIntHandleCard(drxaosState, drxaosCard);
            };

            drxaosLine.use({
                onInstance: function(drxaosInstance) {
                    drxaosProcessCard(drxaosInstance);
                },
                onActive: function(drxaosCard, drxaosResults) {
                    var drxaosCardData = drxaosIntGetCardData(drxaosCard, drxaosResults);
                    var drxaosCardElement = drxaosCard && typeof drxaosCard.render === 'function' ? drxaosCard.render(true) : null;
                    if (drxaosCardData) drxaosState.update(drxaosCardData, drxaosCardElement);
                },
                onToggle: function() {
                    setTimeout(function() {
                        var drxaosFocusedElement = drxaosIntGetFocusedCardElement(drxaosLine);
                        var drxaosFocusedData = drxaosIntFindCardData(drxaosFocusedElement);
                        if (drxaosFocusedData) drxaosState.update(drxaosFocusedData, drxaosFocusedElement);
                    }, 32);
                },
                onMore: function() {
                    drxaosState.reset();
                },
                onDestroy: function() {
                    drxaosState.reset();
                    delete drxaosLine.__drxaosXuyLine;
                }
            });

            if (Array.isArray(drxaosLine.items) && drxaosLine.items.length) {
                drxaosLine.items.forEach(drxaosProcessCard);
            }

            if (drxaosLine.last) {
                var drxaosLastCardData = drxaosIntFindCardData(drxaosLine.last);
                if (drxaosLastCardData) drxaosState.update(drxaosLastCardData, drxaosLine.last);
            }
        }

        function drxaosIntWrapMethod(drxaosObject, drxaosMethodName, drxaosWrapper) {
            if (!drxaosObject) return;
            var drxaosOriginalMethod = typeof drxaosObject[drxaosMethodName] === 'function' ? drxaosObject[drxaosMethodName] : null;
            if (drxaosObject[drxaosMethodName] && drxaosObject[drxaosMethodName].__drxaosIntWrapped) return;

            drxaosObject[drxaosMethodName] = function() {
                var drxaosArgs = Array.prototype.slice.call(arguments);
                return drxaosWrapper.call(this, drxaosOriginalMethod, drxaosArgs);
            };
            drxaosObject[drxaosMethodName].__drxaosIntWrapped = true;
        }

        function drxaosXuyPatchMaker() {
            var drxaosMap = Lampa.Maker && Lampa.Maker.map ? Lampa.Maker.map('Main') : null;
            if (!drxaosMap || !drxaosMap.Items || !drxaosMap.Create) return;
            if (drxaosMap.__drxaosXuyPatched) return;
            drxaosMap.__drxaosXuyPatched = true;

            drxaosIntWrapMethod(drxaosMap.Items, 'onInit', function(drxaosOriginalMethod, drxaosArgs) {
                if (drxaosOriginalMethod) drxaosOriginalMethod.apply(this, drxaosArgs);
                this.__drxaosXuyEnabled = drxaosXuyShouldUse(this && this.object);
            });

            drxaosIntWrapMethod(drxaosMap.Create, 'onCreate', function(drxaosOriginalMethod, drxaosArgs) {
                if (drxaosOriginalMethod) drxaosOriginalMethod.apply(this, drxaosArgs);
                if (!this.__drxaosXuyEnabled) return;

                var drxaosState = drxaosXuyEnsureState(this);
                drxaosState.attach();
            });

            drxaosIntWrapMethod(drxaosMap.Create, 'onCreateAndAppend', function(drxaosOriginalMethod, drxaosArgs) {
                var drxaosElement = drxaosArgs && drxaosArgs[0];
                if (this.__drxaosXuyEnabled && drxaosElement) {
                    drxaosIntExtendResultsWithStyle(drxaosElement);
                }
                return drxaosOriginalMethod ? drxaosOriginalMethod.apply(this, drxaosArgs) : undefined;
            });

            drxaosIntWrapMethod(drxaosMap.Items, 'onAppend', function(drxaosOriginalMethod, drxaosArgs) {
                if (drxaosOriginalMethod) drxaosOriginalMethod.apply(this, drxaosArgs);
                if (!this.__drxaosXuyEnabled) return;

                var drxaosElement = drxaosArgs && drxaosArgs[0];
                var drxaosData = drxaosArgs && drxaosArgs[1];
                if (drxaosElement && drxaosData) {
                    drxaosIntHandleLineAppend(this, drxaosElement, drxaosData);
                }
            });

            drxaosIntWrapMethod(drxaosMap.Items, 'onDestroy', function(drxaosOriginalMethod, drxaosArgs) {
                if (this.__drxaosXuyState) {
                    this.__drxaosXuyState.destroy();
                    delete this.__drxaosXuyState;
                }
                delete this.__drxaosXuyEnabled;
                if (drxaosOriginalMethod) drxaosOriginalMethod.apply(this, drxaosArgs);
            });
        }

        function drxaosXuyDetachAll() {
            drxaosActiveStates.forEach(function(drxaosState) {
                if (drxaosState) drxaosState.destroy();
            });
            drxaosActiveStates.clear();
        }

        function drxaosXuyRefreshStates() {
            if (!drxaosIsXuyampisheEnabled()) {
                drxaosXuyDetachAll();
                return;
            }
            if (!drxaosIsMakerEnvironment()) return;
            drxaosEnsureIntInterfaceStyle();
            drxaosActiveStates.forEach(function(drxaosState) {
                if (!drxaosState || !drxaosState.main) return;
                drxaosState.attach();
                var drxaosContainer = typeof drxaosState.main.render === 'function' ? drxaosState.main.render(true) : null;
                if (!drxaosContainer || !drxaosContainer.querySelector) return;
                var drxaosFocused = drxaosContainer.querySelector('.selector.focus');
                var drxaosData = drxaosIntFindCardData(drxaosFocused);
                if (drxaosData) {
                    drxaosState.update(drxaosData, drxaosFocused);
                }
            });
        }

        return {
            init: function() {
                if (!drxaosIsMakerEnvironment()) return;
                drxaosEnsureIntInterfaceStyle();
                if (!drxaosMakerPatched) {
                    drxaosXuyPatchMaker();
                    drxaosMakerPatched = true;
                }
            },
            refresh: drxaosXuyRefreshStates,
            teardown: drxaosXuyDetachAll,
            isMakerEnvironment: drxaosIsMakerEnvironment
        };
    })();
    var drxaosTvLiftTimers = [];
    function drxaosClearTvLiftTimers() {
        while (drxaosTvLiftTimers.length) {
            clearTimeout(drxaosTvLiftTimers.pop());
        }
    }
    function applyXuyampisheMode() {
        if (!document.body) return;
        var drxaosEnabled = drxaosIsXuyampisheEnabled();
        var drxaosMakerEnv = drxaosXuyampisheInterface.isMakerEnvironment && drxaosXuyampisheInterface.isMakerEnvironment();
        document.body.classList.remove('drxaos-xuyampishe-theme');
        drxaosClearTvLiftTimers();
        if (drxaosEnabled) {
            ensureXuyampisheStyle();
            drxaosEnsureIntInterfaceStyle();
            document.body.classList.add('drxaos-xuyampishe-active');
            drxaosXuyampisheInterface.init();
            drxaosXuyampisheInterface.refresh();
            drxaosStopFocusObserver();
            drxaosResetHeroPanels();
            // Применяем стили для поднятия ряда на ТВ
            if (typeof window.drxaosApplyTVRowLift === 'function') {
                drxaosTvLiftTimers.push(setTimeout(function() {
                    window.drxaosApplyTVRowLift();
                }, 300));
                drxaosTvLiftTimers.push(setTimeout(function() {
                    window.drxaosApplyTVRowLift();
                }, 1000));
            }
        } else {
            document.body.classList.remove('drxaos-xuyampishe-active');
            drxaosXuyampisheInterface.teardown();
            drxaosRemoveIntInterfaceStyle();
            removeXuyampisheStyle();
            drxaosStopFocusObserver();
            drxaosResetHeroPanels();
        }
    }

// =========================================================
// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Форсируем применение стилей
// Гарантируем работу на ВСЕХ платформах включая Android
// =========================================================
(function drxaosForceCSSApplication() {
    var attempts = 0;
    var maxAttempts = 10;

    function tryApply() {
        attempts++;

        try {
            // Проверяем что функции существуют
            if (typeof ensureXuyampisheStyle === 'function' && 
                typeof drxaosIsXuyampisheEnabled === 'function') {

                if (drxaosIsXuyampisheEnabled()) {
                    ensureXuyampisheStyle();

                    // Применяем также режим
                    if (typeof applyXuyampisheMode === 'function') {
                        applyXuyampisheMode();
                    }

                    return true;
                }
            }
        } catch (err) {
        }

        // Повторяем если не получилось
        if (attempts < maxAttempts) {
            setTimeout(tryApply, 500);
        }

        return false;
    }

    // Первая попытка сразу
    setTimeout(tryApply, 100);

    // Также при любом изменении активности
    if (window.Lampa && window.Lampa.Activity) {
        Lampa.Activity.listener.follow('activity', function() {
            tryApply();
        });
    }
})();

    
    // Проверка версии Lampa
    function isLampa3() {
        return window.Lampa && window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300;
    }
    
    function getLampaVersion() {
        if (window.Lampa && window.Lampa.Manifest) {
            return window.Lampa.Manifest.app_digital || 0;
        }
        return 0;
    }
    
    // Логирование версии при старте
    if (window.Lampa) {
    }
    
    var netflixFontStyles = `
        :root {
            --drxaos-font-family: ${DEFAULT_FONT_STACK};
        }
        body, .body,
        .menu, .settings, .layer, .modal,
        h1, h2, h3, h4, h5, h6,
        p, span, div, a, button, input, textarea {
            font-family: var(--drxaos-font-family) !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
        }
.head__action:not(.open--profile),
.drxaos-theme-quick-btn {
    background: var(--theme-color, rgba(0, 0, 0, var(--drxaos-surface-opacity))) !important;
    border-radius: 8px !important;
    padding: 8px !important;
    transition: none !important;
}
.head__action:not(.open--profile):hover,
.head__action:not(.open--profile):focus,
.head__action:not(.open--profile).focus,
.drxaos-theme-quick-btn:hover,
.drxaos-theme-quick-btn:focus,
.drxaos-theme-quick-btn.focus {
    background: var(--theme-color, rgba(0, 0, 0, var(--drxaos-surface-opacity))) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
    transform: none !important; /* FIXED: Disable scale */
}
.head__action:not(.open--profile) svg,
.drxaos-theme-quick-btn svg {
    filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, var(--drxaos-surface-opacity))) !important;
    transition: none !important;
}
.head__action:not(.open--profile):hover svg,
.head__action:not(.open--profile):focus svg,
.head__action:not(.open--profile).focus svg,
.drxaos-theme-quick-btn:hover svg,
.drxaos-theme-quick-btn:focus svg,
.drxaos-theme-quick-btn.focus svg {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.95)) !important;
    transform: none !important; /* FIXED: Disable scale */
}
.speedtest {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.18) 0%, rgba(var(--bg-rgb), 0.995) 40%, rgba(var(--secondary-rgb), 0.12) 100%) !important;
    border: 2px solid rgba(var(--primary-rgb), 0.5) !important;
    border-radius: 16px !important;
}
.speedtest__progress { stroke: var(--theme-accent) !important; }
.speedtest__frequency { stroke: rgba(var(--primary-rgb), 0.3) !important; }
.speedtest text { fill: var(--text-main) !important; }
#speedtest_num { fill: var(--theme-accent) !important; }
#speedtest_graph { stroke: var(--theme-accent) !important; }`;
    if (!document.querySelector('#drxaos-netflix-fonts')) {
        var netflixFontStyle = document.createElement('style');
        netflixFontStyle.id = 'drxaos-netflix-fonts';
        netflixFontStyle.textContent = netflixFontStyles;
        document.head.appendChild(netflixFontStyle);
    }
    var globalFontStyles = `
        * {
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            font-display: swap !important;
            font-synthesis: none !important;
            font-feature-settings: "kern" 1, "liga" 1, "calt" 1 !important;
            font-variant-ligatures: common-ligatures !important;
            font-optical-sizing: auto !important;
            text-rendering: optimizeLegibility !important;
        }
    `;
    if (!document.querySelector('#drxaos-global-font-styles')) {
        var globalFontStyle = document.createElement('style');
        globalFontStyle.id = 'drxaos-global-font-styles';
        globalFontStyle.textContent = globalFontStyles;
        document.head.appendChild(globalFontStyle);
    }
    var performanceMonitor = {
        startTime: 0,
        metrics: {},
        start: function(operation) {
            this.startTime = performance.now();
            this.metrics[operation] = { start: this.startTime };
        },
        end: function(operation) {
            if (this.metrics[operation]) {
                this.metrics[operation].duration = performance.now() - this.startTime;
            }
        },
        log: function(message, data) {
        }
    };
    var renderingOptimizer = {
        originClean: true,
        checkOriginClean: function() {
            var isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
            this.originClean = isSecure;
            if (!this.originClean) {
            }
            return this.originClean;
        },
        usePremultipliedAlpha: true,
        willReadFrequently: function() {
            return /Android TV|Google TV|WebOS|Tizen|Smart TV|TV|Fire TV|FireTV|AFT|Roku|Apple TV|Chromecast/i.test(navigator.userAgent);
        },
        applyCanvasOptimizations: function() {
            try {
                var canvasElements = document.querySelectorAll('canvas');
                canvasElements.forEach(function(canvas) {
                    if (canvas.getContext) {
                        try {
                            var context2d = canvas.getContext('2d', { willReadFrequently: true });
                            if (context2d) {
                            }
                        } catch(e) {
                        }
                        try {
                            var gl = canvas.getContext('webgl', { willReadFrequently: true });
                            if (gl) {
                            }
                        } catch(e) {
                        }
                        try {
                            var gl2 = canvas.getContext('webgl2', { willReadFrequently: true });
                            if (gl2) {
                            }
                        } catch(e) {
                        }
                        try {
                            var bitmap = canvas.getContext('bitmaprenderer', { willReadFrequently: true });
                            if (bitmap) {
                            }
                        } catch(e) {
                        }
                    }
                });
                if (typeof OffscreenCanvas !== 'undefined') {
                    var offscreenCanvases = document.querySelectorAll('canvas');
                    offscreenCanvases.forEach(function(canvas) {
                        if (canvas.transferControlToOffscreen) {
                            try {
                                var offscreen = canvas.transferControlToOffscreen();
                                if (offscreen.getContext) {
                                    var offscreenContext = offscreen.getContext('2d', { willReadFrequently: true });
                                    if (offscreenContext) {
                                    }
                                }
                            } catch(e) {
                            }
                        }
                    });
                }
                this.interceptCanvasContext();
            } catch(e) {
            }
        },
        interceptCanvasContext: function() {
            try {
                var originalGetContext = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {
                    if (contextType === '2d') {
                        if (!contextAttributes) {
                            contextAttributes = {};
                        }
                        contextAttributes.willReadFrequently = true;
                    }
                    if (contextType === 'webgl' || contextType === 'webgl2') {
                        if (!contextAttributes) {
                            contextAttributes = {};
                        }
                        contextAttributes.willReadFrequently = true;
                    }
                    if (contextType === 'bitmaprenderer') {
                        if (!contextAttributes) {
                            contextAttributes = {};
                        }
                        contextAttributes.willReadFrequently = true;
                    }
                    return originalGetContext.call(this, contextType, contextAttributes);
                };
                if (typeof OffscreenCanvas !== 'undefined' && OffscreenCanvas.prototype.getContext) {
                    var originalOffscreenGetContext = OffscreenCanvas.prototype.getContext;
                    OffscreenCanvas.prototype.getContext = function(contextType, contextAttributes) {
                        if (contextType === '2d') {
                            if (!contextAttributes) {
                                contextAttributes = {};
                            }
                            contextAttributes.willReadFrequently = true;
                        }
                        return originalOffscreenGetContext.call(this, contextType, contextAttributes);
                    };
                }
            } catch(e) {
            }
        },
        optimizeForDevice: function() {
            var isMobile = deviceDetection.isMobile();
            if (isMobile) {
                return {
                    useGPU: true,
                    premultipliedAlpha: true,
                    willReadFrequently: true,
                    optimizeForSpeed: false
                };
            } else {
                return {
                    useGPU: false,
                    premultipliedAlpha: true,
                    willReadFrequently: true,
                    optimizeForSpeed: false
                };
            }
        },
        applyOptimizations: function() {
            this.checkOriginClean();
            this.optimizeForDevice();
            this.applyCanvasOptimizations();
            this.fixDeprecatedSliders();
        },
        fixDeprecatedSliders: function() {
            try {
                var sliders = document.querySelectorAll('[style*="appearance: slider-vertical"], [style*="appearance:slider-vertical"]');
                sliders.forEach(function(slider) {
                    if (slider.tagName !== 'INPUT' || slider.type !== 'range') {
                        var newSlider = document.createElement('input');
                        newSlider.type = 'range';
                        newSlider.style.cssText = 'writing-mode: vertical-lr; direction: rtl;';
                        Array.from(slider.attributes).forEach(function(attr) {
                            if (attr.name !== 'style') {
                                newSlider.setAttribute(attr.name, attr.value);
                            }
                        });
                        slider.parentNode.replaceChild(newSlider, slider);
                    }
                });
                var deprecatedCSS = `
                    input[type="range"] {
                        writing-mode: vertical-lr !important;
                        direction: rtl !important;
                        appearance: none !important;
                        -webkit-appearance: none !important;
                        -moz-appearance: none !important;
                    }
                    *[style*="appearance: slider-vertical"],
                    *[style*="appearance:slider-vertical"] {
                        appearance: none !important;
                        -webkit-appearance: none !important;
                        -moz-appearance: none !important;
                        writing-mode: vertical-lr !important;
                        direction: rtl !important;
                    }
                    * {
                        appearance: none !important;
                        -webkit-appearance: none !important;
                        -moz-appearance: none !important;
                    }
                    input, button, select, textarea {
                        appearance: auto !important;
                        -webkit-appearance: auto !important;
                        -moz-appearance: auto !important;
                    }
                    input[type="range"] {
                        appearance: none !important;
                        -webkit-appearance: none !important;
                        -moz-appearance: none !important;
                        writing-mode: vertical-lr !important;
                        direction: rtl !important;
                    }
                `;
                styleManager.setStyle('drxaos-slider-fixes', deprecatedCSS);
            } catch(e) {
            }
        },
        setupDynamicElementObserver: function() {
            try {
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach(function(node) {
                                if (node.nodeType === 1) {
                                    if (node.style && (node.style.appearance === 'slider-vertical' || 
                                        node.getAttribute('style') && node.getAttribute('style').includes('slider-vertical'))) {
                                        node.style.appearance = 'none';
                                        node.style.writingMode = 'vertical-lr';
                                        node.style.direction = 'rtl';
                                    }
                                    if (node.tagName === 'CANVAS') {
                                        if (node.getContext) {
                                            try {
                                                var context = node.getContext('2d', { willReadFrequently: true });
                                                if (context) {
                                                }
                                            } catch(e) {
                                            }
                                        }
                                    }
                                    if (node.classList && node.classList.contains('selectbox-item')) {
                                        addIconsToSelectboxItem(node);
                                    }
                                    var childSliders = node.querySelectorAll && node.querySelectorAll('[style*="appearance: slider-vertical"], [style*="appearance:slider-vertical"]');
                                    if (childSliders) {
                                        childSliders.forEach(function(slider) {
                                            slider.style.appearance = 'none';
                                            slider.style.writingMode = 'vertical-lr';
                                            slider.style.direction = 'rtl';
                                        });
                                    }
                                    var childCanvases = node.querySelectorAll && node.querySelectorAll('canvas');
                                    if (childCanvases) {
                                        childCanvases.forEach(function(canvas) {
                                            if (canvas.getContext) {
                                                try {
                                                    var context = canvas.getContext('2d', { willReadFrequently: true });
                                                    if (context) {
                                                    }
                                                } catch(e) {
                                                }
                                            }
                                        });
                                    }
                                    var selectboxItems = node.querySelectorAll && node.querySelectorAll('.selectbox-item');
                                    if (selectboxItems && selectboxItems.length > 0) {
                                        selectboxItems.forEach(function(item) {
                                            addIconsToSelectboxItem(item);
                                        });
                                    }
                                }
                            });
                        }
                    });
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style']
                });
                return observer;
            } catch(e) {
                return null;
            }
        }
    };
    function addIconsToSelectboxItem(item) {
        try {
            var title = item.querySelector('.selectbox-item__title');
            if (!title) return;
            var titleText = title.textContent.trim();
            var iconContainer = item.querySelector('.selectbox-item__icon');
            if (!iconContainer) {
                iconContainer = document.createElement('div');
                iconContainer.className = 'selectbox-item__icon';
                item.insertBefore(iconContainer, item.firstChild);
            }
            var iconSVG = '';
            var lower = titleText.toLowerCase();
            if (lower.includes('онлайн') || lower.includes('lampac')) {
                iconSVG = BUTTON_ICON_SVGS.online;
            } else if (lower.includes('торрент')) {
                iconSVG = BUTTON_ICON_SVGS.torrent;
            } else if (lower.includes('смотреть') || lower.includes('play')) {
                iconSVG = BUTTON_ICON_SVGS.play;
            } else if (lower.includes('youtube') || lower.includes('трейлер')) {
                iconSVG = BUTTON_ICON_SVGS.trailer;
            }
            if (iconSVG) {
                iconContainer.innerHTML = iconSVG
                    .replace('width="28"', 'width="24"')
                    .replace('height="28"', 'height="24"');
                iconContainer.style.display = 'inline-block';
            } else {
                iconContainer.style.display = 'none';
            }
            var disabled = false;
            try {
                var inlineOpacity = item.style && item.style.opacity ? parseFloat(item.style.opacity) : null;
                if (inlineOpacity != null && !isNaN(inlineOpacity) && inlineOpacity < 0.9) disabled = true;
                var styleAttr = item.getAttribute && item.getAttribute('style');
                if (!disabled && styleAttr && /opacity\s*:\s*(0\.\d+|[01])/i.test(styleAttr)) {
                    var match = styleAttr.match(/opacity\s*:\s*([0-9.]+)/i);
                    if (match && parseFloat(match[1]) < 0.9) disabled = true;
                }
                var computedOpacity = window.getComputedStyle ? parseFloat(window.getComputedStyle(item).opacity || '1') : 1;
                if (!isNaN(computedOpacity) && computedOpacity < 0.9) disabled = true;
                if (!disabled && item.classList && item.classList.contains('selectbox-item--disabled')) disabled = true;
                if (!disabled && item.dataset) {
                    if (item.dataset.disabled === 'true' || item.dataset.enabled === 'false') disabled = true;
                }
            } catch(e) {
            }
            if (item.classList) {
                item.classList.toggle('drxaos-selectbox-disabled', disabled);
            }
        } catch(e) {
        }
    }
    var deviceDetection = {
        isMobile: function() {
            return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        isDesktop: function() {
            return !this.isMobile();
        },
        getDeviceType: function() {
            if (this.isMobile()) return 'mobile';
            return 'desktop';
        }
    };
    var styleManager = {
        styles: {},
        setStyle: function(id, css) {
            this.removeStyle(id);
            this.styles[id] = $('<style id="' + id + '">' + css + '</style>').appendTo('head');
        },
        removeStyle: function(id) {
            if (this.styles[id]) {
                this.styles[id].remove();
                delete this.styles[id];
            } else {
                $('#' + id).remove();
            }
        },
        clearAllStyles: function() {
            var styleIds = [
                'drxaos-advanced-styles',
                'drxaos-poster-styles', 
                'drxaos-interface-size-styles',
                'drxaos-font-family-style',
                'drxaos_font_weight_style',
                'drxaos-details-style',
                'drxaos-action-buttons',
                'drxaos-input-overlay-style',
                'drxaos_theme_style'
            ];
            styleIds.forEach(function(id) {
                $('#' + id).remove();
            });
            this.styles = {};
        }
    };
    styleManager.setStyle('drxaos-hide-card-type', '\n        body .card__type,\n        body .card__type::before,\n        body .card__type::after {\n            display: none !important;\n            opacity: 0 !important;\n            visibility: hidden !important;\n        }\n    ');
    var inputOverlay = (function createInputOverlay() {
        var overlayId = 'drxaos-input-overlay';
        var state = null;

        function ensureOverlayStyles() {
            if (document.getElementById('drxaos-input-overlay-style')) return;
            var overlayCSS = "\n                #drxaos-input-overlay{position:fixed;inset:0;z-index:2147483646;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-family:var(--drxaos-font-family);}\n                #drxaos-input-overlay[data-hidden=\\\"true\\\"]{opacity:0;pointer-events:none;}\n                #drxaos-input-overlay .drx-overlay-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.68);backdrop-filter:blur(8px);}\n                #drxaos-input-overlay .drx-overlay-card{position:relative;z-index:1;width:min(92vw,520px);background:rgba(17,20,24,0.97);border-radius:18px;padding:22px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 18px 48px rgba(0,0,0,0.55);display:flex;flex-direction:column;gap:16px;color:#f1f5f9;}\n                #drxaos-input-overlay .drx-overlay-title{font-size:20px;font-weight:700;text-align:center;letter-spacing:0.01em;}\n                #drxaos-input-overlay .drx-overlay-input{width:100%;height:48px;border-radius:12px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,18,22,0.95);color:#e2e8f0;padding:0 14px;font-size:16px;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);} \n                #drxaos-input-overlay .drx-overlay-input:focus{border-color:rgba(59,130,246,0.55);box-shadow:0 0 0 2px rgba(59,130,246,0.25);} \n                #drxaos-input-overlay .drx-overlay-buttons{display:flex;gap:12px;flex-wrap:wrap;}\n                #drxaos-input-overlay .drx-overlay-button{flex:1 1 30%;min-height:46px;border-radius:12px;border:1px solid rgba(148,163,184,0.35);background:rgba(30,41,59,0.92);color:#f8fafc;font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;user-select:none;}\n                #drxaos-input-overlay .drx-overlay-button:hover,\n                #drxaos-input-overlay .drx-overlay-button.focus{transform:translateY(-2px);background:rgba(51,65,85,0.95);border-color:rgba(59,130,246,0.45);} \n                #drxaos-input-overlay .drx-overlay-button--primary{background:linear-gradient(135deg,rgba(59,130,246,0.92),rgba(14,165,233,0.82));border-color:rgba(59,130,246,0.92);color:#fff;}\n                #drxaos-input-overlay .drx-overlay-button--danger{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.5);color:rgba(248,113,113,0.95);} \n                #drxaos-input-overlay .drx-overlay-button--ghost{background:rgba(15,23,42,0.75);border-color:rgba(148,163,184,0.2);} \n                #drxaos-input-overlay .drx-overlay-message{font-size:14px;color:#cbd5f5;text-align:center;line-height:1.4;}\n                @media (max-width:420px){#drxaos-input-overlay .drx-overlay-card{padding:18px;border-radius:16px;}#drxaos-input-overlay .drx-overlay-buttons{flex-direction:column;}#drxaos-input-overlay .drx-overlay-button{flex:1 1 auto;width:100%;}}\n            ";

            styleManager.setStyle('drxaos-input-overlay-style', overlayCSS);
        }

        function restoreFocus(previous) {
            if (!previous) return;
            try {
                if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.focus === 'function') {
                    setTimeout(function() { Lampa.Controller.focus(previous); }, 30);
                } else if (document.activeElement !== previous) {
                    previous.focus();
                }
            } catch (e) {
            }
        }

        function closeOverlay(result) {
            if (!state) return;
            document.removeEventListener('keydown', state.keyHandler, true);
            document.removeEventListener('click', state.outsideHandler, true);
            if (state.overlay && state.overlay.parentNode) {
                state.overlay.parentNode.removeChild(state.overlay);
            }
            drxaosLeaveFocusLock('input-overlay');
            restoreFocus(state.previousFocus);
            var resolve = state.resolve;
            state = null;
            if (resolve) {
                resolve(result || { action: 'cancel', value: '' });
            }
        }

        function makeKeyHandler() {
            return function handleKey(evt) {
                if (!state) return;
                var code = evt.key || '';
                var keyCode = typeof evt.keyCode === 'number' ? evt.keyCode : 0;
                if (code === 'Enter' || code === 'OK' || keyCode === 13) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    state.trigger('save');
                } else if (code === 'Escape' || code === 'Back' || code === 'Cancel' || keyCode === 461 || keyCode === 27) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    state.trigger('cancel');
                }
            };
        }

        function makeOutsideHandler() {
            return function handleOutside(evt) {
                if (!state) return;
                if (!state.overlay.contains(evt.target)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    state.trigger('cancel');
                }
            };
        }

        function openOverlay(options) {
            options = options || {};
            return new Promise(function(resolve) {
                ensureOverlayStyles();
                if (state) {
                    closeOverlay({ action: 'cancel', value: '' });
                }

                var overlay = document.createElement('div');
                overlay.id = overlayId;
                overlay.setAttribute('data-hidden', 'true');
                overlay.innerHTML = '' +
                    '<div class="drx-overlay-backdrop" data-overlay-act="cancel"></div>' +
                    '<div class="drx-overlay-card" role="dialog" aria-modal="true" aria-label="' + (options.title || 'Input') + '">' +
                        (options.title ? '<div class="drx-overlay-title">' + options.title + '</div>' : '') +
                        (options.message ? '<div class="drx-overlay-message">' + options.message + '</div>' : '') +
                        '<input class="drx-overlay-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />' +
                        '<div class="drx-overlay-buttons">' +
                            '<button type="button" class="selector drx-overlay-button drx-overlay-button--primary" data-overlay-act="save">' + (options.saveLabel || 'Сохранить') + '</button>' +
                            (options.allowClear === false ? '' : '<button type="button" class="selector drx-overlay-button drx-overlay-button--danger" data-overlay-act="clear">' + (options.clearLabel || 'Очистить') + '</button>') +
                            '<button type="button" class="selector drx-overlay-button drx-overlay-button--ghost" data-overlay-act="cancel">' + (options.cancelLabel || 'Отмена') + '</button>' +
                        '</div>' +
                    '</div>';

                document.body.appendChild(overlay);
                drxaosEnterFocusLock('input-overlay');

                var input = overlay.querySelector('.drx-overlay-input');
                input.value = (options.value || '').trim();
                input.placeholder = options.placeholder || '';

                var buttons = Array.from(overlay.querySelectorAll('.drx-overlay-button'));
                var previousFocus = document.activeElement;

                if (window.Lampa && Lampa.Controller) {
                    try {
                        Lampa.Controller.collectionSet($(overlay).find('.drx-overlay-button, .drx-overlay-input'));
                        Lampa.Controller.collectionFocus(input);
                    } catch (e) {
                    }
                }

                var localState = {
                    overlay: overlay,
                    resolve: resolve,
                    options: options,
                    input: input,
                    previousFocus: previousFocus,
                    trigger: function(action) {
                        var value = (input.value || '').trim();
                        if (action === 'save' && !value) {
                            action = options.allowEmpty ? 'save' : 'clear';
                        }
                        if (action === 'clear') value = '';
                        closeOverlay({ action: action, value: value });
                    }
                };

                localState.keyHandler = makeKeyHandler();
                localState.outsideHandler = makeOutsideHandler();
                state = localState;

                document.addEventListener('keydown', localState.keyHandler, true);
                document.addEventListener('click', localState.outsideHandler, true);

                overlay.querySelectorAll('[data-overlay-act]').forEach(function(node) {
                    node.addEventListener('click', function(evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        var action = node.getAttribute('data-overlay-act');
                        localState.trigger(action);
                    }, { passive: false });
                });

                buttons.forEach(function(btn) {
                    btn.addEventListener('mouseenter', function() {
                        btn.classList.add('focus');
                    });
                    btn.addEventListener('mouseleave', function() {
                        btn.classList.remove('focus');
                    });
                });

                setTimeout(function() {
                    overlay.removeAttribute('data-hidden');
                    input.focus();
                    input.select();
                }, 30);
            });
        }

        return {
            open: openOverlay,
            close: closeOverlay,
            isOpen: function() { return !!state; }
        };
    })();
    var ADVANCED_SCHEMA = {
    };
    function buildAdvancedDefaults() {
        var base = {
            modalOpacity: 95,
            modalBlur: 50,
            modalRadius: 2,
            menuWidth: 20,
            menuOpacity: 95,
            menuBlur: 30,
            contrast: 100,
            brightness: 100,
            saturation: 100,
            hue: 0
        };
        Object.keys(ADVANCED_SCHEMA).forEach(function(key) {
            base[key] = ADVANCED_SCHEMA[key]["default"];
        });
        return base;
    }
    var advancedSettings = buildAdvancedDefaults();
    function clamp(value, min, max, fallback) {
        var num = parseFloat(value);
        if (isNaN(num)) num = fallback;
        if (typeof min === 'number') num = Math.max(min, num);
        if (typeof max === 'number') num = Math.min(max, num);
        return num;
    }
    function loadAdvancedSettings() {
        try {
            Object.keys(ADVANCED_SCHEMA).forEach(function(key) {
                var schema = ADVANCED_SCHEMA[key];
                var stored = Lampa.Storage.get(schema.storage);
                advancedSettings[key] = schema.parse(stored);
            });
        } catch(e) {
        }
    }
    function saveAdvancedSettings() {
        try {
            Object.keys(ADVANCED_SCHEMA).forEach(function(key) {
                var schema = ADVANCED_SCHEMA[key];
                var value = advancedSettings[key];
            drxaosSafeSet(schema.storage, schema.serialize ? schema.serialize(value) : value);
            });
        } catch(e) {
        }
    }
    function setAdvancedSetting(key, rawValue) {
        if (!ADVANCED_SCHEMA[key]) return;
        advancedSettings[key] = ADVANCED_SCHEMA[key].parse(rawValue);
        saveAdvancedSettings();
        applyAdvancedSettings();
    }
    function applyAdvancedSettings() {
        try {
            performanceMonitor.start('applyAdvancedSettings');
            if (!window.jQuery || !window.$) return;
            applyModernHoverStyles();
            styleManager.removeStyle('drxaos-advanced-styles');
            styleManager.removeStyle('drxaos-poster-styles');
            var s = advancedSettings;
            var baseCSS = `
                .modal, .modal__content {
                    border-radius: ${s.modalRadius}em !important;
                    background: rgba(10, 12, 20, ${s.modalOpacity / 100}) !important;
                }
                .menu {
                    width: ${s.menuWidth}em !important;
                    background: transparent !important;
                }
                .card__img img {
                    filter: contrast(${s.contrast}%) brightness(${s.brightness}%) saturate(${s.saturation}%) hue-rotate(${s.hue}deg) !important;
                }
                .card-more__box {
                    background: rgba(8, 10, 18, var(--drxaos-surface-opacity)) !important;
                    border: 2px solid rgba(255, 255, 255, 0.95) !important;
                    border-radius: 12px !important;
                    padding: 1.5em !important;
                }
                .card-more__title {
                    color: var(--text-main) !important;
                    font-weight: 700 !important;
                }
                .online-prestige {
                    background: rgba(8, 10, 18, var(--drxaos-surface-opacity)) !important;
                    border: 2px solid rgba(255, 255, 255, 0.95) !important;
                    border-radius: 12px !important;
                    padding: 1em !important;
                    transition: none !important;
                }
                .online-prestige.focus,
                .online-prestige:hover {
                    border-color: var(--theme-primary) !important;
                    box-shadow: 0 0 20px var(--theme-primary) !important;
                    transform: none !important; /* FIXED: Disable scale */
                }
            `;
            var posterCSS = `
                body .card,
                body .card.card {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                body .card .card__img,
                body .card .card__img img,
                body .card.card .card__img img {
                    background: transparent !important;
                    border-radius: 12px !important;
                    border: none !important;
                    outline: none !important;
                    transition: none !important;
                }
                body .card,
                body .card .card__view,
                body .card .card__img {
                    transition: none !important;
                    transform: none !important;
                }
                body .card:hover,
                body .card.focus,
                body .card.hover,
                body .card.card--focus {
                    transform: none !important;
                }
                /* Убираем обводку с карточки */
                body .card:hover,
                body .card.focus,
                body .card.hover,
                body .card.card--focus {
                    outline: none !important;
                }
                body .card:hover .card__img,
                body .card.focus .card__img,
                body .card.card--focus .card__img {
                    transform: none !important;
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                }
                body .card.focus .card__img,
                body .card.card--focus .card__img {
                    transform: none !important;
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                }
                body .card:hover .card__img img,
                body .card.focus .card__img img,
                body .card.card--focus .card__img img {
                    border: none !important;
                    outline: none !important;
                }
                body .card .card__view::before,
                body .card .card__img::after,
                body .card .card__img::before {
                    border: none !important;
                    outline: none !important;
                }
                /* Не скрываем ::after на card__view, так как там наша светящаяся линия */
                .card .card__view {
                    border-radius: 12px !important;
                }
            `;
            styleManager.setStyle('drxaos-advanced-styles', baseCSS);
            styleManager.setStyle('drxaos-poster-styles', posterCSS);
            performanceMonitor.end('applyAdvancedSettings');
        } catch(e) {
        }
    }
    loadAdvancedSettings();
'use strict';
Lampa.Lang.add({
drxaos_themes: { ru: 'DRXAOS Темы', en: 'DRXAOS Themes', uk: 'DRXAOS Теми' },
drxaos_theme: { ru: 'Цветовая схема', en: 'Color Scheme', uk: 'Кольорова схема' },
drxaos_theme_desc: { ru: 'Выберите цветовую схему интерфейса', en: 'Choose interface color scheme', uk: 'Виберіть кольорову схему інтерфейсу' },
drxaos_font_weight: { ru: 'Толщина шрифта', en: 'Font Weight', uk: 'Товщина шрифту' },
drxaos_font_weight_desc: { ru: 'Глобальная настройка толщины шрифта для всех тем', en: 'Global font weight setting for all themes', uk: 'Глобальне налаштування товщини шрифту для всіх тем' },
drxaos_font_family: { ru: 'Выбрать шрифт', en: 'Typeface', uk: 'Вибір шрифту' },
drxaos_font_family_desc: { ru: 'Глобальный выбор шрифта интерфейса', en: 'Select the global interface typeface', uk: 'Оберіть глобальний шрифт інтерфейсу' },
drxaos_quick_theme: { ru: 'Быстрый выбор темы', en: 'Quick Theme Selector', uk: 'Швидкий вибір теми' },
theme_midnight: { ru: '🌙 Полночь', en: '🌙 Midnight', uk: '🌙 Північ' },
theme_red: { ru: '🟥 Red', en: '🟥 Red', uk: '🟥 Red' },
theme_sunset: { ru: '🌅 Закат', en: '🌅 Sunset', uk: '🌅 Захід' },
theme_slate: { ru: '⚫ Грифель', en: '⚫ Slate', uk: '⚫ Грифель' },
theme_lavender: { ru: '💜 Лаванда', en: '💜 Lavender', uk: '💜 Лаванда' },
theme_amber: { ru: '👾 Неоновый демон', en: '👾 Neon Demon', uk: '👾 Неоновий демон' },
theme_gradient: { ru: '🌈 Градиент', en: '🌈 Gradient', uk: '🌈 Градієнт' },
theme_latte: { ru: '☕ Латте', en: '☕ Latte', uk: '☕ Лате' },
drxaos_btn_play: { ru: 'Смотреть', en: 'Watch', uk: 'Дивитися' },
drxaos_btn_online: { ru: 'Онлайн', en: 'Online', uk: 'Онлайн' },
drxaos_btn_torrent: { ru: 'Торренты', en: 'Torrents', uk: 'Торренти' },
drxaos_btn_trailer: { ru: 'YouTube', en: 'YouTube', uk: 'YouTube' },
drxaos_btn_book: { ru: 'Избранное', en: 'Favorites', uk: 'Вибране' },
drxaos_btn_reaction: { ru: 'Реакции', en: 'Reactions', uk: 'Реакції' },
drxaos_btn_subscribe: { ru: 'Подписаться', en: 'Subscribe', uk: 'Підписатися' },
drxaos_btn_options: { ru: 'Опции', en: 'Options', uk: 'Опції' },
reset_settings: { ru: '🔄 Сбросить настройки', en: '🔄 Reset Settings', uk: '🔄 Скинути налаштування' },
reset_settings_desc: { ru: 'Вернуть все настройки к значениям по умолчанию', en: 'Reset all settings to defaults', uk: 'Повернути всі налаштування до значень за замовчуванням' },
drxaos_badge_quality: { ru: 'Плашка качества', en: 'Quality badge', uk: 'Бейдж якості' },
drxaos_badge_quality_desc: { ru: 'Показывать 4K/FHD/HD статус в правом верхнем углу', en: 'Show the 4K/FHD/HD badge in the top-right corner', uk: 'Показувати бейдж 4K/FHD/HD у правому верхньому куті' },
drxaos_badge_status: { ru: 'Плашка статуса', en: 'Status badge', uk: 'Бейдж статусу' },
drxaos_badge_status_desc: { ru: 'Показывать дату следующей серии или статус релиза', en: 'Show next episode countdown or release status', uk: 'Показувати дату наступної серії або статус релізу' },
drxaos_badge_season: { ru: 'Плашка сезонов', en: 'Seasons badge', uk: 'Бейдж сезонів' },
drxaos_badge_season_desc: { ru: 'Показывать прогресс текущего сезона', en: 'Display current season progress', uk: 'Показувати прогрес поточного сезону' },
drxaos_badge_type: { ru: 'Тип контента', en: 'Content type', uk: 'Тип контенту' },
drxaos_badge_type_desc: { ru: 'Показывать бейдж «Фильм» или «Сериал»', en: 'Show the “Movie” or “Series” badge', uk: 'Показувати бейдж «Фільм» або «Серіал»' },
drxaos_badge_country: { ru: 'Страна производства', en: 'Country badge', uk: 'Бейдж країни' },
drxaos_badge_country_desc: { ru: 'Показывать код страны в верхнем левом углу', en: 'Show the production country code near the poster corner', uk: 'Показувати код країни біля кута постера' },
drxaos_badge_year: { ru: 'Год релиза', en: 'Year badge', uk: 'Бейдж року' },
drxaos_badge_year_desc: { ru: 'Показывать год релиза в нижнем правом углу', en: 'Show release year in the bottom-right corner', uk: 'Показувати рік релізу у правому нижньому куті' },
source_filter: { ru: '🔍 Фильтр источников', en: '🔍 Source Filter', uk: '🔍 Фільтр джерел' },
source_filter_desc: { ru: 'Показывает тип источника (Онлайн/Торрент)', en: 'Show source type (Online/Torrent)', uk: 'Показує тип джерела (Онлайн/Торент)' },
movie_quality: { ru: '🎯 Качество фильмов', en: '🎯 Movie Quality', uk: '🎯 Якість фільмів' },
movie_quality_desc: { ru: 'Показывает качество: 4K, FHD, HD, SD (требует JacRed)', en: 'Show quality: 4K, FHD, HD, SD (requires JacRed)', uk: 'Показує якість: 4K, FHD, HD, SD (потрібен JacRed)' },
tmdb_api_key_set: { ru: 'TMDB API: ', en: 'TMDB API: ', uk: 'TMDB API: ' },
tmdb_api_key_notset: { ru: 'TMDB API (не указан)', en: 'TMDB API (not set)', uk: 'TMDB API (не вказано)' },
tmdb_api_key_desc: { ru: 'Нажмите для ввода ключа. Получить: themoviedb.org/settings/api', en: 'Click to enter key. Get it: themoviedb.org/settings/api', uk: 'Натисніть для введення ключа. Отримати: themoviedb.org/settings/api' },
jacred_url_set: { ru: 'JacRed: ', en: 'JacRed: ', uk: 'JacRed: ' },
jacred_url_notset: { ru: 'JacRed URL (не указан)', en: 'JacRed URL (not set)', uk: 'JacRed URL (не вказано)' },
jacred_url_desc: { ru: 'Нажмите для ввода URL (без http://)', en: 'Click to enter URL (without http://)', uk: 'Натисніть для введення URL (без http://)' },
tmdb_prompt: { ru: 'Введите TMDB API ключ (32 символа):', en: 'Enter TMDB API key (32 characters):', uk: 'Введіть TMDB API ключ (32 символи):' },
tmdb_saved: { ru: '✅ TMDB API ключ сохранён: ', en: '✅ TMDB API key saved: ', uk: '✅ TMDB API ключ збережено: ' },
tmdb_removed: { ru: '🗑️ TMDB API ключ удалён', en: '🗑️ TMDB API key removed', uk: '🗑️ TMDB API ключ видалено' },
jacred_prompt: { ru: 'Введите JacRed URL (например: https://sync.jacred.stream):', en: 'Enter JacRed URL (e.g. https://sync.jacred.stream):', uk: 'Введіть JacRed URL (наприклад: https://sync.jacred.stream):' },
jacred_saved: { ru: '✅ JacRed URL сохранён: ', en: '✅ JacRed URL saved: ', uk: '✅ JacRed URL збережено: ' },
drxaos_overlay_save: { ru: 'Сохранить', en: 'Save', uk: 'Зберегти' },
drxaos_overlay_clear: { ru: 'Очистить', en: 'Clear', uk: 'Очистити' },
drxaos_overlay_cancel: { ru: 'Отмена', en: 'Cancel', uk: 'Скасувати' },
drxaos_overlay_tmdb_title: { ru: 'TMDB API ключ', en: 'TMDB API key', uk: 'TMDB API ключ' },
drxaos_overlay_tmdb_hint: { ru: 'Введите персональный ключ TMDB. Без него будет использоваться встроенный ключ.', en: 'Enter your personal TMDB key. Built-in key is used if left empty.', uk: 'Введіть власний ключ TMDB. Без нього використовується вбудований ключ.' },
drxaos_overlay_jacred_title: { ru: 'JacRed домен', en: 'JacRed domain', uk: 'JacRed домен' },
drxaos_overlay_jacred_hint: { ru: 'Укажите адрес без http:// или https://. Например: sync.jacred.stream', en: 'Specify address without http:// or https://. Example: sync.jacred.stream', uk: 'Вкажіть адресу без http:// чи https://. Наприклад: sync.jacred.stream' },
drxaos_overlay_jacred_placeholder: { ru: 'например: sync.jacred.stream', en: 'e.g. sync.jacred.stream', uk: 'наприклад: sync.jacred.stream' },
setting_off: { ru: 'Выключено', en: 'Off', uk: 'Вимкнено' },
setting_on: { ru: 'Включено', en: 'On', uk: 'Увімкнено' }
});
/* DRXAOS Themes — включение трех функций по умолчанию (embedded, first-run safe) */
(function(){ 'use strict';
  function whenReady(cb){
    if (window.Lampa && Lampa.Storage) { cb(); } else { setTimeout(function(){ whenReady(cb); }, 200); }
  }
  whenReady(function(){
    try{
      var toggleKeys = ['source_filter', 'movie_quality'];
      toggleKeys.forEach(function(key){
        var current = normalizeToggle(Lampa.Storage.get(key));
        if (current === 'unset') current = 'on';
        drxaosSafeSet(key, current);

        var legacyKey = 'drxaos_' + key;
        var legacyValue = normalizeToggle(Lampa.Storage.get(legacyKey));
        if (legacyValue === 'unset') {
          drxaosSafeSet(legacyKey, current);
        } else {
          drxaosSafeSet(legacyKey, legacyValue);
        }
      });
      if (typeof window.drxaosApplyAll === 'function') { window.drxaosApplyAll(); }      else { window.drxaosPostDefaultsQueue.push('apply'); }
      // Сообщим окружению о возможном изменении настроек
      if (Lampa.Listener && Lampa.Listener.send){
        Lampa.Listener.send('settings:updated', { name: 'drxaos_themes', source: 'defaults' });
      }
      var bootstrapFlag = Lampa.Storage.get('drxaos_bootstrap_done');
      if (!bootstrapFlag) {
        drxaosSafeSet('drxaos_bootstrap_done', '1');
        setTimeout(function(){ location.reload(); }, 300);
      }
    }catch(e){}
  });
  function normalizeToggle(value){
    if (value === undefined || value === null || value === '') return 'unset';
    if (value === 'on' || value === 'off') return value;
    if (typeof value === 'boolean') return value ? 'on' : 'off';
    var str = String(value).trim().toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes') return 'on';
    if (str === 'false' || str === '0' || str === 'no') return 'off';
    return 'unset';
  }
})();
(function(){ 'use strict';
  function whenReady(cb){
    if (window.Lampa && Lampa.SettingsApi) { cb(); } else { setTimeout(function(){ whenReady(cb); }, 200); }
  }
  whenReady(function(){
    try{
      if (Lampa.SettingsApi.__drxaosWrapped) return;
      var originalAddParam = Lampa.SettingsApi.addParam;
      Lampa.SettingsApi.addParam = function(cfg){
        if (cfg && cfg.component === 'drxaos_themes') {
          var originalChange = cfg.onChange;
          cfg.onChange = function() {
            try {
              if (typeof originalChange === 'function') {
                originalChange.apply(this, arguments);
              }
            } finally {
              scheduleDrxaosApplyAll();
            }
          };
        }
        return originalAddParam.call(this, cfg);
      };
      Lampa.SettingsApi.__drxaosWrapped = true;
    } catch(e) {
      
    }
  });
})();
var prevtheme = '';
var applyTheme = debounce(function(theme) {
    applyThemeImmediate(theme);
}, CONFIG.PERFORMANCE.DEBOUNCE_DELAY);
function applyThemeImmediate(theme) {
    try {
        var head = document.head || document.getElementsByTagName('head')[0];
        if (!head) {
            
            return;
        }
    var commonStyles = `/* ЦЕНТРИРОВАНИЕ ИКОНКИ PLAY + ЦВЕТ ТЕМЫ */
.card__icons{position:absolute!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;z-index:5!important}
.card__icons-inner{display:flex!important;align-items:center!important;justify-content:center!important}
.card__icon{margin:0!important;color:rgb(var(--primary-rgb))!important;filter:drop-shadow(0 0 8px rgba(var(--primary-rgb),0.8))!important}
.icon--play{color:rgb(var(--primary-rgb))!important}
.icon--play svg,.card__icon svg{fill:rgb(var(--primary-rgb))!important;stroke:rgb(var(--primary-rgb))!important}
/* УДАЛЕНО: ФОНЫ У ПЛАШЕК - ПРИМЕНЯЕТСЯ ЗОЛОТОЙ ТЕКСТ БЕЗ ФОНА */
body .card__type,
body .full-start-new__right {
    background: transparent !important;
    background-color: transparent !important;
}
body .full-start__rate,
body .full-start-new__rate{
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    color: #FFD700 !important;
    font-weight: 700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
    box-shadow: none !important;
}
body .card__rate{
    background: none !important;
    background-color: transparent !important;
    color: #FFD700 !important;
    font-weight: 700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}
body .card__quality{
    background: none !important;
    background-color: transparent !important;
    color: #FFD700 !important;
    font-weight: 700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}
body .card__vote{
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    color: #FFD700 !important;
    font-weight: 700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}
body .full-start__tags>*,body .full-start-new__tags>*{background:rgba(var(--primary-rgb),0.85)!important;color:#fff!important}
body .full-start__rate.rate--tomatoes,
body .full-start__rate.rate--tomatoes span{color:#d97767!important}
body .full-start__rate.rate--tomatoes_bad,
body .full-start__rate.rate--tomatoes_bad span{color:#b36859!important}
body .full-start__rate.rate--popcorn,
body .full-start__rate.rate--popcorn span{color:#d9be73!important}
body .full-start__rate.rate--imdb,
body .full-start__rate.rate--imdb span{color:#d6b957!important}
body .full-start__rate.rate--tmdb,
body .full-start__rate.rate--tmdb span{color:#7fb8c9!important}
body .full-start__rate.rate--metacritic,
body .full-start__rate.rate--metacritic span{color:#d6b862!important}
:root {
    --perf-blur: none;
    --perf-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    --perf-transition: none;
    --perf-backdrop: none;
    --perf-transform: translateZ(0);
    --drxaos-triad-a-rgb: 46, 52, 64;
    --drxaos-triad-b-rgb: 64, 46, 52;
    --drxaos-triad-c-rgb: 52, 64, 46;
    --drxaos-text-primary: #E0E0E0;
    --drxaos-text-secondary: #B0B0B0;
    --drxaos-bg-color: rgba(var(--primary-rgb, 90, 52, 148), 0.16);
    --drxaos-accent-color: var(--theme-accent, var(--theme-primary, #5a3494));
    --drxaos-text-color: var(--text-main, #ffffff);
}
@media (max-width: 1366px) and (max-height: 768px) {
    :root {
        --perf-blur: blur(10px);
        --perf-shadow: 0 2px 8px rgba(0, 0, 0, var(--drxaos-surface-opacity));
        --perf-transition: none;
        --perf-backdrop: blur(10px);
    }
}
@media (pointer: coarse) and (hover: none), 
       (max-width: 1920px) and (min-width: 1280px) and (orientation: landscape) {
    :root {
        --perf-blur: none;
        --perf-shadow: 0 2px 4px rgba(0, 0, 0, var(--drxaos-surface-opacity));
        --perf-transition: none;
        --perf-backdrop: none;
        --perf-transform: none;
    }
}
@media (min-width: 1920px) and (pointer: coarse) {
    :root {
        --perf-blur: none;
        --perf-shadow: 0 1px 3px rgba(0, 0, 0, var(--drxaos-surface-opacity));
        --perf-transition: none;
        --perf-backdrop: none;
    }
}
@font-face {
    font-family: 'Netflix Sans';
    font-weight: 100;
    src: url('https://assets.nflxext.com/ffe/siteui/fonts/netflix-sans/v3/NetflixSans_W_Th.woff2') format('woff2');
}
@font-face {
    font-family: 'Netflix Sans';
    font-weight: 300;
    src: url('https://assets.nflxext.com/ffe/siteui/fonts/netflix-sans/v3/NetflixSans_W_Lt.woff2') format('woff2');
}
@font-face {
    font-family: 'Netflix Sans';
    font-weight: 400;
    src: url('https://assets.nflxext.com/ffe/siteui/fonts/netflix-sans/v3/NetflixSans_W_Rg.woff2') format('woff2');
}
@font-face {
    font-family: 'Netflix Sans';
    font-weight: 700;
    src: url('https://assets.nflxext.com/ffe/siteui/fonts/netflix-sans/v3/NetflixSans_W_Bd.woff2') format('woff2');
}
:root {
    --netflix-radius-sm: 8px;
    --netflix-radius-md: 12px;
    --netflix-radius-lg: 16px;
    --netflix-radius-xl: 20px;
    --netflix-shadow-sm: 0 2px 8px rgba(0, 0, 0, var(--drxaos-surface-opacity));
    --netflix-shadow-md: 0 4px 16px rgba(0, 0, 0, var(--drxaos-surface-opacity));
    --netflix-shadow-lg: 0 8px 32px rgba(0, 0, 0, var(--drxaos-surface-opacity));
    --netflix-transition: none;
    --netflix-glass: rgba(20, 20, 20, 0.95);
    --netflix-glass-border: rgba(255, 255, 255, 0.95);
}
.card-more__box {
    background: rgba(var(--layer-rgb), var(--drxaos-surface-opacity)) !important;
    border: 2px solid var(--theme-primary, #5a3494) !important;
    border-radius: 1em !important;
    filter: saturate(180%) !important;
    -webkit-filter: saturate(180%) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
    padding: 1em !important;
    transition: none !important;
}
.card-more__box:hover,
.card-more__box.focus {
    background: var(--theme-primary, #5a3494) !important;
    border: 2px solid var(--theme-accent, #0088bb) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
    transform: none !important; /* FIXED: Disable scale */
}
.card-more__title {
    color: var(--text-main, #ffffff) !important;
    font-family: var(--drxaos-font-family) !important;
    font-weight: 600 !important;
    text-align: center !important;
}
.online-prestige {
    background: var(--drxaos-bg-color) !important;
    border: 2px solid var(--drxaos-accent-color) !important;
    border-radius: 12px !important;
    padding: 1em !important;
    transition: none !important;
}
.online-prestige.focus,
.online-prestige:hover {
    border-color: var(--drxaos-accent-color) !important;
    box-shadow: 0 0 20px var(--drxaos-accent-color) !important;
    transform: none !important; /* FIXED: Disable scale */
}
.online-prestige__img {
    border-radius: 8px !important;
    overflow: hidden !important;
}
.online-prestige__title,
.online-prestige__info,
.online-prestige__footer {
    color: var(--drxaos-text-color) !important;
    font-family: var(--drxaos-font-family) !important;
}
body {
    background: #141414 !important;
    background: linear-gradient(135deg, #141414 0%, #0a0a0a 100%) !important;
}

.app {
    background: #141414 !important;
}

.app__default {
    background: transparent !important;
}

body .card, .card {
    background: transparent !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
    transition: var(--netflix-transition) !important;
}
body .card:hover,
body .card.focus,
body .card.hover {
    transform: none !important;
    z-index: 999 !important;
    position: relative !important;
}
body:not(.drxaos-buttons-ready) .full-start__buttons .full-start__button:not(.drxaos-btn),
body:not(.drxaos-buttons-ready) .full-start-new__buttons .full-start__button:not(.drxaos-btn) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
}
body .full-start__buttons:not(.drxaos-buttons-unwrapped) .full-start__button,
body .full-start-new__buttons:not(.drxaos-buttons-unwrapped) .full-start__button {
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
}
body:not(.drxaos-buttons-ready) .full-start__buttons .full-start__button,
body:not(.drxaos-buttons-ready) .full-start-new__buttons .full-start__button {
    opacity: 0 !important;
    pointer-events: none !important;
}
body.drxaos-buttons-ready .full-start__buttons .full-start__button,
body.drxaos-buttons-ready .full-start-new__buttons .full-start__button {
    opacity: 1 !important;
}
body .card__view,
.card__view {
    border-radius: 12px !important;
    overflow: hidden !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    transform: none !important;
}
body .card:hover .card__view,
body .card.focus .card__view,
body .card.hover .card__view,
body .card.card--focus .card__view {
    overflow: visible !important;
}
body .card__img,
.card__img {
    border-radius: 12px !important;
    overflow: hidden !important;
    transform: none !important;
}
body .card__img img,
.card__img img {
    border-radius: 12px !important;
    transform: none !important;
}
body .card:hover .card__view,
body .card.focus .card__view,
body .card.hover .card__view,
body .card:hover .card__img,
body .card.focus .card__img,
body .card.hover .card__img,
body .card:hover .card__img img,
body .card.focus .card__img img,
body .card.hover .card__img img {
    transform: none !important;
    scale: 1 !important;
}
body .card:hover .card__view,
body .card.focus .card__view,
body .card.hover .card__view,
body .card.card--focus .card__view {
    transform: none !important;
    box-shadow: none !important;
    outline: none !important;
    overflow: visible !important;
}
body .card {
    position: relative !important;
}
body .card .card__view {
    position: relative !important;
}
/* По умолчанию линия скрыта */
body .card .card__view::after {
    content: none !important;
    display: none !important;
    border: none !important;
    outline: none !important;
}
/* Толстая светящаяся линия внизу постера при hover/focus */
body .card:hover .card__view::after,
body .card.focus .card__view::after,
body .card.hover .card__view::after,
body .card.card--focus .card__view::after {
    content: '' !important;
    position: absolute !important;
    bottom: 0 !important;
    top: auto !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: 10px !important;
    min-height: 10px !important;
    max-height: 10px !important;
    margin: 0 !important;
    padding: 0 !important;
    background: linear-gradient(90deg, rgba(var(--primary-rgb, 107, 63, 174), 1), rgba(var(--secondary-rgb, 0, 200, 230), 1)) !important;
    box-shadow: 0 0 25px rgba(var(--primary-rgb, 107, 63, 174), 1), 0 0 50px rgba(var(--primary-rgb, 107, 63, 174), 0.8) !important;
    border-radius: 0 0 12px 12px !important;
    border: none !important;
    outline: none !important;
    z-index: 1001 !important;
    display: block !important;
    pointer-events: none !important;
    transform: none !important;
    inset: auto auto 0 0 !important;
}
body .card.focus .card__view::after,
body .card.card--focus .card__view::after {
    background: linear-gradient(90deg, rgba(var(--secondary-rgb, 0, 200, 230), 1), rgba(var(--primary-rgb, 107, 63, 174), 1)) !important;
    box-shadow: 0 0 30px rgba(var(--secondary-rgb, 0, 200, 230), 1), 0 0 60px rgba(var(--secondary-rgb, 0, 200, 230), 0.9) !important;
}
/* Убираем обводку с карточки */
body .card:hover,
body .card.focus,
body .card.hover,
body .card.card--focus {
    outline: none !important;
}
body .card:hover .card__img,
body .card.focus .card__img,
body .card.hover .card__img,
body .card.card--focus .card__img {
    transform: none !important;
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
}
body .card:hover .card__img img,
body .card.focus .card__img img,
body .card.hover .card__img img,
body .card.card--focus .card__img img {
    border: none !important;
    outline: none !important;
}
body .card__img,
body .card__img img {
    border: none !important;
    outline: none !important;
}
body .settings-param, .settings-param,
body .settings-folder, .settings-folder {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 1em 1.2em !important;
    margin: 0.4em 0 !important;
    transition: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
    position: relative !important;
    overflow: hidden !important;
}
body .settings-param::before,
body .settings-folder::before,
.settings-param::before,
.settings-folder::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.45), rgba(var(--secondary-rgb), 0.35));
    opacity: 0;
    transform: none !important; /* FIXED: Disable scale */
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
    z-index: 0;
}
body .settings-param.focus, body .settings-param:hover,
body .settings-folder.focus, body .settings-folder:hover {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    transform: none !important;
}
body .settings-param.focus::before,
body .settings-param:hover::before,
body .settings-folder.focus::before,
body .settings-folder:hover::before,
.settings-param.focus::before,
.settings-param:hover::before,
.settings-folder.focus::before,
.settings-folder:hover::before {
    opacity: 1;
    transform: none !important; /* FIXED: Disable scale */
}
body .settings-param.focus *, body .settings-param:hover *,
body .settings-folder.focus *, body .settings-folder:hover * {
    color: var(--text-main) !important;
    position: relative;
    z-index: 1;
}
body .selectbox-item, .selectbox-item {
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.2) !important;
    border-radius: 0 !important;
    padding: 0.8em 1em !important;
    margin: 0 !important;
    transition: none !important;
    position: relative !important;
    overflow: hidden !important;
    z-index: 0 !important;
}
body .selectbox-item::before, .selectbox-item::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.45), rgba(var(--secondary-rgb), 0.35));
    opacity: 0;
    transform: none !important; /* FIXED: Disable scale */
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
    z-index: 0;
}
body .selectbox-item:hover::before,
body .selectbox-item.focus::before,
body .selectbox-item.selected::before,
.selectbox-item:hover::before,
.selectbox-item.focus::before,
.selectbox-item.selected::before {
    opacity: 1;
    transform: none !important; /* FIXED: Disable scale */
}
body .selectbox-item > *:not(.selectbox-item__checkbox),
.selectbox-item > *:not(.selectbox-item__checkbox) {
    position: relative;
    z-index: 1;
}
body .selectbox-item__checkbox {
    position: absolute !important;
    top: 1.2em !important;
    right: 1.5em !important;
    width: 1.4em !important;
    height: 1.4em !important;
    border: 0.2em solid rgba(255, 255, 255, 0.35) !important;
    border-radius: 0.3em !important;
    box-sizing: border-box !important;
}
body .selectbox-item--checkbox {
    padding-right: 4em !important;
}
body .selectbox-item--checked .selectbox-item__checkbox {
    border-color: var(--theme-accent, #fff) !important;
}
body .selectbox-item--checked .selectbox-item__checkbox::after {
    content: "";
    position: absolute;
    width: 0.35em;
    height: 0.7em;
    border-right: 0.2em solid var(--theme-accent, #fff);
    border-bottom: 0.2em solid var(--theme-accent, #fff);
    right: 0.25em;
    top: 0.05em;
    transform: rotate(45deg);
}
body .selectbox-item.focus, body .selectbox-item:hover {
    background: rgba(var(--primary-rgb), 0.2) !important;
    border-bottom: 1px solid var(--theme-accent) !important;
    box-shadow: none !important;
}
body .selectbox-item__poster, .selectbox-item__poster { display: none !important; }
body .selectbox-item__icon, .selectbox-item__icon { 
    display: inline-block !important; 
    width: 24px !important;
    height: 24px !important;
    margin-right: 12px !important;
    vertical-align: middle !important;
    flex-shrink: 0 !important;
}
body .selectbox-item__title, .selectbox-item__title {
    font-size: 1.1em !important;
    line-height: 1.3 !important;
    padding: 0 !important;
}
body .selectbox-item.drxaos-selectbox-disabled .selectbox-item__title,
body .selectbox-item.drxaos-selectbox-disabled .selectbox-item__subtitle {
    color: rgba(255, 255, 255, 0.45) !important;
}
body .selectbox-item.drxaos-selectbox-disabled .selectbox-item__icon svg path,
body .selectbox-item.drxaos-selectbox-disabled .selectbox-item__icon svg rect,
body .selectbox-item.drxaos-selectbox-disabled .selectbox-item__icon svg circle {
    opacity: 0.65 !important;
}
body .selectbox-item__subtitle, .selectbox-item__subtitle {
    font-size: 0.995em !important;
    margin-top: 0.3em !important;
    opacity: 0.95 !important;
}
body .torrent-serial, .torrent-serial {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    gap: 1em !important;
    background: rgba(var(--bg-rgb, 12, 12, 12), 0.35) !important;
    border: 1px solid rgba(var(--primary-rgb), 0.25) !important;
    border-radius: 0.6em !important;
    padding: 1em !important;
    margin: 0.5em 0 !important;
    min-height: 140px !important;
    transition: background 0.25s ease, border 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease !important;
    position: relative !important;
    overflow: hidden !important;
}
body .torrent-serial::before, .torrent-serial::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.55),
        rgba(var(--secondary-rgb), 0.45));
    opacity: 0;
    transform: none !important; /* FIXED: Disable scale */
    transition: opacity 0.25s ease, transform 0.25s ease;
    z-index: 0;
}
body .torrent-serial > *,
.torrent-serial > * {
    position: relative;
    z-index: 1;
}
body .torrent-serial:hover, .torrent-serial:hover,
body .torrent-serial.focus, .torrent-serial.focus,
body .torrent-serial.selector:hover,
body .torrent-serial.selector.focus {
    border: 1px solid rgba(var(--primary-rgb), 0.9) !important;
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45) !important;
    transform: translateY(-2px) !important;
    color: var(--text-main) !important;
}
body .torrent-serial:hover::before,
body .torrent-serial.focus::before,
body .torrent-serial.selector:hover::before,
body .torrent-serial.selector.focus::before {
    opacity: 1;
    transform: none !important; /* FIXED: Disable scale */
}
body .torrent-serial:hover *,
body .torrent-serial.focus *,
body .torrent-serial.selector:hover *,
body .torrent-serial.selector.focus * {
    color: var(--text-main) !important;
}

/* Дополнительно для .selector класса */
/* Стили .selector объединены с общими выше */

body .torrent-serial__img, .torrent-serial__img {
    height: 120px !important;
    object-fit: cover !important;
    border-radius: 0.3em !important;
    flex-shrink: 0 !important;
}
body .torrent-serial__content, .torrent-serial__content {
    flex: 1 !important;
    padding: 0 !important;
    min-width: 0 !important;
}
body .tracks-metainfo, .tracks-metainfo,
body .torrent-files, .torrent-files {
    margin-top: 0.5em !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
}
body .tracks-metainfo__item, .tracks-metainfo__item {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important; 
    align-items: center !important;
    gap: 0.3em !important;
    padding: 0.4em 0.6em !important;
    margin: 0 !important;
    font-size: 0.9em !important;
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 0 !important;
    min-height: 2em !important;
    max-height: 3em !important;
    overflow: hidden !important;
    line-height: 1.3 !important;
}
body .tracks-metainfo__column--num, .tracks-metainfo__column--num,
body .tracks-metainfo__column--lang, .tracks-metainfo__column--lang,
body .tracks-metainfo__column--name, .tracks-metainfo__column--name,
body .tracks-metainfo__column--codec, .tracks-metainfo__column--codec,
body .tracks-metainfo__column--channels, .tracks-metainfo__column--channels,
body .tracks-metainfo__column--rate, .tracks-metainfo__column--rate,
body [class*="tracks-metainfo__column"], [class*="tracks-metainfo__column"] {
    display: inline-block !important;
    padding: 0.2em 0.4em !important;
    margin: 0 !important;
    font-size: 0.85em !important;
    white-space: nowrap !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border-radius: 0.2em !important;
    flex-shrink: 0 !important;
}
body .torrent-files__title, .torrent-files__title,
body .tracks-metainfo__title, .tracks-metainfo__title {
    font-size: 1em !important;
    padding: 0.5em 0 !important;
    margin: 0 !important;
    opacity: 0.95 !important;
}
body .torrent-serial .scroll__body, .torrent-serial .scroll__body {
    padding: 0 !important;
}
body .tracks-metainfo__line, .tracks-metainfo__line {
    display: flex !important;
    align-items: center !important;
    gap: 0.5em !important;
    padding: 0.4em 0.6em !important;
    margin: 0.2em 0 !important;
    font-size: 0.9em !important;
background: transparent !important;
border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 0 !important;
}
body .torrent-file, .torrent-file {
    display: block !important;
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.15) !important;
    border-radius: 0 !important;
    padding: 0.6em 0.8em !important;
    margin: 0 !important;
    transition: none !important;
    padding-bottom: 0.6em !important; 
    align-items: flex-start !important; 
}
body .torrent-file + .torrent-file, .torrent-file + .torrent-file {
    margin-top: 0 !important;
}
body .torrent-file.focus, body .torrent-file:hover,
body .torrent-file.focus::after, body .torrent-file:hover::after {
    background: rgba(var(--primary-rgb), 0.15) !important;
    border-bottom: 1px solid var(--theme-accent) !important;
    box-shadow: none !important;
    border: none !important; 
}
body .torrent-file__title, .torrent-file__title {
    font-size: 1.1em !important;
    line-height: 1.3 !important;
    padding-right: 0.5em !important;
}
body .torrent-file__quality, .torrent-file__quality {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 0.3em !important;
    margin-top: 0.4em !important;
    align-items: center !important;
}
body .torrent-file__quality > *, .torrent-file__quality > * {
    display: inline-block !important;
    font-size: 0.8em !important;
    padding: 0.25em 0.5em !important;
    margin: 0 !important;
    border-radius: 0.25em !important;
    background: rgba(var(--primary-rgb), 0.25) !important;
    border: 1px solid rgba(var(--primary-rgb), 0.35) !important;
white-space: nowrap !important;
    line-height: 1.2 !important;
}
body .torrent-file__size, .torrent-file__size {
    font-size: 1em !important;
    padding: 0.3em 0.5em !important;
border-radius: 0.3em !important;
    background: rgba(var(--primary-rgb), 0.3) !important;
    border: 1px solid rgba(var(--primary-rgb), 0.4) !important;
}
body .files__item, .files__item,
body .torrent-item, .torrent-item {
background: transparent !important;
border: none !important;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.2) !important;
border-radius: 0 !important;
    padding: 0.5em 0.8em !important;
    margin: 0 !important;
    transition: none !important;
    position: relative !important;
    z-index: 1;
}
body .files__item.focus, body .files__item:hover,
body .torrent-item.focus, body .torrent-item:hover {
    background: rgba(var(--primary-rgb), 0.2) !important;
    border-bottom: 1px solid var(--theme-accent) !important;
box-shadow: none !important;
z-index: 5;
}
/* Финальный стиль меню: стеклянный фон, без рамок */
@media (max-width: 768px) {
    body .menu:not(.menu--bottom) {
        width: 100% !important;
        max-width: none !important;
        border-radius: 18px !important;
        padding: 0.85em !important;
    }
}
.menu:not(.menu--bottom) .menu__item.hide,
.menu:not(.menu--bottom) .menu__item._hide,
.menu:not(.menu--bottom) .menu__item.hidden,
.menu:not(.menu--bottom) .menu__item[hidden],
.menu:not(.menu--bottom) .menu__item[data-hide="1"],
.menu:not(.menu--bottom) .menu__item[data-hidden="1"],
.menu:not(.menu--bottom) .menu__item[aria-hidden="true"],
.menu:not(.menu--bottom) .menu__item[style*="display:none"],
.menu:not(.menu--bottom) .menu__item[style*="display: none"] {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
}
body .menu,
body .menu:not(.menu--bottom) {
    background: rgba(6, 8, 12, 0.15) !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 10px !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
}
body .menu__case {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}
body .menu__split {
    background: transparent !important;
    border: none !important;
    height: 1px !important;
}
body .menu {
    background: transparent !important;
    border: none !important;
}
body .menu__list {
    background: transparent !important;
    border: none !important;
}
body .menu__item,
body .menu:not(.menu--bottom) .menu__item {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0.55em 0.9em !important;
}
body .menu__item:hover,
body .menu__item.focus,
body .menu__item.active {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    transform: none !important;
}
body .menu__item:hover .menu__text,
body .menu__item.focus .menu__text,
body .menu__item.active .menu__text {
    color: var(--theme-primary, rgba(var(--primary-rgb, 107, 63, 174), 1)) !important;
}
body .menu:not(.menu--bottom) .menu__ico svg {
    fill: currentColor !important;
}
body .menu:not(.menu--bottom) .menu__text {
    color: inherit !important;
}
.wrap__left {
    background: rgba(8, 10, 14, 0.18) !important;
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    border: 1px solid rgba(255, 255, 255, 0.04) !important;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35) !important;
}
.wrap__left .scroll--mask,
.wrap__left .scroll__content {
    background: transparent !important;
}
.menu:not(.menu--bottom) .menu__ico {
    flex: 0 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 1.8em !important;
    height: 1.8em !important;
    margin-right: 0.6em !important;
}
.menu:not(.menu--bottom) .menu__ico svg {
    width: 100% !important;
    height: 100% !important;
    fill: currentColor !important;
    stroke: currentColor !important;
}
.menu:not(.menu--bottom) .menu__text {
    flex: 1 1 auto !important;
    display: block !important;
    color: inherit !important;
    font-size: 1em !important;
    font-weight: 600 !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
    overflow: visible !important;
}
.menu:not(.menu--bottom) .menu__item {
    color: var(--text-main, #f1f5f9) !important;
}
.menu:not(.menu--bottom) .menu__ico svg,
.menu:not(.menu--bottom) .menu__ico svg path,
.menu:not(.menu--bottom) .menu__ico svg use {
    fill: currentColor !important;
    stroke: currentColor !important;
}
.menu:not(.menu--bottom) .menu__text {
    color: var(--text-main, #f1f5f9) !important;
}
.menu:not(.menu--bottom) .menu__item:hover .menu__text,
.menu:not(.menu--bottom) .menu__item.focus .menu__text,
.menu:not(.menu--bottom) .menu__item.active .menu__text {
    color: var(--theme-primary, rgba(var(--primary-rgb, 107, 63, 174), 1)) !important;
}
.card__quality, .card__quality *, .card__type::after,
.head__action.focus, .head__action.focus *,
.head__action:hover, .head__action:hover *,
/* .menu__item.focus, .menu__item.focus *, - убрано, фон не нужен */
/* .menu__item:hover, .menu__item:hover *, - убрано, фон не нужен */
.settings-param.focus, .settings-param.focus *,
.settings-param:hover, .settings-param:hover *,
.files__item.focus, .files__item.focus *,
.files__item:hover, .files__item:hover *,
.torrent-item.focus, .torrent-item.focus *,
.torrent-item:hover, .torrent-item:hover *,
.filter__item.focus, .filter__item.focus *,
.filter__item:hover, .filter__item:hover *,
.sort__item.focus, .sort__item.focus *,
.sort__item:hover, .sort__item:hover *,
.selectbox-item.focus, .selectbox-item.focus *,
.selectbox-item:hover, .selectbox-item:hover *,
.online__item.focus, .online__item.focus *,
.online__item:hover, .online__item:hover *,
.online__item-line.focus, .online__item-line.focus *,
.online__item-line:hover, .online__item-line:hover *,
.online-prestige__item.focus, .online-prestige__item.focus *,
.online-prestige__item:hover, .online-prestige__item:hover *,
.online-prestige__line.focus, .online-prestige__line.focus *,
.online-prestige__line:hover, .online-prestige__line:hover *,
.online__tabs-item.focus, .online__tabs-item.focus *,
.online__tabs-item:hover, .online__tabs-item:hover *,
.card.focus, .card.focus *,
.card:hover, .card:hover * {
    text-shadow: none !important;
}
@media (max-width: 768px), (hover: none), (pointer: coarse) {
    @keyframes navigation-pulse {
        0%, 100% {
            color: var(--theme-primary) !important;
            opacity: 0.95 !important;
        }
        50% {
            color: var(--theme-accent) !important;
            opacity: 1 !important;
        }
    }
    @-webkit-keyframes navigation-pulse {
        0%, 100% {
            color: var(--theme-primary) !important;
            opacity: 0.95 !important;
        }
        50% {
            color: var(--theme-accent) !important;
            opacity: 1 !important;
        }
    }
    body.true--mobile .navigation-bar,
    body.true--mobile .navigation-bar.navigation-bar,
    body .navigation-bar,
    .navigation-bar,
    .navigation-bar.navigation-bar {
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 20%, rgba(0, 0, 0, 0.95) 100%) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5), 0 -1px 0 rgba(255, 255, 255, 0.05) inset !important;
        padding: 0.75em 0 1em 0 !important;
        border-radius: 0 !important;
    }
    body.true--mobile .navigation-bar__body,
    body .navigation-bar__body,
    .navigation-bar__body {
        background: transparent !important;
        background-color: transparent !important;
        border-radius: 1.5em 1.5em 0 0 !important;
        padding: 0.5em 0.5em 0.25em 0.5em !important;
        gap: 0.5em !important;
    }
    body.true--mobile .navigation-bar__item,
    body.true--mobile .navigation-bar__item.navigation-bar__item,
    body .navigation-bar__item,
    .navigation-bar__item,
    .navigation-bar__item.navigation-bar__item {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        border-radius: 1em !important;
        padding: 0.75em 1em !important;
        margin: 0 !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        color: rgba(255, 255, 255, 0.7) !important;
        position: relative !important;
        overflow: hidden !important;
    }
    body.true--mobile .navigation-bar__item::before,
    body .navigation-bar__item::before,
    .navigation-bar__item::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: linear-gradient(135deg, rgba(var(--primary-rgb, 107, 63, 174), 0.15), rgba(var(--secondary-rgb, 0, 200, 230), 0.1)) !important;
        opacity: 0 !important;
        transition: opacity 0.2s ease !important;
        border-radius: 1em !important;
        z-index: 0 !important;
    }
    body.true--mobile .navigation-bar__item.focus,
    body.true--mobile .navigation-bar__item:active,
    body.true--mobile .navigation-bar__item.selector,
    body.true--mobile .navigation-bar__item.selector.focus,
    body .navigation-bar__item.focus,
    .navigation-bar__item.focus,
    .navigation-bar__item:active,
    .navigation-bar__item.selector,
    .navigation-bar__item.selector.focus {
        background: linear-gradient(135deg, rgba(var(--primary-rgb, 107, 63, 174), 0.3), rgba(var(--secondary-rgb, 0, 200, 230), 0.2)) !important;
        background-color: transparent !important;
        box-shadow: 0 4px 12px rgba(var(--primary-rgb, 107, 63, 174), 0.4), 0 0 20px rgba(var(--primary-rgb, 107, 63, 174), 0.2) !important;
        color: #ffffff !important;
        transform: none !important; /* FIXED: Disable scale */
    }
    body.true--mobile .navigation-bar__item.focus::before,
    body.true--mobile .navigation-bar__item:active::before,
    body .navigation-bar__item.focus::before,
    .navigation-bar__item.focus::before,
    .navigation-bar__item:active::before {
        opacity: 1 !important;
    }
    body.true--mobile .navigation-bar__icon,
    body .navigation-bar__icon,
    .navigation-bar__icon {
        width: 2.2em !important;
        height: 2.2em !important;
        margin: 0 auto 0.4em auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative !important;
        z-index: 1 !important;
    }
    body.true--mobile .navigation-bar__item svg,
    body.true--mobile .navigation-bar__item svg path,
    body.true--mobile .navigation-bar__item svg circle,
    body .navigation-bar__item svg,
    body .navigation-bar__item svg path,
    body .navigation-bar__item svg circle,
    .navigation-bar__item svg,
    .navigation-bar__item svg path,
    .navigation-bar__item svg circle {
        animation: none !important;
        -webkit-animation: none !important;
        fill: currentColor !important;
        stroke: currentColor !important;
        width: 100% !important;
        height: 100% !important;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    body.true--mobile .navigation-bar__item.focus svg,
    body.true--mobile .navigation-bar__item:active svg,
    body .navigation-bar__item.focus svg,
    .navigation-bar__item.focus svg,
    .navigation-bar__item:active svg {
        filter: drop-shadow(0 4px 8px rgba(var(--primary-rgb, 107, 63, 174), 0.6)) !important;
        transform: none !important; /* FIXED: Disable scale */
    }
    body.true--mobile .navigation-bar__label,
    body .navigation-bar__label,
    .navigation-bar__label {
        font-size: 0.75em !important;
        font-weight: 600 !important;
        color: currentColor !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
        transition: all 0.2s ease !important;
        letter-spacing: 0.02em !important;
        position: relative !important;
        z-index: 1 !important;
    }
    body.true--mobile .navigation-bar__item.focus .navigation-bar__label,
    body.true--mobile .navigation-bar__item:active .navigation-bar__label,
    body .navigation-bar__item.focus .navigation-bar__label,
    .navigation-bar__item.focus .navigation-bar__label,
    .navigation-bar__item:active .navigation-bar__label {
        color: #ffffff !important;
        text-shadow: 0 2px 4px rgba(var(--primary-rgb, 107, 63, 174), 0.5) !important;
    }
}
.settings-param:hover, .settings-param:focus, .settings-param.focus, .settings-param.hover,
/* .menu__item:hover, .menu__item:focus, .menu__item.focus, .menu__item.hover, - убрано, фон не нужен */
.files__item:hover, .files__item:focus, .files__item.focus, .files__item.hover,
.torrent-item:hover, .torrent-item:focus, .torrent-item.focus, .torrent-item.hover,
.filter__item:hover, .filter__item:focus, .filter__item.focus, .filter__item.hover,
.sort__item:hover, .sort__item:focus, .sort__item.focus, .sort__item.hover,
.selectbox-item:hover, .selectbox-item:focus, .selectbox-item.focus, .selectbox-item.hover,
.online__item:hover, .online__item:focus, .online__item.focus, .online__item.hover,
.online__item-line:hover, .online__item-line:focus, .online__item-line.focus, .online__item-line.hover,
.online-prestige__item:hover, .online-prestige__item:focus, .online-prestige__item.focus, .online-prestige__item.hover,
.online-prestige__line:hover, .online-prestige__line:focus, .online-prestige__line.focus, .online-prestige__line.hover,
.online__tabs-item:hover, .online__tabs-item:focus, .online__tabs-item.focus, .online__tabs-item.hover,
.full-start__button:hover, .full-start__button:focus, .full-start__button.focus, .full-start__button.hover,
.head__action:hover, .head__action:focus, .head__action.focus, .head__action.hover,
.bottom-bar__item:hover, .bottom-bar__item:focus, .bottom-bar__item.focus, .bottom-bar__item.hover,
.bottom-bar__btn:hover, .bottom-bar__btn:focus, .bottom-bar__btn.focus, .bottom-bar__btn.hover,
.settings-folder:hover, .settings-folder:focus, .settings-folder.focus, .settings-folder.hover,
.drxaos-theme-quick-btn:hover, .drxaos-theme-quick-btn:focus, .drxaos-theme-quick-btn.focus, .drxaos-theme-quick-btn.hover,
.button:hover, .button:focus, .button.focus, .button.hover,
.settings-param:hover, .settings-param:focus, .settings-param.focus, .settings-param.hover {
    text-shadow: none !important;
}
.button, .button *, .settings-param, .settings-param *,
.menu__item, .menu__item *,
.full-start__button, .full-start__button * {
    font-weight: inherit !important;
    text-shadow: none !important;
}
*:hover, *:focus, *.focus, *.hover {
    transform: none !important;
}
.settings-param:hover *, .settings-param:focus *, .settings-param.focus *, .settings-param.hover *,
/* .menu__item:hover *, .menu__item:focus *, .menu__item.focus *, .menu__item.hover *, - убрано, фон не нужен */
.files__item:hover *, .files__item:focus *, .files__item.focus *, .files__item.hover *,
.torrent-item:hover *, .torrent-item:focus *, .torrent-item.focus *, .torrent-item.hover *,
.filter__item:hover *, .filter__item:focus *, .filter__item.focus *, .filter__item.hover *,
.sort__item:hover *, .sort__item:focus *, .sort__item.focus *, .sort__item.hover *,
.selectbox-item:hover *, .selectbox-item:focus *, .selectbox-item.focus *, .selectbox-item.hover *,
.online__item:hover *, .online__item:focus *, .online__item.focus *, .online__item.hover *,
.online__item-line:hover *, .online__item-line:focus *, .online__item-line.focus *, .online__item-line.hover *,
.online-prestige__item:hover *, .online-prestige__item:focus *, .online-prestige__item.focus *, .online-prestige__item.hover *,
.online-prestige__line:hover *, .online-prestige__line:focus *, .online-prestige__line.focus *, .online-prestige__line.hover *,
.online__tabs-item:hover *, .online__tabs-item:focus *, .online__tabs-item.focus *, .online__tabs-item.hover *,
.full-start__button:hover *, .full-start__button:focus *, .full-start__button.focus *, .full-start__button.hover *,
.head__action:hover *, .head__action:focus *, .head__action.focus *, .head__action.hover *,
.bottom-bar__item:hover *, .bottom-bar__item:focus *, .bottom-bar__item.focus *, .bottom-bar__item.hover *,
.bottom-bar__btn:hover *, .bottom-bar__btn:focus *, .bottom-bar__btn.focus *, .bottom-bar__btn.hover *,
.settings-folder:hover *, .settings-folder:focus *, .settings-folder.focus *, .settings-folder.hover *,
.drxaos-theme-quick-btn:hover *, .drxaos-theme-quick-btn:focus *, .drxaos-theme-quick-btn.focus *, .drxaos-theme-quick-btn.hover * {
    text-shadow: none !important;
}
*[style*="color: #000000"], *[style*="color:#000000"], 
*[style*="color: #001a1f"], *[style*="color:#001a1f"],
*[style*="color: #0a0a0a"], *[style*="color:#0a0a0a"],
*[style*="color: var(--text-contrast)"], 
.card__quality, .card__quality *, .card__type::after,
.head__action, .head__action *,
.menu__item, .menu__item *,
.settings-param, .settings-param *,
.files__item, .files__item *,
.torrent-item, .torrent-item *,
.filter__item, .filter__item *,
.sort__item, .sort__item *,
.selectbox-item, .selectbox-item *,
.online__item, .online__item *,
.online__item-line, .online__item-line *,
.online-prestige__item, .online-prestige__item *,
.online-prestige__line, .online-prestige__line *,
.online__tabs-item, .online__tabs-item *,
.card, .card *,
.bottom-bar__item, .bottom-bar__item *,
.bottom-bar__btn, .bottom-bar__btn *,
.settings-folder, .settings-folder *,
.drxaos-theme-quick-btn, .drxaos-theme-quick-btn * {
    text-shadow: none !important;
}
body .head__actions .head__action,
body .head__action,
.head__action,
.drxaos-theme-quick-btn {
    background: transparent !important;
    border-radius: 8px !important;
    padding: 8px !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    transition: var(--perf-transition) !important;
    box-shadow: none !important;
}
body .head__actions .head__action:hover,
body .head__actions .head__action.focus,
body .head__action:hover,
body .head__action.focus,
.head__action:hover,
.head__action.focus,
.drxaos-theme-quick-btn:hover,
.drxaos-theme-quick-btn.focus {
    background: rgba(var(--primary-rgb), 0.2) !important;
    transform: var(--perf-transform) !important;
}
*[style*="color: #000"], *[style*="color:#000"],
*[style*="color: #001"], *[style*="color:#001"],
*[style*="color: #002"], *[style*="color:#002"],
*[style*="color: #003"], *[style*="color:#003"],
*[style*="color: #004"], *[style*="color:#004"],
*[style*="color: #005"], *[style*="color:#005"],
*[style*="color: #006"], *[style*="color:#006"],
*[style*="color: #007"], *[style*="color:#007"],
*[style*="color: #008"], *[style*="color:#008"],
*[style*="color: #009"], *[style*="color:#009"],
*[style*="color: #00a"], *[style*="color:#00a"],
*[style*="color: #00b"], *[style*="color:#00b"],
*[style*="color: #00c"], *[style*="color:#00c"],
*[style*="color: #00d"], *[style*="color:#00d"],
*[style*="color: #00e"], *[style*="color:#00e"],
*[style*="color: #00f"], *[style*="color:#00f"],
*[style*="color: #010"], *[style*="color:#010"],
*[style*="color: #020"], *[style*="color:#020"],
*[style*="color: #030"], *[style*="color:#030"],
*[style*="color: #040"], *[style*="color:#040"],
*[style*="color: #050"], *[style*="color:#050"],
*[style*="color: #060"], *[style*="color:#060"],
*[style*="color: #070"], *[style*="color:#070"],
*[style*="color: #080"], *[style*="color:#080"],
*[style*="color: #090"], *[style*="color:#090"],
*[style*="color: #0a0"], *[style*="color:#0a0"],
*[style*="color: #0b0"], *[style*="color:#0b0"],
*[style*="color: #0c0"], *[style*="color:#0c0"],
*[style*="color: #0d0"], *[style*="color:#0d0"],
*[style*="color: #0e0"], *[style*="color:#0e0"],
*[style*="color: #0f0"], *[style*="color:#0f0"],
*[style*="color: #100"], *[style*="color:#100"],
*[style*="color: #200"], *[style*="color:#200"],
*[style*="color: #300"], *[style*="color:#300"],
*[style*="color: #400"], *[style*="color:#400"],
*[style*="color: #500"], *[style*="color:#500"],
*[style*="color: #600"], *[style*="color:#600"],
*[style*="color: #700"], *[style*="color:#700"],
*[style*="color: #800"], *[style*="color:#800"],
*[style*="color: #900"], *[style*="color:#900"],
*[style*="color: #a00"], *[style*="color:#a00"],
*[style*="color: #b00"], *[style*="color:#b00"],
*[style*="color: #c00"], *[style*="color:#c00"],
*[style*="color: #d00"], *[style*="color:#d00"],
*[style*="color: #e00"], *[style*="color:#e00"],
*[style*="color: #f00"], *[style*="color:#f00"] {
    text-shadow: none !important;
}
*[style*="color: rgb("], *[style*="color:rgb("] {
    text-shadow: none !important;
}
.card__view-time, .card__view--time, .card-watched, .card__time,
.time--line, .card .time, body .card__view .time, body .card .time {
    display: none !important;
}
.card, .card__view, .card__img {
    transform: translateZ(0) !important;
    will-change: auto !important;
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
    perspective: 1000px !important;
    -webkit-perspective: 1000px !important;
}
.card {
    contain: style paint !important; 
    isolation: isolate !important; 
}
.card, .card__view, .card__img {
    transition: none !important;
    transform: none !important;
}
.card:hover, .card.focus, .card.hover,
.card:hover .card__view, .card.focus .card__view, .card.hover .card__view,
.card:hover .card__img, .card.focus .card__img, .card.hover .card__img,
.card:hover .card__img img, .card.focus .card__img img, .card.hover .card__img img {
    transform: none !important;
    scale: 1 !important;
}
@media (pointer: coarse) and (hover: none) {
    .card, .card__view, .card__img {
        transition: none !important;
    }
}
body .console {
    background: var(--netflix-glass) !important;
    backdrop-filter: var(--perf-backdrop) !important;
    -webkit-backdrop-filter: var(--perf-backdrop) !important;
    border: 1px solid var(--netflix-glass-border) !important;
    border-radius: var(--netflix-radius-lg) !important;
    box-shadow: var(--perf-shadow) !important;
    padding: 0 !important;
    overflow: hidden !important;
}
body .console .head-backward {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--secondary-rgb), 0.15)) !important;
    border: none !important;
    border-bottom: 1px solid var(--netflix-glass-border) !important;
    padding: 0.8em 1.4em !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.9em !important;
}
body .console .head-backward__button {
    position: relative !important;
    background: rgba(239, 68, 68, 0.12) !important;
    border-radius: 50% !important;
    border: 1px solid rgba(239, 68, 68, 0.36) !important;
    width: 1.9em !important;
    height: 1.9em !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: var(--perf-transition) !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.24) !important;
    color: #ef4444 !important;
    font-size: 1.05em !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    flex: 0 0 auto !important;
}
body .console .head-backward__button:hover,
body .console .head-backward.focus .head-backward__button {
    background: rgba(239, 68, 68, 0.22) !important;
    transform: none !important; /* FIXED: Disable scale */
    box-shadow: 0 7px 18px rgba(0, 0, 0, 0.3) !important;
}
body .console .head-backward__button svg {
    display: none !important;
}
body .console .head-backward__button::before {
    content: '\\00D7';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -52%);
    color: #ef4444 !important;
    display: block;
    font-size: 1.15em !important;
}
body .head-backward__button svg,
body .head-backward__button svg[data-drxaos-replaced="true"] {
    width: 56px !important;
    height: 56px !important;
    min-width: 56px !important;
    min-height: 56px !important;
    max-width: 56px !important;
    max-height: 56px !important;
}
body .head-backward__button {
    width: auto !important;
    height: auto !important;
    min-width: 56px !important;
    min-height: 56px !important;
}
body .head__action.open--settings svg,
body .head__action.head__settings svg,
body .head__action.open--settings svg[data-drxaos-settings-replaced="true"],
body .head__action.head__settings svg[data-drxaos-settings-replaced="true"],
body .head__action.open--search svg,
body .head__action.open--search svg[data-drxaos-search-replaced="true"],
html body .head__action.open--settings svg,
html body .head__action.head__settings svg,
html body .head__action.open--settings svg[data-drxaos-settings-replaced="true"],
html body .head__action.head__settings svg[data-drxaos-settings-replaced="true"],
html body .head__action.open--search svg,
html body .head__action.open--search svg[data-drxaos-search-replaced="true"] {
    width: 2em !important;
    height: 2em !important;
    min-width: 2em !important;
    min-height: 2em !important;
    max-width: 2em !important;
    max-height: 2em !important;
}
body .console .head-backward__title {
    font-family: var(--drxaos-font-family) !important;
    font-size: 1.4em !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    margin-left: 0 !important;
}
body .console__tabs {
    background: rgba(0, 0, 0, var(--drxaos-surface-opacity)) !important;
    border-bottom: 1px solid var(--netflix-glass-border) !important;
    padding: 0.5em 0 !important;
}
body .console__tab {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.95) !important;
    border-radius: var(--netflix-radius-md) !important;
    padding: 0.6em 1.2em !important;
    margin: 0 0.5em !important;
    font-family: var(--drxaos-font-family) !important;
    font-size: 0.9em !important;
    font-weight: 500 !important;
    color: rgba(255, 255, 255, 0.95) !important;
    transition: var(--perf-transition) !important;
    cursor: pointer !important;
    white-space: nowrap !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.5em !important;
}
body .console__tab span {
    background: rgba(var(--primary-rgb), 0.3) !important;
    color: rgba(var(--primary-rgb), 1) !important;
    border-radius: var(--netflix-radius-sm) !important;
    padding: 0.2em 0.5em !important;
    font-size: 0.85em !important;
    font-weight: 600 !important;
    min-width: 1.5em !important;
    text-align: center !important;
}
body .console__tab:hover,
body .console__tab.focus,
body .console__tab.active {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.3), rgba(var(--secondary-rgb), 0.3)) !important;
    border: 1px solid rgba(var(--primary-rgb), 0.5) !important;
    color: #ffffff !important;
    transform: var(--perf-transform) !important;
    box-shadow: var(--perf-shadow) !important;
}
body .console__tab.active span {
    background: rgba(var(--primary-rgb), 1) !important;
    color: #000000 !important;
}
body .console__body {
    background: rgba(0, 0, 0, var(--drxaos-surface-opacity)) !important;
    padding: 1em !important;
}
body .console__line {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: var(--netflix-radius-sm) !important;
    padding: 0.6em 1em !important;
    margin: 0.3em 0 !important;
    font-family: 'Consolas', 'Monaco', monospace !important;
    font-size: 0.85em !important;
    color: rgba(255, 255, 255, 0.95) !important;
    transition: none !important;
    cursor: pointer !important;
}
body .console__line:hover,
body .console__line.focus {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(var(--primary-rgb), 0.35) !important;
    transform: none !important;
    color: rgba(255, 255, 255, 1) !important;
}
body .console__time {
    color: rgba(var(--primary-rgb), 0.8) !important;
    font-weight: 600 !important;
    margin-right: 0.5em !important;
}
body .console__line span[style*="hsl(105"] {
    color: #4ade80 !important;
    font-weight: 600 !important;
}
body .console__line span[style*="hsl(45"] {
    color: #fbbf24 !important;
    font-weight: 600 !important;
}
body .console__line span[style*="hsl(0"] {
    color: #f87171 !important;
    font-weight: 600 !important;
}
body .console__line span[style*="hsl(200"] {
    color: #60a5fa !important;
    font-weight: 600 !important;
}
body .console .scroll {
    scrollbar-width: thin !important;
    scrollbar-color: rgba(var(--primary-rgb), 0.5) rgba(0, 0, 0, var(--drxaos-surface-opacity)) !important;
}
body .console .scroll::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
}
body .console .scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, var(--drxaos-surface-opacity)) !important;
    border-radius: var(--netflix-radius-sm) !important;
}
body .console .scroll::-webkit-scrollbar-thumb {
    background: rgba(var(--primary-rgb), 0.5) !important;
    border-radius: var(--netflix-radius-sm) !important;
    transition: var(--perf-transition) !important;
}
body .console .scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--primary-rgb), 0.8) !important;
}
body .console__tabs .scroll--horizontal {
    padding: 0.5em 1em !important;
}
body .console__tabs .scroll__body {
    display: flex !important;
    gap: 0.5em !important;
    align-items: center !important;
}
body .head__time {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0.8em 1.2em !important;
    display: flex !important;
    align-items: center !important;
    gap: 1em !important;
    transition: none !important;
}
body .head__time:hover {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}
body .head__time-now,
body .time--clock {
    font-family: var(--drxaos-font-family) !important;
    font-size: 1.8em !important;
    font-weight: 700 !important;
    color: #ffd700 !important;
    line-height: 1 !important;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.9);
    letter-spacing: 0.02em !important;
    min-width: 2.5em !important;
    width: 100% !important;
    display: block !important;
    text-align: center !important;
}
body .head__time > div:last-child {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.2em !important;
    width: 100% !important;
}
body .head__time {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.3em !important;
    padding: 0.8em 1.2em !important;
}
body .head__time-date,
body .time--full {
    font-family: var(--drxaos-font-family) !important;
    font-size: 0.995em !important;
    font-weight: 600 !important;
    color: #ffffff !important;
    line-height: 1.2 !important;
    white-space: nowrap !important;
    text-align: center !important;
}
body .head__time-week,
body .time--week {
    font-family: var(--drxaos-font-family) !important;
    font-size: 0.8em !important;
    font-weight: 400 !important;
    color: rgba(255, 255, 255, 0.95) !important;
    line-height: 1.2 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    white-space: nowrap !important;
    display: none !important;
}
body .head__action,
body .head__actions .head__action {
    width: 2.5em !important;
    height: 2.5em !important;
    min-width: 2.5em !important;
    min-height: 2.5em !important;
    flex-shrink: 0 !important;
}
body .head__action.open--profile {
    width: 2.5em !important;
    height: 2.5em !important;
    min-width: 2.5em !important;
    min-height: 2.5em !important;
    padding: 0 !important;
    border-radius: 50% !important;
    overflow: hidden !important;
    flex-shrink: 0 !important;
}
body .head__action.open--profile img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 50% !important;
}
body .head__action svg {
    width: 1.5em !important;
    height: 1.5em !important;
}
body .head__logo-icon {
    width: 3em !important;
    height: 3em !important;
    min-width: 3em !important;
    min-height: 3em !important;
    flex-shrink: 0 !important;
}
@keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0.95; }
}
body .time--clock::after {
    animation: none !important;
}
@media (max-width: 768px) {
    body .head__time {
        padding: 0.6em 1em !important;
        gap: 0.3em !important;
    }
    body .head__time-now,
    body .time--clock {
        font-size: 1.4em !important;
    }
    body .head__time-date,
    body .time--full {
        font-size: 0.85em !important;
    }
}
body .selectbox-item,
body .selectbox-item--icon {
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.95) !important;
    border-radius: 0 !important;
    padding: 1em 1.2em !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 1em !important;
    transition: var(--perf-transition) !important;
    cursor: pointer !important;
    min-height: 3.5em !important;
}
body .selectbox-item:hover,
body .selectbox-item.focus,
body .selectbox-item--icon:hover,
body .selectbox-item--icon.focus {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--secondary-rgb), 0.15)) !important;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.3) !important;
    transform: var(--perf-transform) !important;
}
body .selectbox-item__icon {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    width: 2.5em !important;
    height: 2.5em !important;
    margin: 0 !important;
    padding: 0 !important;
}
body .selectbox-item__icon svg {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
}
body .selectbox-item > div:not(.selectbox-item__icon) {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.3em !important;
    min-width: 0 !important;
}
body .selectbox-item__title {
    font-family: var(--drxaos-font-family) !important;
    font-size: 1.1em !important;
    font-weight: 600 !important;
    color: #ffffff !important;
    line-height: 1.3 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
body .selectbox-item__subtitle {
    font-family: var(--drxaos-font-family) !important;
    font-size: 0.85em !important;
    font-weight: 400 !important;
    color: rgba(255, 255, 255, 0.95) !important;
    line-height: 1.2 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
body .selectbox-item.drxaos-selectbox-disabled {
    opacity: 0.55 !important;
}
body .selectbox-item.drxaos-selectbox-disabled .selectbox-item__title {
    color: rgba(255, 255, 255, 0.6) !important;
}
body .selectbox-item.drxaos-selectbox-disabled .selectbox-item__subtitle {
    color: rgba(255, 255, 255, 0.45) !important;
}
body .selectbox-item:hover .selectbox-item__title,
body .selectbox-item.focus .selectbox-item__title,
body .selectbox-item:hover .selectbox-item__subtitle,
body .selectbox-item.focus .selectbox-item__subtitle {
    color: var(--text-main, #ffffff) !important;
    text-shadow: none !important;
}
body .selectbox-item:first-child {
    border-top: none !important;
}
body .selectbox-item:last-child {
    border-bottom: none !important;
}
body .torrent-filter {
    background: linear-gradient(150deg,
        rgba(var(--drxaos-triad-a-rgb), 0.45),
        rgba(var(--drxaos-triad-c-rgb), 0.22)) !important;
    border: 1.5px solid rgba(var(--theme-primary-rgb, var(--primary-rgb)), 0.35) !important;
    border-radius: 18px !important;
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.45) !important;
    padding: 1.2em !important;
    display: flex !important;
    gap: 0.8em !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    margin: 1em 0 !important;
}
body .torrent-filter .simple-button.selector {
    background: linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.25),
        rgba(var(--secondary-rgb), 0.18)) !important;
    border: 1.5px solid rgba(var(--primary-rgb), 0.45) !important;
    border-radius: 16px !important;
    padding: 0.8em 1.2em !important;
    min-height: 2.8em !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.75em !important;
    font-family: var(--drxaos-font-family) !important;
    font-size: 0.96em !important;
    font-weight: 500 !important;
    color: var(--text-main) !important;
    cursor: pointer !important;
    position: relative !important;
    overflow: hidden !important;
    transition: background 0.25s ease, border 0.25s ease, color 0.25s ease, transform 0.25s ease !important;
}
body .torrent-filter .simple-button.selector svg {
    width: 1.25em !important;
    height: 1.25em !important;
    color: inherit !important;
    flex-shrink: 0 !important;
}
body .torrent-filter .simple-button.selector span {
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 0.82em !important;
    font-weight: 400 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
}
body .torrent-filter .simple-button.selector > div {
    background: rgba(var(--bg-rgb), 0.45) !important;
    border-radius: 14px !important;
    padding: 0.35em 0.85em !important;
    font-weight: 600 !important;
    color: var(--text-main) !important;
    max-width: 220px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
body .torrent-filter .simple-button.selector > div.hide {
    display: none !important;
}
body .torrent-filter .simple-button.selector:hover,
body .torrent-filter .simple-button.selector.focus,
body .torrent-filter .simple-button.selector.active {
    background: linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.4),
        rgba(var(--secondary-rgb), 0.32)) !important;
    border-color: rgba(var(--primary-rgb), 0.85) !important;
    color: var(--text-contrast) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35) !important;
}
body .torrent-filter .simple-button.selector:hover > div,
body .torrent-filter .simple-button.selector.focus > div,
body .torrent-filter .simple-button.selector.active > div {
    background: rgba(var(--bg-rgb), 0.65) !important;
    color: var(--text-contrast) !important;
}
body .torrent-filter .simple-button.selector.filter--back svg {
    width: 1.6em !important;
    height: auto !important;
}
body .torrent-filter .filter--filter {
    position: relative !important;
}
body .torrent-filter .filter--filter::after {
    content: '' !important;
    position: absolute !important;
    top: -3px !important;
    right: -3px !important;
    width: 8px !important;
    height: 8px !important;
    background: rgba(var(--primary-rgb), 1) !important;
    border-radius: 50% !important;
    opacity: 0 !important;
    transition: var(--perf-transition) !important;
}
body .torrent-filter .filter--filter.active::after {
    opacity: 1 !important;
    animation: none !important;
}
@keyframes pulse {
    0%, 100% {
        transform: none !important; /* FIXED: Disable scale */
        opacity: 1;
    }
    50% {
        transform: none !important; /* FIXED: Disable scale */
        opacity: 0.95;
    }
}
@media (max-width: 768px) {
    body .torrent-filter {
        flex-direction: column !important;
        align-items: stretch !important;
    }
    body .torrent-filter .simple-button.selector {
        width: 100% !important;
        justify-content: space-between !important;
    }
}
[data-component="plugins"] .settings,
[data-component="plugins"] .settings__wrap {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--bg-rgb), 0.995) 100%) !important;
}
[data-component="plugins"] .settings-param,
[data-component="plugins"] .settings-folder {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 1em 1.2em !important;
    margin: 0.4em 0 !important;
    transition: none !important;
    filter: none !important;
    -webkit-filter: none !important;
}
[data-component="plugins"] .settings-param.focus,
[data-component="plugins"] .settings-param:hover,
[data-component="plugins"] .settings-folder.focus,
[data-component="plugins"] .settings-folder:hover {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    transform: none !important;
}
[data-component="plugins"] .settings-param__name,
[data-component="plugins"] .settings-folder__name {
    color: var(--text-main) !important;
}
[data-component="plugins"] .settings-param.focus *,
[data-component="plugins"] .settings-param:hover *,
[data-component="plugins"] .settings-folder.focus *,
[data-component="plugins"] .settings-folder:hover * {
    color: var(--text-main) !important;
}
[data-component="plugins"] .selectbox__item,
[data-component="plugins"] .selector__item {
    background: rgba(var(--primary-rgb), 0.15) !important;
    border-radius: var(--netflix-radius-sm) !important;
    border: 1px solid rgba(var(--primary-rgb), 0.3) !important;
}
[data-component="plugins"] .selectbox__item.focus,
[data-component="plugins"] .selectbox__item.selected,
[data-component="plugins"] .selector__item.focus,
[data-component="plugins"] .selector__item.selected {
    background: rgba(var(--primary-rgb), 0.4) !important;
    border-color: var(--theme-primary) !important;
}
[data-component="plugins"] .settings__title {
    color: var(--text-main) !important;
    font-weight: 600 !important;
}
/* ========================================
   ВОЗРАСТНОЙ РЕЙТИНГ / STATUS / QUALITY
   Hi-Tech 2025 Style (ATV Optimized)
   ======================================== */

/* Возрастной рейтинг (PG) */
.full-start__pg {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    padding: 6px 12px;
    min-width: 42px;
    height: 32px;
    width: fit-content !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    background: linear-gradient(145deg,
        rgba(var(--drxaos-triad-a-rgb), 0.6),
        rgba(var(--drxaos-triad-b-rgb), 0.28));
    border: 2px solid rgba(192, 192, 192, 0.3);
    border-radius: 10px;
    box-shadow: none;
    opacity: 0.98;
    font-size: 13px;
    font-weight: 600;
    color: var(--drxaos-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.35px;
    transition: none;
}

.full-start__pg:hover {
    transform: none;
    border-color: rgba(192, 192, 192, 0.45);
    box-shadow: none;
}

/* Статус (общий) */
.full-start__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    height: 32px;
    background: linear-gradient(145deg,
        rgba(var(--drxaos-triad-a-rgb), 0.58),
        rgba(var(--drxaos-triad-b-rgb), 0.32));
    border: 2px solid rgba(192, 192, 192, 0.25);
    border-radius: 10px;
    box-shadow: none;
    opacity: 0.98;
    font-size: 13px;
    font-weight: 500;
    color: var(--drxaos-text-primary);
    white-space: nowrap;
    transition: none;
}

.full-start__status:hover {
    transform: none;
    border-color: rgba(192, 192, 192, 0.4);
}

/* Иконка внутри статуса */
.full-start__status svg {
    width: 16px;
    height: 16px;
    opacity: 0.9;
    flex-shrink: 0;
}

/* Качество (surs_quality) - специальный акцент */
.full-start__status.surs_quality {
    background: none !important;
    border: none !important;
    color: #ffffff !important;
    font-weight: 700;
    text-shadow: 0 0 2px #808080, 0 0 1px #808080 !important;
}

.full-start__status.surs_quality:hover {
    border: none !important;
    box-shadow: none !important;
    transform: none;
}

.full-start__status.surs_quality::before {
    content: none !important;
}

/* Группировка бейджей */
.full-start__pg + .full-start__status,
.full-start__status + .full-start__status,
.full-start__status + .full-start__pg {
    margin-left: 0px !important;
}

/* ========================================
   ВАРИАНТЫ СТАТУСОВ ПО ТИПУ
   ======================================== */

/* Онлайн источник */
.full-start__status[data-source="online"] {
    background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.25) 0%, 
        rgba(37, 99, 235, 0.2) 100%);
    border-color: rgba(96, 165, 250, 0.6);
    color: rgba(191, 219, 254, 1);
}

.full-start__status[data-source="online"]:hover {
    border-color: rgba(96, 165, 250, 0.8);
    box-shadow: 0 3px 10px rgba(59, 130, 246, 0.35);
}

/* Торрент источник */
.full-start__status[data-source="torrent"] {
    background: linear-gradient(135deg, 
        rgba(16, 185, 129, 0.25) 0%, 
        rgba(5, 150, 105, 0.2) 100%);
    border-color: rgba(52, 211, 153, 0.6);
    color: rgba(167, 243, 208, 1);
}

.full-start__status[data-source="torrent"]:hover {
    border-color: rgba(52, 211, 153, 0.8);
    box-shadow: 0 3px 10px rgba(16, 185, 129, 0.35);
}

/* Статус "В процессе" / Ongoing */
.full-start__status[data-type="ongoing"] {
    background: linear-gradient(135deg, 
        rgba(251, 146, 60, 0.25) 0%, 
        rgba(249, 115, 22, 0.2) 100%);
    border-color: rgba(251, 146, 60, 0.6);
    color: rgba(254, 215, 170, 1);
}

/* Статус "Завершён" / Completed */
.full-start__status[data-type="completed"] {
    background: linear-gradient(135deg, 
        rgba(139, 92, 246, 0.25) 0%, 
        rgba(109, 40, 217, 0.2) 100%);
    border-color: rgba(167, 139, 250, 0.6);
    color: rgba(221, 214, 254, 1);
}

/* ========================================
   АДАПТАЦИЯ ПОД РАЗНЫЕ ЭКРАНЫ
   ======================================== */

@media (max-width: 768px) {
    .full-start__pg,
    .full-start__status {
        height: 28px;
        padding: 4px 10px;
        font-size: 12px;
    }
    
    .full-start__status svg {
        width: 14px;
        height: 14px;
    }
    
    .full-start__pg + .full-start__status,
    .full-start__status + .full-start__status {
        margin-left: 0px !important;
    }
}

@media (max-width: 480px) {
    .full-start__pg,
    .full-start__status {
        height: 26px;
        padding: 4px 8px;
        font-size: 11px;
    }
    
    .full-start__status svg {
        width: 12px;
        height: 12px;
    }
}

/* ========================================
   ОПТИМИЗАЦИЯ ДЛЯ ANDROID TV
   ======================================== */

@media (hover: none) and (pointer: coarse) {
    .full-start__pg:hover,
    .full-start__status:hover {
        transform: translateZ(0);
    }
    
    /* Focus для TV-пульта */
    .full-start__pg:focus,
    .full-start__status:focus {
        border-color: rgba(var(--primary-rgb), 1);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.3);
        transform: none !important; /* FIXED: Disable scale */
    }
    
    .full-start__status.surs_quality:focus {
        border-color: rgba(52, 211, 153, 1);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
    }
}`;
var additionalStyles = `
.card__img, .card__img img,
.poster, .poster__img, .poster__img img,
.full-start__poster img, .info__poster img,
.full-start-new__img.full--poster,
.full-start-new__img.full--poster img {
    border-radius: var(--drxaos-card-radius, 12px) !important;
    overflow: hidden !important;
}
.card {
    border-radius: var(--drxaos-card-radius, 12px) !important;
    overflow: hidden !important;
}
.card__view {
    border-radius: inherit !important;
    overflow: hidden !important;
}
.full-start__poster, .full-start__poster img {
    border-radius: 16px !important;
    overflow: hidden !important;
}
.selectbox-item__poster, .selectbox-item__poster img {
    border-radius: 8px !important;
    overflow: hidden !important;
}
.card__img, .poster__img, .full-start__poster {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}
.card, .card__view { position: relative !important; }
.card__type,
.card__type::after {
    display: none !important;
}
:root {
    --drxaos-card-radius: clamp(12px, 2.4vw, 16px);
    --drxaos-card-badge-height: clamp(26px, 3.4vw, 38px);
    --drxaos-card-badge-radius: clamp(10px, 2vw, 16px);
    --drxaos-card-badge-font: clamp(11px, 1.8vw, 14px);
    --drxaos-card-badge-pad-y: clamp(3px, 0.8vw, 6px);
    --drxaos-card-badge-pad-x: clamp(10px, 2vw, 18px);
    --drxaos-card-badge-offset: clamp(4px, 0.8vw, 10px);
    --drxaos-card-badge-gap: clamp(4px, 1vw, 10px);
    --drxaos-card-badge-inset: clamp(2px, 0.6vw, 6px);
    --drxaos-badge-text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9);
    --drxaos-badge-stroke: 0.8px #000;
}
.card__quality, .card-quality, .card__vote, .card-seasons, .card--content-type, .card--country, .card--year, .card__next-episode, .card__episode-date, .card-next-episode, .card--season-complete, .card--season-progress, .card__age, .card__runtime,
.card__quality + .card__quality,
.card__quality + .card-quality,
.drxaos-badge-base {
    position: absolute !important;
    display: inline !important;
    box-sizing: content-box !important;
    width: auto !important;
    max-width: calc(100% - (var(--drxaos-card-badge-offset) * 2)) !important;
    white-space: nowrap !important;
    min-height: auto !important;
    height: auto !important;
    padding: 0 !important;
    border-radius: 0 !important;
    font-size: var(--drxaos-card-badge-font) !important;
    font-weight: 700 !important;
    letter-spacing: 0.02em !important;
    line-height: 1.15 !important;
    color: #FFD700 !important;
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    text-shadow: var(--drxaos-badge-text-shadow) !important;
    -webkit-text-stroke: var(--drxaos-badge-stroke);
    margin: 0 !important;
    z-index: 1002 !important;
    pointer-events: none !important;
    transform: translateZ(0);
    align-self: flex-start !important;
    flex: 0 0 auto !important;
}
.card__quality, .card-quality,
.card__quality + .card__quality, .card__quality + .card-quality,
.card__vote,
.card--content-type,
.card--country, .card--year,
.card__next-episode, .card__episode-date, .card-next-episode,
.card--season-complete, .card--season-progress,
.card__age,
.card__runtime,
.drxaos-badge-base {
    opacity: 0;
    transition: none !important;
}
.card__quality.show, .card-quality.show, .card__vote.show, .card__seasons.show, .card-seasons.show,
.card--content-type.show, .card--country.show, .card__next-episode.show, .card__episode-date.show,
.card-next-episode.show, .card--season-complete.show, .card--season-progress.show, .card__age.show, .card__runtime.show,
.card__quality.drxaos-badge-visible, .card-quality.drxaos-badge-visible, .card__vote.drxaos-badge-visible,
.card__next-episode.drxaos-badge-visible, .card__episode-date.drxaos-badge-visible, .card-next-episode.drxaos-badge-visible,
.card--season-complete.drxaos-badge-visible, .card--season-progress.drxaos-badge-visible,
.card__age.drxaos-badge-visible, .card__runtime.drxaos-badge-visible,
.drxaos-badge-base.drxaos-badge-visible {
    opacity: 1 !important;
}
.card__vote {
    top: calc(var(--drxaos-card-badge-height) + var(--drxaos-card-badge-gap) + var(--drxaos-card-badge-inset)) !important;
    right: var(--drxaos-card-badge-inset) !important;
    left: auto !important;
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    color: #FFD700 !important;
    font-weight: 700 !important;
    text-shadow: var(--drxaos-badge-text-shadow) !important;
    -webkit-text-stroke: var(--drxaos-badge-stroke);
    border-radius: 0 !important;
}
.card__quality, .card-quality {
    top: var(--drxaos-card-badge-inset) !important;
    right: var(--drxaos-card-badge-inset) !important;
    left: auto !important;
    border-top-right-radius: var(--drxaos-card-radius) !important;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}
.card--content-type {
    top: var(--drxaos-card-badge-inset) !important;
    left: var(--drxaos-card-badge-inset) !important;
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    color: #FFD700 !important;
    text-shadow: var(--drxaos-badge-text-shadow) !important;
    -webkit-text-stroke: var(--drxaos-badge-stroke);
}
.card--country {
    top: calc(var(--drxaos-card-badge-height) + var(--drxaos-card-badge-gap) + var(--drxaos-card-badge-inset)) !important;
    left: var(--drxaos-card-badge-inset) !important;
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    border-radius: 0 !important;
    color: #FFD700 !important;
    text-shadow: var(--drxaos-badge-text-shadow) !important;
    -webkit-text-stroke: var(--drxaos-badge-stroke);
}
.card--year {
    right: var(--drxaos-card-badge-inset) !important;
    bottom: var(--drxaos-card-badge-inset) !important;
    left: auto !important;
    top: auto !important;
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    color: #FFD700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}
.card__next-episode, .card__episode-date, .card-next-episode {
    bottom: var(--drxaos-card-badge-inset) !important;
    left: var(--drxaos-card-badge-inset) !important;
    top: auto !important;
    right: auto !important;
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    border-radius: 0 !important;
    color: #FFD700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}
.card__seasons, .card-seasons, .card--season-complete, .card--season-progress {
    bottom: calc(var(--drxaos-card-badge-height) + var(--drxaos-card-badge-gap) + var(--drxaos-card-badge-inset)) !important;
    left: var(--drxaos-card-badge-inset) !important;
    top: auto !important;
    right: auto !important;
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    border-radius: 0 !important;
    color: #FFD700 !important;
    text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 0 3px rgba(0,0,0,0.9) !important;
    -webkit-text-stroke: 0.8px #000;
}
.drxaos-badge-bottom-row {
    position: absolute !important;
    left: var(--drxaos-card-badge-inset) !important;
    bottom: var(--drxaos-card-badge-inset) !important;
    width: 100% !important;
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: flex-end !important;
    justify-content: flex-start !important;
    gap: var(--drxaos-card-badge-gap) !important;
    pointer-events: none !important;
    padding: 0 var(--drxaos-card-badge-offset) 0 0 !important;
    z-index: 1002 !important;
}
.drxaos-badge-bottom-row > * {
    position: static !important;
    top: auto !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
    pointer-events: auto !important;
    margin: 0 !important;
}
.drxaos-badge-bottom-row > *:first-child {
    border-bottom-left-radius: var(--drxaos-card-radius) !important;
}
.drxaos-badge-bottom-row > *:last-child {
    border-bottom-right-radius: var(--drxaos-card-radius) !important;
}
.drxaos-badge-bottom-row > [data-drxaos-badge-pos="right"] {
    margin-left: auto !important;
}
.card--season-complete div, .card--season-progress div {
    display: contents !important;
}
.online-prestige {
    background: rgba(var(--layer-rgb), var(--drxaos-surface-opacity)) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    border: 2px solid transparent !important;
    transition: none !important;
    transform: none !important; /* FIXED: Disable scale */
}
.online-prestige.focus,
.online-prestige:focus,
.online-prestige.hover,
.online-prestige:hover {
    border: 2px solid var(--theme-primary) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
    transform: none !important; /* FIXED: Disable scale to fix scroll issues */
}
.online-prestige__body {
    background: transparent !important;
}
.online-prestige__title {
    color: var(--text-main) !important;
}
.online-prestige__time,
.online-prestige__info {
    color: var(--text-secondary) !important;
}
.online-prestige__quality {
    background: var(--theme-primary) !important;
    color: var(--text-main) !important;
    border-radius: 6px !important;
    padding: 4px 8px !important;
}
.online-prestige-rate {
    color: var(--text-main) !important;
}
.online-prestige-rate svg path {
    fill: var(--theme-primary) !important;
}
.online-prestige__timeline .time-line > div {
    background: var(--theme-primary) !important;
}
.online-prestige__viewed {
    background: rgba(0, 0, 0, var(--drxaos-surface-opacity)) !important;
    color: var(--theme-primary) !important;
    border-radius: 50% !important;
    padding: 8px !important;
}
.extensions { background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--bg-rgb), 0.96) 35%, rgba(var(--secondary-rgb), 0.08) 100%) !important; }
.head-backward { background: none !important; background-color: transparent !important; border: none !important; box-shadow: none !important; }
.head-backward__title { color: var(--theme-accent) !important; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95); }
.extensions__block-title { color: var(--theme-accent) !important; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95); }
.extensions__item { background: rgba(var(--primary-rgb), 0.15) !important; border: 1px solid rgba(var(--primary-rgb), 0.35) !important; border-radius: 12px !important; transition: none !important; }
.extensions__item:hover, .extensions__item.focus { background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.45), rgba(var(--secondary-rgb), 0.4)) !important; border-color: var(--theme-accent) !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95); transform: translateY(-4px) !important; }
.extensions__block-add { background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.3), rgba(var(--secondary-rgb), 0.25)) !important; border: 2px dashed var(--theme-accent) !important; color: var(--theme-accent) !important; }
.extensions__item-name { color: var(--text-main) !important; }
.extensions__item:hover .extensions__item-name, .extensions__item.focus .extensions__item-name { color: var(--theme-accent) !important; text-shadow: 0 0 15px var(--theme-accent) !important; }
.extensions__item-status { color: #10B981 !important; text-shadow: 0 0 8px #10B981 !important; }
.extensions__cub { background: var(--theme-accent) !important; box-shadow: 0 0 12px var(--theme-accent) !important; }
.selectbox__content {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--bg-rgb), 0.995) 30%, rgba(var(--secondary-rgb), 0.1) 100%) !important;
    border: 2px solid rgba(var(--primary-rgb), 0.5) !important;
    border-radius: 16px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}
.selectbox__head {
    background: linear-gradient(90deg, rgba(var(--primary-rgb), 0.35), rgba(var(--secondary-rgb), 0.3)) !important;
    border-bottom: 2px solid var(--theme-accent) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}
.selectbox__title {
    color: var(--theme-accent) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
    font-weight: 700 !important;
}
.selectbox-item {
    transition: none !important;
}
.selectbox-item:hover, .selectbox-item.focus, .selectbox-item.selected {
    background: linear-gradient(90deg, rgba(var(--primary-rgb), 0.4), rgba(var(--secondary-rgb), 0.35)) !important;
    border-left: 4px solid var(--theme-accent) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
    transform: translateX(6px) !important;
}
.selectbox-item__title {
    color: var(--text-main) !important;
}
.selectbox-item:hover .selectbox-item__title, .selectbox-item.focus .selectbox-item__title, .selectbox-item.selected .selectbox-item__title {
    color: var(--text-main) !important;
    text-shadow: none !important;
}
.settings-input {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--bg-rgb), 0.995) 30%, rgba(var(--secondary-rgb), 0.1) 100%) !important;
    border: 2px solid rgba(var(--primary-rgb), 0.5) !important;
    border-radius: 16px !important;
}
.settings-input__content {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--bg-rgb), 0.995) 40%, rgba(var(--secondary-rgb), 0.08) 100%) !important;
    border-radius: 12px !important;
    padding: 2em !important;
}
.settings-input__title {
    color: var(--text-main) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
    font-weight: 600 !important;
    margin-bottom: 1.5em !important;
}
.simple-keyboard-input {
    background: rgba(var(--bg-rgb), 0.8) !important;
    border: 2px solid rgba(var(--primary-rgb), 0.5) !important;
    border-radius: 12px !important;
    color: var(--text-main) !important;
    padding: 0.8em 1.2em !important;
    font-size: 1.1em !important;
    transition: none !important;
}
.simple-keyboard-input:focus, .simple-keyboard-input.focus {
    background: rgba(var(--primary-rgb), 0.2) !important;
    border-color: var(--theme-accent) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
    outline: none !important;
}
.simple-keyboard-input::placeholder {
    color: rgba(var(--text-rgb), 0.5) !important;
}
.settings-input__links {
    color: var(--theme-accent) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
    margin-top: 1em !important;
}
.settings__content {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--bg-rgb), 0.995) 40%, rgba(var(--secondary-rgb), 0.08) 100%) !important;
}
.settings__head {
    background: linear-gradient(90deg, rgba(var(--primary-rgb), 0.35), rgba(var(--secondary-rgb), 0.25)) !important;
    border-bottom: 2px solid var(--theme-accent) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}
.settings__title {
    color: var(--text-main) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
    font-weight: 600 !important;
}
.settings-folder {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    transition: none !important;
}
.settings-folder:hover, .settings-folder.focus {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    transform: none !important;
}
.settings-folder__icon svg, .settings-folder__icon img {
    filter: drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.6)) !important;
}
.settings-folder__name {
    color: var(--text-main) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
}
.settings-folder:hover .settings-folder__name, .settings-folder.focus .settings-folder__name {
    color: var(--text-main) !important;
    text-shadow: none !important;
}`;
var themes = {
midnight: `
:root {
--theme-primary: #5565ff;
--theme-secondary: #2030b8;
--theme-accent: #8ab4ff;
--bg-color: #050814;
--text-contrast: #ffffff;
--text-main: #e8efff;
--primary-rgb: 85, 101, 255;
--secondary-rgb: 32, 48, 184;
--bg-rgb: 5, 8, 20;
--theme-color: rgba(85, 101, 255, 0.95);
}
.settings, .modal, .select, .layer {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25) 0%, rgba(var(--secondary-rgb), 0.2) 45%, rgba(var(--bg-rgb), 0.98) 100%) !important;
}
.settings-param, .settings-folder,
.filter__item, .filter--filter,
.simple-button {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
}
.settings-param.focus, .settings-param:hover,
.settings-folder.focus, .settings-folder:hover,
.filter__item.focus, .filter__item:hover,
.simple-button.focus, .simple-button:hover {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${commonStyles}
`,
red: `
:root {
--theme-primary: #ff1f41;
--theme-secondary: #c01226;
--theme-accent: #ff6b7e;
--bg-color: #140208;
--text-contrast: #ffffff;
--text-main: #ffe7ef;
--primary-rgb: 255, 31, 65;
--secondary-rgb: 192, 18, 38;
--bg-rgb: 20, 2, 8;
--theme-color: rgba(255, 31, 65, 0.95);
}
.settings, .modal, .select, .layer {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25) 0%, rgba(var(--secondary-rgb), 0.2) 45%, rgba(var(--bg-rgb), 0.98) 100%) !important;
}
.settings-param, .settings-folder,
.filter__item, .filter--filter,
.simple-button {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
}
.settings-param.focus, .settings-param:hover,
.settings-folder.focus, .settings-folder:hover,
.filter__item.focus, .filter__item:hover,
.simple-button.focus, .simple-button:hover {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${commonStyles}
`,
sunset: `
:root {
--theme-primary: #ff8a00;
--theme-secondary: #ff3d00;
--theme-accent: #ffd38a;
--bg-color: #1a0802;
--text-contrast: #ffffff;
--text-main: #fff2e3;
--primary-rgb: 255, 138, 0;
--secondary-rgb: 255, 61, 0;
--bg-rgb: 26, 8, 2;
--theme-color: rgba(255, 138, 0, 0.95);
}
.settings, .modal, .select, .layer {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25) 0%, rgba(var(--secondary-rgb), 0.2) 45%, rgba(var(--bg-rgb), 0.98) 100%) !important;
}
.settings-param, .settings-folder,
.filter__item, .filter--filter,
.simple-button {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
}
.settings-param.focus, .settings-param:hover,
.settings-folder.focus, .settings-folder:hover,
.filter__item.focus, .filter__item:hover,
.simple-button.focus, .simple-button:hover {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${commonStyles}
`,
slate: `
:root {
--theme-primary: #7d8bff;
--theme-secondary: #4d5dff;
--theme-accent: #a8b6ff;
--bg-color: #050811;
--text-contrast: #ffffff;
--text-main: #e9ecff;
--primary-rgb: 125, 139, 255;
--secondary-rgb: 77, 93, 255;
--bg-rgb: 5, 8, 17;
--theme-color: rgba(125, 139, 255, 0.95);
}
.settings, .modal, .select, .layer {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25) 0%, rgba(var(--secondary-rgb), 0.2) 45%, rgba(var(--bg-rgb), 0.98) 100%) !important;
}
.settings-param, .settings-folder,
.filter__item, .filter--filter,
.simple-button {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
}
.settings-param.focus, .settings-param:hover,
.settings-folder.focus, .settings-folder:hover,
.filter__item.focus, .filter__item:hover,
.simple-button.focus, .simple-button:hover {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${commonStyles}
`,
lavender: `
:root {
--theme-primary: #c084fc;
--theme-secondary: #8b5cf6;
--theme-accent: #f0abfc;
--bg-color: #0d0515;
--text-contrast: #ffffff;
--text-main: #f7ecff;
--primary-rgb: 192, 132, 252;
--secondary-rgb: 139, 92, 246;
--bg-rgb: 13, 5, 21;
--theme-color: rgba(192, 132, 252, 0.95);
}
.settings, .modal, .select, .layer {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25) 0%, rgba(var(--secondary-rgb), 0.2) 45%, rgba(var(--bg-rgb), 0.98) 100%) !important;
}
.settings-param, .settings-folder,
.filter__item, .filter--filter,
.simple-button {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
}
.settings-param.focus, .settings-param:hover,
.settings-folder.focus, .settings-folder:hover,
.filter__item.focus, .filter__item:hover,
.simple-button.focus, .simple-button:hover {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${commonStyles}
`,
amber: `
:root {
--theme-primary: #ff5af1;
--theme-secondary: #9c2bff;
--theme-accent: #ff9bfd;
--bg-color: #130014;
--text-contrast: #ffffff;
--text-main: #ffeefe;
--primary-rgb: 255, 90, 241;
--secondary-rgb: 156, 43, 255;
--bg-rgb: 19, 0, 20;
--theme-color: rgba(255, 90, 241, 0.95);
}
.settings, .modal, .select, .layer {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25) 0%, rgba(var(--secondary-rgb), 0.2) 45%, rgba(var(--bg-rgb), 0.98) 100%) !important;
}
.settings-param, .settings-folder,
.filter__item, .filter--filter,
.simple-button {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
}
.settings-param.focus, .settings-param:hover,
.settings-folder.focus, .settings-folder:hover,
.filter__item.focus, .filter__item:hover,
.simple-button.focus, .simple-button:hover {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${commonStyles}
`,
latte: `
:root {
--theme-primary: #f7d7a1;
--theme-secondary: #f2ad78;
--theme-accent: #ffe8c5;
--bg-color: #120b06;
--text-contrast: #ffffff;
--text-main: #fff7ec;
--primary-rgb: 247, 215, 161;
--secondary-rgb: 242, 173, 120;
--bg-rgb: 18, 11, 6;
--theme-color: rgba(247, 215, 161, 0.95);
}
.settings, .modal, .select, .layer {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25) 0%, rgba(var(--secondary-rgb), 0.2) 45%, rgba(var(--bg-rgb), 0.98) 100%) !important;
}
.settings-param, .settings-folder,
.filter__item, .filter--filter,
.simple-button {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
}
.settings-param.focus, .settings-param:hover,
.settings-folder.focus, .settings-folder:hover,
.filter__item.focus, .filter__item:hover,
.simple-button.focus, .simple-button:hover {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${commonStyles}
`,
gradient: `
:root {
--theme-primary: #21f0a6;
--theme-secondary: #0089ff;
--theme-accent: #45d9ff;
--bg-color: #051626;
--text-contrast: #ffffff;
--text-main: #e2fbff;
--primary-rgb: 33, 240, 166;
--secondary-rgb: 0, 137, 255;
--bg-rgb: 5, 22, 38;
--theme-color: rgba(33, 240, 166, 0.95);
}
.settings, .modal, .select, .layer {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25) 0%, rgba(var(--secondary-rgb), 0.2) 45%, rgba(var(--bg-rgb), 0.98) 100%) !important;
}
.settings-param, .settings-folder,
.filter__item, .filter--filter,
.simple-button {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
}
.settings-param.focus, .settings-param:hover,
.settings-folder.focus, .settings-folder:hover,
.filter__item.focus, .filter__item:hover,
.simple-button.focus, .simple-button:hover {
    background: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${commonStyles}
`,
default: `
${commonStyles}
`
};
if (theme === 'darkred') {
    theme = 'red';
    try { Lampa.Storage.set('drxaos_theme', 'red'); } catch(e) {}
}
if (!themes[theme]) {
    theme = 'midnight';
    try { Lampa.Storage.set('drxaos_theme', 'midnight'); } catch(e) {}
}
prevtheme = theme;
var themeCSS = themes[theme] || '';
var themeStyleEl = document.getElementById('drxaos_theme_style');
if (!themeStyleEl) {
    themeStyleEl = document.createElement('style');
    themeStyleEl.id = 'drxaos_theme_style';
    head.appendChild(themeStyleEl);
}
themeStyleEl.textContent = commonStyles + '\n\n' + additionalStyles + '\n\n' + themeCSS;
        applyFontWeight();
        applyFixedSurfaceOpacity();
    } catch(e) {
    }
}
function applyFontFamily(forceKey) {
    try {
        var selected = typeof forceKey === 'string' && forceKey ? forceKey : (Lampa.Storage.get('drxaos_font_family') || 'netflix');
        if (!FONT_PRESET_MAP[selected]) {
            selected = 'netflix';
        }
        var preset = FONT_PRESET_MAP[selected] || FONT_PRESET_MAP.netflix;
        var linkId = 'drxaos-font-link';
        var fontLink = document.getElementById(linkId);
        var desiredStack = preset.stack || DEFAULT_FONT_STACK;
        var shouldUseRemoteFont = !!(preset.href);

        function handleFontFailure(reason) {
            if (fontLink && fontLink.parentNode) {
                fontLink.parentNode.removeChild(fontLink);
            }
            fontLink = null;
            drxaosSafeSet('drxaos_font_family', 'netflix');
            desiredStack = DEFAULT_FONT_STACK;
            shouldUseRemoteFont = false;
            if (!drxaosFontLoadErrorNotified && typeof Lampa !== 'undefined' && Lampa.Noty) {
                Lampa.Noty.show('Шрифт недоступен, используется стандартный');
            }
            drxaosFontLoadErrorNotified = true;
            styleManager.setStyle('drxaos-font-family-style', `
                :root { --drxaos-font-family: ${DEFAULT_FONT_STACK}; }
            `);
        }

        if (shouldUseRemoteFont) {
            if (!fontLink) {
                fontLink = document.createElement('link');
                fontLink.id = linkId;
                fontLink.rel = 'stylesheet';
                fontLink.type = 'text/css';
                fontLink.crossOrigin = 'anonymous';
                document.head.appendChild(fontLink);
            }
            if (fontLink.getAttribute('data-font-key') !== preset.key || fontLink.href !== preset.href) {
                fontLink.onload = function() {
                    fontLink.setAttribute('data-font-loaded', '1');
                };
                fontLink.onerror = function() {
                    handleFontFailure('load_error');
                };
                fontLink.setAttribute('data-font-key', preset.key);
                fontLink.href = preset.href;
            }
        } else if (fontLink && fontLink.parentNode) {
            fontLink.parentNode.removeChild(fontLink);
            fontLink = null;
        }


        styleManager.setStyle('drxaos-font-family-style', `
            :root { --drxaos-font-family: ${desiredStack}; }
        `);
    } catch(e) {
        
    }
}
function applyFontWeight() {
    try {
        if (!window.jQuery || !window.$) return;
        var fontWeight = Lampa.Storage.get('drxaos_font_weight', '400');
        styleManager.removeStyle('drxaos_font_weight_style');
        var additionalCSS = `
            text-shadow: none !important;
            font-stretch: normal !important;
            letter-spacing: normal !important;
        `;
        var fontWeightCSS = `
            :root {
                --font-weight: ${fontWeight} !important;
            }
            *, body, .card, .menu__item, .settings-param, .files__item, .torrent-item,
            .filter__item, .sort__item, .selectbox-item, .online__item, .online__item-line,
            .online-prestige__item, .online-prestige__line, .online__tabs-item, 
            .full-start__button, .head__action, .card__title, .card__description,
            .menu__item-title, .settings__title, .full-start__title {
                font-weight: var(--font-weight, ${fontWeight}) !important;
                ${additionalCSS}
            }
        `;
        styleManager.setStyle('drxaos_font_weight_style', fontWeightCSS);
    } catch(e) {
    }
}
function applyFixedSurfaceOpacity() {
    try {
        var surfaceCSS = `
:root {
    --modal-opacity: 0.95;
    --drxaos-surface-opacity: 0.95;
}
.settings__content,
.extensions,
.speedtest {
    background: rgba(var(--bg-rgb, 12, 12, 12), var(--drxaos-surface-opacity)) !important;
    opacity: 1 !important;
}
body .settings,
body .settings__head,
body .modal,
body .modal__content,
body .select,
body .select__content,
body .layer,
body .layer__body,
body .selectbox,
body .selectbox__body,
body .panel,
body .panel__body,
body .settings-folder,
body .settings-param,
body .settings-folder.selector,
body .settings-param.selector,
body .selectbox-item,
body .files__item,
body .torrent-item,
body .filter__item,
body .sort__item,
body .filter--filter,
body .filter--sort,
body .filter--search,
body .filter--source,
body .filter--back,
body .simple-button,
body .simple-button--filter,
body .simple-button--filter.filter--filter,
body .simple-button--filter.filter--sort,
body .simple-button--filter.filter--search,
body .simple-button--filter.filter--source,
body .simple-button--filter.filter--type,
body .simple-button--filter.filter--view,
body .online__item,
body .online__item-line {
    background: rgba(var(--bg-rgb, 12, 12, 12), var(--drxaos-surface-opacity)) !important;
    background-image: none !important;
    opacity: 1 !important;
}
body .settings__head,
body .settings__head * {
    background: rgba(var(--bg-rgb, 12, 12, 12), var(--drxaos-surface-opacity)) !important;
    color: var(--text-main, #ffffff) !important;
}
body .settings-folder,
body .settings-param,
body .settings-folder.selector,
body .settings-param.selector,
body .selectbox-item,
body .files__item,
body .torrent-item,
body .filter__item,
body .sort__item,
body .filter--filter,
body .filter--sort,
body .filter--search,
body .filter--source,
body .filter--type,
body .filter--view,
body .filter--back,
body .simple-button,
body .simple-button--filter {
    border: 1px solid rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
    transition: none !important;
}
body .settings-param:hover,
body .settings-param.focus,
body .settings-folder:hover,
body .settings-folder.focus,
body .selectbox-item:hover,
body .selectbox-item.focus,
body .simple-button--filter:hover,
body .simple-button--filter.focus,
body .filter--filter:hover,
body .filter--filter.focus,
body .filter--sort:hover,
body .filter--sort.focus,
body .filter--search:hover,
body .filter--search.focus,
body .filter--source:hover,
body .filter--source.focus,
body .filter--type:hover,
body .filter--type.focus,
body .filter--view:hover,
body .filter--view.focus,
body .filter--back:hover,
body .filter--back.focus {
    background: rgba(var(--primary-rgb), var(--drxaos-surface-opacity)) !important;
    border-color: rgba(var(--primary-rgb), 1) !important;
    color: var(--text-main, #ffffff) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}
body .settings-folder.selector:hover,
body .settings-folder.selector.focus,
body .settings-param.selector:hover,
body .settings-param.selector.focus,
body .simple-button--filter:hover,
body .simple-button--filter.focus,
body .filter--filter:hover,
body .filter--filter.focus,
body .filter--sort:hover,
body .filter--sort.focus,
body .filter--search:hover,
body .filter--search.focus,
body .filter--source:hover,
body .filter--source.focus,
body .filter--type:hover,
body .filter--type.focus,
body .filter--view:hover,
body .filter--view.focus {
    background: rgba(var(--primary-rgb), var(--drxaos-surface-opacity)) !important;
    border-color: rgba(var(--primary-rgb), 1) !important;
    color: var(--text-main, #ffffff) !important;
}
body .simple-button--filter .simple-button__text,
body .filter--filter .simple-button__text,
body .filter--sort .simple-button__text,
body .filter--search .simple-button__text,
body .filter--source .simple-button__text,
body .filter--type .simple-button__text,
body .filter--view .simple-button__text {
    color: var(--text-main, #ffffff) !important;
}
`;
        styleManager.setStyle('drxaos_surface_fix', surfaceCSS);
    } catch(e) {
        
    }
    }
    function applyModernHoverStyles() {
        try {
            styleManager.removeStyle('drxaos-modern-hover-styles');
            var modernHoverCSS = `
            /* Netflix 2025 Modern Hover Styles - используем CSS переменные из активной темы */
            body .selectbox-item:hover,
            body .selectbox-item.focus,
            body .selectbox-item.selector:hover,
            body .settings-param:hover,
            body .settings-param.focus,
            /* Убрано для меню - фон и рамки не нужны */
            /* body .menu__item:hover,
            body .menu__item.focus, */
            body .files__item:hover,
            body .files__item.focus,
            body .torrent-item:hover,
            body .torrent-item.focus,
            body .filter__item:hover,
            body .filter__item.focus,
            body .sort__item:hover,
            body .sort__item.focus,
            body .online__item:hover,
            body .online__item.focus,
            body .online__item-line:hover,
            body .online__item-line.focus,
            body .online-prestige__item:hover,
            body .online-prestige__item.focus,
            body .online-prestige__line:hover,
            body .online-prestige__line.focus,
            body .online__tabs-item:hover,
            body .online__tabs-item.focus,
            body .full-start__button:hover,
            body .full-start__button.focus,
            body .button:hover,
            body .button.focus {
                background: linear-gradient(135deg, rgba(var(--primary-rgb), var(--drxaos-surface-opacity)), rgba(var(--secondary-rgb), var(--drxaos-surface-opacity))) !important;
                border: 1px solid rgba(var(--primary-rgb), 0.5) !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
                transform: none !important; /* FIXED: No scale */
            }
            
            body .card:hover .card__title,
            body .card.focus .card__title,
            body .card:hover .card__text,
            body .card.focus .card__text,
            body .card:hover .card__description,
            body .card.focus .card__description,
            body .card:hover .info,
            body .card.focus .info,
            body .card:hover .card-watched__line,
            body .card.focus .card-watched__line {
                color: #ffffff !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
                transform: none !important; /* FIXED: Disable scale */
            }
        `;
        styleManager.setStyle('drxaos-modern-hover-styles', modernHoverCSS);
    } catch(e) {
        
    }
}
    function applyDetailsStyles() {
        try {
            styleManager.setStyle('drxaos-details-style', `
                :root {
                    --drxaos-chip-min-height: clamp(22px, 2.5vw, 28px);
                    --drxaos-chip-radius: clamp(8px, 1.5vw, 10px);
                    --drxaos-chip-gap: clamp(0.15rem, 0.15vw, 0.15rem);
                    --drxaos-chip-padding-y: clamp(0.2rem, 0.3vw, 0.3rem);
                    --drxaos-chip-padding-x: clamp(0.35rem, 0.5vw, 0.45rem);
                }
                .full-start-new__details,
                .full-start__details {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    gap: var(--drxaos-chip-gap) !important;
                    width: fit-content !important;
                    background: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    margin: clamp(0.15rem, 0.6vw, 0.4rem) 0 !important;
                    width: -moz-fit-content !important;
                    width: fit-content !important;
                    max-width: 100% !important;
                    flex: 0 0 auto !important;
                    align-self: flex-start !important;
                }
                .full-start-new__details span,
                .full-start__details span {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: fit-content !important;
                    flex-shrink: 0 !important;
                    gap: 0 !important;
                    padding: 0;
                    min-height: auto;
                    border-radius: 0;
                    background: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    color: #ffd700 !important;
                    font-family: var(--drxaos-font-family);
                    font-size: clamp(1rem, 1.2vw, 1.15rem);
                    font-weight: 600;
                    letter-spacing: 0.015em;
                    line-height: 1.2;
                    white-space: nowrap;
                    transition: none;
                    flex: 0 0 auto;
                }
                .full-start-new__details .full-start-new__rate-line,
                .full-start__details .full-start__rate-line {
                    margin: 0 !important;
                    padding: 0 !important;
                    gap: var(--drxaos-chip-gap) !important;
                    flex-wrap: wrap !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                }
                .full-start-new__details .full-start-new__rate-line:first-child,
                .full-start__details .full-start__rate-line:first-child {
                    margin-left: 0 !important;
                }
                .full-start-new__details .full-start-new__rate-line:not(:first-child),
                .full-start__details .full-start__rate-line:not(:first-child) {
                    margin-left: clamp(0.35rem, 1vw, 0.6rem) !important;
                }
                .full-start-new__details span small,
                .full-start__details span small {
                    color: var(--drxaos-text-secondary);
                }
                .full-start-new__details span.full-start-new__split,
                .full-start__details span.full-start-new__split {
                    display: none !important;
                }
                .full-start-new__details span::before,
                .full-start__details span::before {
                    content: none !important;
                }
                .full-start-new__details span:hover,
                .full-start__details span:hover,
                .full-start-new__details span:focus,
                .full-start__details span:focus {
                    transform: none;
                    box-shadow: none;
                    filter: none;
                }
            `);
    } catch(e) {
        
    }
}
    function applyReactionsPanelStyles() {
        try {
            styleManager.setStyle('drxaos-reactions-style', `
                :root {
                    --drxaos-chip-min-height: clamp(22px, 2.5vw, 28px);
                    --drxaos-chip-radius: clamp(8px, 1.5vw, 10px);
                    --drxaos-chip-gap: clamp(0.15rem, 0.15vw, 0.15rem);
                    --drxaos-chip-padding-y: clamp(0.2rem, 0.3vw, 0.3rem);
                    --drxaos-chip-padding-x: clamp(0.35rem, 0.5vw, 0.45rem);
                }
                .full-start-new__reactions,
                .full-start__reactions {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    gap: var(--drxaos-chip-gap) !important;
                    width: fit-content !important;
                    background: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    margin: clamp(0.15rem, 0.6vw, 0.4rem) 0 !important;
                    width: -moz-fit-content !important;
                    width: fit-content !important;
                    max-width: 100% !important;
                    flex: 0 0 auto !important;
                    align-self: flex-start !important;
                }
                .full-start-new__reactions > div,
                .full-start__reactions > div {
                    display: contents !important;
                }
                .full-start-new__reactions .reaction,
                .full-start__reactions .reaction {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    width: fit-content !important;
                    margin: 0 !important;
                    justify-content: center;
                    gap: clamp(0.2rem, 0.6vw, 0.4rem);
                    padding: 0;
                    min-height: auto;
                    border-radius: 0;
                    background: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    color: #ffd700 !important;
                    transition: none;
                    cursor: default;
                    user-select: none;
                    flex: 0 0 auto;
                }
                .full-start-new__reactions .reaction:hover,
                .full-start__reactions .reaction:hover,
                .full-start-new__reactions .reaction.focus,
                .full-start__reactions .reaction.focus {
                    transform: none;
                    box-shadow: none;
                    filter: none;
                }
                .full-start-new__reactions .reaction__icon,
                .full-start__reactions .reaction__icon {
                    width: clamp(16px, 2.5vw, 20px);
                    height: clamp(16px, 2.5vw, 20px);
                    object-fit: contain;
                    filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
                    transition: transform 0.2s ease;
                }
                .full-start-new__reactions .reaction:hover .reaction__icon,
                .full-start__reactions .reaction:hover .reaction__icon,
                .full-start-new__reactions .reaction.focus .reaction__icon,
                .full-start__reactions .reaction.focus .reaction__icon {
                    transform: none;
                }
                .full-start-new__reactions .reaction__count,
                .full-start__reactions .reaction__count {
                    font-family: var(--drxaos-font-family);
                    font-size: clamp(1rem, 1.2vw, 1.15rem);
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    color: #ffd700 !important;
                    text-shadow: none;
                }
            `);
    } catch(e) {
        
    }
}
    function applyRateLineStyles() {
        try {
            styleManager.setStyle('drxaos-rate-line-style', `
                :root {
                    --drxaos-chip-min-height: clamp(22px, 2.5vw, 28px);
                    --drxaos-chip-radius: clamp(8px, 1.5vw, 10px);
                --drxaos-chip-gap: clamp(0.15rem, 0.15vw, 0.15rem);
                --drxaos-chip-padding-y: clamp(0.2rem, 0.3vw, 0.3rem);
                --drxaos-chip-padding-x: clamp(0.35rem, 0.5vw, 0.45rem);
                }
                .full-start-new__rate-line,
                .full-start__rate-line {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    gap: clamp(0.45rem, 1vw, 0.75rem) !important;
                    column-gap: clamp(0.45rem, 1vw, 0.75rem) !important;
                    row-gap: clamp(0.25rem, 0.7vw, 0.45rem) !important;
                    background: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    margin: clamp(0.15rem, 0.6vw, 0.4rem) 0 !important;
                    width: -moz-fit-content !important;
                    width: fit-content !important;
                    max-width: 100% !important;
                    flex: 0 0 auto !important;
                    align-self: flex-start !important;
                }
                .full-start-new__rate-line .full-start__rate,
                .full-start__rate-line .full-start__rate,
                .full-start-new__rate-line .full-start__status,
                .full-start__rate-line .full-start__status,
                .full-start__pg {
                    display: inline-flex;
                    align-items: center;
                    width: fit-content !important;
                    flex-shrink: 0 !important;
                    margin: 0 !important;
                    justify-content: center;
                    gap: clamp(0.35rem, 0.8vw, 0.55rem);
                    min-height: auto;
                    padding: 0;
                    border-radius: 0;
                    background: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    color: #ffd700 !important;
                    font-size: clamp(1rem, 1.2vw, 1.15rem);
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    text-transform: none;
                    transition: none;
                    flex: 0 0 auto;
                }
                .full-start-new__rate-line .full-start__rate img,
                .full-start__rate-line .full-start__rate img {
                    width: clamp(14px, 2vw, 18px);
                    height: clamp(14px, 2vw, 18px);
                    margin-right: clamp(0.15rem, 0.3vw, 0.2rem);
                }
                .full-start-new__rate-line .full-start__status {
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .full-start-new__rate-line > *:not(:first-child),
                .full-start__rate-line > *:not(:first-child) {
                    margin-left: clamp(0.4rem, 0.9vw, 0.7rem) !important;
                }
                .full-start-new__rate-line .full-start__rate:hover,
                .full-start__rate-line .full-start__rate:hover,
                .full-start-new__rate-line .full-start__status:hover,
                .full-start__rate-line .full-start__status:hover {
                    transform: none;
                    box-shadow: none;
                    filter: none;
                }
                .full-start-new__details .full-start-new__rate-line,
                .full-start__details .full-start__rate-line {
                    order: unset !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .full-start-new__details .full-start-new__rate-line:not(:first-child),
                .full-start__details .full-start__rate-line:not(:first-child) {
                    margin-left: clamp(0.65rem, 1.4vw, 1.05rem) !important;
                }
                /* When ratings are placed inside the head row */
                .full-start-new__head .full-start-new__rate-line,
                .full-start-new__head .full-start__rate-line,
                .full-start__head .full-start-new__rate-line,
                .full-start__head .full-start__rate-line {
                    margin: 0 !important;
                    padding: 0 !important;
                    flex-wrap: wrap !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                }
            `);
    } catch(e) {
        
    }
}
function drxaosMergeDetailsAndRateLine(render) {
    try {
        var rootEl = render ? (render.jquery ? render[0] : render) : document.querySelector('.full-start-new, .full-start');
        if (!rootEl) return;
        var head = rootEl.querySelector('.full-start-new__head') || rootEl.querySelector('.full-start__head');
        var rate = rootEl.querySelector('.full-start-new__rate-line') || rootEl.querySelector('.full-start__rate-line');
        if (!head || !rate) return;
        if (head.contains(rate)) return;
        head.appendChild(rate);
    } catch(e) {
        
    }
}
function createQuickThemeModal() {
    try {
        if (!window.jQuery || !window.$) return;
        var controller_name = 'drxaos_quick_theme_modal';
        var previousControllerName = null;

        function closeModal() {
            try {
                if (window.Lampa && Lampa.Controller) {
                    try {
                        if (previousControllerName) {
                            Lampa.Controller.toggle(previousControllerName);
                        } else {
                            Lampa.Controller.toggle('content');
                        }
                        previousControllerName = null;
                    } catch(toggleErr) {
                        
                    }
                    if (typeof Lampa.Controller.remove === 'function') {
                        try { Lampa.Controller.remove(controller_name); } catch(removeErr) {}
                    }
                }

                var modal = document.querySelector('.drxaos-quick-theme-modal');
                if (modal) {
                    modal.remove();
                }
                var styleNode = document.getElementById('drxaos-quick-theme-style');
                if (styleNode && styleNode.parentNode) {
                    styleNode.parentNode.removeChild(styleNode);
                }

                // Очищаем все обработчики
                $(document).off('keydown.quickThemeModal');
                $(document).off('keyup.quickThemeModal');
                drxaosLeaveFocusLock('quick-theme-modal');

                // Убираем фокус с кнопки
                var quickBtn = document.querySelector('#drxaos-quick-theme-btn');
                if (quickBtn) {
                    quickBtn.classList.remove('focus', 'focused', 'active');
                    quickBtn.blur();
                }
            } catch(e) {
                
            }
        }
var modal = $('<div class="drxaos-quick-theme-modal"></div>');
var overlay = $('<div class="drxaos-modal-overlay"></div>');
var content = $('<div class="drxaos-modal-content"></div>');
var title = $('<h2 class="drxaos-modal-title">🎨 Выберите тему</h2>');
var themesGrid = $('<div class="drxaos-themes-grid"></div>');
var themesList = [
{ id: 'midnight', name: 'Midnight', icon: '🌙' },
{ id: 'sunset', name: 'Sunset', icon: '🌅' },
{ id: 'slate', name: 'Slate', icon: '⚫' },
{ id: 'lavender', name: 'Lavender', icon: '💜' },
{ id: 'amber', name: 'Neon Demon', icon: '👾' },
{ id: 'red', name: 'Red', icon: '🟥' },
{ id: 'latte', name: 'Latte', icon: '☕' },
{ id: 'gradient', name: 'Gradient', icon: '🦎' }
];
var currentTheme = Lampa.Storage.get('drxaos_theme', 'midnight');
if (!themesList.some(function(item) { return item.id === currentTheme; })) {
    currentTheme = 'midnight';
}
        function focusThemeItem($item, options) {
            options = options || {};
            if (!$item || !$item.length) return;
            var $items = $('.drxaos-theme-item');
            $items.removeClass('focus active');
            $item.addClass('active focus');
            if (!options.skipDomFocus && $item[0] && document.activeElement !== $item[0]) {
                $item[0].focus();
            }
            if ($item[0] && typeof $item[0].scrollIntoView === 'function') {
                var preferSmoothScroll = document.body && document.body.classList && document.body.classList.contains('mouse--controll');
                // DISABLED: Remove smooth scrolling behavior which might trigger focus issues
                $item[0].scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
            }
        }
        function moveThemeFocus(direction) {
            var $items = $('.drxaos-theme-item');
            if (!$items.length) return;
            var $current = $items.filter('.focus, .active').first();
            if (!$current.length) {
                focusThemeItem($items.first());
                return;
            }
            var currentRect = $current[0].getBoundingClientRect();
            var currentX = currentRect.left + currentRect.width / 2;
            var currentY = currentRect.top + currentRect.height / 2;
            var threshold = 5;
            var bestElement = null;
            var bestScore = Infinity;
            $items.each(function() {
                if (this === $current[0]) return;
                var rect = this.getBoundingClientRect();
                var x = rect.left + rect.width / 2;
                var y = rect.top + rect.height / 2;
                var dx = x - currentX;
                var dy = y - currentY;
                var score = null;
                switch (direction) {
                    case 'left':
                        if (dx < -threshold) score = Math.abs(dy) * 1000 + Math.abs(dx);
                        break;
                    case 'right':
                        if (dx > threshold) score = Math.abs(dy) * 1000 + Math.abs(dx);
                        break;
                    case 'up':
                        if (dy < -threshold) score = Math.abs(dx) * 1000 + Math.abs(dy);
                        break;
                    case 'down':
                        if (dy > threshold) score = Math.abs(dx) * 1000 + Math.abs(dy);
                        break;
                }
                if (score !== null && score < bestScore) {
                    bestScore = score;
                    bestElement = this;
                }
            });
            if (!bestElement) {
                if (direction === 'left' || direction === 'up') {
                    bestElement = $current.prev('.drxaos-theme-item')[0] || $items.last()[0];
                } else {
                    bestElement = $current.next('.drxaos-theme-item')[0] || $items.first()[0];
                }
            }
            if (bestElement) {
                focusThemeItem($(bestElement));
            }
        }
function activateTheme(themeId) {
    var previousTheme = Lampa.Storage.get('drxaos_theme', 'midnight');
    try {
        Lampa.Storage.set('drxaos_theme', themeId);
        applyTheme(themeId);
        applyAdvancedSettings();
        focusThemeItem($('.drxaos-theme-item[data-theme="' + themeId + '"]'), { instant: true });
    } catch(e) {
        
        if (previousTheme !== themeId) {
            Lampa.Storage.set('drxaos_theme', previousTheme);
            try {
                applyTheme(previousTheme);
                applyAdvancedSettings();
            } catch(restoreError) {
                
            }
        }
    }
}
themesList.forEach(function(theme) {
    var themeBtn = $('<div class="drxaos-theme-item' + (currentTheme === theme.id ? ' active' : '') + '" data-theme="' + theme.id + '" tabindex="0" role="button" aria-label="Выбрать тему ' + theme.name + '"><span class="drxaos-theme-icon">' + theme.icon + '</span><span class="drxaos-theme-name">' + theme.name + '</span></div>');
    var handleThemeSelect = function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            var selectedTheme = $(this).data('theme');
            activateTheme(selectedTheme);
            closeModal();
        } catch(error) {
            
            closeModal();
        }
    };
    themeBtn.on('click touchstart', function(e) {
        if (e.type === 'touchstart') {
            e.preventDefault();
            e.stopPropagation();
        }
        handleThemeSelect.call(this, e);
    });
    themeBtn.on('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
            e.preventDefault();
            e.stopPropagation();
            var selectedTheme = $(this).data('theme');
            activateTheme(selectedTheme);
            closeModal();
        }
    });
    themeBtn.on('focus', function() {
        focusThemeItem($(this), { skipDomFocus: true, instant: true });
    });
    themeBtn.on('mouseenter', function() {
        focusThemeItem($(this), { instant: true });
    });
    themesGrid.append(themeBtn);
});
content.append(title).append(themesGrid);
modal.append(overlay).append(content);
drxaosEnterFocusLock('quick-theme-modal');
if (typeof Lampa !== 'undefined' && Lampa.Listener) {
    var backHandler = function() {
        var $modal = $('.drxaos-quick-theme-modal');
        if ($modal.length > 0 && $modal.is(':visible')) {
            closeModal();
            return false;
        }
        return true;
    };

        // ===== КОНТРОЛЛЕР LAMPA ДЛЯ БЫСТРОЙ СМЕНЫ ТЕМ =====
        var modalController = {
            name: controller_name,
            toggle: function() {
                if (window.Lampa && Lampa.Controller) {
                    try {
                        var enabled = Lampa.Controller.enabled && Lampa.Controller.enabled();
                        previousControllerName = enabled && enabled.name ? enabled.name : 'content';
                    } catch(prevErr) {
                        previousControllerName = 'content';
                    }
                }
                Lampa.Controller.add(controller_name, {
                    toggle: function() {},
                    back: function() { closeModal(); },
                    up: function() {
                        moveThemeFocus('up');
                    },
                    down: function() {
                        moveThemeFocus('down');
                    },
                    left: function() {
                        moveThemeFocus('left');
                    },
                    right: function() {
                        moveThemeFocus('right');
                    },
                    enter: function() {
                        var $focused = $('.drxaos-theme-item.focus, .drxaos-theme-item.active');
                        if ($focused.length) {
                            var selectedTheme = $focused.data('theme');
                            if (selectedTheme) {
                                activateTheme(selectedTheme);
                                // Закрываем модал с задержкой для применения темы
                                setTimeout(function() {
                                    closeModal();
                                }, 100);
                            }
                        }
                    }
                });
                Lampa.Controller.toggle(controller_name);
            }
        };

        modalController.toggle();
        setTimeout(function() {
            var $items = $('.drxaos-theme-item');
            var $current = $items.filter('[data-theme="' + currentTheme + '"]');
            if ($current.length) {
                focusThemeItem($current, { instant: true });
            } else {
                focusThemeItem($items.first(), { instant: true });
            }
            $items.attr('tabindex', '0');
        }, 100);
        // ===== КОНЕЦ КОНТРОЛЛЕРА БЫСТРОЙ СМЕНЫ ТЕМ =====

    Lampa.Listener.follow('back', backHandler);
}
overlay.on('click touchstart', function(e) {
    if (e.type === 'touchstart') {
        e.preventDefault();
        e.stopPropagation();
    }
    closeModal();
});
content.on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
});
// УДАЛЕН ОБРАБОТЧИК keydown.quickThemeNavigation - навигация обрабатывается через Lampa.Controller
var styles = `
<style id="drxaos-quick-theme-style">
        /* ═══════════════════════════════════════════════════════════════════════
           🚀 PERFORMANCE OPTIMIZATION + 95% OPACITY FIX + MOBILE MENU
           ═══════════════════════════════════════════════════════════════════════ */

        /* GPU-ускорение для всех анимируемых элементов */
        .card,
        .menu__item,
        .scroll-line,
        .selector,
        .focus,
        .card-poster,
        .card-img,
        .selectbox__list,
        .settings-param__value {
            transform: translateZ(0);
            will-change: transform, opacity;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            -webkit-font-smoothing: antialiased;
        }

        /* Оптимизация изображений */
        .card-poster img,
        .card-img img,
        img {
            transform: translate3d(0, 0, 0);
            image-rendering: -webkit-optimize-contrast;
        }

        /* Быстрые transitions */
        .card {
            transition: none !important;
        }

        .menu__item {
            transition: none !important;
        }

        /* Focus-эффекты */
        .focus,
        .card:focus,
        .card.focus {
            transform: none !important; /* FIXED: Disable scale */
            transition: none !important;
        }

        /* Убираем тяжелые псевдоэлементы */
        .card-poster::after,
        .card-img::after {
            content: none !important;
        }

        /* Оптимизация скролла */
        .scroll,
        .line {
            -webkit-overflow-scrolling: touch;
            overflow: auto;
            will-change: scroll-position;
        }

        /* Упрощение border-radius */


        /* ═══════════════════════════════════════════════════════════════════════
           🎨 BACKGROUND COLOR FIX - ALWAYS USE THEME COLORS
           ═══════════════════════════════════════════════════════════════════════ */

        /* Принудительно фиксируем фон темы - не даем Lampa менять его */
        .background,
        body > .background,
        #app .background {
            background: linear-gradient(135deg, 
                rgba(var(--primary-rgb), 0.15) 0%, 
                rgb(var(--bg-rgb)) 50%,
                rgba(var(--secondary-rgb), 0.1) 100%) !important;
            background-color: rgb(var(--bg-rgb)) !important;
            background-image: linear-gradient(135deg, 
                rgba(var(--primary-rgb), 0.15) 0%, 
                rgb(var(--bg-rgb)) 50%,
                rgba(var(--secondary-rgb), 0.1) 100%) !important;
        }

        /* Убираем все динамические картинки фона */
        .background::before,
        .background::after,
        .background > * {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
        }

        /* Если Lampa пытается добавить background-image через style="" */
        .background[style*="background-image"] {
            background-image: linear-gradient(135deg, 
                rgba(var(--primary-rgb), 0.15) 0%, 
                rgb(var(--bg-rgb)) 50%,
                rgba(var(--secondary-rgb), 0.1) 100%) !important;
        }

        /* Также фиксируем body */
        body {
            background: linear-gradient(135deg, 
                rgba(var(--primary-rgb), 0.15) 0%, 
                rgb(var(--bg-rgb)) 50%,
                rgba(var(--secondary-rgb), 0.1) 100%) !important;
            background-attachment: fixed !important;
        }
        * {
            border-radius: 4px;
        }

        /* Фиксация прозрачности на 95% */
        .modal,
        .modal__content,
        .selectbox__list,
        .menu,
        .info__panel,
        .settings-panel {
            opacity: 0.95 !important;
        }

        /* ═══════════════════════════════════════════════════════════════════════
           📱 MOBILE BOTTOM MENU STYLING - MODERN DESIGN
           ═══════════════════════════════════════════════════════════════════════ */

        /* Современная панель нижнего меню с размытием и градиентом */
        .navigation-bar {
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 20%, rgba(0, 0, 0, 0.95) 100%) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5), 0 -1px 0 rgba(255, 255, 255, 0.05) inset !important;
            padding: 0.75em 0 1em 0 !important;
        }

        .navigation-bar__body {
            background: transparent !important;
            border-radius: 1.5em 1.5em 0 0 !important;
            padding: 0.5em 0.5em 0.25em 0.5em !important;
            gap: 0.5em !important;
        }

        /* Современные кнопки с градиентом и свечением */
        .navigation-bar__item {
            background: transparent !important;
            border: none !important;
            border-radius: 1em !important;
            padding: 0.75em 1em !important;
            margin: 0 !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            color: rgba(255, 255, 255, 0.7) !important;
            position: relative !important;
            overflow: hidden !important;
        }

        .navigation-bar__item::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: linear-gradient(135deg, rgba(var(--primary-rgb, 107, 63, 174), 0.15), rgba(var(--secondary-rgb, 0, 200, 230), 0.1)) !important;
            opacity: 0 !important;
            transition: opacity 0.2s ease !important;
            border-radius: 1em !important;
        }

        .navigation-bar__item.focus,
        .navigation-bar__item:active,
        .navigation-bar__item.selector.focus {
            background: linear-gradient(135deg, rgba(var(--primary-rgb, 107, 63, 174), 0.3), rgba(var(--secondary-rgb, 0, 200, 230), 0.2)) !important;
            color: #ffffff !important;
            transform: none !important; /* FIXED: Disable scale */
            box-shadow: 0 4px 12px rgba(var(--primary-rgb, 107, 63, 174), 0.4), 0 0 20px rgba(var(--primary-rgb, 107, 63, 174), 0.2) !important;
        }

        .navigation-bar__item.focus::before,
        .navigation-bar__item:active::before {
            opacity: 1 !important;
        }

        /* Иконки - современные с плавным переходом */
        .navigation-bar__icon {
            width: 2.2em !important;
            height: 2.2em !important;
            margin: 0 auto 0.4em auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .navigation-bar__item svg {
            width: 100% !important;
            height: 100% !important;
            fill: currentColor !important;
            stroke: none !important;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .navigation-bar__item.focus svg,
        .navigation-bar__item:active svg {
            filter: drop-shadow(0 4px 8px rgba(var(--primary-rgb, 107, 63, 174), 0.6)) !important;
            transform: none !important; /* FIXED: Disable scale */
        }

        /* Текст кнопок */
        .navigation-bar__label {
            font-size: 0.75em !important;
            font-weight: 600 !important;
            color: currentColor !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
            transition: all 0.2s ease !important;
            letter-spacing: 0.02em !important;
        }

        .navigation-bar__item.focus .navigation-bar__label,
        .navigation-bar__item:active .navigation-bar__label {
            color: #ffffff !important;
            text-shadow: 0 2px 4px rgba(var(--primary-rgb, 107, 63, 174), 0.5) !important;
        }

        /* Альтернативные селекторы для совместимости */
        .bottom-tabs,
        .menu-bottom,
        .bottom-navigation,
        .footer-menu,
        .menu--bottom {
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 20%, rgba(0, 0, 0, 0.95) 100%) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .bottom-tabs__item,
        .menu-bottom__item,
        .bottom-navigation__button,
        .footer-menu__button,
        .menu--bottom .menu__item {
            color: rgba(255, 255, 255, 0.7) !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .bottom-tabs__item.active,
        .bottom-tabs__item--active,
        .menu-bottom__item.active,
        .menu-bottom__item--active,
        .bottom-navigation__button.active,
        .footer-menu__button.active,
        .menu--bottom .menu__item.active,
        .menu--bottom .menu__item.focus {
            color: #ffffff !important;
            transform: none !important; /* FIXED: Disable scale */
        }


.drxaos-quick-theme-modal {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
z-index: 10000;
display: flex;
align-items: center;
justify-content: center;
padding: 2vh 0;
font-family: var(--drxaos-font-family);
font-weight: var(--font-weight, 400);
}
.drxaos-modal-overlay {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.65);
cursor: pointer;
z-index: 1;
}
.drxaos-modal-content {
position: relative;
z-index: 2;
background: rgba(30, 30, 40, 0.95);
filter: saturate(180%) !important;
-webkit-filter: saturate(180%) !important;
border: 2px solid rgba(107, 63, 174, 0.95);
border-radius: 1.5em;
padding: 1.25em;
max-width: 520px;
width: min(90vw, 520px);
max-height: 70vh;
overflow-y: auto;
overflow-x: hidden;
-webkit-overflow-scrolling: touch;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
animation: none !important;
cursor: default;
}
body.drxaos-android-mobile .drxaos-modal-content {
width: 95%;
max-width: 95%;
padding: 1em 1.25em;
max-height: 75vh;
overflow-y: auto;
overflow-x: hidden;
-webkit-overflow-scrolling: touch;
touch-action: pan-y;
position: relative;
}
body.drxaos-android-mobile .drxaos-themes-grid {
overflow: visible;
}
/* ОГРАНИЧЕНИЕ РАЗМЕРА МОДАЛЬНОГО ОКНА НА ТВ */
@media (min-width: 1280px) {
.drxaos-modal-content {
max-width: 520px !important;
width: min(50vw, 520px) !important;
max-height: 65vh !important;
}
}
@keyframes modalSlideIn {
from {
opacity: 0;
transform: translateY(-30px) scale(0.995);
}
to {
opacity: 1;
transform: translateY(0) scale(1);
}
}
.drxaos-modal-title {
color: #00c8e6;
font-size: 1.8em;
font-weight: 700;
margin: 0 0 1em 0;
text-align: center;
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
}
.drxaos-themes-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
gap: 0.75em;
}
body.drxaos-android-mobile .drxaos-themes-grid {
grid-template-columns: repeat(2, minmax(120px, 1fr));
gap: 0.7em;
}
.drxaos-theme-item {
background: rgba(50, 50, 70, 0.95);
border: 2px solid rgba(107, 63, 174, 0.95);
border-radius: 1em;
padding: 1.1em 0.9em;
cursor: pointer;
transition: none !important;
display: flex;
flex-direction: column;
align-items: center;
gap: 0.5em;
-webkit-tap-highlight-color: transparent;
touch-action: manipulation;
}
body.drxaos-android-mobile .drxaos-theme-item {
padding: 1.2em 0.8em;
min-height: 100px;
}
.drxaos-theme-item:hover {
background: linear-gradient(135deg, rgba(107, 63, 174, 0.95), rgba(0, 153, 204, 0.95));
border-color: #00c8e6;
transform: translateY(-5px) scale(1.05);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}
.drxaos-theme-item.active {
background: linear-gradient(135deg, #6b3fae, #0099cc);
border-color: #00c8e6;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}
.drxaos-theme-item:focus {
outline: none;
background: linear-gradient(135deg, rgba(107, 63, 174, 0.95), rgba(0, 153, 204, 0.95));
border-color: #00c8e6;
transform: translateY(-3px) scale(1.02);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}
.drxaos-theme-icon {
font-size: 2.5em;
line-height: 1;
filter: drop-shadow(0 2px 4px rgba(0, 0, 0, var(--drxaos-surface-opacity)));
}
.drxaos-theme-name {
color: #fff;
font-size: 0.9em;
font-weight: 600;
text-align: center;
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
}
.drxaos-theme-item.active .drxaos-theme-name {
color: #fff;
font-weight: 700;
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
}
</style>
`;
$('head').find('#drxaos-quick-theme-style').remove();
$('head').append(styles);
$('body').append(modal);
modal.hide().fadeIn(300, function() {
    var $activeItem = $('.drxaos-theme-item.active');
    if ($activeItem.length > 0) {
        $activeItem.focus();
    } else {
        // $('.drxaos-theme-item').first().focus().addClass('active'); // DISABLED: Auto-focus
        var $first = $('.drxaos-theme-item').first();
        if ($first.length) $first.addClass('active');
    }
});
    } catch(e) {
    }
}
function addQuickThemeButton() {
    try {
        if (!window.jQuery || !window.$) return;

        // Function to try adding the button with retries
        var retryCount = 0;
        var maxRetries = 20;

        function tryAdd() {
            // Check if already added
            if ($('#drxaos-quick-theme-btn').length > 0) return;

            var $headActions = $('.head__actions');
            if (!$headActions.length) {
                $headActions = $('.head .head__body');
            }
            if (!$headActions.length) {
                $headActions = $('.head');
            }
            if (!$headActions.length) {
                $headActions = $('header');
            }

            if ($headActions.length) {
                var btn = $('<div class="head__action drxaos-theme-quick-btn selector" id="drxaos-quick-theme-btn" title="Быстрый выбор темы" data-action="drxaos-quick-theme"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.71 4.63l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41zM7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3z" fill="currentColor"/></svg></div>');
                
                // SAFE INSERT: Use requestAnimationFrame
                window.requestAnimationFrame(function() {
                    try {
                        if ($('#drxaos-quick-theme-btn').length > 0) return;
                        $headActions.prepend(btn);
                    } catch(e) {
                        try {
                            $headActions.append(btn);
                        } catch(e2) {}
                    }
                    
                    if (btn && btn.length > 0) {
                        // FIX: Restore Lampa Controller support (hover:enter)
                        btn.off('click touchstart hover:enter hover:click').on('click touchstart hover:enter hover:click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!document.querySelector('.drxaos-quick-theme-modal')) {
                                createQuickThemeModal();
                            }
                            return false;
                        });
                        // Add keydown handler for Enter key just in case
                        btn.on('keydown', function(e) {
                            if (e.keyCode === 13) {
                                e.preventDefault();
                                if (!document.querySelector('.drxaos-quick-theme-modal')) {
                                    createQuickThemeModal();
                                }
                            }
                        });
                    }
                });
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(tryAdd, 500);
            }
        }

        tryAdd();
        
    } catch(e) {
        
    }
}
function addSettings() {
    try {
        // Проверяем готовность API
        if (!window.Lampa || !Lampa.Storage || !Lampa.SettingsApi || typeof Lampa.SettingsApi.addComponent !== 'function') {
            
            return;
        }
        
        // Проверяем, не добавлены ли уже настройки
        if (Lampa.SettingsApi.__drxaosSettingsAdded) {
            return;
        }
        
    /*
    // Инициализация значений по умолчанию
    if (!Lampa.Storage.get('tmdb_api_key')) {
        drxaosSafeSet('tmdb_api_key', BUILTIN_TMDB_KEY);
    }
    if (!Lampa.Storage.get('jacred_url')) {
        drxaosSafeSet('jacred_url', 'sync.jacred.stream');
    }
    if (!Lampa.Storage.get('drxaos_font_family')) {
        drxaosSafeSet('drxaos_font_family', 'netflix');
    }
    */
    
    function ensureIntegrationDefaults() {
            try {
                var tmdbKey = (Lampa.Storage.get('tmdb_api_key') || '').toString().trim();
                if (!tmdbKey || tmdbKey === 'c87a543116135a4120443155bf680876') {
                    drxaosSafeSet('tmdb_api_key', BUILTIN_TMDB_KEY);
                }
                var jacredUrl = (Lampa.Storage.get('jacred_url') || '').toString().trim();
                if (jacredUrl) {
                    jacredUrl = jacredUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
                }
                if (!jacredUrl || jacredUrl === 'jacred.xyz') {
                    jacredUrl = 'sync.jacred.stream';
                }
                if (Lampa.Storage.get('jacred_url') !== jacredUrl) {
                    drxaosSafeSet('jacred_url', jacredUrl);
                }
            } catch(err) {
                
            }
        }
        ensureIntegrationDefaults();
        drxaosEnsureBadgeDefaults();
        
        // Проверяем наличие Lampa.Lang и добавляем fallback если нужно
        if (!Lampa.Lang || typeof Lampa.Lang.translate !== 'function') {
            
            Lampa.Lang = Lampa.Lang || {};
            Lampa.Lang.translate = Lampa.Lang.translate || function(key) {
                var translations = {
                    'theme_midnight': 'Midnight',
                    'theme_red': 'Red',
                    'theme_sunset': 'Sunset',
                    'theme_slate': 'Slate',
                    'theme_lavender': 'Lavender',
                    'theme_amber': 'Amber',
                    'theme_gradient': 'Gradient',
                    'theme_latte': 'Latte',
                    'drxaos_theme': 'Тема',
                    'drxaos_theme_desc': 'Выберите цветовую тему',
                    'drxaos_font_weight': 'Толщина шрифта',
                    'drxaos_font_weight_desc': 'Выберите толщину шрифта',
                    'drxaos_font_family': 'Шрифт',
                    'drxaos_font_family_desc': 'Выберите семейство шрифтов'
                };
                return translations[key] || key;
            };
        }
        
        try {
            Lampa.SettingsApi.addComponent({
                component: 'drxaos_themes',
                name: 'DRXAOS Themes',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="#D20202" stroke="#D20202" stroke-width="10" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="0.3" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>',
                order: -999
            });
        } catch(err) {
            
            return; // Выходим если не удалось добавить компонент
        }
    
    var paramsAdded = 0;
    var paramsFailed = 0;
    
    // Добавляем параметры по одному с обработкой ошибок
    try {
        Lampa.SettingsApi.addParam({
            component: 'drxaos_themes',
            param: {
                name: 'drxaos_theme',
                type: 'select',
                values: {
                    'midnight': Lampa.Lang.translate('theme_midnight'),
                    'red': Lampa.Lang.translate('theme_red'),
                    'sunset': Lampa.Lang.translate('theme_sunset'),
                    'slate': Lampa.Lang.translate('theme_slate'),
                    'lavender': Lampa.Lang.translate('theme_lavender'),
                    'amber': Lampa.Lang.translate('theme_amber'),
                    'latte': Lampa.Lang.translate('theme_latte'),
                    'gradient': Lampa.Lang.translate('theme_gradient')
                },
                default: 'midnight'
            },
            field: {
                name: Lampa.Lang.translate('drxaos_theme'),
                description: Lampa.Lang.translate('drxaos_theme_desc')
            },
            onChange: applyTheme
        });
        paramsAdded++;
    } catch(err) {
        paramsFailed++;
        
    }
    try {
        Lampa.SettingsApi.addParam({
            component: 'drxaos_themes',
            param: {
                name: 'drxaos_font_weight',
                type: 'select',
                values: {
                    '400': 'Normal',
                    '600': 'Semi-Bold',
                    '700': 'Bold',
                    '800': 'Extra Bold',
                    '900': 'Black'
                },
                default: '400'
            },
            field: {
                name: Lampa.Lang.translate('drxaos_font_weight'),
                description: Lampa.Lang.translate('drxaos_font_weight_desc')
            },
            onChange: applyFontWeight
        });
        paramsAdded++;
    } catch(err) {
        paramsFailed++;
        
    }
    try {
        if (typeof FONT_OPTIONS === 'undefined') {
            
            paramsFailed++;
        } else {
            Lampa.SettingsApi.addParam({
                component: 'drxaos_themes',
                param: {
                    name: 'drxaos_font_family',
                    type: 'select',
                    values: FONT_OPTIONS,
                    default: 'netflix'
                },
                field: {
                    name: Lampa.Lang.translate('drxaos_font_family'),
                    description: Lampa.Lang.translate('drxaos_font_family_desc')
                },
                onChange: function() {
                    applyFontFamily();
                }
            });
            paramsAdded++;
        }
    } catch(err) {
        paramsFailed++;
        
    }
    try {
        Lampa.SettingsApi.addParam({
            component: 'drxaos_themes',
            param: {
                name: 'drxaos_utils_button',
                type: 'select',
                values: {
                    'on': 'Включено',
                    'off': 'Выключено'
                },
                default: 'on'
            },
            field: {
                name: 'Кнопка Utilities',
                description: 'Показывать кнопку быстрых утилит в шапке'
            },
            onChange: function(value) {
                drxaosSafeSet('drxaos_utils_button', value);
                CONFIG.FEATURES.UTILITIES_BUTTON = value !== 'off';
                if (window.drxaosUtilitiesButton) {
                    if (value === 'off') {
                        window.drxaosUtilitiesButton.disable();
                    } else {
                        window.drxaosUtilitiesButton.enable();
                    }
                }
            }
        });
        paramsAdded++;
    } catch(err) {
        paramsFailed++;
        
    }
    // Остальные параметры обернуты в один try-catch для упрощения
    try {
        DRXAOS_BADGE_OPTIONS.forEach(function(option) {
            Lampa.SettingsApi.addParam({
                component: 'drxaos_themes',
                param: {
                    name: drxaosBadgeStorageKey(option.key),
                    type: 'select',
                    values: {
                        'on': 'Включено',
                        'off': 'Выключено'
                    },
                    default: option.default || 'on'
                },
                field: {
                    name: Lampa.Lang.translate(option.labelKey),
                    description: Lampa.Lang.translate(option.descriptionKey)
                },
                onChange: function() {
                    drxaosHandleBadgeSettingChange(option.key);
                }
            });
            paramsAdded++;
        });
    } catch (badgeSettingsError) {
        paramsFailed++;
        
    }
    Lampa.SettingsApi.addParam({
        component: 'drxaos_themes',
        param: {
        name: 'source_filter',
        type: 'select',
        values: {
            'off': 'Выключено',
            'on': 'Включено'
        },
        default: 'on'
    },
        field: {
        name: Lampa.Lang.translate('source_filter'),
        description: Lampa.Lang.translate('source_filter_desc')
    },
        onChange: applySourceFilter
});
    Lampa.SettingsApi.addParam({
        component: 'drxaos_themes',
        param: {
            name: 'drxaos_logo_titles',
            type: 'select',
            values: {
                'off': 'Выключено',
                'on': 'Включено'
            },
            default: 'on'
        },
        field: {
            name: 'Лого вместо названий',
            description: 'Показывать логотипы TMDB вместо текстовых заголовков в карточке'
        },
        onChange: function(value) {
            drxaosResetTitleLogoCache();
            if (value !== 'on') {
                drxaosClearRenderedTitleLogos();
            }
        }
    });
    Lampa.SettingsApi.addParam({
        component: 'drxaos_themes',
        param: {
            name: 'drxaos_original_titles',
            type: 'select',
            values: {
                'off': 'Выключено',
                'on': 'Включено'
            },
            default: 'on'
        },
        field: {
            name: 'Оригинальные названия',
            description: 'Показывать оригинальные названия (EN/RU) под заголовком карточки'
        },
        onChange: function(value) {
            drxaosResetOriginalNamesCache();
            if (value !== 'on') {
                drxaosClearOriginalNameBlock();
            } else {
                var activeRender = null;
                var activeMovie = null;
                try {
                    var activity = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active().activity : null;
                    if (activity) {
                        activeRender = typeof activity.render === 'function' ? activity.render() : null;
                        activeMovie = activity.card_data || (activity.item && (activity.item.movie || activity.item)) || null;
                    }
                } catch (e) {}
                if (activeRender && activeMovie) {
                    drxaosHandleOriginalNames(activeMovie, activeRender);
                }
            }
        }
    });
    Lampa.SettingsApi.addParam({
        component: 'drxaos_themes',
        param: {
            name: 'drxaos_xuyampishe',
            type: 'select',
            values: {
                'off': 'Выключено',
                'on': 'Включено'
            },
            default: 'on'
        },
        field: {
            name: 'MADNESS интерфейс',
            description: 'Мега-стильный интерфейс'
        },
        onChange: function() {
            applyXuyampisheMode();
            setTimeout(function() {
                location.reload();
            }, 300);
        }
    });
    
    // Добавляем параметр для выбора Loader
    Lampa.SettingsApi.addParam({
        component: 'drxaos_themes',
        param: {
            name: 'drxaos_loader',
            type: 'button'
        },
        field: {
            name: 'Loader',
            description: 'Выберите анимированный loader для загрузки'
        },
        onChange: function() {
            if (window.drxaosLoaderModalOpen) return;
            openLoaderModal(function(selectedLoader) {
                if (selectedLoader) {
                    applyLoader(selectedLoader);
                    Lampa.Storage.set('drxaos_loader', selectedLoader);
                }
            });
        }
    });
    
    // Применяем сохраненный loader при загрузке
    var savedLoader = Lampa.Storage.get('drxaos_loader', 'default');
    if (savedLoader && savedLoader !== 'default') {
        applyLoader(savedLoader);
    } else {
        // Инициализируем переменные даже для default
        window.drxaosCurrentLoader = 'default';
        window.drxaosCurrentLoaderSvg = '';
    }
    
    // Перехватываем загрузку loader.svg через fetch и XMLHttpRequest
    if (typeof window.fetch !== 'undefined' && !window.drxaosLoaderFetchIntercepted) {
        window.drxaosLoaderFetchIntercepted = true;
        var originalFetch = window.fetch;
        window.fetch = function() {
            var args = Array.prototype.slice.call(arguments);
            var url = args[0];
            
            // Проверяем, является ли запрос запросом loader.svg
            if (typeof url === 'string' && (url.indexOf('loader.svg') !== -1 || url.endsWith('/loader.svg'))) {
                // Если выбран кастомный loader, возвращаем его как blob
                if (window.drxaosCurrentLoader && window.drxaosCurrentLoader !== 'default' && window.drxaosCurrentLoaderSvg) {
                    var svgBlob = new Blob([window.drxaosCurrentLoaderSvg], { type: 'image/svg+xml' });
                    var response = new Response(svgBlob, {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'image/svg+xml'
                        }
                    });
                    return Promise.resolve(response);
                }
            }
            
            // Для всех остальных запросов используем оригинальный fetch
            return originalFetch.apply(this, args);
        };
    }
    
    // Перехватываем XMLHttpRequest для loader.svg
    if (typeof XMLHttpRequest !== 'undefined' && !window.drxaosLoaderXHRIntercepted) {
        window.drxaosLoaderXHRIntercepted = true;
        var OriginalXHR = XMLHttpRequest;
        XMLHttpRequest = function() {
            var xhr = new OriginalXHR();
            var originalOpen = xhr.open;
            var originalSend = xhr.send;
            
            xhr.open = function(method, url, async, user, password) {
                this._url = url;
                return originalOpen.apply(this, arguments);
            };
            
            xhr.send = function(data) {
                if (this._url && typeof this._url === 'string' && (this._url.indexOf('loader.svg') !== -1 || this._url.endsWith('/loader.svg'))) {
                    if (window.drxaosCurrentLoader && window.drxaosCurrentLoader !== 'default' && window.drxaosCurrentLoaderSvg) {
                        // Создаем blob URL для нашего SVG
                        var svgBlob = new Blob([window.drxaosCurrentLoaderSvg], { type: 'image/svg+xml' });
                        var blobUrl = URL.createObjectURL(svgBlob);
                        this._url = blobUrl;
                    }
                }
                return originalSend.apply(this, arguments);
            };
            
            return xhr;
        };
    }
    
    // Отслеживаем появление новых элементов с loader
    if (typeof MutationObserver !== 'undefined') {
        var loaderObserver = new MutationObserver(function(mutations) {
            var shouldApply = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && (node.classList.contains('modal-loading') || node.classList.contains('modal-pending__loading') || node.classList.contains('tracks-loading') || node.classList.contains('loading-layer__ico') || node.classList.contains('activity__loader') || node.classList.contains('player-video__loader') || node.classList.contains('screensaver__preload') || node.classList.contains('lampac-balanser-loader'))) {
                                shouldApply = true;
                                break;
                            }
                            if (node.querySelector && (node.querySelector('.modal-loading') || node.querySelector('.modal-pending__loading') || node.querySelector('.tracks-loading') || node.querySelector('.loading-layer__ico') || node.querySelector('.activity__loader') || node.querySelector('.player-video__loader') || node.querySelector('.screensaver__preload') || node.querySelector('.lampac-balanser-loader'))) {
                                shouldApply = true;
                                break;
                            }
                        }
                    }
                }
            });
            if (shouldApply && window.drxaosCurrentLoader) {
                setTimeout(function() {
                    var currentLoader = window.drxaosCurrentLoader;
                    var currentLoaderSvg = window.drxaosCurrentLoaderSvg || '';
                    var bgUrl = window.drxaosCurrentLoaderBgUrl || 'url(../img/loader.svg)';
                    applyLoaderToElements(currentLoader, currentLoaderSvg, bgUrl);
                }, 50);
            }
        });
        
        if (document.body) {
            loaderObserver.observe(document.body, { childList: true, subtree: true });
        }
        
        // Периодически применяем loader к существующим элементам (на случай, если они уже были созданы)
        var applyLoaderInterval = setInterval(function() {
            if (window.drxaosCurrentLoader) {
                var currentLoader = window.drxaosCurrentLoader;
                var currentLoaderSvg = window.drxaosCurrentLoaderSvg || '';
                var bgUrl = window.drxaosCurrentLoaderBgUrl || 'url(../img/loader.svg)';
                applyLoaderToElements(currentLoader, currentLoaderSvg, bgUrl);
            }
        }, 100);
        
        // Останавливаем интервал через 60 секунд (элементы должны быть созданы к этому времени)
        setTimeout(function() {
            if (applyLoaderInterval) {
                clearInterval(applyLoaderInterval);
            }
        }, 60000);
    }
    
    Lampa.SettingsApi.addParam({
        component: 'drxaos_themes',
        param: {
        name: 'jacred_url',
        type: 'select',
        values: {
            'sync.jacred.stream': 'sync.jacred.stream (default)',
            'jacred.net': 'jacred.net',
            'custom': 'Enter custom URL...'
        },
        default: 'sync.jacred.stream'
    },
        field: {
        name: '🌐 JacRed URL',
        description: Lampa.Lang.translate('jacred_url_desc')
    },
        onChange: function(value) {
        if (value === 'custom') {
            var currentCustomUrl = (Lampa.Storage.get('jacred_url_custom', '') || Lampa.Storage.get('jacred_url', '') || '').trim();
            inputOverlay.open({
                title: Lampa.Lang.translate('drxaos_overlay_jacred_title'),
                message: Lampa.Lang.translate('drxaos_overlay_jacred_hint'),
                value: currentCustomUrl,
                placeholder: Lampa.Lang.translate('drxaos_overlay_jacred_placeholder'),
                saveLabel: Lampa.Lang.translate('drxaos_overlay_save'),
                clearLabel: Lampa.Lang.translate('drxaos_overlay_clear'),
                cancelLabel: Lampa.Lang.translate('drxaos_overlay_cancel')
            }).then(function(result) {
                if (!result || result.action === 'cancel') {
                    drxaosSafeSet('jacred_url', 'sync.jacred.stream');
                    applyMovieQuality();
                    scheduleDrxaosApplyAll();
                    return;
                }
                if (result.action === 'clear') {
                    drxaosSafeSet('jacred_url_custom', '');
                    drxaosSafeSet('jacred_url', 'sync.jacred.stream');
                    if (Lampa.Noty) {
                        Lampa.Noty.show(Lampa.Lang.translate('jacred_saved') + 'sync.jacred.stream');
                    }
                    applyMovieQuality();
                    scheduleDrxaosApplyAll();
                    return;
                }
                if (result.action === 'save') {
                    var newUrl = (result.value || '').trim();
                    if (!newUrl) {
                        drxaosSafeSet('jacred_url', 'sync.jacred.stream');
                        applyMovieQuality();
                        scheduleDrxaosApplyAll();
                        return;
                    }
                    newUrl = newUrl.replace(/^https?:\/\//i, '');
                    drxaosSafeSet('jacred_url_custom', newUrl);
                    drxaosSafeSet('jacred_url', newUrl);
                    if (Lampa.Noty) {
                        Lampa.Noty.show(Lampa.Lang.translate('jacred_saved') + newUrl);
                    }
                    applyMovieQuality();
                    scheduleDrxaosApplyAll();
                }
            });
            return;
        } else {
            // Выбран один из стандартных
            drxaosSafeSet('jacred_url', value);
            applyMovieQuality();
            scheduleDrxaosApplyAll();
        }
    }
});
    Lampa.SettingsApi.addParam({
        component: 'drxaos_themes',
        param: {
        name: 'drxaos_proxy_mode',
        type: 'select',
        values: {
            'auto': 'Авто (встроенные)',
            'off': 'Без прокси',
            'custom': 'Свой список'
        },
        default: 'auto'
    },
        field: {
        name: 'JacRed прокси',
        description: 'Настройка прокси для обхода блокировок JacRed'
    },
        onChange: function(value) {
        if (value === 'custom') {
            inputOverlay.open({
                title: 'Прокси JacRed',
                message: 'Введите список proxy URL через запятую или с новой строки. Пример: https://proxy1.app/,https://proxy2.app/',
                value: drxaosSafeGet('drxaos_proxy_custom', ''),
                placeholder: 'https://proxy1.app/, https://proxy2.app/',
                saveLabel: Lampa.Lang.translate('drxaos_overlay_save'),
                clearLabel: Lampa.Lang.translate('drxaos_overlay_clear'),
                cancelLabel: Lampa.Lang.translate('drxaos_overlay_cancel')
            }).then(function(result) {
                if (!result || result.action === 'cancel') {
                    drxaosSafeSet('drxaos_proxy_mode', 'auto');
                    return;
                }
                if (result.action === 'clear') {
                    drxaosSafeSet('drxaos_proxy_custom', '');
                    drxaosSafeSet('drxaos_proxy_mode', 'auto');
                    applyMovieQuality();
                    return;
                }
                if (result.action === 'save') {
                    var customValue = (result.value || '').trim();
                    drxaosSafeSet('drxaos_proxy_custom', customValue);
                    drxaosSafeSet('drxaos_proxy_mode', customValue ? 'custom' : 'auto');
                    applyMovieQuality();
                }
            });
        } else {
            drxaosSafeSet('drxaos_proxy_mode', value);
            applyMovieQuality();
        }
    }
});
        paramsAdded++;
    } catch(err) {
        paramsFailed++;
        
    }
    // Устанавливаем флаг только если хотя бы один параметр был добавлен
    if (paramsAdded > 0) {
        Lampa.SettingsApi.__drxaosSettingsAdded = true;
    } else {
        
    }
}
var BUTTON_ICON_SVGS = {
    online: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="28" height="28" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" viewBox="0 0 512 512" data-drxaos-icon="online" aria-hidden="true"><g><path style="opacity:0.972" fill="#57d1c7" d="M 260.5,17.5 C 256.037,22.4646 251.37,27.2979 246.5,32C 247.416,32.2784 248.082,32.7784 248.5,33.5C 241.767,35.7012 235.767,39.2012 230.5,44C 223.84,51.1527 218.174,58.9861 213.5,67.5C 212.883,67.3893 212.383,67.056 212,66.5C 203.579,75.4255 194.746,83.7588 185.5,91.5C 192.452,70.7497 203.119,52.2497 217.5,36C 213.898,36.4156 210.232,36.9156 206.5,37.5C 212.806,31.8604 218.806,25.8604 224.5,19.5C 236.413,17.7964 248.413,17.1297 260.5,17.5 Z" /></g><g><path style="opacity:0.975" fill="#55cac7" d="M 260.5,17.5 C 272.578,17.6199 284.578,18.6199 296.5,20.5C 296.631,21.2389 296.464,21.9056 296,22.5C 289.91,29.0957 283.41,35.0957 276.5,40.5C 268.278,33.7779 258.945,31.4446 248.5,33.5C 248.082,32.7784 247.416,32.2784 246.5,32C 251.37,27.2979 256.037,22.4646 260.5,17.5 Z" /></g><g><path style="opacity:0.967" fill="#5ad7c6" d="M 224.5,19.5 C 218.806,25.8604 212.806,31.8604 206.5,37.5C 189.181,41.7173 172.514,47.7173 156.5,55.5C 164.167,46.8333 171.833,38.1667 179.5,29.5C 194.149,24.6366 209.149,21.3033 224.5,19.5 Z" /></g><g><path style="opacity:0.971" fill="#51c2c7" d="M 296.5,20.5 C 314.572,23.6807 331.905,29.014 348.5,36.5C 345.566,40.7728 342.233,44.7728 338.5,48.5C 323.921,42.6066 308.921,38.44 293.5,36C 302.991,46.6568 310.658,58.4901 316.5,71.5C 311.833,74.1667 308.167,77.8333 305.5,82.5C 298.793,66.4071 289.126,52.4071 276.5,40.5C 283.41,35.0957 289.91,29.0957 296,22.5C 296.464,21.9056 296.631,21.2389 296.5,20.5 Z" /></g><g><path style="opacity:0.972" fill="#5ddcc7" d="M 179.5,29.5 C 171.833,38.1667 164.167,46.8333 156.5,55.5C 143.475,61.6724 131.475,69.339 120.5,78.5C 122.105,81.3138 123.105,84.3138 123.5,87.5C 119.108,91.8972 114.442,95.8972 109.5,99.5C 110.974,89.445 107.307,81.7783 98.5,76.5C 102.798,73.5367 106.798,70.2034 110.5,66.5C 131.335,50.3789 154.335,38.0456 179.5,29.5 Z" /></g><g><path style="opacity:0.967" fill="#4cb7c7" d="M 348.5,36.5 C 359.729,40.7811 370.396,46.1145 380.5,52.5C 377.566,56.7728 374.233,60.7728 370.5,64.5C 360.112,58.6394 349.446,53.3061 338.5,48.5C 342.233,44.7728 345.566,40.7728 348.5,36.5 Z" /></g><g><path style="opacity:0.964" fill="#60e4c7" d="M 110.5,66.5 C 106.798,70.2034 102.798,73.5367 98.5,76.5C 83.3867,71.6936 73.22,76.6936 68,91.5C 66.9318,97.1746 67.7652,102.508 70.5,107.5C 66.5,110.5 62.5,113.5 58.5,116.5C 48.5742,97.9625 51.2409,81.4625 66.5,67C 81.0503,57.1818 95.717,57.0152 110.5,66.5 Z" /></g><g><path style="opacity:0.973" fill="#47acc7" d="M 380.5,52.5 C 387.482,57.1408 394.482,61.8075 401.5,66.5C 411.21,60.0194 421.543,58.3527 432.5,61.5C 428.5,65.8333 424.5,70.1667 420.5,74.5C 408.833,76.1667 402.167,82.8333 400.5,94.5C 396.167,98.5 391.833,102.5 387.5,106.5C 385.461,96.8207 386.461,87.4874 390.5,78.5C 384.192,73.3437 377.525,68.677 370.5,64.5C 374.233,60.7728 377.566,56.7728 380.5,52.5 Z" /></g><g><path style="opacity:0.965" fill="#45a6c7" d="M 432.5,61.5 C 441.451,63.7868 448.451,68.7868 453.5,76.5C 449.227,79.4335 445.227,82.7668 441.5,86.5C 436.836,78.661 429.836,74.661 420.5,74.5C 424.5,70.1667 428.5,65.8333 432.5,61.5 Z" /></g><g><path style="opacity:0.973" fill="#55ccc7" d="M 213.5,67.5 C 203.344,86.1533 195.677,105.82 190.5,126.5C 184.557,134.111 177.891,141.111 170.5,147.5C 170.467,144.164 171.134,140.997 172.5,138C 154.843,134.169 137.843,128.669 121.5,121.5C 126.167,118.833 129.833,115.167 132.5,110.5C 146.271,116.646 160.604,120.979 175.5,123.5C 178.233,112.636 181.566,101.969 185.5,91.5C 194.746,83.7588 203.579,75.4255 212,66.5C 212.383,67.056 212.883,67.3893 213.5,67.5 Z" /></g><g><path style="opacity:0.976" fill="#419fc7" d="M 453.5,76.5 C 458.371,85.4234 459.704,94.7567 457.5,104.5C 449.138,112.86 441.138,121.527 433.5,130.5C 422.806,133.715 412.806,132.382 403.5,126.5C 406.098,122.562 409.098,118.895 412.5,115.5C 427.912,120.045 438.078,114.712 443,99.5C 443.578,95.0451 443.078,90.7117 441.5,86.5C 445.227,82.7668 449.227,79.4335 453.5,76.5 Z" /></g><g><path style="opacity:0.97" fill="#5bd8c7" d="M 123.5,87.5 C 124.769,93.3512 124.769,99.3512 123.5,105.5C 125.878,108.088 128.878,109.755 132.5,110.5C 129.833,115.167 126.167,118.833 121.5,121.5C 119.742,121.123 118.075,120.456 116.5,119.5C 106.485,129.999 94.4845,133.666 80.5,130.5C 84.5,126.167 88.5,121.833 92.5,117.5C 101.566,114.765 107.233,108.765 109.5,99.5C 114.442,95.8972 119.108,91.8972 123.5,87.5 Z" /></g><g><path style="opacity:0.976" fill="#4ab3c7" d="M 316.5,71.5 C 324.714,87.6317 330.881,104.632 335,122.5C 335.383,123.056 335.883,123.389 336.5,123.5C 330.5,129.833 324.5,136.167 318.5,142.5C 303.666,145.259 288.666,146.926 273.5,147.5C 278.5,142.167 283.5,136.833 288.5,131.5C 299.293,130.577 309.96,128.911 320.5,126.5C 316.289,111.534 311.289,96.8673 305.5,82.5C 308.167,77.8333 311.833,74.1667 316.5,71.5 Z" /></g><g><path style="opacity:0.963" fill="#46a9c7" d="M 400.5,94.5 C 400.661,103.836 404.661,110.836 412.5,115.5C 409.098,118.895 406.098,122.562 403.5,126.5C 400.005,124.998 397.171,122.665 395,119.5C 377.475,127.453 359.308,133.62 340.5,138C 339.919,138.893 339.585,139.893 339.5,141C 340.492,145.125 341.159,149.291 341.5,153.5C 337.441,157.565 333.107,161.232 328.5,164.5C 327.471,156.688 325.804,149.021 323.5,141.5C 321.929,142.309 320.262,142.643 318.5,142.5C 324.5,136.167 330.5,129.833 336.5,123.5C 353.988,119.226 370.988,113.56 387.5,106.5C 391.833,102.5 396.167,98.5 400.5,94.5 Z" /></g><g><path style="opacity:0.977" fill="#5ddcc7" d="M 70.5,107.5 C 75.8934,114.863 83.2267,118.196 92.5,117.5C 88.5,121.833 84.5,126.167 80.5,130.5C 77.9333,130.145 75.4333,129.479 73,128.5C 65.939,136.931 60.1056,146.265 55.5,156.5C 46.5531,164.11 37.8865,172.11 29.5,180.5C 36.5336,158.266 46.8669,137.766 60.5,119C 59.6195,118.292 58.9528,117.458 58.5,116.5C 62.5,113.5 66.5,110.5 70.5,107.5 Z" /></g><g><path style="opacity:0.969" fill="#51c3c7" d="M 190.5,126.5 C 200.917,128.423 211.25,130.089 221.5,131.5C 216.438,135.559 212.105,140.226 208.5,145.5C 201.496,144.355 194.496,143.022 187.5,141.5C 184.001,154.66 181.334,167.993 179.5,181.5C 189.144,182.498 198.81,182.832 208.5,182.5C 206.708,183.309 204.708,183.809 202.5,184C 197.963,188.369 193.63,192.869 189.5,197.5C 170.5,197.5 151.5,197.5 132.5,197.5C 129.359,196.679 126.025,196.179 122.5,196C 126.833,191.667 131.167,187.333 135.5,183C 139.688,182.824 143.688,182.324 147.5,181.5C 153.206,181.829 158.872,181.495 164.5,180.5C 165.978,169.286 167.978,158.286 170.5,147.5C 177.891,141.111 184.557,134.111 190.5,126.5 Z" /></g><g><path style="opacity:0.954" fill="#3e98c7" d="M 457.5,104.5 C 456.468,109.732 454.468,114.565 451.5,119C 456.449,126.122 460.782,133.622 464.5,141.5C 462.782,148.189 458.782,150.356 452.5,148C 448.167,141.667 443.833,135.333 439.5,129C 437.428,128.964 435.428,129.464 433.5,130.5C 441.138,121.527 449.138,112.86 457.5,104.5 Z" /></g><g><path style="opacity:0.978" fill="#4dbac7" d="M 221.5,131.5 C 243.838,132.761 266.171,132.761 288.5,131.5C 283.5,136.833 278.5,142.167 273.5,147.5C 251.791,147.89 230.125,147.224 208.5,145.5C 212.105,140.226 216.438,135.559 221.5,131.5 Z" /></g><g><path style="opacity:0.97" fill="#5ad6c7" d="M 55.5,156.5 C 41.1142,185.083 33.4476,215.416 32.5,247.5C 26.0513,251.611 21.0513,256.944 17.5,263.5C 16.6541,235.087 20.6541,207.42 29.5,180.5C 37.8865,172.11 46.5531,164.11 55.5,156.5 Z" /></g><g><path style="opacity:0.99" fill="#44a5c7" d="M 341.5,153.5 C 343.526,162.652 345.192,171.986 346.5,181.5C 341.528,186.807 336.528,192.14 331.5,197.5C 321.833,197.5 312.167,197.5 302.5,197.5C 301.391,196.71 300.058,196.21 298.5,196C 303.037,191.631 307.37,187.131 311.5,182.5C 318.2,182.83 324.866,182.497 331.5,181.5C 330.393,175.856 329.393,170.189 328.5,164.5C 333.107,161.232 337.441,157.565 341.5,153.5 Z" /></g><g><path style="opacity:0.96" fill="#398cc7" d="M 468.5,168.5 C 475.77,167.217 479.937,170.217 481,177.5C 482.556,181.558 483.723,185.725 484.5,190C 483.296,196.106 479.629,198.439 473.5,197C 471.667,196.5 470.5,195.333 470,193.5C 467.861,187.585 466.028,181.585 464.5,175.5C 464.577,172.335 465.91,170.001 468.5,168.5 Z" /></g><g><path style="opacity:0.986" fill="#419fc7" d="M 346.5,181.5 C 357.321,182.495 368.321,182.828 379.5,182.5C 375.37,187.131 371.037,191.631 366.5,196C 363.964,196.186 361.631,196.686 359.5,197.5C 350.167,197.5 340.833,197.5 331.5,197.5C 336.528,192.14 341.528,186.807 346.5,181.5 Z" /></g><g><path style="opacity:0.999" fill="#55cbc7" d="M 147.5,181.5 C 143.688,182.324 139.688,182.824 135.5,183C 131.167,187.333 126.833,191.667 122.5,196C 126.025,196.179 129.359,196.679 132.5,197.5C 118.496,197.333 104.496,197.5 90.5,198C 89.5098,212.088 89.1765,226.255 89.5,240.5C 88.6787,237.359 88.1787,234.025 88,230.5C 83.6667,234.833 79.3333,239.167 75,243.5C 74.8313,228.661 74.3313,213.994 73.5,199.5C 74.1949,189.928 79.1949,184.094 88.5,182C 108.164,181.5 127.831,181.333 147.5,181.5 Z" /></g><g><path style="opacity:0.988" fill="#4cb8c7" d="M 208.5,182.5 C 218.167,182.5 227.833,182.5 237.5,182.5C 233.37,187.131 229.037,191.631 224.5,196C 221.964,196.186 219.631,196.686 217.5,197.5C 208.167,197.5 198.833,197.5 189.5,197.5C 193.63,192.869 197.963,188.369 202.5,184C 204.708,183.809 206.708,183.309 208.5,182.5 Z" /></g><g><path style="opacity:0.986" fill="#49b1c7" d="M 237.5,182.5 C 250.833,182.5 264.167,182.5 277.5,182.5C 273.37,187.131 269.037,191.631 264.5,196C 268.025,196.179 271.359,196.679 274.5,197.5C 255.5,197.5 236.5,197.5 217.5,197.5C 219.631,196.686 221.964,196.186 224.5,196C 229.037,191.631 233.37,187.131 237.5,182.5 Z" /></g><g><path style="opacity:0.986" fill="#47abc7" d="M 277.5,182.5 C 288.833,182.5 300.167,182.5 311.5,182.5C 307.37,187.131 303.037,191.631 298.5,196C 300.058,196.21 301.391,196.71 302.5,197.5C 293.167,197.5 283.833,197.5 274.5,197.5C 271.359,196.679 268.025,196.179 264.5,196C 269.037,191.631 273.37,187.131 277.5,182.5 Z" /></g><g><path style="opacity:0.979" fill="#3f99c7" d="M 379.5,182.5 C 392.167,182.5 404.833,182.5 417.5,182.5C 414.102,187.406 410.102,191.906 405.5,196C 409.356,196.177 413.023,196.677 416.5,197.5C 397.5,197.5 378.5,197.5 359.5,197.5C 361.631,196.686 363.964,196.186 366.5,196C 371.037,191.631 375.37,187.131 379.5,182.5 Z" /></g><g><path style="opacity:0.973" fill="#3c92c7" d="M 417.5,182.5 C 429.025,182.353 435.692,188.019 437.5,199.5C 432.224,203.437 427.224,207.771 422.5,212.5C 422.666,208.154 422.499,203.821 422,199.5C 420.599,197.808 418.766,197.141 416.5,197.5C 413.023,196.677 409.356,196.177 405.5,196C 410.102,191.906 414.102,187.406 417.5,182.5 Z" /></g><g><path style="opacity:0.984" fill="#398cc7" d="M 437.5,199.5 C 437.5,210.5 437.5,221.5 437.5,232.5C 432.869,236.63 428.369,240.963 424,245.5C 423.814,248.036 423.314,250.369 422.5,252.5C 422.5,239.167 422.5,225.833 422.5,212.5C 427.224,207.771 432.224,203.437 437.5,199.5 Z" /></g><g><path style="opacity:0.968" fill="#3480c7" d="M 493.5,250.5 C 488.776,255.229 483.776,259.563 478.5,263.5C 466.345,262.505 454.011,262.171 441.5,262.5C 445.833,257.833 450.167,253.167 454.5,248.5C 462.5,248.5 470.5,248.5 478.5,248.5C 478.05,240.161 477.884,231.828 478,223.5C 481.139,219.423 484.972,218.59 489.5,221C 490.893,222.171 491.727,223.671 492,225.5C 492.974,233.807 493.474,242.141 493.5,250.5 Z" /></g><g><path style="opacity:0.975" fill="#42a0c7" d="M 258.5,268.5 C 262.833,265.167 267.167,261.833 271.5,258.5C 272.159,261.408 272.993,261.742 274,259.5C 278.723,247.053 283.723,234.72 289,222.5C 293.801,218.251 298.134,218.584 302,223.5C 302.701,226.928 302.368,230.262 301,233.5C 294.358,250.43 287.524,267.264 280.5,284C 276.849,287.227 272.849,287.894 268.5,286C 264.523,280.546 261.189,274.713 258.5,268.5 Z" /></g><g><path style="opacity:0.966" fill="#50bfc7" d="M 133.5,253.5 C 129.773,257.233 125.773,260.566 121.5,263.5C 115.378,250.967 110.545,237.967 107,224.5C 110.846,217.534 115.513,216.867 121,222.5C 125.466,232.737 129.633,243.071 133.5,253.5 Z" /></g><g><path style="opacity:0.962" fill="#47adc7" d="M 237.5,257.5 C 233.5,261.167 229.5,264.833 225.5,268.5C 220.439,255.489 215.272,242.489 210,229.5C 209.96,219.885 214.294,217.218 223,221.5C 228.329,233.324 233.162,245.324 237.5,257.5 Z" /></g><g><path style="opacity:0.971" fill="#409cc7" d="M 337.5,249.5 C 334.232,253.271 330.732,256.938 327,260.5C 326.517,261.448 326.351,262.448 326.5,263.5C 321.733,252.721 317.233,241.721 313,230.5C 310.789,224.031 312.956,220.031 319.5,218.5C 321.774,218.97 323.774,219.97 325.5,221.5C 329.694,230.746 333.694,240.08 337.5,249.5 Z" /></g><g><path style="opacity:0.984" fill="#3686c7" d="M 437.5,232.5 C 437.5,237.833 437.5,243.167 437.5,248.5C 443.167,248.5 448.833,248.5 454.5,248.5C 450.167,253.167 445.833,257.833 441.5,262.5C 440.167,262.5 438.833,262.5 437.5,262.5C 434.112,269.58 429.112,275.58 422.5,280.5C 422.5,271.167 422.5,261.833 422.5,252.5C 423.314,250.369 423.814,248.036 424,245.5C 428.369,240.963 432.869,236.63 437.5,232.5 Z" /></g><g><path style="opacity:0.972" fill="#3a8ec7" d="M 362.5,271.5 C 367.105,268.564 371.105,264.898 374.5,260.5C 375.79,259.942 376.623,258.942 377,257.5C 381.471,245.754 386.138,234.087 391,222.5C 393.909,219.606 397.409,218.773 401.5,220C 403.259,221.008 404.426,222.508 405,224.5C 405.192,227.947 404.525,231.28 403,234.5C 396.496,251.668 389.329,268.501 381.5,285C 378.033,287.786 374.366,288.12 370.5,286C 367.44,281.381 364.774,276.547 362.5,271.5 Z" /></g><g><path style="opacity:0.979" fill="#4cb7c7" d="M 194.5,241.5 C 194.565,241.062 194.399,240.728 194,240.5C 182.632,252.035 171.132,263.369 159.5,274.5C 157.108,270.722 154.941,266.722 153,262.5C 148.912,269.676 145.078,277.009 141.5,284.5C 137.001,288.67 132.834,288.336 129,283.5C 126.195,276.914 123.695,270.247 121.5,263.5C 125.773,260.566 129.773,257.233 133.5,253.5C 134.572,255.882 135.738,258.216 137,260.5C 140.333,253.833 143.667,247.167 147,240.5C 151.333,236.5 155.667,236.5 160,240.5C 163.333,247.167 166.667,253.833 170,260.5C 175.049,249.362 179.715,238.029 184,226.5C 187.357,218.875 192.357,217.541 199,222.5C 199.845,229.449 198.345,235.783 194.5,241.5 Z" /></g><g><path style="opacity:0.971" fill="#3c93c7" d="M 374.5,260.5 C 371.105,264.898 367.105,268.564 362.5,271.5C 360.74,268.311 359.24,264.978 358,261.5C 354.061,269.045 350.394,276.712 347,284.5C 342.337,288.753 338.003,288.42 334,283.5C 331.209,276.922 328.709,270.255 326.5,263.5C 326.351,262.448 326.517,261.448 327,260.5C 330.732,256.938 334.232,253.271 337.5,249.5C 338.895,253.515 340.395,257.515 342,261.5C 345.667,254.167 349.333,246.833 353,239.5C 357.264,236.655 361.264,236.988 365,240.5C 368.451,247.067 371.618,253.734 374.5,260.5 Z" /></g><g><path style="opacity:0.974" fill="#4ab1c7" d="M 194.5,241.5 C 189.177,256.31 183.177,270.81 176.5,285C 171.466,288.778 166.966,288.278 163,283.5C 161.729,280.516 160.562,277.516 159.5,274.5C 171.132,263.369 182.632,252.035 194,240.5C 194.399,240.728 194.565,241.062 194.5,241.5 Z" /></g><g><path style="opacity:0.976" fill="#44a5c7" d="M 271.5,258.5 C 267.167,261.833 262.833,265.167 258.5,268.5C 257.763,266.695 256.763,265.029 255.5,263.5C 251.578,270.342 247.912,277.342 244.5,284.5C 240.371,288.455 236.204,288.455 232,284.5C 229.728,279.178 227.561,273.845 225.5,268.5C 229.5,264.833 233.5,261.167 237.5,257.5C 238.158,258.398 238.824,259.398 239.5,260.5C 243.255,253.991 246.755,247.324 250,240.5C 254.604,236.468 258.937,236.801 263,241.5C 265.847,247.193 268.68,252.86 271.5,258.5 Z" /></g><g><path style="opacity:0.984" fill="#54c9c7" d="M 73.5,199.5 C 74.3313,213.994 74.8313,228.661 75,243.5C 79.3333,239.167 83.6667,234.833 88,230.5C 88.1787,234.025 88.6787,237.359 89.5,240.5C 89.5,249.833 89.5,259.167 89.5,268.5C 88.71,267.391 88.21,266.058 88,264.5C 83.6312,269.037 79.1312,273.37 74.5,277.5C 74.5,272.833 74.5,268.167 74.5,263.5C 60.5,263.5 46.5,263.5 32.5,263.5C 33.268,270.483 33.9347,277.483 34.5,284.5C 29.8333,288.5 25.5,292.833 21.5,297.5C 19.1237,286.428 17.7904,275.095 17.5,263.5C 21.0513,256.944 26.0513,251.611 32.5,247.5C 46.1667,247.5 59.8333,247.5 73.5,247.5C 73.5,231.5 73.5,215.5 73.5,199.5 Z" /></g><g><path style="opacity:0.968" fill="#3179c7" d="M 493.5,250.5 C 493.83,262.584 493.164,274.584 491.5,286.5C 485.869,291.63 480.369,296.964 475,302.5C 474.536,301.906 474.369,301.239 474.5,300.5C 476.558,288.249 477.892,275.916 478.5,263.5C 483.776,259.563 488.776,255.229 493.5,250.5 Z" /></g><g><path style="opacity:1" fill="#4fbec7" d="M 89.5,268.5 C 89.5,278.167 89.5,287.833 89.5,297.5C 84.1396,302.194 79.1396,307.194 74.5,312.5C 74.5,300.833 74.5,289.167 74.5,277.5C 79.1312,273.37 83.6312,269.037 88,264.5C 88.21,266.058 88.71,267.391 89.5,268.5 Z" /></g><g><path style="opacity:0.98" fill="#337fc7" d="M 437.5,262.5 C 437.667,279.503 437.5,296.503 437,313.5C 435.684,320.815 431.517,325.648 424.5,328C 408.17,328.5 391.837,328.667 375.5,328.5C 379.833,323.833 384.167,319.167 388.5,314.5C 399.172,314.667 409.839,314.5 420.5,314C 421,313.5 421.5,313 422,312.5C 422.5,301.839 422.667,291.172 422.5,280.5C 429.112,275.58 434.112,269.58 437.5,262.5 Z" /></g><g><path style="opacity:0.972" fill="#51c3c7" d="M 34.5,284.5 C 36.5354,299.509 40.0354,314.176 45,328.5C 46.4668,334.905 43.9668,338.572 37.5,339.5C 34.7862,339.06 32.6195,337.726 31,335.5C 26.5747,323.132 23.408,310.465 21.5,297.5C 25.5,292.833 29.8333,288.5 34.5,284.5 Z" /></g><g><path style="opacity:0.967" fill="#2e73c7" d="M 491.5,286.5 C 490.03,301.703 486.697,316.37 481.5,330.5C 473.535,337.964 465.702,345.631 458,353.5C 457.536,352.906 457.369,352.239 457.5,351.5C 464.595,334.883 470.261,317.883 474.5,300.5C 474.369,301.239 474.536,301.906 475,302.5C 480.369,296.964 485.869,291.63 491.5,286.5 Z" /></g><g><path style="opacity:0.975" fill="#4db8c7" d="M 89.5,297.5 C 89.3341,302.511 89.5007,307.511 90,312.5C 90.5,313 91,313.5 91.5,314C 96.1548,314.499 100.821,314.666 105.5,314.5C 100.771,319.224 96.4373,324.224 92.5,329.5C 81.959,328.625 75.959,322.959 74.5,312.5C 79.1396,307.194 84.1396,302.194 89.5,297.5 Z" /></g><g><path style="opacity:0.986" fill="#49b1c7" d="M 105.5,314.5 C 118.833,314.5 132.167,314.5 145.5,314.5C 141.37,319.131 137.037,323.631 132.5,328C 136.025,328.179 139.359,328.679 142.5,329.5C 125.833,329.5 109.167,329.5 92.5,329.5C 96.4373,324.224 100.771,319.224 105.5,314.5 Z" /></g><g><path style="opacity:0.986" fill="#47abc7" d="M 145.5,314.5 C 156.833,314.5 168.167,314.5 179.5,314.5C 174.833,319.5 170.167,324.5 165.5,329.5C 157.833,329.5 150.167,329.5 142.5,329.5C 139.359,328.679 136.025,328.179 132.5,328C 137.037,323.631 141.37,319.131 145.5,314.5 Z" /></g><g><path style="opacity:0.96" fill="#3f99c7" d="M 247.5,314.5 C 260.167,314.5 272.833,314.5 285.5,314.5C 281.897,319.442 277.897,324.108 273.5,328.5C 260.5,328.5 247.5,328.5 234.5,328.5C 238.833,323.833 243.167,319.167 247.5,314.5 Z" /></g><g><path style="opacity:0.971" fill="#3c92c7" d="M 285.5,314.5 C 297.167,314.5 308.833,314.5 320.5,314.5C 316.167,319.167 311.833,323.833 307.5,328.5C 296.167,328.5 284.833,328.5 273.5,328.5C 277.897,324.108 281.897,319.442 285.5,314.5 Z" /></g><g><path style="opacity:0.971" fill="#398cc7" d="M 320.5,314.5 C 333.833,314.5 347.167,314.5 360.5,314.5C 358.369,315.314 356.036,315.814 353.5,316C 345.632,324.036 337.632,331.869 329.5,339.5C 329.942,335.846 330.276,332.179 330.5,328.5C 322.833,328.5 315.167,328.5 307.5,328.5C 311.833,323.833 316.167,319.167 320.5,314.5 Z" /></g><g><path style="opacity:0.974" fill="#3686c7" d="M 360.5,314.5 C 369.833,314.5 379.167,314.5 388.5,314.5C 384.167,319.167 379.833,323.833 375.5,328.5C 365.833,328.5 356.167,328.5 346.5,328.5C 344.961,340.609 342.961,352.609 340.5,364.5C 333.195,370.47 326.195,376.803 319.5,383.5C 309.782,382.244 300.115,380.911 290.5,379.5C 294.5,375.167 298.5,370.833 302.5,366.5C 309.47,366.805 316.304,367.805 323,369.5C 325.86,359.703 328.027,349.703 329.5,339.5C 337.632,331.869 345.632,324.036 353.5,316C 356.036,315.814 358.369,315.314 360.5,314.5 Z" /></g><g><path style="opacity:0.981" fill="#2c6dc7" d="M 481.5,330.5 C 474.692,352.781 464.692,373.448 451.5,392.5C 448.833,397.167 445.167,400.833 440.5,403.5C 434.989,396.415 427.656,393.082 418.5,393.5C 422.897,389.108 426.897,384.442 430.5,379.5C 433.25,380.191 435.917,381.191 438.5,382.5C 445.612,372.604 451.945,362.27 457.5,351.5C 457.369,352.239 457.536,352.906 458,353.5C 465.702,345.631 473.535,337.964 481.5,330.5 Z" /></g><g><path style="opacity:0.979" fill="#43a3c7" d="M 179.5,314.5 C 202.167,314.5 224.833,314.5 247.5,314.5C 243.167,319.167 238.833,323.833 234.5,328.5C 216.155,328.167 197.821,328.5 179.5,329.5C 180.632,334.091 181.299,338.758 181.5,343.5C 181.657,344.873 181.49,346.207 181,347.5C 176.896,351.095 173.396,355.095 170.5,359.5C 168.29,349.72 166.624,339.72 165.5,329.5C 170.167,324.5 174.833,319.5 179.5,314.5 Z" /></g><g><path style="opacity:0.969" fill="#429fc7" d="M 181.5,343.5 C 183.098,352.142 185.098,360.808 187.5,369.5C 189.071,368.691 190.738,368.357 192.5,368.5C 187.175,375.157 181.509,381.49 175.5,387.5C 159.862,391.157 144.528,395.824 129.5,401.5C 128.761,401.631 128.094,401.464 127.5,401C 134.369,394.298 141.036,387.465 147.5,380.5C 155.518,377.409 163.851,375.076 172.5,373.5C 171.704,368.853 171.037,364.186 170.5,359.5C 173.396,355.095 176.896,351.095 181,347.5C 181.49,346.207 181.657,344.873 181.5,343.5 Z" /></g><g><path style="opacity:0.961" fill="#3c92c6" d="M 236.5,363.5 C 248.167,363.5 259.833,363.5 271.5,363.5C 267.37,368.131 263.037,372.631 258.5,377C 260.058,377.21 261.391,377.71 262.5,378.5C 249.152,378.389 235.819,378.723 222.5,379.5C 227.562,374.443 232.228,369.11 236.5,363.5 Z" /></g><g><path style="opacity:0.976" fill="#398cc7" d="M 271.5,363.5 C 282.046,363.794 292.379,364.794 302.5,366.5C 298.5,370.833 294.5,375.167 290.5,379.5C 281.174,379 271.841,378.667 262.5,378.5C 261.391,377.71 260.058,377.21 258.5,377C 263.037,372.631 267.37,368.131 271.5,363.5 Z" /></g><g><path style="opacity:0.969" fill="#337fc7" d="M 340.5,364.5 C 339.477,367.393 339.477,370.226 340.5,373C 348.134,374.57 355.467,376.737 362.5,379.5C 359.5,383.5 356.5,387.5 353.5,391.5C 347.58,389.684 341.58,388.518 335.5,388C 332.505,398.823 328.838,409.323 324.5,419.5C 315.535,427.964 306.702,436.631 298,445.5C 297.601,445.272 297.435,444.938 297.5,444.5C 307.413,425.605 315.079,405.772 320.5,385C 320.43,384.235 320.097,383.735 319.5,383.5C 326.195,376.803 333.195,370.47 340.5,364.5 Z" /></g><g><path style="opacity:0.982" fill="#3f99c7" d="M 236.5,363.5 C 232.228,369.11 227.562,374.443 222.5,379.5C 211.733,380.513 201.066,382.179 190.5,384.5C 192.658,391.469 194.658,398.469 196.5,405.5C 192.102,408.895 188.436,412.895 185.5,417.5C 181.257,407.885 177.923,397.885 175.5,387.5C 181.509,381.49 187.175,375.157 192.5,368.5C 207.049,365.957 221.716,364.291 236.5,363.5 Z" /></g><g><path style="opacity:0.975" fill="#4ab2c7" d="M 79.5,380.5 C 71.8333,388.833 63.8333,396.833 55.5,404.5C 56.4778,400.377 58.1445,396.543 60.5,393C 55.214,384.265 50.0473,375.432 45,366.5C 43.4855,356.842 47.3188,353.675 56.5,357C 62,365.833 67.5,374.667 73,383.5C 74.9935,382.086 77.1602,381.086 79.5,380.5 Z" /></g><g><path style="opacity:0.962" fill="#47abc7" d="M 109.5,385.5 C 105.463,388.537 102.129,392.203 99.5,396.5C 83.8411,390.579 73.3411,395.579 68,411.5C 67.0934,420.679 70.2601,428.012 77.5,433.5C 74.0985,436.895 71.0985,440.562 68.5,444.5C 61.8547,440.253 57.3547,434.253 55,426.5C 52.8501,418.956 53.0168,411.623 55.5,404.5C 63.8333,396.833 71.8333,388.833 79.5,380.5C 90.3336,377.956 100.334,379.623 109.5,385.5 Z" /></g><g><path style="opacity:0.975" fill="#2e72c7" d="M 430.5,379.5 C 426.897,384.442 422.897,389.108 418.5,393.5C 409.875,396.125 404.208,401.792 401.5,410.5C 396.833,414.833 392.167,419.167 387.5,423.5C 386.191,417.629 386.191,411.629 387.5,405.5C 384.96,403.062 381.96,401.395 378.5,400.5C 381.434,396.227 384.767,392.227 388.5,388.5C 390.84,389.086 393.007,390.086 395,391.5C 404.482,380.839 416.315,376.839 430.5,379.5 Z" /></g><g><path style="opacity:0.982" fill="#3079c7" d="M 362.5,379.5 C 371.46,381.709 380.126,384.709 388.5,388.5C 384.767,392.227 381.434,396.227 378.5,400.5C 370.232,397.3 361.898,394.3 353.5,391.5C 356.5,387.5 359.5,383.5 362.5,379.5 Z" /></g><g><path style="opacity:0.968" fill="#2866c7" d="M 451.5,392.5 C 463.682,411.792 461.349,429.292 444.5,445C 430.236,453.496 415.902,453.663 401.5,445.5C 404.5,441.5 407.5,437.5 410.5,433.5C 426.148,439.789 436.981,435.123 443,419.5C 444.068,413.825 443.235,408.492 440.5,403.5C 445.167,400.833 448.833,397.167 451.5,392.5 Z" /></g><g><path style="opacity:0.966" fill="#43a1c7" d="M 147.5,380.5 C 141.036,387.465 134.369,394.298 127.5,401C 128.094,401.464 128.761,401.631 129.5,401.5C 128.359,402.339 127.026,403.006 125.5,403.5C 125.167,404.5 124.833,405.5 124.5,406.5C 126.544,415.858 125.211,424.691 120.5,433C 122.323,433.997 123.99,435.164 125.5,436.5C 122.871,439.631 120.038,442.631 117,445.5C 116.805,446.819 116.972,448.153 117.5,449.5C 115.454,447.721 113.287,446.054 111,444.5C 99.9817,451.921 88.1484,453.421 75.5,449C 72.7613,447.974 70.428,446.474 68.5,444.5C 71.0985,440.562 74.0985,436.895 77.5,433.5C 89.8916,439.089 100.058,436.422 108,425.5C 112.905,413.395 110.072,403.728 99.5,396.5C 102.129,392.203 105.463,388.537 109.5,385.5C 112.431,387.091 115.098,389.091 117.5,391.5C 127.228,387.036 137.228,383.369 147.5,380.5 Z" /></g><g><path style="opacity:0.967" fill="#3c93c7" d="M 196.5,405.5 C 199.675,413.012 202.675,420.679 205.5,428.5C 202.94,432.57 199.773,436.236 196,439.5C 195.329,438.748 194.496,438.414 193.5,438.5C 190.045,431.8 187.378,424.8 185.5,417.5C 188.436,412.895 192.102,408.895 196.5,405.5 Z" /></g><g><path style="opacity:0.98" fill="#2c6ec7" d="M 401.5,410.5 C 400.351,415.275 400.851,419.941 403,424.5C 405.335,427.665 407.835,430.665 410.5,433.5C 407.5,437.5 404.5,441.5 401.5,445.5C 384.658,457.429 366.658,467.596 347.5,476C 341.981,478.34 336.314,480.173 330.5,481.5C 338.833,472.833 347.167,464.167 355.5,455.5C 367.961,449.039 379.628,441.372 390.5,432.5C 388.895,429.686 387.895,426.686 387.5,423.5C 392.167,419.167 396.833,414.833 401.5,410.5 Z" /></g><g><path style="opacity:0.963" fill="#398dc7" d="M 205.5,428.5 C 209.565,436.294 213.898,443.96 218.5,451.5C 214.473,454.86 210.806,458.527 207.5,462.5C 202.329,454.828 197.662,446.828 193.5,438.5C 194.496,438.414 195.329,438.748 196,439.5C 199.773,436.236 202.94,432.57 205.5,428.5 Z" /></g><g><path style="opacity:0.976" fill="#3179c6" d="M 324.5,419.5 C 317.914,440.18 307.58,458.68 293.5,475C 296.206,474.959 298.872,474.459 301.5,473.5C 301.611,474.117 301.944,474.617 302.5,475C 296.964,480.369 291.63,485.869 286.5,491.5C 274.714,493.238 262.714,493.905 250.5,493.5C 255.297,488.202 260.297,483.035 265.5,478C 265.272,477.601 264.938,477.435 264.5,477.5C 269.74,474.87 274.74,471.704 279.5,468C 286.13,460.551 292.13,452.718 297.5,444.5C 297.435,444.938 297.601,445.272 298,445.5C 306.702,436.631 315.535,427.964 324.5,419.5 Z" /></g><g><path style="opacity:0.979" fill="#3f99c7" d="M 125.5,436.5 C 133.7,442.097 142.033,447.43 150.5,452.5C 145.833,455.167 142.167,458.833 139.5,463.5C 131.899,459.228 124.566,454.561 117.5,449.5C 116.972,448.153 116.805,446.819 117,445.5C 120.038,442.631 122.871,439.631 125.5,436.5 Z" /></g><g><path style="opacity:0.976" fill="#3687c7" d="M 218.5,451.5 C 222.747,458.084 227.747,464.084 233.5,469.5C 226.775,476.221 220.442,483.221 214.5,490.5C 203.777,488.153 193.111,485.486 182.5,482.5C 185.963,478.536 189.63,474.702 193.5,471C 191.657,470.841 190.991,470.341 191.5,469.5C 200.175,471.672 208.842,473.505 217.5,475C 213.953,470.959 210.62,466.792 207.5,462.5C 210.806,458.527 214.473,454.86 218.5,451.5 Z" /></g><g><path style="opacity:0.962" fill="#3b91c7" d="M 150.5,452.5 C 163.891,459.035 177.558,464.702 191.5,469.5C 190.991,470.341 191.657,470.841 193.5,471C 189.63,474.702 185.963,478.536 182.5,482.5C 167.585,477.527 153.251,471.193 139.5,463.5C 142.167,458.833 145.833,455.167 150.5,452.5 Z" /></g><g><path style="opacity:0.966" fill="#2e73c7" d="M 355.5,455.5 C 347.167,464.167 338.833,472.833 330.5,481.5C 316.434,486.983 301.767,490.316 286.5,491.5C 291.63,485.869 296.964,480.369 302.5,475C 301.944,474.617 301.611,474.117 301.5,473.5C 320.25,469.694 338.25,463.694 355.5,455.5 Z" /></g><g><path style="opacity:0.969" fill="#3480c7" d="M 233.5,469.5 C 242.562,477.076 252.895,479.743 264.5,477.5C 264.938,477.435 265.272,477.601 265.5,478C 260.297,483.035 255.297,488.202 250.5,493.5C 238.423,493.38 226.423,492.38 214.5,490.5C 220.442,483.221 226.775,476.221 233.5,469.5 Z" /></g></svg>',
    torrent: '<svg data-drxaos-icon="torrent" width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#4caf50" fill-rule="evenodd" d="M23.501,44.125c11.016,0,20-8.984,20-20 c0-11.015-8.984-20-20-20c-11.016,0-20,8.985-20,20C3.501,35.141,12.485,44.125,23.501,44.125z" clip-rule="evenodd"/><path fill="#ffffff" fill-rule="evenodd" d="M43.252,27.114C39.718,25.992,38.055,19.625,34,11l-7,1.077 c1.615,4.905,8.781,16.872,0.728,18.853C20.825,32.722,17.573,20.519,15,14l-8,2l10.178,27.081c1.991,0.67,4.112,1.044,6.323,1.044 c0.982,0,1.941-0.094,2.885-0.232l-4.443-8.376c6.868,1.552,12.308-0.869,12.962-6.203c1.727,2.29,4.089,3.183,6.734,3.172 C42.419,30.807,42.965,29.006,43.252,27.114z" clip-rule="evenodd"/></svg>',
    play: '<svg data-drxaos-icon="play" width="28" height="28" viewBox="0 0 847 847" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="423" cy="423" r="398" fill="#3498db"/><path d="M642 423 467 322 292 221v404l175-101z" fill="#ffffff" stroke="#ffffff" stroke-width="42.33" stroke-linejoin="round"/></svg>',
    trailer: '<svg data-drxaos-icon="trailer" width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M23.5 7.2c0-.8-.3-1.6-1-2.3-.8-.9-1.8-1-2.2-1.1C17.4 3.5 12 3.5 12 3.5s-5.4 0-8.3.3c-.4 0-1.5.1-2.2 1.1-.7.7-1 1.5-1 2.3C0 10.1 0 12 0 12s0 1.9.5 4.8c0 .8.3 1.6 1 2.3.8.9 1.9 1 2.3 1.1 1.7.2 8.3.3 8.3.3s5.4 0 8.3-.3c.4 0 1.5-.1 2.2-1.1.7-.7 1-1.5 1-2.3.5-2.9.5-4.8.5-4.8s0-1.9-.5-4.8z" fill="#ff0000"/><polygon points="10,8 16,12 10,16" fill="#ffffff"/></svg>',
    book: '<svg data-drxaos-icon="book" width="21" height="32" viewBox="0 0 21 32" fill="none"><path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" fill="#FCD34D" stroke="#F59E0B" stroke-width="2"/></svg>',
    reaction: '<svg data-drxaos-icon="reaction" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.55 3.4 6.44 8.55 11.05L12 20.35l1.45-0.81C18.6 14.94 22 12.05 22 8.5 22 5.42 19.58 3 16.5 3z" fill="#EC4899"/></svg>',
    subscribe: '<svg data-drxaos-icon="subscribe" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" fill="#22C55E"/><path d="M18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.83 1.83A1 1 0 0 0 5 19h14a1 1 0 0 0 .71-1.71L18 16z" fill="#34D399"/></svg>',
    options: '<svg data-drxaos-icon="options" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="2" fill="#CBD5F5"/><circle cx="12" cy="12" r="2" fill="#CBD5F5"/><circle cx="19" cy="12" r="2" fill="#CBD5F5"/></svg>'
};

// Функция для применения выбранного loader
function applyLoader(loaderId) {
    try {
        var loaders = {
            'default': '',
            'loader1': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><style>@keyframes loader4{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}</style><path stroke="#FF0000" stroke-linecap="round" stroke-width="1.5" d="M12 6.864v1.333m0 7.606v1.333M17.136 12h-1.333m-7.606 0H6.864m8.768 3.632l-.943-.943M9.311 9.311l-.943-.943m0 7.264l.943-.943m5.378-5.378l.943-.943" style="animation:loader4 1.5s linear infinite both;transform-origin:center center"/></svg>',
            'loader2': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><style>@keyframes loader12{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}</style><g style="animation:loader12 2s cubic-bezier(.63,-.71,.32,1.28) infinite both;transform-origin:center center"><circle cx="12" cy="12" r="5" stroke="#FF0000" stroke-width="1.5"/><circle cx="12" cy="17" r="2" fill="#FF0000"/></g></svg>',
            'loader3': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><style>@keyframes loader13-1{0%{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes loader13-2{0%{transform:rotate(0)}to{transform:rotate(-360deg)}}</style><path stroke="#FF0000" stroke-width=".8" d="M7.157 7.157h10v10h-10z" style="animation:loader13-1 3s linear infinite both;transform-origin:center center"/><path stroke="#FF0000" stroke-width=".8" d="M12 5.151l7.071 7.071L12 19.293l-7.071-7.071z" style="animation:loader13-2 3s linear infinite both;transform-origin:center center"/></svg>',
            'loader4': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><style>@keyframes loader3{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}</style><path fill="#FF0000" d="M6.685 13.626a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252zm5.315 0a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252zm5.316 0a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252z" style="animation:loader3 1s cubic-bezier(.63,-.71,.32,1.28) infinite both;transform-origin:center center"/></svg>',
            'loader5': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><style>@keyframes loader15{0%{opacity:.8}50%{opacity:1}100%{opacity:0.8}}</style><circle cx="12" cy="12" r="6" fill="#FF0000" style="animation:loader15 1.5s cubic-bezier(.165,.84,.44,1) infinite both;transform-origin:center center"/><path fill="#FF0000" fill-rule="evenodd" d="M13.41 11.591a.5.5 0 010 .817l-1.73 1.222a.5.5 0 01-.788-.409v-2.442a.5.5 0 01.789-.409l1.729 1.222z" clip-rule="evenodd"/></svg>',
            'loader6': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="none" d="M0 0h200v200H0z"></path><path fill="none" stroke-linecap="round" stroke="#FF0000" stroke-width="15" transform-origin="center" d="M70 95.5V112m0-84v16.5m0 0a25.5 25.5 0 1 0 0 51 25.5 25.5 0 0 0 0-51Zm36.4 4.5L92 57.3M33.6 91 48 82.7m0-25.5L33.6 49m58.5 33.8 14.3 8.2"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="0;-120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path><path fill="none" stroke-linecap="round" stroke="#FF0000" stroke-width="15" transform-origin="center" d="M130 155.5V172m0-84v16.5m0 0a25.5 25.5 0 1 0 0 51 25.5 25.5 0 0 0 0-51Zm36.4 4.5-14.3 8.3M93.6 151l14.3-8.3m0-25.4L93.6 109m58.5 33.8 14.3 8.2"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>',
            'loader7': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#FF0000" stroke="#FF0000" stroke-width="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="0.4" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#FF0000" stroke="#FF0000" stroke-width="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="0.4" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#FF0000" stroke="#FF0000" stroke-width="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="0.4" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>',
            'loader8': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><path fill="none" stroke="#FF0000" stroke-width="15" stroke-linecap="round" stroke-dasharray="300 385" stroke-dashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="0.4" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>'
        };
        
        var selectedLoader = loaders[loaderId] || '';
        
        // Правильно кодируем SVG для data URI (как в рабочем примере)
        var encodedSvg = '';
        if (selectedLoader) {
            // Убираем все переносы строк и лишние пробелы, затем кодируем
            var cleanedSvg = selectedLoader.replace(/\s+/g, ' ').trim();
            encodedSvg = encodeURIComponent(cleanedSvg);
        }
        
        // Формируем data URI как в рабочем примере
        var bgUrl = selectedLoader ? 'url("data:image/svg+xml,' + encodedSvg + '")' : 'url(../img/loader.svg)';
        
        // Сохраняем текущий loader ID для использования в других функциях
        window.drxaosCurrentLoader = loaderId;
        window.drxaosCurrentLoaderSvg = selectedLoader;
        window.drxaosCurrentLoaderBgUrl = bgUrl;
        
        // Применяем CSS стили с максимальной специфичностью (как в рабочем примере)
        var css = '';
        if (loaderId === 'default') {
            css = 'body .modal-loading, body .modal-pending__loading, body .tracks-loading, body .loading-layer__ico, body .player-video__loader, body span.lampac-balanser-loader, html body .modal-loading, html body .modal-pending__loading, html body .tracks-loading, html body .loading-layer__ico, html body .player-video__loader, html body span.lampac-balanser-loader { background: url(../img/loader.svg) no-repeat 50% 50% !important; background-size: contain !important; background-image: url(../img/loader.svg) !important; } body .screensaver__preload, html body .screensaver__preload, body .activity__loader, html body .activity__loader { background: url(../img/loader.svg) no-repeat 50% 50% !important; background-size: contain !important; background-image: url(../img/loader.svg) !important; position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; width: 200px !important; height: 200px !important; z-index: 9999 !important; } body .tracks-loading::before, body .loading-layer__ico::before, body .activity__loader::before, body .player-video__loader::before, body .screensaver__preload::before, body span.lampac-balanser-loader::before, html body .tracks-loading::before, html body .loading-layer__ico::before, html body .activity__loader::before, html body .player-video__loader::before, html body .screensaver__preload::before, html body span.lampac-balanser-loader::before { display: none !important; content: none !important; }';
        } else {
            css = 'body .modal-loading, body .modal-pending__loading, body .tracks-loading, body .loading-layer__ico, body .player-video__loader, body span.lampac-balanser-loader, html body .modal-loading, html body .modal-pending__loading, html body .tracks-loading, html body .loading-layer__ico, html body .player-video__loader, html body span.lampac-balanser-loader { background: ' + bgUrl + ' no-repeat 50% 50% !important; background-size: contain !important; background-image: ' + bgUrl + ' !important; width: 80px !important; height: 40px !important; margin: 0 auto !important; } body .screensaver__preload, html body .screensaver__preload, body .activity__loader, html body .activity__loader { background: ' + bgUrl + ' no-repeat 50% 50% !important; background-size: contain !important; background-image: ' + bgUrl + ' !important; position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; width: 200px !important; height: 200px !important; z-index: 9999 !important; margin: 0 !important; } body .tracks-loading::before, body .loading-layer__ico::before, body .activity__loader::before, body .player-video__loader::before, body .screensaver__preload::before, body span.lampac-balanser-loader::before, html body .tracks-loading::before, html body .loading-layer__ico::before, html body .activity__loader::before, html body .player-video__loader::before, html body .screensaver__preload::before, html body span.lampac-balanser-loader::before { display: none !important; content: none !important; }';
        }
        
        styleManager.setStyle('drxaos-loader-style', css);
        
        // Применяем loader напрямую ко всем существующим элементам через JavaScript
        applyLoaderToElements(loaderId, selectedLoader, bgUrl);
    } catch (err) {
        
    }
}

// Функция для применения loader к элементам напрямую через JavaScript
function applyLoaderToElements(loaderId, selectedLoaderSvg, bgUrl) {
    try {
        // Находим все элементы с классами modal-loading, modal-pending__loading, tracks-loading, loading-layer__ico, activity__loader, player-video__loader
        var loadingElements = document.querySelectorAll('.modal-loading, .modal-pending__loading, .tracks-loading, .loading-layer__ico, .activity__loader, .player-video__loader, .screensaver__preload, span.lampac-balanser-loader');
        
        loadingElements.forEach(function(element) {
            if (!element) return;
            
            var isScreensaver = element.classList && element.classList.contains('screensaver__preload');
            var isActivityLoader = element.classList && element.classList.contains('activity__loader');
            
            if (loaderId === 'default') {
                // Для default просто убираем inline стили, чтобы работал CSS
                element.style.removeProperty('background');
                element.style.removeProperty('background-image');
                element.style.removeProperty('background-repeat');
                element.style.removeProperty('background-position');
                element.style.removeProperty('background-size');
                element.style.removeProperty('width');
                element.style.removeProperty('height');
                element.style.removeProperty('margin');
                if (isScreensaver || isActivityLoader) {
                    element.style.removeProperty('position');
                    element.style.removeProperty('top');
                    element.style.removeProperty('left');
                    element.style.removeProperty('transform');
                    element.style.removeProperty('z-index');
                }
            } else {
                // Применяем loader через background-image с data URI (как в рабочем примере)
                // Используем setProperty с important для максимального приоритета
                element.style.setProperty('background', bgUrl + ' no-repeat 50% 50%', 'important');
                element.style.setProperty('background-image', bgUrl, 'important');
                element.style.setProperty('background-repeat', 'no-repeat', 'important');
                element.style.setProperty('background-position', '50% 50%', 'important');
                element.style.setProperty('background-size', 'contain', 'important');
                
                if (isScreensaver || isActivityLoader) {
                    // Для screensaver__preload и activity__loader: большой размер, по центру экрана
                    element.style.setProperty('position', 'fixed', 'important');
                    element.style.setProperty('top', '50%', 'important');
                    element.style.setProperty('left', '50%', 'important');
                    element.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                    element.style.setProperty('width', '200px', 'important');
                    element.style.setProperty('height', '200px', 'important');
                    element.style.setProperty('z-index', '9999', 'important');
                    element.style.setProperty('margin', '0', 'important');
                } else {
                    // Для остальных элементов: стандартный размер
                    element.style.setProperty('width', '80px', 'important');
                    element.style.setProperty('height', '40px', 'important');
                    element.style.setProperty('margin', '0 auto', 'important');
                }
                
                // Очищаем innerHTML, чтобы убрать возможные старые элементы
                element.innerHTML = '';
                
                // Также устанавливаем атрибут для отслеживания
                element.setAttribute('data-drxaos-loader-applied', loaderId);
                
                // Принудительно перерисовываем элемент
                element.offsetHeight; // trigger reflow
            }
        });
    } catch (err) {
        
    }
}

// Функция для открытия модального окна выбора loader
function openLoaderModal(callback) {
    try {
        var loaders = [
            { id: 'loader1', name: 'Loader 1', svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none"><style>@keyframes loader4{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}</style><path stroke="#FF0000" stroke-linecap="round" stroke-width="1.5" d="M12 6.864v1.333m0 7.606v1.333M17.136 12h-1.333m-7.606 0H6.864m8.768 3.632l-.943-.943M9.311 9.311l-.943-.943m0 7.264l.943-.943m5.378-5.378l.943-.943" style="animation:loader4 1.5s linear infinite both;transform-origin:center center"/></svg>' },
            { id: 'loader2', name: 'Loader 2', svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none"><style>@keyframes loader12{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}</style><g style="animation:loader12 2s cubic-bezier(.63,-.71,.32,1.28) infinite both;transform-origin:center center"><circle cx="12" cy="12" r="5" stroke="#FF0000" stroke-width="1.5"/><circle cx="12" cy="17" r="2" fill="#FF0000"/></g></svg>' },
            { id: 'loader3', name: 'Loader 3', svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none"><style>@keyframes loader13-1{0%{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes loader13-2{0%{transform:rotate(0)}to{transform:rotate(-360deg)}}</style><path stroke="#FF0000" stroke-width=".8" d="M7.157 7.157h10v10h-10z" style="animation:loader13-1 3s linear infinite both;transform-origin:center center"/><path stroke="#FF0000" stroke-width=".8" d="M12 5.151l7.071 7.071L12 19.293l-7.071-7.071z" style="animation:loader13-2 3s linear infinite both;transform-origin:center center"/></svg>' },
            { id: 'loader4', name: 'Loader 4', svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none"><style>@keyframes loader3{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}</style><path fill="#FF0000" d="M6.685 13.626a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252zm5.315 0a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252zm5.316 0a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252z" style="animation:loader3 1s cubic-bezier(.63,-.71,.32,1.28) infinite both;transform-origin:center center"/></svg>' },
            { id: 'loader5', name: 'Loader 5', svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none"><style>@keyframes loader15{0%{transform:scale(.2);opacity:.8}80%{transform:scale(1.2);opacity:0}to{transform:scale(2.2);opacity:0}}</style><circle cx="12" cy="12" r="6" fill="#FF0000" style="animation:loader15 1.5s cubic-bezier(.165,.84,.44,1) infinite both;transform-origin:center center"/><path fill="#FF0000" fill-rule="evenodd" d="M13.41 11.591a.5.5 0 010 .817l-1.73 1.222a.5.5 0 01-.788-.409v-2.442a.5.5 0 01.789-.409l1.729 1.222z" clip-rule="evenodd"/></svg>' },
            { id: 'loader6', name: 'Loader 6', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="none" d="M0 0h200v200H0z"></path><path fill="none" stroke-linecap="round" stroke="#FF0000" stroke-width="15" transform-origin="center" d="M70 95.5V112m0-84v16.5m0 0a25.5 25.5 0 1 0 0 51 25.5 25.5 0 0 0 0-51Zm36.4 4.5L92 57.3M33.6 91 48 82.7m0-25.5L33.6 49m58.5 33.8 14.3 8.2"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="0;-120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path><path fill="none" stroke-linecap="round" stroke="#FF0000" stroke-width="15" transform-origin="center" d="M130 155.5V172m0-84v16.5m0 0a25.5 25.5 0 1 0 0 51 25.5 25.5 0 0 0 0-51Zm36.4 4.5-14.3 8.3M93.6 151l14.3-8.3m0-25.4L93.6 109m58.5 33.8 14.3 8.2"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>' },
            { id: 'loader7', name: 'Loader 7', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#FF0000" stroke="#FF0000" stroke-width="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="0.4" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#FF0000" stroke="#FF0000" stroke-width="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="0.4" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#FF0000" stroke="#FF0000" stroke-width="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="0.4" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>' },
            { id: 'loader8', name: 'Loader 8', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><path fill="none" stroke="#FF0000" stroke-width="15" stroke-linecap="round" stroke-dasharray="300 385" stroke-dashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="0.4" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>' }
        ];
        
        var overlayId = 'drxaos-loader-modal';
        var modalInitialized = false;
        var overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.parentNode.removeChild(overlay);
        }
        
        if (window.drxaosLoaderModalOpen) return;
        window.drxaosLoaderModalOpen = true;
        drxaosEnterFocusLock('loader-modal');

        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483646;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-family:var(--drxaos-font-family,inherit);';
        
        var modalHTML = '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.68);backdrop-filter:blur(8px);" data-close="true"></div>' +
            '<div style="position:relative;z-index:1;width:min(92vw,600px);max-height:90vh;overflow-y:auto;background:rgba(17,20,24,0.97);border-radius:18px;padding:22px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 18px 48px rgba(0,0,0,0.55);color:#f1f5f9;">' +
            '<div style="font-size:20px;font-weight:700;text-align:center;margin-bottom:20px;">Выберите Loader</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:16px;">';
        
        loaders.forEach(function(loader) {
            modalHTML += '<div class="selector" data-loader-id="' + loader.id + '" style="display:flex;flex-direction:column;align-items:center;padding:16px;border-radius:12px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,18,22,0.95);cursor:pointer;transition:all 0.2s ease;">' +
                '<div style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;">' + loader.svg + '</div>' +
                '<div style="font-size:14px;font-weight:600;text-align:center;">' + loader.name + '</div>' +
                '</div>';
        });
        
        modalHTML += '</div>' +
            '<div style="margin-top:20px;display:flex;gap:12px;justify-content:center;">' +
            '<button type="button" class="selector" data-action="default" style="min-height:46px;padding:0 24px;border-radius:12px;border:1px solid rgba(148,163,184,0.35);background:rgba(30,41,59,0.92);color:#f8fafc;font-size:15px;font-weight:600;cursor:pointer;">По умолчанию</button>' +
            '<button type="button" class="selector" data-action="cancel" style="min-height:46px;padding:0 24px;border-radius:12px;border:1px solid rgba(148,163,184,0.35);background:rgba(30,41,59,0.92);color:#f8fafc;font-size:15px;font-weight:600;cursor:pointer;">Отмена</button>' +
            '</div></div>';
        
        overlay.innerHTML = modalHTML;
        document.body.appendChild(overlay);
        modalInitialized = true;
        
        var previousFocus = document.activeElement;
        var focusables = Array.prototype.slice.call(overlay.querySelectorAll('[data-loader-id], [data-action]'));
        var currentFocusIndex = 0;

        function setLoaderFocus(index, options) {
            if (!focusables.length) return;
            if (index < 0) index = focusables.length - 1;
            if (index >= focusables.length) index = 0;
            currentFocusIndex = index;
            focusables.forEach(function(node) {
                node.classList.remove('focus');
                if (node.getAttribute && node.getAttribute('data-loader-id')) {
                    node.style.borderColor = 'rgba(148,163,184,0.3)';
                    node.style.background = 'rgba(15,18,22,0.95)';
                }
            });
            var node = focusables[currentFocusIndex];
            node.classList.add('focus');
            if (node.getAttribute && node.getAttribute('data-loader-id')) {
                node.style.borderColor = 'rgba(59,130,246,0.45)';
                node.style.background = 'rgba(51,65,85,0.95)';
            }
            if (!options || !options.skipDomFocus) {
                try {
                    node.focus({ preventScroll: true });
                } catch (focusError) {
                    try { node.focus(); } catch (ignoreFocus) {}
                }
            }
        }

        var suppressClicks = false;
        var usingDocumentKeyHandler = false;
        var loaderControllerName = 'drxaos_loader_modal';
        var controllerActive = false;
        var previousControllerName = null;

        function destroyLoaderModal() {
            if (usingDocumentKeyHandler) {
                document.removeEventListener('keydown', keyHandler, true);
                usingDocumentKeyHandler = false;
            }
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (controllerActive && window.Lampa && Lampa.Controller) {
                try {
                    Lampa.Controller.toggle(previousControllerName || 'settings');
                } catch (controllerErr) {
                }
                controllerActive = false;
            }
            if (previousFocus && typeof previousFocus.focus === 'function') {
                try {
                    previousFocus.focus();
                } catch (focusErr) {
                }
            }
            suppressClicks = false;
            window.drxaosLoaderModalOpen = false;
            drxaosLeaveFocusLock('loader-modal');
        }

        function triggerFocusedAction() {
            if (!focusables.length || suppressClicks) return;
            suppressClicks = true;
            var node = focusables[currentFocusIndex];
            if (node && typeof node.click === 'function') {
                node.click();
            } else {
                suppressClicks = false;
            }
        }

        function moveLoaderFocus(direction) {
            if (!focusables.length) return;
            var current = focusables[currentFocusIndex] || focusables[0];
            var currentRect = current.getBoundingClientRect();
            var currentX = currentRect.left + currentRect.width / 2;
            var currentY = currentRect.top + currentRect.height / 2;
            var threshold = 5;
            var bestElement = null;
            var bestScore = Infinity;
            focusables.forEach(function(node, idx) {
                if (node === current) return;
                var rect = node.getBoundingClientRect();
                var x = rect.left + rect.width / 2;
                var y = rect.top + rect.height / 2;
                var dx = x - currentX;
                var dy = y - currentY;
                var score = null;
                switch(direction) {
                    case 'left':
                        if (dx < -threshold) score = Math.abs(dy) * 1000 + Math.abs(dx);
                        break;
                    case 'right':
                        if (dx > threshold) score = Math.abs(dy) * 1000 + Math.abs(dx);
                        break;
                    case 'up':
                        if (dy < -threshold) score = Math.abs(dx) * 1000 + Math.abs(dy);
                        break;
                    case 'down':
                        if (dy > threshold) score = Math.abs(dx) * 1000 + Math.abs(dy);
                        break;
                }
                if (score !== null && score < bestScore) {
                    bestScore = score;
                    bestElement = idx;
                }
            });
            if (bestElement == null) {
                if (direction === 'left' || direction === 'up') {
                    bestElement = (currentFocusIndex - 1 + focusables.length) % focusables.length;
                } else {
                    bestElement = (currentFocusIndex + 1) % focusables.length;
                }
            }
            setLoaderFocus(bestElement);
        }

function keyHandler(evt) {
    var code = evt.key || '';
    var keyCode = typeof evt.keyCode === 'number' ? evt.keyCode : 0;
            if (code === 'ArrowRight' || code === 'Right' || keyCode === 39) {
                evt.preventDefault();
                evt.stopPropagation();
                moveLoaderFocus('right');
            } else if (code === 'ArrowLeft' || code === 'Left' || keyCode === 37) {
                evt.preventDefault();
                evt.stopPropagation();
                moveLoaderFocus('left');
            } else if (code === 'ArrowUp' || code === 'Up' || keyCode === 38) {
                evt.preventDefault();
                evt.stopPropagation();
                moveLoaderFocus('up');
            } else if (code === 'ArrowDown' || code === 'Down' || keyCode === 40) {
                evt.preventDefault();
                evt.stopPropagation();
                moveLoaderFocus('down');
            } else if (code === 'Enter' || code === 'OK' || keyCode === 13) {
                evt.preventDefault();
                evt.stopPropagation();
                triggerFocusedAction();
                return;
            } else if (code === 'Escape' || code === 'Back' || code === 'Cancel' || keyCode === 461 || keyCode === 27) {
                evt.preventDefault();
                evt.stopPropagation();
                destroyLoaderModal();
            }
        }

        focusables.forEach(function(node, index) {
            node.setAttribute('tabindex', '0');
            node.addEventListener('focus', function() {
                setLoaderFocus(index, { skipDomFocus: true });
            });
            node.addEventListener('mouseenter', function() {
                setLoaderFocus(index, { skipDomFocus: true });
            });
            node.addEventListener('mouseleave', function() {
                if (focusables[currentFocusIndex] === node) return;
                node.classList.remove('focus');
                if (node.getAttribute && node.getAttribute('data-loader-id')) {
                    node.style.borderColor = 'rgba(148,163,184,0.3)';
                    node.style.background = 'rgba(15,18,22,0.95)';
                }
            });
        });
        if (focusables.length) {
            setLoaderFocus(0);
        }

        if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.add === 'function') {
            try {
                var enabledState = Lampa.Controller.enabled && Lampa.Controller.enabled();
                previousControllerName = enabledState && enabledState.name ? enabledState.name : null;
                Lampa.Controller.add(loaderControllerName, {
                    toggle: function() {},
                    back: function() { destroyLoaderModal(); },
                    up: function() { moveLoaderFocus('up'); },
                    down: function() { moveLoaderFocus('down'); },
                    left: function() { moveLoaderFocus('left'); },
                    right: function() { moveLoaderFocus('right'); },
                    enter: function() { triggerFocusedAction(); }
                });
                Lampa.Controller.toggle(loaderControllerName);
                controllerActive = true;
            } catch (controllerError) {
                
            }
        }

        if (!controllerActive) {
            document.addEventListener('keydown', keyHandler, true);
            usingDocumentKeyHandler = true;
        }

        var loaderItems = overlay.querySelectorAll('[data-loader-id]');
        loaderItems.forEach(function(item) {
            item.addEventListener('click', function() {
                var loaderId = item.getAttribute('data-loader-id');
                if (callback) callback(loaderId);
                destroyLoaderModal();
                suppressClicks = false;
            });
        });
        
        var defaultBtn = overlay.querySelector('[data-action="default"]');
        if (defaultBtn) {
            defaultBtn.addEventListener('click', function() {
                if (callback) callback('default');
                destroyLoaderModal();
                suppressClicks = false;
            });
        }
        
        var cancelBtn = overlay.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                destroyLoaderModal();
                suppressClicks = false;
            });
        }
        
        var backdrop = overlay.querySelector('[data-close="true"]');
        if (backdrop) {
            backdrop.addEventListener('click', function() {
                destroyLoaderModal();
                suppressClicks = false;
            });
        }
    } catch (err) {
        
        window.drxaosLoaderModalOpen = false;
        drxaosLeaveFocusLock('loader-modal');
    }
    if (!modalInitialized) {
        window.drxaosLoaderModalOpen = false;
        drxaosLeaveFocusLock('loader-modal');
    }
}

function applyButtonIcons(scope) {
    try {
        if (!window.jQuery || !window.$) return;
        var $root = scope ? $(scope) : $(document.body || document);
        $root.find('.full-start__button.drxaos-btn .full-start__button-icon, .full-start__button.drxaos-btn .button__icon').remove();
        $root.find('.full-start__button.view--online, .full-start__button.view--streamv1, .lampac--button, .full-start__button.drxaos-btn--online').each(function() {
            var $btn = $(this);
            var svg = $btn.find('svg[data-drxaos-icon]').first();
            if (!svg.length) svg = $btn.find('svg').first();
            if (svg.length && svg.attr('data-drxaos-icon') === 'online') return;
            if (svg.length) { svg.replaceWith(BUTTON_ICON_SVGS.online); }            else { $btn.prepend(BUTTON_ICON_SVGS.online); }
        });
        $root.find('.full-start__button[class*="torrent"], .full-start__button.view--torrent, .full-start__button.drxaos-btn--torrent').each(function() {
            var $btn = $(this);
            var svg = $btn.find('svg[data-drxaos-icon]').first();
            if (!svg.length) svg = $btn.find('svg').first();
            if (svg.length && svg.attr('data-drxaos-icon') === 'torrent') return;
            if (svg.length) { svg.replaceWith(BUTTON_ICON_SVGS.torrent); }            else { $btn.prepend(BUTTON_ICON_SVGS.torrent); }
        });
        $root.find('.full-start__button[class*="play"], .full-start__button.button--play, .full-start__button.open--menu, .full-start__button.drxaos-btn--play').each(function() {
            var $btn = $(this);
            var svg = $btn.find('svg[data-drxaos-icon]').first();
            if (!svg.length) svg = $btn.find('svg').first();
            if (svg.length && svg.attr('data-drxaos-icon') === 'play') return;
            if (svg.length) { svg.replaceWith(BUTTON_ICON_SVGS.play); }            else { $btn.prepend(BUTTON_ICON_SVGS.play); }
        });
        $root.find('.full-start__button[class*="trailer"], .full-start__button.view--trailer, .full-start__button.drxaos-btn--trailer').each(function() {
            var $btn = $(this);
            var svg = $btn.find('svg[data-drxaos-icon]').first();
            if (!svg.length) svg = $btn.find('svg').first();
            if (svg.length && svg.attr('data-drxaos-icon') === 'trailer') return;
            if (svg.length) { svg.replaceWith(BUTTON_ICON_SVGS.trailer); }            else { $btn.prepend(BUTTON_ICON_SVGS.trailer); }
        });
        $root.find('.full-start__button[class*="book"], .full-start__button.button--book, .full-start__button.drxaos-btn--book').each(function() {
            var $btn = $(this);
            var svg = $btn.find('svg[data-drxaos-icon]').first();
            if (!svg.length) svg = $btn.find('svg').first();
            if (svg.length && svg.attr('data-drxaos-icon') === 'book') return;
            if (svg.length) { svg.replaceWith(BUTTON_ICON_SVGS.book); }            else { $btn.prepend(BUTTON_ICON_SVGS.book); }
        });
        $root.find('.full-start__button[class*="reaction"], .full-start__button.button--reaction, .full-start__button.drxaos-btn--reaction').each(function() {
            var $btn = $(this);
            var svg = $btn.find('svg[data-drxaos-icon]').first();
            if (!svg.length) svg = $btn.find('svg').first();
            if (svg.length && svg.attr('data-drxaos-icon') === 'reaction') return;
            if (svg.length) { svg.replaceWith(BUTTON_ICON_SVGS.reaction); }            else { $btn.prepend(BUTTON_ICON_SVGS.reaction); }
        });
        $root.find('.full-start__button[class*="subscribe"], .full-start__button.button--subscribe, .full-start__button.drxaos-btn--subscribe').each(function() {
            var $btn = $(this);
            var svg = $btn.find('svg[data-drxaos-icon]').first();
            if (!svg.length) svg = $btn.find('svg').first();
            if (svg.length && svg.attr('data-drxaos-icon') === 'subscribe') return;
            if (svg.length) { svg.replaceWith(BUTTON_ICON_SVGS.subscribe); }            else { $btn.prepend(BUTTON_ICON_SVGS.subscribe); }
        });
        $root.find('.full-start__button[class*="options"], .full-start__button.button--options, .full-start__button.drxaos-btn--options').each(function() {
            var $btn = $(this);
            var svg = $btn.find('svg[data-drxaos-icon]').first();
            if (!svg.length) svg = $btn.find('svg').first();
            if (svg.length && svg.attr('data-drxaos-icon') === 'options') return;
            if (svg.length) { svg.replaceWith(BUTTON_ICON_SVGS.options); }            else { $btn.prepend(BUTTON_ICON_SVGS.options); }
        });
    } catch(e) {
        
    }
}
function pinSettingsComponentTop() {
    try {
        if (!window.jQuery || !window.$) return;
        if (!Lampa || !Lampa.Settings || !Lampa.Settings.listener) return;
        function ensureTop(body) {
            try {
                var $root = body ? $(body) : $('.settings .settings__body > div').first();
                if (!$root.length) return;
                var $folder = $root.children('.settings-folder[data-component="drxaos_themes"]').first();
                if (!$folder.length) $folder = $root.find('.settings-folder[data-component="drxaos_themes"]').first();
                if (!$folder.length) return;
                var $parent = $folder.parent();
                if (!$parent.length) return;
                if ($parent.children().first()[0] !== $folder[0]) {
                    $folder.prependTo($parent);
                }
            } catch(err) {
                
            }
        }
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name === 'main') {
                setTimeout(function() { ensureTop(e.body); }, 0);
                setTimeout(function() { ensureTop(e.body); }, 200);
            }
        });
        ensureTop();
    } catch(e) {
        
    }
}
function applyActionButtonStyles() {
    try {
        styleManager.setStyle('drxaos-action-buttons', `
            :root {
                --drxaos-chip-min-height: clamp(22px, 2.5vw, 28px);
                --drxaos-chip-radius: clamp(8px, 1.5vw, 10px);
                --drxaos-chip-gap: clamp(0.15rem, 0.15vw, 0.15rem);
                --drxaos-btn-size: clamp(46px, 11vw, 56px);
            }
            
            /* --- ROW & SCROLL CLEANUP - REMOVE DARK BACKGROUNDS --- */
            .items-line, .items-line__body, .items-line__title,
            .scroll, .scroll__content, .scroll__body {
                background: transparent !important;
                box-shadow: none !important;
            }
            .scroll::before, .scroll::after,
            .items-line__body::before, .items-line__body::after,
            .items-line::before, .items-line::after {
                content: none !important;
                display: none !important;
                background: none !important;
            }
            
            /* HERO CLEANUP */
            body.drxaos-xuyampishe-active .drxaos-xu-container img.full-start__background {
                mask-image: none !important;
                -webkit-mask-image: none !important;
                filter: none !important;
            }
            /* UNWRAPPED LAYOUT */
            /* MOVED TO GLOBAL CSS */
            /*
            .full-start-new__buttons.drxaos-buttons-unwrapped,
            .full-start__buttons.drxaos-buttons-unwrapped {
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                justify-content: flex-start !important;
                gap: var(--drxaos-chip-gap) !important;
                width: -moz-fit-content !important;
                width: fit-content !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: clamp(0.15rem, 0.6vw, 0.4rem) 0 !important;
                background: none !important;
                border: none !important;
                box-shadow: none !important;
                flex: 0 0 auto !important;
                align-self: flex-start !important;
            }
            .full-start-new__buttons::-webkit-scrollbar,
            .full-start__buttons::-webkit-scrollbar {
                display: none;
            }
            */
            
            /* --- BUTTONS: TRANSPARENT BASE --- */
            .full-start__button.drxaos-btn,
            .full-start__button.drxaos-external {
                position: relative;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 0 !important;
                flex: 0 0 auto !important;
                width: var(--drxaos-btn-size) !important;
                min-width: var(--drxaos-btn-size) !important;
                height: var(--drxaos-btn-size) !important;
                min-height: var(--drxaos-btn-size) !important;
                padding: 0 !important;
                border-radius: 50% !important;
                
                background: transparent !important;
                background-image: none !important;
                border: 1px solid transparent !important;
                box-shadow: none !important;
                
                color: var(--text-main, #f8fafc) !important;
                font-family: var(--drxaos-font-family) !important;
                font-size: 0 !important;
                overflow: hidden !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                backface-visibility: hidden;
                pointer-events: auto !important;
            }
            
            /* --- BUTTONS: HOVER (THEME COLOR) --- */
            .full-start__button.drxaos-btn:hover,
            .full-start__button.drxaos-btn:focus,
            .full-start__button.drxaos-btn.focus,
            .full-start__button.drxaos-btn.drxaos-expanded,
            .full-start__button.drxaos-external:hover,
            .full-start__button.drxaos-external:focus,
            .full-start__button.drxaos-external.focus {
                background: var(--theme-primary, #2955b3) !important;
                background-color: var(--theme-primary, #2955b3) !important;
                box-shadow: 0 0 20px rgba(var(--primary-rgb, 41, 85, 179), 0.6) !important;
                transform: none !important; /* FIXED: Disable scale */
                color: #ffffff !important;
                border-color: transparent !important;
                z-index: 100 !important;
                filter: brightness(1.1) !important;
            }

            /* ICONS */
            .full-start__button.drxaos-btn svg,
            .full-start__button.drxaos-external svg {
                flex: 0 0 auto;
                width: clamp(22px, 5vw, 28px) !important;
                height: clamp(22px, 5vw, 28px) !important;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            }
            
            /* HIDE TEXT */
            .full-start__button.drxaos-btn span,
            .full-start__button.drxaos-external span,
            .full-start__button.drxaos-btn--external span {
                display: none !important;
            }

            /* CLEAR OLD COLORS */
            .full-start__button.drxaos-btn--play,
            .full-start__button.drxaos-btn--online,
            .full-start__button.drxaos-btn--torrent,
            .full-start__button.drxaos-btn--trailer,
            .full-start__button.drxaos-btn--book,
            .full-start__button.drxaos-btn--reaction,
            .full-start__button.drxaos-btn--subscribe,
            .full-start__button.drxaos-external.button--comment {
                background: transparent !important;
                border-color: transparent !important;
                box-shadow: none !important;
            }

            .full-start__button.drxaos-btn--options {
                flex: 0 0 auto !important;
            }

            /* --- PRESERVED LOGO/TITLE STYLES --- */
            .drxaos-title-logo {
                max-height: 125px !important;
                object-fit: contain !important;
                filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.65)) brightness(1.12) contrast(1.25) saturate(1.08) !important;
                mix-blend-mode: normal !important;
                transition: opacity 0.18s ease-out, transform 0.18s ease-out !important;
            }
            .drxaos-original-title-block {
                margin-top: 0.2em !important;
                text-align: left !important;
                font-size: clamp(1rem, 1.2vw, 1.15rem) !important;
                line-height: 1.4 !important;
                width: 100% !important;
                background: transparent !important;
            }
            .drxaos-original-title-block div,
            .drxaos-original-title-block .drxaos-xu-info__tag,
            .drxaos-original-title-block .drxaos-hero-tag {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                border-radius: 0 !important;
                color: inherit !important;
                height: auto !important;
                display: inline-block !important;
                margin: 0 !important;
                margin-right: 0.5em !important; /* FIXED: Added spacing between original titles */
            }
            .drxaos-original-title-block .drxaos-xu-info__tag:last-child,
            .drxaos-original-title-block .drxaos-hero-tag:last-child {
                margin-right: 0 !important;
            }
            body.drxaos-xuyampishe-active .drxaos-original-title-block.hero {
                display: block !important;
                width: 100% !important;
                flex-wrap: wrap !important;
                align-items: flex-start !important;
                gap: 0.6em !important;
                margin-top: clamp(6px, 1.6vh, 14px) !important;
                font-size: clamp(1rem, 1.2vw, 1.15rem) !important;
                color: #fff !important;
                padding: 0 !important;
                border-radius: 0 !important;
                background: transparent !important;
                backdrop-filter: none !important;
                border: none !important;
                font-weight: 600 !important;
                letter-spacing: 0.01em !important;
            }
            body.drxaos-xuyampishe-active .drxaos-original-title-block.hero.drxaos-original-title-block--empty {
                display: none !important;
            }
            .full-start-new__tagline.full--tagline {
                display: none !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .full-start__button.drxaos-external.button--comment {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: var(--drxaos-btn-size) !important;
                min-width: var(--drxaos-btn-size) !important;
                height: var(--drxaos-btn-size) !important;
                min-height: var(--drxaos-btn-size) !important;
                border-radius: 50% !important;
                padding: 0 !important;
                gap: 0 !important;
                background: transparent !important;
                border: 1px solid transparent !important;
                box-shadow: none !important;
                color: var(--text-main, #f8fafc) !important;
                font-size: 0 !important;
                overflow: hidden !important;
            }
            .full-start__button.drxaos-external.button--comment span {
                display: none !important;
            }
            .full-start__button.drxaos-external.button--comment svg {
                width: clamp(20px, 5vw, 26px) !important;
                height: clamp(20px, 5vw, 26px) !important;
            }
            /* LAYOUT REORDER */
            .full-start-new__right {
                display: flex !important;
                flex-direction: column !important;
            }
            /* 1. LOGO */
            .full-start-new__title { order: 1 !important; margin-bottom: 5px !important; }
            /* 2. HEAD (Year) */
            .full-start-new__head { 
                order: 2 !important; 
                margin-bottom: 5px !important; 
                font-size: clamp(1rem, 1.2vw, 1.15rem) !important;
                background: transparent !important; /* FIXED: No background for text */
                border: none !important;
                box-shadow: none !important;
                transform: none !important; /* FIXED: No scale */
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: clamp(0.4rem, 1vw, 0.7rem) !important;
                column-gap: clamp(0.6rem, 1.2vw, 1rem) !important;
            }
            .full-start__head {
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: clamp(0.4rem, 1vw, 0.7rem) !important;
                column-gap: clamp(0.6rem, 1.2vw, 1rem) !important;
            }
            /* 3. ORIGINAL TITLE */
            .drxaos-original-title-block, .drxaos-original-title-block.hero { order: 3 !important; margin-bottom: 8px !important; }
            .full-start-new__title + .drxaos-original-title-block { margin-top: 6px !important; }
            /* 4. INFO */
            .full-start-new__details, .full-start__details { order: 4 !important; margin-bottom: 8px !important; }
            /* 5. RATINGS */
            .full-start-new__rate-line { order: 5 !important; margin-bottom: 8px !important; }
            /* 6. REACTIONS */
            .full-start-new__reactions { order: 6 !important; margin-bottom: 8px !important; }
            /* 7+ */
            .full-start-new__tagline { 
                order: 7 !important; 
                font-size: clamp(1rem, 1.2vw, 1.15rem) !important;
            }
            .full-start-new__description { order: 8 !important; }
            .full-start-new__buttons { order: 9 !important; }

            .full-start__button.drxaos-btn--online { order: 10 !important; }
            .full-start__button.drxaos-btn--torrent { order: 20 !important; }
            .full-start__button.drxaos-btn--trailer { order: 30 !important; }
            .full-start__button.drxaos-btn--play { order: 40 !important; }
            .full-start__button.drxaos-btn--book { order: 50 !important; }
            .full-start__button.drxaos-btn--reaction { order: 60 !important; }
            .full-start__button.drxaos-btn--subscribe { order: 70 !important; }
            .full-start__button.drxaos-btn--options { order: 90 !important; }
        `);
    } catch (e) {
        
    }
}
function hideDetailedSectionTitles(root) {
    try {
        var scope = root || document;
        if (!scope) return;
        var titles = scope.querySelectorAll ? scope.querySelectorAll('.items-line__title') : [];
        titles.forEach(function(title) {
            if (!title || title.dataset && title.dataset.drxaosHideApplied) return;
            var text = (title.textContent || '').trim().toLowerCase();
            if (text === 'подробно') {
                title.style.setProperty('display', 'none', 'important');
                title.dataset.drxaosHideApplied = '1';
            }
        });
    } catch(e) {
        
    }
}
(function initHideDetailedTitles(){
    try {
        hideDetailedSectionTitles();
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (!node || node.nodeType !== 1) return;
                        if (node.classList && node.classList.contains('items-line__title')) {
                            hideDetailedSectionTitles(node.parentNode || node);
                        } else if (node.querySelector && node.querySelector('.items-line__title')) {
                            hideDetailedSectionTitles(node);
                        }
                    });
                }
            });
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch(e) {
        
    }
})();
function hideBlackFridayButton(root) {
    try {
        var scope = root || document;
        if (!scope) return;
        var buttons = scope.querySelectorAll ? scope.querySelectorAll('.head__action.head__settings.black-friday__button, .black-friday__button') : [];
        buttons.forEach(function(btn) {
            if (!btn || btn.dataset && btn.dataset.drxaosHideBlackFriday) return;
            btn.style.setProperty('display', 'none', 'important');
            btn.style.setProperty('visibility', 'hidden', 'important');
            btn.style.setProperty('opacity', '0', 'important');
            btn.dataset.drxaosHideBlackFriday = '1';
        });
    } catch(e) {
        
    }
}
(function initHideBlackFriday(){
    try {
        hideBlackFridayButton();
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (!node || node.nodeType !== 1) return;
                        if (node.classList && node.classList.contains('black-friday__button')) {
                            hideBlackFridayButton(node.parentNode || node);
                        } else if (node.querySelector && node.querySelector('.black-friday__button')) {
                            hideBlackFridayButton(node);
                        }
                    });
                }
            });
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch(e) {
        
    }
})();

function attachDrxaosButtonExpansion(btn) {
    if (!btn || btn.dataset.drxaosExpandBound === '1') return;
    var collapseTimer = null;
    function expand() {
        clearTimeout(collapseTimer);
        btn.classList.add('drxaos-expanded');
    }
    function scheduleCollapse(delay) {
        clearTimeout(collapseTimer);
        collapseTimer = setTimeout(function() {
            btn.classList.remove('drxaos-expanded');
        }, delay || 140);
    }
    btn.addEventListener('pointerenter', expand);
    btn.addEventListener('pointerleave', function() { scheduleCollapse(140); });
    btn.addEventListener('mouseenter', expand);
    btn.addEventListener('mouseleave', function() { scheduleCollapse(140); });
    btn.addEventListener('touchstart', function() { expand(); });
    btn.addEventListener('touchend', function() { scheduleCollapse(200); }, { passive: true });
    btn.addEventListener('touchcancel', function() { scheduleCollapse(200); }, { passive: true });
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                if (btn.classList.contains('focus') || btn.classList.contains('hover') || btn.matches(':hover')) { expand(); } else { scheduleCollapse(120); }
            }
        });
    });
    try {
        observer.observe(btn, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
    btn.dataset.drxaosExpandBound = '1';
    btn._drxaosExpandObserver = observer;
    if (btn.classList.contains('focus') || btn.matches(':hover')) {
        expand();
    }
}

function syncActionButtons(context) {
    try {
        performanceMonitor.start('syncActionButtons');
        context = context || document.body;

        var root = context;
        if (window.jQuery && root instanceof window.jQuery) {
            root = root[0];
        } else if (Array.isArray(root)) {
            root = root.find(function(node) {
                return node && typeof node.querySelector === 'function';
            });
        }
        if (root && root.render && typeof root.render === 'function') {
            try {
                var rendered = root.render();
                if (rendered && typeof rendered.querySelector === 'function') {
                    root = rendered;
                }
            } catch (renderErr) {}
        }
        if (!root || typeof root.querySelector !== 'function') {
            root = document.body || document;
        }

        // --- FIX DUPLICATED PG/STATUS ---
        if (root && root.querySelectorAll) {
            ['.full-start__pg', '.full-start__status'].forEach(function(selector) {
                var elements = Array.from(root.querySelectorAll(selector));
                if (elements.length > 1) {
                    var bestCandidate = null;
                    // Iterate backwards to find the most recent valid one
                    for (var i = elements.length - 1; i >= 0; i--) {
                        var el = elements[i];
                        var hasContent = el.textContent && el.textContent.trim().length > 0;
                        var isVisible = el.style.display !== 'none' && !el.classList.contains('hide');
                        
                        if (!bestCandidate && hasContent && isVisible) {
                            bestCandidate = el;
                        } else if (bestCandidate) {
                            el.remove(); // Remove others
                        }
                    }
                    // If we found duplicates but no "good" candidate, keep the last one
                    if (!bestCandidate && elements.length > 0) {
                        for (var j = 0; j < elements.length - 1; j++) {
                            elements[j].remove();
                        }
                    }
                }
            });
        }
        // -------------------------------

        var container = root && root.querySelector ? root.querySelector('.full-start__buttons, .full-start-new__buttons') : null;
        if (!container && document && document.querySelector) {
            container = document.querySelector('.full-start__buttons, .full-start-new__buttons');
        }
        if (!container) return;

        if (root && root.querySelectorAll) {
            var secondaryContainers = Array.from(root.querySelectorAll('.buttons--container'));
            secondaryContainers.forEach(function(extraContainer) {
                var extraButtons = Array.from(extraContainer.querySelectorAll('.full-start__button'));
                extraButtons.forEach(function(extraBtn) {
                    if (extraBtn && extraBtn.parentNode !== container) {
                        container.appendChild(extraBtn);
                    }
                });
            });
        }

        var buttons = Array.from(container.querySelectorAll('.full-start__button'));
        if (!buttons.length) return;

        // Preserve focus
        var activeElement = document.activeElement;
        var focusedBtnIndex = -1;
        if (activeElement && container.contains(activeElement)) {
            buttons.forEach(function(b, idx) {
                if (b === activeElement || b.contains(activeElement)) {
                    focusedBtnIndex = idx;
                }
            });
        }

        var buttonInfoList = buttons.map(function(btn, index) {
            var info = {
                btn: btn,
                key: btn.dataset.drxaosKey || '',
                span: btn.querySelector('span'),
                hasLegacyIcon: !!btn.querySelector('.full-start__button-icon, .button__icon'),
                hasDrxaosIcon: !!btn.querySelector('svg[data-drxaos-icon]'),
                index: index
            };
            if (!info.key && info.span) {
                var text = info.span.textContent.toLowerCase();
                if (text.includes('онлайн')) { info.key = 'online'; }
                else if (text.includes('торрент')) { info.key = 'torrent'; }
                else if (text.includes('смотреть') || text.includes('play')) { info.key = 'watch'; }
                else if (text.includes('трейлер') || text.includes('youtube')) { info.key = 'trailer'; }
                else if (text.includes('избранное') || text.includes('вибране')) { info.key = 'book'; }
                else if (text.includes('реакци')) { info.key = 'reaction'; }
                else if (text.includes('подписк')) { info.key = 'subscribe'; }
            }
            if (!info.key) {
                if (btn.classList.contains('button--play') || btn.classList.contains('open--menu')) { info.key = 'watch'; }
                else if (btn.classList.contains('button--subscribe')) { info.key = 'subscribe'; }
                else if (btn.classList.contains('button--book')) { info.key = 'book'; }
                else if (btn.classList.contains('button--reaction')) { info.key = 'reaction'; }
                else if (btn.classList.contains('button--options')) { info.key = 'more'; }
                else if (btn.classList.contains('view--online') || btn.classList.contains('view--streamv1')) { info.key = 'online'; }
                else if (btn.classList.contains('view--torrent')) { info.key = 'torrent'; }
                else if (btn.classList.contains('view--trailer')) { info.key = 'trailer'; }
            }
            info.hasLabel = !!(info.span && info.span.textContent.trim());
            info.needsRepair = !btn.innerHTML.trim();
            if (info.key) {
                if (info.hasLegacyIcon || !info.hasDrxaosIcon || !info.hasLabel) {
                    info.needsRepair = true;
                }
            }
            return info;
        });

        var alreadyProcessed = container.dataset.drxaosProcessed === 'true';
        var needsRepair = buttonInfoList.some(function(info) { return info.needsRepair; });
        var hasUnmanaged = buttonInfoList.some(function(info) {
            var btn = info.btn;
            if (!btn) return false;
            return !btn.dataset.drxaosManaged;
        });
        
        // Проверяем наличие кнопки "Торренты" - она может появиться позже
        var hasTorrentButton = buttonInfoList.some(function(info) {
            return info.key === 'torrent' || 
                   (info.btn && (info.btn.classList.contains('view--torrent') || 
                                 info.btn.classList.contains('drxaos-btn--torrent')));
        });
        var torrentButtonInDOM = container.querySelector('.full-start__button.view--torrent, .full-start__button.drxaos-btn--torrent');
        var missingTorrentButton = torrentButtonInDOM && !hasTorrentButton;

        // Если контейнер уже обработан, но есть проблемы или отсутствует кнопка "Торренты", продолжаем обработку
        if (alreadyProcessed && !needsRepair && !hasUnmanaged && !missingTorrentButton) return;

        container.dataset.drxaosProcessed = 'true';

        var orderMap = {
            online: 10,
            torrent: 20,
            trailer: 30,
            watch: 40,
            book: 50,
            reaction: 60,
            subscribe: 70,
            more: 90
        };

        var buttonMap = {
            online: { icon: 'online', text: Lampa.Lang.translate('drxaos_btn_online'), className: 'drxaos-btn--online' },
            torrent: { icon: 'torrent', text: Lampa.Lang.translate('drxaos_btn_torrent'), className: 'drxaos-btn--torrent' },
            watch: { icon: 'play', text: Lampa.Lang.translate('drxaos_btn_play'), className: 'drxaos-btn--play' },
            trailer: { icon: 'trailer', text: Lampa.Lang.translate('drxaos_btn_trailer'), className: 'drxaos-btn--trailer' },
            book: { icon: 'book', text: Lampa.Lang.translate('drxaos_btn_book'), className: 'drxaos-btn--book' },
            reaction: { icon: 'reaction', text: Lampa.Lang.translate('drxaos_btn_reaction'), className: 'drxaos-btn--reaction' },
            subscribe: { icon: 'subscribe', text: Lampa.Lang.translate('drxaos_btn_subscribe'), className: 'drxaos-btn--subscribe' },
            more: { icon: 'options', text: Lampa.Lang.translate('drxaos_btn_options'), className: 'drxaos-btn--options' }
        };

        var singleInstanceKeys = { online: true, torrent: true, trailer: true };
        var seenKeys = {};
        var recognizedButtons = [];
        var externalButtons = [];

        buttonInfoList.forEach(function(info) {
            var btn = info.btn;
            var key = info.key;
            if (!key) {
                key = '';
                info.key = key;
            }
            if (key === 'watch') {
                if (btn) {
                    btn.dataset.drxaosManaged = 'removed';
                    btn.classList.remove('focus'); // REMOVE LAMPA FOCUS
                    if (document.activeElement === btn) btn.blur(); // REMOVE NATIVE FOCUS
                }
                // FIXED: Always hide 'watch' button to prevent double focus,
                // even if it has focus (focus will be restored to container/body if lost)
                btn.style.display = 'none !important';
                btn.style.setProperty('display', 'none', 'important');
                btn.classList.add('hide');
                return;
            }
            if (!buttonMap[key]) {
                markExternalButton(btn);
                externalButtons.push(info);
                return;
            }
            if (singleInstanceKeys[key]) {
                if (seenKeys[key]) {
                    if (btn) {
                        btn.dataset.drxaosManaged = 'removed';
                        btn.classList.remove('focus');
                        if (document.activeElement === btn) btn.blur();
                    }
                    // FIXED: Always remove duplicate to prevent double focus
                    if (btn && btn.parentNode) {
                        btn.parentNode.removeChild(btn);
                    }
                    return;
                }
                seenKeys[key] = true;
            }
            recognizedButtons.push(info);
            btn.classList.add('drxaos-btn');
            btn.classList.add(buttonMap[key].className);
            btn.dataset.drxaosKey = key;
            btn.dataset.drxaosManaged = '1';
            if (orderMap.hasOwnProperty(key)) {
                btn.style.order = String(orderMap[key]);
            }

            btn.classList.remove('hide');
            btn.classList.remove('hide--left');
            btn.classList.remove('hide--drxaos');
            btn.style.display = '';
            if (!btn.classList.contains('drxaos-btn--options')) {
                btn.classList.remove('is--hidden');
            }

            if (!info.needsRepair) {
                return;
            }

            Array.from(btn.querySelectorAll('.full-start__button-icon, .button__icon')).forEach(function(el) {
                el.remove();
            });

            var labelText = buttonMap[key].text || (info.span ? info.span.textContent.trim() : '');
            var iconName = buttonMap[key].icon;
            var iconMarkup = BUTTON_ICON_SVGS[iconName] || BUTTON_ICON_SVGS[key] || '';
            if (!labelText || labelText.indexOf('drxaos_btn_') === 0) {
                labelText = info.span ? info.span.textContent.trim() : '';
            }

            if (iconMarkup || labelText) {
                btn.innerHTML = '';
                if (iconMarkup) {
                    btn.insertAdjacentHTML('beforeend', iconMarkup);
                }
                var label = document.createElement('span');
                label.textContent = labelText;
                btn.appendChild(label);
            }
        });
        
        // Дополнительная проверка: обрабатываем кнопку "Торренты", если она есть в DOM, но не была обработана
        var unprocessedTorrentBtn = container.querySelector('.full-start__button.view--torrent:not([data-drxaos-managed]), .full-start__button.drxaos-btn--torrent:not([data-drxaos-managed])');
        if (unprocessedTorrentBtn && !seenKeys['torrent']) {
            var torrentInfo = {
                btn: unprocessedTorrentBtn,
                key: 'torrent',
                span: unprocessedTorrentBtn.querySelector('span'),
                hasLegacyIcon: !!unprocessedTorrentBtn.querySelector('.full-start__button-icon, .button__icon'),
                hasDrxaosIcon: !!unprocessedTorrentBtn.querySelector('svg[data-drxaos-icon]'),
                needsRepair: true
            };
            var btn = torrentInfo.btn;
            var key = 'torrent';
            seenKeys[key] = true;
            recognizedButtons.push(torrentInfo);
            btn.classList.add('drxaos-btn');
            btn.classList.add(buttonMap[key].className);
            btn.dataset.drxaosKey = key;
            btn.dataset.drxaosManaged = '1';
            btn.style.order = String(orderMap[key]);
            btn.classList.remove('hide');
            btn.classList.remove('hide--left');
            btn.classList.remove('hide--drxaos');
            btn.style.display = '';
            btn.classList.remove('is--hidden');
            
            Array.from(btn.querySelectorAll('.full-start__button-icon, .button__icon')).forEach(function(el) {
                el.remove();
            });
            
            var labelText = buttonMap[key].text || (torrentInfo.span ? torrentInfo.span.textContent.trim() : '');
            var iconName = buttonMap[key].icon;
            var iconMarkup = BUTTON_ICON_SVGS[iconName] || BUTTON_ICON_SVGS[key] || '';
            if (!labelText || labelText.indexOf('drxaos_btn_') === 0) {
                labelText = torrentInfo.span ? torrentInfo.span.textContent.trim() : '';
            }
            
            btn.innerHTML = '';
            if (iconMarkup) {
                btn.insertAdjacentHTML('beforeend', iconMarkup);
            }
            var label = document.createElement('span');
            label.textContent = labelText;
            btn.appendChild(label);
        }
        
        // КРИТИЧНО: стили только ОДИН раз
        if (!document.getElementById('drxaos-action-buttons')) {
            applyActionButtonStyles();
        }
        
        var sortedRecognized = recognizedButtons.slice().sort(function(a, b) {
            var ao = a && a.key && orderMap.hasOwnProperty(a.key) ? orderMap[a.key] : 999;
            var bo = b && b.key && orderMap.hasOwnProperty(b.key) ? orderMap[b.key] : 999;
            if (ao === bo) {
                return (a && typeof a.index === 'number' ? a.index : 0) - (b && typeof b.index === 'number' ? b.index : 0);
            }
            return ao - bo;
        });
        // FIXED: Restore focus if we moved the focused element
        var previousActive = document.activeElement;
        
        var desiredOrder = [];
        sortedRecognized.forEach(function(info) {
            if (info && info.btn && info.btn.parentNode === container) {
                info.btn.style.display = '';
                desiredOrder.push(info.btn);
            }
        });
        externalButtons.forEach(function(info, idx) {
            var btn = info && info.btn;
            if (!btn || btn.parentNode !== container) return;
            btn.style.order = String(900 + idx);
            desiredOrder.push(btn);
        });
        var currentOrder = Array.from(container.querySelectorAll('.full-start__button'));
        var needsReorder = desiredOrder.length && desiredOrder.some(function(btn, idx) {
            return currentOrder[idx] !== btn;
        });
        if (needsReorder) {
            desiredOrder.forEach(function(btn, idx) {
                var refNode = container.children[idx];
                if (refNode === btn) return;
                container.insertBefore(btn, refNode || null);
            });
        }

        if (previousActive && container.contains(previousActive) && document.body.contains(previousActive) && getComputedStyle(previousActive).display !== 'none') {
            previousActive.focus();
        } else if (focusedBtnIndex !== -1) {
            // Only restore focus if we HAD focus inside the container
            // If focus was lost (e.g. we hid the 'watch' button), focus the first visible button
            var firstVisible = desiredOrder.find(function(b) { return b.style.display !== 'none'; });
            if (firstVisible) {
                firstVisible.focus();
            }
        }
        // Фокус внутри кнопок полностью отдаём системе

        container.classList.add('drxaos-buttons-unwrapped');
        var openMenuBtn = container.querySelector('.open--menu');
        if (openMenuBtn && openMenuBtn.dataset.drxaosKey !== 'more') {
            openMenuBtn.dataset.drxaosKey = 'more';
        }

        applyButtonIcons(container);
        
        // Финальная проверка: убеждаемся, что кнопка "Торренты" всегда видна
        var allTorrentButtons = container.querySelectorAll('.full-start__button.view--torrent, .full-start__button.drxaos-btn--torrent');
        allTorrentButtons.forEach(function(btn) {
            if (btn && btn.parentNode === container) {
                btn.classList.remove('hide');
                btn.classList.remove('hide--left');
                btn.classList.remove('hide--drxaos');
                btn.classList.remove('is--hidden');
                btn.style.display = '';
                if (!btn.dataset.drxaosKey) {
                    btn.dataset.drxaosKey = 'torrent';
                }
                if (!btn.dataset.drxaosManaged) {
                    btn.dataset.drxaosManaged = '1';
                }
                if (!btn.classList.contains('drxaos-btn')) {
                    btn.classList.add('drxaos-btn');
                }
                if (!btn.classList.contains('drxaos-btn--torrent')) {
                    btn.classList.add('drxaos-btn--torrent');
                }
                if (!btn.style.order || btn.style.order === '') {
                    btn.style.order = '20';
                }
            }
        });
        
        document.body.classList.add('drxaos-buttons-ready');
        performanceMonitor.end('syncActionButtons');
        
    } catch (e) {
        
    }
}

function markExternalButton(btn) {
    if (!btn) return;
    if (btn.dataset.drxaosManaged === 'external') return;
    btn.dataset.drxaosManaged = 'external';
    btn.classList.add('drxaos-external');
    btn.classList.remove('hide', 'hide--left', 'hide--drxaos');
    btn.classList.remove('is--hidden');
    btn.style.display = '';
    btn.style.removeProperty('opacity');
    btn.style.removeProperty('visibility');
    btn.style.setProperty('pointer-events', 'auto', 'important');
}
function drxaosShouldRenderSeasonBadges() {
    return CONFIG.FEATURES.TMDB_INTEGRATION && (
        drxaosIsBadgeEnabled('season') ||
        drxaosIsBadgeEnabled('type') ||
        drxaosIsBadgeEnabled('country') ||
        drxaosIsBadgeEnabled('year')
    );
}
function drxaosCleanupSeasonBadges() {
    var existingInfoStyle = document.getElementById("drxaos-season-info");
    if (existingInfoStyle) {
        existingInfoStyle.remove();
    }
    ['type', 'season', 'country', 'year'].forEach(function(key) {
        drxaosGetBadgeSelectors(key).forEach(function(selector) {
            var nodes = document.querySelectorAll(selector);
            nodes.forEach(function(node) { node.remove(); });
        });
    });
    window.drxaosSeasonHandler = null;
}
function applySeasonInfo() {
    if (!drxaosShouldRenderSeasonBadges()) {
        drxaosCleanupSeasonBadges();
        return;
    }
    var tmdbApiKey = Lampa.Storage.get('tmdb_api_key', '');
    if (!tmdbApiKey && window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.key === 'function') {
        tmdbApiKey = Lampa.TMDB.key();
    }
    if (!tmdbApiKey && typeof BUILTIN_TMDB_KEY === 'string') {
        tmdbApiKey = BUILTIN_TMDB_KEY;
    }
    if (!tmdbApiKey) {
        drxaosCleanupSeasonBadges();
        return;
    }
        var styleTag = document.createElement("style");
        styleTag.id = "drxaos-season-info";
        styleTag.textContent = `
            .card__marker--look {
                position: absolute !important;
                top: 50% !important;
				left: 50% !important;
				transform: translate(-50%, -50%) !important;
				bottom: auto !important;
				right: auto !important;
				font-family: var(--drxaos-font-family) !important;
				font-size: 16px !important;
				font-weight: 900 !important;
				padding: 8px 16px !important;
				border-radius: 16px !important;
				background: rgba(0, 0, 0, 0.95) !important;
				color: #ffffff !important;
				text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95) !important;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95) !important;
				z-index: 10 !important;
			}
            .card__type {
                display: none !important;
            }
        .card-more__box {
            background: var(--theme-primary, rgba(0, 0, 0, var(--drxaos-surface-opacity))) !important;
            border: 2px solid var(--theme-secondary, rgba(255, 255, 255, 0.95)) !important;
            border-radius: 16px !important;
            padding: 16px !important;
            transition: none !important;
        }
        .card-more__box:hover {
            background: var(--theme-secondary, rgba(255, 255, 255, 0.95)) !important;
            border-color: var(--theme-accent, #ffffff) !important;
            transform: none !important; /* FIXED: Disable scale */
        }
        .card-more__title {
            color: white !important;
            font-weight: 700 !important;
            font-size: 1.1em !important;
        }
.online-prestige {
    background: var(--drxaos-bg-color) !important;
    border: 2px solid var(--drxaos-accent-color) !important;
    border-radius: 12px !important;
    padding: 1em !important;
    transition: none !important;
}
.online-prestige.focus,
.online-prestige:hover {
    border-color: var(--drxaos-accent-color) !important;
    box-shadow: 0 0 20px var(--drxaos-accent-color) !important;
    transform: none !important; /* FIXED: Disable scale */
}
.online-prestige__img {
    border-radius: 8px !important;
    overflow: hidden !important;
}
.online-prestige__title,
.online-prestige__info,
.online-prestige__footer {
    color: var(--drxaos-text-color) !important;
    font-family: var(--drxaos-font-family) !important;
}
`;
        document.head.appendChild(styleTag);
        var tmdbPersistentCache = getTmdbCacheStore();
        function fetchSeriesData(tmdbId) {
            return new Promise(function(resolve, reject) {
                if (!tmdbId) {
                    resolve(null);
                    return;
                }
                var cacheKey = TMDB_CACHE_KEY_PREFIX.SEASON + tmdbId;
                var cached = tmdbPersistentCache.get(cacheKey);
                if (cached) {
                    resolve(cached);
                    return;
                }
                var url = (Lampa.TMDB && typeof Lampa.TMDB.api === 'function') ? Lampa.TMDB.api('tv/' + tmdbId + '?api_key=' + tmdbApiKey + '&language=ru') : 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + tmdbApiKey + '&language=ru';
                drxaosFetchWithTimeout(url, null, drxaosNetworkTimeout())
                    .then(function(response) {
                        if (!response.ok) {
                            throw new Error('HTTP error ' + response.status);
                        }
                        return response.json();
                    })
                    .then(function(data) {
                        if (!data || data.success === false) {
                            throw new Error(data && data.status_message ? data.status_message : 'TMDB empty response');
                        }
                        var payload = {
                            last_episode_to_air: data.last_episode_to_air ? {
                                season_number: data.last_episode_to_air.season_number,
                                episode_number: data.last_episode_to_air.episode_number || 0
                            } : null,
                            seasons: Array.isArray(data.seasons) ? data.seasons.map(function(season) {
                                return {
                                    season_number: season.season_number,
                                    episode_count: season.episode_count || 0
                                };
                            }) : []
                        };
                        tmdbPersistentCache.set(cacheKey, payload);
                        resolve(payload);
                    })
                    .catch(function(error) {
                        reject(error);
                    });
            });
        }
        function addSeasonBadge(cardEl) {
            if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;
        if (cardEl.classList && cardEl.classList.contains('bookmarks-folder')) {
            ['type','season','country','year'].forEach(function(key) {
                drxaosRemoveBadgeNodes(cardEl, drxaosGetBadgeSelectors(key, ['.card--content-type', '.card__type', '.card--season-progress', '.card--season-complete', '.card__seasons', '.card-seasons', '.card--country', '.card__country', '.card--year', '.card__year']));
            });
            var bottomRow = cardEl.querySelector('.drxaos-badge-bottom-row');
            if (bottomRow) bottomRow.remove();
            cardEl.setAttribute('data-season-processed', 'bookmarks-folder');
            return;
        }
        var data = cardEl.card_data || drxaosExtractCardPayload(cardEl) || drxaosLookupCardData(cardEl) || {};
        var supplementalData = drxaosLookupCardData(cardEl) || {};
        var extractedPayload = drxaosExtractCardPayload(cardEl) || null;
        var badgeTypeEnabled = drxaosIsBadgeEnabled('type');
        var badgeCountryEnabled = drxaosIsBadgeEnabled('country');
        var badgeSeasonEnabled = drxaosIsBadgeEnabled('season');
        var badgeYearEnabled = drxaosIsBadgeEnabled('year');
        if (!badgeTypeEnabled) {
            drxaosRemoveBadgeNodes(cardEl, drxaosGetBadgeSelectors('type', ['.card--content-type']));
        }
        if (!badgeCountryEnabled) {
            drxaosRemoveBadgeNodes(cardEl, drxaosGetBadgeSelectors('country', ['.card--country']));
        }
        if (!badgeSeasonEnabled) {
            drxaosRemoveBadgeNodes(cardEl, drxaosGetBadgeSelectors('season', ['.card--season-complete', '.card--season-progress']));
        }
        if (!badgeYearEnabled) {
            drxaosRemoveBadgeNodes(cardEl, drxaosGetBadgeSelectors('year', ['.card--year']));
        }
        if (!badgeTypeEnabled && !badgeCountryEnabled && !badgeSeasonEnabled && !badgeYearEnabled) {
            cardEl.setAttribute('data-season-processed', 'disabled');
            return;
        }
        try {
            var seasonSnapshot = {
                id: data.card_id || data.id || data.movie_id || data.tv_id || (data.ids && (data.ids.tmdb || data.ids.id)) || null,
                tmdb_id: data.tmdb_id || data.id || (data.ids && data.ids.tmdb) || null,
                title: data.title || data.name || '',
                original_title: data.original_title || data.original_name || '',
                type: data.name ? 'tv' : (data.type || data.media_type || 'movie'),
                release_date: data.release_date || data.first_air_date || data.year || '',
                payload: data
            };
            if (seasonSnapshot.id || seasonSnapshot.tmdb_id || seasonSnapshot.title) {
                try { drxaosGetCardDataStorage().set(cardEl, seasonSnapshot); } catch (err) {}
                drxaosRememberCardData(cardEl, seasonSnapshot);
            }
        } catch (indexErr) {
            
        }
            cardEl.removeAttribute('data-quality-processed');
            cardEl.removeAttribute('data-next-episode-processed');
        var view = cardEl.querySelector('.card__view') || cardEl;
        var badgeHost = ensureBadgeHost(cardEl) || view;
        var bottomBadgeRow = drxaosEnsureBottomBadgeRow(cardEl);
            var oldBadges = badgeHost.querySelectorAll('.card--content-type, .card__type, .card--season-complete, .card--season-progress, .card__seasons, .card-seasons, .card--country, .card__country, .card--year, .card__year');
            for (var i = 0; i < oldBadges.length; i++) {
                if (oldBadges[i].parentNode) {
                    oldBadges[i].parentNode.removeChild(oldBadges[i]);
                }
            }
            if (badgeTypeEnabled) {
                var contentTypeBadge = document.createElement('div');
                contentTypeBadge.className = 'card--content-type ' + (data.name ? 'tv' : 'movie');
                contentTypeBadge.textContent = data.name ? 'Сериал' : 'Фильм';
                contentTypeBadge.classList.add('drxaos-badge-base');
                drxaosAttachBadge(cardEl, contentTypeBadge);
                requestAnimationFrame(function() {
                    drxaosSafeRevealBadge(contentTypeBadge);
                });
            }
        if (badgeCountryEnabled) {
        var COUNTRY_CONTEXT_REGEX = /(country|nation|locale)/i;
        var COUNTRY_INVALID_VALUES = [
            'tmdb', 'lampac', 'lampa', 'jacred', 'bwa', 'hdvb', 'rezka',
            'online', 'none', 'null', 'undefined', 'unknown', 'movie',
            'serial', 'series', 'film', 'films', 'source', 'default'
        ];
        var COUNTRY_PRIMARY_FIELDS = [
            'iso_3166_1', 'iso', 'iso2', 'iso3',
            'alpha2', 'alpha3', 'country', 'country_code', 'countryCode',
            'country_name', 'countryName', 'short_name', 'shortName',
            'abbr', 'abbreviation', 'locale', 'localeCode', 'nation', 'nations',
            'production_countries', 'productionCountries',
            'origin_country', 'originCountry',
            'release_country', 'releaseCountry', 'release_countries', 'releaseCountries',
            'countries', 'country_list', 'productionCountry', 'meta_country', 'metaCountry'
        ];
        var COUNTRY_FALLBACK_FIELDS = ['name', 'title', 'label', 'value'];
        function hasCountryHint(obj) {
            if (!obj || typeof obj !== 'object') return false;
            for (var i = 0; i < COUNTRY_PRIMARY_FIELDS.length; i++) {
                if (obj[COUNTRY_PRIMARY_FIELDS[i]] != null) return true;
            }
            var keys = Object.keys(obj);
            for (var j = 0; j < keys.length; j++) {
                if (COUNTRY_CONTEXT_REGEX.test(keys[j])) return true;
            }
            return false;
        }
        function sanitizeCountryToken(token, hint) {
            if (token == null) return '';
            var cleaned = String(token).trim();
            if (!cleaned) return '';
            var lower = cleaned.toLowerCase();
            if (COUNTRY_INVALID_VALUES.indexOf(lower) !== -1) return '';
            if (/^(http|magnet|udp|rtmp|rtsp|https?):/i.test(cleaned)) return '';
            if (/^\d+$/.test(cleaned)) return '';
            if (cleaned.length <= 1) return '';
            if (/^[A-Za-z]{1,3}$/.test(cleaned) || /^[А-ЯЁ]{1,3}$/i.test(cleaned)) {
                return cleaned.toUpperCase();
            }
            if (cleaned.length <= 3) {
                return COUNTRY_CONTEXT_REGEX.test(String(hint || '')) ? cleaned : '';
            }
            return cleaned;
        }
        function normalizeCountryCandidate(value, hint) {
            if (value == null) return '';
            if (typeof value === 'number') {
                value = String(value);
            }
            if (typeof value === 'string') {
                var trimmed = value.trim();
                if (!trimmed) return '';
                var firstPart = trimmed.split(/[,|\/;]+/)[0].trim();
                if (!firstPart) return '';
                var sanitized = sanitizeCountryToken(firstPart, hint);
                return sanitized;
            }
            if (Array.isArray(value)) {
                for (var idx = 0; idx < value.length; idx++) {
                    var attempt = normalizeCountryCandidate(value[idx], hint);
                    if (attempt) return attempt;
                }
                return '';
            }
            if (typeof value === 'object') {
                var allowGenericNames = hint && COUNTRY_CONTEXT_REGEX.test(String(hint));
                var usedPrimary = false;
                for (var k = 0; k < COUNTRY_PRIMARY_FIELDS.length; k++) {
                    var key = COUNTRY_PRIMARY_FIELDS[k];
                    if (value[key] != null) {
                        usedPrimary = true;
                        var objAttempt = normalizeCountryCandidate(value[key], key);
                        if (objAttempt) return objAttempt;
                    }
                }
                var localeKeys = ['ru', 'uk', 'ua', 'en', 'default'];
                for (var lk = 0; lk < localeKeys.length; lk++) {
                    if (value[localeKeys[lk]]) {
                        var localeAttempt = normalizeCountryCandidate(value[localeKeys[lk]], localeKeys[lk]);
                        if (localeAttempt) return localeAttempt;
                    }
                }
                if ((usedPrimary || allowGenericNames || hasCountryHint(value))) {
                    if (allowGenericNames) {
                        for (var fk = 0; fk < COUNTRY_FALLBACK_FIELDS.length; fk++) {
                            var fallbackKey = COUNTRY_FALLBACK_FIELDS[fk];
                            if (value[fallbackKey]) {
                                var fallbackAttempt = normalizeCountryCandidate(value[fallbackKey], fallbackKey);
                                if (fallbackAttempt) return fallbackAttempt;
                            }
                        }
                    }
                }
            }
            return '';
        }
        function extractCountryCode(source, element, hint) {
            var direct = normalizeCountryCandidate(source, hint);
            if (direct) return direct;
            if (element) {
                var dataset = element.dataset || {};
                var datasetCandidates = [
                    { key: 'data-country', value: element.getAttribute('data-country') },
                    { key: 'dataset.country', value: dataset.country },
                    { key: 'dataset.originCountry', value: dataset.originCountry },
                    { key: 'dataset.productionCountry', value: dataset.productionCountry },
                    { key: 'dataset.productionCountries', value: dataset.productionCountries },
                    { key: 'dataset.releaseCountry', value: dataset.releaseCountry },
                    { key: 'dataset.releaseCountries', value: dataset.releaseCountries },
                    { key: 'dataset.countryCode', value: dataset.countryCode },
                    { key: 'dataset.countryName', value: dataset.countryName },
                    { key: 'dataset.countries', value: dataset.countries },
                    { key: 'dataset.cardCountry', value: dataset.cardCountry },
                    { key: 'dataset.cardCountries', value: dataset.cardCountries },
                    { key: 'dataset.metaCountry', value: dataset.metaCountry }
                ];
                for (var dc = 0; dc < datasetCandidates.length; dc++) {
                    var candidate = datasetCandidates[dc];
                    var dsAttempt = normalizeCountryCandidate(candidate.value, candidate.key);
                    if (dsAttempt) return dsAttempt;
                }
            }
            return '';
        }
        function resolveCountryFromOwner(owner, visited, hint) {
            if (!owner) return '';
            var localHint = typeof hint === 'string' ? hint : '';
            if (typeof owner === 'string' || typeof owner === 'number') {
                return normalizeCountryCandidate(owner, localHint);
            }
            if (!visited && typeof WeakSet === 'function') {
                visited = new WeakSet();
            }
            if (visited && typeof owner === 'object') {
                if (visited.has(owner)) {
                    return '';
                }
                visited.add(owner);
            }
            if (Array.isArray(owner)) {
                for (var arrIdx = 0; arrIdx < owner.length; arrIdx++) {
                    var arrResult = resolveCountryFromOwner(owner[arrIdx], visited, localHint);
                    if (arrResult) return arrResult;
                }
                return '';
            }
            if (typeof owner !== 'object') {
                return '';
            }
            if (hasCountryHint(owner) || COUNTRY_CONTEXT_REGEX.test(localHint)) {
                var direct = normalizeCountryCandidate(owner, localHint);
                if (direct) return direct;
            }
            var keysToCheck = [
                'origin_country', 'originCountry',
                'production_countries', 'productionCountries', 'production_country', 'productionCountry',
                'countries', 'country', 'country_list',
                'release_country', 'releaseCountry', 'release_countries', 'releaseCountries',
                'country_code', 'countryCode', 'country_name', 'countryName',
                'meta_country', 'metaCountry', 'nation', 'nations', 'locale'
            ];
            for (var i = 0; i < keysToCheck.length; i++) {
                if (owner[keysToCheck[i]]) {
                    var result = resolveCountryFromOwner(owner[keysToCheck[i]], visited, keysToCheck[i]);
                    if (result) return result;
                }
            }
            var nestedKeys = ['info', 'details', 'card', 'extra', 'meta', 'payload', 'data', 'content', 'about', 'source', 'full', 'movie', 'show', 'item', 'attrs', 'attributes'];
            for (var j = 0; j < nestedKeys.length; j++) {
                var nestedValue = owner[nestedKeys[j]];
                if (!nestedValue) continue;
                if (Array.isArray(nestedValue)) {
                    for (var n = 0; n < nestedValue.length; n++) {
                        var nestedResult = resolveCountryFromOwner(nestedValue[n], visited, nestedKeys[j]);
                        if (nestedResult) return nestedResult;
                    }
                } else {
                    var nestedSingle = resolveCountryFromOwner(nestedValue, visited, nestedKeys[j]);
                    if (nestedSingle) return nestedSingle;
                }
            }
            return '';
        }
        function renderCountryBadge(value) {
            var normalized = normalizeCountryCandidate(value, 'render');
            if (!normalized) return;
            var existing = badgeHost.querySelector('.card--country');
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
                var countryBadge = document.createElement('div');
                countryBadge.className = 'card--country';
            countryBadge.classList.add('drxaos-badge-base');
            countryBadge.textContent = normalized;
            drxaosAttachBadge(cardEl, countryBadge);
            requestAnimationFrame(function() {
                drxaosSafeRevealBadge(countryBadge);
            });
        }
        var countryLabel = resolveCountryFromOwner(data && data.payload ? data.payload : data, null, 'card_data') ||
                           resolveCountryFromOwner(supplementalData, null, 'cached') ||
                           resolveCountryFromOwner(extractedPayload, null, 'payload') ||
                           extractCountryCode(null, cardEl, 'element');
        if (countryLabel) {
            renderCountryBadge(countryLabel);
        } else {
            var tmdbCandidate = drxaosFirstAvailable(
                data && [data.tmdb_id, data.id, data.card_id, data.movie_id, data.tv_id],
                supplementalData && [supplementalData.tmdb_id, supplementalData.id],
                extractedPayload && [extractedPayload.tmdb_id, extractedPayload.id],
                cardEl.dataset && [cardEl.dataset.tmdbId, cardEl.dataset.id, cardEl.dataset.cardId, cardEl.dataset.movieId, cardEl.dataset.tvId],
                cardEl.getAttribute('data-tmdb-id'),
                cardEl.getAttribute('data-id'),
                cardEl.getAttribute('data-card-id'),
                cardEl.getAttribute('data-movie-id'),
                cardEl.getAttribute('data-tv-id')
            );
            var typeCandidate = drxaosFirstAvailable(
                data && [data.type, data.media_type, data.name ? 'tv' : ''],
                supplementalData && supplementalData.type,
                extractedPayload && [extractedPayload.type, extractedPayload.media_type, extractedPayload.name ? 'tv' : ''],
                cardEl.dataset && cardEl.dataset.type
            ) || (data && data.name ? 'tv' : 'movie');
            if (tmdbCandidate) {
                var pendingKey = String(typeCandidate || 'movie').toLowerCase() + '_' + tmdbCandidate;
                if (cardEl.dataset) cardEl.dataset.drxaosCountryPending = pendingKey;
                drxaosScheduleCountryFetch(cardEl, tmdbCandidate, typeCandidate).then(function(list) {
                    if (cardEl.dataset && cardEl.dataset.drxaosCountryPending !== pendingKey) return;
                    if (cardEl.dataset) delete cardEl.dataset.drxaosCountryPending;
                    if (!Array.isArray(list) || !list.length) return;
                    var fetchedLabel = '';
                    for (var ci = 0; ci < list.length; ci++) {
                        fetchedLabel = normalizeCountryCandidate(list[ci], 'productionCountries');
                        if (fetchedLabel) break;
            }
                    if (fetchedLabel) {
                        renderCountryBadge(fetchedLabel);
                    }
                });
            }
        }
        }

        var releaseYear = null;
        var inlineYearNode = cardEl.querySelector('.card__year, .card-year, .year');
        var inlineYearValue = '';
        if (inlineYearNode) {
            inlineYearValue = (inlineYearNode.textContent || '').trim();
            inlineYearNode.remove();
            if (inlineYearValue && cardEl.dataset && !cardEl.dataset.drxaosInlineYear) {
                cardEl.dataset.drxaosInlineYear = inlineYearValue;
            }
        }
        if (data.first_air_date) { releaseYear = String(data.first_air_date).slice(0, 4); }
        else if (data.release_date) { releaseYear = String(data.release_date).slice(0, 4); }
        else if (data.year) { releaseYear = String(data.year); }
        if (!releaseYear && cardEl.dataset && cardEl.dataset.drxaosInlineYear) {
            releaseYear = cardEl.dataset.drxaosInlineYear;
        } else if (!releaseYear && inlineYearValue) {
            releaseYear = inlineYearValue;
        }
        if (badgeYearEnabled && releaseYear && /^\d{4}$/.test(releaseYear)) {
            drxaosRenderYearBadge(cardEl, releaseYear);
        }
        if (!badgeSeasonEnabled) {
            cardEl.setAttribute('data-season-processed', 'disabled');
            drxaosScheduleHeroBadgeRefresh(cardEl);
        } else if (data && (data.name || data.media_type === 'tv' || data.type === 'tv' || data.next_episode_to_air || data.number_of_seasons || data.seasons || data.episodes)) {
            var isTvCard = true;
            if (!data.name) {
                isTvCard = !!(data && (data.media_type === 'tv' || data.type === 'tv' || data.next_episode_to_air || data.number_of_seasons || data.seasons || data.episodes));
            }
            if (!isTvCard && cardEl.dataset) {
                var dtype = (cardEl.dataset.type || cardEl.dataset.cardType || '').toLowerCase();
                if (dtype === 'tv' || dtype === 'tvshow' || dtype === 'show') isTvCard = true;
            }
            if (!isTvCard) {
                cardEl.setAttribute('data-season-processed', 'not-tv');
                drxaosScheduleHeroBadgeRefresh(cardEl);
                return;
            }
            var tmdbIdForSeason = data.id || data.tmdb_id || data.tv_id || (data.ids && data.ids.tmdb) || (data.ids && data.ids.id) || null;
            if (!tmdbIdForSeason) {
                cardEl.setAttribute('data-season-processed', 'not-tv');
                drxaosScheduleHeroBadgeRefresh(cardEl);
                return;
            }
            var badge = document.createElement('div');
            badge.className = 'card--season-progress';
            badge.classList.add('drxaos-badge-base');
            badge.innerHTML = '<div>...</div>';
            drxaosAttachBadge(cardEl, badge);
            cardEl.setAttribute('data-season-processed', 'loading');
            fetchSeriesData(tmdbIdForSeason)
                .then(function(tmdbData) {
                    if (tmdbData && tmdbData.seasons && tmdbData.last_episode_to_air) {
                        var lastEpisode = tmdbData.last_episode_to_air;
                        var currentSeason = null;
                        for (var i = 0; i < tmdbData.seasons.length; i++) {
                            var season = tmdbData.seasons[i];
                            if (season.season_number === lastEpisode.season_number && season.season_number > 0) {
                                currentSeason = season;
                                break;
                            }
                        }
                        if (currentSeason) {
                            var totalEpisodes = currentSeason.episode_count || 0;
                            var airedEpisodes = lastEpisode.episode_number || 0;
                            var isComplete = airedEpisodes >= totalEpisodes;
                            var content = '';
                            if (isComplete) {
                                content = 'S' + lastEpisode.season_number;
                            } else {
                                content = 'S' + lastEpisode.season_number + ' ' + airedEpisodes + '/' + totalEpisodes;
                            }
                            if (badge.parentNode) {
                                badge.parentNode.removeChild(badge);
                            }
                            badge = document.createElement('div');
                            badge.className = isComplete ? 'card--season-complete' : 'card--season-progress';
                            badge.classList.add('drxaos-badge-base');
                            badge.innerHTML = '<div>' + content + (isComplete ? ' ✓' : '') + '</div>';
                            drxaosAttachBadge(cardEl, badge);
                            requestAnimationFrame(function() {
                                drxaosSafeRevealBadge(badge);
                            });
                            cardEl.setAttribute('data-season-processed', isComplete ? 'complete' : 'in-progress');
                            drxaosScheduleHeroBadgeRefresh(cardEl);
                        } else {
                            if (badge.parentNode) {
                                badge.parentNode.removeChild(badge);
                            }
                            cardEl.setAttribute('data-season-processed', 'error');
                            drxaosScheduleHeroBadgeRefresh(cardEl);
                        }
                    } else {
                        if (badge.parentNode) {
                            badge.parentNode.removeChild(badge);
                        }
                        cardEl.setAttribute('data-season-processed', 'error');
                        drxaosScheduleHeroBadgeRefresh(cardEl);
                    }
                })
                .catch(function(error) {
                    if (badge.parentNode) {
                        badge.parentNode.removeChild(badge);
                    }
                    cardEl.setAttribute('data-season-processed', 'error');
                    drxaosScheduleHeroBadgeRefresh(cardEl);
                });
        } else {
            cardEl.setAttribute('data-season-processed', 'not-tv');
            drxaosScheduleHeroBadgeRefresh(cardEl);
        }
        if (typeof drxaosScheduleProcessAllCards === 'function') {
            drxaosScheduleProcessAllCards();
        } else if (typeof window.drxaosProcessAllCards === 'function') {
            window.drxaosProcessAllCards();
        }
    }
        window.drxaosSeasonHandler = function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                var addedNodes = mutation.addedNodes;
                if (addedNodes) {
                    for (var j = 0; j < addedNodes.length; j++) {
                        var node = addedNodes[j];
                        if (node.nodeType !== 1) continue;
                        if (node.classList && node.classList.contains('card')) {
                            addSeasonBadge(node);
                        }
                        if (node.querySelectorAll) {
                            var cards = node.querySelectorAll('.card');
                            for (var k = 0; k < cards.length; k++) {
                                addSeasonBadge(cards[k]);
                            }
                        }
                    }
                }
            }
        };
        var existingCards = document.querySelectorAll('.card:not([data-season-processed])');
        // Optimized: Use processBatch instead of creating hundreds of timers
        if (existingCards.length > 0) {
            processBatch(existingCards, function(card) {
                addSeasonBadge(card);
            }, 5); // Batch size 5
        }
    
}
function drxaosRenderYearBadge(cardElement, yearText) {
    if (!cardElement || !yearText) return;
    drxaosRemoveBadgeNodes(cardElement, drxaosGetBadgeSelectors('year', ['.card--year']));
    var badge = document.createElement('div');
    badge.className = 'card--year drxaos-badge-base';
    badge.textContent = String(yearText).trim();
    badge.dataset.drxaosBadge = 'year';
    badge.dataset.drxaosBadgePos = 'right';
    drxaosAttachBadge(cardElement, badge);
    badge.style.top = 'auto';
    badge.style.left = 'auto';
    badge.style.bottom = '0';
    badge.style.right = '0';
    requestAnimationFrame(function() {
        drxaosSafeRevealBadge(badge);
    });
}
function applySourceFilter() {
    var sourceFilter = Lampa.Storage.get('source_filter', 'on');
    if (sourceFilter === 'on') {
        if (applySourceFilter.initialized) return;
        if (!Lampa.Controller || !Lampa.Controller.listener || typeof Lampa.Controller.listener.follow !== 'function') {
            return;
        }
        applySourceFilter.initialized = true;
        Lampa.Controller.listener.follow('toggle', function (event) {
            if (event.name !== 'select') {
                return;
            }
            var active = Lampa.Activity.active();
            var componentName = active.component.toLowerCase();
            if (componentName !== 'online' && componentName !== 'lampac' && componentName.indexOf('bwa') !== 0) {
                return;
            }
            if (Lampa.Storage.get('source_filter', 'on') !== 'on') {
                return;
            }
            var $filterTitle = $('.selectbox__title');
            if ($filterTitle.length !== 1 || $filterTitle.text() !== Lampa.Lang.translate('title_filter')) {
                return;
            }
            var $sourceBtn = $('.simple-button--filter.filter--sort');
            if ($sourceBtn.length !== 1 || $sourceBtn.hasClass('hide')) {
                return;
            }
            var $selectBoxItem = Lampa.Template.get('selectbox_item', {
                title: Lampa.Lang.translate('settings_rest_source'),
                subtitle: $('div', $sourceBtn).text()
            });
            $selectBoxItem.on('hover:enter', function () {
                $sourceBtn.trigger('hover:enter');
            });
            var $selectOptions = $('.selectbox-item');
            if ($selectOptions.length > 0) {
                $selectOptions.first().after($selectBoxItem);
            } else {
                $('body > .selectbox').find('.scroll__body').prepend($selectBoxItem);
            }
            Lampa.Controller.collectionSet($('body > .selectbox').find('.scroll__body'));
            Lampa.Controller.collectionFocus($('.selectbox-item').first());
        });
    }
}
function applyMovieQuality() {
    var movieQuality = Lampa.Storage.get('movie_quality', 'on');
    var movieQualityEnabled = CONFIG.FEATURES.JACRED_INTEGRATION && movieQuality === 'on';
    if (!movieQualityEnabled) {
        var qualityStyle = document.getElementById("drxaos-movie-quality");
        if (qualityStyle) {
            qualityStyle.remove();
        }
        try {
            getQualityCacheStore().clear();
        } catch (clearError) {
        }
        return;
    }
    var jacredUrl = Lampa.Storage.get('jacred_url', 'sync.jacred.stream');
    if (!jacredUrl) {
        if (Lampa.Noty) {
            Lampa.Noty.show('JacRed URL не указан');
        }
        return;
    }
        var styleTag = document.createElement("style");
        styleTag.id = "drxaos-movie-quality";
        styleTag.textContent = `
            /* jacred: стили качества перенесены в базовый блок */
        .card-more__box {
            background: var(--theme-primary, rgba(0, 0, 0, var(--drxaos-surface-opacity))) !important;
            border: 2px solid var(--theme-secondary, rgba(255, 255, 255, 0.95)) !important;
            border-radius: 16px !important;
            padding: 16px !important;
            transition: none !important;
        }
        .card-more__box:hover {
            background: var(--theme-secondary, rgba(255, 255, 255, 0.95)) !important;
            border-color: var(--theme-accent, #ffffff) !important;
            transform: none !important; /* FIXED: Disable scale */
        }
        .card-more__title {
            color: white !important;
            font-weight: 700 !important;
            font-size: 1.1em !important;
        }
.online-prestige {
    background: var(--drxaos-bg-color) !important;
    border: 2px solid var(--drxaos-accent-color) !important;
    border-radius: 12px !important;
    padding: 1em !important;
    transition: none !important;
}
.online-prestige.focus,
.online-prestige:hover {
    border-color: var(--drxaos-accent-color) !important;
    box-shadow: 0 0 20px var(--drxaos-accent-color) !important;
    transform: none !important; /* FIXED: Disable scale */
}
.online-prestige__img {
    border-radius: 8px !important;
    overflow: hidden !important;
}
.online-prestige__title,
.online-prestige__info,
.online-prestige__footer {
    color: var(--drxaos-text-color) !important;
    font-family: var(--drxaos-font-family) !important;
}
`;
        document.head.appendChild(styleTag);
        initMovieQualitySystem(jacredUrl);
}
function initMovieQualitySystem(jacredUrl) {
    var JACRED_PROTOCOL = 'https://';
    var DEFAULT_PROXY_LIST = [
        'http://api.allorigins.win/raw?url='
    ];
    var PROXY_TIMEOUT = 5000;
    var TMDB_CACHE_KEY_PREFIX = {
        SEASON: 'season-progress:',
        SERIES_INFO: 'series-info:',
        MOVIE_RELEASE: 'movie-release:',
        NEXT_EPISODE: 'next-episode:'
    };
    if (typeof AbortController === 'undefined') {
        window.AbortController = function () {
            this.signal = {
                aborted: false,
                addEventListener: function (event, callback) {
                    if (event === 'abort') {
                        this._onabort = callback;
                    }
                }
            };
            this.abort = function () {
                this.signal.aborted = true;
                if (typeof this.signal._onabort === 'function') {
                    this.signal._onabort();
                }
            };
        };
    }
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var PROXY_LIST = drxaosGetJacredProxyList(DEFAULT_PROXY_LIST);
        var callbackCalled = false;
        var controller = new AbortController();
        var signal = controller.signal;
        function tryNextProxy() {
            if (!PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('Proxy list is empty'));
                }
                return;
            }
            if (currentProxyIndex >= PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('Все прокси не сработали для ' + url));
                }
                return;
            }
            var proxyUrl = PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            var timeoutId = setTimeout(function () {
                controller.abort();
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, PROXY_TIMEOUT);
            fetch(proxyUrl, { signal: signal })
                .then(function (response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error('Ошибка прокси: ' + response.status);
                    }
                    return response.text();
                })
                .then(function (data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        clearTimeout(timeoutId);
                        callback(null, data);
                    }
                })
                .catch(function (error) {
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                });
        }
        var directTimeoutId = setTimeout(function () {
            controller.abort();
            if (!callbackCalled) {
                tryNextProxy();
            }
        }, PROXY_TIMEOUT);
        fetch(url, { signal: signal })
            .then(function (response) {
                clearTimeout(directTimeoutId);
                if (!response.ok) {
                    throw new Error('Ошибка прямого запроса: ' + response.status);
                }
                return response.text();
            })
            .then(function (data) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    clearTimeout(directTimeoutId);
                    callback(null, data);
                }
            })
            .catch(function (error) {
                clearTimeout(directTimeoutId);
                if (!callbackCalled) {
                    tryNextProxy();
                }
            });
    }
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        if (!jacredUrl) {
            callback(null);
            return;
        }
        function analyzeTorrentQuality(torrent) {
            if (!torrent) return null;
            var rawQuality = torrent.quality != null ? torrent.quality : '';
            var title = torrent.title || '';
            var extra = torrent.release || torrent.source || '';
            var combined = (title + ' ' + rawQuality + ' ' + extra).toUpperCase();
            var camText = combined.replace(/HDRIP/gi, '');

            var isCamrip = /\b(CAMRIP|CAM|TS|TELESYNC|TELECINE|TC|SCREENER|SCR|HDTS)\b/.test(camText);
            if (isCamrip) {
                return { label: 'CAM', score: 50, isCamrip: true };
            }

            var meta = { label: null, score: -1, isCamrip: false };
            function assign(label, score) {
                if (score > meta.score) {
                    meta.label = label;
                    meta.score = score;
                }
            }

            var numericQuality = parseInt(String(rawQuality).replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numericQuality)) {
                if (numericQuality >= 2160) { assign('4K', 800); }
                else if (numericQuality >= 1440) { assign('FHD', 360); }
                else if (numericQuality >= 1080) { assign('FHD', 340); }
                else if (numericQuality >= 720) { assign('HD', 220); }
                else if (numericQuality >= 480) { assign('SD', 120); }
            }

            if (/\b(2160P|4K|UHD|ULTRA\s*HD)\b/.test(combined)) assign('4K', 800);
            if (/\b(1440P|2K)\b/.test(combined)) assign('FHD', 360);
            if (/\b(1080P|FHD|FULL\s*HD|BLU[-\s]?RAY|BDRIP|BDREMUX|REMUX|BRRIP)\b/.test(combined)) assign('FHD', 340);
            if (/\b(900P)\b/.test(combined)) assign('HD', 230);
            if (/\b(720P|HDTV|HDRIP|WEB[-\s]?DL|WEB[-\s]?RIP|WEBDL|WEBRIP)\b/.test(combined)) assign('HD', 220);
            if (/\b(540P)\b/.test(combined)) assign('SD', 140);
            if (/\b(480P|SD|DVDRIP|DVD|TVRIP|VHS)\b/.test(combined)) assign('SD', 120);

            if (typeof rawQuality === 'string') {
                var qUpper = rawQuality.toUpperCase();
                if (!meta.label && /\b(BDRIP|BLURAY|BDREMUX|REMUX)\b/.test(qUpper)) assign('FHD', 320);
                if (!meta.label && /\b(WEBDL|WEB[-\s]?DL|WEB[-\s]?RIP|HDRIP|HDTV)\b/.test(qUpper)) assign('HD', 210);
                if (!meta.label && /\b(DVDRIP|DVD|TVRIP)\b/.test(qUpper)) assign('SD', 110);
            }

            if (!meta.label) {
                return null;
            }

            return meta;
        }
        var year = '';
        var dateStr = normalizedCard.release_date || '';
        if (dateStr.length >= 4) {
            year = dateStr.substring(0, 4);
        }
        function searchJacredApi(searchTitle, searchYear, exactMatch, strategyName, apiCallback) {
            var userId = Lampa.Storage.get('lampac_unic_id', '');
            var jacredCache = getJacredCacheStore();
            var cacheKey = null;
            if (jacredCache && searchTitle) {
                cacheKey = 'jacred:' + String(searchTitle || '').trim().toLowerCase() + '|' + String(searchYear || 'any') + '|' + (exactMatch ? '1' : '0');
                try {
                    var cachedEntry = jacredCache.get(cacheKey);
                    if (cachedEntry && cachedEntry.hasOwnProperty('result')) {
                        apiCallback(cachedEntry.result);
                        return;
                    }
                } catch (jacredCacheErr) {
                }
            }
            var apiUrl = JACRED_PROTOCOL + jacredUrl + '/api/v1.0/torrents?search=' +
                encodeURIComponent(searchTitle) +
                (searchYear ? '&year=' + searchYear : '') +
                (exactMatch ? '&exact=true' : '');
            fetchWithProxy(apiUrl, cardId, function (error, responseText) {
                if (error || !responseText) {
                    if (jacredCache && cacheKey) {
                        try { jacredCache.set(cacheKey, { result: null }); } catch (jacredProxyErr) {}
                    }
                    apiCallback(null);
                    return;
                }
                try {
                    var torrents = JSON.parse(responseText);
                    if (!Array.isArray(torrents) || torrents.length === 0) {
                        apiCallback(null);
                        return;
                    }
                    var bestRelease = null;
                    var bestCamRelease = null;
                    for (var i = 0; i < torrents.length; i++) {
                        var torrent = torrents[i];
                        var qualityMeta = analyzeTorrentQuality(torrent);
                        if (!qualityMeta || !qualityMeta.label) continue;

                        if (qualityMeta.isCamrip) {
                            if (!bestCamRelease || qualityMeta.score > bestCamRelease.meta.score) {
                                bestCamRelease = { torrent: torrent, meta: qualityMeta };
                            }
                        } else {
                            if (!bestRelease || qualityMeta.score > bestRelease.meta.score) {
                                bestRelease = { torrent: torrent, meta: qualityMeta };
                            }
                        }
                    }

                    var chosen = bestRelease || bestCamRelease;
                    var payloadResult = null;
                    if (chosen) {
                        payloadResult = {
                            quality: chosen.meta.label,
                            title: chosen.torrent.title,
                            isCamrip: chosen.meta.isCamrip
                        };
                    }
                    if (jacredCache && cacheKey) {
                        try {
                            jacredCache.set(cacheKey, { result: payloadResult });
                        } catch (jacredCacheWriteErr) {
                        }
                    }
                    apiCallback(payloadResult);
                } catch (e) {
                    
                    if (jacredCache && cacheKey) {
                        try { jacredCache.set(cacheKey, { result: null }); } catch (jacredErr) {}
                    }
                    apiCallback(null);
                }
            });
        }
        var searchStrategies = [];
        if (normalizedCard.original_title && /[a-zа-яё0-9]/i.test(normalizedCard.original_title)) {
            searchStrategies.push({
                title: normalizedCard.original_title.trim(),
                year: year,
                exact: true,
                name: 'OriginalTitle Exact Year'
            });
        }
        if (normalizedCard.title && /[a-zа-яё0-9]/i.test(normalizedCard.title)) {
            searchStrategies.push({
                title: normalizedCard.title.trim(),
                year: year,
                exact: true,
                name: 'Title Exact Year'
            });
        }
        if (normalizedCard.type === 'tv' && (!year || isNaN(year))) {
            if (normalizedCard.original_title && /[a-zа-яё0-9]/i.test(normalizedCard.original_title)) {
                searchStrategies.push({
                    title: normalizedCard.original_title.trim(),
                    year: '',
                    exact: false,
                    name: 'OriginalTitle No Year'
                });
            }
            if (normalizedCard.title && /[a-zа-яё0-9]/i.test(normalizedCard.title)) {
                searchStrategies.push({
                    title: normalizedCard.title.trim(),
                    year: '',
                    exact: false,
                    name: 'Title No Year'
                });
            }
        }
        function executeNextStrategy(index) {
            if (index >= searchStrategies.length) {
                callback(null);
                return;
            }
            var strategy = searchStrategies[index];
            searchJacredApi(strategy.title, strategy.year, strategy.exact, strategy.name, function (result) {
                if (result !== null) {
                    callback(result);
                } else {
                    executeNextStrategy(index + 1);
                }
            });
        }
        if (searchStrategies.length > 0) {
            executeNextStrategy(0);
        } else {
            callback(null);
        }
    }
    function getQualityCache(key) {
        if (!key) return null;
        var store = getQualityCacheStore();
        var item = store.get(key);
        if (!item || typeof item !== 'object') {
            return null;
        }
        return {
            quality: typeof item.quality === 'string' ? item.quality : (item.quality == null ? null : String(item.quality)),
            isCamrip: !!item.isCamrip
        };
    }
    function saveQualityCache(key, data, localCurrentCard) {
        if (!key) return;
        var payload = {
            quality: data && data.quality ? String(data.quality) : null,
            isCamrip: !!(data && data.isCamrip)
        };
        getQualityCacheStore().set(key, payload);
    }
    function clearQualityElements(localCurrentCard, render) {
        if (render) {
            $('.full-start__status.surs_quality', render).remove();
        }
    }
    function showQualityPlaceholder(localCurrentCard, render) {
        if (!render) {
            return;
        }
        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) {
            return;
        }
        if (!$('.full-start__status.surs_quality', render).length) {
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status surs_quality';
            placeholder.textContent = '...';
            placeholder.style.opacity = '0.7';
            rateLine.append(placeholder);
        }
    }
    function updateQualityElement(quality, isCamrip, localCurrentCard, render) {
        if (!render) {
            return;
        }
        var element = $('.full-start__status.surs_quality', render);
        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) {
            return;
        }
        if (element.length) {
            element.text(quality).css('opacity', '1');
            if (isCamrip) {
                element.addClass('camrip');
            } else {
                element.removeClass('camrip');
            }
        } else {
            var div = document.createElement('div');
            div.className = 'full-start__status surs_quality' + (isCamrip ? ' camrip' : '');
            div.textContent = quality;
            rateLine.append(div);
        }
    }
    function fetchQualitySequentially(normalizedCard, localCurrentCard, qCacheKey, render) {
        getBestReleaseFromJacred(normalizedCard, localCurrentCard, function (jrResult) {
            var quality = (jrResult && jrResult.quality) || null;
            var isCamrip = (jrResult && jrResult.isCamrip) || false;
            if (quality && quality !== 'NO') {
                saveQualityCache(qCacheKey, { quality: quality, isCamrip: isCamrip }, localCurrentCard);
                updateQualityElement(quality, isCamrip, localCurrentCard, render);
            } else {
                clearQualityElements(localCurrentCard, render);
            }
        });
    }
    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') {
            return type;
        }
        return card.name || card.original_name ? 'tv' : 'movie';
    }
    function fetchQualityForCard(card, render) {
        if (!render) {
            return;
        }
        var localCurrentCard = card.id;
        var normalizedCard = {
            id: card.id,
            title: card.title || card.name || '',
            original_title: card.original_title || card.original_name || '',
            type: getCardType(card),
            release_date: card.release_date || card.first_air_date || ''
        };
        var rateLine = $('.full-start-new__rate-line', render);
        var qCacheKey = normalizedCard.type + '_' + (normalizedCard.id || normalizedCard.imdb_id);
        var cacheQualityData = getQualityCache(qCacheKey);
        if (cacheQualityData) {
            updateQualityElement(cacheQualityData.quality, cacheQualityData.isCamrip, localCurrentCard, render);
        } else {
            showQualityPlaceholder(localCurrentCard, render);
            setTimeout(function() {
                fetchQualitySequentially(normalizedCard, localCurrentCard, qCacheKey, render);
            }, 100);
        }
    }
    // ========================================================================
    // QUALITY BADGES: HDR / Dolby Vision / Sound / DUB (from Applecation)
    // ========================================================================

    function drxaosAnalyzeContentQuality(ffprobe) {
        if (!ffprobe || !Array.isArray(ffprobe)) return null;

        var quality = {
            resolution: null,
            resolutionLabel: null,
            hdr: false,
            dolbyVision: false,
            audio: null
        };

        var video = null;
        for (var i = 0; i < ffprobe.length; i++) {
            if (ffprobe[i].codec_type === 'video') { video = ffprobe[i]; break; }
        }

        if (video) {
            if (video.width && video.height) {
                quality.resolution = video.width + 'x' + video.height;
                if (video.height >= 2160 || video.width >= 3840) quality.resolutionLabel = '4K';
                else if (video.height >= 1440 || video.width >= 2560) quality.resolutionLabel = '2K';
                else if (video.height >= 1080 || video.width >= 1920) quality.resolutionLabel = 'FULL HD';
                else if (video.height >= 720 || video.width >= 1280) quality.resolutionLabel = 'HD';
            }

            if (video.side_data_list && Array.isArray(video.side_data_list)) {
                var hasMasteringDisplay = false, hasContentLight = false, hasDolbyVision = false;
                for (var s = 0; s < video.side_data_list.length; s++) {
                    var sdt = video.side_data_list[s].side_data_type || '';
                    if (sdt === 'Mastering display metadata') hasMasteringDisplay = true;
                    if (sdt === 'Content light level metadata') hasContentLight = true;
                    if (sdt === 'DOVI configuration record' || sdt === 'Dolby Vision RPU') hasDolbyVision = true;
                }
                if (hasDolbyVision) {
                    quality.dolbyVision = true;
                    quality.hdr = true;
                } else if (hasMasteringDisplay || hasContentLight) {
                    quality.hdr = true;
                }
            }

            if (!quality.hdr && video.color_transfer) {
                var ct = video.color_transfer.toLowerCase();
                if (ct === 'smpte2084' || ct === 'arib-std-b67') quality.hdr = true;
            }

            if (!quality.dolbyVision && video.codec_name) {
                var cn = video.codec_name.toLowerCase();
                if (cn.indexOf('dovi') !== -1 || cn.indexOf('dolby') !== -1) {
                    quality.dolbyVision = true;
                    quality.hdr = true;
                }
            }
        }

        var maxChannels = 0;
        for (var a = 0; a < ffprobe.length; a++) {
            if (ffprobe[a].codec_type === 'audio' && ffprobe[a].channels && ffprobe[a].channels > maxChannels) {
                maxChannels = ffprobe[a].channels;
            }
        }
        if (maxChannels >= 8) quality.audio = '7.1';
        else if (maxChannels >= 6) quality.audio = '5.1';
        else if (maxChannels >= 4) quality.audio = '4.0';
        else if (maxChannels >= 2) quality.audio = '2.0';

        return quality;
    }

    var DRXAOS_BADGE_SVG = {
        dv: '<svg viewBox="0 0 1051 393" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,393) scale(0.1,-0.1)" fill="currentColor"><path d="M50 2905 l0 -1017 223 5 c146 4 244 11 287 21 361 85 638 334 753 677 39 116 50 211 44 366 -7 200 -52 340 -163 511 -130 199 -329 344 -574 419 -79 24 -102 26 -327 31 l-243 4 0 -1017z"/><path d="M2436 3904 c-443 -95 -762 -453 -806 -905 -30 -308 86 -611 320 -832 104 -99 212 -165 345 -213 133 -47 253 -64 468 -64 l177 0 0 1015 0 1015 -217 -1 c-152 0 -239 -5 -287 -15z"/><path d="M3552 2908 l3 -1013 425 0 c309 0 443 4 490 13 213 43 407 148 550 299 119 124 194 255 247 428 25 84 27 103 27 270 1 158 -2 189 -22 259 -72 251 -221 458 -424 590 -97 63 -170 97 -288 134 l-85 26 -463 4 -462 3 2 -1013z m825 701 c165 -22 283 -81 404 -199 227 -223 279 -550 133 -831 -70 -133 -176 -234 -319 -304 -132 -65 -197 -75 -490 -75 l-245 0 0 703 c0 387 3 707 7 710 11 11 425 8 510 -4z"/><path d="M7070 2905 l0 -1015 155 0 155 0 0 1015 0 1015 -155 0 -155 0 0 -1015z"/><path d="M7640 2905 l0 -1015 150 0 150 0 0 60 c0 33 2 60 5 60 2 0 33 -15 67 -34 202 -110 433 -113 648 -9 79 38 108 59 180 132 72 71 95 102 134 181 102 207 102 414 1 625 -120 251 -394 411 -670 391 -115 -8 -225 -42 -307 -93 -21 -13 -42 -23 -48 -23 -7 0 -10 125 -10 370 l0 370 -150 0 -150 0 0 -1015z m832 95 c219 -67 348 -310 280 -527 -62 -198 -268 -328 -466 -295 -96 15 -168 52 -235 119 -131 132 -164 311 -87 478 27 60 101 145 158 181 100 63 234 80 350 44z"/><path d="M6035 3286 c-253 -49 -460 -232 -542 -481 -23 -70 -26 -96 -26 -210 0 -114 3 -140 26 -210 37 -113 90 -198 177 -286 84 -85 170 -138 288 -177 67 -22 94 -26 207 -26 113 0 140 4 207 26 119 39 204 92 288 177 87 89 140 174 177 286 22 67 26 99 27 200 1 137 -14 207 -69 320 -134 277 -457 440 -760 381z m252 -284 c117 -37 206 -114 260 -229 121 -253 -38 -548 -321 -595 -258 -43 -503 183 -483 447 20 271 287 457 544 377z"/><path d="M9059 3258 c10 -24 138 -312 285 -642 l266 -598 -72 -162 c-39 -88 -78 -171 -86 -183 -37 -58 -132 -80 -208 -48 l-35 14 -18 -42 c-10 -23 -37 -84 -60 -135 -23 -52 -39 -97 -36 -102 3 -4 40 -23 83 -41 70 -31 86 -34 177 -34 93 0 105 2 167 33 76 37 149 104 180 166 29 57 799 1777 805 1799 5 16 -6 17 -161 15 l-167 -3 -185 -415 c-102 -228 -192 -431 -200 -450 l-15 -35 -201 453 -201 452 -168 0 -168 0 18 -42z"/><path d="M2650 968 c0 -2 81 -211 179 -463 l179 -460 59 -3 59 -3 178 453 c98 249 180 459 183 466 4 9 -13 12 -65 12 -47 0 -71 -4 -74 -12 -3 -7 -65 -176 -138 -375 -73 -200 -136 -363 -139 -363 -3 0 -67 168 -142 373 l-136 372 -72 3 c-39 2 -71 1 -71 0z"/><path d="M3805 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 466 0 465 -60 0 c-39 0 -62 -4 -65 -12z"/><path d="M4580 960 c-97 -16 -178 -72 -211 -145 -23 -50 -24 -143 -3 -193 32 -77 91 -117 244 -167 99 -32 146 -64 166 -112 28 -65 -11 -149 -83 -179 -78 -33 -212 -1 -261 61 l-19 24 -48 -43 -48 -42 43 -37 c121 -103 347 -112 462 -17 54 44 88 120 88 194 -1 130 -79 213 -242 256 -24 7 -71 25 -104 41 -48 22 -66 37 -79 65 -32 67 -5 138 65 174 73 37 193 18 244 -39 l20 -22 43 43 c41 40 42 43 25 61 -27 30 -102 64 -167 76 -64 12 -70 12 -135 1z"/><path d="M5320 505 l0 -465 65 0 65 0 0 465 0 465 -65 0 -65 0 0 -465z"/><path d="M6210 960 c-147 -25 -264 -114 -328 -249 -32 -65 -36 -84 -40 -175 -7 -161 33 -271 135 -367 140 -132 360 -164 541 -77 227 108 316 395 198 634 -88 177 -290 271 -506 234z m232 -132 c100 -46 165 -136 188 -261 20 -106 -18 -237 -88 -310 -101 -105 -245 -132 -377 -73 -74 33 -120 79 -157 154 -31 62 -33 74 -33 167 0 87 4 107 26 155 64 137 173 204 320 196 43 -2 85 -12 121 -28z"/><path d="M7135 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 376 c0 207 3 374 8 371 4 -2 115 -171 247 -375 l240 -371 78 0 77 0 0 465 0 465 -60 0 -60 0 -2 -372 -3 -372 -241 370 -241 369 -82 3 c-59 2 -83 -1 -86 -10z"/></g></svg>',
        hdr: '<svg viewBox="-1 178 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="181.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M27.2784 293V199.909H46.9602V238.318H86.9148V199.909H106.551V293H86.9148V254.545H46.9602V293H27.2784ZM155.778 293H122.778V199.909H156.051C165.415 199.909 173.475 201.773 180.233 205.5C186.991 209.197 192.188 214.515 195.824 221.455C199.491 228.394 201.324 236.697 201.324 246.364C201.324 256.061 199.491 264.394 195.824 271.364C192.188 278.333 186.96 283.682 180.142 287.409C173.354 291.136 165.233 293 155.778 293ZM142.46 276.136H154.96C160.778 276.136 165.672 275.106 169.642 273.045C173.642 270.955 176.642 267.727 178.642 263.364C180.672 258.97 181.688 253.303 181.688 246.364C181.688 239.485 180.672 233.864 178.642 229.5C176.642 225.136 173.657 221.924 169.688 219.864C165.718 217.803 160.824 216.773 155.006 216.773H142.46V276.136ZM215.903 293V199.909H252.631C259.661 199.909 265.661 201.167 270.631 203.682C275.631 206.167 279.434 209.697 282.04 214.273C284.676 218.818 285.994 224.167 285.994 230.318C285.994 236.5 284.661 241.818 281.994 246.273C279.328 250.697 275.464 254.091 270.403 256.455C265.373 258.818 259.282 260 252.131 260H227.54V244.182H248.949C252.706 244.182 255.828 243.667 258.312 242.636C260.797 241.606 262.646 240.061 263.858 238C265.1 235.939 265.722 233.379 265.722 230.318C265.722 227.227 265.1 224.621 263.858 222.5C262.646 220.379 260.782 218.773 258.267 217.682C255.782 216.561 252.646 216 248.858 216H235.585V293H215.903ZM266.176 250.636L289.312 293H267.585L244.949 250.636H266.176Z" fill="currentColor"/></svg>',
        sound71: '<svg viewBox="-1 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M91.6023 483L130.193 406.636V406H85.2386V389.909H150.557V406.227L111.92 483H91.6023ZM159.545 484.182C156.545 484.182 153.97 483.121 151.818 481C149.697 478.848 148.636 476.273 148.636 473.273C148.636 470.303 149.697 467.758 151.818 465.636C153.97 463.515 156.545 462.455 159.545 462.455C162.455 462.455 165 463.515 167.182 465.636C169.364 467.758 170.455 470.303 170.455 473.273C170.455 475.273 169.939 477.106 168.909 478.773C167.909 480.409 166.591 481.727 164.955 482.727C163.318 483.697 161.515 484.182 159.545 484.182ZM215.045 389.909V483H195.364V408.591H194.818L173.5 421.955V404.5L196.545 389.909H215.045Z" fill="currentColor"/></svg>',
        sound51: '<svg viewBox="330 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="333.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M443.733 484.273C437.309 484.273 431.581 483.091 426.551 480.727C421.551 478.364 417.581 475.106 414.642 470.955C411.703 466.803 410.172 462.045 410.051 456.682H429.142C429.354 460.288 430.869 463.212 433.688 465.455C436.506 467.697 439.854 468.818 443.733 468.818C446.824 468.818 449.551 468.136 451.915 466.773C454.309 465.379 456.172 463.455 457.506 461C458.869 458.515 459.551 455.667 459.551 452.455C459.551 449.182 458.854 446.303 457.46 443.818C456.097 441.333 454.203 439.394 451.778 438C449.354 436.606 446.581 435.894 443.46 435.864C440.733 435.864 438.081 436.424 435.506 437.545C432.96 438.667 430.975 440.197 429.551 442.136L412.051 439L416.46 389.909H473.369V406H432.688L430.278 429.318H430.824C432.46 427.015 434.93 425.106 438.233 423.591C441.536 422.076 445.233 421.318 449.324 421.318C454.93 421.318 459.93 422.636 464.324 425.273C468.718 427.909 472.188 431.53 474.733 436.136C477.278 440.712 478.536 445.985 478.506 451.955C478.536 458.227 477.081 463.803 474.142 468.682C471.233 473.53 467.157 477.348 461.915 480.136C456.703 482.894 450.642 484.273 443.733 484.273ZM500.733 484.182C497.733 484.182 495.157 483.121 493.006 481C490.884 478.848 489.824 476.273 489.824 473.273C489.824 470.303 490.884 467.758 493.006 465.636C495.157 463.515 497.733 462.455 500.733 462.455C503.642 462.455 506.188 463.515 508.369 465.636C510.551 467.758 511.642 470.303 511.642 473.273C511.642 475.273 511.127 477.106 510.097 478.773C509.097 480.409 507.778 481.727 506.142 482.727C504.506 483.697 502.703 484.182 500.733 484.182ZM556.233 389.909V483H536.551V408.591H536.006L514.688 421.955V404.5L537.733 389.909H556.233Z" fill="currentColor"/></svg>',
        sound20: '<svg viewBox="661 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="664.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M722.983 483V468.818L756.119 438.136C758.938 435.409 761.301 432.955 763.21 430.773C765.15 428.591 766.619 426.455 767.619 424.364C768.619 422.242 769.119 419.955 769.119 417.5C769.119 414.773 768.498 412.424 767.256 410.455C766.013 408.455 764.316 406.924 762.165 405.864C760.013 404.773 757.574 404.227 754.847 404.227C751.998 404.227 749.513 404.803 747.392 405.955C745.271 407.106 743.634 408.758 742.483 410.909C741.331 413.061 740.756 415.621 740.756 418.591H722.074C722.074 412.5 723.453 407.212 726.21 402.727C728.968 398.242 732.831 394.773 737.801 392.318C742.771 389.864 748.498 388.636 754.983 388.636C761.65 388.636 767.453 389.818 772.392 392.182C777.362 394.515 781.225 397.758 783.983 401.909C786.741 406.061 788.119 410.818 788.119 416.182C788.119 419.697 787.422 423.167 786.028 426.591C784.665 430.015 782.225 433.818 778.71 438C775.195 442.152 770.241 447.136 763.847 452.955L750.256 466.273V466.909H789.347V483H722.983ZM815.108 484.182C812.108 484.182 809.532 483.121 807.381 481C805.259 478.848 804.199 476.273 804.199 473.273C804.199 470.303 805.259 467.758 807.381 465.636C809.532 463.515 812.108 462.455 815.108 462.455C818.017 462.455 820.563 463.515 822.744 465.636C824.926 467.758 826.017 470.303 826.017 473.273C826.017 475.273 825.502 477.106 824.472 478.773C823.472 480.409 822.153 481.727 820.517 482.727C818.881 483.697 817.078 484.182 815.108 484.182ZM874.483 485.045C866.665 485.015 859.938 483.091 854.301 479.273C848.695 475.455 844.377 469.924 841.347 462.682C838.347 455.439 836.862 446.727 836.892 436.545C836.892 426.394 838.392 417.742 841.392 410.591C844.422 403.439 848.741 398 854.347 394.273C859.983 390.515 866.695 388.636 874.483 388.636C882.271 388.636 888.968 390.515 894.574 394.273C900.21 398.03 904.544 403.485 907.574 410.636C910.604 417.758 912.104 426.394 912.074 436.545C912.074 446.758 910.559 455.485 907.528 462.727C904.528 469.97 900.225 475.5 894.619 479.318C889.013 483.136 882.301 485.045 874.483 485.045ZM874.483 468.727C879.816 468.727 884.074 466.045 887.256 460.682C890.438 455.318 892.013 447.273 891.983 436.545C891.983 429.485 891.256 423.606 889.801 418.909C888.377 414.212 886.347 410.682 883.71 408.318C881.104 405.955 878.028 404.773 874.483 404.773C869.18 404.773 864.938 407.424 861.756 412.727C858.574 418.03 856.968 425.97 856.938 436.545C856.938 443.697 857.65 449.667 859.074 454.455C860.528 459.212 862.574 462.788 865.21 465.182C867.847 467.545 870.938 468.727 874.483 468.727Z" fill="currentColor"/></svg>',
        dub: '<svg viewBox="-1 558 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="561.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M60.5284 673H27.5284V579.909H60.8011C70.1648 579.909 78.2254 581.773 84.983 585.5C91.7405 589.197 96.9375 594.515 100.574 601.455C104.241 608.394 106.074 616.697 106.074 626.364C106.074 636.061 104.241 644.394 100.574 651.364C96.9375 658.333 91.7102 663.682 84.892 667.409C78.1042 671.136 69.983 673 60.5284 673ZM47.2102 656.136H59.7102C65.5284 656.136 70.4223 655.106 74.392 653.045C78.392 650.955 81.392 647.727 83.392 643.364C85.4223 638.97 86.4375 633.303 86.4375 626.364C86.4375 619.485 85.4223 613.864 83.392 609.5C81.392 605.136 78.4072 601.924 74.4375 599.864C70.4678 597.803 65.5739 596.773 59.7557 596.773H47.2102V656.136ZM178.153 579.909H197.835V640.364C197.835 647.152 196.214 653.091 192.972 658.182C189.759 663.273 185.259 667.242 179.472 670.091C173.684 672.909 166.941 674.318 159.244 674.318C151.517 674.318 144.759 672.909 138.972 670.091C133.184 667.242 128.684 663.273 125.472 658.182C122.259 653.091 120.653 647.152 120.653 640.364V579.909H140.335V638.682C140.335 642.227 141.108 645.379 142.653 648.136C144.229 650.894 146.441 653.061 149.29 654.636C152.138 656.212 155.456 657 159.244 657C163.063 657 166.381 656.212 169.199 654.636C172.047 653.061 174.244 650.894 175.79 648.136C177.366 645.379 178.153 642.227 178.153 638.682V579.909ZM214.028 673V579.909H251.301C258.15 579.909 263.862 580.924 268.438 582.955C273.013 584.985 276.453 587.803 278.756 591.409C281.059 594.985 282.21 599.106 282.21 603.773C282.21 607.409 281.483 610.606 280.028 613.364C278.574 616.091 276.574 618.333 274.028 620.091C271.513 621.818 268.634 623.045 265.392 623.773V624.682C268.938 624.833 272.256 625.833 275.347 627.682C278.468 629.53 280.998 632.121 282.938 635.455C284.877 638.758 285.847 642.697 285.847 647.273C285.847 652.212 284.619 656.621 282.165 660.5C279.741 664.348 276.15 667.394 271.392 669.636C266.634 671.879 260.771 673 253.801 673H214.028ZM233.71 656.909H249.756C255.241 656.909 259.241 655.864 261.756 653.773C264.271 651.652 265.528 648.833 265.528 645.318C265.528 642.742 264.907 640.47 263.665 638.5C262.422 636.53 260.65 634.985 258.347 633.864C256.074 632.742 253.362 632.182 250.21 632.182H233.71V656.909ZM233.71 618.864H248.301C250.998 618.864 253.392 618.394 255.483 617.455C257.604 616.485 259.271 615.121 260.483 613.364C261.725 611.606 262.347 609.5 262.347 607.045C262.347 603.682 261.15 600.97 258.756 598.909C256.392 596.848 253.028 595.818 248.665 595.818H233.71V618.864Z" fill="currentColor"/></svg>',
        res4k: '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM113 20.9092L74.1367 82.1367V97.6367H118.818V114H137.637V97.6367H149.182V81.8633H137.637V20.9092H113ZM162.841 20.9092V114H182.522V87.5459L192.204 75.7275L217.704 114H241.25L206.296 62.5908L240.841 20.9092H217.25L183.75 61.9541H182.522V20.9092H162.841ZM119.182 81.8633H93.9541V81.1367L118.454 42.3633H119.182V81.8633Z" fill="white"/></svg>',
        res2k: '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM110.608 19.6367C104.124 19.6367 98.3955 20.8638 93.4258 23.3184C88.4563 25.7729 84.5925 29.2428 81.835 33.7275C79.0775 38.2123 77.6992 43.5001 77.6992 49.5908H96.3809C96.3809 46.6212 96.9569 44.0607 98.1084 41.9092C99.2599 39.7578 100.896 38.1056 103.017 36.9541C105.138 35.8026 107.623 35.2275 110.472 35.2275C113.199 35.2276 115.639 35.7724 117.79 36.8633C119.941 37.9238 121.638 39.4542 122.881 41.4541C124.123 43.4238 124.744 45.7727 124.744 48.5C124.744 50.9545 124.244 53.2421 123.244 55.3633C122.244 57.4542 120.774 59.5906 118.835 61.7725C116.926 63.9543 114.562 66.4094 111.744 69.1367L78.6084 99.8184V114H144.972V97.9092H105.881V97.2725L119.472 83.9541C125.865 78.1361 130.82 73.1514 134.335 69C137.85 64.8182 140.29 61.0151 141.653 57.5908C143.047 54.1666 143.744 50.6968 143.744 47.1816C143.744 41.8182 142.366 37.0606 139.608 32.9092C136.851 28.7577 132.986 25.515 128.017 23.1816C123.077 20.8182 117.275 19.6368 110.608 19.6367ZM159.778 20.9092V114H179.46V87.5459L189.142 75.7275L214.642 114H238.188L203.233 62.5908L237.778 20.9092H214.188L180.688 61.9541H179.46V20.9092H159.778Z" fill="white"/></svg>',
        resFhd: '<svg viewBox="331 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M622 0C633.046 3.57563e-06 642 8.95431 642 20V114C642 125.046 633.046 134 622 134H351C339.954 134 331 125.046 331 114V20C331 8.95431 339.954 0 351 0H622ZM362.341 20.9092V114H382.022V75.5459H419.887V59.3184H382.022V37.1367H423.978V20.9092H362.341ZM437.216 20.9092V114H456.897V75.5459H496.853V114H516.488V20.9092H496.853V59.3184H456.897V20.9092H437.216ZM532.716 20.9092V114H565.716C575.17 114 583.291 112.136 590.079 108.409C596.897 104.682 602.125 99.333 605.762 92.3633C609.428 85.3937 611.262 77.0601 611.262 67.3633C611.262 57.6968 609.428 49.3934 605.762 42.4541C602.125 35.5149 596.928 30.1969 590.171 26.5C583.413 22.7727 575.352 20.9092 565.988 20.9092H532.716ZM564.943 37.7725C570.761 37.7725 575.655 38.8027 579.625 40.8633C583.595 42.9239 586.579 46.1364 588.579 50.5C590.609 54.8636 591.625 60.4847 591.625 67.3633C591.625 74.3026 590.609 79.9694 588.579 84.3633C586.579 88.7269 583.579 91.955 579.579 94.0459C575.609 96.1063 570.715 97.1367 564.897 97.1367H552.397V37.7725H564.943Z" fill="white"/></svg>',
        resHd: '<svg viewBox="662 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M953 0C964.046 3.57563e-06 973 8.95431 973 20V114C973 125.046 964.046 134 953 134H682C670.954 134 662 125.046 662 114V20C662 8.95431 670.954 0 682 0H953ZM731.278 20.9092V114H750.96V75.5459H790.915V114H810.551V20.9092H790.915V59.3184H750.96V20.9092H731.278ZM826.778 20.9092V114H859.778C869.233 114 877.354 112.136 884.142 108.409C890.96 104.682 896.188 99.333 899.824 92.3633C903.491 85.3937 905.324 77.0601 905.324 67.3633C905.324 57.6968 903.491 49.3934 899.824 42.4541C896.188 35.5149 890.991 30.1969 884.233 26.5C877.476 22.7727 869.414 20.9092 860.051 20.9092H826.778ZM859.006 37.7725C864.824 37.7725 869.718 38.8027 873.688 40.8633C877.657 42.9239 880.642 46.1364 882.642 50.5C884.672 54.8636 885.687 60.4847 885.688 67.3633C885.688 74.3026 884.672 79.9694 882.642 84.3633C880.642 88.7269 877.642 91.955 873.642 94.0459C869.672 96.1063 864.778 97.1367 858.96 97.1367H846.46V37.7725H859.006Z" fill="white"/></svg>'
    };

    function drxaosRenderQualityBadges(container, qualityInfo) {
        if (!container || !container.length || !qualityInfo) return;

        var badges = [];

        if (qualityInfo.quality) {
            var resSvg = '';
            if (qualityInfo.quality === '4K') resSvg = DRXAOS_BADGE_SVG.res4k;
            else if (qualityInfo.quality === '2K') resSvg = DRXAOS_BADGE_SVG.res2k;
            else if (qualityInfo.quality === 'FULL HD') resSvg = DRXAOS_BADGE_SVG.resFhd;
            else if (qualityInfo.quality === 'HD') resSvg = DRXAOS_BADGE_SVG.resHd;
            if (resSvg) badges.push('<div class="drxaos-quality-badge drxaos-quality-badge--res">' + resSvg + '</div>');
        }

        if (qualityInfo.dv) {
            badges.push('<div class="drxaos-quality-badge drxaos-quality-badge--dv">' + DRXAOS_BADGE_SVG.dv + '</div>');
        }

        if (qualityInfo.hdr && qualityInfo.hdr_type) {
            badges.push('<div class="drxaos-quality-badge drxaos-quality-badge--hdr">' + DRXAOS_BADGE_SVG.hdr + '</div>');
        }

        if (qualityInfo.sound) {
            var soundSvg = '';
            if (qualityInfo.sound === '7.1') soundSvg = DRXAOS_BADGE_SVG.sound71;
            else if (qualityInfo.sound === '5.1') soundSvg = DRXAOS_BADGE_SVG.sound51;
            else if (qualityInfo.sound === '2.0') soundSvg = DRXAOS_BADGE_SVG.sound20;
            if (soundSvg) badges.push('<div class="drxaos-quality-badge drxaos-quality-badge--sound">' + soundSvg + '</div>');
        }

        if (qualityInfo.dub) {
            badges.push('<div class="drxaos-quality-badge drxaos-quality-badge--dub">' + DRXAOS_BADGE_SVG.dub + '</div>');
        }

        if (badges.length > 0) {
            container.html(badges.join(''));
            container.addClass('show');
        }
    }

    function drxaosAnalyzeQualityBadges(movie, render) {
        if (!movie || !render) return;

        var badgesContainer = render.find('.drxaos-quality-badges');
        if (!badgesContainer.length) {
            var rateLine = render.find('.full-start-new__rate-line');
            if (rateLine.length) {
                rateLine.append('<span class="drxaos-quality-badges"></span>');
                badgesContainer = render.find('.drxaos-quality-badges');
            }
            if (!badgesContainer.length) return;
        }

        if (window.Lampa && Lampa.Parser && typeof Lampa.Parser.get === 'function' && Lampa.Storage.field('parser_use')) {
            var year = ((movie.first_air_date || movie.release_date || '0000') + '').slice(0, 4);
            var combinations = {
                'df': movie.original_title || movie.original_name || '',
                'df_year': (movie.original_title || movie.original_name || '') + ' ' + year,
                'df_lg': (movie.original_title || movie.original_name || '') + ' ' + (movie.title || movie.name || ''),
                'df_lg_year': (movie.original_title || movie.original_name || '') + ' ' + (movie.title || movie.name || '') + ' ' + year,
                'lg': movie.title || movie.name || '',
                'lg_year': (movie.title || movie.name || '') + ' ' + year,
                'lg_df': (movie.title || movie.name || '') + ' ' + (movie.original_title || movie.original_name || ''),
                'lg_df_year': (movie.title || movie.name || '') + ' ' + (movie.original_title || movie.original_name || '') + ' ' + year
            };

            var parseLang = Lampa.Storage.field('parse_lang') || 'lg';
            var searchQuery = combinations[parseLang] || movie.title || movie.name || '';

            Lampa.Parser.get({
                search: searchQuery,
                movie: movie,
                page: 1
            }, function(results) {
                if (!results || !results.Results || results.Results.length === 0) return;

                var availableQualities = {
                    resolutions: {},
                    hdr: {},
                    audio: {},
                    hasDub: false
                };

                for (var i = 0; i < results.Results.length; i++) {
                    var torrent = results.Results[i];

                    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
                        var quality = drxaosAnalyzeContentQuality(torrent.ffprobe);
                        if (quality) {
                            if (quality.resolutionLabel) availableQualities.resolutions[quality.resolutionLabel] = true;
                            if (quality.audio) availableQualities.audio[quality.audio] = true;
                        }

                        if (!availableQualities.hasDub) {
                            for (var j = 0; j < torrent.ffprobe.length; j++) {
                                var stream = torrent.ffprobe[j];
                                if (stream.codec_type === 'audio' && stream.tags) {
                                    var lang = (stream.tags.language || '').toLowerCase();
                                    var audioTitle = (stream.tags.title || stream.tags.handler_name || '').toLowerCase();
                                    if (lang === 'rus' || lang === 'ru' || lang === 'russian') {
                                        if (audioTitle.indexOf('dub') !== -1 || audioTitle.indexOf('дубляж') !== -1 ||
                                            audioTitle.indexOf('дублир') !== -1 || audioTitle === 'd') {
                                            availableQualities.hasDub = true;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    var titleLower = (torrent.Title || '').toLowerCase();
                    if (titleLower.indexOf('dolby vision') !== -1 || titleLower.indexOf('dovi') !== -1 || /\bdv\b/.test(titleLower)) {
                        availableQualities.hdr['Dolby Vision'] = true;
                    }
                    if (titleLower.indexOf('hdr10+') !== -1) availableQualities.hdr['HDR10+'] = true;
                    if (titleLower.indexOf('hdr10') !== -1) availableQualities.hdr['HDR10'] = true;
                    if (titleLower.indexOf('hdr') !== -1) availableQualities.hdr['HDR'] = true;

                    if (titleLower.indexOf('atmos') !== -1 || titleLower.indexOf('dolby atmos') !== -1) {
                        availableQualities.audio['7.1'] = true;
                    }
                    if (/\b7[\.\s]?1\b/.test(titleLower)) availableQualities.audio['7.1'] = true;
                    if (/\b5[\.\s]?1\b/.test(titleLower)) availableQualities.audio['5.1'] = true;
                }

                var qualityInfo = {
                    quality: null,
                    dv: false,
                    hdr: false,
                    hdr_type: null,
                    sound: null,
                    dub: availableQualities.hasDub
                };

                var resOrder = ['8K', '4K', '2K', 'FULL HD', 'HD'];
                for (var r = 0; r < resOrder.length; r++) {
                    if (availableQualities.resolutions[resOrder[r]]) { qualityInfo.quality = resOrder[r]; break; }
                }

                if (availableQualities.hdr['Dolby Vision']) {
                    qualityInfo.dv = true;
                    qualityInfo.hdr = true;
                }

                var hdrKeys = Object.keys(availableQualities.hdr);
                if (hdrKeys.length > 0) {
                    qualityInfo.hdr = true;
                    var hdrOrder = ['HDR10+', 'HDR10', 'HDR'];
                    for (var h = 0; h < hdrOrder.length; h++) {
                        if (availableQualities.hdr[hdrOrder[h]]) { qualityInfo.hdr_type = hdrOrder[h]; break; }
                    }
                }

                var audioOrder = ['7.1', '5.1', '4.0', '2.0'];
                for (var au = 0; au < audioOrder.length; au++) {
                    if (availableQualities.audio[audioOrder[au]]) { qualityInfo.sound = audioOrder[au]; break; }
                }

                if (qualityInfo.dv || qualityInfo.hdr || qualityInfo.sound || qualityInfo.dub) {
                    drxaosRenderQualityBadges(badgesContainer, qualityInfo);
                }
            }, function() {});
        }
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            var render = e.object.activity.render();
            fetchQualityForCard(e.data.movie, render);
            drxaosHandleTitleLogo(e.data.movie, render);
            drxaosHandleOriginalNames(e.data.movie, render);
            drxaosMergeDetailsAndRateLine(render);
            drxaosAnalyzeQualityBadges(e.data.movie, render);
            if (drxaosIsMadnessMode()) {
                drxaosScheduleProcessAllCards(0);
            }
        }
    });
    var drxaosCardVisibilityManager = (function() {
        var trackedCards = new WeakSet();
        var pendingCards = new Set();
        var frameId = null;
        var FALLBACK_MARGIN = 240;
        var isFallbackMode = typeof IntersectionObserver === 'undefined';
        var observer = null;
        var processingCards = 0;
        var MAX_CONCURRENT_PROCESSING = 5;
        
        function isMadnessMode() {
            try {
                return document.body && document.body.classList.contains('drxaos-madness-mode');
            } catch (e) {
                return false;
            }
        }

        function ensureObserver() {
            if (isFallbackMode) return;
            var currentIsMadness = isMadnessMode();
            if (currentIsMadness) {
                if (observer) {
                    try {
                        observer.disconnect();
                        observer = null;
                    } catch (e) {
                        observer = null;
                    }
                }
                return;
            }
            var desiredMargin = '200px 0px';
            if (observer) {
                var currentMargin = observer.rootMargin || '200px 0px';
                if (currentMargin !== desiredMargin) {
                    try {
                        observer.disconnect();
                        observer = null;
                    } catch (e) {
                        observer = null;
                    }
                } else {
                    return;
                }
            }
            try {
                observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (!entry || !entry.target) return;
                        if (entry.isIntersecting || entry.intersectionRatio > 0) {
                            enqueueCard(entry.target);
                        }
                    });
                }, {
                    root: null,
                    threshold: 0.01,
                    rootMargin: desiredMargin
                });
            } catch (err) {
                observer = null;
                isFallbackMode = true;
            }
        }

        function isElementNearViewport(element, margin) {
            if (!element || typeof element.getBoundingClientRect !== 'function') {
                return false;
            }
            var rect = element.getBoundingClientRect();
            var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
            margin = typeof margin === 'number' ? margin : 0;
            return rect.bottom >= -margin &&
                   rect.top <= viewportHeight + margin &&
                   rect.right >= -margin &&
                   rect.left <= viewportWidth + margin;
        }

        function trackCard(card) {
            if (!card || trackedCards.has(card)) return;
            trackedCards.add(card);
            var isMadness = isMadnessMode();
            if (isFallbackMode || isMadness) {
                enqueueCard(card);
            } else if (!isFallbackMode) {
                ensureObserver();
                if (observer) {
                    try {
                        observer.observe(card);
                    } catch (observeError) {
                        enqueueCard(card);
                    }
                } else {
                    enqueueCard(card);
                }
            }
        }

        function enqueueCard(card) {
            if (!card || !card.isConnected) return;
            if (card.hasAttribute('data-quality-processed')) return;
            if (card.__drxaosVisibilityProcessing) return;
            if (card.__drxaosVisibilityQueued) return;
            var isMadness = isMadnessMode();
            // Убираем проверку видимости для карточек в рядах - обрабатываем все карточки
            // if (!isMadness && !isFallbackMode && observer && !isElementNearViewport(card, FALLBACK_MARGIN)) {
            //     return;
            // }
            card.__drxaosVisibilityQueued = true;
            pendingCards.add(card);
            if (!frameId) {
                frameId = requestAnimationFrame(flushQueue);
            }
        }

        function flushQueue() {
            frameId = null;
            var isMadness = isMadnessMode();
            var cards = Array.from(pendingCards);
            pendingCards.clear();
            if (isMadness) {
                processCardsInBatches(cards);
            } else {
            cards.forEach(function(card) {
                card.__drxaosVisibilityQueued = false;
                processCard(card);
            });
            }
        }
        
        function processCardsInBatches(cards) {
            var batchSize = MAX_CONCURRENT_PROCESSING;
            var currentIndex = 0;
            function processNextBatch() {
                if (currentIndex >= cards.length) return;
                var batch = cards.slice(currentIndex, currentIndex + batchSize);
                currentIndex += batchSize;
                batch.forEach(function(card) {
                    card.__drxaosVisibilityQueued = false;
                    processCard(card);
                });
                if (currentIndex < cards.length) {
                    processNextBatch();
                }
            }
            processNextBatch();
        }

        function processCard(card) {
            if (!card || !card.isConnected) return;
            if (card.hasAttribute('data-quality-processed')) return;
            if (card.__drxaosVisibilityProcessing) return;
            var isMadness = isMadnessMode();
            // Убираем проверку видимости для карточек в рядах - обрабатываем все карточки
            // if (!isMadness && !isFallbackMode && observer && !isElementNearViewport(card, FALLBACK_MARGIN)) {
            //     return;
            // }
            if (isMadness && processingCards >= MAX_CONCURRENT_PROCESSING) {
                enqueueCard(card);
                return;
            }
            card.__drxaosVisibilityProcessing = true;
            if (isMadness) {
                processingCards++;
            }
            var processFn = function() {
                try {
                    var cardData = drxaosSafeGetCardData(card);
                    if (!cardData) {
                        // Пытаемся извлечь данные из DOM
                        cardData = drxaosExtractCardPayload(card);
                        if (cardData) {
                            drxaosRememberCardData(card, cardData);
                        } else {
                        setTimeout(function() {
                            card.__drxaosVisibilityProcessing = false;
                                if (isMadness) {
                                    processingCards--;
                                }
                            enqueueCard(card);
                            }, 0);
                        return;
                    }
                    }
                    // Определяем тип карточки если еще не определен
                    if (!cardData.type) {
                        if (card.classList && (card.classList.contains('card--tv') || card.classList.contains('tv'))) {
                            cardData.type = 'tv';
                        } else {
                            var payload = cardData.payload || drxaosExtractCardPayload(card);
                            if (payload && (payload.type === 'tv' || payload.media_type === 'tv' || payload.next_episode_to_air || payload.number_of_seasons)) {
                                cardData.type = 'tv';
                            }
                        }
                    }
                    // Обрабатываем качество
                    if (drxaosIsBadgeEnabled('quality') && !card.hasAttribute('data-quality-processed')) {
                    addQualityToMiniCard(card, cardData);
                    }
                    // Обрабатываем статус для сериалов
                    if (drxaosIsBadgeEnabled('status') && !card.hasAttribute('data-next-episode-processed')) {
                        if (typeof addNextEpisodeInfo === 'function') {
                            addNextEpisodeInfo(card, cardData);
                        }
                    }
                    colorizeCardVotes(card);
                    drxaosPrefetchTitleLogo(cardData);
                    if (drxaosIsBadgeEnabled('quality')) {
                    card.setAttribute('data-quality-processed', 'true');
                    }
                } catch (err) {
                    
                } finally {
                    card.__drxaosVisibilityProcessing = false;
                    if (isMadness) {
                        processingCards--;
                }
                }
            };
            processFn();
        }

        return {
            observe: function(card) {
                if (!card) return;
                trackCard(card);
                var isMadness = isMadnessMode();
                if (isFallbackMode || isMadness) {
                    enqueueCard(card);
                } else {
                            enqueueCard(card);
                }
            },
            enqueue: enqueueCard,
            processImmediately: processCard
        };
    })();
var drxaosProcessAllCardsFrame = null;
var drxaosProcessAllCardsTimeout = null;
function drxaosScheduleProcessAllCards(delay) {
    if (drxaosProcessAllCardsFrame) {
        cancelAnimationFrame(drxaosProcessAllCardsFrame);
        drxaosProcessAllCardsFrame = null;
    }
    var raf = window.requestAnimationFrame || function(cb) { cb(); };
    drxaosProcessAllCardsFrame = raf(function() {
        drxaosProcessAllCardsFrame = null;
        processAllCards();
    });
}

function processAllCards() {
    // Generation Guard: Stop previous batches if a new process starts
    window.drxaosProcessGeneration = (window.drxaosProcessGeneration || 0) + 1;
    var myGeneration = window.drxaosProcessGeneration;

    drxaosSyncMadnessMode();
    var isMadness = drxaosIsMadnessMode();
    var candidateNodes = document.querySelectorAll('.card, .madness-card, .madness-item, .madness__item, [data-madness-card], [data-component="madness-card"]');
    if (!candidateNodes.length) {
        return;
    }
    var seen = new Set();
    var cards = [];
    var now = Date.now();
    
    // Собираем все карточки в массив
    for (var i = 0; i < candidateNodes.length; i++) {
        var node = candidateNodes[i];
        var card = drxaosResolveCardElement(node);
        if (card && !seen.has(card)) {
            seen.add(card);
            cards.push(card);
        }
    }
    
    if (!cards.length) {
            return;
        }
    
    // Разбиваем на батчи для асинхронной обработки
    // Приоритизируем видимые карточки
    var visibleCards = [];
    var hiddenCards = [];
    
    cards.forEach(function(card) {
        if (card && card.isConnected) {
            var rect = card.getBoundingClientRect();
            var isVisible = rect.top < window.innerHeight + 200 && rect.bottom > -200;
            if (isVisible) {
                visibleCards.push(card);
            } else {
                hiddenCards.push(card);
            }
        }
    });
    
    // Сначала обрабатываем видимые карточки, потом скрытые
    // cards = visibleCards.concat(hiddenCards); // Old logic
    
    var isTv = drxaosIsTvDevice();
    
    // Config: Visible items get high priority and larger batches
    var VISIBLE_BATCH_SIZE = 200; // Increase batch to cover huge grids
    var HIDDEN_BATCH_SIZE = isTv ? 2 : 5;
    var VISIBLE_BUDGET = 500; // 500ms blocking budget - rendering MUST happen now
    var HIDDEN_BUDGET = isTv ? 5 : 10;

    // Process visible cards first, aggressively
    processCardList(visibleCards, VISIBLE_BATCH_SIZE, VISIBLE_BUDGET, true, function() {
        // Then process hidden cards in background
        processCardList(hiddenCards, HIDDEN_BATCH_SIZE, HIDDEN_BUDGET, false);
    });

    function processCardList(list, batchSize, budget, isHighPriority, onComplete) {
        if (!list || !list.length) {
            if (onComplete) onComplete();
            return;
        }
        
        var currentIndex = 0;
        
        function runBatch() {
            // Generation Guard: Abort if a new scan has started
            if (window.drxaosProcessGeneration !== myGeneration) return;

            var start = Date.now();
            var endIndex = Math.min(currentIndex + batchSize, list.length);
            
            for (var i = currentIndex; i < endIndex; i++) {
                var card = list[i];
                // Budget check
                if (i > currentIndex && (Date.now() - start > budget)) {
                    endIndex = i;
                    break;
                }
                
                processSingleCard(card);
            }
            
            currentIndex = endIndex;
            
            if (currentIndex < list.length) {
                if (isHighPriority) {
                    // Visible items: use rAF or even immediate timeout for max speed
                    if (window.requestAnimationFrame) {
                        requestAnimationFrame(runBatch);
                    } else {
                        setTimeout(runBatch, 0);
                    }
                } else {
                    // Hidden items: use idle callback or low priority timeout
                    if (window.requestIdleCallback) {
                        window.requestIdleCallback(runBatch);
                    } else {
                        setTimeout(runBatch, 50); // Slower interval for hidden items
                    }
                }
            } else {
                drxaosSyncMadnessMode();
                if (onComplete) onComplete();
            }
        }
        
        // Start immediately
        runBatch();
    }

    function processSingleCard(card) {
        drxaosEnsureContinueRowLayout(card);
        try {
            // ... (rest of the card processing logic)
            if (card.querySelectorAll) {
                var typeNodes = card.querySelectorAll('.card__type');
                if (typeNodes && typeNodes.length) {
                    typeNodes.forEach(function(typeNode) {
                        typeNode.remove();
                    });
                }
            }
            if (drxaosIsBadgeEnabled('quality') && card.hasAttribute('data-quality-processed')) {
                var qualityBadge = card.querySelector && card.querySelector('.card-quality[data-drxaos-quality], .card__quality[data-drxaos-quality]');
                var qualityStatus = card.dataset ? (card.dataset.drxaosQualityStatus || '') : '';
                var hasVisibleQuality = qualityBadge && qualityBadge.isConnected && qualityBadge.textContent.trim().length > 0;
                if (!hasVisibleQuality) {
                    var pendingSince = parseInt((card.dataset && card.dataset.drxaosQualityPendingSince) || '0', 10);
                    var shouldResetQuality = false;
                    if (qualityStatus === 'success' || qualityStatus === 'empty' || qualityStatus === 'missing' || !qualityStatus) {
                        shouldResetQuality = true;
                    } else if (qualityStatus === 'pending') {
                        if (!pendingSince) {
                            if (card.dataset) card.dataset.drxaosQualityPendingSince = String(Date.now());
                        } else if (Date.now() - pendingSince > 2000) {
                            shouldResetQuality = true;
                        }
                    }
                    if (shouldResetQuality) {
                        card.removeAttribute('data-quality-processed');
                        if (card.dataset) {
                            delete card.dataset.drxaosQualityStatus;
                            delete card.dataset.drxaosQualityPendingSince;
                        }
                    }
                }
            } else if (!drxaosIsBadgeEnabled('quality')) {
                card.dataset && (card.dataset.drxaosQualityStatus = 'disabled');
                card.setAttribute('data-quality-processed', 'disabled');
            }
            if (drxaosIsBadgeEnabled('status') && card.hasAttribute('data-next-episode-processed')) {
                var isTvCard = card.classList.contains('card--tv') ||
                    card.getAttribute('data-type') === 'tv' ||
                    (card.card_data && (card.card_data.name || card.card_data.type === 'tv')) ||
                    (card.dataset && card.dataset.type === 'tv');
                if (isTvCard) {
                    var nextBadge = card.querySelector && card.querySelector('.card-next-episode');
                    var nextStatus = card.dataset ? (card.dataset.drxaosNextEpisodeStatus || '') : '';
                    var hasVisibleNext = nextBadge && nextBadge.isConnected && nextBadge.textContent.trim().length > 0;
                    if (!hasVisibleNext) {
                        var pendingNext = parseInt((card.dataset && card.dataset.drxaosNextEpisodePendingSince) || '0', 10);
                        var shouldResetNext = false;
                        if (nextStatus === 'success' || nextStatus === 'empty' || !nextStatus) {
                            shouldResetNext = true;
                        } else if (nextStatus === 'pending') {
                            if (!pendingNext) {
                                if (card.dataset) card.dataset.drxaosNextEpisodePendingSince = String(Date.now());
                            } else if (Date.now() - pendingNext > 2000) {
                                shouldResetNext = true;
                            }
                        }
                        if (shouldResetNext) {
                            card.removeAttribute('data-next-episode-processed');
                            if (card.dataset) {
                                delete card.dataset.drxaosNextEpisodeStatus;
                                delete card.dataset.drxaosNextEpisodePendingSince;
                            }
                            card.removeAttribute('data-quality-processed');
                            if (card.dataset) {
                                delete card.dataset.drxaosQualityStatus;
                                delete card.dataset.drxaosQualityPendingSince;
                            }
                        }
                    }
                }
            } else if (!drxaosIsBadgeEnabled('status')) {
                card.dataset && (card.dataset.drxaosNextEpisodeStatus = 'disabled');
                card.setAttribute('data-next-episode-processed', 'disabled');
            }
        } catch (err) {
            
        }
        
        // Обрабатываем все плашки для карточки
        try {
            // Добавляем плашку сезона если еще не обработана
            // Используем window.drxaosSeasonHandler если доступен
            if (!card.hasAttribute('data-season-processed')) {
                if (typeof window.drxaosSeasonHandler === 'function') {
                    // Создаем фиктивную мутацию для обработки
                    var mockMutation = {
                        addedNodes: [card]
                    };
                    window.drxaosSeasonHandler([mockMutation]);
                } else if (typeof addSeasonBadge === 'function') {
                    addSeasonBadge(card);
                }
            }
        } catch (err) {
            
        }
        
        // Обрабатываем качество и статус для всех карточек сразу, без проверки видимости
        try {
            var cardData = drxaosSafeGetCardData(card);
            if (!cardData) {
                // Пытаемся извлечь данные из DOM
                cardData = drxaosExtractCardPayload(card);
                if (cardData) {
                    drxaosRememberCardData(card, cardData);
                }
            }
            
            // Определяем тип карточки если еще не определен (важно для сериалов)
            if (cardData && !cardData.type) {
                if (card.classList && (card.classList.contains('card--tv') || card.classList.contains('tv'))) {
                    cardData.type = 'tv';
                } else {
                    var payload = cardData.payload || drxaosExtractCardPayload(card);
                    if (payload && (payload.type === 'tv' || payload.media_type === 'tv' || payload.next_episode_to_air || payload.number_of_seasons || payload.seasons)) {
                        cardData.type = 'tv';
                    }
                }
            }
            
            if (cardData) {
                // Обрабатываем качество
                if (drxaosIsBadgeEnabled('quality') && !card.hasAttribute('data-quality-processed')) {
                    if (typeof addQualityToMiniCard === 'function') {
                        addQualityToMiniCard(card, cardData);
                    }
                }
                // Обрабатываем статус для всех карточек (особенно важно для сериалов)
                if (drxaosIsBadgeEnabled('status') && !card.hasAttribute('data-next-episode-processed')) {
                    if (typeof addNextEpisodeInfo === 'function') {
                        addNextEpisodeInfo(card, cardData);
                    }
                }
            } else {
                // Если данных еще нет, добавляем в очередь для обработки позже
        drxaosCardVisibilityManager.observe(card);
        if (drxaosIsBadgeEnabled('quality') && !card.hasAttribute('data-quality-processed')) {
            drxaosCardVisibilityManager.enqueue(card);
                }
                // Также добавляем в очередь для обработки статуса
                if (drxaosIsBadgeEnabled('status') && !card.hasAttribute('data-next-episode-processed')) {
                    drxaosCardVisibilityManager.enqueue(card);
                }
            }
        } catch (err) {
            
        }
        
        var isMadness = drxaosIsMadnessMode();
        if (isMadness) {
            if (card.classList) {
                card.classList.add('layer--render');
            }
            if (card.querySelector) {
                var cardView = card.querySelector('.card__view');
                if (cardView && cardView.classList) {
                    cardView.classList.add('layer--render');
                }
            }
        }
    }
}
window.drxaosProcessAllCards = processAllCards;
window.drxaosScheduleProcessAllCards = drxaosScheduleProcessAllCards;
function drxaosEnsureContinueRowLayout(cardElement) {
    try {
        if (!cardElement || typeof cardElement.closest !== 'function') return;
        if (!document.body || !document.body.classList.contains('drxaos-xuyampishe-active')) return;
        var line = cardElement.closest('.items-line');
        if (!line || (line.dataset && line.dataset.drxaosContinueLayout === 'done')) return;
        var titleEl = line.querySelector('.items-line__title, .items-line__head .title, .items-line__head h2');
        var title = titleEl ? titleEl.textContent : '';
        var sectionAction = (line.dataset && (line.dataset.section || line.dataset.action || line.dataset.type)) || '';
        var sectionKey = drxaosResolveSectionKey(sectionAction, title);
        if (sectionKey !== 'continue' && sectionKey !== 'recommend') return;
        if (line.dataset) line.dataset.drxaosContinueLayout = sectionKey;
        var cards = line.querySelectorAll('.card, .card.selector');
        cards.forEach(function(card) {
            if (!card.classList.contains('card--wide')) {
                card.classList.add('card--wide');
            }
            if (card.classList.contains('card--madness')) return;
            var view = card.querySelector('.card__view');
            if (view) {
                view.classList.add('card__view--wide');
            }
        });
    } catch (err) {
        
    }
}
    function drxaosFallbackCardDataFromElement(cardElement) {
    try {
        cardElement = drxaosResolveCardElement(cardElement);
        if (!cardElement) {
            return null;
        }
        function attr(el, name) {
            return el && el.getAttribute ? el.getAttribute(name) : null;
        }
        var storage = drxaosGetCardDataStorage();
        var storedSnapshot = storage.has(cardElement) ? storage.get(cardElement) : null;
        var indexedData = drxaosLookupCardData(cardElement);
        var dataset = cardElement.dataset || {};
        var payloadCandidate = null;
        if (cardElement.card_data) {
            payloadCandidate = cardElement.card_data;
        } else if (cardElement.card && cardElement.card.data) {
            payloadCandidate = cardElement.card.data;
        } else if (storedSnapshot && storedSnapshot.payload) {
            payloadCandidate = storedSnapshot.payload;
        } else if (indexedData && indexedData.payload) {
            payloadCandidate = indexedData.payload;
        }
        var parent = cardElement.parentElement;
        var parentChainIds = [];
        while (parent && parent !== document.body) {
            parentChainIds.push(
                attr(parent, 'data-id'),
                attr(parent, 'data-card-id'),
                attr(parent, 'data-movie-id'),
                attr(parent, 'data-tv-id'),
                attr(parent, 'data-tmdb-id')
            );
            parent = parent.parentElement;
        }
        var cardId = drxaosFirstAvailable(
            dataset.cardId, dataset.id, dataset.movieId, dataset.tvId,
            attr(cardElement, 'data-card-id'),
            attr(cardElement, 'data-id'),
            attr(cardElement, 'data-movie-id'),
            attr(cardElement, 'data-tv-id'),
            attr(cardElement, 'id'),
            parentChainIds,
            storedSnapshot && [storedSnapshot.card_id, storedSnapshot.id, storedSnapshot.movie_id, storedSnapshot.tv_id],
            indexedData && [indexedData.card_id, indexedData.id, indexedData.movie_id, indexedData.tv_id],
            payloadCandidate && [payloadCandidate.card_id, payloadCandidate.id, payloadCandidate.movie_id, payloadCandidate.tv_id],
            getCardIdFromLampaData(cardElement)
        );
        var tmdbId = drxaosFirstAvailable(
            dataset.tmdbId, dataset.tmdb,
            attr(cardElement, 'data-tmdb-id'),
            attr(cardElement, 'data-tmdb'),
            storedSnapshot && [storedSnapshot.tmdb_id, storedSnapshot.tmdbId],
            indexedData && [indexedData.tmdb_id, indexedData.tmdbId],
            payloadCandidate && [payloadCandidate.tmdb_id, payloadCandidate.tmdbId, payloadCandidate.ids && payloadCandidate.ids.tmdb]
        );
        if (!cardId && tmdbId) {
            cardId = tmdbId;
        }
        if (!cardId && !tmdbId && !payloadCandidate) {
            cardId = getCardIdFromLampaData(cardElement);
        }
        if (!cardId && !tmdbId) {
            return null;
        }
        var titleElement = cardElement.querySelector ? cardElement.querySelector('.card__title, .card-title, .title, .card__name, .name') : null;
        var title = drxaosFirstAvailable(
            dataset.title, dataset.name,
            attr(cardElement, 'data-title'),
            attr(cardElement, 'data-name'),
            titleElement && titleElement.textContent,
            payloadCandidate && [payloadCandidate.title, payloadCandidate.name, payloadCandidate.title_ru, payloadCandidate.name_ru],
            storedSnapshot && storedSnapshot.title,
            indexedData && indexedData.title
        );
        var originalTitleElement = cardElement.querySelector ? cardElement.querySelector('.card__original-title, .original-title, .card__original-name, .original-name') : null;
        var originalTitle = drxaosFirstAvailable(
            dataset.originalTitle, dataset.originalName,
            attr(cardElement, 'data-original-title'),
            attr(cardElement, 'data-original-name'),
            originalTitleElement && originalTitleElement.textContent,
            payloadCandidate && [payloadCandidate.original_title, payloadCandidate.original_name],
            storedSnapshot && storedSnapshot.original_title,
            indexedData && indexedData.original_title
        );
        var typeCandidate = drxaosFirstAvailable(
            dataset.type,
            attr(cardElement, 'data-type'),
            storedSnapshot && storedSnapshot.type,
            indexedData && indexedData.type,
            payloadCandidate && [payloadCandidate.type, payloadCandidate.media_type]
        );
        var isTv = false;
        if (typeCandidate && typeCandidate.toLowerCase() === 'tv') {
            isTv = true;
        } else if (cardElement.classList && (cardElement.classList.contains('card--tv') || cardElement.classList.contains('tv'))) {
            isTv = true;
        } else if (cardElement.querySelector && cardElement.querySelector('[data-type="tv"]')) {
            isTv = true;
        } else if (payloadCandidate && (payloadCandidate.next_episode_to_air || payloadCandidate.number_of_seasons || payloadCandidate.seasons || payloadCandidate.episodes)) {
            isTv = true;
        } else if (storedSnapshot && (storedSnapshot.next_episode_to_air || storedSnapshot.number_of_seasons || storedSnapshot.seasons || storedSnapshot.episodes)) {
            isTv = true;
        } else if (indexedData && (indexedData.next_episode_to_air || indexedData.number_of_seasons || indexedData.seasons || indexedData.episodes)) {
            isTv = true;
        }
        var year = drxaosFirstAvailable(
                dataset.year, dataset.releaseYear, dataset.releaseDate,
                attr(cardElement, 'data-year'),
                attr(cardElement, 'data-release-year'),
                attr(cardElement, 'data-release-date'),
                attr(cardElement, 'data-first-air-date'),
                payloadCandidate && [payloadCandidate.release_date, payloadCandidate.first_air_date, payloadCandidate.year],
                storedSnapshot && storedSnapshot.release_date,
                indexedData && indexedData.release_date
            );
            if (!year) {
                var yearElement = cardElement.querySelector('.card__year, .year, .card__date, .date');
                if (yearElement) {
                    var yearText = yearElement.textContent.trim();
                    var yearMatch = yearText.match(/(\d{4})/);
                    if (yearMatch) {
                        year = yearMatch[1];
                    }
                }
            }

            if (!cardId && !tmdbId && !title) {
                return null;
            }
            var cardData = {
                id: cardId || '',
                tmdb_id: tmdbId || '',
                title: title || '',
                original_title: originalTitle || '',
                type: isTv ? 'tv' : 'movie',
                release_date: year || '',
                payload: payloadCandidate || null
            };
            var snapshot = {
                id: cardData.id,
                tmdb_id: cardData.tmdb_id,
                title: cardData.title,
                original_title: cardData.original_title,
                type: cardData.type,
                release_date: cardData.release_date,
                payload: payloadCandidate || null
            };
            try {
                storage.set(cardElement, snapshot);
            } catch (err) {
                
            }
            drxaosRememberCardData(cardElement, cardData);
            return cardData;
        } catch (e) {
            
            return null;
        }
    }

drxaosCardDataExtractor = (typeof window.getCardDataFromElement === 'function')
    ? window.getCardDataFromElement
    : drxaosFallbackCardDataFromElement;
if (typeof window.getCardDataFromElement !== 'function') {
    window.getCardDataFromElement = drxaosCardDataExtractor;
}
drxaosSafeGetCardData = function(cardElement) {
    if (!cardElement) return null;
    // Cache: Avoid re-scanning DOM if we already found data
    if (cardElement.__drxaosDataCache) return cardElement.__drxaosDataCache;
    try {
        var result = drxaosCardDataExtractor(cardElement);
        if (result) {
            cardElement.__drxaosDataCache = result;
        }
        return result;
    } catch (err) {
        
        if (drxaosCardDataExtractor !== drxaosFallbackCardDataFromElement) {
            drxaosCardDataExtractor = drxaosFallbackCardDataFromElement;
            try {
                return drxaosCardDataExtractor(cardElement);
            } catch (fallbackErr) {
                
            }
        }
        return null;
    }
};
window.drxaosSafeGetCardData = drxaosSafeGetCardData;
    function getCardIdFromLampaData(cardElement) {
        try {
            if (window.Lampa && window.Lampa.Storage) {
                var cacheKeys = Object.keys(localStorage).filter(key => 
                    key.includes('lampa') || key.includes('card') || key.includes('movie') || key.includes('tv')
                );
                for (var i = 0; i < cacheKeys.length; i++) {
                    try {
                        var cacheData = JSON.parse(localStorage.getItem(cacheKeys[i]));
                        if (cacheData && typeof cacheData === 'object') {
                            if (cacheData.id || cacheData.tmdb_id) {
                                return cacheData.id || cacheData.tmdb_id;
                            }
                        }
                    } catch (e) {
                    }
                }
            }
            var href = cardElement.getAttribute('href') || '';
            var idMatch = href.match(/\/(\d+)/);
            if (idMatch) {
                return idMatch[1];
            }
            var onclick = cardElement.getAttribute('onclick') || '';
            var onclickMatch = onclick.match(/id[:\s]*(\d+)/);
            if (onclickMatch) {
                return onclickMatch[1];
            }
            var titleElement = cardElement.querySelector('.card__title, .card-title, .title, .card__name, .name');
            if (titleElement) {
                var title = titleElement.textContent.trim();
                if (title) {
            var foundId = findIdByTitle(title);
            if (foundId) {
                return foundId;
            }
            var tmdbId = findIdByTitleInTMDB(title);
            if (tmdbId) {
                return tmdbId;
            }
                    var hash = 0;
                    var i3;
                    for (i3 = 0; i3 < title.length; i3++) {
                        var char = title.charCodeAt(i3);
                        hash = ((hash << 5) - hash) + char;
                        hash = hash & hash;
                    }
                    var generatedId = Math.abs(hash).toString().substr(0, 8);
                    return generatedId;
                }
            }
            return null;
        } catch (e) {
            
            return null;
        }
    }
    function findIdByTitle(title) {
        try {
            var cacheKeys = Object.keys(localStorage);
            for (var i = 0; i < cacheKeys.length; i++) {
                var key = cacheKeys[i];
                if (key.includes('lampa') || key.includes('movie') || key.includes('tv') || key.includes('card')) {
                    try {
                        var data = JSON.parse(localStorage.getItem(key));
                        if (data && typeof data === 'object') {
                            if (data.title && data.title.toLowerCase().includes(title.toLowerCase())) {
                                return data.id || data.tmdb_id;
                            }
                            if (data.name && data.name.toLowerCase().includes(title.toLowerCase())) {
                                return data.id || data.tmdb_id;
                            }
                            if (data.original_title && data.original_title.toLowerCase().includes(title.toLowerCase())) {
                                return data.id || data.tmdb_id;
                            }
                        }
                    } catch (e) {
                    }
                }
            }
            if (window.Lampa && window.Lampa.Storage) {
                var activeData = window.Lampa.Storage.get('active_movie') || window.Lampa.Storage.get('active_tv');
                if (activeData && activeData.title && activeData.title.toLowerCase().includes(title.toLowerCase())) {
                    return activeData.id;
                }
            }
            return null;
        } catch (e) {
            
            return null;
        }
    }
    function findIdByTitleInTMDB(title) {
        try {
            var tmdbApiKey = Lampa.Storage.get('tmdb_api_key', '');
            if (!tmdbApiKey) {
                return null;
            }
            return null;
        } catch (e) {
            
            return null;
        }
    }
    function processBatch(items, processFunc, batchSize, callback) {
        // Optimizing batch size for TV devices
        var isTv = drxaosIsTvDevice();
        batchSize = batchSize || (isTv ? 2 : 5); // Smaller batches for TV
        var index = 0;
        
        function processNextBatch() {
            var start = Date.now();
            var end = Math.min(index + batchSize, items.length);
            
            for (var i = index; i < end; i++) {
                processFunc(items[i], i);
                
                // Time Slicing: Yield if frame budget exceeded (10ms for TV, 16ms for PC)
                if (Date.now() - start > (isTv ? 8 : 14)) {
                    end = i + 1;
                    break;
                }
            }
            
            index = end;
            if (index < items.length) {
                if (window.requestIdleCallback) {
                     window.requestIdleCallback(processNextBatch);
                } else {
                     setTimeout(processNextBatch, 0); // Use setTimeout instead of rAF for background processing to unblock UI
                }
            } else if (callback) {
                callback();
            }
        }
        
        if (window.requestIdleCallback) {
             window.requestIdleCallback(processNextBatch);
        } else {
             setTimeout(processNextBatch, 0);
        }
    }
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
            }
    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }
    var requestIdleCallbackPolyfill = window.requestIdleCallback || function(cb) {
        var start = Date.now();
        return setTimeout(function() {
            cb({
                didTimeout: false,
                timeRemaining: function() {
                    return Math.max(0, 50 - (Date.now() - start));
        }
            });
        }, 1);
    };
    function revealBadge(element) {
        if (!element) return;
        element.classList.add('drxaos-badge-visible', 'show');
        element.style.display = 'inline-flex';
        element.style.removeProperty('opacity');
    }
    function drxaosConcealBadge(element) {
        if (!element) return;
        element.classList.remove('drxaos-badge-visible', 'show', 'camrip');
        element.style.display = 'inline-flex';
        element.style.opacity = '0';
    }
    window.drxaosConcealBadge = drxaosConcealBadge;
function addQualityToMiniCard(cardElement, cardData) {
    if (!drxaosIsBadgeEnabled('quality')) {
        drxaosRemoveBadgeNodes(cardElement, DRXAOS_BADGE_LOOKUP.quality && DRXAOS_BADGE_LOOKUP.quality.selectors ? DRXAOS_BADGE_LOOKUP.quality.selectors : ['.card-quality', '.card__quality']);
        if (cardElement && cardElement.dataset) {
            cardElement.dataset.drxaosQualityStatus = 'disabled';
            delete cardElement.dataset.drxaosQualityPendingSince;
        }
        return;
    }
    if (!cardData) {
        return;
    }
    addNextEpisodeInfo(cardElement, cardData);
    colorizeCardVotes(cardElement);
    var payload = cardData.payload || drxaosExtractCardPayload(cardElement);
    if (!payload) {
        var waitCount = cardElement.__drxaosQualityWait || 0;
        if (waitCount < 6) {
            cardElement.__drxaosQualityWait = waitCount + 1;
            setTimeout(function() {
                addQualityToMiniCard(cardElement, cardData);
            }, 200);
        }
    }
        removeLegacyQualityBadges(cardElement);
        var movieQualitySetting = Lampa.Storage.get('movie_quality', 'on');
        if (!CONFIG.FEATURES.JACRED_INTEGRATION || movieQualitySetting !== 'on') {
            removeLegacyQualityBadges(cardElement);
        delete cardElement.dataset.drxaosQualityStatus;
        delete cardElement.dataset.drxaosQualityPendingSince;
            return;
        }
        if (!cardData.title) {
        delete cardElement.dataset.drxaosQualityStatus;
        delete cardElement.dataset.drxaosQualityPendingSince;
            return;
        }
    var viewContainer = ensureBadgeHost(cardElement) || cardElement;
    var existingBadges = viewContainer.querySelectorAll('.card-quality, .card__quality');
        if (existingBadges.length > 1) {
            existingBadges.forEach(function(el, index) {
                if (index > 0) el.remove();
            });
        }
        var qualityElement = existingBadges[0];
        if (!qualityElement) {
            qualityElement = document.createElement('div');
            qualityElement.className = 'card-quality';
        } else {
            qualityElement.classList.add('card-quality');
            qualityElement.classList.remove('card__quality');
    }
    qualityElement.dataset.drxaosBadge = 'quality';
    drxaosAttachBadge(cardElement, qualityElement);
    qualityElement.classList.add('drxaos-badge-base');
    cardElement.dataset.drxaosQualityStatus = 'pending';
    cardElement.dataset.drxaosQualityPendingSince = String(Date.now());
    qualityElement.dataset.drxaosQualityStatus = 'pending';
    qualityElement.style.top = '0';
    qualityElement.style.right = '0';
    qualityElement.style.left = 'auto';
    qualityElement.style.bottom = 'auto';
    qualityElement.style.margin = '0';
    drxaosConcealBadge(qualityElement);
    qualityElement.dataset.drxaosQualityStatus = 'pending';
            qualityElement.textContent = '';
            qualityElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';

    var inlineQuality = extractInlineQuality(payload, cardElement);
    if (inlineQuality) {
        applyQualityBadge(qualityElement, inlineQuality);
        qualityElement.dataset.drxaosQualityStatus = 'success';
        cardElement.dataset.drxaosQualityStatus = 'success';
        delete cardElement.dataset.drxaosQualityPendingSince;
        drxaosScheduleHeroBadgeRefresh(cardElement);
    } else {
        qualityElement.dataset.drxaosQualityStatus = 'pending';
    }

    var normalizedPayload = payload ? Object.assign({}, payload) : {};
    normalizedPayload.id = normalizedPayload.id || cardData.id;
    normalizedPayload.tmdb_id = normalizedPayload.tmdb_id || cardData.tmdb_id || normalizedPayload.movie_id || normalizedPayload.tv_id;
    normalizedPayload.title = normalizedPayload.title || normalizedPayload.name || cardData.title;
    normalizedPayload.original_title = normalizedPayload.original_title || normalizedPayload.original_name || cardData.original_title;
    normalizedPayload.type = normalizedPayload.type || normalizedPayload.media_type || cardData.type;

    if (!normalizedPayload.id) {
        normalizedPayload.id = cardElement.getAttribute('data-card-id') ||
                               cardElement.getAttribute('data-id') ||
                               (cardElement.dataset && (cardElement.dataset.cardId || cardElement.dataset.id)) ||
                               cardElement.id || cardData.id || normalizedPayload.tmdb_id || '';
    }

    if (!normalizedPayload.tmdb_id) {
        normalizedPayload.tmdb_id = cardElement.getAttribute('data-tmdb-id') ||
                                    (cardElement.dataset && (cardElement.dataset.tmdbId || cardElement.dataset.tmdb)) ||
                                    normalizedPayload.id || '';
    }

    if (!normalizedPayload.type && cardElement.card_data && cardElement.card_data.type) {
        normalizedPayload.type = cardElement.card_data.type;
    }
    if (!normalizedPayload.type && (cardElement.card_data && (cardElement.card_data.seasons || cardElement.card_data.next_episode_to_air || cardElement.card_data.number_of_seasons))) {
        normalizedPayload.type = 'tv';
    }

    var uniqueId = normalizedPayload.id || normalizedPayload.tmdb_id || cardData.id || cardData.tmdb_id || cardData.title;
    var qCacheKey = (normalizedPayload.type || cardData.type || 'movie') + '_' + (normalizedPayload.tmdb_id || uniqueId || cardData.title);
        qualityElement.dataset.drxaosQualityId = qCacheKey;
        qualityElement.dataset.drxaosQuality = '1';
        var cacheQualityData = getQualityCache(qCacheKey);
    var canRequest = normalizedPayload.tmdb_id || normalizedPayload.id;
        if (cacheQualityData && cacheQualityData.quality && cacheQualityData.quality !== 'undefined' && cacheQualityData.quality !== '') {
            if (!qualityElement.isConnected) return;
        applyQualityBadge(qualityElement, cacheQualityData.quality);
        qualityElement.dataset.drxaosQualityStatus = 'success';
        cardElement.dataset.drxaosQualityStatus = 'success';
        delete cardElement.dataset.drxaosQualityPendingSince;
    } else if (canRequest) {
            queueRequest(function(done) {
            getBestReleaseFromJacred(normalizedPayload, normalizedPayload.id || cardData.id, function (result) {
                    if (!qualityElement.isConnected) {
                        done();
                        return;
                    }
                    if (result && result.quality && result.quality !== 'undefined' && result.quality !== '' && result.quality !== 'null') {
                    applyQualityBadge(qualityElement, result.quality);
                        if (result.isCamrip) {
                            qualityElement.classList.add('camrip');
                        }
                        saveQualityCache(qCacheKey, { 
                            quality: result.quality, 
                            isCamrip: result.isCamrip 
                    }, cardData.id || normalizedPayload.id);
                    qualityElement.dataset.drxaosQualityStatus = 'success';
                    cardElement.dataset.drxaosQualityStatus = 'success';
                    delete cardElement.dataset.drxaosQualityPendingSince;
                    drxaosScheduleHeroBadgeRefresh(cardElement);
                    } else {
                    if (inlineQuality) {
                        applyQualityBadge(qualityElement, inlineQuality);
                        qualityElement.dataset.drxaosQualityStatus = 'success';
                        cardElement.dataset.drxaosQualityStatus = 'success';
                        delete cardElement.dataset.drxaosQualityPendingSince;
                        drxaosScheduleHeroBadgeRefresh(cardElement);
                    } else {
                        showUnknownQualityBadge(qualityElement);
                        qualityElement.dataset.drxaosQualityStatus = 'missing';
                        cardElement.dataset.drxaosQualityStatus = 'missing';
                        delete cardElement.dataset.drxaosQualityPendingSince;
                        drxaosScheduleHeroBadgeRefresh(cardElement);
                    }
                    }
                    done();
                });
            });
    } else if (!inlineQuality) {
        showUnknownQualityBadge(qualityElement);
        qualityElement.dataset.drxaosQualityStatus = 'missing';
        cardElement.dataset.drxaosQualityStatus = 'missing';
        delete cardElement.dataset.drxaosQualityPendingSince;
        drxaosScheduleHeroBadgeRefresh(cardElement);
    }
    cardElement.__drxaosQualityWait = 0;
    }
    var requestQueue = [];
    var activeRequests = 0;
    var maxConcurrentRequests = 3;
    function processRequestQueue() {
        if (requestQueue.length === 0 || activeRequests >= maxConcurrentRequests) {
            return;
        }
        var request = requestQueue.shift();
        if (request) {
            activeRequests++;
            var timeout = setTimeout(function() {
                activeRequests--;
                processRequestQueue();
            }, 30000);
            requestAnimationFrame(function() {
                try {
                    request.execute(function() {
                        clearTimeout(timeout);
                        activeRequests--;
                        setTimeout(processRequestQueue, 10);
                    });
                } catch (e) {
                    
                    clearTimeout(timeout);
                    activeRequests--;
                    setTimeout(processRequestQueue, 10);
                }
            });
        }
        if (requestQueue.length > 0 && activeRequests < maxConcurrentRequests) {
            setTimeout(processRequestQueue, 0);
        }
    }
    function queueRequest(executeFn) {
        requestQueue.push({ execute: executeFn });
        processRequestQueue();
    }
    function resetRequestQueue() {
        requestQueue = [];
        activeRequests = 0;
    }
    resetRequestQueue();
    setTimeout(function() {
        if (activeRequests > 0) {
            activeRequests = 0;
            processRequestQueue();
        }
    }, 1000);
    setInterval(function() {
        if (activeRequests > 0 && requestQueue.length > 0) {
            activeRequests = 0;
            processRequestQueue();
        }
    }, 10000);
    function addNextEpisodeInfo(cardElement, cardData) {
        if (!drxaosIsBadgeEnabled('status')) {
            drxaosRemoveBadgeNodes(cardElement, DRXAOS_BADGE_LOOKUP.status && DRXAOS_BADGE_LOOKUP.status.selectors ? DRXAOS_BADGE_LOOKUP.status.selectors : ['.card-next-episode', '.card__next-episode', '.card__episode-date']);
            if (cardElement && cardElement.dataset) {
                cardElement.dataset.drxaosNextEpisodeStatus = 'disabled';
                delete cardElement.dataset.drxaosNextEpisodePendingSince;
            }
            if (cardElement) {
                cardElement.setAttribute('data-next-episode-processed', 'disabled');
            }
            return;
        }
        function getDaysLabel(days) {
            var n = Math.abs(days) % 100;
            var n1 = n % 10;
            if (n > 10 && n < 20) return 'дней';
            if (n1 === 1) return 'день';
            if (n1 >= 2 && n1 <= 4) return 'дня';
            return 'дней';
        }
        function resolveCompletionStatusLabel(status, type) {
            if (!status) return '';
            var normalized = String(status).trim().toLowerCase();
            if (!normalized) return '';
            if (normalized.indexOf('отмен') !== -1) return 'Отменен';
            if (normalized.indexOf('cancel') !== -1) return 'Отменен';
            if (normalized.indexOf('заверш') !== -1) return 'Завершен';
            if (normalized.indexOf('ended') !== -1) return 'Завершен';
            if (normalized.indexOf('released') !== -1) return 'Завершен';
            if (type === 'movie' && normalized.indexOf('post production') !== -1) return '';
            return '';
        }
        function normalizeRuntimeValue(value) {
            if (value == null) return 0;
            if (typeof value === 'number' && value > 0) return Math.round(value);
            if (typeof value === 'string') {
                var numbers = value.match(/\d+/g);
                if (numbers && numbers.length) {
                    var hasHoursToken = /[чh]/i.test(value) || /hour/i.test(value);
                    if (hasHoursToken) {
                        var hours = parseInt(numbers[0], 10);
                        var minutesPart = numbers.length > 1 ? parseInt(numbers[1], 10) : 0;
                        if (!isNaN(hours)) {
                            var totalMinutes = hours * 60 + (isNaN(minutesPart) ? 0 : minutesPart);
                            if (totalMinutes > 0) return totalMinutes;
                        }
                    }
                    var lastNumber = parseInt(numbers[numbers.length - 1], 10);
                    if (!isNaN(lastNumber) && lastNumber > 0) return lastNumber;
                }
            }
            if (Array.isArray(value) && value.length) {
                return normalizeRuntimeValue(value[0]);
            }
            return 0;
        }
        function resolveRuntimeMinutes(cardData, payload, dataset, cardElement) {
            var candidates = [
                cardData && cardData.runtime,
                cardData && cardData.duration,
                payload && payload.runtime,
                payload && payload.duration,
                payload && payload.movie_length,
                cardData && cardData.payload && cardData.payload.runtime,
                dataset && dataset.runtime,
                dataset && dataset.duration,
                cardElement && cardElement.getAttribute && cardElement.getAttribute('data-runtime'),
                cardElement && cardElement.getAttribute && cardElement.getAttribute('data-duration')
            ];
            for (var i = 0; i < candidates.length; i++) {
                var minutes = normalizeRuntimeValue(candidates[i]);
                if (minutes > 0) return minutes;
            }
            return 0;
        }
        function formatRuntimeMinutes(minutes) {
            var total = normalizeRuntimeValue(minutes);
            if (!total) return '';
            var hours = Math.floor(total / 60);
            var mins = total % 60;
            if (hours && mins) return hours + ' ч ' + mins + ' мин';
            if (hours && !mins) return hours + ' ч';
            return total + ' мин';
        }
        if (cardElement.hasAttribute('data-next-episode-processed')) {
            return;
        }
        cardElement.setAttribute('data-next-episode-processed', 'true');
        if (!CONFIG.FEATURES.TMDB_INTEGRATION) {
            return;
        }
        var payload = cardData.payload || drxaosExtractCardPayload(cardElement);
        if (payload && typeof payload === 'object') {
            if (!cardData.tmdb_id) {
                cardData.tmdb_id = payload.tmdb_id || payload.tmdbId || (payload.ids && payload.ids.tmdb) || payload.movie_id || payload.tv_id || payload.id || null;
            }
            if (!cardData.id) {
                cardData.id = payload.id || payload.card_id || payload.movie_id || payload.tv_id || cardData.tmdb_id;
            }
            if (!cardData.title && (payload.title || payload.name)) {
                cardData.title = payload.title || payload.name;
            }
            if (!cardData.release_date && (payload.release_date || payload.first_air_date)) {
                cardData.release_date = payload.release_date || payload.first_air_date;
            }
            if (payload.type === 'tv' || payload.media_type === 'tv' || payload.next_episode_to_air || payload.number_of_seasons || payload.seasons || payload.episodes) {
                cardData.type = 'tv';
            }
        }
        var dataset = cardElement.dataset || {};
        if (!cardData.tmdb_id) {
            cardData.tmdb_id = dataset.tmdbId || dataset.tmdb || dataset.id || cardElement.getAttribute('data-tmdb-id') || cardElement.getAttribute('data-tmdb');
    }
        if (!cardData.id) {
            cardData.id = dataset.cardId || dataset.id || cardElement.getAttribute('data-id') || cardElement.getAttribute('id');
        }
        if (!cardData.title) {
            cardData.title = cardElement.getAttribute('data-title') || cardElement.getAttribute('data-name') || '';
        }
        if (!cardData.release_date) {
            cardData.release_date = dataset.releaseDate || dataset.firstAirDate || cardElement.getAttribute('data-release-date') || cardElement.getAttribute('data-first-air-date') || '';
        }
        // Улучшенное определение типа карточки для сериалов
        if (typeof cardData.type !== 'string') {
            if (cardElement.classList && (cardElement.classList.contains('card--tv') || cardElement.classList.contains('tv'))) {
                cardData.type = 'tv';
            } else if (dataset && (dataset.type === 'tv' || dataset.mediaType === 'tv')) {
                cardData.type = 'tv';
            } else if (cardElement.getAttribute && cardElement.getAttribute('data-type') === 'tv') {
                cardData.type = 'tv';
            } else if (payload && (payload.type === 'tv' || payload.media_type === 'tv' || payload.next_episode_to_air || payload.number_of_seasons || payload.seasons || payload.episodes)) {
            cardData.type = 'tv';
            }
        }
        var isSeries = cardData.type === 'tv';
        var initialRuntimeMinutes = !isSeries ? resolveRuntimeMinutes(cardData, payload, dataset, cardElement) : 0;
        if (!isSeries && initialRuntimeMinutes && !cardData.runtime) {
            cardData.runtime = initialRuntimeMinutes;
        }
        var realTmdbId = cardData.tmdb_id || cardData.id;
        var tmdbApiKey = Lampa.Storage.get('tmdb_api_key', '');
        
        // Создаем элемент плашки заранее, чтобы можно было использовать статус из payload
        var existingStatusNodes = cardElement.querySelectorAll('.card-next-episode, .card__next-episode, .card__episode-date');
        existingStatusNodes.forEach(function(node) {
            node.remove();
        });
        var nextEpisodeElement = document.createElement('div');
        nextEpisodeElement.className = 'card-next-episode';
        nextEpisodeElement.dataset.drxaosBadge = 'next-episode';
        var bottomRow = drxaosEnsureBottomBadgeRow(cardElement);
        if (bottomRow) {
            bottomRow.appendChild(nextEpisodeElement);
        } else {
            drxaosAttachBadge(cardElement, nextEpisodeElement);
        }
        drxaosConcealBadge(nextEpisodeElement);
        nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'pending';
        cardElement.dataset.drxaosNextEpisodeStatus = 'pending';
        cardElement.dataset.drxaosNextEpisodePendingSince = String(Date.now());
        
        // Проверяем статус из payload напрямую, если это сериал (приоритет перед TMDB запросом)
        if (isSeries && payload && payload.status) {
            var statusFromPayload = resolveCompletionStatusLabel(payload.status, 'tv');
            if (statusFromPayload) {
                nextEpisodeElement.textContent = statusFromPayload;
                drxaosSafeRevealBadge(nextEpisodeElement);
                nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                delete cardElement.dataset.drxaosNextEpisodePendingSince;
                cardElement.__drxaosNextEpisodeWait = 0;
                drxaosScheduleHeroBadgeRefresh(cardElement);
                return;
            }
        }
        
        if (!tmdbApiKey) {
            // Если нет API ключа, но есть статус в payload, используем его
            if (isSeries && payload && payload.status) {
                var fallbackStatus = resolveCompletionStatusLabel(payload.status, 'tv');
                if (fallbackStatus) {
                    nextEpisodeElement.textContent = fallbackStatus;
                    drxaosSafeRevealBadge(nextEpisodeElement);
                    nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                    cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                    delete cardElement.dataset.drxaosNextEpisodePendingSince;
                    return;
                }
            }
            if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                nextEpisodeElement.remove();
            }
            cardElement.dataset.drxaosNextEpisodeStatus = 'empty';
            delete cardElement.dataset.drxaosNextEpisodePendingSince;
            return;
        }
        if (!realTmdbId && !cardData.release_date) {
            var retryCount = cardElement.__drxaosNextEpisodeWait || 0;
            if (retryCount < 6) {
                cardElement.__drxaosNextEpisodeWait = retryCount + 1;
                setTimeout(function() {
                    cardElement.removeAttribute('data-next-episode-processed');
                    addNextEpisodeInfo(cardElement, cardData);
                }, 250);
            } else {
                // Если данные не загрузились, но есть статус в payload, используем его
                if (isSeries && payload && payload.status) {
                    var finalStatus = resolveCompletionStatusLabel(payload.status, 'tv');
                    if (finalStatus) {
                        nextEpisodeElement.textContent = finalStatus;
                        drxaosSafeRevealBadge(nextEpisodeElement);
                        nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                        cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                        delete cardElement.dataset.drxaosNextEpisodePendingSince;
                    } else if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                        nextEpisodeElement.remove();
                    }
                } else if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                    nextEpisodeElement.remove();
                }
            }
            return;
        }

        var posterElement = cardElement.querySelector('.card__poster, .card-poster, .poster, .card__image, .card-image');
        var posterStyle = posterElement ? window.getComputedStyle(posterElement) : null;
        if (posterStyle && posterStyle.position === 'static') {
            posterElement.style.position = 'relative';
        }
        if (nextEpisodeElement) {
            nextEpisodeElement.classList.add('drxaos-badge-base');
        }
        if (!isSeries && initialRuntimeMinutes) {
            var initialRuntimeLabel = formatRuntimeMinutes(initialRuntimeMinutes);
            if (initialRuntimeLabel) {
                nextEpisodeElement.textContent = initialRuntimeLabel;
                drxaosSafeRevealBadge(nextEpisodeElement);
                nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                delete cardElement.dataset.drxaosNextEpisodePendingSince;
                cardElement.__drxaosNextEpisodeWait = 0;
                drxaosScheduleHeroBadgeRefresh(cardElement);
            }
        }

        // ═══ УМНАЯ ВАЛИДАЦИЯ И ПОИСК TMDB ID ═══

        // Проверка: если ID выглядит как Lampac ID (больше 7 цифр), считаем невалидным
        var isValidTmdbId = realTmdbId && 
                           !isNaN(parseInt(realTmdbId)) && 
                           parseInt(realTmdbId) > 0 && 
                           parseInt(realTmdbId) < 10000000 && // TMDB ID обычно < 1млн
                           !(typeof realTmdbId === 'string' && 
                             (realTmdbId.startsWith('unknown') || realTmdbId.startsWith('unknown_')));

        if (!isValidTmdbId) {
            // ID невалидный - пробуем найти через поиск по названию

            var title = cardData.title || cardData.name || cardData.original_name;
            var year = cardData.first_air_date ? new Date(cardData.first_air_date).getFullYear() : 
                      (cardData.year ? cardData.year : null);

            if (title) {
                searchTmdbIdByTitle(title, year, tmdbApiKey, function(foundId) {
                    if (foundId) {
                        // Нашли ID через поиск - используем его
                        realTmdbId = foundId;

                        queueRequest(function(done) {
        if (isSeries) {
                                fetchNextEpisodeInfo(realTmdbId, tmdbApiKey, function(result) {
                                    if (result && result.nextEpisodeDate) {
                                        var daysUntil = calculateDaysUntil(result.nextEpisodeDate);
                                        if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                                            if (daysUntil > 0) {
                                                nextEpisodeElement.textContent = daysUntil + ' ' + getDaysLabel(daysUntil);
                                            } else if (daysUntil === 0) {
                                                nextEpisodeElement.textContent = 'Сегодня';
                                            } else if (daysUntil === -1) {
                                                nextEpisodeElement.textContent = 'Вчера';
                                            } else {
                                                nextEpisodeElement.textContent = Math.abs(daysUntil) + ' дн. назад';
                                            }
                                            drxaosSafeRevealBadge(nextEpisodeElement);
                                            nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                                            cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                                            delete cardElement.dataset.drxaosNextEpisodePendingSince;
                                            drxaosScheduleHeroBadgeRefresh(cardElement);
                                        }
                                    } else {
                                        if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                                            nextEpisodeElement.remove();
                                        }
                                        cardElement.dataset.drxaosNextEpisodeStatus = 'empty';
                                        delete cardElement.dataset.drxaosNextEpisodePendingSince;
                                        drxaosScheduleHeroBadgeRefresh(cardElement);
                                    }
                                    done();
                                });
                            } else {
                                done();
                            }
                        });
                    } else {
                        // Не нашли через поиск - удаляем плашку
                        if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                            nextEpisodeElement.remove();
                        }
                        cardElement.dataset.drxaosNextEpisodeStatus = 'empty';
                        delete cardElement.dataset.drxaosNextEpisodePendingSince;
                        drxaosScheduleHeroBadgeRefresh(cardElement);
                    }
                });
            } else {
                // Нет названия для поиска
                if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                    nextEpisodeElement.remove();
                }
                cardElement.dataset.drxaosNextEpisodeStatus = 'empty';
                delete cardElement.dataset.drxaosNextEpisodePendingSince;
                drxaosScheduleHeroBadgeRefresh(cardElement);
            }
            return;
        }

        // ID валидный - используем напрямую

        queueRequest(function(done) {
        if (cardData.type === 'tv') {
            fetchNextEpisodeInfo(realTmdbId, tmdbApiKey, function(result) {
                if (result && result.nextEpisodeDate) {
                    var daysUntil = calculateDaysUntil(result.nextEpisodeDate);
                    if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                        if (daysUntil > 0) {
                            nextEpisodeElement.textContent = daysUntil + ' ' + getDaysLabel(daysUntil);
                        } else if (daysUntil === 0) {
                            nextEpisodeElement.textContent = 'Сегодня';
                        } else {
                        nextEpisodeElement.textContent = 'Идёт';
                        }
                        drxaosSafeRevealBadge(nextEpisodeElement);
                        nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                        cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                        delete cardElement.dataset.drxaosNextEpisodePendingSince;
                        cardElement.__drxaosNextEpisodeWait = 0;
                        drxaosScheduleHeroBadgeRefresh(cardElement);
                    }
                        done();
                } else {
                    fetchSeriesInfo(realTmdbId, tmdbApiKey, function(seriesResult) {
                        if (seriesResult && seriesResult.lastAirDate) {
                            var daysUntil = calculateDaysUntil(seriesResult.lastAirDate);
                            if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                            if (daysUntil > 0) {
                                nextEpisodeElement.textContent = daysUntil + ' ' + getDaysLabel(daysUntil);
                            } else if (daysUntil === 0) {
                                nextEpisodeElement.textContent = 'Сегодня';
                            } else {
                                var completionLabelDirect = resolveCompletionStatusLabel(seriesResult && seriesResult.status, 'tv');
                                nextEpisodeElement.textContent = completionLabelDirect || 'Идёт';
                                }
                            drxaosSafeRevealBadge(nextEpisodeElement);
                            nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                            cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                            delete cardElement.dataset.drxaosNextEpisodePendingSince;
                            cardElement.__drxaosNextEpisodeWait = 0;
                            drxaosScheduleHeroBadgeRefresh(cardElement);
                            }
                        } else if (seriesResult && seriesResult.status) {
                            var onlyStatusLabel = resolveCompletionStatusLabel(seriesResult.status, 'tv');
                            if (onlyStatusLabel) {
                                nextEpisodeElement.textContent = onlyStatusLabel;
                                drxaosSafeRevealBadge(nextEpisodeElement);
                                nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                                cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                                delete cardElement.dataset.drxaosNextEpisodePendingSince;
                                cardElement.__drxaosNextEpisodeWait = 0;
                                drxaosScheduleHeroBadgeRefresh(cardElement);
                            } else {
                                if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                                nextEpisodeElement.remove();
                            }
                            cardElement.dataset.drxaosNextEpisodeStatus = 'empty';
                            delete cardElement.dataset.drxaosNextEpisodePendingSince;
                            drxaosScheduleHeroBadgeRefresh(cardElement);
                            }
                        } else {
                            if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                            nextEpisodeElement.remove();
                        }
                        cardElement.dataset.drxaosNextEpisodeStatus = 'empty';
                        delete cardElement.dataset.drxaosNextEpisodePendingSince;
                        drxaosScheduleHeroBadgeRefresh(cardElement);
                        }
                            done();
                    });
                }
            });
        } else if (!isSeries) {
            fetchMovieReleaseDate(realTmdbId, tmdbApiKey, function(result) {
                var runtimeFromResult = result && normalizeRuntimeValue(result.runtime);
                if (runtimeFromResult) {
                    cardData.runtime = runtimeFromResult;
                }
                var effectiveRuntime = resolveRuntimeMinutes(cardData, payload, dataset, cardElement);
                var displayText = '';
                if (effectiveRuntime) {
                    displayText = formatRuntimeMinutes(effectiveRuntime);
                } else if (result && result.releaseDate) {
                    var daysUntil = calculateDaysUntil(result.releaseDate);
                    if (daysUntil > 0) {
                        displayText = daysUntil + ' ' + getDaysLabel(daysUntil);
                    } else if (daysUntil === 0) {
                        displayText = 'Сегодня';
                    } else {
                        var completionLabelMovie = resolveCompletionStatusLabel(result && result.status, 'movie');
                        displayText = completionLabelMovie || 'Идёт';
                    }
                } else if (result && result.status) {
                    var statusLabel = resolveCompletionStatusLabel(result.status, 'movie');
                    displayText = statusLabel || 'Идёт';
                }
                if (!displayText && initialRuntimeMinutes) {
                    displayText = formatRuntimeMinutes(initialRuntimeMinutes);
                }
                if (!displayText && result && result.releaseDate) {
                    var fallbackDays = calculateDaysUntil(result.releaseDate);
                    if (fallbackDays > 0) {
                        displayText = fallbackDays + ' ' + getDaysLabel(fallbackDays);
                    }
                }
                if (displayText && nextEpisodeElement && nextEpisodeElement.parentNode) {
                    nextEpisodeElement.textContent = displayText;
                    drxaosSafeRevealBadge(nextEpisodeElement);
                    nextEpisodeElement.dataset.drxaosNextEpisodeStatus = 'success';
                    cardElement.dataset.drxaosNextEpisodeStatus = 'success';
                    delete cardElement.dataset.drxaosNextEpisodePendingSince;
                    cardElement.__drxaosNextEpisodeWait = 0;
                    drxaosScheduleHeroBadgeRefresh(cardElement);
                } else {
                    if (nextEpisodeElement && nextEpisodeElement.parentNode) {
                        nextEpisodeElement.remove();
                    }
                    cardElement.dataset.drxaosNextEpisodeStatus = 'empty';
                    delete cardElement.dataset.drxaosNextEpisodePendingSince;
                    drxaosScheduleHeroBadgeRefresh(cardElement);
                }
                done();
            });
        }
        });
    }
    function fetchSeriesInfo(tmdbId, apiKey, callback) {
        if (!tmdbId || (typeof tmdbId === 'string' && tmdbId.startsWith('unknown_')) || isNaN(parseInt(tmdbId))) {
            callback(null);
            return;
        }
        var store = getTmdbCacheStore();
        var cacheKey = TMDB_CACHE_KEY_PREFIX.SERIES_INFO + tmdbId;
        var cached = store.get(cacheKey);
        if (cached) {
            callback(cached);
            return;
        }
        var url = (Lampa.TMDB && typeof Lampa.TMDB.api === 'function') ? Lampa.TMDB.api('tv/' + tmdbId + '?api_key=' + apiKey + '&language=ru') : 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + apiKey + '&language=ru';
        fetch(url)
            .then(function(response) {
                if (!response.ok) throw new Error('HTTP error');
                return response.json();
            })
            .then(function(data) {
                var payload = {};
                if (data.last_air_date) {
                    payload.lastAirDate = data.last_air_date;
                } else if (data.first_air_date) {
                    payload.lastAirDate = data.first_air_date;
                }
                if (data.status) {
                    payload.status = data.status;
                }
                if (payload.lastAirDate || payload.status) {
                    store.set(cacheKey, payload);
                    callback(payload);
                } else {
                    callback(null);
                }
            })
            .catch(function() {
                callback(null);
            });
    }
    function fetchMovieReleaseDate(tmdbId, apiKey, callback) {
        if (!tmdbId || (typeof tmdbId === 'string' && tmdbId.startsWith('unknown_')) || isNaN(parseInt(tmdbId))) {
            callback(null);
            return;
        }
        var store = getTmdbCacheStore();
        var cacheKey = TMDB_CACHE_KEY_PREFIX.MOVIE_RELEASE + tmdbId;
        var cached = store.get(cacheKey);
        if (cached) {
            callback(cached);
            return;
        }
        var url = (Lampa.TMDB && typeof Lampa.TMDB.api === 'function') ? Lampa.TMDB.api('movie/' + tmdbId + '?api_key=' + apiKey + '&language=ru') : 'https://api.themoviedb.org/3/movie/' + tmdbId + '?api_key=' + apiKey + '&language=ru';
        fetch(url)
            .then(function(response) {
                if (!response.ok) throw new Error('HTTP error');
                return response.json();
            })
            .then(function(data) {
                if (data.release_date || data.status || data.runtime) {
                    var payload = {
                        releaseDate: data.release_date,
                        status: data.status,
                        runtime: data.runtime
                    };
                    store.set(cacheKey, payload);
                    callback(payload);
                } else {
                    callback(null);
                }
            })
            .catch(function() {
                callback(null);
            });
    }
    // ═══ ПОИСК TMDB ID ПО НАЗВАНИЮ (ФОЛБЭК) ═══
    function searchTmdbIdByTitle(title, year, apiKey, callback) {
        if (!title || !apiKey) {
            callback(null);
            return;
        }

        // Очищаем название от лишних символов
        var cleanTitle = title.replace(/[\[\]()]/g, '').trim();
        var searchUrl = (Lampa.TMDB && typeof Lampa.TMDB.api === 'function') ? Lampa.TMDB.api('search/tv?api_key=' + apiKey + '&language=ru&query=' + encodeURIComponent(cleanTitle)) : 'https://api.themoviedb.org/3/search/tv?api_key=' + apiKey + '&language=ru&query=' + encodeURIComponent(cleanTitle);

        if (year) {
            searchUrl += '&first_air_date_year=' + year;
        }


        fetch(searchUrl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('TMDB Search API error: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                if (data.results && data.results.length > 0) {
                    var foundId = data.results[0].id;
                    callback(foundId);
                } else {
                    callback(null);
                }
            })
            .catch(function(error) {
                callback(null);
            });
    }

    function fetchNextEpisodeInfo(tmdbId, apiKey, callback) {
        if (!tmdbId || (typeof tmdbId === 'string' && tmdbId.startsWith('unknown_')) || isNaN(parseInt(tmdbId))) {
            callback(null);
            return;
        }
        var store = getTmdbCacheStore();
        var cacheKey = TMDB_CACHE_KEY_PREFIX.NEXT_EPISODE + tmdbId;
        var cached = store.get(cacheKey);
        if (cached) {
            callback(cached);
            return;
        }
        var url = (Lampa.TMDB && typeof Lampa.TMDB.api === 'function') ? Lampa.TMDB.api('tv/' + tmdbId + '?api_key=' + apiKey + '&language=ru') : 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + apiKey + '&language=ru';
        fetch(url)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('TMDB API error: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                if (data.next_episode_to_air) {
                    var payload = {
                        nextEpisodeDate: data.next_episode_to_air.air_date,
                        episodeNumber: data.next_episode_to_air.episode_number,
                        seasonNumber: data.next_episode_to_air.season_number
                    };
                    store.set(cacheKey, payload);
                    callback(payload);
                } else {
                    callback(null);
                }
            })
            .catch(function(error) {
                callback(null);
            });
    }
    function calculateDaysUntil(dateString) {
        var targetDate = new Date(dateString);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        var diffTime = targetDate.getTime() - today.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    function initCardListener() {
        if (window.drxaos_card_listener_initialized) {
            return;
        }
        
        // Проверка версии Lampa
        var isLampa3 = window.Lampa && window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300;
        
        if (!window.Lampa) {
            setTimeout(initCardListener, 100);
            return;
        }
        
        // Для Lampa 3.0+ используем модульную систему
        if (isLampa3) {
            // В Lampa 3.0 используется событийная система через Lampa.Listener
            // Карточки создаются через Lampa.Maker, события автоматически доступны
            window.drxaos_card_listener_initialized = true;
            
            return;
        }
        
        // Для старых версий используем старый метод
        if (!window.Lampa.Card || !window.Lampa.Card.prototype) {
            setTimeout(initCardListener, 100);
            return;
        }
        
        window.drxaos_card_listener_initialized = true;
        Object.defineProperty(window.Lampa.Card.prototype, 'build', {
            get: function() {
                return this._build;
            },
            set: function(value) {
                this._build = function() {
                    value.apply(this);
                    Lampa.Listener.send('card', {
                        type: 'build',
                        object: this
                    });
                }.bind(this);
            }
        });
    }
    initCardListener();
    Lampa.Listener.follow('card', function(event) {
        if (event.type === 'build' && event.object && event.object.card && event.object.data) {
            var cardElement = null;
            if (event.object.card instanceof jQuery || event.object.card.jquery) {
                cardElement = event.object.card[0];
            } else if (event.object.card instanceof HTMLElement) {
                cardElement = event.object.card;
            } else if (typeof event.object.card === 'object' && event.object.card.nodeType === 1) {
                cardElement = event.object.card;
            }
            var cardData = event.object.data;
            if (cardElement && cardData) {
                var normalizedData = {
                    id: cardData.id,
                    tmdb_id: cardData.id,
                    title: cardData.title || cardData.name || '',
                    original_title: cardData.original_title || cardData.original_name || '',
                    type: cardData.name ? 'tv' : 'movie',
                    release_date: cardData.release_date || cardData.first_air_date || '',
                    payload: cardData
                };
                storage.set(cardElement, normalizedData);
                drxaosRememberCardData(cardElement, normalizedData);
            }
        }
    });
    if (window.drxaosGlobalObserver) {
        window.drxaosQualityHandler = function(mutations) {
            var hasNewCards = false;
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (mutation.type === 'childList') {
                    var addedNodes = mutation.addedNodes;
                    for (var j = 0; j < addedNodes.length; j++) {
                        var node = addedNodes[j];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('card')) {
                                hasNewCards = true;
                            } else if (node.querySelector && node.querySelector('.card')) {
                                hasNewCards = true;
                            }
                        }
                    }
                }
            }
            if (hasNewCards) {
                drxaosScheduleProcessAllCards();
                drxaosScheduleProcessAllCards(0);
            }
        };
    } else {
        var observer = new MutationObserver(function(mutations) {
            var hasNewCards = false;
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (mutation.type === 'childList') {
                    var addedNodes = mutation.addedNodes;
                    for (var j = 0; j < addedNodes.length; j++) {
                        var node = addedNodes[j];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('card')) {
                                hasNewCards = true;
                            } else if (node.querySelector && node.querySelector('.card')) {
                                hasNewCards = true;
                            }
                        }
                    }
                }
            }
            if (hasNewCards) {
                drxaosScheduleProcessAllCards();
                drxaosScheduleProcessAllCards(0);
            }
        });
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }
    drxaosScheduleProcessAllCards(100);
    
    // Дополнительная обработка для Android Mobile
    if (document.body.classList.contains('drxaos-android-mobile')) {
        setTimeout(function() {
            drxaosScheduleProcessAllCards();
        }, 500);
        setTimeout(function() {
            drxaosScheduleProcessAllCards();
        }, 2000);
    }
}
function drxaosIsTitleLogoEnabled() {
    return Lampa.Storage.get('drxaos_logo_titles', 'off') === 'on';
}
function drxaosResetTitleLogoCache() {
    DRXAOS_TITLE_LOGO_CACHE = {};
    DRXAOS_TITLE_LOGO_PENDING = {};
}
function drxaosClearRenderedTitleLogos() {
    if (!window.jQuery) return;
    window.jQuery('.drxaos-has-logo').each(function() {
        var $node = window.jQuery(this);
        var original = $node.data('drxaos-title-text');
        if (typeof original !== 'undefined') {
            $node.text(original);
            $node.removeData('drxaos-title-text');
        }
        $node.removeClass('drxaos-has-logo');
    });
}
function drxaosGetTitleNode(render) {
    if (!render || !render.find) return null;
    var node = render.find('.full-start-new__title').first();
    return node && node.length ? node : null;
}
function drxaosRestoreTitleLogo(render) {
    var titleNode = drxaosGetTitleNode(render);
    if (!titleNode) return;
    var original = titleNode.data('drxaos-title-text');
    if (typeof original !== 'undefined') {
        titleNode.text(original);
        titleNode.removeData('drxaos-title-text');
    }
    titleNode.removeClass('drxaos-has-logo');
}
function drxaosSetTitleLogoContent(render, imgUrl, altText) {
    var titleNode = drxaosGetTitleNode(render);
    if (!titleNode) return;
    if (!imgUrl) {
        drxaosRestoreTitleLogo(render);
        return;
    }
    if (typeof titleNode.data('drxaos-title-text') === 'undefined') {
        titleNode.data('drxaos-title-text', titleNode.text());
    }
    var img = document.createElement('img');
    img.className = 'drxaos-title-logo';
    img.src = imgUrl;
    img.alt = altText || '';
    img.style.maxHeight = '125px';
    img.style.marginTop = '5px';
    img.style.objectFit = 'contain';
    titleNode.empty().append(img).addClass('drxaos-has-logo');
    requestAnimationFrame(function() {
        img.classList.add('visible');
    });
}
function drxaosGetTitleLogoMeta(movie) {
    if (!movie) return null;
    var id = movie.id || movie.tmdb_id;
    if (!id) return null;
    var type = movie.name ? 'tv' : 'movie';
    return { id: id, type: type, cacheKey: type + '_' + id };
}
function drxaosNormalizeLogoMovie(movie) {
    if (!movie) return null;
    if (movie.id) return movie;
    if (movie.tmdb_id) {
        return Object.assign({}, movie, { id: movie.tmdb_id });
    }
    return null;
}
function drxaosLoadTitleLogo(movie) {
    var normalized = drxaosNormalizeLogoMovie(movie);
    if (!normalized) return Promise.resolve(null);
    var meta = drxaosGetTitleLogoMeta(normalized);
    if (!meta) return Promise.resolve(null);
    if (DRXAOS_TITLE_LOGO_CACHE.hasOwnProperty(meta.cacheKey)) {
        return Promise.resolve(DRXAOS_TITLE_LOGO_CACHE[meta.cacheKey]);
    }
    if (DRXAOS_TITLE_LOGO_PENDING[meta.cacheKey]) {
        return DRXAOS_TITLE_LOGO_PENDING[meta.cacheKey];
    }
    var pending = drxaosFetchTitleLogoData(normalized, meta.type).then(function(result) {
        DRXAOS_TITLE_LOGO_CACHE[meta.cacheKey] = result;
        return result;
    }).catch(function() {
        DRXAOS_TITLE_LOGO_CACHE[meta.cacheKey] = null;
        return null;
    }).finally(function() {
        delete DRXAOS_TITLE_LOGO_PENDING[meta.cacheKey];
    });
    DRXAOS_TITLE_LOGO_PENDING[meta.cacheKey] = pending;
    return pending;
}
function drxaosPrefetchTitleLogo(cardData) {
    if (!drxaosIsTitleLogoEnabled()) return;
    if (!cardData) return;
    var tmdbId = cardData.tmdb_id || cardData.id;
    if (!tmdbId) return;
    var logoCandidate = {
        tmdb_id: tmdbId,
        id: tmdbId
    };
    if (cardData.type === 'tv') {
        logoCandidate.name = cardData.title || cardData.original_title || '';
    } else {
        logoCandidate.title = cardData.title || cardData.original_title || '';
    }
    var normalized = drxaosNormalizeLogoMovie(logoCandidate);
    if (!normalized) return;
    var meta = drxaosGetTitleLogoMeta(normalized);
    if (!meta) return;
    if (DRXAOS_TITLE_LOGO_CACHE.hasOwnProperty(meta.cacheKey) || DRXAOS_TITLE_LOGO_PENDING[meta.cacheKey]) return;
    drxaosLoadTitleLogo(normalized);
}
function drxaosGetPreferredLanguageCode() {
    var language = (Lampa.Storage.get('language', 'en') || 'en').toLowerCase();
    return (language.split('-')[0] || language || 'en').toLowerCase();
}
    function drxaosSelectLogoPath(logos, langShort) {
        if (!logos || !logos.length) return null;
        var normalizedLang = (langShort || '').toLowerCase();
        var priority = [];
        var seen = {};
        function pushLang(lang) {
            var key = lang === null ? 'null' : String(lang);
            if (seen[key]) return;
            seen[key] = true;
            priority.push(lang);
        }
        // Improved priority: User Lang -> English -> Russian -> Others (Inspired by logo.js)
        if (normalizedLang) pushLang(normalizedLang);
        pushLang('en');
        pushLang('ru');
        pushLang('uk');
        pushLang('');
        pushLang(null);
        for (var i = 0; i < priority.length; i++) {
        var lang = priority[i];
        var match = logos.find(function(logo) {
            var code = (logo.iso_639_1 === null || typeof logo.iso_639_1 === 'undefined') ? null : String(logo.iso_639_1).toLowerCase();
            if (lang === null) {
                return code === null || code === '' || code === 'null';
            }
            return code === lang;
    });
        if (match) {
            return match.file_path;
        }
    }
    return logos[0].file_path;
}
function drxaosFetchTitleLogoData(movie, type) {
    return new Promise(function(resolve, reject) {
        if (!window.Lampa || !Lampa.TMDB || typeof Lampa.TMDB.api !== 'function') {
            reject('TMDB unavailable');
            return;
        }
        var apiKey = typeof Lampa.TMDB.key === 'function' ? Lampa.TMDB.key() : '';
        if (!apiKey) {
            reject('TMDB key missing');
            return;
        }
        var language = Lampa.Storage.get('language', 'en') || 'en';
        var langShort = drxaosGetPreferredLanguageCode();
        var includeLangParam = langShort + ',en,null';
        var query = type + '/' + movie.id + '/images?api_key=' + apiKey + '&language=' + language + '&include_image_language=' + includeLangParam;
        var url = Lampa.TMDB.api(query);
        fetch(url).then(function(response) {
            if (!response.ok) throw new Error('TMDB status ' + response.status);
            return response.json();
        }).then(function(data) {
            var path = drxaosSelectLogoPath(data && data.logos, langShort);
            if (!path) {
                resolve(null);
                return;
            }
            resolve({
                url: Lampa.TMDB.image('/t/p/original' + path.replace('.svg', '.png')),
                alt: movie.title || movie.name || movie.original_title || ''
            });
        }).catch(function(err) {
            reject(err);
        });
    });
}
function drxaosApplyTitleLogoForRender(movie, render) {
    if (!render || !movie || !movie.id) {
        drxaosRestoreTitleLogo(render);
        return;
    }
    var normalized = drxaosNormalizeLogoMovie(movie);
    if (!normalized) {
        drxaosRestoreTitleLogo(render);
        return;
    }
    var meta = drxaosGetTitleLogoMeta(normalized);
    if (!meta) {
        drxaosRestoreTitleLogo(render);
        return;
    }
    if (DRXAOS_TITLE_LOGO_CACHE.hasOwnProperty(meta.cacheKey)) {
        var cached = DRXAOS_TITLE_LOGO_CACHE[meta.cacheKey];
        if (cached && drxaosIsTitleLogoEnabled()) {
            drxaosSetTitleLogoContent(render, cached.url, cached.alt);
        } else {
            drxaosRestoreTitleLogo(render);
        }
        return;
    }
    drxaosLoadTitleLogo(normalized).then(function(result) {
        if (result && drxaosIsTitleLogoEnabled()) {
            drxaosSetTitleLogoContent(render, result.url, result.alt);
        } else {
            drxaosRestoreTitleLogo(render);
        }
    }).catch(function() {
        drxaosRestoreTitleLogo(render);
    });
}
function drxaosHandleTitleLogo(movie, render) {
    if (!render) return;
    if (!drxaosIsTitleLogoEnabled()) {
        drxaosRestoreTitleLogo(render);
        return;
    }
    drxaosApplyTitleLogoForRender(movie, render);
}
function drxaosIsOriginalTitleEnabled() {
    return Lampa.Storage.get('drxaos_original_titles', 'off') === 'on';
}
function drxaosResetOriginalNamesCache() {
    DRXAOS_ORIGINAL_NAME_CACHE = {};
    DRXAOS_ORIGINAL_NAME_PENDING = {};
}
function drxaosClearOriginalNameBlock(render) {
    var target = render;
    if (!target) {
        try {
            var activity = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active().activity : null;
            target = activity ? activity.render() : null;
        } catch (e) {
            target = null;
        }
    }
    if (!target || !target.find) return;
    var block = target.find('.drxaos-original-title-block');
    if (!block || !block.length) return;
    if (typeof block.not === 'function') {
        block = block.not('.hero');
        if (!block.length) return;
        block.remove();
    } else {
        var toRemove = [];
        block.each ? block.each(function() {
            if (!this.classList || this.classList.contains('hero')) return;
            toRemove.push(this);
        }) : Array.prototype.forEach.call(block, function(el) {
            if (!el.classList || el.classList.contains('hero')) return;
            toRemove.push(el);
        });
        toRemove.forEach(function(node) {
            if (node && node.parentNode) node.parentNode.removeChild(node);
        });
    }
}
function drxaosSetOriginalNameBlock(render, data) {
    if (!render || !render.find) return;
    drxaosClearOriginalNameBlock(render);
    if (!data) return;
    var template = drxaosBuildOriginalTitleTemplate(data);
    if (!template) return;
    var block = document.createElement('div');
    block.className = 'drxaos-original-title-block';
    block.innerHTML = template;
    render.find('.full-start-new__title').after(block);
}
function drxaosSanitizeOriginalTitle(str) {
    return (str || '').toString().replace(/[<>&]/g, '').trim();
    }
function drxaosBuildOriginalTitleTemplate(data) {
    if (!data) return '';
    var ru = drxaosSanitizeOriginalTitle(data.ruTitle);
    var en = drxaosSanitizeOriginalTitle(data.enTitle);
    var orig = drxaosSanitizeOriginalTitle(data.origTitle);
    if (orig && (orig.toLowerCase() === ru.toLowerCase() || orig.toLowerCase() === en.toLowerCase())) {
        orig = '';
    }
    if (en && ru && en.toLowerCase() === ru.toLowerCase()) {
        en = '';
    }
    var lines = [];
    if (ru) lines.push('<div class="drxaos-xu-info__tag drxaos-hero-tag">Ru: ' + ru + '</div>');
    if (en) lines.push('<div class="drxaos-xu-info__tag drxaos-hero-tag">En: ' + en + '</div>');
    if (orig) lines.push('<div class="drxaos-xu-info__tag drxaos-hero-tag">Orig: ' + orig + '</div>');
    return lines.join('');
}
function drxaosComposeOriginalTitleData(payload, cardElement) {
    var dataset = (cardElement && cardElement.dataset) || {};
    var resolvedType = (payload && (payload.name ? 'tv' : 'movie')) ||
                       (dataset.type ? dataset.type : '');
    var result = {
        ruTitle: drxaosSanitizeOriginalTitle(
            (payload && (payload.title_ru || payload.name_ru || payload.ruTitle || payload.ru_title)) ||
            dataset.titleRu || dataset.nameRu || dataset.title_ru || dataset.name_ru || ''
        ),
        enTitle: drxaosSanitizeOriginalTitle(
            (payload && (payload.title_en || payload.name_en || payload.title || payload.name)) ||
            dataset.titleEn || dataset.nameEn || dataset.title || dataset.name || ''
        ),
        origTitle: drxaosSanitizeOriginalTitle(
            (payload && (payload.original_title || payload.original_name || payload.origTitle)) ||
            dataset.originalTitle || dataset.originalName || dataset.origTitle || dataset.orig || ''
        )
    };
    var id = payload && (payload.id || payload.tmdb_id) ||
             dataset.id || dataset.cardId || dataset.movieId || dataset.tvId ||
             (cardElement && cardElement.getAttribute ? (cardElement.getAttribute('data-id') ||
                                                         cardElement.getAttribute('data-card-id') ||
                                                         cardElement.getAttribute('data-movie-id') ||
                                                         cardElement.getAttribute('data-tv-id') || '') : '');
    var type = resolvedType;
    if (id) {
        var cacheKey = (type || 'movie') + '_' + id;
        var cached = DRXAOS_ORIGINAL_NAME_CACHE[cacheKey];
        if (cached) {
            if (!result.ruTitle && cached.ruTitle) result.ruTitle = drxaosSanitizeOriginalTitle(cached.ruTitle);
            if (!result.enTitle && cached.enTitle) result.enTitle = drxaosSanitizeOriginalTitle(cached.enTitle);
            if (!result.origTitle && cached.origTitle) result.origTitle = drxaosSanitizeOriginalTitle(cached.origTitle);
            return result;
        }
    }
    return result;
}
function drxaosFetchOriginalNames(movie, type) {
    return new Promise(function(resolve) {
        if (!movie || !movie.id || !window.Lampa || !Lampa.TMDB) {
            resolve(null);
            return;
        }
        var cacheKey = type + '_' + movie.id;
        if (DRXAOS_ORIGINAL_NAME_CACHE.hasOwnProperty(cacheKey)) {
            resolve(DRXAOS_ORIGINAL_NAME_CACHE[cacheKey]);
            return;
        }
        if (DRXAOS_ORIGINAL_NAME_PENDING[cacheKey]) {
            DRXAOS_ORIGINAL_NAME_PENDING[cacheKey].then(resolve);
            return;
        }
        var tmdbKey = (Lampa.Storage.get('tmdb_api_key') || BUILTIN_TMDB_KEY || '').trim();
        if (!tmdbKey) {
            resolve(null);
            return;
        }
        var languages = ['en-US', 'ru-RU'];
        var promises = languages.map(function(lang) {
            var query = type + '/' + movie.id + '?language=' + lang + '&api_key=' + tmdbKey;
            var url = Lampa.TMDB.api(query);
            return fetch(url).then(function(response) {
                if (!response.ok) throw new Error('TMDB status ' + response.status);
                return response.json();
            }).catch(function() {
                return null;
            });
        });
        var pending = Promise.all(promises).then(function(results) {
            var enData = results[0] || {};
            var ruData = results[1] || {};
            var payload = {
                enTitle: enData.title || enData.name || '',
                ruTitle: ruData.title || ruData.name || '',
                origTitle: movie.original_title || movie.original_name || enData.original_title || enData.original_name || ''
            };
            DRXAOS_ORIGINAL_NAME_CACHE[cacheKey] = payload;
            return payload;
        }).catch(function() {
            DRXAOS_ORIGINAL_NAME_CACHE[cacheKey] = null;
            return null;
        }).finally(function() {
            delete DRXAOS_ORIGINAL_NAME_PENDING[cacheKey];
        });
        DRXAOS_ORIGINAL_NAME_PENDING[cacheKey] = pending;
        pending.then(resolve).catch(function() {
            resolve(null);
        });
    });
}
function drxaosHandleOriginalNames(movie, render) {
    if (!render) return;
    drxaosClearOriginalNameBlock(render);
    if (!drxaosIsOriginalTitleEnabled()) return;
    if (!movie || !movie.id) return;
    var type = movie.name ? 'tv' : 'movie';
    drxaosFetchOriginalNames(movie, type).then(function(result) {
        if (!result) return;
        drxaosSetOriginalNameBlock(render, result);
    });
}
function drxaosEnsureHeroPanel(activity) {
        if (drxaosUsingMakerXuyampishe()) return null;
        if (!activity || !drxaosIsXuyampisheEnabled()) return null;
    if (activity.classList && activity.classList.contains('activity--modal')) return null;
    var activityBody = activity.querySelector('.activity__body') || activity;
    if (!activityBody) return null;
    var scrollWrapper = activityBody.querySelector('.scroll');
    if (!scrollWrapper) return null;
    if (!activityBody.querySelector('.items-line')) return null;
    var slot = activityBody.querySelector('.drxaos-hero-slot');
    if (!slot) {
        slot = document.createElement('div');
        slot.className = 'drxaos-hero-slot';
        scrollWrapper.parentNode.insertBefore(slot, scrollWrapper);
    }
    var hero = slot.querySelector('.drxaos-hero-panel');
    if (!hero) {
        hero = document.createElement('div');
        hero.className = 'drxaos-hero-panel hidden';
        hero.innerHTML = '' +
            '<div class="drxaos-hero-bg"></div>' +
            '<div class="drxaos-hero-overlay"></div>' +
            '<div class="drxaos-hero-content">' +
                '<div class="drxaos-hero-text">' +
                    '<div class="drxaos-hero-meta"></div>' +
                    '<div class="drxaos-hero-title" aria-live="polite"></div>' +
                    '<div class="drxaos-hero-tags"></div>' +
                    '<div class="drxaos-hero-description"></div>' +
                '</div>' +
            '</div>';
        slot.appendChild(hero);
    }
    activity.classList.add('drxaos-heroized');
    drxaosEnsureActiveLine(activity);
    drxaosBindActivityWheel(activity);
    return hero;
}
function drxaosExtractCardPayload(cardElement) {
    if (!cardElement) return null;
    var stored = drxaosGetCardDataStorage().get(cardElement);
    if (stored && stored.raw) return stored.raw;
    if (stored) return stored;
    if (cardElement.card_data) return cardElement.card_data;
    if (cardElement.card && cardElement.card.data) return cardElement.card.data;
    var parsed = drxaosSafeGetCardData(cardElement);
    if (parsed) return parsed;
    return null;
}
    function drxaosBuildHeroMeta(card) {
        var parts = [];
        var year = (card.release_date || card.first_air_date || '').slice(0, 4);
        if (year) parts.push(year);
        var countries = card.production_countries || card.origin_country;
        if (Array.isArray(countries) && countries.length) {
            var normalized = countries.map(function(country) {
                if (!country) return '';
                if (typeof country === 'string') return country;
                return country.name || country.iso_3166_1 || '';
            }).filter(Boolean);
            if (normalized.length) {
                parts.push(normalized.slice(0, 2).join(', '));
            }
        } else if (typeof countries === 'string' && countries.trim()) {
            parts.push(countries.trim());
        }
        var runtime = card.runtime || (Array.isArray(card.episode_run_time) && card.episode_run_time[0]);
        if (runtime) parts.push(runtime + ' мин');
    var age = card.adult ? '18+' : card.certification || '';
    if (age) parts.push(age);
    return parts.join(' • ');
}
var DRXAOS_GENRE_NAME_MAP = {
    '28': 'Боевик',
    '12': 'Приключения',
    '16': 'Анимация',
    '35': 'Комедия',
    '80': 'Криминал',
    '99': 'Документальный',
    '18': 'Драма',
    '10751': 'Семейный',
    '14': 'Фэнтези',
    '36': 'История',
    '27': 'Ужасы',
    '10402': 'Музыка',
    '9648': 'Детектив',
    '10749': 'Мелодрама',
    '878': 'Фантастика',
    '10752': 'Военный',
    '53': 'Триллер',
    '10770': 'Телефильм',
    '37': 'Вестерн',
    '10759': 'Боевик и приключения',
    '10762': 'Детям',
    '10763': 'Новости',
    '10764': 'Реалити-шоу',
    '10765': 'Научная фантастика и фэнтези',
    '10766': 'Мыльная опера',
    '10767': 'Ток-шоу',
    '10768': 'Война и политика',
    '10769': 'Зарубежный'
};
function drxaosResolveGenreNameById(genreId) {
    if (genreId == null) return '';
    var key = typeof genreId === 'number' ? String(genreId) : String(genreId || '').trim();
    if (!key) return '';
    if (!DRXAOS_GENRE_NAME_MAP || typeof DRXAOS_GENRE_NAME_MAP !== 'object') {
        return '';
    }
    if (Object.prototype.hasOwnProperty.call(DRXAOS_GENRE_NAME_MAP, key)) {
        return DRXAOS_GENRE_NAME_MAP[key];
    }
    if (typeof window !== 'undefined' && window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') {
        var fallbackKeys = [
            'genre_' + key,
            'title_genre_' + key,
            'movie_genre_' + key,
            'tv_genre_' + key,
            'tmdb_genre_' + key
        ];
        for (var i = 0; i < fallbackKeys.length; i++) {
            var translation = Lampa.Lang.translate(fallbackKeys[i]);
            if (translation && translation !== fallbackKeys[i]) {
                DRXAOS_GENRE_NAME_MAP[key] = translation;
                return translation;
            }
        }
    }
    return '';
}
    function drxaosBuildHeroTags(card) {
        var tags = [];
        if (card.vote_average) {
            tags.push('TMDB ' + (Math.round(card.vote_average * 10) / 10).toFixed(1));
        }
        var genres = [];
        if (Array.isArray(card.genres) && card.genres.length) {
            genres = card.genres.map(function(g) {
                if (!g) return '';
                if (typeof g === 'string') return g;
                return g.name || '';
            }).filter(Boolean);
        } else if (Array.isArray(card.genre_ids) && card.genre_ids.length) {
            genres = card.genre_ids.slice(0, 3).map(function(id) {
                return drxaosResolveGenreNameById(id);
            }).filter(Boolean);
        }
        if (genres.length) {
            tags.push(genres.slice(0, 3).join(', '));
        }
        tags.push(card.name ? 'Сериал' : 'Фильм');
    return tags;
}
function drxaosExtractHeroBadgeText(node) {
    if (!node) return '';
    var text = '';
    if (typeof node.innerText === 'string') {
        text = node.innerText;
    } else if (typeof node.textContent === 'string') {
        text = node.textContent;
    }
    return text.replace(/\s+/g, ' ').trim();
}
function drxaosBuildHeroBadgeTags(payload, cardElement) {
    var badges = [];
    if (!cardElement) return badges;
    try {
        var qualityNode = cardElement.querySelector('[data-drxaos-badge="quality"], .card__quality, .card-quality');
        if (qualityNode) {
            var qualityStatus = (qualityNode.dataset && qualityNode.dataset.drxaosQualityStatus) ||
                                (cardElement.dataset && cardElement.dataset.drxaosQualityStatus) || '';
            var qualityText = drxaosExtractHeroBadgeText(qualityNode);
            if (qualityText && qualityText !== '...') {
                if (!qualityStatus) qualityStatus = 'success';
                if (qualityStatus !== 'pending') {
                    var qualityBadge = {
                        type: 'quality',
                        text: qualityText,
                        status: qualityStatus
                    };
                    if (qualityStatus === 'missing') {
                        qualityBadge.modifier = 'missing';
                    }
                    if (qualityNode.classList && qualityNode.classList.contains('camrip')) {
                        qualityBadge.modifier = 'camrip';
                    }
                    badges.push(qualityBadge);
                }
            }
        }
    } catch (qualityError) {
        if (typeof logDebug === 'function') {
            logDebug('Hero badge quality error', qualityError);
        }
    }
    try {
        var seasonNodes = cardElement.querySelectorAll('.card--season-complete, .card--season-progress');
        if (seasonNodes && seasonNodes.length) {
            var seasonBadgeNode = null;
            for (var si = 0; si < seasonNodes.length; si++) {
                var candidateText = drxaosExtractHeroBadgeText(seasonNodes[si]);
                if (candidateText && candidateText !== '...') {
                    seasonBadgeNode = seasonNodes[si];
                    break;
                }
            }
            if (seasonBadgeNode) {
                var seasonText = drxaosExtractHeroBadgeText(seasonBadgeNode);
                if (seasonText) {
                    badges.push({
                        type: 'season',
                        text: seasonText,
                        status: seasonBadgeNode.classList.contains('card--season-complete') ? 'complete' : 'progress',
                        modifier: seasonBadgeNode.classList.contains('card--season-complete') ? 'complete' : ''
                    });
                }
            }
        }
    } catch (seasonError) {
        if (typeof logDebug === 'function') {
            logDebug('Hero badge season error', seasonError);
        }
    }
    try {
        var nextNode = cardElement.querySelector('[data-drxaos-badge="next-episode"], .card-next-episode, .card__next-episode, .card__episode-date');
        if (nextNode) {
            var nextStatus = (nextNode.dataset && (nextNode.dataset.drxaosNextEpisodeStatus || nextNode.dataset.status)) ||
                             (cardElement.dataset && cardElement.dataset.drxaosNextEpisodeStatus) || '';
            var nextText = drxaosExtractHeroBadgeText(nextNode);
            if (nextText && nextText !== '...' && nextText !== '-' && nextText !== '—') {
                if (!nextStatus) nextStatus = 'success';
                if (nextStatus !== 'pending' && nextStatus !== 'empty') {
                    badges.push({
                        type: 'next',
                        text: nextText,
                        status: nextStatus
                    });
                }
            }
        }
    } catch (nextError) {
        if (typeof logDebug === 'function') {
            logDebug('Hero badge next episode error', nextError);
        }
    }
    return badges;
}
function drxaosGetHeroBackground(card) {
    if (card.backdrop_path) return Lampa.TMDB.image('/t/p/original' + card.backdrop_path);
    if (card.background_image) return card.background_image;
    if (card.backdrop) return card.backdrop;
    if (card.poster_path) return Lampa.TMDB.image('/t/p/original' + card.poster_path);
    if (card.img) return card.img;
    if (card.poster) return card.poster;
    return '';
}
function drxaosGetHeroPoster(card) {
    if (card.poster_path) return Lampa.TMDB.image('/t/p/original' + card.poster_path);
    if (card.card_poster) return card.card_poster;
    if (card.poster) return card.poster;
    if (card.img) return card.img;
    return '';
}
function drxaosBuildHeroDescription(drxaosCard, drxaosCardElement) {
    var drxaosElement = drxaosCardElement && drxaosCardElement.jquery ? drxaosCardElement[0] : drxaosCardElement;
    var drxaosFields = [
        'overview',
        'description',
        'plot',
        'storyline',
        'synopsis',
        'biography',
        'about',
        'text',
        'full_description',
        'short_description'
    ];
    var drxaosDescription = '';
    function drxaosNormalizeDescriptionText(drxaosValue) {
        if (typeof drxaosValue !== 'string') return '';
        var drxaosClean = drxaosValue.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (!drxaosClean) return '';
        var drxaosLower = drxaosClean.toLowerCase();
        var drxaosNoText = '';
        if (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') {
            drxaosNoText = String(Lampa.Lang.translate('full_notext') || '');
        }
        if (drxaosNoText) {
            var drxaosNoTextClean = drxaosNoText.replace(/\s+/g, ' ').trim().toLowerCase();
            if (drxaosLower === drxaosNoTextClean || drxaosLower === drxaosNoTextClean.replace(/\.$/, '')) {
                return '';
            }
        }
        if (drxaosLower === 'без описания' || drxaosLower === 'без описания.' || drxaosLower === 'нет описания' || drxaosLower === 'no description' || drxaosLower === 'no description.') {
            return '';
        }
        return drxaosClean;
    }
    function drxaosPickDescriptionFromPayload(drxaosPayload) {
        if (!drxaosPayload) return '';
        for (var drxaosFieldIndex = 0; drxaosFieldIndex < drxaosFields.length; drxaosFieldIndex++) {
            var drxaosField = drxaosFields[drxaosFieldIndex];
            var drxaosValue = drxaosPayload[drxaosField];
            var drxaosNormalized = drxaosNormalizeDescriptionText(drxaosValue);
            if (drxaosNormalized) return drxaosNormalized;
        }
        return '';
    }
    var drxaosCandidates = [];
    if (drxaosCard) {
        drxaosCandidates.push(drxaosCard);
        if (drxaosCard.payload) drxaosCandidates.push(drxaosCard.payload);
        if (drxaosCard.data) drxaosCandidates.push(drxaosCard.data);
        if (drxaosCard.card_data) drxaosCandidates.push(drxaosCard.card_data);
        if (drxaosCard.movie) drxaosCandidates.push(drxaosCard.movie);
        if (drxaosCard.item) {
            drxaosCandidates.push(drxaosCard.item);
            if (drxaosCard.item.movie) drxaosCandidates.push(drxaosCard.item.movie);
        }
    }
    if (drxaosElement) {
        if (drxaosElement.card_data) drxaosCandidates.push(drxaosElement.card_data);
        if (drxaosElement.card && drxaosElement.card.data) drxaosCandidates.push(drxaosElement.card.data);
    }
    for (var drxaosCandidateIndex = 0; drxaosCandidateIndex < drxaosCandidates.length; drxaosCandidateIndex++) {
        drxaosDescription = drxaosPickDescriptionFromPayload(drxaosCandidates[drxaosCandidateIndex]);
        if (drxaosDescription) break;
    }
    if (!drxaosDescription && drxaosElement) {
        var drxaosDescNode = drxaosElement.querySelector('.card__about, .card__info, .card__description, .card__plot, .card__text, .card__overview');
        if (drxaosDescNode) drxaosDescription = drxaosNormalizeDescriptionText(drxaosDescNode.textContent);
    }
    if (!drxaosDescription && drxaosElement && drxaosElement.dataset) {
        drxaosDescription = drxaosNormalizeDescriptionText(
            drxaosElement.dataset.description ||
            drxaosElement.dataset.plot ||
            drxaosElement.dataset.overview ||
            drxaosElement.dataset.synopsis ||
            ''
        );
    }
    if (!drxaosDescription && drxaosElement) {
        drxaosDescription = drxaosNormalizeDescriptionText(
            drxaosElement.getAttribute('data-description') ||
            drxaosElement.getAttribute('data-info') ||
            drxaosElement.getAttribute('data-overview') ||
            drxaosElement.getAttribute('data-plot') ||
            ''
        );
    }
    if (drxaosDescription && drxaosDescription.length > 420) {
        drxaosDescription = drxaosDescription.slice(0, 417).trim() + '…';
    }
    return drxaosDescription;
}
function drxaosRenderHeroTitle(hero, payload, fallbackTitle, cardId) {
    var titleNode = hero.querySelector('.drxaos-hero-title');
    if (!titleNode) return;
    var safeFallback = fallbackTitle || '';
    titleNode.classList.remove('drxaos-hero-title-has-logo');
    titleNode.innerHTML = '';
    delete titleNode.dataset.pendingCardLogoId;
    
    if (!drxaosIsTitleLogoEnabled()) {
        titleNode.textContent = safeFallback;
        return;
    }
    
    var normalized = drxaosNormalizeLogoMovie(payload);
    if (!normalized) {
        titleNode.textContent = safeFallback;
        return;
    }
    
    // Проверяем кеш синхронно для мгновенного отображения
    var meta = drxaosGetTitleLogoMeta(normalized);
    var cachedResult = null;
    if (meta && DRXAOS_TITLE_LOGO_CACHE.hasOwnProperty(meta.cacheKey)) {
        cachedResult = DRXAOS_TITLE_LOGO_CACHE[meta.cacheKey];
    }
    
    // Если лого в кеше - показываем мгновенно
    if (cachedResult && cachedResult.url) {
        var img = document.createElement('img');
        img.src = cachedResult.url;
        img.alt = cachedResult.alt || safeFallback || '';
        img.className = 'drxaos-hero-title-logo visible';
        titleNode.appendChild(img);
        titleNode.classList.add('drxaos-hero-title-has-logo');
        return;
    }
    
    // Загружаем лого асинхронно; текст подставляем только если не нашли лого
    var pendingKey = cardId ? String(cardId) : String(Date.now());
    titleNode.dataset.pendingCardLogoId = pendingKey;
    drxaosLoadTitleLogo(normalized).then(function(result) {
        if (titleNode.dataset.pendingCardLogoId !== pendingKey) return;
        if (result && result.url) {
            titleNode.innerHTML = '';
            var img = document.createElement('img');
            img.src = result.url;
            img.alt = result.alt || safeFallback || '';
            img.className = 'drxaos-hero-title-logo';
            titleNode.appendChild(img);
            titleNode.classList.add('drxaos-hero-title-has-logo');
            requestAnimationFrame(function() { img.classList.add('visible'); });
        } else {
            titleNode.textContent = safeFallback;
            titleNode.classList.remove('drxaos-hero-title-has-logo');
        }
    }).catch(function() {
        if (titleNode.dataset.pendingCardLogoId === pendingKey) {
            titleNode.textContent = safeFallback;
            titleNode.classList.remove('drxaos-hero-title-has-logo');
        }
    });
}
function drxaosGetHeroTagsNode(hero) {
    if (!hero) return null;
    return hero.querySelector('.drxaos-xu-info__tags.drxaos-hero-tags') || hero.querySelector('.drxaos-hero-tags');
}
function drxaosEnsureHeroOriginalTitleBlock(hero) {
    if (!hero) return null;
    var existing = hero.querySelector('.drxaos-original-title-block.hero');
    if (existing) return existing;
    var tagsNode = drxaosGetHeroTagsNode(hero);
    var parent = (tagsNode && tagsNode.parentNode) || hero.querySelector('.drxaos-hero-text') || hero;
    if (!parent) return null;
    var block = document.createElement('div');
    block.className = 'drxaos-original-title-block drxaos-xu-info__tags drxaos-hero-tags hero drxaos-original-title-block--empty';
    if (tagsNode && tagsNode.parentNode) {
        tagsNode.parentNode.insertBefore(block, tagsNode);
    } else {
        parent.appendChild(block);
    }
    return block;
}
function drxaosSetHeroOriginalTitle(hero, html, expectedCardId) {
    if (!hero) return;
    if (expectedCardId != null) {
        var activeId = hero.dataset && hero.dataset.activeCardId;
        if (activeId && String(expectedCardId) !== String(activeId)) return;
    }
    var block = drxaosEnsureHeroOriginalTitleBlock(hero);
    if (!block) return;
    block.innerHTML = html || '';
    block.classList.toggle('drxaos-original-title-block--empty', !html);
}
function drxaosRenderHero(hero, payload, cardElement, cardId) {
    if (!hero || !payload) return;
    
    // Fix: Ensure payload has ID if we resolved it externally
    if (cardId && !payload.id && !payload.tmdb_id) {
        payload.id = cardId;
        payload.tmdb_id = cardId;
    }

    var title = payload.title_ru || payload.name_ru || payload.title || payload.name || payload.original_title || payload.original_name || '';
    if (!title && cardElement) {
        var titleNode = cardElement.querySelector('.card__title, .card__name, .name, .title');
        if (titleNode) title = titleNode.textContent.trim();
    }
    drxaosRenderHeroTitle(hero, payload, title, cardId);
    var preliminaryData = drxaosComposeOriginalTitleData(payload, cardElement);
    var prelimTemplate = drxaosBuildOriginalTitleTemplate(preliminaryData);
    drxaosSetHeroOriginalTitle(hero, prelimTemplate, cardId);
    var heroId = cardId || (payload && (payload.id || payload.tmdb_id));
    if (heroId && !drxaosIsTvDevice()) {
        var heroType = payload && payload.name ? 'tv' : 'movie';
        drxaosFetchOriginalNames({ id: heroId }, heroType).then(function(result) {
            if (!result) return;
            var template = drxaosBuildOriginalTitleTemplate(result);
            if (!template) return;
            drxaosSetHeroOriginalTitle(hero, template, heroId);
        });
    }
    var meta = drxaosBuildHeroMeta(payload);
    var tags = drxaosBuildHeroTags(payload);
    var desc = drxaosBuildHeroDescription(payload, cardElement);
    var bg = drxaosGetHeroBackground(payload);
    if (!bg && cardElement) {
        var imgNode = cardElement.querySelector('.card__img, img');
        if (imgNode && imgNode.src) bg = imgNode.src;
    }
    var metaNode = hero.querySelector('.drxaos-hero-meta');
    if (metaNode) metaNode.textContent = meta || '';
    var descNode = hero.querySelector('.drxaos-hero-description');
    if (descNode) {
        descNode.textContent = desc || '';
        descNode.style.display = desc ? '' : 'none';
    }
        var tagsContainer = hero.querySelector('.drxaos-hero-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            tags.forEach(function(tag) {
                var span = document.createElement('span');
                span.className = 'drxaos-xu-info__tag';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
            var badgeTags = drxaosBuildHeroBadgeTags(payload, cardElement);
            badgeTags.forEach(function(badge) {
                if (!badge || !badge.text) return;
                var badgeSpan = document.createElement('span');
                badgeSpan.className = 'drxaos-xu-info__tag drxaos-hero-tag drxaos-hero-tag-' + badge.type;
                if (badge.modifier) {
                    badgeSpan.classList.add('drxaos-hero-tag-' + badge.type + '--' + badge.modifier);
                }
                if (badge.status) {
                    badgeSpan.dataset.status = badge.status;
                }
                badgeSpan.textContent = badge.text;
                tagsContainer.appendChild(badgeSpan);
            });
    }
    var bgNode = hero.querySelector('.drxaos-hero-bg');
    if (bgNode) {
        bgNode.style.backgroundImage = bg ? 'url("' + bg + '")' : 'none';
    }
    hero.classList.remove('hidden');
}
var drxaosHeroBadgeRefreshFrame = null;
function drxaosScheduleHeroBadgeRefresh(cardElement) {
    try {
        if (!drxaosIsXuyampisheEnabled || typeof drxaosIsXuyampisheEnabled !== 'function') return;
        if (!drxaosIsXuyampisheEnabled()) return;
    } catch (err) {
        return;
    }
    if (!cardElement) return;
    var hero = document.querySelector('.drxaos-hero-panel');
    if (!hero || hero.classList.contains('hidden')) return;
    var activeId = hero.dataset && hero.dataset.activeCardId;
    if (!activeId) return;
    var activity = cardElement.closest('.activity');
    if (activity && typeof drxaosEnsureActiveLine === 'function') {
        drxaosEnsureActiveLine(activity);
        var currentLine = activity.querySelector('.items-line.drxaos-line-active');
        if (!currentLine) {
            var firstLine = activity.querySelector('.items-line');
            if (firstLine && typeof drxaosSetActiveLine === 'function') {
                drxaosSetActiveLine(activity, firstLine);
            }
        }

        var lines = activity.querySelectorAll('.items-line');
        lines.forEach(function(lineEl) {
            if (!lineEl.dataset.drxaosLineIndex) {
                drxaosIndexLines(activity);
            }
            if (!lineEl.classList.contains('drxaos-line-active')) {
                // lineEl.style.display = 'none'; // DISABLED: Native scrolling
            }
        });

    }
    var payload = drxaosExtractCardPayload(cardElement) || drxaosSafeGetCardData(cardElement);
    if (!payload) return;
    var cardId = drxaosResolveCardId(payload, cardElement);
    if (!cardId || String(cardId) !== String(activeId)) return;
    if (drxaosHeroBadgeRefreshFrame) {
        cancelAnimationFrame(drxaosHeroBadgeRefreshFrame);
    }
    drxaosHeroBadgeRefreshFrame = requestAnimationFrame(function() {
        drxaosHeroBadgeRefreshFrame = null;
        try {
            drxaosRenderHero(hero, payload, cardElement, cardId);
        } catch (refreshError) {
            if (typeof logDebug === 'function') {
                logDebug('Hero badge refresh error', refreshError);
            }
        }
    });
}
window.drxaosScheduleHeroBadgeRefresh = drxaosScheduleHeroBadgeRefresh;
    function drxaosUpdateHeroFromCard(cardElement) {
        if (!drxaosIsXuyampisheEnabled() || drxaosUsingMakerXuyampishe() || !cardElement) return;
        var activity = cardElement.closest('.activity');
        if (!activity) return;
        var hero = drxaosEnsureHeroPanel(activity);
        if (!hero) return;
        var payload = drxaosExtractCardPayload(cardElement) || drxaosSafeGetCardData(cardElement);
        if (!payload) return;
        var cardId = drxaosResolveCardId(payload, cardElement);
        var pendingKey = cardId ? String(cardId) : String(Date.now());
        hero.dataset.pendingCardId = pendingKey;

        // Optimization: Render IMMEDIATE data first (Title, Year, etc.) to prevent UI lag
        // This ensures the title appears instantly while we fetch enriched details
        function applyPayload(finalPayload) {
            if (!finalPayload) return;
            if (hero.dataset.pendingCardId && hero.dataset.pendingCardId !== pendingKey) return;
            if (cardId) {
                hero.dataset.activeCardId = String(cardId);
            } else {
                delete hero.dataset.activeCardId;
            }
            hero.dataset.pendingCardId = '';
            drxaosRenderHero(hero, finalPayload, cardElement, cardId);
        }

        // 1. Instant Render
        applyPayload(payload);

        // 2. Enriched Render (if needed)
        if (drxaosHeroNeedsDetails(payload)) {
            // Keep pendingKey active for enrichment
            hero.dataset.pendingCardId = pendingKey;
            
            drxaosEnrichHeroPayload(payload, cardElement, function(intermediatePayload) {
                // On Intermediate (ID found): Render immediately
                if (hero.dataset.activeCardId === String(cardId) || hero.dataset.pendingCardId === pendingKey) {
                    applyPayload(intermediatePayload);
                }
            }).then(function(enriched) {
                // Only apply if user hasn't moved to another card
                if (hero.dataset.activeCardId === String(cardId) || hero.dataset.pendingCardId === pendingKey) {
                    applyPayload(enriched || payload);
                }
            }).catch(function() {
                // Silent catch, instant render already happened
            });
        }
    }
function drxaosInitActivitiesHero() {
    if (!drxaosIsXuyampisheEnabled()) return;
    var activities = document.querySelectorAll('.activity:not(.activity--modal)');
    activities.forEach(function(activity) {
        if (!activity.querySelector('.items-line')) return;
        if (activity.dataset.drxaosHeroReady === '1') return;
        var hero = drxaosEnsureHeroPanel(activity);
        if (hero) {
            activity.dataset.drxaosHeroReady = '1';
            setTimeout(function() {
                var firstCard = activity.querySelector('.items-line .card');
                if (firstCard) {
                    // drxaosActivateLineFromCard(firstCard); // Removed to prevent stealing focus/state from Menu
                    drxaosUpdateHeroFromCard(firstCard);
                }
            }, 400);
        }
    });
}
var drxaosHeroInitTimer = null;
function drxaosScheduleHeroInit(delay) {
    if (!drxaosIsXuyampisheEnabled()) return;
    if (drxaosHeroInitTimer) {
        clearTimeout(drxaosHeroInitTimer);
    }
    drxaosHeroInitTimer = setTimeout(drxaosInitActivitiesHero, delay || 0);
}
function drxaosBindHeroFocus() {
    return;
}
var drxaosIsMakerEnv = drxaosXuyampisheInterface.isMakerEnvironment ? drxaosXuyampisheInterface.isMakerEnvironment() : false;
if (!drxaosIsMakerEnv) {
    // drxaosBindHeroFocus(); // отключено для предотвращения ложных активаций карточек
if (window.Lampa && window.Lampa.Listener) {
    window.Lampa.Listener.follow('activity', function(e) {
        if (e && (e.type === 'start' || e.type === 'update')) {
            drxaosUpdateSectionState(true);
            setTimeout(drxaosRunRowAdjust, 50);
            drxaosSyncMadnessMode();
        }
        if (e && (e.type === 'start' || e.type === 'update')) {
            setTimeout(drxaosRunRowAdjust, 50);
        }

            if (e && e.type === 'start' && drxaosIsXuyampisheEnabled()) {
                drxaosScheduleHeroInit(400);
            }
        });


        // Отключаем hover-триггер карточек, чтобы исключить случайные открытия
        // window.Lampa.Listener.follow('hover', ...)
    }
}
function openApiKeyInput(paramName, title, placeholder) {
    var existingModal = document.querySelector('.drxaos-api-modal');
    if (existingModal) {
        existingModal.remove();
    }
    var modal = document.createElement('div');
    modal.className = 'drxaos-api-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, var(--drxaos-surface-opacity));
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: flex-start;
    `;
    modal.innerHTML = `
        <div style="
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            min-width: 300px;
            max-width: 500px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
        ">
            <h3 style="
                color: #fff;
                margin: 0 0 15px 0;
                font-size: 16px;
                font-weight: 500;
            ">${title}</h3>
            <input type="text" id="api-key-input" placeholder="${placeholder}" style="
                width: 100%;
                padding: 10px;
                border: 1px solid #444;
                border-radius: 4px;
                background: #2a2a2a;
                color: #fff;
                font-size: 14px;
                box-sizing: border-box;
                margin-bottom: 15px;
            " />
            <div style="
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            ">
                <button id="save-api-btn" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Сохранить</button>
                <button id="cancel-api-btn" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    drxaosEnterFocusLock('api-modal');
    var input = document.getElementById('api-key-input');
    var saveBtn = document.getElementById('save-api-btn');
    var cancelBtn = document.getElementById('cancel-api-btn');
    setTimeout(function() {
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
    saveBtn.onclick = function() {
        var value = input.value.trim();
        if (value) {
            Lampa.Storage.set(paramName, value);
            if (Lampa.Noty) {
                Lampa.Noty.show('✅ ' + title + ' сохранен!');
            }
            closeApiKeyModal();
            if (paramName === 'tmdb_api_key') {
                drxaosApplyBadgeSettings();
            } else if (paramName === 'jacred_url') {
                applyMovieQuality();
            }
        } else {
            if (Lampa.Noty) {
                Lampa.Noty.show('⚠️ Поле не может быть пустым!');
            }
        }
    };
    cancelBtn.onclick = closeApiKeyModal;
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeApiKeyModal();
        }
    };
    var handleEscape = function(e) {
        if (e.key === 'Escape') {
            closeApiKeyModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    modal._drxaosApiEscapeHandler = handleEscape;
    input.onkeydown = function(e) {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    };
}
function closeApiKeyModal() {
    var modal = document.querySelector('.drxaos-api-modal');
    if (modal) {
        if (modal._drxaosApiEscapeHandler) {
            document.removeEventListener('keydown', modal._drxaosApiEscapeHandler);
            delete modal._drxaosApiEscapeHandler;
        }
        modal.remove();
    }
    drxaosLeaveFocusLock('api-modal');
}
window.openApiKeyInput = openApiKeyInput;
window.closeApiKeyModal = closeApiKeyModal;

function ensureExternalProxyCompatibility() {
    try {
        if (!window.fetch || window.fetch._drxaosProxySafe) return;
        var nativeFetch = window.fetch.bind(window);
        var tmdbDirect = 'https://api.themoviedb.org/3/';

        function extractFetchUrl(input) {
            if (!input) return '';
            if (typeof input === 'string') return input;
            if (typeof Request !== 'undefined' && input instanceof Request) return input.url || '';
            if (input && typeof input.url === 'string') return input.url;
            return '';
        }

        function buildFetchInit(requestLike, init) {
            if (init) return init;
            if (typeof Request !== 'undefined' && requestLike instanceof Request) {
                return {
                    method: requestLike.method,
                    headers: requestLike.headers,
                    credentials: requestLike.credentials,
                    cache: requestLike.cache,
                    redirect: requestLike.redirect,
                    referrer: requestLike.referrer,
                    referrerPolicy: requestLike.referrerPolicy,
                    integrity: requestLike.integrity,
                    keepalive: requestLike.keepalive,
                    signal: requestLike.signal
                };
            }
            return undefined;
        }

        window.fetch = function(input, init) {
            var url = extractFetchUrl(input);
            if (url && url.indexOf(tmdbDirect) === 0 && window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.api === 'function') {
                var path = url.slice(tmdbDirect.length);
                var proxiedUrl = Lampa.TMDB.api(path);
                if (proxiedUrl && proxiedUrl !== url) {
                    var nextInit = buildFetchInit(input, init);
                    return nativeFetch(proxiedUrl, nextInit);
                }
            }
            return nativeFetch(input, init);
        };
        window.fetch._drxaosProxySafe = true;
        
    } catch (err) {
        
    }
}

function initDrxaosGlobalObserver() {
    if (window.drxaosGlobalObserver) return;
    var observerThrottle = null;
    var pendingMutations = [];
    function getMaxPendingMutations() {
        try {
            return document.body && document.body.classList.contains('drxaos-madness-mode') ? 200 : 50;
        } catch (e) {
            return 50;
        }
    }
    var MAX_PENDING_MUTATIONS = getMaxPendingMutations();
    var TARGET_SELECTOR = '.card, .madness-card, .madness-item, .madness__item, [data-madness-card], [data-component="madness-card"], .items-line, .items-cards, .drxaos-hero-panel, .drxaos-row-nav, .drxaos-xu-container';
    function nodeMatchesTargets(node) {
        if (!node || node.nodeType !== 1) return false;
        try {
            if (node.matches && node.matches(TARGET_SELECTOR)) return true;
        } catch (matchError) {
        }
        if (node.querySelector) {
            try {
                if (node.querySelector(TARGET_SELECTOR)) return true;
            } catch (queryError) {
            }
        }
        return false;
    }
    function isRelevantMutation(mutation) {
        if (!mutation || mutation.type !== 'childList' || !mutation.addedNodes || !mutation.addedNodes.length) {
            return false;
        }
        for (var i = 0; i < mutation.addedNodes.length; i++) {
            if (nodeMatchesTargets(mutation.addedNodes[i])) return true;
        }
        return false;
    }
    function processMutations() {
        if (pendingMutations.length === 0) return;
        var mutations = pendingMutations.slice();
        pendingMutations = [];
        if (window.drxaosQualityHandler) {
            requestAnimationFrame(function() {
                window.drxaosQualityHandler(mutations);
            });
        }
        if (window.drxaosLabelsHandler) {
            requestAnimationFrame(function() {
                window.drxaosLabelsHandler(mutations);
            });
        }
        if (window.drxaosSeasonHandler) {
            requestAnimationFrame(function() {
                window.drxaosSeasonHandler(mutations);
            });
        }
        if (window.drxaosLinesHandler) {
            requestAnimationFrame(function() {
                window.drxaosLinesHandler(mutations);
            });
        }
        if (window.drxaosButtonsHandler) {
            requestAnimationFrame(function() {
                window.drxaosButtonsHandler(mutations);
            });
        }
    }
    window.drxaosGlobalObserver = new MutationObserver(function(mutations) {
        var relevant = [];
        for (var i = 0; i < mutations.length; i++) {
            if (isRelevantMutation(mutations[i])) {
                relevant.push(mutations[i]);
            }
        }
        if (!relevant.length) return;
        pendingMutations.push.apply(pendingMutations, relevant);
        var currentMax = getMaxPendingMutations();
        if (pendingMutations.length > currentMax) {
            pendingMutations.splice(0, pendingMutations.length - currentMax);
        }
        if (!observerThrottle) {
            observerThrottle = setTimeout(function() {
                observerThrottle = null;
                processMutations();
            }, CONFIG.PERFORMANCE.MUTATION_THROTTLE);
        }
    });
    window.drxaosGlobalObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}
function drxaosApplyAllSettings() {
    try {
        var theme = Lampa.Storage.get('drxaos_theme', 'midnight');
        applyThemeImmediate(theme);
        applyAdvancedSettings();
        applyFontFamily();
        applyFontWeight();
        applyDetailsStyles();
        applyReactionsPanelStyles();
        applyRateLineStyles();
        drxaosApplyBadgeSettings();
        applySourceFilter();
        applyMovieQuality();
        syncActionButtons();
    } catch (e) {
        
    }
}
var drxaosApplyAllDebounced = debounce(drxaosApplyAllSettings, 150);
window.drxaosScheduleApply = function() {
    drxaosApplyAllDebounced();
};
window.drxaosApplyAll = function() {
    drxaosApplyAllSettings();
};
if (window.drxaosPostDefaultsQueue && window.drxaosPostDefaultsQueue.length) {
    window.drxaosPostDefaultsQueue = [];
    window.drxaosApplyAll();
}

function replaceHeadBackwardIcon() {
    try {
        // Новая SVG иконка "Назад" с градиентом
        var newBackwardIcon = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="linear-gradient-backward" gradientUnits="userSpaceOnUse" x1="29.293" x2="49.957" y1="21.668" y2="42.332"><stop offset="0" stop-color="#df4cff"></stop><stop offset="1" stop-color="#7259ff"></stop></linearGradient><g id="icon"><path d="m36.332 46.543a1 1 0 1 1 -1.414 1.414l-15.25-15.25a1 1 0 0 1 0-1.414l15.25-15.25a1 1 0 0 1 1.414 1.414l-14.543 14.543zm-6.543-14.543 14.543-14.543a1 1 0 0 0 -1.414-1.414l-15.25 15.25a1 1 0 0 0 0 1.414l15.25 15.25a1 1 0 0 0 1.414-1.414z" fill="url(#linear-gradient-backward)" style="fill: rgb(153, 0, 0);"></path></g></svg>';

        function replaceIcon() {
            var backwardIcon = document.querySelector('.head__backward');
            if (!backwardIcon) return;

            var svg = backwardIcon.querySelector('svg');
            if (svg && !svg.hasAttribute('data-drxaos-replaced')) {
                svg.outerHTML = newBackwardIcon;
                // Помечаем как замененный, чтобы не заменять повторно
                var newSvg = backwardIcon.querySelector('svg');
                if (newSvg) {
                    newSvg.setAttribute('data-drxaos-replaced', 'true');
                }
            }
        }

        // Вызываем сразу и через небольшую задержку для динамически добавленных элементов
        replaceIcon();
        setTimeout(replaceIcon, 500);
        setTimeout(replaceIcon, 1500);

        // Отслеживаем изменения в DOM
        var observer = new MutationObserver(function(mutations) {
            var shouldReplace = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('head__backward')) {
                                shouldReplace = true;
                                break;
                            }
                            if (node.querySelector && node.querySelector('.head__backward')) {
                                shouldReplace = true;
                                break;
                            }
                        }
                    }
                }
                // Также проверяем изменения атрибутов у существующего элемента
                if (mutation.target && mutation.target.classList && mutation.target.classList.contains('head__backward')) {
                    shouldReplace = true;
                }
            });
            if (shouldReplace) {
                setTimeout(replaceIcon, 100);
            }
        });

        // Отслеживаем появление head__backward
        var bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('head__backward')) {
                                setTimeout(replaceIcon, 100);
                            }
                            if (node.querySelector && node.querySelector('.head__backward')) {
                                setTimeout(replaceIcon, 100);
                            }
                        }
                    }
                }
            });
        });

        if (document.body) {
            bodyObserver.observe(document.body, { childList: true, subtree: true });
            var backwardIcon = document.querySelector('.head__backward');
            if (backwardIcon) {
                observer.observe(backwardIcon, { childList: true, attributes: true, attributeFilter: ['class'] });
            }
        }
    } catch (err) {
        
    }
}

function replaceHeadBackwardButtonIcon() {
    try {
        // Новая SVG иконка "Назад" с анимацией для head-backward__button
        var newBackwardButtonIcon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="none" style="width: 56px !important; height: 56px !important; min-width: 56px !important; min-height: 56px !important;"><style>@keyframes slide-12{to{transform:translateX(-1px)}}</style><rect width="14" height="14" x="5.523" y="5" stroke="#FF0000" stroke-width="1.5" rx="7"/><path fill="#FF0000" stroke="#FF0000" stroke-linecap="round" stroke-width=".4" d="M13.012 14.846a.429.429 0 00.659-.549L11.757 12l1.914-2.297a.429.429 0 10-.659-.549l-2.138 2.566a.428.428 0 000 .56l2.138 2.566z" style="animation:slide-12 1s infinite alternate both cubic-bezier(1,-.01,0,.98)"/></svg>';

        function replaceIcon() {
            var backwardButton = document.querySelector('.head-backward__button');
            if (!backwardButton) return;

            var svg = backwardButton.querySelector('svg');
            if (svg && !svg.hasAttribute('data-drxaos-replaced')) {
                svg.outerHTML = newBackwardButtonIcon;
                // Помечаем как замененный, чтобы не заменять повторно
                var newSvg = backwardButton.querySelector('svg');
                if (newSvg) {
                    newSvg.setAttribute('data-drxaos-replaced', 'true');
                }
            }
        }

        // Вызываем сразу и через небольшую задержку для динамически добавленных элементов
        replaceIcon();
        setTimeout(replaceIcon, 500);
        setTimeout(replaceIcon, 1500);

        // Отслеживаем изменения в DOM
        var observer = new MutationObserver(function(mutations) {
            var shouldReplace = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('head-backward__button')) {
                                shouldReplace = true;
                                break;
                            }
                            if (node.querySelector && node.querySelector('.head-backward__button')) {
                                shouldReplace = true;
                                break;
                            }
                        }
                    }
                }
                // Также проверяем изменения атрибутов у существующего элемента
                if (mutation.target && mutation.target.classList && mutation.target.classList.contains('head-backward__button')) {
                    shouldReplace = true;
                }
            });
            if (shouldReplace) {
                setTimeout(replaceIcon, 100);
            }
        });

        // Отслеживаем появление head-backward__button
        var bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('head-backward__button')) {
                                setTimeout(replaceIcon, 100);
                            }
                            if (node.querySelector && node.querySelector('.head-backward__button')) {
                                setTimeout(replaceIcon, 100);
                            }
                        }
                    }
                }
            });
        });

        if (document.body) {
            bodyObserver.observe(document.body, { childList: true, subtree: true });
            var backwardButton = document.querySelector('.head-backward__button');
            if (backwardButton) {
                observer.observe(backwardButton, { childList: true, attributes: true, attributeFilter: ['class'] });
            }
        }
    } catch (err) {
        
    }
}

function replaceSettingsIcon() {
    try {
        // Новая SVG иконка "Настройки" с анимацией вращения
        var newSettingsIcon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" style="width: 2em !important; height: 2em !important; min-width: 2em !important; min-height: 2em !important; max-width: 2em !important; max-height: 2em !important;"><style>@keyframes rotate{0%{transform:rotateZ(0)}to{transform:rotateZ(360deg)}}</style><g style="animation:rotate 3s cubic-bezier(.7,-.03,.26,1.05) both infinite;transform-origin:center center" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke="#FFFFFF" d="M5.262 15.329l.486.842a1.49 1.49 0 002.035.55 1.486 1.486 0 012.036.529c.128.216.197.463.2.714a1.493 1.493 0 001.493 1.536h.979a1.486 1.486 0 001.485-1.493 1.493 1.493 0 011.493-1.471c.252.002.498.071.714.2a1.493 1.493 0 002.036-.55l.521-.857a1.493 1.493 0 00-.542-2.036 1.493 1.493 0 010-2.586c.71-.41.952-1.318.543-2.028l-.493-.85a1.493 1.493 0 00-2.036-.579 1.479 1.479 0 01-2.029-.543 1.428 1.428 0 01-.2-.714c0-.825-.668-1.493-1.492-1.493h-.98c-.82 0-1.488.664-1.492 1.486a1.485 1.485 0 01-1.493 1.493 1.521 1.521 0 01-.714-.2 1.493 1.493 0 00-2.036.542l-.514.858a1.486 1.486 0 00.543 2.035 1.486 1.486 0 01.543 2.036c-.13.226-.317.413-.543.543a1.493 1.493 0 00-.543 2.028v.008z" clip-rule="evenodd"/><path stroke="#FFFFFF" d="M12.044 10.147a1.853 1.853 0 100 3.706 1.853 1.853 0 000-3.706z"/></g></svg>';

        function replaceIcon() {
            // Сначала ищем все head__action с классом open--settings - самый прямой способ
            var headActions = document.querySelectorAll('.head__action.open--settings, .head__action.head__settings');
            if (headActions && headActions.length) {
                headActions.forEach(function(action) {
                    if (!action) return;
                    var svg = action.querySelector('svg');
                    if (svg && !svg.hasAttribute('data-drxaos-settings-replaced')) {
                        // Заменяем SVG независимо от содержимого, если это элемент настроек
                        svg.outerHTML = newSettingsIcon;
                        var newSvg = action.querySelector('svg');
                        if (newSvg) {
                            newSvg.setAttribute('data-drxaos-settings-replaced', 'true');
                        }
                    }
                });
            }
            
            // Ищем все use элементы с xlink:href="#sprite-settings" или href="#sprite-settings"
            var allUses = document.querySelectorAll('use[xlink\\:href="#sprite-settings"], use[href="#sprite-settings"]');
            
            if (allUses && allUses.length) {
                allUses.forEach(function(use) {
                    if (!use) return;
                    var svg = use.closest('svg');
                    if (svg && !svg.hasAttribute('data-drxaos-settings-replaced')) {
                        // Сохраняем родительский контейнер для последующего поиска
                        var parent = svg.parentElement;
                        svg.outerHTML = newSettingsIcon;
                        // Помечаем новый SVG как замененный
                        if (parent) {
                            var newSvg = parent.querySelector('svg');
                            if (newSvg) {
                                newSvg.setAttribute('data-drxaos-settings-replaced', 'true');
                            }
                        }
                    }
                });
            }
            
            // Дополнительно ищем через селекторы для меню
            var menuItems = document.querySelectorAll('.menu__item[data-action="settings"] .menu__ico svg');
            if (menuItems && menuItems.length) {
                menuItems.forEach(function(svg) {
                    if (svg && !svg.hasAttribute('data-drxaos-settings-replaced')) {
                        var use = svg.querySelector('use[xlink\\:href="#sprite-settings"], use[href="#sprite-settings"]');
                        if (use) {
                            var parent = svg.parentElement;
                            svg.outerHTML = newSettingsIcon;
                            if (parent) {
                                var newSvg = parent.querySelector('svg');
                                if (newSvg) {
                                    newSvg.setAttribute('data-drxaos-settings-replaced', 'true');
                                }
                            }
                        }
                    }
                });
            }
        }

        // Вызываем сразу и через небольшую задержку для динамически добавленных элементов
        replaceIcon();
        setTimeout(replaceIcon, 100);
        setTimeout(replaceIcon, 300);
        setTimeout(replaceIcon, 500);
        setTimeout(replaceIcon, 1000);
        setTimeout(replaceIcon, 1500);
        setTimeout(replaceIcon, 2500);

        // Отслеживаем изменения в DOM
        var observer = new MutationObserver(function(mutations) {
            var shouldReplace = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.querySelector && (node.querySelector('use[xlink\\:href="#sprite-settings"]') || node.querySelector('use[href="#sprite-settings"]') || node.querySelector('.menu__item[data-action="settings"]') || node.querySelector('.head__action.open--settings') || node.querySelector('.head__action.head__settings'))) {
                                shouldReplace = true;
                                break;
                            }
                            if (node.classList && (node.classList.contains('head__action') && (node.classList.contains('open--settings') || node.classList.contains('head__settings')))) {
                                shouldReplace = true;
                                break;
                            }
                        }
                    }
                }
            });
            if (shouldReplace) {
                setTimeout(replaceIcon, 100);
            }
        });

        // Отслеживаем появление элементов с настройками
        var bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.querySelector && (node.querySelector('use[xlink\\:href="#sprite-settings"]') || node.querySelector('use[href="#sprite-settings"]') || node.querySelector('.menu__item[data-action="settings"]') || node.querySelector('.head__action.open--settings') || node.querySelector('.head__action.head__settings'))) {
                                setTimeout(replaceIcon, 100);
                            }
                            if (node.classList && (node.classList.contains('head__action') && (node.classList.contains('open--settings') || node.classList.contains('head__settings')))) {
                                setTimeout(replaceIcon, 100);
                            }
                        }
                    }
                }
            });
        });

        if (document.body) {
            bodyObserver.observe(document.body, { childList: true, subtree: true });
            var menuContainer = document.querySelector('.menu__item[data-action="settings"]');
            if (menuContainer) {
                observer.observe(menuContainer, { childList: true, attributes: true, subtree: true });
            }
            var headAction = document.querySelector('.head__action.open--settings, .head__action.head__settings');
            if (headAction) {
                observer.observe(headAction, { childList: true, attributes: true, subtree: true });
            }
            // Также отслеживаем изменения в head__actions контейнере
            var headActionsContainer = document.querySelector('.head__actions');
            if (headActionsContainer) {
                observer.observe(headActionsContainer, { childList: true, attributes: true, subtree: true });
            }
        }
    } catch (err) {
        
    }
}

function replaceSearchIcon() {
    try {
        // Новая SVG иконка "Поиск" с анимацией для head__action.open--search
        var newSearchIcon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" style="width: 2em !important; height: 2em !important; min-width: 2em !important; min-height: 2em !important; max-width: 2em !important; max-height: 2em !important;"><style>@keyframes flipping{0%{transform:rotate3d(1,1,0,0deg)}to{transform:rotate3d(1,1,0,180deg)}}</style><g style="animation:flipping 1.5s cubic-bezier(.96,-.2,0,1.29) both infinite alternate-reverse"><path fill="#FFFFFF" fill-rule="evenodd" d="M5.71 11.025a5.25 5.25 0 1010.5 0 5.25 5.25 0 00-10.5 0zm5.25-7a7 7 0 100 14 7 7 0 000-14z" clip-rule="evenodd"/><rect width="1.839" height="3.677" x="16.139" y="17.375" fill="#FFFFFF" rx=".2" transform="rotate(-45 16.14 17.375)"/></g></svg>';

        function replaceIcon() {
            // Сначала ищем все head__action с классом open--search - самый прямой способ
            var headActions = document.querySelectorAll('.head__action.open--search');
            if (headActions && headActions.length) {
                headActions.forEach(function(action) {
                    if (!action) return;
                    var svg = action.querySelector('svg');
                    if (svg && !svg.hasAttribute('data-drxaos-search-replaced')) {
                        // Заменяем SVG независимо от содержимого, если это элемент поиска
                        svg.outerHTML = newSearchIcon;
                        var newSvg = action.querySelector('svg');
                        if (newSvg) {
                            newSvg.setAttribute('data-drxaos-search-replaced', 'true');
                        }
                    }
                });
            }
            
            // Ищем все use элементы с xlink:href="#sprite-search" или href="#sprite-search"
            var allUses = document.querySelectorAll('use[xlink\\:href="#sprite-search"], use[href="#sprite-search"]');
            
            if (allUses && allUses.length) {
                allUses.forEach(function(use) {
                    if (!use) return;
                    var svg = use.closest('svg');
                    if (svg && !svg.hasAttribute('data-drxaos-search-replaced')) {
                        // Сохраняем родительский контейнер для последующего поиска
                        var parent = svg.parentElement;
                        svg.outerHTML = newSearchIcon;
                        // Помечаем новый SVG как замененный
                        if (parent) {
                            var newSvg = parent.querySelector('svg');
                            if (newSvg) {
                                newSvg.setAttribute('data-drxaos-search-replaced', 'true');
                            }
                        }
                    }
                });
            }
        }

        // Вызываем сразу и через небольшую задержку для динамически добавленных элементов
        replaceIcon();
        setTimeout(replaceIcon, 100);
        setTimeout(replaceIcon, 300);
        setTimeout(replaceIcon, 500);
        setTimeout(replaceIcon, 1000);
        setTimeout(replaceIcon, 1500);
        setTimeout(replaceIcon, 2500);

        // Отслеживаем изменения в DOM
        var observer = new MutationObserver(function(mutations) {
            var shouldReplace = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.querySelector && (node.querySelector('use[xlink\\:href="#sprite-search"]') || node.querySelector('use[href="#sprite-search"]') || node.querySelector('.head__action.open--search'))) {
                                shouldReplace = true;
                                break;
                            }
                            if (node.classList && node.classList.contains('head__action') && node.classList.contains('open--search')) {
                                shouldReplace = true;
                                break;
                            }
                        }
                    }
                }
            });
            if (shouldReplace) {
                setTimeout(replaceIcon, 100);
            }
        });

        // Отслеживаем появление элементов с поиском
        var bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.querySelector && (node.querySelector('use[xlink\\:href="#sprite-search"]') || node.querySelector('use[href="#sprite-search"]') || node.querySelector('.head__action.open--search'))) {
                                setTimeout(replaceIcon, 100);
                            }
                            if (node.classList && node.classList.contains('head__action') && node.classList.contains('open--search')) {
                                setTimeout(replaceIcon, 100);
                            }
                        }
                    }
                }
            });
        });

        if (document.body) {
            bodyObserver.observe(document.body, { childList: true, subtree: true });
            var headAction = document.querySelector('.head__action.open--search');
            if (headAction) {
                observer.observe(headAction, { childList: true, attributes: true, subtree: true });
            }
            // Также отслеживаем изменения в head__actions контейнере
            var headActionsContainer = document.querySelector('.head__actions');
            if (headActionsContainer) {
                observer.observe(headActionsContainer, { childList: true, attributes: true, subtree: true });
            }
        }
    } catch (err) {
        
    }
}

function replaceDrxaosSettingsIcon() {
    try {
        if (typeof document === 'undefined') return;

        var newIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="#D20202" stroke="#D20202" stroke-width="10" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="0.3" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>';

        function apply(target) {
            var scope = target || document;
            var icons = scope.querySelectorAll('.settings-folder[data-component="drxaos_themes"] .settings-folder__icon');
            if (!icons || !icons.length) return;
            icons.forEach(function(iconWrap) {
                if (!iconWrap) return;
                var current = iconWrap.querySelector('svg');
                if (current && current.hasAttribute('data-drxaos-settings-icon')) return;
                iconWrap.innerHTML = newIcon;
                var inserted = iconWrap.querySelector('svg');
                if (inserted) {
                    inserted.setAttribute('data-drxaos-settings-icon', 'true');
                }
            });
            
            // Добавляем иконку в конец текста
            var names = scope.querySelectorAll('.settings-folder[data-component="drxaos_themes"] .settings-folder__name');
            names.forEach(function(nameEl) {
                if (!nameEl) return;
                // Проверяем, не добавлена ли уже иконка
                if (nameEl.querySelector('svg[data-drxaos-settings-icon-text]')) return;
                // Используем ту же иконку для текста
                var textIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="#D20202" stroke="#D20202" stroke-width="10" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="0.3" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>';
                // Создаем обертку для иконки в тексте
                var iconSpan = document.createElement('span');
                iconSpan.style.display = 'inline-block';
                iconSpan.style.marginLeft = '0.5em';
                iconSpan.style.verticalAlign = 'middle';
                iconSpan.style.width = '1.2em';
                iconSpan.style.height = '1.2em';
                iconSpan.innerHTML = textIcon;
                var svgInSpan = iconSpan.querySelector('svg');
                if (svgInSpan) {
                    svgInSpan.style.width = '100%';
                    svgInSpan.style.height = '100%';
                    svgInSpan.setAttribute('data-drxaos-settings-icon-text', 'true');
                }
                nameEl.appendChild(iconSpan);
            });
        }

        apply();
        setTimeout(apply, 500);
        setTimeout(apply, 1500);

        var observer = new MutationObserver(function(mutations) {
            var shouldApply = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType !== 1) continue;
                        if (node.classList && node.classList.contains('settings-folder') && node.getAttribute('data-component') === 'drxaos_themes') {
                            shouldApply = true;
                            break;
                        }
                        if (node.querySelector && node.querySelector('.settings-folder[data-component="drxaos_themes"]')) {
                            shouldApply = true;
                            break;
                        }
                    }
                }
            });
            if (shouldApply) {
                setTimeout(apply, 50);
            }
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    } catch (err) {
        
    }
}

function replaceHeadMenuIcon() {
    try {
        // Анимированная SVG иконка меню
        var animatedMenuIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#FF0511" stroke="#FF0511" stroke-width="2" r="15" cx="40" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#FF0511" stroke="#FF0511" stroke-width="2" r="15" cx="100" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#FF0511" stroke="#FF0511" stroke-width="2" r="15" cx="160" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>';

        function replaceIcon() {
            var menuIcon = document.querySelector('.head__menu-icon');
            if (!menuIcon) return;

            var svg = menuIcon.querySelector('svg');
            if (svg && !svg.hasAttribute('data-drxaos-replaced')) {
                svg.outerHTML = animatedMenuIcon;
                // Помечаем как замененный, чтобы не заменять повторно
                var newSvg = menuIcon.querySelector('svg');
                if (newSvg) {
                    newSvg.setAttribute('data-drxaos-replaced', 'true');
                }
            }
        }

        // Вызываем сразу и через небольшую задержку для динамически добавленных элементов
        replaceIcon();
        setTimeout(replaceIcon, 500);
        setTimeout(replaceIcon, 1500);

        // Отслеживаем изменения в DOM
        var observer = new MutationObserver(function(mutations) {
            var shouldReplace = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('head__menu-icon')) {
                                shouldReplace = true;
                                break;
                            }
                            if (node.querySelector && node.querySelector('.head__menu-icon')) {
                                shouldReplace = true;
                                break;
                            }
                        }
                    }
                }
                // Также проверяем изменения атрибутов у существующего элемента
                if (mutation.target && mutation.target.classList && mutation.target.classList.contains('head__menu-icon')) {
                    shouldReplace = true;
                }
            });
            if (shouldReplace) {
                setTimeout(replaceIcon, 100);
            }
        });

        // Отслеживаем появление head__menu-icon
        var bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('head__menu-icon')) {
                                setTimeout(replaceIcon, 100);
                            }
                            if (node.querySelector && node.querySelector('.head__menu-icon')) {
                                setTimeout(replaceIcon, 100);
                            }
                        }
                    }
                }
            });
        });

        if (document.body) {
            bodyObserver.observe(document.body, { childList: true, subtree: true });
            var menuIcon = document.querySelector('.head__menu-icon');
            if (menuIcon) {
                observer.observe(menuIcon, { childList: true, attributes: true, attributeFilter: ['class'] });
            }
        }
    } catch (err) {
        
    }
}

function enhanceMobileBottomMenu() {
    try {
        // Современные SVG иконки для нижнего меню
        var modernIcons = {
            'backward': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
            'home': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
            'search': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
            'settings': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none"><style>@keyframes rotate{0%{transform:rotateZ(0)}to{transform:rotateZ(360deg)}}</style><g style="animation:rotate 3s cubic-bezier(.7,-.03,.26,1.05) both infinite;transform-origin:center center" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke="#0A0A30" d="M5.262 15.329l.486.842a1.49 1.49 0 002.035.55 1.486 1.486 0 012.036.529c.128.216.197.463.2.714a1.493 1.493 0 001.493 1.536h.979a1.486 1.486 0 001.485-1.493 1.493 1.493 0 011.493-1.471c.252.002.498.071.714.2a1.493 1.493 0 002.036-.55l.521-.857a1.493 1.493 0 00-.542-2.036 1.493 1.493 0 010-2.586c.71-.41.952-1.318.543-2.028l-.493-.85a1.493 1.493 0 00-2.036-.579 1.479 1.479 0 01-2.029-.543 1.428 1.428 0 01-.2-.714c0-.825-.668-1.493-1.492-1.493h-.98c-.82 0-1.488.664-1.492 1.486a1.485 1.485 0 01-1.493 1.493 1.521 1.521 0 01-.714-.2 1.493 1.493 0 00-2.036.542l-.514.858a1.486 1.486 0 00.543 2.035 1.486 1.486 0 01.543 2.036c-.13.226-.317.413-.543.543a1.493 1.493 0 00-.543 2.028v.008z" clip-rule="evenodd"/><path stroke="#265BFF" d="M12.044 10.147a1.853 1.853 0 100 3.706 1.853 1.853 0 000-3.706z"/></g></svg>'
        };

        function replaceIcons() {
            var navBar = document.querySelector('.navigation-bar');
            if (!navBar) return;

            // Заменяем иконки
            var items = navBar.querySelectorAll('.navigation-bar__item');
            items.forEach(function(item) {
                var action = item.getAttribute('data-action');
                var iconContainer = item.querySelector('.navigation-bar__icon');
                if (!iconContainer) return;

                var svg = iconContainer.querySelector('svg');
                if (!svg) return;

                // Определяем тип иконки по data-action
                var iconType = null;
                if (action === 'back') iconType = 'backward';
                else if (action === 'main') iconType = 'home';
                else if (action === 'search') iconType = 'search';
                else if (action === 'settings') iconType = 'settings';

                if (iconType && modernIcons[iconType]) {
                    svg.outerHTML = modernIcons[iconType];
                }
            });
        }

        // Вызываем сразу и через небольшую задержку для динамически добавленных элементов
        replaceIcons();
        setTimeout(replaceIcons, 500);
        setTimeout(replaceIcons, 1500);

        // Отслеживаем изменения в DOM
        var observer = new MutationObserver(function(mutations) {
            var shouldReplace = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('navigation-bar__item')) {
                                shouldReplace = true;
                                break;
                            }
                            if (node.querySelector && node.querySelector('.navigation-bar__item')) {
                                shouldReplace = true;
                                break;
                            }
                        }
                    }
                }
            });
            if (shouldReplace) {
                setTimeout(replaceIcons, 100);
            }
        });

        var navBar = document.querySelector('.navigation-bar');
        if (navBar) {
            observer.observe(navBar, { childList: true, subtree: true });
        }

        // Также отслеживаем появление navigation-bar
        var bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('navigation-bar')) {
                                setTimeout(replaceIcons, 100);
                                observer.observe(node, { childList: true, subtree: true });
                            }
                            if (node.querySelector && node.querySelector('.navigation-bar')) {
                                setTimeout(replaceIcons, 100);
                                var found = node.querySelector('.navigation-bar');
                                if (found) {
                                    observer.observe(found, { childList: true, subtree: true });
                                }
                            }
                        }
                    }
                }
            });
        });

        if (document.body) {
            bodyObserver.observe(document.body, { childList: true, subtree: true });
        }
    } catch (err) {
        
    }
}

function startPlugin() {
    try {
        // Определяем Android (включая TV)
        var isAndroid = /Android/i.test(navigator.userAgent);
        
        if (isAndroid) {
            // Добавляем класс для всех Android устройств
            document.body.classList.add('drxaos-android-mobile');
        }
        
        // TRACK NAVIGATION: Обновляем время последней навигации при нажатии клавиш
        // Фокус-обработчики выключены, чтобы не влиять на системный outline
        // OBSERVER/JANITOR disabled to avoid killing physical focus on TV

        ensureExternalProxyCompatibility();
        
        // FIX: Принудительный скролл для эпизодов
        styleManager.setStyle('drxaos-global-fixes', DRXAOS_GLOBAL_CSS);
        
        // FIX: Принудительный скролл для эпизодов, которые остаются за экраном
        document.addEventListener('focusin', function(e) {
            try {
                if (e.target && e.target.classList && (e.target.classList.contains('online-prestige') || e.target.closest('.online-prestige'))) {
                    var target = e.target.classList.contains('online-prestige') ? e.target : e.target.closest('.online-prestige');
                    requestAnimationFrame(function() {
                        try {
                            target.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
                        } catch (err) {}
                    });
                }
            } catch(e) {}
        }, true);

        initDrxaosGlobalObserver();
        renderingOptimizer.applyOptimizations();
        setTimeout(function() {
            renderingOptimizer.fixDeprecatedSliders();
        }, 1000);
    renderingOptimizer.setupDynamicElementObserver();

// Добавляем настройки с повторными попытками для Android Mobile
addSettings();

var theme = Lampa.Storage.get('drxaos_theme', 'midnight');
applyTheme(theme);
applyAdvancedSettings();
applyFontFamily();
applyDetailsStyles();
applyReactionsPanelStyles();
applyRateLineStyles();
applyXuyampisheMode();
syncActionButtons();
enhanceMobileBottomMenu();
replaceHeadMenuIcon();
replaceHeadBackwardIcon();
replaceHeadBackwardButtonIcon();
replaceSettingsIcon();
replaceSearchIcon();
replaceDrxaosSettingsIcon();
window.drxaosButtonsHandler = function(mutations) {
    var isAndroid = /Android/i.test(navigator.userAgent);
    var shouldUpdate = true;
    
    if (Array.isArray(mutations)) {
        shouldUpdate = mutations.some(function(mutation) {
            if (!mutation) return false;
            if (mutation.addedNodes && mutation.addedNodes.length) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    if (nodeTouchesButtons(mutation.addedNodes[i])) return true;
                }
            }
            if (mutation.removedNodes && mutation.removedNodes.length) {
                for (var j = 0; j < mutation.removedNodes.length; j++) {
                    if (nodeTouchesButtons(mutation.removedNodes[j])) return true;
                }
            }
            var target = mutation.target;
            if (nodeTouchesButtons(target)) return true;
            return false;
        });
    }
    
    if (shouldUpdate) {
        if (window.drxaosSyncTimer) clearTimeout(window.drxaosSyncTimer);
        // Increased delay for Android to prevent focus glitching during navigation
        var delay = isAndroid ? 350 : 50;
        window.drxaosSyncTimer = setTimeout(function() {
        syncActionButtons();
        }, delay);
    }

    function nodeTouchesButtons(node) {
        if (!node || node.nodeType !== 1) return false;
        if (node.matches && node.matches('.full-start__buttons, .full-start-new__buttons, .full-start__button')) return true;
        if (node.closest && node.closest('.full-start__buttons, .full-start-new__buttons')) return true;
        if (node.querySelector && node.querySelector('.full-start__buttons, .full-start-new__buttons, .full-start__button')) return true;
        return false;
    }
};
/*
    if (window.requestIdleCallback) {
        requestIdleCallback(function() {
            drxaosApplyBadgeSettings();
            applySourceFilter();
            applyMovieQuality();
            syncActionButtons();
        }, { timeout: 2000 });
    } else {
        setTimeout(function() {
            drxaosApplyBadgeSettings();
            applySourceFilter();
            applyMovieQuality();
            syncActionButtons();
        }, 1000);
    }
*/
// Добавляем кнопку быстрой смены темы
addQuickThemeButton();
pinSettingsComponentTop();
Lampa.Listener.follow('full', function(e) {
    if (e.type === 'complite') {
        var render = e.object && e.object.activity ? e.object.activity.render() : null;
        if (!render) return;

            // HELPER: Apply all full-card fixes
            var applyFixes = function() {
                if (render) {
                // Upgrade Images
                try {
                    var upgradeSrc = function(el, attr) {
                        var src = attr === 'background-image' ? el.css('background-image') : el.attr('src');
                        if (src && src.indexOf('/t/p/') !== -1 && src.indexOf('original') === -1) {
                            var newSrc = src.replace(/\/t\/p\/w\d+/, '/t/p/original');
                            if (attr === 'background-image') el.css('background-image', newSrc);
                            else el.attr('src', newSrc);
                        }
                    };
                    render.find('.full-start-new__poster img, .full-start__poster img, .poster img').each(function() { upgradeSrc($(this), 'src'); });
                    render.find('.full-start-new__bg img, .full-start__bg img, .full-start__background, .full-start-new__background').each(function() { upgradeSrc($(this), 'src'); });
                    render.find('.full-start-new__bg, .full-start__bg').each(function() { if (!$(this).find('img').length) upgradeSrc($(this), 'background-image'); });
                } catch(err) {}
                drxaosMergeDetailsAndRateLine(render);
            }
            // Sync Buttons (Idempotent & Robust)
            syncActionButtons(render);
        };

        // 1. Attempt immediately
        applyFixes();

            // 2. Setup MutationObserver for dynamic updates (Lampa enrichment)
            // This replaces the unreliable setTimeout(300)
            if (typeof MutationObserver !== 'undefined') {
                var activity = e.object.activity;
                
                // Disconnect previous observer if any
                if (activity.__drxaosObserver) {
                    activity.__drxaosObserver.disconnect();
                }
                
                var observer = new MutationObserver(function(mutations) {
                    // Debounce fixes to avoid thrashing
                    if (!activity) return;
                if (activity.__drxaosFixTimer) clearTimeout(activity.__drxaosFixTimer);
                activity.__drxaosFixTimer = setTimeout(function() {
                    applyFixes();
                }, 50);
            });
            
            observer.observe(render[0], { childList: true, subtree: true });
            activity.__drxaosObserver = observer;
        } else {
            // Fallback for very old environments
            setTimeout(applyFixes, 300);
            setTimeout(applyFixes, 1000);
        }
    }
});
        
        // Сообщение об успешной инициализации
        console.log('[DRXAOS Themes] Плагин успешно инициализирован');
    } catch(e) {
    }
}
if (window.appready) {
    try {
        startPlugin();
    } catch(e) {
    }
} else {
    try {
Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                try {
                    startPlugin();
                } catch(e) {
                }
            }
        });
    } catch(e) {
    }
}
    if (window.Lampa) {
        try {
        $(document).ready(function() {
            setTimeout(function() {
                    try {
                applyAdvancedSettings();
                        var theme = Lampa.Storage.get('drxaos_theme', 'midnight');
                        applyTheme(theme);
                    } catch(e) {
                    }
            }, 1000);
        });
        } catch(e) {
        }
    }
    $(document).on('keydown.drxaosGlobalEsc', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            var $modal = $('.drxaos-quick-theme-modal');
            if ($modal.length > 0 && $modal.is(':visible')) {
                $modal.fadeOut(200, function() {
                    $modal.remove();
                });
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }
                setTimeout(function() {
                    var $btn = $('#drxaos-quick-theme-btn');
                    if ($btn.length) {
                        $// // // btn.focus() // УБРАН АВТОФОКУС // УБРАН АВТОФОКУС // УБРАН АВТОФОКУС;
                    }
                }, 300);
            }
        }
    });
    (function() {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('torrent-serial')) {
                                applyTorrentSerialStyles(node);
                            }
                            var torrentSerials = node.querySelectorAll && node.querySelectorAll('.torrent-serial');
                            if (torrentSerials && torrentSerials.length > 0) {
                                torrentSerials.forEach(function(item) {
                                    applyTorrentSerialStyles(item);
                                });
                            }
                            if (node.classList && node.classList.contains('selectbox-item')) {
                                applySelectboxStyles(node);
                            }
                            var selectboxItems = node.querySelectorAll && node.querySelectorAll('.selectbox-item');
                            if (selectboxItems && selectboxItems.length > 0) {
                                selectboxItems.forEach(function(item) {
                                    applySelectboxStyles(item);
                                });
                            }
                        }
                    });
                }
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
            function applyTorrentSerialStyles(item) {
                item.style.setProperty('display', 'flex', 'important');
                item.style.setProperty('flex-direction', 'row', 'important');
                item.style.setProperty('align-items', 'flex-start', 'important');
                item.style.setProperty('gap', '1em', 'important');
                item.style.setProperty('background', 'rgba(var(--bg-rgb, 12, 12, 12), 0.35)', 'important');
                item.style.setProperty('border', '1px solid rgba(var(--primary-rgb), 0.25)', 'important');
                item.style.setProperty('border-radius', '0.6em', 'important');
                item.style.setProperty('padding', '1em', 'important');
                item.style.setProperty('margin', '0.5em 0', 'important');
                item.style.setProperty('min-height', '140px', 'important');
                item.style.setProperty('transition', 'background 0.25s ease, border 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease', 'important');
                item.style.setProperty('position', 'relative', 'important');
                item.style.setProperty('overflow', 'hidden', 'important');
                var poster = item.querySelector('.torrent-serial__img');
                if (poster) {
                    poster.style.setProperty('width', '80px', 'important');
                    poster.style.setProperty('height', '120px', 'important');
                    poster.style.setProperty('object-fit', 'cover', 'important');
                    poster.style.setProperty('border-radius', '0.3em', 'important');
                    poster.style.setProperty('flex-shrink', '0', 'important');
                }
                var content = item.querySelector('.torrent-serial__content');
                if (content) {
                    content.style.setProperty('flex', '1', 'important');
                    content.style.setProperty('padding', '0', 'important');
                    content.style.setProperty('min-width', '0', 'important');
                }
                var sections = item.querySelectorAll('.torrent-files, .tracks-metainfo');
                sections.forEach(function(section) {
                    section.style.setProperty('margin-top', '0.5em', 'important');
                    section.style.setProperty('padding', '0', 'important');
                    section.style.setProperty('background', 'transparent', 'important');
                    section.style.setProperty('border', 'none', 'important');
                    section.style.setProperty('border-radius', '0', 'important');
                });
                var audioItems = item.querySelectorAll('.tracks-metainfo__item');
                audioItems.forEach(function(audioItem) {
                    audioItem.style.setProperty('display', 'flex', 'important');
                    audioItem.style.setProperty('flex-direction', 'row', 'important');
                    audioItem.style.setProperty('flex-wrap', 'nowrap', 'important');
                    audioItem.style.setProperty('align-items', 'center', 'important');
                    audioItem.style.setProperty('gap', '0.3em', 'important');
                    audioItem.style.setProperty('padding', '0.4em 0.6em', 'important');
                    audioItem.style.setProperty('margin', '0', 'important');
                    audioItem.style.setProperty('font-size', '0.9em', 'important');
                    audioItem.style.setProperty('background', 'transparent', 'important');
                    audioItem.style.setProperty('border', 'none', 'important');
                    audioItem.style.setProperty('border-bottom', '1px solid rgba(255, 255, 255, 0.05)', 'important');
                    audioItem.style.setProperty('border-radius', '0', 'important');
                    audioItem.style.setProperty('min-height', '2em', 'important');
                    audioItem.style.setProperty('max-height', '3em', 'important');
                    audioItem.style.setProperty('overflow', 'hidden', 'important');
                    var columns = audioItem.querySelectorAll('[class*="tracks-metainfo__column"]');
                    columns.forEach(function(col) {
                        col.style.setProperty('display', 'inline-block', 'important');
                        col.style.setProperty('padding', '0.2em 0.4em', 'important');
                        col.style.setProperty('margin', '0', 'important');
                        col.style.setProperty('font-size', '0.85em', 'important');
                        col.style.setProperty('white-space', 'nowrap', 'important');
                        col.style.setProperty('background', 'rgba(255, 255, 255, 0.05)', 'important');
                        col.style.setProperty('border-radius', '0.2em', 'important');
                        col.style.setProperty('flex-shrink', '0', 'important');
                    });
                });
            var lines = item.querySelectorAll('.tracks-metainfo__line');
            lines.forEach(function(line) {
                line.style.setProperty('display', 'flex', 'important');
                line.style.setProperty('align-items', 'center', 'important');
                line.style.setProperty('gap', '0.5em', 'important');
                line.style.setProperty('padding', '0.4em 0.6em', 'important');
                line.style.setProperty('margin', '0.2em 0', 'important');
                line.style.setProperty('font-size', '0.9em', 'important');
                line.style.setProperty('background', 'transparent', 'important');
                line.style.setProperty('border', 'none', 'important');
                line.style.setProperty('border-bottom', '1px solid rgba(255, 255, 255, 0.05)', 'important');
                line.style.setProperty('border-radius', '0', 'important');
            });
            var scrollBody = item.querySelector('.scroll__body');
            if (scrollBody) {
                scrollBody.style.setProperty('padding', '0', 'important');
            }
            var sectionTitles = item.querySelectorAll('.torrent-files__title, .tracks-metainfo__title');
            sectionTitles.forEach(function(title) {
                title.style.setProperty('font-size', '1em', 'important');
                title.style.setProperty('padding', '0.5em 0', 'important');
                title.style.setProperty('margin', '0', 'important');
                title.style.setProperty('opacity', '0.7', 'important');
            });
        }
        function applySelectboxStyles(item) {
            var poster = item.querySelector('.selectbox-item__poster');
            if (poster) {
                poster.style.setProperty('display', 'none', 'important');
            }
            var icon = item.querySelector('.selectbox-item__icon');
        if (icon) {
            icon.style.setProperty('display', 'none', 'important');
        }
        item.style.setProperty('background', 'transparent', 'important');
        item.style.setProperty('border', 'none', 'important');
        item.style.setProperty('border-bottom', '1px solid rgba(255, 255, 255, 0.95)', 'important');
        item.style.setProperty('border-radius', '0', 'important');
        item.style.setProperty('padding', '0.8em 1em', 'important');
        item.style.setProperty('margin', '0', 'important');
        item.style.setProperty('position', 'relative', 'important');
        item.style.setProperty('overflow', 'hidden', 'important');
        item.style.setProperty('z-index', '0', 'important');
        var title = item.querySelector('.selectbox-item__title');
        if (title) {
            title.style.setProperty('font-size', '1.1em', 'important');
            title.style.setProperty('line-height', '1.3', 'important');
            title.style.setProperty('padding', '0', 'important');
            }
            var subtitle = item.querySelector('.selectbox-item__subtitle');
            if (subtitle) {
                subtitle.style.setProperty('font-size', '0.995em', 'important');
                subtitle.style.setProperty('margin-top', '0.3em', 'important');
                subtitle.style.setProperty('opacity', '0.7', 'important');
            }
        }
        var existingSerials = document.querySelectorAll('.torrent-serial');
        existingSerials.forEach(function(item) {
            applyTorrentSerialStyles(item);
        });
        var existingItems = document.querySelectorAll('.selectbox-item');
        existingItems.forEach(function(item) {
            applySelectboxStyles(item);
        });
        if (typeof MutationObserver !== 'undefined') {
            var tracksObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        var item = mutation.target;
                        if (item.classList.contains('tracks-metainfo__item') && 
                            item.style.flexWrap !== 'nowrap') {
                            item.style.setProperty('flex-wrap', 'nowrap', 'important');
                        }
                    }
                });
            });
            tracksObserver.observe(document.body, {
                attributes: true,
                attributeFilter: ['style'],
                subtree: true,
                attributeOldValue: false
            });
            
        } else {
            
        setInterval(function() {
            var allAudioItems = document.querySelectorAll('.tracks-metainfo__item');
            allAudioItems.forEach(function(audioItem) {
                if (audioItem.style.flexWrap !== 'nowrap') {
                    audioItem.style.setProperty('flex-wrap', 'nowrap', 'important');
                }
            });
            }, 100);
        }
    })();
function applyModalOpacity() {
    var opacity = 0.995;
    document.documentElement.style.setProperty('--modal-opacity', opacity);
}
Lampa.Storage.listener.follow('change', function(e) {});
Lampa.Listener.follow('activity', function(e) {
    if (e.type === 'start') {
        setTimeout(applyModalOpacity, 300);
        drxaosSyncMadnessMode();
    }
});
Lampa.Listener.follow('activity', function(e) {
    if (e.type === 'start') {
        setTimeout(function() {
            syncActionButtons();
        }, 500);
        drxaosSyncMadnessMode();
    }
});
setTimeout(applyModalOpacity, 500);

    // ╔════════════════════════════════════════════════════════════════════════╗
    // ║                    🛠️ UTILITIES BUTTON MODULE 🛠️                      ║
    // ║  Современный модуль утилит с чистой архитектурой                       ║
    // ╚════════════════════════════════════════════════════════════════════════╝
    
    (function initUtilitiesButton() {
        
        var UtilitiesButton = {
            elements: {
                button: null,
                menu: null
            },
            
            state: {
                isMenuOpen: false,
                isEnabled: false,
                controllerActive: false,
                backHandlerAttached: false,
                lastToggleAt: 0,
                lastToggleType: '',
                togglePending: false,
                injectTimer: null
            },
            
            icons: {
                utilities: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" fill="currentColor"><path d="m0,12.402,35.687-4.8602,0.0156,34.423-35.67,0.20313zm35.67,33.529,0.0277,34.453-35.67-4.9041-0.002-29.78zm4.3261-39.025,47.318-6.906,0,41.527-47.318,0.37565zm47.329,39.349-0.0111,41.34-47.318-6.6784-0.0663-34.739z"/></svg>'
            },
            
            templates: {
                button: function() {
                    return '<div id="drxaos-utils-btn" class="head__action selector" style="position:relative;">' +
                           '  <div class="utils-icon" style="width:1.5em;height:1.5em;display:flex;align-items:center;justify-content:center;">' + UtilitiesButton.icons.utilities + '</div>' +
                           '</div>';
                },
                
                menu: function() {
                    return '<div id="drxaos-utils-menu" class="drxaos-utils-menu selector" style="display:none;">' +
                           '  <div class="utils-menu-item selector" data-action="reload" tabindex="0">' +
                           '    <span class="utils-menu-icon">🔄</span>' +
                           '    <span class="utils-menu-text">Перезагрузка</span>' +
                           '  </div>' +
                           '  <div class="utils-menu-item selector" data-action="console" tabindex="0">' +
                           '    <span class="utils-menu-icon">💻</span>' +
                           '    <span class="utils-menu-text">Консоль</span>' +
                           '  </div>' +
                           '  <div class="utils-menu-item selector" data-action="exit" tabindex="0">' +
                           '    <span class="utils-menu-icon">❌</span>' +
                           '    <span class="utils-menu-text">Выход</span>' +
                           '  </div>' +
                           '</div>';
                },
                
                styles: function() {
                    return '<style id="drxaos-utils-styles">' +
                           '#drxaos-utils-btn { transition: transform 0.3s ease, opacity 0.3s ease; cursor: pointer !important; }' +
                           '#drxaos-utils-btn:hover { transform: none !important; }' +
                           '#drxaos-utils-btn.focus { transform: none !important; }' +
                           '#drxaos-utils-btn .utils-icon { width: 1.5em; height: 1.5em; display: flex; align-items: center; justify-content: flex-start; }' +
                           '#drxaos-utils-btn .utils-icon svg { width: 100%; height: 100%; fill: currentColor; filter: drop-shadow(0 0 4px var(--theme-primary, #5a3494)); }' +
                           '#drxaos-utils-btn:hover .utils-icon svg, #drxaos-utils-btn.focus .utils-icon svg { filter: drop-shadow(0 0 8px var(--theme-primary, #5a3494)); }' +
                           '.drxaos-utils-menu {' +
                           '  position: absolute;' +
                           '  top: calc(100% + 0.5em);' +
                           '  right: 0;' +
                           '  background: rgba(0, 0, 0, var(--drxaos-surface-opacity));' +
                           '  ' +
                           '  border: 2px solid var(--theme-primary, #5a3494);' +
                           '  border-radius: 0.8em;' +
                           '  padding: 0.5em;' +
                           '  min-width: 14em;' +
                           '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);' +
                           '  z-index: 10000;' +
                           '  animation: fadeInDown 0.3s ease;' +
                           '}' +
                           '@keyframes fadeInDown {' +
                           '  from { opacity: 0; transform: translateY(-10px); }' +
                           '  to { opacity: 1; transform: translateY(0); }' +
                           '}' +
                           '.utils-menu-item {' +
                           '  display: flex;' +
                           '  align-items: center;' +
                           '  padding: 0.8em 1em;' +
                           '  border-radius: 0.5em;' +
                           '  cursor: pointer;' +
                           '  transition: transform 0.2s ease, opacity 0.2s ease;' +
                           '  gap: 0.8em;' +
                           '  background: transparent;' +
                           '  color: #ffffff;' +
                           '}' +
                            '.utils-menu-item:hover, .utils-menu-item.focus, .utils-menu-item:focus {' +
                           '  background: var(--theme-primary, #5a3494) !important;' +
                           '  color: #ffffff !important;' +
                           // '  transform: translateX(4px);' + // DISABLED: Layout shift on hover/focus causes scroll jump
                           '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);' +
                           '  outline: none;' +
                           '}' +
                           '.utils-menu-icon {' +
                           '  font-size: 1.8em;' +
                           '  line-height: 1;' +
                           '  display: flex;' +
                           '  align-items: center;' +
                           '  justify-content: flex-start;' +
                           '  flex-shrink: 0;' +
                           '}' +
                           '.utils-menu-text {' +
                           '  font-size: 1.1em;' +
                           '  font-weight: 500;' +
                           '  white-space: nowrap;' +
                           '  color: inherit;' +
                           '}' +
                           '</style>';
                }
            },
            
            actions: {
                reload: function() {
                    
                    location.reload();
                },
                
                console: function() {
                    
                    if (window.Lampa && window.Lampa.Controller) {
                        Lampa.Controller.toggle('console');
                    }
                },
                
                exit: function() {
                    
                    
                    if (window.Lampa && window.Lampa.Activity) {
                        Lampa.Activity.out();
                    }
                    
                    setTimeout(function() {
                        if (window.Lampa && window.Lampa.Platform) {
                            if (Lampa.Platform.is('tizen')) {
                                try { tizen.application.getCurrentApplication().exit(); } catch(e) {}
                            } else if (Lampa.Platform.is('webos')) {
                                try { window.close(); } catch(e) {}
                            } else if (Lampa.Platform.is('android')) {
                                try { Lampa.Android.exit(); } catch(e) {}
                            } else if (Lampa.Platform.is('orsay')) {
                                try { Lampa.Orsay.exit(); } catch(e) {}
                            }
                        }
                        
                        try { window.close(); } catch(e) {}
                    }, 100);
                }
            },
            
            openMenu: function() {
                if (!UtilitiesButton.elements.menu) return;
                $(UtilitiesButton.elements.menu).show();
                UtilitiesButton.state.isMenuOpen = true;
                drxaosEnterFocusLock('utils-menu');
                UtilitiesButton.focusFirstMenuItem();
            },
            
            toggleMenu: function() {
                if (!UtilitiesButton.elements.menu || UtilitiesButton.state.togglePending) return;
                UtilitiesButton.state.togglePending = true;
                var raf = window.requestAnimationFrame || function(cb) { return setTimeout(cb, 16); };
                raf(function() {
                    if (UtilitiesButton.state.isMenuOpen) {
                        UtilitiesButton.closeMenu();
                    } else {
                        UtilitiesButton.openMenu();
                    }
                    UtilitiesButton.state.togglePending = false;
                });
            },
            
            closeMenu: function(restoreFocus) {
                if (UtilitiesButton.elements.menu) {
                    $(UtilitiesButton.elements.menu).hide();
                    UtilitiesButton.state.isMenuOpen = false;
                    UtilitiesButton.state.controllerActive = false;
                    drxaosLeaveFocusLock('utils-menu');
                }
                if (restoreFocus !== false) {
                    UtilitiesButton.restoreFocusToButton();
                }
            },
            
            focusFirstMenuItem: function() {
                if (!UtilitiesButton.elements.menu) return;
                var $menu = $(UtilitiesButton.elements.menu);
                var $items = $menu.find('.utils-menu-item');
                
                if (window.Lampa && window.Lampa.Controller) {
                    if (typeof Lampa.Controller.collectionSet === 'function') {
                        Lampa.Controller.collectionSet($menu);
                    }
                    UtilitiesButton.state.controllerActive = true;
                    var focusTarget = $items.eq(0);
                    var raf = window.requestAnimationFrame || function(cb) { return setTimeout(cb, 16); };
                    raf(function() {
                        if (!focusTarget.length) return;
                        var targetNode = focusTarget.get(0);
                        if (!targetNode) return;
                        if (typeof Lampa.Controller.collectionFocus === 'function') {
                            Lampa.Controller.collectionFocus(targetNode, $menu);
                        } else if (typeof Lampa.Controller.focus === 'function') {
                            Lampa.Controller.focus(targetNode);
                        } else {
                            targetNode.focus();
                        }
                    });
                } else if ($items.length) {
                    $items.get(0).focus();
                }
            },
            
            restoreFocusToButton: function() {
                if (!UtilitiesButton.elements.button) return;
                // DISABLED: Do not auto-restore focus to button, let Lampa or user handle it
                /*
                if (window.Lampa && window.Lampa.Controller && typeof Lampa.Controller.focus === 'function') {
                    var raf = window.requestAnimationFrame || function(cb) { return setTimeout(cb, 16); };
                    raf(function() {
                        Lampa.Controller.focus(UtilitiesButton.elements.button);
                    });
                } else {
                    UtilitiesButton.elements.button.focus();
                }
                */
            },
            
            handleMenuItemAction: function(action) {
                UtilitiesButton.closeMenu();
                
                if (UtilitiesButton.actions[action]) {
                    var raf = window.requestAnimationFrame || function(cb) { return setTimeout(cb, 16); };
                    raf(function() {
                        UtilitiesButton.actions[action]();
                    });
                }
            },
            
            handleBack: function() {
                if (UtilitiesButton.state.isMenuOpen) {
                    UtilitiesButton.closeMenu();
                    return false;
                }
                return true;
            },
            
            registerBackHandler: function() {
                if (UtilitiesButton.state.backHandlerAttached) return;
                if (window.Lampa && window.Lampa.Listener) {
                    Lampa.Listener.follow('back', UtilitiesButton.handleBack);
                    UtilitiesButton.state.backHandlerAttached = true;
                }
            },
            
            bindEvents: function() {
                if (!UtilitiesButton.elements.button) return;
                
                var $btn = $(UtilitiesButton.elements.button);
                
                               
                function toggleMenu(e) {
                    var eventType = 'manual';
                    if (e) {
                        if (typeof e.preventDefault === 'function') {
                            e.preventDefault();
                        }
                        if (typeof e.stopPropagation === 'function') {
                            e.stopPropagation();
                        }
                        eventType = e.type || 'event';
                    }

                    var now = Date.now();
                    if (UtilitiesButton.state.lastToggleAt && (now - UtilitiesButton.state.lastToggleAt) < 120) {
                        if (UtilitiesButton.state.lastToggleType !== eventType) {
                            return false;
                        }
                    }
                    UtilitiesButton.state.lastToggleAt = now;
                    UtilitiesButton.state.lastToggleType = eventType;

                    var $menu = $('#drxaos-utils-menu');
                    var isVisible = $menu.is(':visible');

                    var toggleBackTarget = 'head';
                    var enabledController = (window.Lampa && Lampa.Controller && typeof Lampa.Controller.enabled === 'function') ? Lampa.Controller.enabled() : null;
                    if (!enabledController || enabledController.name !== 'head') {
                        toggleBackTarget = 'content';
                    }

                    if (isVisible) {
                        $menu.hide();
                        UtilitiesButton.state.isMenuOpen = false;
                        if (window.Lampa && Lampa.Controller) {
                            Lampa.Controller.toggle(toggleBackTarget);
                        }
                    } else {
                        $menu.show();
                        UtilitiesButton.state.isMenuOpen = true;

                        if (window.Lampa && Lampa.Controller) {
                            var utilsController = {
                                toggle: function() {},
                                render: function() { return $menu; },
                                back: function() {
                                    $menu.hide();
                                    UtilitiesButton.state.isMenuOpen = false;
                                    Lampa.Controller.toggle(toggleBackTarget);
                                },
                                left: function() { this.back(); },
                                right: function() { this.back(); },
                                up: function() {
                                    var $items = $('.utils-menu-item');
                                    var $focused = $items.filter('.focus');
                                    if (!$focused.length) { $items.first().addClass('focus').focus(); return; }
                                    var idx = $items.index($focused);
                                    if (idx > 0) { $focused.removeClass('focus'); $items.eq(idx - 1).addClass('focus').focus(); }
                                },
                                down: function() {
                                    var $items = $('.utils-menu-item');
                                    var $focused = $items.filter('.focus');
                                    if (!$focused.length) { $items.first().addClass('focus').focus(); return; }
                                    var idx = $items.index($focused);
                                    if (idx < $items.length - 1) { $focused.removeClass('focus'); $items.eq(idx + 1).addClass('focus').focus(); }
                                },
                                enter: function() {
                                    var $focused = $('.utils-menu-item.focus');
                                    if (!$focused.length) return;
                                    var action = $focused.data('action');
                                    $menu.hide();
                                    UtilitiesButton.state.isMenuOpen = false;
                                    if (action && UtilitiesButton.actions[action]) setTimeout(function() { UtilitiesButton.actions[action](); }, 100);
                                    Lampa.Controller.toggle(toggleBackTarget);
                                }
                            };

                            Lampa.Controller.add('drxaos_utils_modal', utilsController);
                            if (typeof Lampa.Controller.collectionSet === 'function') {
                                Lampa.Controller.collectionSet($menu);
                            }
                            Lampa.Controller.toggle('drxaos_utils_modal');
                        }

                        setTimeout(function() {
                            var $firstItem = $('.utils-menu-item').first();
                            $firstItem.addClass('focus').focus();
                        }, 60);
                    }
                    return false;
                }

                $btn.on('click.drxaosUtilsBtn', toggleMenu);

                // Поддержка пульта/сенсора
                $btn.on('hover:enter.drxaosUtilsBtn hover:click.drxaosUtilsBtn hover:touch.drxaosUtilsBtn', function(e){
                    toggleMenu(e);
                    return false;
                });
                
                               
                $(document).on('click.drxaosUtilsDoc', function(e) {
                    if (UtilitiesButton.state.isMenuOpen && 
                        !$(e.target).closest('#drxaos-utils-btn, #drxaos-utils-menu').length) {
                        UtilitiesButton.closeMenu();
                    }
                });
                
                $(document).on('keydown.drxaosUtils', function(e) {
                    if (!UtilitiesButton.state.isMenuOpen) return;
                    var key = e.key || e.code || e.keyCode;
                    var isEscape = key === 'Escape' || key === 'Esc' || key === 27;
                    if (isEscape) {
                        e.preventDefault();
                        e.stopPropagation();
                        UtilitiesButton.closeMenu();
                        return false;
                    }
                });
                
                if (UtilitiesButton.elements.menu) {
                    var $menu = $(UtilitiesButton.elements.menu);
                    
                    $menu.on('click.drxaosUtilsMenu', '.utils-menu-item', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var action = $(this).data('action');
                        UtilitiesButton.handleMenuItemAction(action);
                        return false;
                    });
                    
                    $menu.on('hover:enter.drxaosUtilsMenu hover:click.drxaosUtilsMenu hover:touch.drxaosUtilsMenu', '.utils-menu-item', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var action = $(this).data('action');
                        UtilitiesButton.handleMenuItemAction(action);
                        return false;
                    });
                }
            },
            
            inject: function() {
                if (!CONFIG.FEATURES.UTILITIES_BUTTON || !drxaosIsUtilitiesEnabled()) return;
                if (UtilitiesButton.state.injectTimer) {
                    clearTimeout(UtilitiesButton.state.injectTimer);
                    UtilitiesButton.state.injectTimer = null;
                }
                var headActions = document.querySelector('.head__actions');
                if (!headActions) {
                    UtilitiesButton.state.injectTimer = setTimeout(UtilitiesButton.inject, 500);
                    return;
                }
                
                if (document.getElementById('drxaos-utils-btn')) return;
                
                if (!document.getElementById('drxaos-utils-styles')) {
                    $('head').append(UtilitiesButton.templates.styles());
                }
                
                $(headActions).append(UtilitiesButton.templates.button());
                UtilitiesButton.elements.button = document.getElementById('drxaos-utils-btn');
                
                if (!UtilitiesButton.elements.button) return;
                
                $(UtilitiesButton.elements.button).append(UtilitiesButton.templates.menu());
                UtilitiesButton.elements.menu = document.getElementById('drxaos-utils-menu');
                
                if (!UtilitiesButton.elements.menu) return;
                
                UtilitiesButton.bindEvents();
                UtilitiesButton.state.isEnabled = true;
            },
            
            destroy: function() {
                if (UtilitiesButton.state.injectTimer) {
                    clearTimeout(UtilitiesButton.state.injectTimer);
                    UtilitiesButton.state.injectTimer = null;
                }
                $(document).off('.drxaosUtilsDoc');
                $(document).off('.drxaosUtils');
                if (UtilitiesButton.elements.menu) {
                    $(UtilitiesButton.elements.menu).off('.drxaosUtilsMenu');
                }
                if (UtilitiesButton.elements.button) {
                    $(UtilitiesButton.elements.button).off('.drxaosUtilsBtn');
                    $(UtilitiesButton.elements.button).remove();
                }
                $('#drxaos-utils-styles').remove();
                UtilitiesButton.elements.button = null;
                UtilitiesButton.elements.menu = null;
                UtilitiesButton.state.isEnabled = false;
                UtilitiesButton.state.isMenuOpen = false;
            },
            
            init: function() {
                UtilitiesButton.registerBackHandler();
                
                if (!CONFIG.FEATURES.UTILITIES_BUTTON || !drxaosIsUtilitiesEnabled()) return;
                if (window.Lampa && window.Lampa.Listener) {
                    Lampa.Listener.follow('app', function(e) {
                        if (e.type === 'ready') {
                            setTimeout(UtilitiesButton.inject, 1000);
                        }
                    });
                } else {
                    setTimeout(UtilitiesButton.inject, 2000);
                    setTimeout(UtilitiesButton.registerBackHandler, 2000);
                }
            },

            enable: function() {
                if (UtilitiesButton.state.isEnabled) return;
                CONFIG.FEATURES.UTILITIES_BUTTON = true;
                UtilitiesButton.inject();
            },

            disable: function() {
                UtilitiesButton.closeMenu(false);
                UtilitiesButton.destroy();
                CONFIG.FEATURES.UTILITIES_BUTTON = false;
            }

        };
        
        UtilitiesButton.init();
        window.drxaosUtilitiesButton = UtilitiesButton;
    })();
    
    // ╚════════════════════════════════════════════════════════════════════════╝

setTimeout(function() {
    var selectboxItems = document.querySelectorAll('.selectbox-item');
    selectboxItems.forEach(function(item) {
        addIconsToSelectboxItem(item);
    });
}, 1000);
})();


// 🎨 Force apply theme background on reload/support
(function forceBackgroundFix() {
    function applyBgFix() {
        try {
            document.querySelectorAll('.background, body').forEach(function(el) {
                var style = el.getAttribute('style');
                if (style && /background(-image)?:\s*url/.test(style)) {
                    var clean = style.replace(/background(-image)?:[^;]+;?/gi, '');
                    clean ? el.setAttribute('style', clean) : el.removeAttribute('style');
                }
            });
        } catch(e) {}
    }
    applyBgFix();
    // Observer for style changes
    var obs = new MutationObserver(function(muts) {
        var shouldRun = false;
        muts.forEach(function(m) {
            if (m.type === 'attributes' && m.attributeName === 'style') {
                var el = m.target;
                if (el.classList.contains('background') || el.tagName.toLowerCase() === 'body') {
                    shouldRun = true;
                }
            }
        });
        if (shouldRun) {
            if (window.drxaosBgFixTimer) clearTimeout(window.drxaosBgFixTimer);
            window.drxaosBgFixTimer = setTimeout(applyBgFix, 200);
        }
    });
    setTimeout(function() {
        document.querySelectorAll('.background, body').forEach(function(el) {
            obs.observe(el, { attributes: true, attributeFilter: ['style'] });
        });
    }, 500);
    setInterval(applyBgFix, 5000); // Increased interval to reduce CPU load
})();
function removeLegacyQualityBadges(cardElement) {
    try {
        if (!cardElement) return;
        var legacy = cardElement.querySelectorAll('.card__quality, .card-quality');
        legacy.forEach(function(el, index) {
            if (index > 0) {
                el.remove();
                return;
            }
            el.classList.add('card-quality');
            el.classList.remove('card__quality');
            drxaosAttachBadge(cardElement, el);
            drxaosConcealBadge(el);
            el.textContent = '';
            el.style.color = '#ffd369';
            el.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
        });
    } catch (err) {
        
    }
}
function colorizeCardVotes(cardElement) {
    try {
        if (!cardElement) return;
        var votes = cardElement.querySelectorAll('.card__vote');
        votes.forEach(function(voteEl) {
            if (!voteEl) return;
            drxaosAttachBadge(cardElement, voteEl);
            voteEl.style.removeProperty('width');
            voteEl.style.removeProperty('height');
            voteEl.style.removeProperty('margin');
            var raw = (voteEl.textContent || '').trim().replace(',', '.');
            raw = raw.replace(/\s+/g, ' ');
            var value = parseFloat(raw);
            var color = '#ffd369';
            if (!isNaN(value)) {
                if (value > 7) {
                    color = '#22c55e';
                } else if (value < 7) {
                    color = '#f87171';
                }
                voteEl.textContent = value.toFixed(1);
            } else {
                voteEl.textContent = raw;
            }
            voteEl.style.setProperty('color', color, 'important');
            voteEl.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
            drxaosSafeRevealBadge(voteEl);
        });
    } catch (err) {
        
    }
}
