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
