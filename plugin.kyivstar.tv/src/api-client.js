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

    KyivstarApi.prototype.getContentAreas = function () {
        var self = this;
        return this.cached('contentareas-my-tv-web-v1', CACHE_CATALOG_MS, function () {
            return self.withSession(function (session) {
                return self.request('api/v2/contentareas/MY_TV_WEB;jsessionid=' + encodeURIComponent(session.sessionId) + '?includeRestricted=true');
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

    KyivstarApi.prototype.getContentGroupLegacyElements = function (groupId, offset, limit) {
        var self = this;
        var key = ['content-group-legacy-v1', groupId || 'none', offset || 0, limit || LIMIT].join('-');

        return this.cached(key, CACHE_CHANNELS_MS, function () {
            return self.withSession(function (session) {
                return self.request('gallery/contentgroups/' + encodeURIComponent(groupId) +
                    ';jsessionid=' + encodeURIComponent(session.sessionId) +
                    '?offset=' + encodeURIComponent(offset || 0) +
                    '&limit=' + encodeURIComponent(limit || LIMIT));
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
