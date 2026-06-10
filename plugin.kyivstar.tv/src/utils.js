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

    function objectValues(object) {
        var values = [];

        object = object || {};
        for (var key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) values.push(object[key]);
        }

        return values;
    }

    function arrayFromAny(value) {
        if (!value) return [];
        if (Object.prototype.toString.call(value) === '[object Array]') return value;
        if (value.items) return asArray(value.items);
        if (value.elements) return asArray(value.elements);
        if (value.values) return asArray(value.values);
        if (value.options) return asArray(value.options);
        return asArray(value);
    }

    function normalizeProductionCountries(raw) {
        var countries = raw && (raw.production_countries || raw.productionCountries || raw.countryOrigin || raw.countries || raw.country);
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

    function normalizeGenres(raw) {
        var genres = raw && (raw.genres || raw.genre || raw.categories || raw.category);
        var list = [];
        var used = {};

        if (!genres) return list;

        if (typeof genres === 'string') {
            genres = genres.split(/[,/|]/);
        } else {
            genres = arrayFromAny(genres);
        }

        genres.forEach(function (genre) {
            var name;
            var id;

            if (!genre) return;

            if (typeof genre === 'string') {
                name = genre.trim();
            } else {
                name = genre.locale || genre.name || genre.title || genre.displayName || genre.value || '';
                id = genre.id || genre.genreId || genre.assetId || '';
            }

            if (!name || used[name]) return;
            used[name] = true;

            list.push({
                id: id || name,
                name: name
            });
        });

        return list;
    }

    function normalizeCrewList(items, role) {
        return arrayFromAny(items).map(function (person, index) {
            var name;
            var image;
            var id;

            if (!person) return null;

            if (typeof person === 'string') {
                name = person;
                image = '';
                id = person;
            } else {
                name = person.name || person.title || person.displayName || '';
                image = person.profile_path || person.image || pickImage(person.images) || '';
                id = person.id || person.assetId || person.slug || name || index;
            }

            if (!name) return null;

            return {
                id: id,
                name: name,
                original_name: name,
                profile_path: image,
                img: image,
                image: image,
                character: role === 'cast' && person && person.character ? person.character : '',
                job: role === 'director' ? 'Director' : (person && person.job ? person.job : ''),
                known_for_department: role === 'director' ? 'Directing' : 'Acting',
                department: role === 'director' ? 'Directing' : 'Acting',
                order: index
            };
        }).filter(Boolean);
    }

    function normalizeKeywords(raw) {
        var tags = arrayFromAny(raw && (raw.keywords || raw.tags));

        return tags.map(function (tag, index) {
            var name;
            var id;

            if (!tag) return null;

            if (typeof tag === 'string') {
                name = tag;
                id = tag;
            } else {
                name = tag.name || tag.title || tag.displayName || tag.value || '';
                id = tag.id || tag.keywordId || tag.assetId || name || index;
            }

            if (!name) return null;

            return {
                id: id,
                name: name
            };
        }).filter(Boolean);
    }

    function normalizeSeasons(seasons) {
        return arrayFromAny(seasons).map(function (season, index) {
            var number = seasonNumber(season);
            var episodes = seasonEpisodeCount(season);
            var normalized = {
                id: season && (season.id || season.assetId) || number || index + 1,
                name: season && (season.name || season.title) || (t('season_prefix') + number),
                season_number: number,
                air_date: firstApiDate([
                    season && season.airDate,
                    season && season.air_date,
                    season && season.airingStartDate,
                    season && season.startDate,
                    season && season.releaseDate,
                    season && season.release_date
                ]),
                poster_path: season && (season.poster_path || season.image || pickImage(season.images)) || ''
            };

            if (episodes) normalized.episode_count = episodes;

            return normalized;
        });
    }

    function countSeasonEpisodes(seasons) {
        var total = 0;

        asArray(seasons).forEach(function (season) {
            total += Number(season && season.episode_count) || 0;
        });

        return total;
    }

    function seasonEpisodeCount(season) {
        var episodes;

        if (!season) return 0;

        if (Object.prototype.toString.call(season.episodes) === '[object Array]') {
            return season.episodes.length;
        }

        episodes = firstNumber([
            season.numberOfEpisodes,
            season.episodeCount,
            season.episodesCount,
            season.episodes_count,
            season.totalEpisodes,
            season.totalEpisodeCount,
            season.assetsCount,
            season.itemsCount,
            season.size
        ]);

        return episodes || 0;
    }

    function firstApiDate(values) {
        var date;

        for (var i = 0; i < values.length; i++) {
            date = normalizeApiDate(values[i]);
            if (date) return date;
        }

        return '';
    }

    function normalizeApiDate(value) {
        var text;
        var number;
        var date;

        if (value === null || value === undefined || value === '') return '';

        if (typeof value === 'number') {
            number = value;
        } else {
            text = String(value);
            if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
            if (/^\d{4}$/.test(text)) return text + '-01-01';
            if (/^\d+$/.test(text)) number = Number(text);
            else {
                date = new Date(text);
                return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
            }
        }

        if (!number || number < 1) return '';
        if (number < 10000000000) number *= 1000;

        date = new Date(number);
        return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
    }

    function assetEpisodeCount(raw, seasons) {
        var counted = countSeasonEpisodes(seasons);
        var direct = firstNumber([
            raw && raw.numberOfEpisodes,
            raw && raw.episodeCount,
            raw && raw.episodesCount,
            raw && raw.episodes_count,
            raw && raw.totalEpisodes,
            raw && raw.totalEpisodeCount,
            raw && raw.assetsCount,
            raw && raw.itemsCount
        ]);

        return counted || direct || null;
    }

    function assetSeasonCount(raw, seasons) {
        return firstNumber([
            raw && raw.activeSeasonsCount,
            raw && raw.numberOfSeasons,
            raw && raw.seasonsCount,
            raw && raw.seasonCount,
            raw && raw.totalSeasons
        ]) || asArray(seasons).length;
    }

    function firstNumber(values) {
        var number;

        for (var i = 0; i < values.length; i++) {
            number = Number(values[i]);
            if (number > 0) return number;
        }

        return 0;
    }

    function normalizeRating(raw) {
        var ratings = arrayFromAny(raw && raw.ratings);
        var rating = ratings[0] || {};
        var value = parseFloat(rating.movieRating || rating.rating || raw.vote_average || raw.rating || 0);

        if (isNaN(value)) value = 0;

        return {
            value: value,
            provider: rating.ratingProviderType || rating.provider || rating.source || '',
            votes: Number(rating.numberOfVotes || rating.vote_count || rating.votes || 0) || 0,
            movieId: rating.movieId || rating.id || ''
        };
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

    function brandIconHtml() {
        return '<img src="' + ASSET_BASE + 'favicon.ico" alt="' + TITLE + '" style="width:1.35em;height:1.35em;object-fit:contain;display:block;">';
    }

    function brandLogoHtml() {
        return '<img class="kyivstar-logo-light" src="' + ASSET_BASE + 'logo-ua.svg" alt="' + TITLE + '" style="width:120px;height:21px;object-fit:contain;">';
    }

    function brandLogoDarkHtml() {
        return '<img class="kyivstar-logo-dark" src="' + ASSET_BASE + 'logo-ua-black.svg" alt="' + TITLE + '" style="width:120px;height:21px;object-fit:contain;">';
    }

    function iconSvg() {
        return brandIconHtml() || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2"/>' +
            '<path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M9 9l5 3-5 3V9z" fill="currentColor"/>' +
            '</svg>';
    }
