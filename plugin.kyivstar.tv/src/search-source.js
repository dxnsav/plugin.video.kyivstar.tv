    function createSearchSource() {
        var api = new KyivstarApi();
        var source;

        source = {
            title: TITLE,
            count: 0,
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
                    var count = countSearchRows(rows);

                    source.count = count;
                    source.results_count = count;
                    source.total_results = count;
                    source.results = count;
                    source.result = count;
                    source.total = count;
                    source.title = count ? TITLE + ' ' + count : TITLE;

                    debugLog('info', 'search:native:ok', {
                        query: query,
                        rows: rows.length,
                        count: count
                    });
                    rows.count = count;
                    rows.results_count = count;
                    rows.total_results = count;
                    rows.results = count;
                    rows.result = count;
                    rows.total = count;
                    done(rows);
                }).catch(function (error) {
                    source.count = 0;
                    source.results_count = 0;
                    source.total_results = 0;
                    source.results = 0;
                    source.result = 0;
                    source.total = 0;
                    source.title = TITLE;
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

        return source;
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
            { title: 'Videos', type: 'movie', results: videos, count: videos.length, total_results: videos.length },
            { title: 'Live TV', type: 'channel', results: channels, count: channels.length, total_results: channels.length }
        ]);
    }

    function countSearchRows(rows) {
        var total = 0;

        rows.forEach(function (row) {
            total += row && row.results ? row.results.length : 0;
        });

        return total;
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
            source_name: TITLE,
            source_title: TITLE,
            provider_name: TITLE,
            source_logo: ASSET_BASE + 'favicon.ico',
            method: isSeries ? 'tv' : 'movie',
            videoType: item.videoType || 'VIRTUAL',
            raw: raw,
            route: item.route || null,
            url: item.route ? nativeRouteUrl(item.route) : '',
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
            notify(t('item_unavailable'));
            return;
        }

        if (item.kind === 'channel') {
            playItem(new KyivstarApi(), item);
        } else if (item.kind === 'nav' || item.kind === 'vod' || item.kind === 'episode') {
            openKyivstarFullCard(item);
        }
    }

    function openKyivstarFullCard(item) {
        var card = mapNativeCard(item);

        debugLog('info', 'search:open-full', {
            assetId: item.assetId || '',
            title: item.title || '',
            method: card.method || ''
        });

        if (Lampa.Activity && Lampa.Activity.push) {
            Lampa.Activity.push({
                component: 'full',
                source: COMPONENT,
                method: card.method,
                id: card.id,
                card: card,
                movie: card,
                _kyivstar: item
            });
            return;
        }

        if (Lampa.Router && Lampa.Router.call) {
            Lampa.Router.call('full', card);
            return;
        }

        notify(t('full_card_api_unavailable'));
    }

    function showMainMenu(attempt) {
        attempt = attempt || 0;
        addApiSource();

        if (apiSourceAdded && Lampa.Activity && Lampa.Activity.push) {
            Lampa.Activity.push({
                title: TITLE,
                component: 'main',
                source: COMPONENT,
                page: 1
            });
            return;
        }

        if (attempt < 10) {
            setTimeout(function () {
                showMainMenu(attempt + 1);
            }, 250);
            return;
        }

        notify(t('source_not_ready'));
    }
