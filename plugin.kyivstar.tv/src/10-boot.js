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
