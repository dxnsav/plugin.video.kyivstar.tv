    function createSearchSource() {
        var api = new KyivstarApi();

        return {
            title: TITLE,
            params: {
                lazy: true,
                save: false,
                start_typing: 'search_start_typing',
                nofound: 'search_nofound'
            },
            search: function (params, done) {
                var query = decodeQuery(params && params.query);

                debugLog('info', 'search:native:start', { query: query });

                api.search(query).then(function (results) {
                    var rows = buildNativeSearchRows(results || []);
                    debugLog('info', 'search:native:ok', {
                        query: query,
                        rows: rows.length
                    });
                    done(rows);
                }).catch(function (error) {
                    debugLog('error', 'search:native:error', {
                        query: query,
                        error: error.message || String(error),
                        status: error.status || error.decode_code || ''
                    });
                    done([]);
                });
            },
            onSelect: function (params, close) {
                var item = params && params.element ? params.element._kyivstar : null;
                if (typeof close === 'function') close();
                openKyivstarItem(item);
            },
            onCancel: function () {
                api.clear();
            }
        };
    }

    function buildNativeSearchRows(results) {
        var videos = [];
        var channels = [];

        results.forEach(function (asset) {
            var item = mapSearchResult(asset);
            var card;

            if (!item) return;

            card = mapNativeCard(item);
            if (item.kind === 'channel') channels.push(card);
            else videos.push(card);
        });

        return buildRows([
            { title: 'Videos', type: 'movie', results: videos },
            { title: 'Live TV', type: 'channel', results: channels }
        ]);
    }

    function mapNativeCard(item) {
        var raw = item.raw || {};
        var isSeries = item.kind === 'nav' || raw.assetType === 'SERIES';
        var date = subtitleYear(raw.release_date || raw.releaseDate || item.subtitle);
        var rating = itemRating(item);
        var card = {
            id: item.assetId || item.title,
            title: item.title,
            original_title: item.title,
            release_date: isSeries ? '' : date,
            first_air_date: isSeries ? date : '',
            vote_average: rating,
            poster: item.image || '',
            img: item.image || '',
            production_countries: normalizeProductionCountries(raw),
            source: COMPONENT,
            method: isSeries ? 'tv' : 'movie',
            videoType: item.videoType || 'VIRTUAL',
            raw: raw,
            _kyivstar: item
        };

        if (isSeries) {
            card.name = item.title;
            card.original_name = item.title;
        }

        return card;
    }

    function openKyivstarItem(item) {
        if (!item) return;

        if (item.locked) {
            notify('This item is not available for the current account.');
            return;
        }

        if (item.kind === 'nav' && item.route) {
            pushRoute(item.route, item.title);
        } else if (item.kind === 'vod' || item.kind === 'episode' || item.kind === 'channel') {
            playItem(new KyivstarApi(), item);
        }
    }

    function addComponent() {
        if (!Lampa.Component || !Lampa.Component.add) {
            setTimeout(addComponent, 500);
            return;
        }

        Lampa.Component.add(COMPONENT, KyivstarComponent);
    }

    function pushRoute(route, title) {
        Lampa.Activity.push({
            title: title || TITLE,
            component: COMPONENT,
            route: route
        });
    }

    function showMainMenu() {
        addApiSource();
        pushRoute({ type: 'home' }, TITLE);
    }
