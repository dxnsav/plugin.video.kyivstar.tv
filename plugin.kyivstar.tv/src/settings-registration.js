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
            }, textLoginType(), t({
                uk: 'Anonymous відкриває безкоштовні канали. Особовий рахунок і телефонний OTP потребують активного акаунта Kyivstar TV.',
                ru: 'Anonymous открывает бесплатные каналы. Лицевой счет и телефонный OTP требуют активный аккаунт Kyivstar TV.',
                en: 'Anonymous supports free channels. Personal account and phone OTP require an active Kyivstar TV account.'
            }));

            addParam({ name: KEYS.username, type: 'input', default: '' }, t({ uk: 'Особовий рахунок', ru: 'Лицевой счет', en: 'Personal account' }), t({ uk: 'Використовується тільки для входу через особовий рахунок.', ru: 'Используется только для входа через лицевой счет.', en: 'Used only when login type is Personal account.' }), clearSession);
            addParam({ name: KEYS.password, type: 'input', default: '', password: true }, t({ uk: 'Пароль', ru: 'Пароль', en: 'Password' }), t({ uk: 'Зберігається локально в Lampa.', ru: 'Хранится локально в Lampa.', en: 'Stored locally by Lampa.' }), clearSession);
            addParam({ name: KEYS.phone, type: 'input', default: '' }, t({ uk: 'Номер телефону', ru: 'Номер телефона', en: 'Phone number' }), t({ uk: 'Використовується тільки для входу через телефонний OTP.', ru: 'Используется только для входа через телефонный OTP.', en: 'Used only when login type is Phone OTP.' }), clearSession);
            addParam({ name: KEYS.otp, type: 'input', default: '' }, t({ uk: 'SMS-код', ru: 'SMS-код', en: 'SMS code' }), t({ uk: 'Введіть SMS-код тут, потім натисніть «Оновити сесію».', ru: 'Введите SMS-код здесь, затем нажмите «Обновить сессию».', en: 'Enter the SMS code here, then use Refresh session.' }));
            addParam({
                name: KEYS.locale,
                type: 'select',
                values: { uk_UA: t({ uk: 'Українська', ru: 'Украинский', en: 'Ukrainian' }), en_US: t({ uk: 'Англійська', ru: 'Английский', en: 'English' }), ru_RU: t({ uk: 'Російська', ru: 'Русский', en: 'Russian' }) },
                default: DEFAULT_LOCALE
            }, t({ uk: 'Мова', ru: 'Язык', en: 'Locale' }), t({ uk: 'Мова, яку плагін передає в Kyivstar TV API.', ru: 'Язык, который плагин передает в Kyivstar TV API.', en: 'Language sent to Kyivstar TV API.' }), clearSession);
            addParam({ name: KEYS.proxy, type: 'input', default: '' }, 'CORS proxy', t({ uk: 'Опційний власний proxy. Використовуйте {url} як placeholder для закодованого URL.', ru: 'Опциональный свой proxy. Используйте {url} как placeholder для закодированного URL.', en: 'Optional self-hosted proxy. Use {url} as the encoded target URL placeholder.' }));
            addParam({ name: KEYS.appendHeaders, type: 'trigger', default: true }, t({ uk: 'Додавати stream headers', ru: 'Добавлять stream headers', en: 'Append stream headers' }), t({ uk: 'Додає Referer і User-Agent до HLS URL.', ru: 'Добавляет Referer и User-Agent к HLS URL.', en: 'Adds Referer and User-Agent metadata to resolved HLS URLs.' }));
            addParam({ name: 'kyivstar_send_sms', type: 'button' }, t({ uk: 'Надіслати SMS-код', ru: 'Отправить SMS-код', en: 'Send SMS code now' }), t({ uk: 'Запитує телефонний OTP для збереженого номера.', ru: 'Запрашивает телефонный OTP для сохраненного номера.', en: 'Requests a phone OTP for the saved phone number.' }), function () {
                sendSmsCode(new KyivstarApi());
            });
            addParam({ name: 'kyivstar_refresh_session', type: 'button' }, textRefreshSession(), t({ uk: 'Повторний вхід з обраним типом логіну.', ru: 'Повторный вход с выбранным типом логина.', en: 'Re-login with the selected login type.' }), function () {
                refreshSession(new KyivstarApi());
            });
            addParam({ name: 'kyivstar_diagnostics', type: 'button' }, t({ uk: 'Діагностика / логи', ru: 'Диагностика / логи', en: 'Diagnostics / logs' }), t({ uk: 'Відкрити логи запитів Kyivstar TV.', ru: 'Открыть логи запросов Kyivstar TV.', en: 'Open Kyivstar TV request logs.' }), function () {
                showDiagnosticsMenu(settingsBack);
            });
            addParam({ name: 'kyivstar_clear_phone', type: 'button' }, t({ uk: 'Очистити стан телефонного OTP', ru: 'Очистить состояние телефонного OTP', en: 'Clear phone OTP state' }), t({ uk: 'Очищає pending anonymous phone session і SMS-код.', ru: 'Очищает pending anonymous phone session и SMS-код.', en: 'Clears pending anonymous phone session and SMS code.' }), function () {
                saveSetting(KEYS.pendingPhoneSession, null);
                saveSetting(KEYS.otp, '');
                debugLog('info', 'auth:phone:state-cleared', {});
                notify(t({ uk: 'Стан телефонного OTP очищено.', ru: 'Состояние телефонного OTP очищено.', en: 'Kyivstar TV phone OTP state cleared.' }));
            });
            addParam({ name: 'kyivstar_logout', type: 'button' }, t({ uk: 'Вийти / очистити сесію', ru: 'Выйти / очистить сессию', en: 'Log out / clear session' }), t({ uk: 'Очищає локальну сесію Kyivstar TV і cache.', ru: 'Очищает локальную сессию Kyivstar TV и cache.', en: 'Clears local Kyivstar TV session and cache.' }), function () {
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
