    function sourceMain(params, onComplete, onError) {
        var api = new KyivstarApi();
        var nextOffset = NATIVE_MAIN_ROWS;
        var compilationsCache = [];

        function loadRows(offset, limit, resolve, reject) {
            api.getContentAreas().catch(function (error) {
                debugLog('warn', 'api:main:contentareas-error', {
                    error: error.message || String(error),
                    status: error.status || error.decode_code || ''
                });
                return [];
            }).then(function (areas) {
                compilationsCache = filterNativeCompilations(areas);

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

            if (!item || movie.source !== COMPONENT || event.type !== 'complite' || !event.body) return;

            addKyivstarFullButton(event.body, item);
            patchKyivstarFullLabels(event.body);
            patchDanglingFullSeparators(event.body);
            setTimeout(function () {
                patchKyivstarFullLabels(event.body);
                patchDanglingFullSeparators(event.body);
            }, 250);
        });

        fullPlayerHookAdded = true;
        debugLog('info', 'full:player-hook-added', {});
    }

    function addKyivstarFullButton(body, item) {
        var root = $(body);
        var playButton = root.find('.button--play').eq(0);
        var buttonRow = playButton.length ? playButton.parent() : findFullButtonRow(root);
        var button;

        root.find('.button--kyivstar-tv').remove();
        if (!buttonRow.length) {
            debugLog('warn', 'full:kyivstar-button:no-row', {
                assetId: item.assetId || ''
            });
            return;
        }

        button = createKyivstarFullButton(playButton);
        button.on('hover:enter click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (e && e.stopPropagation) e.stopPropagation();
            playKyivstarFromFullButton(item);
            return false;
        });

        if (playButton.length) button.insertAfter(playButton);
        else buttonRow.append(button);

        if (Lampa.Controller && Lampa.Controller.collectionSet) {
            Lampa.Controller.collectionSet(root);
        }

        debugLog('info', 'full:kyivstar-button:added', {
            assetId: item.assetId || '',
            title: item.title || ''
        });
    }

    function patchKyivstarFullLabels(body) {
        var root = $(body);

        root.find('*').contents().each(function () {
            if (this.nodeType !== 3) return;
            if (this.nodeValue && this.nodeValue.indexOf('KYIVSTAR_TV') !== -1) {
                this.nodeValue = this.nodeValue.replace(/KYIVSTAR_TV/g, TITLE);
            }
        });
    }

    function patchDanglingFullSeparators(body) {
        var root = $(body);

        root.find('*').contents().each(function () {
            if (this.nodeType !== 3 || !this.nodeValue) return;
            this.nodeValue = this.nodeValue
                .replace(/\s+•\s*$/g, '')
                .replace(/^\s*•\s+/g, '');
        });
    }

    function playKyivstarFromFullButton(item) {
        if (!item || !item.assetId) {
            notify(t('item_not_playable'));
            return;
        }

        if (item.locked) {
            notify(t('item_unavailable'));
            return;
        }

        debugLog('info', 'full:kyivstar-button:play', {
            assetId: item.assetId || '',
            title: item.title || '',
            kind: item.kind || '',
            type: item.videoType || ''
        });

        if (isKyivstarSeries(item)) {
            openSeriesEpisodeSelect(new KyivstarApi(), item);
            return;
        }

        playItem(new KyivstarApi(), item);
    }

    function isKyivstarSeries(item) {
        var raw = item && item.raw ? item.raw : {};
        var type = raw.assetType || raw.contentType || raw.type || '';
        var typeValue = type && type.value ? type.value : type;

        return !!(item && (item.kind === 'nav' || typeValue === 'SERIES'));
    }

    function openSeriesEpisodeSelect(api, item) {
        debugLog('info', 'full:series:start', {
            assetId: item.assetId || '',
            title: item.title || ''
        });

        api.getAssetInfo(item.assetId).then(function (info) {
            var asset = asArray(info)[0] || item.raw || {};
            var seasons = asArray(asset.seasons);

            if (!seasons.length) {
                return showEpisodeSelect(api, item, 1);
            }

            if (seasons.length === 1) {
                return showEpisodeSelect(api, item, seasonNumber(seasons[0]));
            }

            showSeasonSelect(api, item, seasons);
        }).catch(function (error) {
            debugLog('warn', 'full:series:details-error', {
                assetId: item.assetId || '',
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
            showEpisodeSelect(api, item, 1);
        });
    }

    function showSeasonSelect(api, item, seasons) {
        if (!Lampa.Select || !Lampa.Select.show) {
            showEpisodeSelect(api, item, seasonNumber(seasons[0]));
            return;
        }

        Lampa.Select.show({
            title: item.title || 'Series',
            items: seasons.map(function (season) {
                var number = seasonNumber(season);
                return {
                    title: t('season_prefix') + number,
                    season: number
                };
            }),
            onSelect: function (season) {
                showEpisodeSelect(api, item, season.season);
            }
        });
    }

    function showEpisodeSelect(api, item, season) {
        api.getTvGroup(item.assetId, season || 1, 0, 100).then(function (episodes) {
            var mapped = asArray(episodes).map(function (episode) {
                var mappedEpisode = mapAsset(episode);
                mappedEpisode.kind = 'episode';
                return mappedEpisode;
            }).filter(function (episode) {
                return episode && episode.assetId;
            });

            debugLog('info', 'full:series:episodes-ok', {
                assetId: item.assetId || '',
                season: season || 1,
                count: mapped.length
            });

            if (!mapped.length) {
                notify(t('no_playable_episodes'));
                return;
            }

            if (!Lampa.Select || !Lampa.Select.show) {
                playItem(api, mapped[0]);
                return;
            }

            Lampa.Select.show({
                title: item.title || t('episodes'),
                items: mapped.map(function (episode, index) {
                    return {
                        title: episode.title || (t('episode_prefix') + (index + 1)),
                        subtitle: episode.subtitle || '',
                        episode: episode
                    };
                }),
                onSelect: function (selected) {
                    playItem(api, selected.episode);
                }
            });
        }).catch(function (error) {
            notify(error.message || String(error));
            debugLog('error', 'full:series:episodes-error', {
                assetId: item.assetId || '',
                season: season || 1,
                error: error.message || String(error),
                status: error.status || error.decode_code || ''
            });
        });
    }

    function seasonNumber(season) {
        var number = season && (season.number || season.seasonNumber || season.value || season.id);
        number = parseInt(number, 10);
        return number > 0 ? number : 1;
    }

    function findFullButtonRow(root) {
        var row = root.find('.full-start__buttons, .full-start-new__buttons, .full-start__buttons-line').eq(0);

        if (row.length) return row;

        row = root.find('.button, .full-start__button, .selector').filter(function () {
            return $(this).closest('.full-start, .full-start-new, .full').length > 0;
        }).eq(0).parent();

        return row;
    }

    function createKyivstarFullButton(playButton) {
        var button = $('<div class="full-start__button button selector button--kyivstar-tv">' +
            '<div class="full-start__button-icon">' + iconSvg() + '</div>' +
            '<div class="full-start__button-name">' + brandLogoHtml() + brandLogoDarkHtml() + '</div>' +
            '</div>');

        if (playButton && playButton.length) {
            copyButtonShapeClasses(playButton, button);
        }

        return button;
    }

    function copyButtonShapeClasses(source, target) {
        var classes = String(source.attr('class') || '').split(/\s+/);

        classes.forEach(function (name) {
            if (!name || name === 'button--play' || name === 'focus') return;
            target.addClass(name);
        });
    }

    function filterNativeCompilations(compilations) {
        return asArray(compilations).filter(function (item) {
            return item && item.active !== false && (item.id || item.assetId);
        }).sort(function (left, right) {
            var a = typeof left.contentAreaLocation === 'number' ? left.contentAreaLocation : 9999;
            var b = typeof right.contentAreaLocation === 'number' ? right.contentAreaLocation : 9999;
            return a - b;
        });
    }

    function loadNativeRow(api, compilation) {
        var title = compilation ? (textValue(compilation.name) || textValue(compilation.title) || textValue(compilation.displayName) || 'Videos') : 'Videos';
        var id = compilation ? (compilation.assetId || compilation.id) : null;
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
        if (compilation.entityType === 'CONTENT_GROUP') return 'group';
        if (compilation.compilationElementType === 'CONTENT_GROUP') return 'group';
        if (compilation.compilationElementType === 'PREDEFINED') return 'root';
        return 'compilation';
    }

    function loadNativeListPage(api, parsed, offset, limit) {
        if (parsed.groupId) return loadNativeGroupPage(api, parsed.groupId, offset, limit);

        return api.getContentAreaElements(parsed.compilationId, [], parsed.sortId || null, offset, limit);
    }

    function loadNativeGroupPage(api, groupId, offset, limit) {
        return api.getContentGroupLegacyElements(groupId, offset, limit).then(function (assets) {
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

    function textValue(value) {
        return typeof value === 'string' && value ? value : '';
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
            id: item.assetId || item.title || TITLE,
            source: COMPONENT,
            source_name: TITLE,
            source_title: TITLE,
            provider_name: TITLE,
            source_logo: ASSET_BASE + 'favicon.ico',
            method: isSeries ? 'tv' : 'movie',
            title: String(item.title || TITLE),
            original_title: String(item.title || TITLE),
            release_date: isSeries ? '' : date,
            first_air_date: isSeries ? date : '',
            overview: String(description || ''),
            runtime: runtime || 0,
            vote_average: rating || 0,
            genres: normalizeGenres(raw),
            production_companies: [],
            production_countries: normalizeProductionCountries(raw),
            keywords: { results: [], keywords: [] },
            videos: { results: [] },
            credits: { cast: [], crew: [] },
            images: { posters: [], backdrops: [] },
            alternative_titles: { titles: [] },
            names: [],
            tagline: '',
            budget: 0,
            status: '',
            imdb_rating: 0,
            kp_rating: 0,
            number_of_episodes: 0,
            number_of_seasons: 0,
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
