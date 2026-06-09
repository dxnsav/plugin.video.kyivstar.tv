(function () {
    'use strict';

    // state.js
    var PLUGIN_BUILD = '2026-06-09-native-lampa-source';
    var PLUGIN_FLAG = '__kyivstar_tv_lampa_loaded_' + PLUGIN_BUILD;
    var COMPONENT = 'kyivstar_tv';
    var TITLE = 'Kyivstar TV';
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
            addStyles();
            addComponent();
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
            addApiSource();
            addFullPlayerHook();
            addSettings();
            addSearchSource();
            initNotice();
        } else if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', function (event) {
                if (event.type === 'ready') {
                    addSideMenuEntry();
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
                    anonymous: 'Anonymous',
                    account: 'Personal account',
                    phone: 'Phone OTP'
                },
                default: DEFAULTS[KEYS.loginType]
            }, 'Login type', 'Anonymous supports free channels. Personal account and phone OTP require an active Kyivstar TV account.');

            addParam({ name: KEYS.username, type: 'input', default: '' }, 'Personal account', 'Used only when login type is Personal account.', clearSession);
            addParam({ name: KEYS.password, type: 'input', default: '', password: true }, 'Password', 'Stored locally by Lampa.', clearSession);
            addParam({ name: KEYS.phone, type: 'input', default: '' }, 'Phone number', 'Used only when login type is Phone OTP.', clearSession);
            addParam({ name: KEYS.otp, type: 'input', default: '' }, 'SMS code', 'Enter the SMS code here, then use Refresh session.');
            addParam({
                name: KEYS.locale,
                type: 'select',
                values: { uk_UA: 'Ukrainian', en_US: 'English', ru_RU: 'Russian' },
                default: DEFAULT_LOCALE
            }, 'Locale', 'Language sent to Kyivstar TV API.', clearSession);
            addParam({ name: KEYS.proxy, type: 'input', default: '' }, 'CORS proxy', 'Optional self-hosted proxy. Use {url} as the encoded target URL placeholder.');
            addParam({ name: KEYS.appendHeaders, type: 'trigger', default: true }, 'Append stream headers', 'Adds Referer and User-Agent metadata to resolved HLS URLs.');
            addParam({ name: 'kyivstar_send_sms', type: 'button' }, 'Send SMS code now', 'Requests a phone OTP for the saved phone number.', function () {
                sendSmsCode(new KyivstarApi());
            });
            addParam({ name: 'kyivstar_refresh_session', type: 'button' }, 'Refresh session', 'Re-login with the selected login type.', function () {
                refreshSession(new KyivstarApi());
            });
            addParam({ name: 'kyivstar_diagnostics', type: 'button' }, 'Diagnostics / logs', 'Open Kyivstar TV request logs.', function () {
                showDiagnosticsMenu(settingsBack);
            });
            addParam({ name: 'kyivstar_clear_phone', type: 'button' }, 'Clear phone OTP state', 'Clears pending anonymous phone session and SMS code.', function () {
                saveSetting(KEYS.pendingPhoneSession, null);
                saveSetting(KEYS.otp, '');
                debugLog('info', 'auth:phone:state-cleared', {});
                notify('Kyivstar TV phone OTP state cleared.');
            });
            addParam({ name: 'kyivstar_logout', type: 'button' }, 'Log out / clear session', 'Clears local Kyivstar TV session and cache.', function () {
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
            api.getCompilations(null).catch(function (error) {
                debugLog('warn', 'api:main:compilations-error', {
                    error: error.message || String(error),
                    status: error.status || error.decode_code || ''
                });
                return [];
            }).then(function (compilations) {
                compilationsCache = filterNativeCompilations(compilations);

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
            var button;

            if (!item || movie.source !== COMPONENT || event.type !== 'complite' || !event.body) return;

            button = $(event.body).find('.button--play').eq(0);
            if (!button.length) return;

            button.off('hover:enter click');
            button.on('hover:enter click', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                openKyivstarItem(item);
                return false;
            });
        });

        fullPlayerHookAdded = true;
        debugLog('info', 'full:player-hook-added', {});
    }

    function filterNativeCompilations(compilations) {
        return asArray(compilations).filter(function (item) {
            return item && item.id;
        });
    }

    function loadNativeRow(api, compilation) {
        var title = compilation ? (compilation.displayName || compilation.name || 'Videos') : 'Videos';
        var id = compilation ? compilation.id : null;
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
        if (compilation.compilationElementType === 'CONTENT_GROUP') return 'group';
        if (compilation.compilationElementType === 'PREDEFINED') return 'root';
        return 'compilation';
    }

    function loadNativeListPage(api, parsed, offset, limit) {
        if (parsed.groupId) return loadNativeGroupPage(api, parsed.groupId, offset, limit);

        return api.getContentAreaElements(parsed.compilationId, [], parsed.sortId || null, offset, limit);
    }

    function loadNativeGroupPage(api, groupId, offset, limit) {
        return api.getContentGroupElements(groupId, [], null, offset, limit).then(function (assets) {
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
            id: item.assetId || item.title,
            source: COMPONENT,
            method: isSeries ? 'tv' : 'movie',
            title: item.title,
            original_title: item.title,
            release_date: isSeries ? '' : date,
            first_air_date: isSeries ? date : '',
            overview: description,
            runtime: runtime || 0,
            vote_average: rating || 0,
            genres: [],
            production_countries: normalizeProductionCountries(raw),
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

        return {
            title: TITLE,
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
                    debugLog('info', 'search:native:ok', {
                        query: query,
                        rows: rows.length
                    });
                    done(rows);
                }).catch(function (error) {
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
            { title: 'Videos', type: 'movie', results: videos },
            { title: 'Live TV', type: 'channel', results: channels }
        ]);
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
            notify('This item is not available for the current account.');
            return;
        }

        if (item.kind === 'nav' && item.route) {
            pushRoute(item.route, item.title);
        } else if (item.kind === 'vod' || item.kind === 'episode' || item.kind === 'channel') {
            playItem(new KyivstarApi(), item);
        }
    }

    function addComponent() {
        if (!Lampa.Component || !Lampa.Component.add) {
            setTimeout(addComponent, 500);
            return;
        }

        Lampa.Component.add(COMPONENT, KyivstarComponent);
    }

    function pushRoute(route, title) {
        Lampa.Activity.push({
            title: title || TITLE,
            component: COMPONENT,
            route: route
        });
    }

    function showMainMenu() {
        addApiSource();
        pushRoute({ type: 'home' }, TITLE);
    }

    // settings-menu.js
    function showSettingsMenu(api, onBack) {
        var session = setting(KEYS.session);

        if (!Lampa.Select || !Lampa.Select.show) {
            notify('Lampa Select API is not available.');
            return;
        }

        Lampa.Select.show({
            title: TITLE + ' settings',
            items: [
                { title: 'Login type: ' + loginTypeTitle(setting(KEYS.loginType)), action: 'login-type' },
                { title: 'Locale: ' + localeTitle(setting(KEYS.locale)), action: 'locale' },
                { title: 'Append stream headers: ' + (boolSetting(KEYS.appendHeaders) ? 'On' : 'Off'), action: 'headers' },
                { title: 'Personal account: ' + filled(setting(KEYS.username)), action: 'username' },
                { title: 'Password: ' + filled(setting(KEYS.password)), action: 'password' },
                { title: 'Phone number: ' + filled(setting(KEYS.phone)), action: 'phone' },
                { title: 'SMS code: ' + filled(setting(KEYS.otp)), action: 'otp' },
                { title: 'CORS proxy: ' + filled(setting(KEYS.proxy)), action: 'proxy' },
                { title: 'Send SMS code now', action: 'send-otp' },
                { title: 'Refresh session' + (session && session.userId ? ' (' + session.userId + ')' : ''), action: 'session' },
                { title: 'Diagnostics / logs', action: 'diagnostics' },
                { title: 'Clear phone OTP state', action: 'clear-phone' },
                { title: 'Log out / clear session', action: 'logout' }
            ],
            onSelect: function (item) {
                if (item.action === 'login-type') selectLoginType(api, onBack);
                else if (item.action === 'locale') selectLocale(api, onBack);
                else if (item.action === 'headers') {
                    saveSetting(KEYS.appendHeaders, !boolSetting(KEYS.appendHeaders));
                    showSettingsMenu(api, onBack);
                } else if (item.action === 'username') editStoredValue('Personal account', KEYS.username, api, onBack);
                else if (item.action === 'password') editStoredValue('Password', KEYS.password, api, onBack);
                else if (item.action === 'phone') editStoredValue('Phone number', KEYS.phone, api, onBack);
                else if (item.action === 'otp') editStoredValue('SMS code', KEYS.otp, api, onBack);
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
        selectStoredValue('Login type', KEYS.loginType, [
            { title: 'Anonymous', value: 'anonymous' },
            { title: 'Personal account', value: 'account' },
            { title: 'Phone OTP', value: 'phone' }
        ], api, onBack);
    }

    function selectLocale(api, onBack) {
        selectStoredValue('Locale', KEYS.locale, [
            { title: 'Ukrainian', value: 'uk_UA' },
            { title: 'English', value: 'en_US' },
            { title: 'Russian', value: 'ru_RU' }
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
            notify('Set phone number first.');
            debugLog('error', 'otp:manual:no-phone', {});
            return Promise.resolve();
        }

        notify('Sending SMS code...');

        return api.ensurePhonePendingSession().then(function (phoneSession) {
            return api.sendOtp(phoneSession.sessionId, phone);
        }).then(function () {
            notify('SMS code request sent. Check your phone.');
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
            { title: 'Print logs to console (' + logs.length + ')', action: 'print' },
            { title: 'Clear logs', action: 'clear' }
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
            title: TITLE + ' diagnostics',
            items: items,
            onSelect: function (item) {
                if (item.action === 'print') {
                    printDebugLogs();
                    notify('Kyivstar TV logs printed to console.');
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
        if (value === 'account') return 'Personal account';
        if (value === 'phone') return 'Phone OTP';
        return 'Anonymous';
    }

    function localeTitle(value) {
        if (value === 'en_US') return 'English';
        if (value === 'ru_RU') return 'Russian';
        return 'Ukrainian';
    }

    function filled(value) {
        return value ? 'set' : 'empty';
    }

    // catalog-filter-menu.js
    function showCatalogFilterMenu(route, api) {
        if (!Lampa.Select || !Lampa.Select.show) {
            notify('Lampa Select API is not available.');
            return;
        }

        Promise.all([
            api.getFilters(null).catch(function (error) {
                debugLog('warn', 'filters:list:error', { error: error.message || String(error) });
                return [];
            }),
            api.getSortElements().catch(function (error) {
                debugLog('warn', 'filters:sort:error', { error: error.message || String(error) });
                return [];
            })
        ]).then(function (data) {
            var groups = normalizeFilterGroups(data[0]);
            var sorts = normalizeSortElements(data[1]);
            var items = [
                { title: 'Розпочати пошук', action: 'apply' },
                { title: 'Скинути фільтри', action: 'reset' },
                { title: 'Сортування: ' + (route.sortName || 'Не вибрано'), action: 'sort', values: sorts }
            ];

            groups.forEach(function (group) {
                items.push({
                    title: group.title + ': ' + selectedFilterTitle(route, group),
                    action: 'filter',
                    group: group
                });
            });

            Lampa.Select.show({
                title: 'Фільтр',
                items: items,
                onSelect: function (item) {
                    if (item.action === 'apply') {
                        pushRoute(copyRoute(route, { offset: 0 }), routeTitle(route));
                    } else if (item.action === 'reset') {
                        pushRoute(copyRoute(route, { offset: 0, filters: [], filterMap: {}, sort: null, sortName: '' }), routeTitle(route));
                    } else if (item.action === 'sort') {
                        showSortSelect(route, sorts, api);
                    } else if (item.action === 'filter') {
                        showFilterValueSelect(route, item.group, api);
                    }
                },
                onBack: function () {
                    if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle(COMPONENT);
                }
            });
        });
    }

    function showSortSelect(route, sorts, api) {
        var items = [{ title: (route.sort ? '' : '* ') + 'Не вибрано', id: null, name: '' }];

        sorts.forEach(function (sort) {
            items.push({
                title: (sort.id === route.sort ? '* ' : '') + sort.title,
                id: sort.id,
                name: sort.title
            });
        });

        Lampa.Select.show({
            title: 'Сортування',
            items: items,
            onSelect: function (item) {
                pushRoute(copyRoute(route, {
                    offset: 0,
                    sort: item.id || null,
                    sortName: item.name || ''
                }), routeTitle(route));
            },
            onBack: function () {
                showCatalogFilterMenu(route, api);
            }
        });
    }

    function showFilterValueSelect(route, group, api) {
        var selected = selectedFilterId(route, group);
        var items = [{ title: (!selected ? '* ' : '') + 'Не вибрано', id: null, name: '' }];

        group.items.forEach(function (value) {
            items.push({
                title: (value.id === selected ? '* ' : '') + value.title,
                id: value.id,
                name: value.title
            });
        });

        Lampa.Select.show({
            title: group.title,
            items: items,
            onSelect: function (item) {
                var filterMap = merge({}, route.filterMap || {});
                var filterNames = merge({}, route.filterNames || {});
                var filters;

                if (item.id) {
                    filterMap[group.id] = item.id;
                    filterNames[group.id] = item.name;
                } else {
                    delete filterMap[group.id];
                    delete filterNames[group.id];
                }

                filters = objectValues(filterMap).filter(Boolean);

                pushRoute(copyRoute(route, {
                    offset: 0,
                    filters: filters,
                    filterMap: filterMap,
                    filterNames: filterNames
                }), routeTitle(route));
            },
            onBack: function () {
                showCatalogFilterMenu(route, api);
            }
        });
    }

    function selectedFilterId(route, group) {
        var map = route.filterMap || {};
        return map[group.id] || '';
    }

    function selectedFilterTitle(route, group) {
        var id = selectedFilterId(route, group);
        var names = route.filterNames || {};
        var found = null;
        var i;

        if (!id) return 'Не вибрано';
        if (names[group.id]) return names[group.id];

        for (i = 0; i < group.items.length; i++) {
            if (group.items[i].id === id) {
                found = group.items[i];
                break;
            }
        }

        return found ? found.title : 'Вибрано';
    }

    function activeFilterSummary(route) {
        var names = route.filterNames ? objectValues(route.filterNames).filter(Boolean) : [];
        var parts = [];

        if (route.sortName) parts.push(route.sortName);
        if (names.length) parts = parts.concat(names.slice(0, 2));
        if (names.length > 2) parts.push('+' + (names.length - 2));

        return parts.length ? parts.join(' / ') : 'Фільтри і сортування';
    }

    function normalizeFilterGroups(response) {
        return asArray(response).map(function (group) {
            var id = group.id || group.filterId || group.type || group.name || group.title;
            var items = arrayFromAny(group.filterElements || group.elements || group.items || group.values || group.options);

            return {
                id: String(id || ''),
                title: group.displayName || group.name || group.title || 'Фільтр',
                items: normalizeFilterValues(items)
            };
        }).filter(function (group) {
            return group.id && group.items.length;
        });
    }

    function normalizeFilterValues(values) {
        return asArray(values).map(function (value) {
            var id = value.id || value.filterElementId || value.elementId || value.value;
            var title = value.displayName || value.name || value.title || value.label || value.value;

            return {
                id: String(id || ''),
                title: String(title || id || '')
            };
        }).filter(function (item) {
            return item.id && item.title;
        });
    }

    function normalizeSortElements(response) {
        return asArray(response).map(function (sort) {
            var id = sort.id || sort.filterSortElementId || sort.elementId || sort.value;
            var title = sort.displayName || sort.name || sort.title || sort.label || sort.value;

            return {
                id: String(id || ''),
                title: String(title || id || '')
            };
        }).filter(function (sort) {
            return sort.id && sort.title;
        });
    }

    // catalog-component.js
    function KyivstarComponent(object) {
        var self = this;
        var route = object.route || { type: 'root' };
        var api = new KyivstarApi();
        var html = $('<div class="kyivstar-tv"></div>');
        var body = $('<div class="kyivstar-tv__body"></div>');
        var content = $('<div class="kyivstar-tv__content"></div>');
        var scroll = Lampa.Scroll ? new Lampa.Scroll({ mask: true, over: true }) : null;
        var activeItems = [];
        var lastActivated = { key: '', time: 0 };

        if (scroll) {
            scroll.append(content);
            html.append(scroll.render(true));
        } else {
            body.append(content);
            html.append(body);
        }

        this.create = function () {
            load();
            return self.render();
        };

        this.render = function () {
            return html;
        };

        this.start = function () {
            focusFirst();
        };

        this.back = function () {
            if (Lampa.Activity.backward) Lampa.Activity.backward();
            else if (Lampa.Activity.back) Lampa.Activity.back();
        };

        this.destroy = function () {
            if (api) api.clear();
            if (scroll) scroll.destroy();
            html.remove();
            activeItems = [];
        };

        function load() {
            setLoader(true);
            setSubtitle('');

            loadRoute(route, api).then(function (items) {
                renderItems(items);
                setLoader(false);
            }).catch(function (error) {
                setLoader(false);
                renderError(error);
            });
        }

        function setLoader(visible) {
            if (self.activity && self.activity.loader) self.activity.loader(visible);
            if (visible) renderMessage('Loading...');
        }

        function setSubtitle(text) {
        }

        function renderMessage(text) {
            clearBody();
            target().append($('<div class="kyivstar-tv__message"></div>').text(text));
        }

        function renderError(error) {
            clearBody();
            var message = error && error.message ? error.message : String(error || 'Unknown error');
            target().append($('<div class="kyivstar-tv__message kyivstar-tv__message--error"></div>').text(message));
            notify(message);
        }

        function renderItems(items) {
            clearBody();
            if (items && items.rows) {
                renderRows(items.rows);
                return;
            }

            if (!items || !items.length) {
                renderMessage('Nothing found');
                return;
            }

            var grid = $('<div class="kyivstar-tv__grid"></div>');
            grid.addClass(route.type === 'root' ? 'kyivstar-tv__grid--root' : 'kyivstar-tv__grid--catalog');
            items.forEach(function (item) {
                var card = renderCard(item);
                if (route.type === 'root') card.addClass('kyivstar-tv-card--root');
                if (item.kind === 'filter') card.addClass('kyivstar-tv-card--category');
                grid.append(card);
                activeItems.push(card);
            });

            target().append(grid);
            focusFirst();
        }

        function renderRows(rows) {
            if (!rows || !rows.length) {
                renderMessage('Nothing found');
                return;
            }

            rows.forEach(function (row) {
                var rowElement = $('<div class="kyivstar-tv-row"></div>');
                var title = $('<div class="kyivstar-tv-row__title"></div>').text(row.title || '');
                var body = $('<div class="kyivstar-tv-row__body"></div>');

                rowElement.append(title);
                rowElement.append(body);

                (row.items || []).forEach(function (item) {
                    var card = renderCard(item);
                    card.addClass(item.kind === 'nav' ? 'kyivstar-tv-card--category' : 'kyivstar-tv-card--poster');
                    body.append(card);
                    activeItems.push(card);
                });

                target().append(rowElement);
            });

            focusFirst();
        }

        function renderCard(item) {
            var card = $('<div class="kyivstar-tv-card selector" tabindex="0"></div>');
            var thumb = $('<div class="kyivstar-tv-card__thumb"></div>');
            var meta = $('<div class="kyivstar-tv-card__meta"></div>');
            var title = $('<div class="kyivstar-tv-card__title"></div>').text(item.title || TITLE);
            var subtitle = $('<div class="kyivstar-tv-card__subtitle"></div>').text(item.subtitle || '');

            if (item.image) {
                thumb.append($('<img alt="">').attr('src', item.image));
            } else if (item.kind === 'nav' || item.kind === 'filter') {
                thumb.append($('<div class="kyivstar-tv-card__fallback kyivstar-tv-card__fallback--icon"></div>').html(item.icon || iconSvg()));
            } else {
                thumb.append($('<div class="kyivstar-tv-card__fallback"></div>').text((item.title || 'K').slice(0, 2).toUpperCase()));
            }

            if (item.locked) card.addClass('kyivstar-tv-card--locked');
            meta.append(title);
            meta.append(subtitle);
            card.append(thumb);
            card.append(meta);

            card.on('hover:enter click', function () {
                activateOnce(item);
            });
            card.on('hover:focus focus', function () {
                scrollRowToCard(card);
                if (scroll) scroll.update(card);
            });

            return card;
        }

        function activateOnce(item) {
            var key = activationKey(item);
            var now = Date.now();

            if (lastActivated.key === key && now - lastActivated.time < 700) return;

            lastActivated.key = key;
            lastActivated.time = now;
            activate(item);
        }

        function activationKey(item) {
            if (!item) return '';
            if (item.assetId) return item.kind + ':' + item.assetId;
            if (item.route) return item.kind + ':' + item.route.type + ':' + (item.route.compilationId || item.route.groupId || item.title || '');
            return item.kind + ':' + (item.title || '');
        }

        function activate(item) {
            if (item.locked) {
                notify('This item is not available for the current account.');
                return;
            }

            if (item.kind === 'nav') {
                pushRoute(item.route, item.title);
            } else if (item.kind === 'search') {
                askText('Search Kyivstar TV', '', function (query) {
                    if (query) pushRoute({ type: 'search', query: query }, 'Search: ' + query);
                });
            } else if (item.kind === 'session') {
                refreshSession(api);
            } else if (item.kind === 'logout') {
                logout(api);
            } else if (item.kind === 'settings') {
                showSettingsMenu(api, function () {
                    focusFirst();
                });
            } else if (item.kind === 'diagnostics') {
                showDiagnosticsMenu(function () {
                    focusFirst();
                });
            } else if (item.kind === 'filter') {
                showCatalogFilterMenu(route, api);
            } else if (item.kind === 'vod' || item.kind === 'episode' || item.kind === 'channel') {
                playItem(api, item);
            }
        }

        function clearBody() {
            activeItems = [];
            target().empty();
        }

        function target() {
            return content;
        }

        function scrollRowToCard(card) {
            var row = card.closest('.kyivstar-tv-row__body');
            var left;

            if (!row.length) return;

            left = card.position().left + row.scrollLeft();
            row.stop(true).animate({
                scrollLeft: Math.max(0, left - row.width() * 0.18)
            }, 120);
        }

        function focusFirst() {
            if (!Lampa.Controller || !activeItems.length) return;

            Lampa.Controller.add(COMPONENT, {
                toggle: function () {
                    var collection = scroll ? scroll.render() : html;
                    Lampa.Controller.collectionSet(collection);
                    Lampa.Controller.collectionFocus(activeItems[0][0], collection);
                },
                back: self.back,
                up: function () { move('up'); },
                down: function () { move('down'); },
                left: function () {
                    if (window.Navigator && Navigator.canmove && Navigator.canmove('left')) move('left');
                    else if (Lampa.Controller.toggle) Lampa.Controller.toggle('menu');
                },
                right: function () { move('right'); }
            });
            Lampa.Controller.toggle(COMPONENT);
        }
    }

    function move(direction) {
        if (window.Navigator && Navigator.move) Navigator.move(direction);
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
            api.getCompilations(null).catch(function (error) {
                debugLog('warn', 'home:compilations:error', { error: error.message || String(error) });
                return [];
            }),
            api.getContentAreaElements(null, [], null, 0, LIMIT).catch(function (error) {
                debugLog('warn', 'home:videos:error', { error: error.message || String(error) });
                return [];
            })
        ]).then(function (data) {
            var compilations = data[0] || [];
            var videos = data[1] || [];
            var categories = [{
                kind: 'nav',
                title: 'Live TV',
                subtitle: 'Channels',
                image: '',
                route: { type: 'channels' }
            }];
            var rows = [];

            compilations.slice(0, 18).forEach(function (compilation) {
                var type = nativeCompilationType(compilation);
                var id = compilation.id;
                var title = compilation.displayName || compilation.name || 'Selection';

                categories.push({
                    kind: 'nav',
                    title: title,
                    subtitle: 'Videos',
                    image: pickImage(compilation.images),
                    route: {
                        type: 'catalog',
                        compilationId: type === 'compilation' ? id : null,
                        groupId: type === 'group' ? id : null,
                        compilationName: title,
                        offset: 0
                    }
                });
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
            return api.getContentGroupElements(route.groupId, route.filters || [], route.sort || null, offset, limit);
        }

        return api.getContentAreaElements(route.compilationId || null, route.filters || [], route.sort || null, offset, limit);
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
            notify('Kyivstar TV session refreshed.');
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
            notify('Kyivstar TV session cleared.');
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
        notify('Resolving stream...');
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
            return Promise.reject(new Error('Set personal account and password in Kyivstar TV settings.'));
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
            return Promise.reject(new Error('Set phone number in Kyivstar TV settings.'));
        }

        var pendingPromise = this.ensurePhonePendingSession();

        return pendingPromise.then(function (phoneSession) {
            if (!otp) {
                return self.sendOtp(phoneSession.sessionId, phone).then(function () {
                    throw new Error('SMS code sent. Enter it in Kyivstar TV settings, then refresh the session.');
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

    function iconSvg() {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2"/>' +
            '<path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M9 9l5 3-5 3V9z" fill="currentColor"/>' +
            '</svg>';
    }

    // styles.js
    function addStyles() {
        var existing = document.getElementById('kyivstar-tv-styles');

        if (existing && existing.getAttribute('data-build') === PLUGIN_BUILD) return;
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        var style = document.createElement('style');
        style.id = 'kyivstar-tv-styles';
        style.setAttribute('data-build', PLUGIN_BUILD);
        style.textContent = [
            '.kyivstar-tv{padding:1.4em 2.8em 3em;color:#fff;width:100%;min-height:100%;box-sizing:border-box;}',
            '.kyivstar-tv__body,.kyivstar-tv .scroll,.kyivstar-tv .scroll__body{width:100%;min-height:20em;box-sizing:border-box;}',
            '.kyivstar-tv__content{display:block;width:100%;box-sizing:border-box;}',
            '.kyivstar-tv-row{margin:0 0 2.15em;}',
            '.kyivstar-tv-row__title{font-size:1.45em;font-weight:700;line-height:1.15;margin:0 0 .7em;}',
            '.kyivstar-tv-row__body{display:flex;gap:1.1em;overflow:hidden;padding:.15em .2em .45em 0;scroll-behavior:smooth;}',
            '.kyivstar-tv__grid{display:grid;gap:1em;align-items:stretch;width:100%;max-width:86em;box-sizing:border-box;}',
            '.kyivstar-tv__grid--root{grid-template-columns:repeat(auto-fill,minmax(12em,16em));}',
            '.kyivstar-tv__grid--catalog{grid-template-columns:repeat(auto-fill,minmax(9.5em,1fr));}',
            '.kyivstar-tv-card{flex:0 0 10.8em;min-width:0;outline:0;color:#fff;transition:transform .12s ease,opacity .12s ease;}',
            '.kyivstar-tv-card.focus,.kyivstar-tv-card:focus,.kyivstar-tv-card:hover{transform:translateY(-2px);}',
            '.kyivstar-tv-card.focus .kyivstar-tv-card__thumb,.kyivstar-tv-card:focus .kyivstar-tv-card__thumb,.kyivstar-tv-card:hover .kyivstar-tv-card__thumb{box-shadow:0 0 0 .13em rgba(255,255,255,.92),0 .45em 1.1em rgba(0,0,0,.24);}',
            '.kyivstar-tv-card--locked{opacity:.55;}',
            '.kyivstar-tv-card__thumb{height:16em;background:#101820;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.05);transition:box-shadow .12s ease;}',
            '.kyivstar-tv-card__thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
            '.kyivstar-tv-card__fallback{width:3.6em;height:3.6em;border-radius:8px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.86);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.05em;}',
            '.kyivstar-tv-card__fallback svg{width:2.2em;height:2.2em;}',
            '.kyivstar-tv-card__meta{padding:.7em 0 0;}',
            '.kyivstar-tv-card__title{font-size:1em;font-weight:600;line-height:1.18;min-height:2.36em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}',
            '.kyivstar-tv-card__subtitle{font-size:.82em;color:rgba(255,255,255,.66);line-height:1.25;margin-top:.38em;min-height:1.05em;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}',
            '.kyivstar-tv-card--category{flex-basis:14.4em;background:rgba(255,255,255,.055);border-radius:8px;padding:1.1em 1.2em 1.2em;box-shadow:inset 0 0 0 1px rgba(255,255,255,.055);}',
            '.kyivstar-tv-card--category .kyivstar-tv-card__thumb{height:4.4em;background:transparent;box-shadow:none;border-radius:0;}',
            '.kyivstar-tv-card--category.focus,.kyivstar-tv-card--category:focus,.kyivstar-tv-card--category:hover{box-shadow:0 0 0 .13em rgba(255,255,255,.92),inset 0 0 0 1px rgba(255,255,255,.18);background:rgba(255,255,255,.1);}',
            '.kyivstar-tv-card--category.focus .kyivstar-tv-card__thumb,.kyivstar-tv-card--category:focus .kyivstar-tv-card__thumb,.kyivstar-tv-card--category:hover .kyivstar-tv-card__thumb{box-shadow:none;}',
            '.kyivstar-tv-card--category .kyivstar-tv-card__fallback{background:transparent;color:rgba(255,255,255,.9);font-size:1.2em;}',
            '.kyivstar-tv-card--category .kyivstar-tv-card__meta{padding-top:.75em;}',
            '.kyivstar-tv-card--category .kyivstar-tv-card__title{min-height:1.2em;font-size:1.05em;}',
            '.kyivstar-tv__message{padding:1em 1.2em;border-radius:8px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);display:inline-block;}',
            '.kyivstar-tv__message--error{border:1px solid rgba(255,86,86,.7);color:#ffb8b8;}',
            '@media(max-width:720px){.kyivstar-tv{padding:1.1em}.kyivstar-tv-row__title{font-size:1.2em}.kyivstar-tv-row__body{gap:.75em}.kyivstar-tv-card{flex-basis:8.8em}.kyivstar-tv-card__thumb{height:13em}.kyivstar-tv-card--category{flex-basis:12em}.kyivstar-tv-card--category .kyivstar-tv-card__thumb{height:3.8em}.kyivstar-tv__grid{grid-template-columns:repeat(auto-fill,minmax(8.8em,1fr));gap:.75em}}'
        ].join('');
        document.head.appendChild(style);
    }

    boot();
})();
