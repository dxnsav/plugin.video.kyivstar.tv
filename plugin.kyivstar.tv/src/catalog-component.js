    function KyivstarComponent(object) {
        var self = this;
        var route = object.route || { type: 'root' };
        var api = new KyivstarApi();
        var html = $('<div class="kyivstar-tv"></div>');
        var body = $('<div class="kyivstar-tv__body"></div>');
        var content = $('<div class="kyivstar-tv__content"></div>');
        var scroll = Lampa.Scroll ? new Lampa.Scroll({ mask: true, over: true }) : null;
        var activeItems = [];
        var lastActivated = { key: '', time: 0 };

        if (scroll) {
            scroll.append(content);
            html.append(scroll.render(true));
        } else {
            body.append(content);
            html.append(body);
        }

        this.create = function () {
            load();
            return self.render();
        };

        this.render = function () {
            return html;
        };

        this.start = function () {
            focusFirst();
        };

        this.back = function () {
            if (Lampa.Activity.backward) Lampa.Activity.backward();
            else if (Lampa.Activity.back) Lampa.Activity.back();
        };

        this.destroy = function () {
            if (api) api.clear();
            if (scroll) scroll.destroy();
            html.remove();
            activeItems = [];
        };

        function load() {
            setLoader(true);
            setSubtitle('');

            loadRoute(route, api).then(function (items) {
                renderItems(items);
                setLoader(false);
            }).catch(function (error) {
                setLoader(false);
                renderError(error);
            });
        }

        function setLoader(visible) {
            if (self.activity && self.activity.loader) self.activity.loader(visible);
            if (visible) renderMessage('Loading...');
        }

        function setSubtitle(text) {
        }

        function renderMessage(text) {
            clearBody();
            target().append($('<div class="kyivstar-tv__message"></div>').text(text));
        }

        function renderError(error) {
            clearBody();
            var message = error && error.message ? error.message : String(error || 'Unknown error');
            target().append($('<div class="kyivstar-tv__message kyivstar-tv__message--error"></div>').text(message));
            notify(message);
        }

        function renderItems(items) {
            clearBody();
            if (items && items.rows) {
                renderRows(items.rows);
                return;
            }

            if (!items || !items.length) {
                renderMessage('Nothing found');
                return;
            }

            var grid = $('<div class="kyivstar-tv__grid"></div>');
            grid.addClass(route.type === 'root' ? 'kyivstar-tv__grid--root' : 'kyivstar-tv__grid--catalog');
            items.forEach(function (item) {
                var card = renderCard(item);
                if (route.type === 'root') card.addClass('kyivstar-tv-card--root');
                if (item.kind === 'filter') card.addClass('kyivstar-tv-card--category');
                grid.append(card);
                activeItems.push(card);
            });

            target().append(grid);
            focusFirst();
        }

        function renderRows(rows) {
            if (!rows || !rows.length) {
                renderMessage('Nothing found');
                return;
            }

            rows.forEach(function (row) {
                var rowElement = $('<div class="kyivstar-tv-row"></div>');
                var title = $('<div class="kyivstar-tv-row__title"></div>').text(row.title || '');
                var body = $('<div class="kyivstar-tv-row__body"></div>');

                rowElement.append(title);
                rowElement.append(body);

                (row.items || []).forEach(function (item) {
                    var card = renderCard(item);
                    card.addClass(item.kind === 'nav' ? 'kyivstar-tv-card--category' : 'kyivstar-tv-card--poster');
                    body.append(card);
                    activeItems.push(card);
                });

                target().append(rowElement);
            });

            focusFirst();
        }

        function renderCard(item) {
            var card = $('<div class="kyivstar-tv-card selector" tabindex="0"></div>');
            var thumb = $('<div class="kyivstar-tv-card__thumb"></div>');
            var meta = $('<div class="kyivstar-tv-card__meta"></div>');
            var title = $('<div class="kyivstar-tv-card__title"></div>').text(item.title || TITLE);
            var subtitle = $('<div class="kyivstar-tv-card__subtitle"></div>').text(item.subtitle || '');

            if (item.image) {
                thumb.append($('<img alt="">').attr('src', item.image));
            } else if (item.kind === 'nav' || item.kind === 'filter') {
                thumb.append($('<div class="kyivstar-tv-card__fallback kyivstar-tv-card__fallback--icon"></div>').html(item.icon || iconSvg()));
            } else {
                thumb.append($('<div class="kyivstar-tv-card__fallback"></div>').text((item.title || 'K').slice(0, 2).toUpperCase()));
            }

            if (item.locked) card.addClass('kyivstar-tv-card--locked');
            meta.append(title);
            meta.append(subtitle);
            card.append(thumb);
            card.append(meta);

            card.on('hover:enter click', function () {
                activateOnce(item);
            });
            card.on('hover:focus focus', function () {
                scrollRowToCard(card);
                if (scroll) scroll.update(card);
            });

            return card;
        }

        function activateOnce(item) {
            var key = activationKey(item);
            var now = Date.now();

            if (lastActivated.key === key && now - lastActivated.time < 700) return;

            lastActivated.key = key;
            lastActivated.time = now;
            activate(item);
        }

        function activationKey(item) {
            if (!item) return '';
            if (item.assetId) return item.kind + ':' + item.assetId;
            if (item.route) return item.kind + ':' + item.route.type + ':' + (item.route.compilationId || item.route.groupId || item.title || '');
            return item.kind + ':' + (item.title || '');
        }

        function activate(item) {
            if (item.locked) {
                notify('This item is not available for the current account.');
                return;
            }

            if (item.kind === 'nav') {
                pushRoute(item.route, item.title);
            } else if (item.kind === 'search') {
                askText('Search Kyivstar TV', '', function (query) {
                    if (query) pushRoute({ type: 'search', query: query }, 'Search: ' + query);
                });
            } else if (item.kind === 'session') {
                refreshSession(api);
            } else if (item.kind === 'logout') {
                logout(api);
            } else if (item.kind === 'settings') {
                showSettingsMenu(api, function () {
                    focusFirst();
                });
            } else if (item.kind === 'diagnostics') {
                showDiagnosticsMenu(function () {
                    focusFirst();
                });
            } else if (item.kind === 'filter') {
                showCatalogFilterMenu(route, api);
            } else if (item.kind === 'vod' || item.kind === 'episode' || item.kind === 'channel') {
                playItem(api, item);
            }
        }

        function clearBody() {
            activeItems = [];
            target().empty();
        }

        function target() {
            return content;
        }

        function scrollRowToCard(card) {
            var row = card.closest('.kyivstar-tv-row__body');
            var left;

            if (!row.length) return;

            left = card.position().left + row.scrollLeft();
            row.stop(true).animate({
                scrollLeft: Math.max(0, left - row.width() * 0.18)
            }, 120);
        }

        function focusFirst() {
            if (!Lampa.Controller || !activeItems.length) return;

            Lampa.Controller.add(COMPONENT, {
                toggle: function () {
                    var collection = scroll ? scroll.render() : html;
                    Lampa.Controller.collectionSet(collection);
                    Lampa.Controller.collectionFocus(activeItems[0][0], collection);
                },
                back: self.back,
                up: function () { move('up'); },
                down: function () { move('down'); },
                left: function () {
                    if (window.Navigator && Navigator.canmove && Navigator.canmove('left')) move('left');
                    else if (Lampa.Controller.toggle) Lampa.Controller.toggle('menu');
                },
                right: function () { move('right'); }
            });
            Lampa.Controller.toggle(COMPONENT);
        }
    }

    function move(direction) {
        if (window.Navigator && Navigator.move) Navigator.move(direction);
    }
