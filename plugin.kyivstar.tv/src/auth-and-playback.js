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
