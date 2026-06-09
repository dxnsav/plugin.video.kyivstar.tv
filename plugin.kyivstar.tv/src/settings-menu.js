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
