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
