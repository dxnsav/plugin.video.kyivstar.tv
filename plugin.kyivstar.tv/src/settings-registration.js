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
