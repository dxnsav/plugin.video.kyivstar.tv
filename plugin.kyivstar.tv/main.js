(function () {
    'use strict';

    var I18N = {
        "en": {
            "login_type": "Login type",
            "login_type_description": "Anonymous supports free channels. Personal account and phone OTP require an active Kyivstar TV account.",
            "login_anonymous": "Anonymous",
            "login_account": "Personal account",
            "login_phone_otp": "Phone OTP",
            "personal_account": "Personal account",
            "personal_account_description": "Used only when login type is Personal account.",
            "password": "Password",
            "password_description": "Stored locally by Lampa.",
            "phone_number": "Phone number",
            "phone_description": "Used only when login type is Phone OTP.",
            "sms_code": "SMS code",
            "sms_code_description": "Enter the SMS code here, then use Refresh session.",
            "locale": "Locale",
            "locale_description": "Language sent to Kyivstar TV API.",
            "language_uk": "Ukrainian",
            "language_en": "English",
            "language_ru": "Russian",
            "cors_proxy_description": "Optional self-hosted proxy. Use {url} as the encoded target URL placeholder.",
            "append_stream_headers": "Append stream headers",
            "append_stream_headers_description": "Adds Referer and User-Agent metadata to resolved HLS URLs.",
            "send_sms_code_now": "Send SMS code now",
            "send_sms_code_description": "Requests a phone OTP for the saved phone number.",
            "refresh_session": "Refresh session",
            "refresh_session_description": "Re-login with the selected login type.",
            "diagnostics_logs": "Diagnostics / logs",
            "diagnostics_logs_description": "Open Kyivstar TV request logs.",
            "clear_phone_otp_state": "Clear phone OTP state",
            "clear_phone_otp_description": "Clears pending anonymous phone session and SMS code.",
            "logout_clear_session": "Log out / clear session",
            "logout_clear_session_description": "Clears local Kyivstar TV session and cache.",
            "phone_otp_cleared": "Kyivstar TV phone OTP state cleared.",
            "lampa_select_unavailable": "Lampa Select API is not available.",
            "settings_suffix": "settings",
            "filled_set": "set",
            "filled_empty": "empty",
            "yes": "On",
            "no": "Off",
            "set_phone_first": "Set phone number first.",
            "sending_sms_code": "Sending SMS code...",
            "sms_code_request_sent": "SMS code request sent. Check your phone.",
            "print_logs_console": "Print logs to console",
            "clear_logs": "Clear logs",
            "diagnostics_suffix": "diagnostics",
            "logs_printed_console": "Kyivstar TV logs printed to console.",
            "session_refreshed": "Kyivstar TV session refreshed.",
            "session_cleared": "Kyivstar TV session cleared.",
            "resolving_stream": "Resolving stream...",
            "item_not_playable": "Kyivstar TV item is not playable.",
            "item_unavailable": "This item is not available for the current account.",
            "season_prefix": "Season ",
            "no_playable_episodes": "No playable episodes found.",
            "episodes": "Episodes",
            "episode_prefix": "Episode ",
            "full_card_api_unavailable": "Lampa full card API is not available.",
            "source_not_ready": "Kyivstar TV native source is not ready yet.",
            "account_password_required": "Set personal account and password in Kyivstar TV settings.",
            "phone_required": "Set phone number in Kyivstar TV settings.",
            "sms_sent_enter_refresh": "SMS code sent. Enter it in Kyivstar TV settings, then refresh the session."
        },
        "ru": {
            "login_type": "Тип входа",
            "login_type_description": "Anonymous открывает бесплатные каналы. Лицевой счет и телефонный OTP требуют активный аккаунт Kyivstar TV.",
            "login_anonymous": "Anonymous",
            "login_account": "Лицевой счет",
            "login_phone_otp": "Телефонный OTP",
            "personal_account": "Лицевой счет",
            "personal_account_description": "Используется только для входа через лицевой счет.",
            "password": "Пароль",
            "password_description": "Хранится локально в Lampa.",
            "phone_number": "Номер телефона",
            "phone_description": "Используется только для входа через телефонный OTP.",
            "sms_code": "SMS-код",
            "sms_code_description": "Введите SMS-код здесь, затем нажмите «Обновить сессию».",
            "locale": "Язык",
            "locale_description": "Язык, который плагин передает в Kyivstar TV API.",
            "language_uk": "Украинский",
            "language_en": "Английский",
            "language_ru": "Русский",
            "cors_proxy_description": "Опциональный свой proxy. Используйте {url} как placeholder для закодированного URL.",
            "append_stream_headers": "Добавлять stream headers",
            "append_stream_headers_description": "Добавляет Referer и User-Agent к HLS URL.",
            "send_sms_code_now": "Отправить SMS-код",
            "send_sms_code_description": "Запрашивает телефонный OTP для сохраненного номера.",
            "refresh_session": "Обновить сессию",
            "refresh_session_description": "Повторный вход с выбранным типом логина.",
            "diagnostics_logs": "Диагностика / логи",
            "diagnostics_logs_description": "Открыть логи запросов Kyivstar TV.",
            "clear_phone_otp_state": "Очистить состояние телефонного OTP",
            "clear_phone_otp_description": "Очищает pending anonymous phone session и SMS-код.",
            "logout_clear_session": "Выйти / очистить сессию",
            "logout_clear_session_description": "Очищает локальную сессию Kyivstar TV и cache.",
            "phone_otp_cleared": "Состояние телефонного OTP очищено.",
            "lampa_select_unavailable": "Lampa Select API недоступен.",
            "settings_suffix": "настройки",
            "filled_set": "заполнено",
            "filled_empty": "пусто",
            "yes": "Да",
            "no": "Нет",
            "set_phone_first": "Сначала укажите номер телефона.",
            "sending_sms_code": "Отправляю SMS-код...",
            "sms_code_request_sent": "SMS-код запрошен. Проверьте телефон.",
            "print_logs_console": "Вывести логи в консоль",
            "clear_logs": "Очистить логи",
            "diagnostics_suffix": "диагностика",
            "logs_printed_console": "Логи Kyivstar TV выведены в консоль.",
            "session_refreshed": "Сессия Kyivstar TV обновлена.",
            "session_cleared": "Сессия Kyivstar TV очищена.",
            "resolving_stream": "Получаю поток...",
            "item_not_playable": "Этот элемент Kyivstar TV нельзя воспроизвести.",
            "item_unavailable": "Этот элемент недоступен для текущего аккаунта.",
            "season_prefix": "Сезон ",
            "no_playable_episodes": "Не найдены доступные эпизоды.",
            "episodes": "Эпизоды",
            "episode_prefix": "Эпизод ",
            "full_card_api_unavailable": "Lampa full card API недоступен.",
            "source_not_ready": "Нативный источник Kyivstar TV еще недоступен.",
            "account_password_required": "Укажите лицевой счет и пароль в настройках Kyivstar TV.",
            "phone_required": "Укажите номер телефона в настройках Kyivstar TV.",
            "sms_sent_enter_refresh": "SMS-код отправлен. Введите его в настройках Kyivstar TV и обновите сессию."
        },
        "uk": {
            "login_type": "Тип входу",
            "login_type_description": "Anonymous відкриває безкоштовні канали. Особовий рахунок і телефонний OTP потребують активного акаунта Kyivstar TV.",
            "login_anonymous": "Anonymous",
            "login_account": "Особовий рахунок",
            "login_phone_otp": "Телефонний OTP",
            "personal_account": "Особовий рахунок",
            "personal_account_description": "Використовується тільки для входу через особовий рахунок.",
            "password": "Пароль",
            "password_description": "Зберігається локально в Lampa.",
            "phone_number": "Номер телефону",
            "phone_description": "Використовується тільки для входу через телефонний OTP.",
            "sms_code": "SMS-код",
            "sms_code_description": "Введіть SMS-код тут, потім натисніть «Оновити сесію».",
            "locale": "Мова",
            "locale_description": "Мова, яку плагін передає в Kyivstar TV API.",
            "language_uk": "Українська",
            "language_en": "Англійська",
            "language_ru": "Російська",
            "cors_proxy_description": "Опційний власний proxy. Використовуйте {url} як placeholder для закодованого URL.",
            "append_stream_headers": "Додавати stream headers",
            "append_stream_headers_description": "Додає Referer і User-Agent до HLS URL.",
            "send_sms_code_now": "Надіслати SMS-код",
            "send_sms_code_description": "Запитує телефонний OTP для збереженого номера.",
            "refresh_session": "Оновити сесію",
            "refresh_session_description": "Повторний вхід з обраним типом логіну.",
            "diagnostics_logs": "Діагностика / логи",
            "diagnostics_logs_description": "Відкрити логи запитів Kyivstar TV.",
            "clear_phone_otp_state": "Очистити стан телефонного OTP",
            "clear_phone_otp_description": "Очищає pending anonymous phone session і SMS-код.",
            "logout_clear_session": "Вийти / очистити сесію",
            "logout_clear_session_description": "Очищає локальну сесію Kyivstar TV і cache.",
            "phone_otp_cleared": "Стан телефонного OTP очищено.",
            "lampa_select_unavailable": "Lampa Select API недоступний.",
            "settings_suffix": "налаштування",
            "filled_set": "заповнено",
            "filled_empty": "порожньо",
            "yes": "Так",
            "no": "Ні",
            "set_phone_first": "Спочатку вкажіть номер телефону.",
            "sending_sms_code": "Надсилаю SMS-код...",
            "sms_code_request_sent": "SMS-код запитано. Перевірте телефон.",
            "print_logs_console": "Вивести логи в консоль",
            "clear_logs": "Очистити логи",
            "diagnostics_suffix": "діагностика",
            "logs_printed_console": "Логи Kyivstar TV виведено в консоль.",
            "session_refreshed": "Сесію Kyivstar TV оновлено.",
            "session_cleared": "Сесію Kyivstar TV очищено.",
            "resolving_stream": "Отримую потік...",
            "item_not_playable": "Цей елемент Kyivstar TV не можна відтворити.",
            "item_unavailable": "Цей елемент недоступний для поточного акаунта.",
            "season_prefix": "Сезон ",
            "no_playable_episodes": "Не знайдено доступних епізодів.",
            "episodes": "Епізоди",
            "episode_prefix": "Епізод ",
            "full_card_api_unavailable": "Lampa full card API недоступний.",
            "source_not_ready": "Нативне джерело Kyivstar TV ще недоступне.",
            "account_password_required": "Вкажіть особовий рахунок і пароль у налаштуваннях Kyivstar TV.",
            "phone_required": "Вкажіть номер телефону в налаштуваннях Kyivstar TV.",
            "sms_sent_enter_refresh": "SMS-код надіслано. Введіть його в налаштуваннях Kyivstar TV і оновіть сесію."
        }
    };

    // state.js
    var PLUGIN_BUILD = '2026-06-09-native-full-search-fixes';
    var PLUGIN_FLAG = '__kyivstar_tv_lampa_loaded_' + PLUGIN_BUILD;
    var COMPONENT = 'kyivstar_tv';
    var TITLE = 'Kyivstar TV';
    var ASSET_BASE = 'https://dxnsav.github.io/plugin.video.kyivstar.tv/plugin.kyivstar.tv/assets/';
    var API_BASE = 'https://clients.production.vidmind.com/vidmind-stb-ws/';
    var AUTH_REALM = '557455cfe4b04ad886a6ae41';
    var DEFAULT_LOCALE = 'uk_UA';
    var USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0';
    var REFERER = 'https://tv.kyivstar.ua/';
    var LIMIT = 20;
    var HOME_LIMIT = 14;
    var NATIVE_MAIN_ROWS = 6;
    var UNKNOWN_TOTAL_PAGES = 10000;
    var CACHE_CHANNELS_MS = 15 * 60 * 1000;
    var CACHE_CATALOG_MS = 60 * 60 * 1000;
    var MAX_LOGS = 120;
    var requestCounter = 0;
    var settingsAdded = false;
    var searchSourceAdded = false;
    var apiSourceAdded = false;
    var fullPlayerHookAdded = false;
    var playRequestLock = { key: '', time: 0 };

    var KEYS = {
        loginType: 'kyivstar_login_type',
        username: 'kyivstar_username',
        password: 'kyivstar_password',
        phone: 'kyivstar_phone',
        otp: 'kyivstar_otp',
        locale: 'kyivstar_locale',
        deviceId: 'kyivstar_device_id',
        proxy: 'kyivstar_proxy',
        appendHeaders: 'kyivstar_append_stream_headers',
        session: 'kyivstar_session',
        pendingPhoneSession: 'kyivstar_pending_phone_session',
        cacheKeys: 'kyivstar_cache_keys',
        logs: 'kyivstar_logs'
    };

    var DEFAULTS = {};
    DEFAULTS[KEYS.loginType] = 'anonymous';
    DEFAULTS[KEYS.username] = '';
    DEFAULTS[KEYS.password] = '';
    DEFAULTS[KEYS.phone] = '';
    DEFAULTS[KEYS.otp] = '';
    DEFAULTS[KEYS.locale] = DEFAULT_LOCALE;
    DEFAULTS[KEYS.deviceId] = '';
    DEFAULTS[KEYS.proxy] = '';
    DEFAULTS[KEYS.appendHeaders] = true;
    DEFAULTS[KEYS.session] = null;
    DEFAULTS[KEYS.pendingPhoneSession] = null;
    DEFAULTS[KEYS.cacheKeys] = [];
    DEFAULTS[KEYS.logs] = [];

    // i18n.js
    function t(key, params) {
        var lang = lampaLanguage();
        var value = I18N[lang] && I18N[lang][key] ? I18N[lang][key] : '';

        if (!value && I18N.uk && I18N.uk[key]) value = I18N.uk[key];
        if (!value && I18N.en && I18N.en[key]) value = I18N.en[key];
        if (!value) value = key;

        params = params || {};
        return String(value).replace(/\{([^}]+)\}/g, function (match, name) {
            return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : match;
        });
    }

    function lampaLanguage() {
        var lang = '';
        var candidates = [
            safeStorage('language'),
            safeStorage('lang'),
            safeStorage('language_app'),
            safeStorage('interface_language'),
            Lampa.Lang && (Lampa.Lang.lang || Lampa.Lang.code || Lampa.Lang.language),
            setting(KEYS.locale)
        ];

        for (var i = 0; i < candidates.length; i++) {
            lang = normalizeLanguage(candidates[i]);
            if (lang) return lang;
        }

        return 'uk';
    }

    function safeStorage(key) {
        try {
            return Lampa.Storage ? Lampa.Storage.get(key, '') : '';
        } catch (error) {
            return '';
        }
    }

    function normalizeLanguage(value) {
        value = String(value || '').toLowerCase();
        if (!value) return '';
        if (value.indexOf('uk') === 0 || value.indexOf('ua') === 0) return 'uk';
        if (value.indexOf('ru') === 0) return 'ru';
        if (value.indexOf('en') === 0) return 'en';
        return '';
    }

    // bootstrap.js
    function boot() {
        if (!window.Lampa || !window.$ || !Lampa.Storage) {
            setTimeout(boot, 200);
            return;
        }

        if (window[PLUGIN_FLAG]) return;
        window[PLUGIN_FLAG] = true;

        try {
            ensureDeviceId();
            injectRuntimeStyles();
            addApiSource();
            addFullPlayerHook();
            addSettings();
            addSearchSource();
            window.plugin_kyivstar_tv_ready = true;
            window.KyivstarTVPlugin = {
                show: showMainMenu,
                settings: function () {
                    showSettingsMenu(new KyivstarApi(), showMainMenu);
                },
                logs: function () {
                    return setting(KEYS.logs);
                },
                catalogDebug: function (areaId) {
                    return catalogDebug(new KyivstarApi(), areaId);
                },
                clearLogs: function () {
                    clearDebugLogs();
                }
            };
            debugLog('info', 'boot:ready', {
                appready: !!window.appready,
                lampa: !!window.Lampa,
                jquery: !!window.$
            });
        } catch (error) {
            window.plugin_kyivstar_tv_error = error && error.message ? error.message : String(error);
            console.error(TITLE + ' boot failed:', error);
        }

        if (window.appready) {
            addSideMenuEntry();
            injectRuntimeStyles();
            addApiSource();
            addFullPlayerHook();
            addSettings();
            addSearchSource();
            initNotice();
        } else if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', function (event) {
                if (event.type === 'ready') {
                    addSideMenuEntry();
                    injectRuntimeStyles();
                    addApiSource();
                    addFullPlayerHook();
                    addSettings();
                    addSearchSource();
                    initNotice();
                }
            });
        }
    }

    function initNotice() {
        log('loaded');
    }

    function injectRuntimeStyles() {
        var existing = document.getElementById('kyivstar-tv-runtime-styles');
        var css = [
            '.button--kyivstar-tv .full-start__button-name{display:flex;align-items:center;justify-content:center;min-width:120px;}',
            '.button--kyivstar-tv .full-start__button-name img{transition:background-color .12s ease,padding .12s ease,border-radius .12s ease;}',
            '.button--kyivstar-tv.focus .full-start__button-name img,.button--kyivstar-tv:hover .full-start__button-name img{background:#111;padding:.22em .38em;border-radius:.28em;}',
            '.button--kyivstar-tv.focus .full-start__button-icon img,.button--kyivstar-tv:hover .full-start__button-icon img{filter:none;}'
        ].join('\n');

        if (existing) {
            existing.textContent = css;
            return;
        }

        existing = document.createElement('style');
        existing.id = 'kyivstar-tv-runtime-styles';
        existing.textContent = css;
        document.head.appendChild(existing);
    }

    function log(message) {
        console.log(TITLE + ': ' + message);
    }

    function debugLog(level, event, details) {
        var entry = {
            time: new Date().toISOString(),
            level: level || 'info',
            event: event || 'event',
            details: sanitize(details || {})
        };
        var logs = setting(KEYS.logs) || [];

        logs.push(entry);
        while (logs.length > MAX_LOGS) logs.shift();
        saveSetting(KEYS.logs, logs);

        var line = '[KyivstarTV] ' + entry.level.toUpperCase() + ' ' + entry.event + ' ' + safeJson(entry.details);
        if (entry.level === 'error' && console.error) console.error(line);
        else if (entry.level === 'warn' && console.warn) console.warn(line);
        else console.log(line);
    }

    function clearDebugLogs() {
        saveSetting(KEYS.logs, []);
        debugLog('info', 'logs:cleared', {});
    }

    function notify(message) {
        if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(message);
        else console.log(TITLE + ': ' + message);
    }

    function setting(name) {
        return Lampa.Storage.get(name, DEFAULTS[name]);
    }

    function boolSetting(name) {
        var value = setting(name);
        return value === true || value === 'true' || value === 1 || value === '1';
    }

    function saveSetting(name, value) {
        Lampa.Storage.set(name, value);
    }

    function ensureDeviceId() {
        if (!setting(KEYS.deviceId)) saveSetting(KEYS.deviceId, uuid());
    }

    function uuid() {
        if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
            var rand = Math.random() * 16 | 0;
            var value = char === 'x' ? rand : (rand & 0x3 | 0x8);
            return value.toString(16);
        });
    }

    // settings-registration.js
    function addSettings() {
        if (settingsAdded) return;

        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addParam) {
            setTimeout(addSettings, 500);
            return;
        }

        try {
            if (Lampa.SettingsApi.removeComponent) Lampa.SettingsApi.removeComponent(COMPONENT);
            else if (Lampa.SettingsApi.removeParams) Lampa.SettingsApi.removeParams(COMPONENT);

            if (Lampa.SettingsApi.addComponent) {
                Lampa.SettingsApi.addComponent({
                    component: COMPONENT,
                    name: TITLE,
                    icon: iconSvg()
                });
            }

            addParam({
                name: KEYS.loginType,
                type: 'select',
                values: {
                    anonymous: loginTypeTitle('anonymous'),
                    account: loginTypeTitle('account'),
                    phone: loginTypeTitle('phone')
                },
                default: DEFAULTS[KEYS.loginType]
            }, textLoginType(), t('login_type_description'));

            addParam({ name: KEYS.username, type: 'input', default: '' }, t('personal_account'), t('personal_account_description'), clearSession);
            addParam({ name: KEYS.password, type: 'input', default: '', password: true }, t('password'), t('password_description'), clearSession);
            addParam({ name: KEYS.phone, type: 'input', default: '' }, t('phone_number'), t('phone_description'), clearSession);
            addParam({ name: KEYS.otp, type: 'input', default: '' }, t('sms_code'), t('sms_code_description'));
            addParam({
                name: KEYS.locale,
                type: 'select',
                values: { uk_UA: t('language_uk'), en_US: t('language_en'), ru_RU: t('language_ru') },
                default: DEFAULT_LOCALE
            }, t('locale'), t('locale_description'), clearSession);
            addParam({ name: KEYS.proxy, type: 'input', default: '' }, 'CORS proxy', t('cors_proxy_description'));
            addParam({ name: KEYS.appendHeaders, type: 'trigger', default: true }, t('append_stream_headers'), t('append_stream_headers_description'));
            addParam({ name: 'kyivstar_send_sms', type: 'button' }, t('send_sms_code_now'), t('send_sms_code_description'), function () {
                sendSmsCode(new KyivstarApi());
            });
            addParam({ name: 'kyivstar_refresh_session', type: 'button' }, textRefreshSession(), t('refresh_session_description'), function () {
                refreshSession(new KyivstarApi());
            });
            addParam({ name: 'kyivstar_diagnostics', type: 'button' }, t('diagnostics_logs'), t('diagnostics_logs_description'), function () {
                showDiagnosticsMenu(settingsBack);
            });
            addParam({ name: 'kyivstar_clear_phone', type: 'button' }, t('clear_phone_otp_state'), t('clear_phone_otp_description'), function () {
                saveSetting(KEYS.pendingPhoneSession, null);
                saveSetting(KEYS.otp, '');
                debugLog('info', 'auth:phone:state-cleared', {});
                notify(t('phone_otp_cleared'));
            });
            addParam({ name: 'kyivstar_logout', type: 'button' }, t('logout_clear_session'), t('logout_clear_session_description'), function () {
                logout(new KyivstarApi());
            });

            settingsAdded = true;
            debugLog('info', 'settings:added', {});
        } catch (error) {
            log('settings registration skipped: ' + error.message);
        }
    }

    function addParam(param, name, description, onChange) {
        if (param.type === 'input' && typeof param.values === 'undefined') param.values = '';
        if (param.type === 'input' && typeof param.placeholder === 'undefined') param.placeholder = '';

        var data = {
            component: COMPONENT,
            param: param,
            field: {
                name: name,
                description: description || ''
            }
        };

        if (typeof onChange === 'function') data.onChange = onChange;

        Lampa.SettingsApi.addParam(data);
    }

    function clearSession() {
        saveSetting(KEYS.session, null);
    }

    function settingsBack() {
        if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle('settings');
    }

    // lampa-integration.js
    function addSideMenuEntry() {
        var list = $('.menu .menu__list').eq(0);

        if (!list.length) {
            setTimeout(addSideMenuEntry, 500);
            return;
        }

        $('.menu__item[data-action="kyivstar-tv"]').remove();

        var item = $('<li class="menu__item selector" data-action="kyivstar-tv">' +
            '<div class="menu__ico">' + iconSvg() + '</div>' +
            '<div class="menu__text">' + TITLE + '</div>' +
            '</li>');

        item.on('hover:enter click', showMainMenu);
        list.append(item);
        debugLog('info', 'menu:added', {});
    }

    function addSearchSource() {
        if (searchSourceAdded) return;

        if (!Lampa.Search || !Lampa.Search.addSource) {
            setTimeout(addSearchSource, 500);
            return;
        }

        if (window.__kyivstar_tv_search_source && Lampa.Search.removeSource) {
            Lampa.Search.removeSource(window.__kyivstar_tv_search_source);
        }

        window.__kyivstar_tv_search_source = createSearchSource();
        Lampa.Search.addSource(window.__kyivstar_tv_search_source);
        searchSourceAdded = true;
        debugLog('info', 'search:source-added', {});
    }

    function addApiSource() {
        if (apiSourceAdded) return;

        if (!Lampa.Api || !Lampa.Api.sources) {
            setTimeout(addApiSource, 500);
            return;
        }

        try {
            Lampa.Api.sources[COMPONENT] = createApiSource();

            if (Lampa.Params && Lampa.Params.values && Lampa.Params.select) {
                var values = merge({}, Lampa.Params.values.source || {});
                values[COMPONENT] = TITLE;
                Lampa.Params.select('source', values, Lampa.Storage.get('source', 'tmdb'));
            }

            apiSourceAdded = true;
            debugLog('info', 'api:source-added', { source: COMPONENT });
        } catch (error) {
            debugLog('error', 'api:source-error', { error: error.message || String(error) });
        }
    }

    function createApiSource() {
        var base = Lampa.Api && Lampa.Api.sources ? Lampa.Api.sources.tmdb : null;
        var source = base ? merge({}, base) : {};

        source.main = sourceMain;
        source.list = sourceList;
        source.full = sourceFull;
        source.img = sourceImg;
        source.clear = function () {
            new KyivstarApi().clear();
        };
        source.discovery = false;

        return source;
    }

    // native-source.js
    function sourceMain(params, onComplete, onError) {
        var api = new KyivstarApi();
        var nextOffset = NATIVE_MAIN_ROWS;
        var compilationsCache = [];

        function loadRows(offset, limit, resolve, reject) {
            api.getContentAreas().catch(function (error) {
                debugLog('warn', 'api:main:contentareas-error', {
                    error: error.message || String(error),
                    status: error.status || error.decode_code || ''
                });
                return [];
            }).then(function (areas) {
                compilationsCache = filterNativeCompilations(areas);

                var slice = compilationsCache.slice(offset, offset + limit);
                var loaders = slice.map(function (compilation) {
                    return loadNativeRow(api, compilation);
                });

                if (!loaders.length && offset === 0) {
                    loaders.push(loadNativeRow(api, null));
                }

                return Promise.all(loaders);
            }).then(function (rows) {
                rows = buildRows(rows);

                if (rows.length) resolve(rows);
                else if (typeof reject === 'function') reject();
            }).catch(function (error) {
                debugLog('error', 'api:main:error', {
                    error: error.message || String(error),
                    status: error.status || error.decode_code || ''
                });
                if (typeof reject === 'function') reject();
            });
        }

        loadRows(0, NATIVE_MAIN_ROWS, onComplete, onError);

        return function (resolve, reject) {
            var offset = nextOffset;
            nextOffset += NATIVE_MAIN_ROWS;

            if (compilationsCache.length && offset >= compilationsCache.length) {
                if (typeof reject === 'function') reject();
                return;
            }

            loadRows(offset, NATIVE_MAIN_ROWS, resolve, reject);
        };
    }

    function sourceList(params, onComplete, onError) {
        var api = new KyivstarApi();
        var parsed = parseNativeList(params);
        var page = Math.max(1, Number(params && params.page) || 1);
        var offset = (page - 1) * LIMIT;

        loadNativeListPage(api, parsed, offset, LIMIT).then(function (assets) {
            var cards = asArray(assets).map(mapAsset).map(mapNativeCard).filter(Boolean);
            var hasNext = cards.length === LIMIT;

            if (!cards.length && page === 1) {
                if (typeof onError === 'function') onError();
                return;
            }

            debugLog('info', 'api:list:ok', {
                url: parsed.url,
                page: page,
                offset: offset,
                limit: LIMIT,
                count: cards.length,
                hasNext: hasNext,
                compilationId: parsed.compilationId || '',
                groupId: parsed.groupId || ''
            });

            onComplete({
                title: parsed.title,
                url: parsed.url,
                source: COMPONENT,
                page: page,
                total_pages: hasNext ? UNKNOWN_TOTAL_PAGES : page,
                total_results: hasNext ? UNKNOWN_TOTAL_PAGES * LIMIT : offset + cards.length,
                results: cards
            });
        }).catch(function (error) {
            debugLog('error', 'api:list:error', {
                url: parsed.url,
                page: page,
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            if (typeof onError === 'function') onError();
        });
    }

    function sourceFull(params, onComplete, onError) {
        var api = new KyivstarApi();
        var item = extractKyivstarItem(params);
        var completed = false;

        if (!item) {
            if (typeof onError === 'function') onError();
            return;
        }

        function complete(mapped) {
            if (completed) return;
            completed = true;

            onComplete({
                movie: buildFullMovie(mapped || item)
            });
        }

        setTimeout(function () {
            complete(item);
        }, 2500);

        if (!item.assetId || item.kind === 'channel') {
            complete(item);
            return;
        }

        api.getAssetInfo(item.assetId).then(function (info) {
            var asset = asArray(info)[0];
            if (!asset) {
                complete(item);
                return;
            }

            complete(mapAsset(asset));
        }).catch(function (error) {
            debugLog('warn', 'api:full:details-error', {
                assetId: item.assetId,
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            complete(item);
        });
    }

    function sourceImg(src) {
        return src || '';
    }

    function addFullPlayerHook() {
        if (fullPlayerHookAdded) return;

        if (!Lampa.Listener || !Lampa.Listener.follow) {
            setTimeout(addFullPlayerHook, 500);
            return;
        }

        Lampa.Listener.follow('full', function (event) {
            var movie = event && event.data ? event.data.movie : null;
            var item = movie && movie._kyivstar ? movie._kyivstar : null;

            if (!item || movie.source !== COMPONENT || event.type !== 'complite' || !event.body) return;

            addKyivstarFullButton(event.body, item);
            patchKyivstarFullLabels(event.body);
            setTimeout(function () {
                patchKyivstarFullLabels(event.body);
            }, 250);
        });

        fullPlayerHookAdded = true;
        debugLog('info', 'full:player-hook-added', {});
    }

    function addKyivstarFullButton(body, item) {
        var root = $(body);
        var playButton = root.find('.button--play').eq(0);
        var buttonRow = playButton.length ? playButton.parent() : findFullButtonRow(root);
        var button;

        root.find('.button--kyivstar-tv').remove();
        if (!buttonRow.length) {
            debugLog('warn', 'full:kyivstar-button:no-row', {
                assetId: item.assetId || ''
            });
            return;
        }

        button = createKyivstarFullButton(playButton);
        button.on('hover:enter click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (e && e.stopPropagation) e.stopPropagation();
            playKyivstarFromFullButton(item);
            return false;
        });

        if (playButton.length) button.insertAfter(playButton);
        else buttonRow.append(button);

        if (Lampa.Controller && Lampa.Controller.collectionSet) {
            Lampa.Controller.collectionSet(root);
        }

        debugLog('info', 'full:kyivstar-button:added', {
            assetId: item.assetId || '',
            title: item.title || ''
        });
    }

    function patchKyivstarFullLabels(body) {
        var root = $(body);

        root.find('*').contents().each(function () {
            if (this.nodeType !== 3) return;
            if (this.nodeValue && this.nodeValue.indexOf('KYIVSTAR_TV') !== -1) {
                this.nodeValue = this.nodeValue.replace(/KYIVSTAR_TV/g, TITLE);
            }
        });
    }

    function playKyivstarFromFullButton(item) {
        if (!item || !item.assetId) {
            notify(t('item_not_playable'));
            return;
        }

        if (item.locked) {
            notify(t('item_unavailable'));
            return;
        }

        debugLog('info', 'full:kyivstar-button:play', {
            assetId: item.assetId || '',
            title: item.title || '',
            kind: item.kind || '',
            type: item.videoType || ''
        });

        if (isKyivstarSeries(item)) {
            openSeriesEpisodeSelect(new KyivstarApi(), item);
            return;
        }

        playItem(new KyivstarApi(), item);
    }

    function isKyivstarSeries(item) {
        var raw = item && item.raw ? item.raw : {};
        var type = raw.assetType || raw.contentType || raw.type || '';
        var typeValue = type && type.value ? type.value : type;

        return !!(item && (item.kind === 'nav' || typeValue === 'SERIES'));
    }

    function openSeriesEpisodeSelect(api, item) {
        debugLog('info', 'full:series:start', {
            assetId: item.assetId || '',
            title: item.title || ''
        });

        api.getAssetInfo(item.assetId).then(function (info) {
            var asset = asArray(info)[0] || item.raw || {};
            var seasons = asArray(asset.seasons);

            if (!seasons.length) {
                return showEpisodeSelect(api, item, 1);
            }

            if (seasons.length === 1) {
                return showEpisodeSelect(api, item, seasonNumber(seasons[0]));
            }

            showSeasonSelect(api, item, seasons);
        }).catch(function (error) {
            debugLog('warn', 'full:series:details-error', {
                assetId: item.assetId || '',
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            showEpisodeSelect(api, item, 1);
        });
    }

    function showSeasonSelect(api, item, seasons) {
        if (!Lampa.Select || !Lampa.Select.show) {
            showEpisodeSelect(api, item, seasonNumber(seasons[0]));
            return;
        }

        Lampa.Select.show({
            title: item.title || 'Series',
            items: seasons.map(function (season) {
                var number = seasonNumber(season);
                return {
                    title: t('season_prefix') + number,
                    season: number
                };
            }),
            onSelect: function (season) {
                showEpisodeSelect(api, item, season.season);
            }
        });
    }

    function showEpisodeSelect(api, item, season) {
        api.getTvGroup(item.assetId, season || 1, 0, 100).then(function (episodes) {
            var mapped = asArray(episodes).map(function (episode) {
                var mappedEpisode = mapAsset(episode);
                mappedEpisode.kind = 'episode';
                return mappedEpisode;
            }).filter(function (episode) {
                return episode && episode.assetId;
            });

            debugLog('info', 'full:series:episodes-ok', {
                assetId: item.assetId || '',
                season: season || 1,
                count: mapped.length
            });

            if (!mapped.length) {
                notify(t('no_playable_episodes'));
                return;
            }

            if (!Lampa.Select || !Lampa.Select.show) {
                playItem(api, mapped[0]);
                return;
            }

            Lampa.Select.show({
                title: item.title || t('episodes'),
                items: mapped.map(function (episode, index) {
                    return {
                        title: episode.title || (t('episode_prefix') + (index + 1)),
                        subtitle: episode.subtitle || '',
                        episode: episode
                    };
                }),
                onSelect: function (selected) {
                    playItem(api, selected.episode);
                }
            });
        }).catch(function (error) {
            notify(error.message || String(error));
            debugLog('error', 'full:series:episodes-error', {
                assetId: item.assetId || '',
                season: season || 1,
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
        });
    }

    function seasonNumber(season) {
        var number = season && (season.number || season.seasonNumber || season.value || season.id);
        number = parseInt(number, 10);
        return number > 0 ? number : 1;
    }

    function findFullButtonRow(root) {
        var row = root.find('.full-start__buttons, .full-start-new__buttons, .full-start__buttons-line').eq(0);

        if (row.length) return row;

        row = root.find('.button, .full-start__button, .selector').filter(function () {
            return $(this).closest('.full-start, .full-start-new, .full').length > 0;
        }).eq(0).parent();

        return row;
    }

    function createKyivstarFullButton(playButton) {
        var button = $('<div class="full-start__button button selector button--kyivstar-tv">' +
            '<div class="full-start__button-icon">' + iconSvg() + '</div>' +
            '<div class="full-start__button-name">' + brandLogoHtml() + '</div>' +
            '</div>');

        if (playButton && playButton.length) {
            copyButtonShapeClasses(playButton, button);
        }

        return button;
    }

    function copyButtonShapeClasses(source, target) {
        var classes = String(source.attr('class') || '').split(/\s+/);

        classes.forEach(function (name) {
            if (!name || name === 'button--play' || name === 'focus') return;
            target.addClass(name);
        });
    }

    function filterNativeCompilations(compilations) {
        return asArray(compilations).filter(function (item) {
            return item && item.active !== false && (item.id || item.assetId);
        }).sort(function (left, right) {
            var a = typeof left.contentAreaLocation === 'number' ? left.contentAreaLocation : 9999;
            var b = typeof right.contentAreaLocation === 'number' ? right.contentAreaLocation : 9999;
            return a - b;
        });
    }

    function loadNativeRow(api, compilation) {
        var title = compilation ? (textValue(compilation.name) || textValue(compilation.title) || textValue(compilation.displayName) || 'Videos') : 'Videos';
        var id = compilation ? (compilation.assetId || compilation.id) : null;
        var type = nativeCompilationType(compilation);
        var url = nativeListUrl(id, type);
        var parsed = {
            url: url,
            title: title,
            compilationId: type === 'compilation' ? id : null,
            groupId: type === 'group' ? id : null
        };

        return loadNativeListPage(api, parsed, 0, LIMIT).then(function (assets) {
            var cards = asArray(assets).map(mapAsset).map(mapNativeCard).filter(Boolean);
            var hasNext = cards.length === LIMIT;

            return {
                title: title,
                url: url,
                source: COMPONENT,
                page: 1,
                total_pages: hasNext ? UNKNOWN_TOTAL_PAGES : 1,
                total_results: hasNext ? UNKNOWN_TOTAL_PAGES * LIMIT : cards.length,
                results: cards
            };
        }).catch(function (error) {
            debugLog('warn', 'api:row:error', {
                title: title,
                compilationId: id || '',
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            return null;
        });
    }

    function nativeCompilationType(compilation) {
        if (!compilation) return 'root';
        if (compilation.entityType === 'CONTENT_GROUP') return 'group';
        if (compilation.compilationElementType === 'CONTENT_GROUP') return 'group';
        if (compilation.compilationElementType === 'PREDEFINED') return 'root';
        return 'compilation';
    }

    function loadNativeListPage(api, parsed, offset, limit) {
        if (parsed.groupId) return loadNativeGroupPage(api, parsed.groupId, offset, limit);

        return api.getContentAreaElements(parsed.compilationId, [], parsed.sortId || null, offset, limit);
    }

    function loadNativeGroupPage(api, groupId, offset, limit) {
        return api.getContentGroupLegacyElements(groupId, offset, limit).then(function (assets) {
            assets = asArray(assets);
            if (assets.length) return assets;

            return api.getCompilations(groupId).then(function (children) {
                children = filterNativeCompilations(children);
                if (!children.length) return [];

                return loadFirstNonEmptyChildPage(api, children, 0, offset, limit);
            });
        });
    }

    function loadFirstNonEmptyChildPage(api, children, index, offset, limit) {
        var child = children[index];
        var type;
        var parsed;

        if (!child) return Promise.resolve([]);

        type = nativeCompilationType(child);
        parsed = {
            compilationId: type === 'compilation' ? child.id : null,
            groupId: type === 'group' ? child.id : null
        };

        return loadNativeListPage(api, parsed, offset, limit).then(function (assets) {
            assets = asArray(assets);
            if (assets.length || index >= children.length - 1) return assets;
            return loadFirstNonEmptyChildPage(api, children, index + 1, offset, limit);
        });
    }

    function nativeListUrl(compilationId, type) {
        if (!compilationId || type === 'root') return 'kyivstar/videos';
        return 'kyivstar/' + (type === 'group' ? 'group' : 'compilation') + '/' + encodeURIComponent(compilationId);
    }

    function textValue(value) {
        return typeof value === 'string' && value ? value : '';
    }

    function parseNativeList(params) {
        var url = params && params.url ? String(params.url) : 'kyivstar/videos';
        var title = params && params.title ? params.title : 'Videos';
        var compilationPrefix = 'kyivstar/compilation/';
        var groupPrefix = 'kyivstar/group/';
        var compilationId = null;
        var groupId = null;

        if (url.indexOf(compilationPrefix) === 0) {
            try {
                compilationId = decodeURIComponent(url.substr(compilationPrefix.length));
            } catch (error) {
                compilationId = url.substr(compilationPrefix.length);
            }
        } else if (url.indexOf(groupPrefix) === 0) {
            try {
                groupId = decodeURIComponent(url.substr(groupPrefix.length));
            } catch (groupError) {
                groupId = url.substr(groupPrefix.length);
            }
        }

        return {
            url: url,
            title: title,
            compilationId: compilationId,
            groupId: groupId
        };
    }

    function extractKyivstarItem(params) {
        if (!params) return null;
        if (params._kyivstar) return params._kyivstar;
        if (params.card && params.card._kyivstar) return params.card._kyivstar;

        return {
            kind: params.first_air_date ? 'nav' : 'vod',
            title: params.title || params.name || params.original_title || params.original_name || TITLE,
            subtitle: '',
            image: params.poster || params.img || params.background_image || '',
            assetId: params.id,
            videoType: params.videoType || 'VIRTUAL',
            raw: params.raw || {}
        };
    }

    function buildFullMovie(item) {
        var raw = item.raw || {};
        var isSeries = item.kind === 'nav' || raw.assetType === 'SERIES';
        var image = item.image || pickImage(raw.images) || raw.image || '';
        var background = pickBackdrop(raw.images) || image;
        var release = raw.release_date || raw.releaseDate || item.subtitle || '';
        var date = subtitleYear(release);
        var rating = itemRating(item);
        var runtime = raw.duration ? Math.round(Number(raw.duration) / 60) : 0;
        var description = raw.description || raw.longDescription || raw.shortDescription || raw.plot || raw.overview || '';
        var movie = {
            id: item.assetId || item.title || TITLE,
            source: COMPONENT,
            source_name: TITLE,
            source_title: TITLE,
            provider_name: TITLE,
            source_logo: ASSET_BASE + 'favicon.ico',
            method: isSeries ? 'tv' : 'movie',
            title: String(item.title || TITLE),
            original_title: String(item.title || TITLE),
            release_date: isSeries ? '' : date,
            first_air_date: isSeries ? date : '',
            overview: String(description || ''),
            runtime: runtime || 0,
            vote_average: rating || 0,
            genres: [],
            production_companies: [],
            production_countries: normalizeProductionCountries(raw),
            keywords: { results: [], keywords: [] },
            videos: { results: [] },
            credits: { cast: [], crew: [] },
            images: { posters: [], backdrops: [] },
            alternative_titles: { titles: [] },
            names: [],
            tagline: '',
            budget: 0,
            status: '',
            imdb_rating: 0,
            kp_rating: 0,
            number_of_episodes: 0,
            number_of_seasons: 0,
            poster: image,
            img: image,
            background_image: background,
            poster_path: '',
            backdrop_path: '',
            _kyivstar: item
        };

        if (isSeries) {
            movie.name = item.title;
            movie.original_name = item.title;
        }

        return movie;
    }

    // search-source.js
    function createSearchSource() {
        var api = new KyivstarApi();
        var source;

        source = {
            title: TITLE,
            count: 0,
            params: {
                lazy: true,
                save: false,
                start_typing: 'search_start_typing',
                nofound: 'search_nofound'
            },
            search: function (params, done) {
                var query = decodeQuery(params && params.query);

                debugLog('info', 'search:native:start', { query: query });

                api.search(query).then(function (results) {
                    var rows = buildNativeSearchRows(results || []);
                    var count = countSearchRows(rows);

                    source.count = count;
                    source.results_count = count;
                    source.total_results = count;
                    source.results = count;
                    source.result = count;
                    source.total = count;
                    source.title = count ? TITLE + ' ' + count : TITLE;

                    debugLog('info', 'search:native:ok', {
                        query: query,
                        rows: rows.length,
                        count: count
                    });
                    rows.count = count;
                    rows.results_count = count;
                    rows.total_results = count;
                    rows.results = count;
                    rows.result = count;
                    rows.total = count;
                    done(rows);
                }).catch(function (error) {
                    source.count = 0;
                    source.results_count = 0;
                    source.total_results = 0;
                    source.results = 0;
                    source.result = 0;
                    source.total = 0;
                    source.title = TITLE;
                    debugLog('error', 'search:native:error', {
                        query: query,
                        error: error.message || String(error),
                        status: error.status || error.decode_code || ''
                    });
                    done([]);
                });
            },
            onSelect: function (params, close) {
                var item = params && params.element ? params.element._kyivstar : null;
                if (typeof close === 'function') close();
                openKyivstarItem(item);
            },
            onCancel: function () {
                api.clear();
            }
        };

        return source;
    }

    function buildNativeSearchRows(results) {
        var videos = [];
        var channels = [];

        results.forEach(function (asset) {
            var item = mapSearchResult(asset);
            var card;

            if (!item) return;

            card = mapNativeCard(item);
            if (item.kind === 'channel') channels.push(card);
            else videos.push(card);
        });

        return buildRows([
            { title: 'Videos', type: 'movie', results: videos, count: videos.length, total_results: videos.length },
            { title: 'Live TV', type: 'channel', results: channels, count: channels.length, total_results: channels.length }
        ]);
    }

    function countSearchRows(rows) {
        var total = 0;

        rows.forEach(function (row) {
            total += row && row.results ? row.results.length : 0;
        });

        return total;
    }

    function mapNativeCard(item) {
        var raw = item.raw || {};
        var isSeries = item.kind === 'nav' || raw.assetType === 'SERIES';
        var date = subtitleYear(raw.release_date || raw.releaseDate || item.subtitle);
        var rating = itemRating(item);
        var card = {
            id: item.assetId || item.title,
            title: item.title,
            original_title: item.title,
            release_date: isSeries ? '' : date,
            first_air_date: isSeries ? date : '',
            vote_average: rating,
            poster: item.image || '',
            img: item.image || '',
            production_countries: normalizeProductionCountries(raw),
            source: COMPONENT,
            source_name: TITLE,
            source_title: TITLE,
            provider_name: TITLE,
            source_logo: ASSET_BASE + 'favicon.ico',
            method: isSeries ? 'tv' : 'movie',
            videoType: item.videoType || 'VIRTUAL',
            raw: raw,
            _kyivstar: item
        };

        if (isSeries) {
            card.name = item.title;
            card.original_name = item.title;
        }

        return card;
    }

    function openKyivstarItem(item) {
        if (!item) return;

        if (item.locked) {
            notify(t('item_unavailable'));
            return;
        }

        if (item.kind === 'channel') {
            playItem(new KyivstarApi(), item);
        } else if (item.kind === 'nav' || item.kind === 'vod' || item.kind === 'episode') {
            openKyivstarFullCard(item);
        }
    }

    function openKyivstarFullCard(item) {
        var card = mapNativeCard(item);

        debugLog('info', 'search:open-full', {
            assetId: item.assetId || '',
            title: item.title || '',
            method: card.method || ''
        });

        if (Lampa.Activity && Lampa.Activity.push) {
            Lampa.Activity.push({
                component: 'full',
                source: COMPONENT,
                method: card.method,
                id: card.id,
                card: card,
                movie: card,
                _kyivstar: item
            });
            return;
        }

        if (Lampa.Router && Lampa.Router.call) {
            Lampa.Router.call('full', card);
            return;
        }

        notify(t('full_card_api_unavailable'));
    }

    function showMainMenu(attempt) {
        attempt = attempt || 0;
        addApiSource();

        if (apiSourceAdded && Lampa.Activity && Lampa.Activity.push) {
            Lampa.Activity.push({
                title: TITLE,
                component: 'main',
                source: COMPONENT,
                page: 1
            });
            return;
        }

        if (attempt < 10) {
            setTimeout(function () {
                showMainMenu(attempt + 1);
            }, 250);
            return;
        }

        notify(t('source_not_ready'));
    }

    // settings-menu.js
    function showSettingsMenu(api, onBack) {
        var session = setting(KEYS.session);

        if (!Lampa.Select || !Lampa.Select.show) {
            notify(t('lampa_select_unavailable'));
            return;
        }

        Lampa.Select.show({
            title: TITLE + ' ' + t('settings_suffix'),
            items: [
                { title: textLoginType() + ': ' + loginTypeTitle(setting(KEYS.loginType)), action: 'login-type' },
                { title: t('locale') + ': ' + localeTitle(setting(KEYS.locale)), action: 'locale' },
                { title: t('append_stream_headers') + ': ' + yesNo(boolSetting(KEYS.appendHeaders)), action: 'headers' },
                { title: t('personal_account') + ': ' + filled(setting(KEYS.username)), action: 'username' },
                { title: t('password') + ': ' + filled(setting(KEYS.password)), action: 'password' },
                { title: t('phone_number') + ': ' + filled(setting(KEYS.phone)), action: 'phone' },
                { title: t('sms_code') + ': ' + filled(setting(KEYS.otp)), action: 'otp' },
                { title: 'CORS proxy: ' + filled(setting(KEYS.proxy)), action: 'proxy' },
                { title: t('send_sms_code_now'), action: 'send-otp' },
                { title: textRefreshSession() + (session && session.userId ? ' (' + session.userId + ')' : ''), action: 'session' },
                { title: t('diagnostics_logs'), action: 'diagnostics' },
                { title: t('clear_phone_otp_state'), action: 'clear-phone' },
                { title: t('logout_clear_session'), action: 'logout' }
            ],
            onSelect: function (item) {
                if (item.action === 'login-type') selectLoginType(api, onBack);
                else if (item.action === 'locale') selectLocale(api, onBack);
                else if (item.action === 'headers') {
                    saveSetting(KEYS.appendHeaders, !boolSetting(KEYS.appendHeaders));
                    showSettingsMenu(api, onBack);
                } else if (item.action === 'username') editStoredValue(t('personal_account'), KEYS.username, api, onBack);
                else if (item.action === 'password') editStoredValue(t('password'), KEYS.password, api, onBack);
                else if (item.action === 'phone') editStoredValue(t('phone_number'), KEYS.phone, api, onBack);
                else if (item.action === 'otp') editStoredValue(t('sms_code'), KEYS.otp, api, onBack);
                else if (item.action === 'proxy') editStoredValue('CORS proxy', KEYS.proxy, api, onBack);
                else if (item.action === 'send-otp') {
                    sendSmsCode(api).then(function () {
                        showSettingsMenu(api, onBack);
                    });
                }
                else if (item.action === 'session') {
                    refreshSession(api).then(function () {
                        showSettingsMenu(api, onBack);
                    });
                } else if (item.action === 'diagnostics') {
                    showDiagnosticsMenu(function () {
                        showSettingsMenu(api, onBack);
                    });
                } else if (item.action === 'clear-phone') {
                    saveSetting(KEYS.pendingPhoneSession, null);
                    saveSetting(KEYS.otp, '');
                    debugLog('info', 'auth:phone:state-cleared', {});
                    showSettingsMenu(api, onBack);
                } else if (item.action === 'logout') {
                    logout(api).then(function () {
                        showSettingsMenu(api, onBack);
                    });
                }
            },
            onBack: function () {
                if (typeof onBack === 'function') onBack();
                else if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle('content');
            }
        });
    }

    function selectLoginType(api, onBack) {
        selectStoredValue(textLoginType(), KEYS.loginType, [
            { title: loginTypeTitle('anonymous'), value: 'anonymous' },
            { title: loginTypeTitle('account'), value: 'account' },
            { title: loginTypeTitle('phone'), value: 'phone' }
        ], api, onBack);
    }

    function selectLocale(api, onBack) {
        selectStoredValue(t('locale'), KEYS.locale, [
            { title: localeTitle('uk_UA'), value: 'uk_UA' },
            { title: localeTitle('en_US'), value: 'en_US' },
            { title: localeTitle('ru_RU'), value: 'ru_RU' }
        ], api, onBack);
    }

    function selectStoredValue(title, key, values, api, onBack) {
        var current = setting(key);

        Lampa.Select.show({
            title: title,
            items: values.map(function (item) {
                return {
                    title: (item.value === current ? '* ' : '') + item.title,
                    value: item.value
                };
            }),
            onSelect: function (item) {
                saveSetting(key, item.value);
                if (key === KEYS.loginType || key === KEYS.locale) saveSetting(KEYS.session, null);
                showSettingsMenu(api, onBack);
            },
            onBack: function () {
                showSettingsMenu(api, onBack);
            }
        });
    }

    function editStoredValue(title, key, api, onBack) {
        askText(title, setting(key) || '', function (value) {
            saveSetting(key, value || '');
            if (key !== KEYS.proxy && key !== KEYS.otp) saveSetting(KEYS.session, null);
            showSettingsMenu(api, onBack);
        });
    }

    function sendSmsCode(api) {
        var phone = normalizePhone(setting(KEYS.phone));

        debugLog('info', 'otp:manual:start', {
            phone: maskPhone(phone),
            hasPendingSession: !!(setting(KEYS.pendingPhoneSession) && setting(KEYS.pendingPhoneSession).sessionId)
        });

        if (!phone) {
            notify(t('set_phone_first'));
            debugLog('error', 'otp:manual:no-phone', {});
            return Promise.resolve();
        }

        notify(t('sending_sms_code'));

        return api.ensurePhonePendingSession().then(function (phoneSession) {
            return api.sendOtp(phoneSession.sessionId, phone);
        }).then(function () {
            notify(t('sms_code_request_sent'));
            debugLog('info', 'otp:manual:sent', {
                phone: maskPhone(phone)
            });
        }).catch(function (error) {
            notify(error.message || String(error));
            debugLog('error', 'otp:manual:error', {
                phone: maskPhone(phone),
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
        });
    }

    function showDiagnosticsMenu(onBack) {
        var logs = setting(KEYS.logs) || [];
        var items = [
            { title: t('print_logs_console') + ' (' + logs.length + ')', action: 'print' },
            { title: t('clear_logs'), action: 'clear' }
        ];
        var start = Math.max(0, logs.length - 35);

        for (var i = logs.length - 1; i >= start; i--) {
            var entry = logs[i];
            items.push({
                title: formatLogEntry(entry),
                action: 'noop'
            });
        }

        Lampa.Select.show({
            title: TITLE + ' ' + t('diagnostics_suffix'),
            items: items,
            onSelect: function (item) {
                if (item.action === 'print') {
                    printDebugLogs();
                    notify(t('logs_printed_console'));
                    showDiagnosticsMenu(onBack);
                } else if (item.action === 'clear') {
                    clearDebugLogs();
                    showDiagnosticsMenu(onBack);
                }
            },
            onBack: function () {
                if (typeof onBack === 'function') onBack();
                else showMainMenu();
            }
        });
    }

    function printDebugLogs() {
        var logs = setting(KEYS.logs) || [];
        console.log('[KyivstarTV] LOG DUMP START (' + logs.length + ')');
        logs.forEach(function (entry) {
            console.log('[KyivstarTV] ' + formatLogEntry(entry));
        });
        console.log('[KyivstarTV] LOG DUMP END');
    }

    function catalogDebug(api, areaId) {
        areaId = areaId || null;

        return Promise.all([
            api.getCompilations(areaId).catch(function (error) {
                return { error: error.message || String(error) };
            }),
            api.getFilters(areaId).catch(function (error) {
                return { error: error.message || String(error) };
            }),
            api.getSortElements().catch(function (error) {
                return { error: error.message || String(error) };
            })
        ]).then(function (result) {
            var data = {
                areaId: areaId,
                chips: result[0],
                filters: result[1],
                sortElements: result[2]
            };

            debugLog('info', 'catalog:debug', {
                areaId: areaId || '',
                chips: asArray(data.chips).length,
                filters: asArray(data.filters).length,
                sortElements: asArray(data.sortElements).length
            });

            return data;
        });
    }

    function formatLogEntry(entry) {
        var time = entry.time ? entry.time.replace(/^.*T/, '').replace(/\..*$/, '') : '';
        return time + ' ' + String(entry.level || 'info').toUpperCase() + ' ' + entry.event + ' ' + safeJson(entry.details || {});
    }

    function loginTypeTitle(value) {
        if (value === 'account') return t('login_account');
        if (value === 'phone') return t('login_phone_otp');
        return t('login_anonymous');
    }

    function localeTitle(value) {
        if (value === 'en_US') return t('language_en');
        if (value === 'ru_RU') return t('language_ru');
        return t('language_uk');
    }

    function filled(value) {
        return value ? t('filled_set') : t('filled_empty');
    }

    function yesNo(value) {
        return value ? t('yes') : t('no');
    }

    function textLoginType() {
        return t('login_type');
    }

    function textRefreshSession() {
        return t('refresh_session');
    }

    // routes-and-mappers.js
    function routeTitle(route) {
        if (route.type === 'channels') return route.groupName || 'Live TV';
        if (route.type === 'catalog') return route.compilationName || 'Videos';
        if (route.type === 'search') return route.query ? 'Search: ' + route.query : 'Search';
        if (route.type === 'series-seasons') return route.title || 'Series';
        if (route.type === 'series-episodes') return route.title || 'Episodes';
        return TITLE;
    }

    function loadRoute(route, api) {
        if (route.type === 'home' || route.type === 'root') return loadHome(api);
        if (route.type === 'channels') return loadChannels(route, api);
        if (route.type === 'catalog') return loadCatalog(route, api);
        if (route.type === 'search') return loadSearch(route, api);
        if (route.type === 'series-seasons') return loadSeriesSeasons(route, api);
        if (route.type === 'series-episodes') return loadSeriesEpisodes(route, api);
        return loadHome(api);
    }

    function loadHome(api) {
        return Promise.all([
            api.getContentAreas().catch(function (error) {
                debugLog('warn', 'home:contentareas:error', { error: error.message || String(error) });
                return [];
            }),
            api.getContentAreaElements(null, [], null, 0, LIMIT).catch(function (error) {
                debugLog('warn', 'home:videos:error', { error: error.message || String(error) });
                return [];
            })
        ]).then(function (data) {
            var areas = sortHomeAreas(asArray(data[0]));
            var videos = data[1] || [];
            var categories = [{
                kind: 'nav',
                title: 'Live TV',
                subtitle: 'Channels',
                image: '',
                route: { type: 'channels' }
            }];
            var rows = [];

            areas.forEach(function (area) {
                var item = mapHomeArea(area);

                if (item) categories.push(item);
            });

            if (categories.length) rows.push({ title: 'Categories', items: categories });
            if (videos.length) {
                rows.push({
                    title: 'Videos',
                    items: videos.slice(0, HOME_LIMIT).map(mapAsset).concat(videos.length > HOME_LIMIT ? [{
                        kind: 'nav',
                        title: 'More',
                        subtitle: 'Open videos',
                        route: { type: 'catalog', offset: 0 }
                    }] : [])
                });
            }

            return { rows: rows };
        });
    }

    function loadChannels(route, api) {
        if (!route.groupId) {
            return api.getLiveChannelGroups().then(function (groups) {
                return groups.map(function (group) {
                    return {
                        kind: 'nav',
                        title: group.name || group.displayName || 'Channels',
                        subtitle: group.type || '',
                        image: pickImage(group.images),
                        route: {
                            type: 'channels',
                            groupId: group.assetId,
                            groupName: group.name || group.displayName || 'Channels'
                        }
                    };
                });
            });
        }

        return api.getGroupElements(route.groupId).then(function (channels) {
            return channels.map(mapChannel);
        });
    }

    function loadCatalog(route, api) {
        var offset = route.offset || 0;

        return loadCatalogPage(route, api, offset, LIMIT).then(function (elems) {
            elems = asArray(elems);

            var items = offset ? [] : [filterMenuItem(route)];

            elems.forEach(function (asset) {
                items.push(mapAsset(asset));
            });

            if (elems.length === LIMIT) {
                items.push({
                    kind: 'nav',
                    title: 'Next',
                    subtitle: 'Load more items',
                    route: copyRoute(route, { offset: offset + elems.length })
                });
            }

            return items;
        });
    }

    function loadCatalogPage(route, api, offset, limit) {
        if (route.groupId) {
            if (!(route.filters && route.filters.length) && !route.sort) {
                return api.getContentGroupLegacyElements(route.groupId, offset, limit);
            }

            return api.getContentGroupElements(route.groupId, route.filters || [], route.sort || null, offset, limit).catch(function (error) {
                debugLog('warn', 'catalog:content-group-filtered:error', {
                    groupId: route.groupId,
                    offset: offset || 0,
                    limit: limit || LIMIT,
                    error: error.message || String(error),
                    status: error.status || error.decode_code || ''
                });

                return api.getContentGroupLegacyElements(route.groupId, offset, limit);
            });
        }

        return api.getContentAreaElements(route.compilationId || null, route.filters || [], route.sort || null, offset, limit);
    }

    function sortHomeAreas(areas) {
        return asArray(areas).filter(function (area) {
            return area && area.active !== false && area.assetId;
        }).sort(function (left, right) {
            var a = typeof left.contentAreaLocation === 'number' ? left.contentAreaLocation : 9999;
            var b = typeof right.contentAreaLocation === 'number' ? right.contentAreaLocation : 9999;
            return a - b;
        });
    }

    function mapHomeArea(area) {
        var title = textValue(area.name) || textValue(area.title) || textValue(area.displayName) || 'Selection';
        var subtitle = textValue(area.type) || textValue(area.entityType) || 'Videos';

        return {
            kind: 'nav',
            title: title,
            subtitle: subtitle,
            image: pickImage(area.images),
            route: {
                type: 'catalog',
                compilationId: null,
                groupId: area.assetId,
                compilationName: title,
                offset: 0
            }
        };
    }

    function textValue(value) {
        return typeof value === 'string' && value ? value : '';
    }

    function filterMenuItem(route) {
        return {
            kind: 'filter',
            title: 'Фільтр',
            subtitle: activeFilterSummary(route),
            image: '',
            icon: iconSvg(),
            route: route
        };
    }

    function loadSearch(route, api) {
        return api.search(route.query).then(function (results) {
            var items = [];

            results.forEach(function (asset) {
                var item = mapSearchResult(asset);
                if (item) items.push(item);
            });

            return items;
        });
    }

    function loadSeriesSeasons(route, api) {
        return api.getAssetInfo(route.assetId).then(function (info) {
            var asset = info && info.length ? info[0] : null;
            var seasons = asset && asset.seasons ? asset.seasons : [];

            return seasons.map(function (season) {
                return {
                    kind: 'nav',
                    title: 'Season ' + season.number,
                    subtitle: route.title || '',
                    image: asset ? (pickImage(asset.images) || asset.image) : '',
                    route: {
                        type: 'series-episodes',
                        assetId: route.assetId,
                        season: season.number,
                        title: (route.title || 'Series') + ': Season ' + season.number,
                        offset: 0
                    }
                };
            });
        });
    }

    function loadSeriesEpisodes(route, api) {
        var offset = route.offset || 0;

        return api.getTvGroup(route.assetId, route.season, offset, LIMIT).then(function (episodes) {
            var items = episodes.map(function (episode) {
                var mapped = mapAsset(episode);
                mapped.kind = 'episode';
                return mapped;
            });

            if (episodes.length === LIMIT) {
                items.push({
                    kind: 'nav',
                    title: 'Next',
                    subtitle: 'Load more episodes',
                    route: copyRoute(route, { offset: offset + episodes.length })
                });
            }

            return items;
        });
    }

    function mapChannel(channel) {
        var type = channel.type && channel.type.value ? channel.type.value : channel.type || 'IP';
        var title = channel.displayName || channel.name || channel.assetId || 'Channel';

        return {
            kind: 'channel',
            title: title,
            subtitle: channel.groups || type,
            image: pickImage(channel.images),
            assetId: channel.assetId,
            videoType: type,
            locked: channel.purchased === false,
            raw: channel
        };
    }

    function mapAsset(asset) {
        var isSeries = asset.assetType === 'SERIES';
        var title = asset.name || asset.displayName || asset.title || asset.assetId || 'Video';
        var year = asset.release_date || asset.releaseDate || '';
        var rating = asset.ratings && asset.ratings[0] ? asset.ratings[0].movieRating : '';
        var duration = asset.duration ? formatDuration(asset.duration) : '';
        var subtitle = [normalizeYear(year), duration, rating ? 'Rating ' + rating : ''].filter(Boolean).join(' / ');

        return {
            kind: isSeries ? 'nav' : 'vod',
            title: title,
            subtitle: subtitle || (asset.assetType || ''),
            image: pickImage(asset.images) || asset.image,
            assetId: asset.assetId,
            videoType: 'VIRTUAL',
            locked: asset.purchased === false,
            raw: asset,
            route: isSeries ? {
                type: 'series-seasons',
                assetId: asset.assetId,
                title: title
            } : null
        };
    }

    function mapSearchResult(asset) {
        var type = asset && (asset.assetType || asset.contentType || asset.type);
        var typeValue = type && type.value ? type.value : type;

        if (!asset) return null;
        if (typeValue === 'MOVIE' || typeValue === 'SERIES') return mapAsset(asset);
        if (typeValue === 'LIVE_CHANNEL' || typeValue === 'IP' || asset.channelNumber || asset.logicalChannelNumber) return mapChannel(asset);

        if (asset.assetId && (asset.name || asset.displayName || asset.title)) return mapAsset(asset);

        return null;
    }

    function buildRows(rows) {
        var result = [];

        rows.forEach(function (row) {
            if (row && row.results && row.results.length) result.push(row);
        });

        return result;
    }

    function decodeQuery(value) {
        try {
            return decodeURIComponent(value || '');
        } catch (error) {
            return String(value || '');
        }
    }

    function subtitleYear(value) {
        var year = normalizeYear(value);
        return year && /^\d{4}$/.test(year) ? year + '-01-01' : '';
    }

    function itemRating(item) {
        var raw = item && item.raw ? item.raw : {};
        var rating = raw.ratings && raw.ratings[0] ? raw.ratings[0].movieRating : '';
        var match;

        if (!rating && item && item.subtitle) {
            match = String(item.subtitle).match(/Rating\s+([\d.]+)/i);
            if (match) rating = match[1];
        }

        rating = parseFloat(rating);
        return isNaN(rating) ? 0 : rating;
    }

    function normalizeYear(value) {
        if (!value) return '';
        var text = String(value);
        var match = text.match(/\d{4}/);
        return match ? match[0] : text;
    }

    function formatDuration(value) {
        var minutes = Math.round(Number(value) / 60);
        if (!minutes || minutes < 1) return '';
        if (minutes < 60) return minutes + ' min';
        return Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm';
    }

    function pickImage(images) {
        images = asArray(images);
        if (!images.length) return '';

        var preferred = null;
        for (var i = 0; i < images.length; i++) {
            if (images[i].url && images[i].url.indexOf('2_3_XL') !== -1) {
                preferred = images[i];
                break;
            }
        }

        return (preferred || images[0]).url || '';
    }

    function pickBackdrop(images) {
        images = asArray(images);
        if (!images.length) return '';

        for (var i = 0; i < images.length; i++) {
            if (images[i].url && /16_9|landscape|backdrop|background/i.test(images[i].url + ' ' + (images[i].type || ''))) {
                return images[i].url;
            }
        }

        return '';
    }

    function asArray(value) {
        if (!value) return [];
        if (Object.prototype.toString.call(value) === '[object Array]') return value;
        if (value.items && Object.prototype.toString.call(value.items) === '[object Array]') return value.items;
        if (value.elements && Object.prototype.toString.call(value.elements) === '[object Array]') return value.elements;
        if (value.results && Object.prototype.toString.call(value.results) === '[object Array]') return value.results;
        if (value.content && Object.prototype.toString.call(value.content) === '[object Array]') return value.content;
        if (value.assets && Object.prototype.toString.call(value.assets) === '[object Array]') return value.assets;
        if (typeof value.length === 'number') return Array.prototype.slice.call(value);
        return [];
    }

    // auth-and-playback.js
    function askText(title, value, done) {
        if (Lampa.Input && Lampa.Input.edit) {
            try {
                Lampa.Input.edit({
                    title: title,
                    value: value || '',
                    free: true
                }, function (result) {
                    done(result);
                });
                return;
            } catch (error) {
                try {
                    Lampa.Input.edit(title, value || '', done);
                    return;
                } catch (innerError) {
                    log('Input.edit fallback: ' + innerError.message);
                }
            }
        }

        var result = window.prompt(title, value || '');
        if (result !== null) done(result);
    }

    function refreshSession(api) {
        debugLog('info', 'session:refresh:start', {
            loginType: setting(KEYS.loginType),
            phone: maskPhone(normalizePhone(setting(KEYS.phone))),
            hasOtp: !!setting(KEYS.otp),
            hasSession: !!(setting(KEYS.session) && setting(KEYS.session).sessionId)
        });

        return api.ensureSession(true).then(function () {
            notify(t('session_refreshed'));
            debugLog('info', 'session:refresh:ok', {
                userId: setting(KEYS.session) && setting(KEYS.session).userId
            });
        }).catch(function (error) {
            notify(error.message || String(error));
            debugLog('error', 'session:refresh:error', {
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
        });
    }

    function logout(api) {
        debugLog('info', 'session:logout:start', {
            hasSession: !!(setting(KEYS.session) && setting(KEYS.session).sessionId)
        });

        return api.logout().then(function () {
            notify(t('session_cleared'));
            debugLog('info', 'session:logout:ok', {});
        }).catch(function (error) {
            notify(error.message || String(error));
            debugLog('error', 'session:logout:error', {
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
        });
    }

    function playItem(api, item) {
        var key = item && item.assetId ? String(item.assetId) : '';
        var now = Date.now();

        if (key && playRequestLock.key === key && now - playRequestLock.time < 1200) {
            debugLog('warn', 'play:duplicate-suppressed', {
                assetId: item.assetId,
                title: item.title || ''
            });
            return Promise.resolve();
        }

        playRequestLock = { key: key, time: now };

        notify(t('resolving_stream'));
        debugLog('info', 'play:resolve:start', {
            assetId: item.assetId,
            type: item.videoType,
            title: item.title
        });

        return api.getStreamUrl(item.assetId, item.videoType).then(function (stream) {
            var url = decorateStreamUrl(stream.url);
            debugLog('info', 'play:resolve:ok', {
                assetId: item.assetId,
                hasUrl: !!stream.url
            });

            Lampa.Player.play({
                title: item.title,
                url: url,
                poster: item.image || '',
                timeline: false
            });
        }).catch(function (error) {
            notify(error.message || String(error));
            debugLog('error', 'play:resolve:error', {
                assetId: item.assetId,
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
        });
    }

    function decorateStreamUrl(url) {
        if (!boolSetting(KEYS.appendHeaders)) return url;
        if (url.indexOf('|') !== -1) return url;

        return url + '|User-Agent="' + encodeURIComponent(USER_AGENT) + '"&Referer="' + encodeURIComponent(REFERER) + '"';
    }

    // api-client.js
    function KyivstarApi() {
        this.network = Lampa.Reguest ? new Lampa.Reguest() : null;
    }

    KyivstarApi.prototype.clear = function () {
        if (this.network && this.network.clear) this.network.clear();
    };

    KyivstarApi.prototype.headers = function () {
        return {
            'x-vidmind-device-id': setting(KEYS.deviceId),
            'x-vidmind-device-type': 'WEB',
            'x-vidmind-locale': setting(KEYS.locale)
        };
    };

    KyivstarApi.prototype.url = function (path) {
        return applyProxy(API_BASE + path);
    };

    KyivstarApi.prototype.request = function (path, options) {
        var self = this;
        var retries = options && options.retries !== undefined ? options.retries : 1;
        var requestOptions = merge({
            headers: this.headers()
        }, options || {});

        function run(attempt) {
            return request(self.network, self.url(path), requestOptions).catch(function (error) {
                if (error.status === 429 && attempt < retries) {
                    return delay(10000).then(function () {
                        return run(attempt + 1);
                    });
                }

                throw error;
            });
        }

        return run(0);
    };

    KyivstarApi.prototype.withSession = function (handler, retry) {
        var self = this;

        return this.ensureSession(false).then(function (session) {
            return Promise.resolve(handler(session)).catch(function (error) {
                if (error.status === 401 && retry !== false) {
                    return self.ensureSession(true).then(function (newSession) {
                        return handler(newSession);
                    });
                }

                throw error;
            });
        });
    };

    KyivstarApi.prototype.ensureSession = function (force) {
        var current = setting(KEYS.session);
        if (!force && current && current.sessionId && current.userId) return Promise.resolve(current);

        var loginType = setting(KEYS.loginType);
        var loginPromise;

        debugLog('info', 'auth:ensure:start', {
            force: !!force,
            loginType: loginType,
            hasCurrentSession: !!(current && current.sessionId)
        });

        if (loginType === 'account') {
            loginPromise = this.loginAccount();
        } else if (loginType === 'phone') {
            loginPromise = this.loginPhone();
        } else {
            loginPromise = this.loginAnonymous();
        }

        return loginPromise.then(function (profile) {
            if (!profile || !profile.userId || !profile.sessionId) {
                throw new Error('Kyivstar TV login failed.');
            }

            saveSetting(KEYS.session, {
                userId: profile.userId,
                sessionId: profile.sessionId
            });

            debugLog('info', 'auth:ensure:ok', {
                userId: profile.userId,
                loginType: loginType
            });

            return setting(KEYS.session);
        });
    };

    KyivstarApi.prototype.loginAnonymous = function () {
        debugLog('info', 'auth:anonymous:start', {});

        return this.request('authentication/login', {
            method: 'POST',
            form: {
                username: AUTH_REALM + '\\anonymous',
                password: 'anonymous'
            }
        }).then(function (profile) {
            debugLog('info', 'auth:anonymous:ok', {
                userId: profile && profile.userId,
                hasSession: !!(profile && profile.sessionId)
            });
            return profile;
        });
    };

    KyivstarApi.prototype.loginAccount = function () {
        var self = this;
        var username = setting(KEYS.username);
        var password = setting(KEYS.password);

        if (!username || !password) {
            return Promise.reject(new Error(t('account_password_required')));
        }

        return this.loginAnonymous().then(function (anonymous) {
            return self.request('authentication/login/v3;jsessionid=' + encodeURIComponent(anonymous.sessionId), {
                method: 'POST',
                form: {
                    username: AUTH_REALM + '\\' + username,
                    password: password
                }
            });
        });
    };

    KyivstarApi.prototype.loginPhone = function () {
        var self = this;
        var phone = normalizePhone(setting(KEYS.phone));
        var otp = setting(KEYS.otp);
        var pending = setting(KEYS.pendingPhoneSession);

        debugLog('info', 'auth:phone:start', {
            phone: maskPhone(phone),
            hasOtp: !!otp,
            hasPendingSession: !!(pending && pending.sessionId)
        });

        if (!phone) {
            return Promise.reject(new Error(t('phone_required')));
        }

        var pendingPromise = this.ensurePhonePendingSession();

        return pendingPromise.then(function (phoneSession) {
            if (!otp) {
                return self.sendOtp(phoneSession.sessionId, phone).then(function () {
                    throw new Error(t('sms_sent_enter_refresh'));
                });
            }

            return self.request('authentication/login/v3;jsessionid=' + encodeURIComponent(phoneSession.sessionId), {
                method: 'POST',
                form: {
                    username: AUTH_REALM + '\\' + phone,
                    otp: otp
                }
            }).then(function (profile) {
                debugLog('info', 'auth:phone:otp-login:ok', {
                    userId: profile && profile.userId
                });
                saveSetting(KEYS.otp, '');
                saveSetting(KEYS.pendingPhoneSession, null);
                return profile;
            });

        });
    };

    KyivstarApi.prototype.ensurePhonePendingSession = function () {
        var pending = setting(KEYS.pendingPhoneSession);

        if (pending && pending.sessionId) {
            debugLog('info', 'auth:phone:pending:reuse', {
                userId: pending.userId,
                hasSession: true
            });
            return Promise.resolve(pending);
        }

        debugLog('info', 'auth:phone:pending:create', {});

        return this.loginAnonymous().then(function (anonymous) {
            saveSetting(KEYS.pendingPhoneSession, anonymous);
            debugLog('info', 'auth:phone:pending:created', {
                userId: anonymous && anonymous.userId,
                hasSession: !!(anonymous && anonymous.sessionId)
            });
            return anonymous;
        });
    };

    KyivstarApi.prototype.sendOtp = function (sessionId, phone) {
        phone = normalizePhone(phone);
        debugLog('info', 'otp:request:start', {
            phone: maskPhone(phone),
            hasSession: !!sessionId
        });

        return this.request('v2/otp;jsessionid=' + encodeURIComponent(sessionId), {
            method: 'POST',
            json: {
                phoneNumber: phone,
                language: 'UK',
                channel: 'sms'
            },
            dataType: 'text'
        }).then(function (result) {
            debugLog('info', 'otp:request:ok', {
                phone: maskPhone(phone),
                emptyResponse: result === '' || result === null || result === undefined
            });
            return result;
        }).catch(function (error) {
            debugLog('error', 'otp:request:error', {
                phone: maskPhone(phone),
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            throw error;
        });
    };

    KyivstarApi.prototype.logout = function () {
        var session = setting(KEYS.session);
        saveSetting(KEYS.session, null);
        saveSetting(KEYS.pendingPhoneSession, null);
        this.clearCache();

        if (session && session.userId && session.userId !== 'anonymous') {
            return this.request('authentication/logout;jsessionid=' + encodeURIComponent(session.sessionId) + '?sessionExpired=false', {
                dataType: 'text'
            }).catch(function (error) {
                log('logout request failed: ' + error.message);
            });
        }

        return Promise.resolve();
    };

    KyivstarApi.prototype.getLiveChannelGroups = function () {
        var self = this;
        return this.cached('channel-groups', CACHE_CHANNELS_MS, function () {
            return self.withSession(function (session) {
                return self.request('v1/contentareas/LIVE_CHANNELS;jsessionid=' + encodeURIComponent(session.sessionId) + '?includeRestricted=true&limit=100');
            });
        });
    };

    KyivstarApi.prototype.getGroupElements = function (groupId) {
        var self = this;
        return this.cached('group-' + groupId, CACHE_CHANNELS_MS, function () {
            return self.withSession(function (session) {
                return self.request('gallery/contentgroups/' + encodeURIComponent(groupId) + ';jsessionid=' + encodeURIComponent(session.sessionId) + '?offset=0&limit=500');
            });
        });
    };

    KyivstarApi.prototype.getContentAreas = function () {
        var self = this;
        return this.cached('contentareas-my-tv-web-v1', CACHE_CATALOG_MS, function () {
            return self.withSession(function (session) {
                return self.request('api/v2/contentareas/MY_TV_WEB;jsessionid=' + encodeURIComponent(session.sessionId) + '?includeRestricted=true');
            });
        });
    };

    KyivstarApi.prototype.getCompilations = function (areaId) {
        var self = this;
        return this.cached('compilations-v2-' + (areaId || 'root'), CACHE_CATALOG_MS, function () {
            return self.withSession(function (session) {
                return self.request('api/v1/compilations;jsessionid=' + encodeURIComponent(session.sessionId), {
                    method: 'POST',
                    json: {
                        contentAreaId: areaId,
                        compilationGroupType: 'CRISPS'
                    }
                });
            });
        });
    };

    KyivstarApi.prototype.getFilters = function (areaId) {
        var self = this;
        return this.cached('filters-v2-' + (areaId || 'root'), CACHE_CATALOG_MS, function () {
            return self.withSession(function (session) {
                return self.request('api/v1/filters;jsessionid=' + encodeURIComponent(session.sessionId), {
                    method: 'POST',
                    json: {
                        contentAreaId: areaId || null
                    }
                });
            });
        });
    };

    KyivstarApi.prototype.getActiveFilters = function (payload) {
        var self = this;
        return this.withSession(function (session) {
            return self.request('api/v1/gallery/filters/content-area/active-filters;jsessionid=' + encodeURIComponent(session.sessionId), {
                method: 'POST',
                json: payload || {}
            });
        });
    };

    KyivstarApi.prototype.getSortElements = function () {
        var self = this;
        return this.cached('sort-elements-v2', CACHE_CATALOG_MS, function () {
            return self.withSession(function (session) {
                return self.request('api/v1/filters/sort-elements;jsessionid=' + encodeURIComponent(session.sessionId));
            });
        });
    };

    KyivstarApi.prototype.getContentAreaElements = function (compilation, filters, sort, offset, limit) {
        var self = this;
        var key = ['content-v2', compilation || 'root', (filters || []).join(','), sort || 'none', offset, limit].join('-');

        return this.cached(key, CACHE_CHANNELS_MS, function () {
            return self.withSession(function (session) {
                return self.request('api/v1/gallery/filters/content-area;jsessionid=' + encodeURIComponent(session.sessionId), {
                    method: 'POST',
                    json: {
                        compilationElementId: compilation,
                        filterElementIds: filters || [],
                        filterSortElementId: sort,
                        offset: offset || 0,
                        limit: limit || LIMIT,
                        sortOrder: null
                    }
                });
            });
        });
    };

    KyivstarApi.prototype.getContentGroupElements = function (groupId, filters, sort, offset, limit) {
        var self = this;
        var key = ['content-group-v2', groupId || 'none', (filters || []).join(','), sort || 'none', offset, limit].join('-');

        return this.cached(key, CACHE_CHANNELS_MS, function () {
            return self.withSession(function (session) {
                return self.request('api/v1/gallery/filters/content-group;jsessionid=' + encodeURIComponent(session.sessionId), {
                    method: 'POST',
                    json: {
                        contentGroupElementId: groupId,
                        filterElementIds: filters || [],
                        filterSortElementId: sort,
                        offset: offset || 0,
                        limit: limit || LIMIT,
                        sortOrder: null
                    }
                });
            });
        });
    };

    KyivstarApi.prototype.getContentGroupLegacyElements = function (groupId, offset, limit) {
        var self = this;
        var key = ['content-group-legacy-v1', groupId || 'none', offset || 0, limit || LIMIT].join('-');

        return this.cached(key, CACHE_CHANNELS_MS, function () {
            return self.withSession(function (session) {
                return self.request('gallery/contentgroups/' + encodeURIComponent(groupId) +
                    ';jsessionid=' + encodeURIComponent(session.sessionId) +
                    '?offset=' + encodeURIComponent(offset || 0) +
                    '&limit=' + encodeURIComponent(limit || LIMIT));
            });
        });
    };

    KyivstarApi.prototype.search = function (query) {
        var self = this;
        return this.withSession(function (session) {
            var path = 'api/v1/search/predictive;jsessionid=' + encodeURIComponent(session.sessionId) +
                '?q=' + encodeURIComponent(query) + '&limit=50&includeLiveChannels=true';
            return self.request(path);
        });
    };

    KyivstarApi.prototype.getAssetInfo = function (assetId) {
        var self = this;
        return this.withSession(function (session) {
            return self.request('assets/v2;jsessionid=' + encodeURIComponent(session.sessionId) + '?movie=' + encodeURIComponent(assetId));
        });
    };

    KyivstarApi.prototype.getTvGroup = function (assetId, season, offset, limit) {
        var self = this;
        return this.withSession(function (session) {
            return self.request('api/v1/gallery/tvgroup/' + encodeURIComponent(assetId) +
                ';jsessionid=' + encodeURIComponent(session.sessionId) +
                '?seasonNumber=' + encodeURIComponent(season) +
                '&offset=' + encodeURIComponent(offset || 0) +
                '&limit=' + encodeURIComponent(limit || LIMIT));
        });
    };

    KyivstarApi.prototype.getStreamUrl = function (assetId, videoType) {
        var self = this;

        return this.withSession(function (session) {
            var version = session.userId === 'anonymous' ? '4' : '2';
            var isVirtual = videoType === 'VIRTUAL';
            var path = 'play/v' + version + ';jsessionid=' + encodeURIComponent(session.sessionId) + '?assetId=' + encodeURIComponent(assetId);

            if (isVirtual) path += '&date=-1000';

            return self.request(path, { retries: 0 }).then(function (data) {
                if (data && data.error) throw new Error(data.description || data.error);
                if (isVirtual && data && data.media && data.media[0] && data.media[0].url) {
                    return { url: data.media[0].url, quality: 'auto', subtitles: [] };
                }
                if (!isVirtual && data && data.liveChannelUrl) {
                    return { url: data.liveChannelUrl, quality: 'auto', subtitles: [] };
                }
                throw new Error('Kyivstar TV did not return a playable stream URL.');
            });
        });
    };

    KyivstarApi.prototype.cached = function (name, ttl, loader) {
        var key = 'kyivstar_cache_' + name;
        var cached = Lampa.Storage.get(key, null);
        var now = Date.now();

        if (cached && cached.time && now - cached.time < ttl) return Promise.resolve(cached.value);

        return Promise.resolve(loader()).then(function (value) {
            Lampa.Storage.set(key, { time: now, value: value });
            rememberCacheKey(key);
            return value;
        });
    };

    KyivstarApi.prototype.clearCache = function () {
        setting(KEYS.cacheKeys).forEach(function (key) {
            Lampa.Storage.set(key, null);
        });
        saveSetting(KEYS.cacheKeys, []);
    };

    function rememberCacheKey(key) {
        var keys = setting(KEYS.cacheKeys);
        if (keys.indexOf(key) !== -1) return;
        keys.push(key);
        saveSetting(KEYS.cacheKeys, keys);
    }

    function request(network, url, options) {
        options = options || {};

        var method = options.method || 'GET';
        var headers = merge({}, options.headers || {});
        var dataType = options.dataType || 'json';
        var postData = false;
        var id = ++requestCounter;
        var start = Date.now();

        if (options.json !== undefined) {
            postData = JSON.stringify(options.json);
            headers['Content-Type'] = 'application/json';
        } else if (options.form) {
            postData = options.form;
        }

        debugLog('info', 'request:start', {
            id: id,
            method: postData ? 'POST' : method,
            url: sanitizeUrl(url),
            dataType: dataType,
            body: summarizeBody(postData)
        });

        return new Promise(function (resolve, reject) {
            var ok = function (data) {
                debugLog('info', 'request:ok', {
                    id: id,
                    ms: Date.now() - start,
                    url: sanitizeUrl(url),
                    data: summarizeData(data)
                });

                if (dataType === 'json' && typeof data === 'string') {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(error);
                    }
                    return;
                }

                resolve(data);
            };

            var fail = function (error) {
                var normalized = normalizeRequestError(error);
                debugLog('error', 'request:error', {
                    id: id,
                    ms: Date.now() - start,
                    url: sanitizeUrl(url),
                    status: normalized.status || normalized.decode_code || '',
                    error: normalized.message || String(normalized),
                    body: summarizeData(normalized.body || normalized.responseText || '')
                });
                reject(normalized);
            };

            if (network && (network.native || network.silent)) {
                var methodName = network.native ? 'native' : 'silent';
                debugLog('info', 'request:transport', {
                    id: id,
                    transport: methodName
                });
                network.timeout(20000);
                network[methodName](url, ok, fail, postData, {
                    type: method,
                    headers: headers,
                    dataType: dataType,
                    timeout: 20000
                });
                return;
            }

            debugLog('info', 'request:transport', {
                id: id,
                transport: 'fetch'
            });
            fetchRequest(url, method, headers, postData, dataType).then(ok).catch(fail);
        });
    }

    function fetchRequest(url, method, headers, postData, dataType) {
        var body = null;

        if (postData && typeof postData === 'object') {
            body = encodeForm(postData);
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        } else if (postData) {
            body = postData;
        }

        return fetch(url, {
            method: method,
            headers: headers,
            body: body
        }).then(function (response) {
            if (!response.ok) {
                var error = new Error('HTTP ' + response.status);
                error.status = response.status;

                return response.text().then(function (text) {
                    try {
                        error.body = JSON.parse(text);
                    } catch (jsonError) {
                        error.body = text;
                    }
                    throw error;
                });
            }

            if (dataType === 'text') return response.text();
            return response.json();
        });
    }

    function normalizeRequestError(error) {
        if (error instanceof Error) return error;

        var normalized = new Error('Network request failed');
        if (error) {
            normalized.status = error.status || error.decode_code;
            normalized.body = error.responseJSON || error.responseText;

            if (error.decode_error) normalized.message = error.decode_error;
            else if (error.responseJSON && error.responseJSON.description) normalized.message = error.responseJSON.description;
            else if (error.responseText) normalized.message = error.responseText;
            else if (error.status) normalized.message = 'HTTP ' + error.status;
        }

        return normalized;
    }

    // utils.js
    function normalizePhone(value) {
        var digits = String(value || '').replace(/\D/g, '');

        if (digits.length === 10 && digits.charAt(0) === '0') {
            digits = '38' + digits;
        }

        return digits;
    }

    function maskPhone(value) {
        var digits = normalizePhone(value);
        if (!digits) return '';
        if (digits.length <= 6) return digits.replace(/\d/g, '*');
        return digits.substr(0, 5) + '***' + digits.substr(digits.length - 2);
    }

    function sanitizeUrl(url) {
        return String(url || '')
            .replace(/jsessionid=[^?&]+/g, 'jsessionid=***')
            .replace(/([?&]otp=)[^&]+/g, '$1***')
            .replace(/([?&]pin=)[^&]+/g, '$1***');
    }

    function sanitize(value) {
        var result;
        var key;

        if (value === null || value === undefined) return value;
        if (typeof value === 'string') return sanitizeString(value);
        if (typeof value === 'number' || typeof value === 'boolean') return value;

        if (Object.prototype.toString.call(value) === '[object Array]') {
            result = [];
            for (var i = 0; i < value.length; i++) result.push(sanitize(value[i]));
            return result;
        }

        if (typeof value === 'object') {
            result = {};
            for (key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    if (/password|otp|token|pin/i.test(key) || /sessionId|jsessionid|pendingPhoneSession|^session$/i.test(key)) result[key] = '***';
                    else if (/phone/i.test(key)) result[key] = maskPhone(value[key]);
                    else if (/url/i.test(key)) result[key] = sanitizeUrl(value[key]);
                    else result[key] = sanitize(value[key]);
                }
            }
            return result;
        }

        return String(value);
    }

    function sanitizeString(value) {
        return String(value)
            .replace(/jsessionid=[^?&\s]+/g, 'jsessionid=***')
            .replace(/557455cfe4b04ad886a6ae41\\[0-9+]+/g, AUTH_REALM + '\\' + '***');
    }

    function summarizeBody(body) {
        if (!body) return 'none';

        if (typeof body === 'string') {
            try {
                return sanitize(JSON.parse(body));
            } catch (error) {
                return sanitizeString(body).substr(0, 240);
            }
        }

        return sanitize(body);
    }

    function summarizeData(data) {
        var summary = {};
        var keys = [];
        var key;

        if (data === '' || data === null || data === undefined) return 'empty';
        if (typeof data === 'string') return sanitizeString(data).substr(0, 240);
        if (typeof data !== 'object') return data;

        for (key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) keys.push(key);
        }

        summary.type = Object.prototype.toString.call(data).replace('[object ', '').replace(']', '');
        summary.keys = keys.slice(0, 12);
        if (data.userId) summary.userId = data.userId;
        if (data.error) summary.error = data.error;
        if (data.description) summary.description = data.description;
        if (typeof data.length === 'number') summary.length = data.length;

        return sanitize(summary);
    }

    function safeJson(value) {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return String(value);
        }
    }

    function applyProxy(url) {
        var proxy = setting(KEYS.proxy);
        if (!proxy) return url;

        if (proxy.indexOf('{url}') !== -1) {
            return proxy.replace('{url}', encodeURIComponent(url));
        }

        return proxy.replace(/\/?$/, '/') + encodeURIComponent(url);
    }

    function delay(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function merge(target, source) {
        target = target || {};
        source = source || {};

        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }

        return target;
    }

    function copyRoute(route, patch) {
        return merge(merge({}, route), patch);
    }

    function objectValues(object) {
        var values = [];

        object = object || {};
        for (var key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) values.push(object[key]);
        }

        return values;
    }

    function arrayFromAny(value) {
        if (!value) return [];
        if (Object.prototype.toString.call(value) === '[object Array]') return value;
        if (value.items) return asArray(value.items);
        if (value.elements) return asArray(value.elements);
        if (value.values) return asArray(value.values);
        if (value.options) return asArray(value.options);
        return asArray(value);
    }

    function normalizeProductionCountries(raw) {
        var countries = raw && (raw.production_countries || raw.productionCountries || raw.countries || raw.country);
        var list = [];

        if (!countries) return list;

        if (Object.prototype.toString.call(countries) !== '[object Array]') {
            countries = String(countries).split(/[,/|]/);
        }

        countries.forEach(function (country) {
            var code;
            var name;

            if (!country) return;

            if (typeof country === 'string') {
                name = country.trim();
                code = name.length === 2 ? name.toUpperCase() : '';
            } else {
                code = country.iso_3166_1 || country.code || country.iso || '';
                name = country.name || country.title || country.displayName || code;
            }

            if (name || code) {
                list.push({
                    iso_3166_1: code || name,
                    name: name || code
                });
            }
        });

        return list;
    }

    function encodeForm(data) {
        var parts = [];

        for (var key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
        }

        return parts.join('&');
    }

    function brandIconHtml() {
        return '<img src="' + ASSET_BASE + 'favicon.ico" alt="' + TITLE + '" style="width:1.35em;height:1.35em;object-fit:contain;display:block;">';
    }

    function brandLogoHtml() {
        return '<img src="' + ASSET_BASE + 'logo-ua.svg" alt="' + TITLE + '" style="width:120px;height:21px;object-fit:contain;display:block;">';
    }

    function iconSvg() {
        return brandIconHtml() || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2"/>' +
            '<path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M9 9l5 3-5 3V9z" fill="currentColor"/>' +
            '</svg>';
    }

    boot();
})();
