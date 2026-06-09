    function routeTitle(route) {
        if (route.type === 'channels') return route.groupName || 'Live TV';
        if (route.type === 'catalog') return route.compilationName || 'Videos';
        if (route.type === 'search') return route.query ? 'Search: ' + route.query : 'Search';
        if (route.type === 'series-seasons') return route.title || 'Series';
        if (route.type === 'series-episodes') return route.title || 'Episodes';
        return TITLE;
    }

    function loadRoute(route, api) {
        if (route.type === 'home' || route.type === 'root') return loadHome(api);
        if (route.type === 'channels') return loadChannels(route, api);
        if (route.type === 'catalog') return loadCatalog(route, api);
        if (route.type === 'search') return loadSearch(route, api);
        if (route.type === 'series-seasons') return loadSeriesSeasons(route, api);
        if (route.type === 'series-episodes') return loadSeriesEpisodes(route, api);
        return loadHome(api);
    }

    function loadHome(api) {
        return Promise.all([
            api.getContentAreas().catch(function (error) {
                debugLog('warn', 'home:contentareas:error', { error: error.message || String(error) });
                return [];
            }),
            api.getContentAreaElements(null, [], null, 0, LIMIT).catch(function (error) {
                debugLog('warn', 'home:videos:error', { error: error.message || String(error) });
                return [];
            })
        ]).then(function (data) {
            var areas = sortHomeAreas(asArray(data[0]));
            var videos = data[1] || [];
            var categories = [{
                kind: 'nav',
                title: 'Live TV',
                subtitle: 'Channels',
                image: '',
                route: { type: 'channels' }
            }];
            var rows = [];

            areas.forEach(function (area) {
                var item = mapHomeArea(area);

                if (item) categories.push(item);
            });

            if (categories.length) rows.push({ title: 'Categories', items: categories });
            if (videos.length) {
                rows.push({
                    title: 'Videos',
                    items: videos.slice(0, HOME_LIMIT).map(mapAsset).concat(videos.length > HOME_LIMIT ? [{
                        kind: 'nav',
                        title: 'More',
                        subtitle: 'Open videos',
                        route: { type: 'catalog', offset: 0 }
                    }] : [])
                });
            }

            return { rows: rows };
        });
    }

    function loadChannels(route, api) {
        if (!route.groupId) {
            return api.getLiveChannelGroups().then(function (groups) {
                return groups.map(function (group) {
                    return {
                        kind: 'nav',
                        title: group.name || group.displayName || 'Channels',
                        subtitle: group.type || '',
                        image: pickImage(group.images),
                        route: {
                            type: 'channels',
                            groupId: group.assetId,
                            groupName: group.name || group.displayName || 'Channels'
                        }
                    };
                });
            });
        }

        return api.getGroupElements(route.groupId).then(function (channels) {
            return channels.map(mapChannel);
        });
    }

    function loadCatalog(route, api) {
        var offset = route.offset || 0;

        return loadCatalogPage(route, api, offset, LIMIT).then(function (elems) {
            elems = asArray(elems);

            var items = offset ? [] : [filterMenuItem(route)];

            elems.forEach(function (asset) {
                items.push(mapAsset(asset));
            });

            if (elems.length === LIMIT) {
                items.push({
                    kind: 'nav',
                    title: 'Next',
                    subtitle: 'Load more items',
                    route: copyRoute(route, { offset: offset + elems.length })
                });
            }

            return items;
        });
    }

    function loadCatalogPage(route, api, offset, limit) {
        if (route.groupId) {
            if (!(route.filters && route.filters.length) && !route.sort) {
                return api.getContentGroupLegacyElements(route.groupId, offset, limit);
            }

            return api.getContentGroupElements(route.groupId, route.filters || [], route.sort || null, offset, limit).catch(function (error) {
                debugLog('warn', 'catalog:content-group-filtered:error', {
                    groupId: route.groupId,
                    offset: offset || 0,
                    limit: limit || LIMIT,
                    error: error.message || String(error),
                    status: error.status || error.decode_code || ''
                });

                return api.getContentGroupLegacyElements(route.groupId, offset, limit);
            });
        }

        return api.getContentAreaElements(route.compilationId || null, route.filters || [], route.sort || null, offset, limit);
    }

    function sortHomeAreas(areas) {
        return asArray(areas).filter(function (area) {
            return area && area.active !== false && area.assetId;
        }).sort(function (left, right) {
            var a = typeof left.contentAreaLocation === 'number' ? left.contentAreaLocation : 9999;
            var b = typeof right.contentAreaLocation === 'number' ? right.contentAreaLocation : 9999;
            return a - b;
        });
    }

    function mapHomeArea(area) {
        var title = textValue(area.name) || textValue(area.title) || textValue(area.displayName) || 'Selection';
        var subtitle = textValue(area.type) || textValue(area.entityType) || 'Videos';

        return {
            kind: 'nav',
            title: title,
            subtitle: subtitle,
            image: pickImage(area.images),
            route: {
                type: 'catalog',
                compilationId: null,
                groupId: area.assetId,
                compilationName: title,
                offset: 0
            }
        };
    }

    function textValue(value) {
        return typeof value === 'string' && value ? value : '';
    }

    function filterMenuItem(route) {
        return {
            kind: 'filter',
            title: 'Фільтр',
            subtitle: activeFilterSummary(route),
            image: '',
            icon: iconSvg(),
            route: route
        };
    }

    function loadSearch(route, api) {
        return api.search(route.query).then(function (results) {
            var items = [];

            results.forEach(function (asset) {
                var item = mapSearchResult(asset);
                if (item) items.push(item);
            });

            return items;
        });
    }

    function loadSeriesSeasons(route, api) {
        return api.getAssetInfo(route.assetId).then(function (info) {
            var asset = info && info.length ? info[0] : null;
            var seasons = asset && asset.seasons ? asset.seasons : [];

            if (!seasons.length) {
                return [{
                    kind: 'nav',
                    title: t('season_prefix') + '1',
                    subtitle: route.title || '',
                    image: asset ? (pickImage(asset.images) || asset.image) : '',
                    route: {
                        type: 'series-episodes',
                        assetId: route.assetId,
                        season: 1,
                        title: (route.title || t('episodes')) + ': ' + t('season_prefix') + '1',
                        offset: 0
                    }
                }];
            }

            return seasons.map(function (season) {
                var number = seasonNumber(season);
                return {
                    kind: 'nav',
                    title: t('season_prefix') + number,
                    subtitle: route.title || '',
                    image: asset ? (pickImage(asset.images) || asset.image) : '',
                    route: {
                        type: 'series-episodes',
                        assetId: route.assetId,
                        season: number,
                        title: (route.title || t('episodes')) + ': ' + t('season_prefix') + number,
                        offset: 0
                    }
                };
            });
        });
    }

    function loadSeriesEpisodes(route, api) {
        var offset = route.offset || 0;

        return api.getTvGroup(route.assetId, route.season, offset, LIMIT).then(function (episodes) {
            var items = episodes.map(function (episode) {
                var mapped = mapAsset(episode);
                mapped.kind = 'episode';
                return mapped;
            });

            if (episodes.length === LIMIT && !route.native) {
                items.push({
                    kind: 'nav',
                    title: t('next_page'),
                    subtitle: t('episodes'),
                    route: copyRoute(route, { offset: offset + episodes.length })
                });
            }

            return items;
        });
    }

    function mapChannel(channel) {
        var type = channel.type && channel.type.value ? channel.type.value : channel.type || 'IP';
        var title = channel.displayName || channel.name || channel.assetId || 'Channel';

        return {
            kind: 'channel',
            title: title,
            subtitle: channel.groups || type,
            image: pickImage(channel.images),
            assetId: channel.assetId,
            videoType: type,
            locked: channel.purchased === false,
            raw: channel
        };
    }

    function mapAsset(asset) {
        var isSeries = asset.assetType === 'SERIES';
        var title = asset.name || asset.displayName || asset.title || asset.assetId || 'Video';
        var year = asset.release_date || asset.releaseDate || '';
        var rating = asset.ratings && asset.ratings[0] ? asset.ratings[0].movieRating : '';
        var duration = asset.duration ? formatDuration(asset.duration) : '';
        var subtitle = [normalizeYear(year), duration, rating ? 'Rating ' + rating : ''].filter(Boolean).join(' / ');

        return {
            kind: isSeries ? 'nav' : 'vod',
            title: title,
            subtitle: subtitle || (asset.assetType || ''),
            image: pickImage(asset.images) || asset.image,
            assetId: asset.assetId,
            videoType: 'VIRTUAL',
            locked: asset.purchased === false,
            raw: asset,
            route: isSeries ? {
                type: 'series-seasons',
                assetId: asset.assetId,
                title: title
            } : null
        };
    }

    function mapSearchResult(asset) {
        var type = asset && (asset.assetType || asset.contentType || asset.type);
        var typeValue = type && type.value ? type.value : type;

        if (!asset) return null;
        if (typeValue === 'MOVIE' || typeValue === 'SERIES') return mapAsset(asset);
        if (typeValue === 'LIVE_CHANNEL' || typeValue === 'IP' || asset.channelNumber || asset.logicalChannelNumber) return mapChannel(asset);

        if (asset.assetId && (asset.name || asset.displayName || asset.title)) return mapAsset(asset);

        return null;
    }

    function buildRows(rows) {
        var result = [];

        rows.forEach(function (row) {
            if (row && row.results && row.results.length) result.push(row);
        });

        return result;
    }

    function decodeQuery(value) {
        try {
            return decodeURIComponent(value || '');
        } catch (error) {
            return String(value || '');
        }
    }

    function subtitleYear(value) {
        var year = normalizeYear(value);
        return year && /^\d{4}$/.test(year) ? year + '-01-01' : '';
    }

    function itemRating(item) {
        var raw = item && item.raw ? item.raw : {};
        var rating = raw.ratings && raw.ratings[0] ? raw.ratings[0].movieRating : '';
        var match;

        if (!rating && item && item.subtitle) {
            match = String(item.subtitle).match(/Rating\s+([\d.]+)/i);
            if (match) rating = match[1];
        }

        rating = parseFloat(rating);
        return isNaN(rating) ? 0 : rating;
    }

    function normalizeYear(value) {
        if (!value) return '';
        var text = String(value);
        var match = text.match(/\d{4}/);
        return match ? match[0] : text;
    }

    function formatDuration(value) {
        var minutes = Math.round(Number(value) / 60);
        if (!minutes || minutes < 1) return '';
        if (minutes < 60) return minutes + ' min';
        return Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm';
    }

    function pickImage(images) {
        images = asArray(images);
        if (!images.length) return '';

        var preferred = null;
        for (var i = 0; i < images.length; i++) {
            if (images[i].url && images[i].url.indexOf('2_3_XL') !== -1) {
                preferred = images[i];
                break;
            }
        }

        return (preferred || images[0]).url || '';
    }

    function pickBackdrop(images) {
        images = asArray(images);
        if (!images.length) return '';

        for (var i = 0; i < images.length; i++) {
            if (images[i].url && /16_9|landscape|backdrop|background/i.test(images[i].url + ' ' + (images[i].type || ''))) {
                return images[i].url;
            }
        }

        return '';
    }

    function asArray(value) {
        if (!value) return [];
        if (Object.prototype.toString.call(value) === '[object Array]') return value;
        if (value.items && Object.prototype.toString.call(value.items) === '[object Array]') return value.items;
        if (value.elements && Object.prototype.toString.call(value.elements) === '[object Array]') return value.elements;
        if (value.results && Object.prototype.toString.call(value.results) === '[object Array]') return value.results;
        if (value.content && Object.prototype.toString.call(value.content) === '[object Array]') return value.content;
        if (value.assets && Object.prototype.toString.call(value.assets) === '[object Array]') return value.assets;
        if (typeof value.length === 'number') return Array.prototype.slice.call(value);
        return [];
    }
