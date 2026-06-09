    function t(key, params) {
        var lang = lampaLanguage();
        var value = I18N[lang] && I18N[lang][key] ? I18N[lang][key] : '';

        if (!value && I18N.uk && I18N.uk[key]) value = I18N.uk[key];
        if (!value && I18N.en && I18N.en[key]) value = I18N.en[key];
        if (!value) value = key;

        params = params || {};
        return String(value).replace(/\{([^}]+)\}/g, function (match, name) {
            return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : match;
        });
    }

    function lampaLanguage() {
        var lang = '';
        var candidates = [
            safeStorage('language'),
            safeStorage('lang'),
            safeStorage('language_app'),
            safeStorage('interface_language'),
            Lampa.Lang && (Lampa.Lang.lang || Lampa.Lang.code || Lampa.Lang.language),
            setting(KEYS.locale)
        ];

        for (var i = 0; i < candidates.length; i++) {
            lang = normalizeLanguage(candidates[i]);
            if (lang) return lang;
        }

        return 'uk';
    }

    function safeStorage(key) {
        try {
            return Lampa.Storage ? Lampa.Storage.get(key, '') : '';
        } catch (error) {
            return '';
        }
    }

    function normalizeLanguage(value) {
        value = String(value || '').toLowerCase();
        if (!value) return '';
        if (value.indexOf('uk') === 0 || value.indexOf('ua') === 0) return 'uk';
        if (value.indexOf('ru') === 0) return 'ru';
        if (value.indexOf('en') === 0) return 'en';
        return '';
    }
