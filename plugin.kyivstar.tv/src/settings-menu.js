    function showSettingsMenu(api, onBack) {
        var session = setting(KEYS.session);

        if (!Lampa.Select || !Lampa.Select.show) {
            notify(t({ uk: 'Lampa Select API недоступний.', ru: 'Lampa Select API недоступен.', en: 'Lampa Select API is not available.' }));
            return;
        }

        Lampa.Select.show({
            title: TITLE + ' ' + t({ uk: 'налаштування', ru: 'настройки', en: 'settings' }),
            items: [
                { title: textLoginType() + ': ' + loginTypeTitle(setting(KEYS.loginType)), action: 'login-type' },
                { title: t({ uk: 'Мова', ru: 'Язык', en: 'Locale' }) + ': ' + localeTitle(setting(KEYS.locale)), action: 'locale' },
                { title: t({ uk: 'Додавати stream headers', ru: 'Добавлять stream headers', en: 'Append stream headers' }) + ': ' + yesNo(boolSetting(KEYS.appendHeaders)), action: 'headers' },
                { title: t({ uk: 'Особовий рахунок', ru: 'Лицевой счет', en: 'Personal account' }) + ': ' + filled(setting(KEYS.username)), action: 'username' },
                { title: t({ uk: 'Пароль', ru: 'Пароль', en: 'Password' }) + ': ' + filled(setting(KEYS.password)), action: 'password' },
                { title: t({ uk: 'Номер телефону', ru: 'Номер телефона', en: 'Phone number' }) + ': ' + filled(setting(KEYS.phone)), action: 'phone' },
                { title: t({ uk: 'SMS-код', ru: 'SMS-код', en: 'SMS code' }) + ': ' + filled(setting(KEYS.otp)), action: 'otp' },
                { title: 'CORS proxy: ' + filled(setting(KEYS.proxy)), action: 'proxy' },
                { title: t({ uk: 'Надіслати SMS-код', ru: 'Отправить SMS-код', en: 'Send SMS code now' }), action: 'send-otp' },
                { title: textRefreshSession() + (session && session.userId ? ' (' + session.userId + ')' : ''), action: 'session' },
                { title: t({ uk: 'Діагностика / логи', ru: 'Диагностика / логи', en: 'Diagnostics / logs' }), action: 'diagnostics' },
                { title: t({ uk: 'Очистити стан телефонного OTP', ru: 'Очистить состояние телефонного OTP', en: 'Clear phone OTP state' }), action: 'clear-phone' },
                { title: t({ uk: 'Вийти / очистити сесію', ru: 'Выйти / очистить сессию', en: 'Log out / clear session' }), action: 'logout' }
            ],
            onSelect: function (item) {
                if (item.action === 'login-type') selectLoginType(api, onBack);
                else if (item.action === 'locale') selectLocale(api, onBack);
                else if (item.action === 'headers') {
                    saveSetting(KEYS.appendHeaders, !boolSetting(KEYS.appendHeaders));
                    showSettingsMenu(api, onBack);
                } else if (item.action === 'username') editStoredValue(t({ uk: 'Особовий рахунок', ru: 'Лицевой счет', en: 'Personal account' }), KEYS.username, api, onBack);
                else if (item.action === 'password') editStoredValue(t({ uk: 'Пароль', ru: 'Пароль', en: 'Password' }), KEYS.password, api, onBack);
                else if (item.action === 'phone') editStoredValue(t({ uk: 'Номер телефону', ru: 'Номер телефона', en: 'Phone number' }), KEYS.phone, api, onBack);
                else if (item.action === 'otp') editStoredValue(t({ uk: 'SMS-код', ru: 'SMS-код', en: 'SMS code' }), KEYS.otp, api, onBack);
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
        selectStoredValue(t({ uk: 'Мова', ru: 'Язык', en: 'Locale' }), KEYS.locale, [
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
            notify(t({ uk: 'Спочатку вкажіть номер телефону.', ru: 'Сначала укажите номер телефона.', en: 'Set phone number first.' }));
            debugLog('error', 'otp:manual:no-phone', {});
            return Promise.resolve();
        }

        notify(t({ uk: 'Надсилаю SMS-код...', ru: 'Отправляю SMS-код...', en: 'Sending SMS code...' }));

        return api.ensurePhonePendingSession().then(function (phoneSession) {
            return api.sendOtp(phoneSession.sessionId, phone);
        }).then(function () {
            notify(t({ uk: 'SMS-код запитано. Перевірте телефон.', ru: 'SMS-код запрошен. Проверьте телефон.', en: 'SMS code request sent. Check your phone.' }));
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
            { title: t({ uk: 'Вивести логи в консоль', ru: 'Вывести логи в консоль', en: 'Print logs to console' }) + ' (' + logs.length + ')', action: 'print' },
            { title: t({ uk: 'Очистити логи', ru: 'Очистить логи', en: 'Clear logs' }), action: 'clear' }
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
            title: TITLE + ' ' + t({ uk: 'діагностика', ru: 'диагностика', en: 'diagnostics' }),
            items: items,
            onSelect: function (item) {
                if (item.action === 'print') {
                    printDebugLogs();
                    notify(t({ uk: 'Логи Kyivstar TV виведено в консоль.', ru: 'Логи Kyivstar TV выведены в консоль.', en: 'Kyivstar TV logs printed to console.' }));
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
        if (value === 'account') return t({ uk: 'Особовий рахунок', ru: 'Лицевой счет', en: 'Personal account' });
        if (value === 'phone') return t({ uk: 'Телефонний OTP', ru: 'Телефонный OTP', en: 'Phone OTP' });
        return t({ uk: 'Anonymous', ru: 'Anonymous', en: 'Anonymous' });
    }

    function localeTitle(value) {
        if (value === 'en_US') return t({ uk: 'Англійська', ru: 'Английский', en: 'English' });
        if (value === 'ru_RU') return t({ uk: 'Російська', ru: 'Русский', en: 'Russian' });
        return t({ uk: 'Українська', ru: 'Украинский', en: 'Ukrainian' });
    }

    function filled(value) {
        return value ? t({ uk: 'заповнено', ru: 'заполнено', en: 'set' }) : t({ uk: 'порожньо', ru: 'пусто', en: 'empty' });
    }

    function yesNo(value) {
        return value ? t({ uk: 'Так', ru: 'Да', en: 'On' }) : t({ uk: 'Ні', ru: 'Нет', en: 'Off' });
    }

    function textLoginType() {
        return t({ uk: 'Тип входу', ru: 'Тип входа', en: 'Login type' });
    }

    function textRefreshSession() {
        return t({ uk: 'Оновити сесію', ru: 'Обновить сессию', en: 'Refresh session' });
    }
