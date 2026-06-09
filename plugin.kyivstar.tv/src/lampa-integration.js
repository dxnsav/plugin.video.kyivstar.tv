    function addSideMenuEntry() {
        var list = $('.menu .menu__list').eq(0);

        if (!list.length) {
            setTimeout(addSideMenuEntry, 500);
            return;
        }

        $('.menu__item[data-action="kyivstar-tv"]').remove();

        var item = $('<li class="menu__item selector" data-action="kyivstar-tv">' +
            '<div class="menu__ico">' + iconSvg() + '</div>' +
            '<div class="menu__text">' + TITLE + '</div>' +
            '</li>');

        item.on('hover:enter click', showMainMenu);
        list.append(item);
        debugLog('info', 'menu:added', {});
    }

    function addSearchSource() {
        if (searchSourceAdded) return;

        if (!Lampa.Search || !Lampa.Search.addSource) {
            setTimeout(addSearchSource, 500);
            return;
        }

        if (window.__kyivstar_tv_search_source && Lampa.Search.removeSource) {
            Lampa.Search.removeSource(window.__kyivstar_tv_search_source);
        }

        window.__kyivstar_tv_search_source = createSearchSource();
        Lampa.Search.addSource(window.__kyivstar_tv_search_source);
        searchSourceAdded = true;
        debugLog('info', 'search:source-added', {});
    }

    function addApiSource() {
        if (apiSourceAdded) return;

        if (!Lampa.Api || !Lampa.Api.sources) {
            setTimeout(addApiSource, 500);
            return;
        }

        try {
            Lampa.Api.sources[COMPONENT] = createApiSource();

            if (Lampa.Params && Lampa.Params.values && Lampa.Params.select) {
                var values = merge({}, Lampa.Params.values.source || {});
                values[COMPONENT] = TITLE;
                Lampa.Params.select('source', values, Lampa.Storage.get('source', 'tmdb'));
            }

            apiSourceAdded = true;
            debugLog('info', 'api:source-added', { source: COMPONENT });
        } catch (error) {
            debugLog('error', 'api:source-error', { error: error.message || String(error) });
        }
    }

    function createApiSource() {
        var base = Lampa.Api && Lampa.Api.sources ? Lampa.Api.sources.tmdb : null;
        var source = base ? merge({}, base) : {};

        source.main = sourceMain;
        source.list = sourceList;
        source.full = sourceFull;
        source.seasons = sourceSeasons;
        source.img = sourceImg;
        source.clear = function () {
            new KyivstarApi().clear();
        };
        source.discovery = false;

        return source;
    }
