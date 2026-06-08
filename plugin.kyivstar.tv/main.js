(function () {
    'use strict';

    var PLUGIN_FLAG = '__kyivstar_tv_lampa_loaded';
    var COMPONENT = 'kyivstar_tv';
    var TITLE = 'Kyivstar TV';
    var API_BASE = 'https://clients.production.vidmind.com/vidmind-stb-ws/';
    var AUTH_REALM = '557455cfe4b04ad886a6ae41';
    var DEFAULT_LOCALE = 'uk_UA';
    var USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0';
    var REFERER = 'https://tv.kyivstar.ua/';
    var LIMIT = 40;
    var CACHE_CHANNELS_MS = 15 * 60 * 1000;
    var CACHE_CATALOG_MS = 60 * 60 * 1000;

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
        cacheKeys: 'kyivstar_cache_keys'
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

    function boot() {
        if (!window.Lampa || !window.$) {
            setTimeout(boot, 200);
            return;
        }

        if (window[PLUGIN_FLAG]) return;
        window[PLUGIN_FLAG] = true;

        ensureDeviceId();
        addStyles();
        addComponent();
        addSettings();

        if (window.appready) {
            addSideMenuEntry();
            initNotice();
        } else if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', function (event) {
                if (event.type === 'ready') {
                    addSideMenuEntry();
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

    function addSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addParam) return;

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

        addParam({ name: KEYS.username, type: 'input', default: '' }, 'Personal account', 'Used only when login type is Personal account.');
        addParam({ name: KEYS.password, type: 'input', default: '', password: true }, 'Password', 'Stored locally by Lampa.');
        addParam({ name: KEYS.phone, type: 'input', default: '' }, 'Phone number', 'Used only when login type is Phone OTP.');
        addParam({ name: KEYS.otp, type: 'input', default: '' }, 'SMS code', 'If empty, the plugin sends an SMS code and asks you to enter it here.');
        addParam({
            name: KEYS.locale,
            type: 'select',
            values: { uk_UA: 'Ukrainian', en_US: 'English', ru_RU: 'Russian' },
            default: DEFAULT_LOCALE
        }, 'Locale', 'Language sent to Kyivstar TV API.');
        addParam({ name: KEYS.proxy, type: 'input', default: '' }, 'CORS proxy', 'Optional self-hosted proxy. Use {url} as the encoded target URL placeholder.');
        addParam({ name: KEYS.appendHeaders, type: 'trigger', default: true }, 'Append stream headers', 'Adds Referer and User-Agent metadata to resolved HLS URLs.');
    }

    function addParam(param, name, description) {
        Lampa.SettingsApi.addParam({
            component: COMPONENT,
            param: param,
            field: {
                name: name,
                description: description || ''
            }
        });
    }

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
    }

    function addComponent() {
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
        if (!Lampa.Select || !Lampa.Select.show) {
            pushRoute({ type: 'root' }, TITLE);
            return;
        }

        Lampa.Select.show({
            title: TITLE,
            items: [
                { title: 'Live TV', action: 'channels' },
                { title: 'Videos', action: 'catalog' },
                { title: 'Search', action: 'search' },
                { title: 'Settings', action: 'settings' },
                { title: 'Refresh session', action: 'session' }
            ],
            onSelect: function (item) {
                if (item.action === 'channels') pushRoute({ type: 'channels' }, 'Live TV');
                else if (item.action === 'catalog') pushRoute({ type: 'catalog', offset: 0 }, 'Videos');
                else if (item.action === 'search') {
                    askText('Search Kyivstar TV', '', function (query) {
                        if (query) pushRoute({ type: 'search', query: query }, 'Search: ' + query);
                    });
                } else if (item.action === 'settings') {
                    showSettingsMenu(new KyivstarApi(), showMainMenu);
                } else if (item.action === 'session') {
                    refreshSession(new KyivstarApi());
                }
            },
            onBack: function () {
                if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle('content');
            }
        });
    }

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
                { title: 'Refresh session' + (session && session.userId ? ' (' + session.userId + ')' : ''), action: 'session' },
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
                else if (item.action === 'session') {
                    refreshSession(api).then(function () {
                        showSettingsMenu(api, onBack);
                    });
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

    function KyivstarComponent(object) {
        var self = this;
        var route = object.route || { type: 'root' };
        var api = new KyivstarApi();
        var html = $('<div class="kyivstar-tv"></div>');
        var header = $('<div class="kyivstar-tv__header"></div>');
        var heading = $('<div class="kyivstar-tv__title"></div>').text(routeTitle(route));
        var subheading = $('<div class="kyivstar-tv__subtitle"></div>');
        var body = $('<div class="kyivstar-tv__body"></div>');
        var scroll = Lampa.Scroll ? new Lampa.Scroll({ mask: true, over: true }) : null;
        var scrollBody = scroll ? scroll.render(true) : body;
        var activeItems = [];

        header.append(heading);
        header.append(subheading);
        html.append(header);
        if (scroll) {
            html.append(scrollBody);
        } else {
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
            subheading.text(text || '');
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
            if (!items || !items.length) {
                renderMessage('Nothing found');
                return;
            }

            var grid = $('<div class="kyivstar-tv__grid"></div>');
            items.forEach(function (item) {
                var card = renderCard(item);
                grid.append(card);
                activeItems.push(card);
            });

            target().append(grid);
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
            } else {
                thumb.append($('<div class="kyivstar-tv-card__fallback"></div>').text((item.title || 'K').slice(0, 2).toUpperCase()));
            }

            if (item.locked) card.addClass('kyivstar-tv-card--locked');
            meta.append(title);
            meta.append(subtitle);
            card.append(thumb);
            card.append(meta);

            card.on('hover:enter click', function () {
                activate(item);
            });
            card.on('hover:focus focus', function () {
                if (scroll) scroll.update(card);
            });

            return card;
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
                    pushRoute({ type: 'root' }, TITLE);
                });
            } else if (item.kind === 'vod' || item.kind === 'episode' || item.kind === 'channel') {
                playItem(api, item);
            }
        }

        function clearBody() {
            activeItems = [];
            target().empty();
        }

        function target() {
            return scroll ? scrollBody : body;
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

    function routeTitle(route) {
        if (route.type === 'channels') return route.groupName || 'Live TV';
        if (route.type === 'catalog') return route.compilationName || 'Videos';
        if (route.type === 'search') return 'Search';
        if (route.type === 'series-seasons') return route.title || 'Series';
        if (route.type === 'series-episodes') return route.title || 'Episodes';
        return TITLE;
    }

    async function loadRoute(route, api) {
        if (route.type === 'channels') return loadChannels(route, api);
        if (route.type === 'catalog') return loadCatalog(route, api);
        if (route.type === 'search') return loadSearch(route, api);
        if (route.type === 'series-seasons') return loadSeriesSeasons(route, api);
        if (route.type === 'series-episodes') return loadSeriesEpisodes(route, api);
        return loadRoot();
    }

    function loadRoot() {
        var session = setting(KEYS.session);
        var user = session && session.userId ? session.userId : 'not signed in';

        return Promise.resolve([
            {
                kind: 'nav',
                title: 'Live TV',
                subtitle: 'Purchased and free channels',
                route: { type: 'channels' }
            },
            {
                kind: 'nav',
                title: 'Videos',
                subtitle: 'Movies, series, shows and collections',
                route: { type: 'catalog', offset: 0 }
            },
            {
                kind: 'search',
                title: 'Search',
                subtitle: 'Search movies and series'
            },
            {
                kind: 'settings',
                title: 'Settings',
                subtitle: 'Login, locale, headers, proxy'
            },
            {
                kind: 'session',
                title: 'Refresh session',
                subtitle: 'Current account: ' + user
            },
            {
                kind: 'logout',
                title: 'Log out',
                subtitle: 'Clear local Kyivstar TV session'
            }
        ]);
    }

    async function loadChannels(route, api) {
        if (!route.groupId) {
            var groups = await api.getLiveChannelGroups();
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
        }

        var channels = await api.getGroupElements(route.groupId);
        return channels.map(mapChannel);
    }

    async function loadCatalog(route, api) {
        var offset = route.offset || 0;
        var items = [];
        var compilations = [];
        var elems = [];

        if (offset === 0 && !route.compilationId) {
            compilations = await api.getCompilations(null);
            compilations = compilations.filter(function (item) {
                return item.compilationElementType !== 'CONTENT_GROUP';
            });
        }

        elems = await api.getContentAreaElements(route.compilationId || null, route.filters || [], route.sort || null, offset, LIMIT);

        compilations.forEach(function (compilation) {
            items.push({
                kind: 'nav',
                title: compilation.displayName || compilation.name || 'Selection',
                subtitle: 'Selection',
                image: pickImage(compilation.images),
                route: {
                    type: 'catalog',
                    compilationId: compilation.id,
                    compilationName: compilation.displayName || compilation.name || 'Selection',
                    offset: 0
                }
            });
        });

        elems.forEach(function (asset) {
            items.push(mapAsset(asset));
        });

        if (elems.length === LIMIT) {
            items.push({
                kind: 'nav',
                title: 'Next',
                subtitle: 'Load more items',
                route: Object.assign({}, route, { offset: offset + elems.length })
            });
        }

        return items;
    }

    async function loadSearch(route, api) {
        var results = await api.search(route.query);
        return results.filter(function (asset) {
            return asset.assetType === 'MOVIE' || asset.assetType === 'SERIES';
        }).map(mapAsset);
    }

    async function loadSeriesSeasons(route, api) {
        var info = await api.getAssetInfo(route.assetId);
        var asset = info && info.length ? info[0] : null;
        var seasons = asset && asset.seasons ? asset.seasons : [];

        return seasons.map(function (season) {
            return {
                kind: 'nav',
                title: 'Season ' + season.number,
                subtitle: route.title || '',
                image: pickImage(asset.images) || asset.image,
                route: {
                    type: 'series-episodes',
                    assetId: route.assetId,
                    season: season.number,
                    title: (route.title || 'Series') + ': Season ' + season.number,
                    offset: 0
                }
            };
        });
    }

    async function loadSeriesEpisodes(route, api) {
        var offset = route.offset || 0;
        var episodes = await api.getTvGroup(route.assetId, route.season, offset, LIMIT);
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
                route: Object.assign({}, route, { offset: offset + episodes.length })
            });
        }

        return items;
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
            image: asset.image || pickImage(asset.images),
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
        if (!images || !images.length) return '';

        var preferred = images.find(function (image) {
            return image.url && image.url.indexOf('2_3_XL') !== -1;
        });

        return (preferred || images[0]).url || '';
    }

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

    async function refreshSession(api) {
        try {
            await api.ensureSession(true);
            notify('Kyivstar TV session refreshed.');
        } catch (error) {
            notify(error.message || String(error));
        }
    }

    async function logout(api) {
        try {
            await api.logout();
            notify('Kyivstar TV session cleared.');
        } catch (error) {
            notify(error.message || String(error));
        }
    }

    async function playItem(api, item) {
        try {
            notify('Resolving stream...');
            var stream = await api.getStreamUrl(item.assetId, item.videoType);
            var url = decorateStreamUrl(stream.url);

            Lampa.Player.play({
                title: item.title,
                url: url,
                poster: item.image || '',
                timeline: false
            });
        } catch (error) {
            notify(error.message || String(error));
        }
    }

    function decorateStreamUrl(url) {
        if (!boolSetting(KEYS.appendHeaders)) return url;
        if (url.indexOf('|') !== -1) return url;

        return url + '|User-Agent="' + encodeURIComponent(USER_AGENT) + '"&Referer="' + encodeURIComponent(REFERER) + '"';
    }

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

    KyivstarApi.prototype.request = async function (path, options) {
        var retries = options && options.retries !== undefined ? options.retries : 1;

        for (var attempt = 0; attempt <= retries; attempt++) {
            try {
                return await request(this.network, this.url(path), Object.assign({
                    headers: this.headers()
                }, options || {}));
            } catch (error) {
                if (error.status === 429 && attempt < retries) {
                    await delay(10000);
                    continue;
                }

                throw error;
            }
        }

        return null;
    };

    KyivstarApi.prototype.withSession = async function (handler, retry) {
        var session = await this.ensureSession(false);

        try {
            return await handler(session);
        } catch (error) {
            if (error.status === 401 && retry !== false) {
                session = await this.ensureSession(true);
                return handler(session);
            }

            throw error;
        }
    };

    KyivstarApi.prototype.ensureSession = async function (force) {
        var current = setting(KEYS.session);
        if (!force && current && current.sessionId && current.userId) return current;

        var loginType = setting(KEYS.loginType);
        var profile;

        if (loginType === 'account') {
            profile = await this.loginAccount();
        } else if (loginType === 'phone') {
            profile = await this.loginPhone();
        } else {
            profile = await this.loginAnonymous();
        }

        if (!profile || !profile.userId || !profile.sessionId) {
            throw new Error('Kyivstar TV login failed.');
        }

        saveSetting(KEYS.session, {
            userId: profile.userId,
            sessionId: profile.sessionId
        });

        return setting(KEYS.session);
    };

    KyivstarApi.prototype.loginAnonymous = async function () {
        return this.request('authentication/login', {
            method: 'POST',
            form: {
                username: AUTH_REALM + '\\anonymous',
                password: 'anonymous'
            }
        });
    };

    KyivstarApi.prototype.loginAccount = async function () {
        var username = setting(KEYS.username);
        var password = setting(KEYS.password);

        if (!username || !password) {
            throw new Error('Set personal account and password in Kyivstar TV settings.');
        }

        var anonymous = await this.loginAnonymous();
        return this.request('authentication/login/v3;jsessionid=' + encodeURIComponent(anonymous.sessionId), {
            method: 'POST',
            form: {
                username: AUTH_REALM + '\\' + username,
                password: password
            }
        });
    };

    KyivstarApi.prototype.loginPhone = async function () {
        var phone = setting(KEYS.phone);
        var otp = setting(KEYS.otp);
        var pending = setting(KEYS.pendingPhoneSession);

        if (!phone) {
            throw new Error('Set phone number in Kyivstar TV settings.');
        }

        if (!pending || !pending.sessionId) {
            pending = await this.loginAnonymous();
            saveSetting(KEYS.pendingPhoneSession, pending);
        }

        if (!otp) {
            await this.sendOtp(pending.sessionId, phone);
            throw new Error('SMS code sent. Enter it in Kyivstar TV settings, then refresh the session.');
        }

        var profile = await this.request('authentication/login/v3;jsessionid=' + encodeURIComponent(pending.sessionId), {
            method: 'POST',
            form: {
                username: AUTH_REALM + '\\' + phone,
                otp: otp
            }
        });

        saveSetting(KEYS.otp, '');
        saveSetting(KEYS.pendingPhoneSession, null);
        return profile;
    };

    KyivstarApi.prototype.sendOtp = function (sessionId, phone) {
        return this.request('v2/otp;jsessionid=' + encodeURIComponent(sessionId), {
            method: 'POST',
            json: {
                phoneNumber: phone,
                language: 'UK',
                channel: 'sms'
            },
            dataType: 'text'
        });
    };

    KyivstarApi.prototype.logout = async function () {
        var session = setting(KEYS.session);
        saveSetting(KEYS.session, null);
        saveSetting(KEYS.pendingPhoneSession, null);
        this.clearCache();

        if (session && session.userId && session.userId !== 'anonymous') {
            try {
                await this.request('authentication/logout;jsessionid=' + encodeURIComponent(session.sessionId) + '?sessionExpired=false', {
                    dataType: 'text'
                });
            } catch (error) {
                log('logout request failed: ' + error.message);
            }
        }
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
        return this.cached('compilations-' + (areaId || 'root'), CACHE_CATALOG_MS, function () {
            return self.withSession(function (session) {
                return self.request('compilations;jsessionid=' + encodeURIComponent(session.sessionId), {
                    method: 'POST',
                    json: {
                        contentAreaId: areaId,
                        compilationGroupType: 'CRISPS'
                    }
                });
            });
        });
    };

    KyivstarApi.prototype.getContentAreaElements = function (compilation, filters, sort, offset, limit) {
        var self = this;
        var key = ['content', compilation || 'root', (filters || []).join(','), sort || 'none', offset, limit].join('-');

        return this.cached(key, CACHE_CHANNELS_MS, function () {
            return self.withSession(function (session) {
                return self.request('gallery/filters/content-area;jsessionid=' + encodeURIComponent(session.sessionId), {
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

    KyivstarApi.prototype.cached = async function (name, ttl, loader) {
        var key = 'kyivstar_cache_' + name;
        var cached = Lampa.Storage.get(key, null);
        var now = Date.now();

        if (cached && cached.time && now - cached.time < ttl) return cached.value;

        var value = await loader();
        Lampa.Storage.set(key, { time: now, value: value });
        rememberCacheKey(key);
        return value;
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
        var headers = Object.assign({}, options.headers || {});
        var dataType = options.dataType || 'json';
        var postData = false;

        if (options.json !== undefined) {
            postData = JSON.stringify(options.json);
            headers['Content-Type'] = 'application/json';
        } else if (options.form) {
            postData = options.form;
        }

        return new Promise(function (resolve, reject) {
            var ok = function (data) {
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
                reject(normalizeRequestError(error));
            };

            if (network && (network.native || network.silent)) {
                var methodName = network.native ? 'native' : 'silent';
                network.timeout(20000);
                network[methodName](url, ok, fail, postData, {
                    type: method,
                    headers: headers,
                    dataType: dataType,
                    timeout: 20000
                });
                return;
            }

            fetchRequest(url, method, headers, postData, dataType).then(ok).catch(fail);
        });
    }

    async function fetchRequest(url, method, headers, postData, dataType) {
        var body = null;

        if (postData && typeof postData === 'object') {
            body = new URLSearchParams(postData).toString();
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        } else if (postData) {
            body = postData;
        }

        var response = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });

        if (!response.ok) {
            var error = new Error('HTTP ' + response.status);
            error.status = response.status;
            try {
                error.body = await response.json();
            } catch (jsonError) {
                error.body = await response.text();
            }
            throw error;
        }

        if (dataType === 'text') return response.text();
        return response.json();
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

    function iconSvg() {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2"/>' +
            '<path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M9 9l5 3-5 3V9z" fill="currentColor"/>' +
            '</svg>';
    }

    function addStyles() {
        if (document.getElementById('kyivstar-tv-styles')) return;

        var style = document.createElement('style');
        style.id = 'kyivstar-tv-styles';
        style.textContent = [
            '.kyivstar-tv{padding:2.2em 3em 3em;color:#fff;min-height:100%;box-sizing:border-box;}',
            '.kyivstar-tv__header{display:flex;align-items:flex-end;gap:1em;margin-bottom:1.4em;}',
            '.kyivstar-tv__title{font-size:2.2em;font-weight:700;line-height:1.05;}',
            '.kyivstar-tv__subtitle{font-size:1em;color:rgba(255,255,255,.62);padding-bottom:.2em;}',
            '.kyivstar-tv__body{min-height:20em;}',
            '.kyivstar-tv__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(11.5em,1fr));gap:1em;align-items:stretch;}',
            '.kyivstar-tv-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;overflow:hidden;min-height:17em;outline:0;transition:transform .12s ease,border-color .12s ease,background .12s ease;}',
            '.kyivstar-tv-card.focus,.kyivstar-tv-card:focus,.kyivstar-tv-card:hover{transform:translateY(-2px);border-color:#ffd33d;background:rgba(255,255,255,.14);}',
            '.kyivstar-tv-card--locked{opacity:.55;}',
            '.kyivstar-tv-card__thumb{height:12.5em;background:#101820;display:flex;align-items:center;justify-content:center;overflow:hidden;}',
            '.kyivstar-tv-card__thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
            '.kyivstar-tv-card__fallback{width:4em;height:4em;border-radius:8px;background:#ffd33d;color:#101820;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.3em;}',
            '.kyivstar-tv-card__meta{padding:.8em .85em 1em;}',
            '.kyivstar-tv-card__title{font-size:1em;font-weight:700;line-height:1.2;min-height:2.4em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}',
            '.kyivstar-tv-card__subtitle{font-size:.82em;color:rgba(255,255,255,.62);line-height:1.25;margin-top:.35em;min-height:2.1em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}',
            '.kyivstar-tv__message{padding:1em 1.2em;border-radius:8px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);display:inline-block;}',
            '.kyivstar-tv__message--error{border:1px solid rgba(255,86,86,.7);color:#ffb8b8;}',
            '@media(max-width:720px){.kyivstar-tv{padding:1.2em}.kyivstar-tv__header{display:block}.kyivstar-tv__title{font-size:1.6em}.kyivstar-tv__grid{grid-template-columns:repeat(auto-fill,minmax(9.5em,1fr));gap:.75em}.kyivstar-tv-card{min-height:14.5em}.kyivstar-tv-card__thumb{height:10em}}'
        ].join('');
        document.head.appendChild(style);
    }

    boot();
})();
