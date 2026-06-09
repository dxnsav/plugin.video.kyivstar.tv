    function sourceMain(params, onComplete, onError) {
        var api = new KyivstarApi();
        var nextOffset = NATIVE_MAIN_ROWS;
        var compilationsCache = [];

        function loadRows(offset, limit, resolve, reject) {
            api.getCompilations(null).catch(function (error) {
                debugLog('warn', 'api:main:compilations-error', {
                    error: error.message || String(error),
                    status: error.status || error.decode_code || ''
                });
                return [];
            }).then(function (compilations) {
                compilationsCache = filterNativeCompilations(compilations);

                var slice = compilationsCache.slice(offset, offset + limit);
                var loaders = slice.map(function (compilation) {
                    return loadNativeRow(api, compilation);
                });

                if (!loaders.length && offset === 0) {
                    loaders.push(loadNativeRow(api, null));
                }

                return Promise.all(loaders);
            }).then(function (rows) {
                rows = buildRows(rows);

                if (rows.length) resolve(rows);
                else if (typeof reject === 'function') reject();
            }).catch(function (error) {
                debugLog('error', 'api:main:error', {
                    error: error.message || String(error),
                    status: error.status || error.decode_code || ''
                });
                if (typeof reject === 'function') reject();
            });
        }

        loadRows(0, NATIVE_MAIN_ROWS, onComplete, onError);

        return function (resolve, reject) {
            var offset = nextOffset;
            nextOffset += NATIVE_MAIN_ROWS;

            if (compilationsCache.length && offset >= compilationsCache.length) {
                if (typeof reject === 'function') reject();
                return;
            }

            loadRows(offset, NATIVE_MAIN_ROWS, resolve, reject);
        };
    }

    function sourceList(params, onComplete, onError) {
        var api = new KyivstarApi();
        var parsed = parseNativeList(params);
        var page = Math.max(1, Number(params && params.page) || 1);
        var offset = (page - 1) * LIMIT;

        loadNativeListPage(api, parsed, offset, LIMIT).then(function (assets) {
            var cards = asArray(assets).map(mapAsset).map(mapNativeCard).filter(Boolean);
            var hasNext = cards.length === LIMIT;

            if (!cards.length && page === 1) {
                if (typeof onError === 'function') onError();
                return;
            }

            debugLog('info', 'api:list:ok', {
                url: parsed.url,
                page: page,
                offset: offset,
                limit: LIMIT,
                count: cards.length,
                hasNext: hasNext,
                compilationId: parsed.compilationId || '',
                groupId: parsed.groupId || ''
            });

            onComplete({
                title: parsed.title,
                url: parsed.url,
                source: COMPONENT,
                page: page,
                total_pages: hasNext ? UNKNOWN_TOTAL_PAGES : page,
                total_results: hasNext ? UNKNOWN_TOTAL_PAGES * LIMIT : offset + cards.length,
                results: cards
            });
        }).catch(function (error) {
            debugLog('error', 'api:list:error', {
                url: parsed.url,
                page: page,
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            if (typeof onError === 'function') onError();
        });
    }

    function sourceFull(params, onComplete, onError) {
        var api = new KyivstarApi();
        var item = extractKyivstarItem(params);
        var completed = false;

        if (!item) {
            if (typeof onError === 'function') onError();
            return;
        }

        function complete(mapped) {
            if (completed) return;
            completed = true;

            onComplete({
                movie: buildFullMovie(mapped || item)
            });
        }

        setTimeout(function () {
            complete(item);
        }, 2500);

        if (!item.assetId || item.kind === 'channel') {
            complete(item);
            return;
        }

        api.getAssetInfo(item.assetId).then(function (info) {
            var asset = asArray(info)[0];
            if (!asset) {
                complete(item);
                return;
            }

            complete(mapAsset(asset));
        }).catch(function (error) {
            debugLog('warn', 'api:full:details-error', {
                assetId: item.assetId,
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            complete(item);
        });
    }

    function sourceImg(src) {
        return src || '';
    }

    function addFullPlayerHook() {
        if (fullPlayerHookAdded) return;

        if (!Lampa.Listener || !Lampa.Listener.follow) {
            setTimeout(addFullPlayerHook, 500);
            return;
        }

        Lampa.Listener.follow('full', function (event) {
            var movie = event && event.data ? event.data.movie : null;
            var item = movie && movie._kyivstar ? movie._kyivstar : null;
            var button;

            if (!item || movie.source !== COMPONENT || event.type !== 'complite' || !event.body) return;

            button = $(event.body).find('.button--play').eq(0);
            if (!button.length) return;

            button.off('hover:enter click');
            button.on('hover:enter click', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                openKyivstarItem(item);
                return false;
            });
        });

        fullPlayerHookAdded = true;
        debugLog('info', 'full:player-hook-added', {});
    }

    function filterNativeCompilations(compilations) {
        return asArray(compilations).filter(function (item) {
            return item && item.id;
        });
    }

    function loadNativeRow(api, compilation) {
        var title = compilation ? (compilation.displayName || compilation.name || 'Videos') : 'Videos';
        var id = compilation ? compilation.id : null;
        var type = nativeCompilationType(compilation);
        var url = nativeListUrl(id, type);
        var parsed = {
            url: url,
            title: title,
            compilationId: type === 'compilation' ? id : null,
            groupId: type === 'group' ? id : null
        };

        return loadNativeListPage(api, parsed, 0, LIMIT).then(function (assets) {
            var cards = asArray(assets).map(mapAsset).map(mapNativeCard).filter(Boolean);
            var hasNext = cards.length === LIMIT;

            return {
                title: title,
                url: url,
                source: COMPONENT,
                page: 1,
                total_pages: hasNext ? UNKNOWN_TOTAL_PAGES : 1,
                total_results: hasNext ? UNKNOWN_TOTAL_PAGES * LIMIT : cards.length,
                results: cards
            };
        }).catch(function (error) {
            debugLog('warn', 'api:row:error', {
                title: title,
                compilationId: id || '',
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            return null;
        });
    }

    function nativeCompilationType(compilation) {
        if (!compilation) return 'root';
        if (compilation.compilationElementType === 'CONTENT_GROUP') return 'group';
        if (compilation.compilationElementType === 'PREDEFINED') return 'root';
        return 'compilation';
    }

    function loadNativeListPage(api, parsed, offset, limit) {
        if (parsed.groupId) return loadNativeGroupPage(api, parsed.groupId, offset, limit);

        return api.getContentAreaElements(parsed.compilationId, [], parsed.sortId || null, offset, limit);
    }

    function loadNativeGroupPage(api, groupId, offset, limit) {
        return api.getContentGroupElements(groupId, [], null, offset, limit).then(function (assets) {
            assets = asArray(assets);
            if (assets.length) return assets;

            return api.getCompilations(groupId).then(function (children) {
                children = filterNativeCompilations(children);
                if (!children.length) return [];

                return loadFirstNonEmptyChildPage(api, children, 0, offset, limit);
            });
        });
    }

    function loadFirstNonEmptyChildPage(api, children, index, offset, limit) {
        var child = children[index];
        var type;
        var parsed;

        if (!child) return Promise.resolve([]);

        type = nativeCompilationType(child);
        parsed = {
            compilationId: type === 'compilation' ? child.id : null,
            groupId: type === 'group' ? child.id : null
        };

        return loadNativeListPage(api, parsed, offset, limit).then(function (assets) {
            assets = asArray(assets);
            if (assets.length || index >= children.length - 1) return assets;
            return loadFirstNonEmptyChildPage(api, children, index + 1, offset, limit);
        });
    }

    function nativeListUrl(compilationId, type) {
        if (!compilationId || type === 'root') return 'kyivstar/videos';
        return 'kyivstar/' + (type === 'group' ? 'group' : 'compilation') + '/' + encodeURIComponent(compilationId);
    }

    function parseNativeList(params) {
        var url = params && params.url ? String(params.url) : 'kyivstar/videos';
        var title = params && params.title ? params.title : 'Videos';
        var compilationPrefix = 'kyivstar/compilation/';
        var groupPrefix = 'kyivstar/group/';
        var compilationId = null;
        var groupId = null;

        if (url.indexOf(compilationPrefix) === 0) {
            try {
                compilationId = decodeURIComponent(url.substr(compilationPrefix.length));
            } catch (error) {
                compilationId = url.substr(compilationPrefix.length);
            }
        } else if (url.indexOf(groupPrefix) === 0) {
            try {
                groupId = decodeURIComponent(url.substr(groupPrefix.length));
            } catch (groupError) {
                groupId = url.substr(groupPrefix.length);
            }
        }

        return {
            url: url,
            title: title,
            compilationId: compilationId,
            groupId: groupId
        };
    }

    function extractKyivstarItem(params) {
        if (!params) return null;
        if (params._kyivstar) return params._kyivstar;
        if (params.card && params.card._kyivstar) return params.card._kyivstar;

        return {
            kind: params.first_air_date ? 'nav' : 'vod',
            title: params.title || params.name || params.original_title || params.original_name || TITLE,
            subtitle: '',
            image: params.poster || params.img || params.background_image || '',
            assetId: params.id,
            videoType: params.videoType || 'VIRTUAL',
            raw: params.raw || {}
        };
    }

    function buildFullMovie(item) {
        var raw = item.raw || {};
        var isSeries = item.kind === 'nav' || raw.assetType === 'SERIES';
        var image = item.image || pickImage(raw.images) || raw.image || '';
        var background = pickBackdrop(raw.images) || image;
        var release = raw.release_date || raw.releaseDate || item.subtitle || '';
        var date = subtitleYear(release);
        var rating = itemRating(item);
        var runtime = raw.duration ? Math.round(Number(raw.duration) / 60) : 0;
        var description = raw.description || raw.longDescription || raw.shortDescription || raw.plot || raw.overview || '';
        var movie = {
            id: item.assetId || item.title,
            source: COMPONENT,
            method: isSeries ? 'tv' : 'movie',
            title: item.title,
            original_title: item.title,
            release_date: isSeries ? '' : date,
            first_air_date: isSeries ? date : '',
            overview: description,
            runtime: runtime || 0,
            vote_average: rating || 0,
            genres: [],
            production_countries: normalizeProductionCountries(raw),
            poster: image,
            img: image,
            background_image: background,
            poster_path: '',
            backdrop_path: '',
            _kyivstar: item
        };

        if (isSeries) {
            movie.name = item.title;
            movie.original_name = item.title;
        }

        return movie;
    }
