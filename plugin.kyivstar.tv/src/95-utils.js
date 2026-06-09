    function normalizePhone(value) {
        var digits = String(value || '').replace(/\D/g, '');

        if (digits.length === 10 && digits.charAt(0) === '0') {
            digits = '38' + digits;
        }

        return digits;
    }

    function maskPhone(value) {
        var digits = normalizePhone(value);
        if (!digits) return '';
        if (digits.length <= 6) return digits.replace(/\d/g, '*');
        return digits.substr(0, 5) + '***' + digits.substr(digits.length - 2);
    }

    function sanitizeUrl(url) {
        return String(url || '')
            .replace(/jsessionid=[^?&]+/g, 'jsessionid=***')
            .replace(/([?&]otp=)[^&]+/g, '$1***')
            .replace(/([?&]pin=)[^&]+/g, '$1***');
    }

    function sanitize(value) {
        var result;
        var key;

        if (value === null || value === undefined) return value;
        if (typeof value === 'string') return sanitizeString(value);
        if (typeof value === 'number' || typeof value === 'boolean') return value;

        if (Object.prototype.toString.call(value) === '[object Array]') {
            result = [];
            for (var i = 0; i < value.length; i++) result.push(sanitize(value[i]));
            return result;
        }

        if (typeof value === 'object') {
            result = {};
            for (key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    if (/password|otp|token|pin/i.test(key) || /sessionId|jsessionid|pendingPhoneSession|^session$/i.test(key)) result[key] = '***';
                    else if (/phone/i.test(key)) result[key] = maskPhone(value[key]);
                    else if (/url/i.test(key)) result[key] = sanitizeUrl(value[key]);
                    else result[key] = sanitize(value[key]);
                }
            }
            return result;
        }

        return String(value);
    }

    function sanitizeString(value) {
        return String(value)
            .replace(/jsessionid=[^?&\s]+/g, 'jsessionid=***')
            .replace(/557455cfe4b04ad886a6ae41\\[0-9+]+/g, AUTH_REALM + '\\' + '***');
    }

    function summarizeBody(body) {
        if (!body) return 'none';

        if (typeof body === 'string') {
            try {
                return sanitize(JSON.parse(body));
            } catch (error) {
                return sanitizeString(body).substr(0, 240);
            }
        }

        return sanitize(body);
    }

    function summarizeData(data) {
        var summary = {};
        var keys = [];
        var key;

        if (data === '' || data === null || data === undefined) return 'empty';
        if (typeof data === 'string') return sanitizeString(data).substr(0, 240);
        if (typeof data !== 'object') return data;

        for (key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) keys.push(key);
        }

        summary.type = Object.prototype.toString.call(data).replace('[object ', '').replace(']', '');
        summary.keys = keys.slice(0, 12);
        if (data.userId) summary.userId = data.userId;
        if (data.error) summary.error = data.error;
        if (data.description) summary.description = data.description;
        if (typeof data.length === 'number') summary.length = data.length;

        return sanitize(summary);
    }

    function safeJson(value) {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return String(value);
        }
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

    function merge(target, source) {
        target = target || {};
        source = source || {};

        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }

        return target;
    }

    function copyRoute(route, patch) {
        return merge(merge({}, route), patch);
    }

    function normalizeProductionCountries(raw) {
        var countries = raw && (raw.production_countries || raw.productionCountries || raw.countries || raw.country);
        var list = [];

        if (!countries) return list;

        if (Object.prototype.toString.call(countries) !== '[object Array]') {
            countries = String(countries).split(/[,/|]/);
        }

        countries.forEach(function (country) {
            var code;
            var name;

            if (!country) return;

            if (typeof country === 'string') {
                name = country.trim();
                code = name.length === 2 ? name.toUpperCase() : '';
            } else {
                code = country.iso_3166_1 || country.code || country.iso || '';
                name = country.name || country.title || country.displayName || code;
            }

            if (name || code) {
                list.push({
                    iso_3166_1: code || name,
                    name: name || code
                });
            }
        });

        return list;
    }

    function encodeForm(data) {
        var parts = [];

        for (var key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
        }

        return parts.join('&');
    }

    function iconSvg() {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2"/>' +
            '<path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M9 9l5 3-5 3V9z" fill="currentColor"/>' +
            '</svg>';
    }
