    function showCatalogFilterMenu(route, api) {
        if (!Lampa.Select || !Lampa.Select.show) {
            notify('Lampa Select API is not available.');
            return;
        }

        Promise.all([
            api.getFilters(null).catch(function (error) {
                debugLog('warn', 'filters:list:error', { error: error.message || String(error) });
                return [];
            }),
            api.getSortElements().catch(function (error) {
                debugLog('warn', 'filters:sort:error', { error: error.message || String(error) });
                return [];
            })
        ]).then(function (data) {
            var groups = normalizeFilterGroups(data[0]);
            var sorts = normalizeSortElements(data[1]);
            var items = [
                { title: 'Розпочати пошук', action: 'apply' },
                { title: 'Скинути фільтри', action: 'reset' },
                { title: 'Сортування: ' + (route.sortName || 'Не вибрано'), action: 'sort', values: sorts }
            ];

            groups.forEach(function (group) {
                items.push({
                    title: group.title + ': ' + selectedFilterTitle(route, group),
                    action: 'filter',
                    group: group
                });
            });

            Lampa.Select.show({
                title: 'Фільтр',
                items: items,
                onSelect: function (item) {
                    if (item.action === 'apply') {
                        pushRoute(copyRoute(route, { offset: 0 }), routeTitle(route));
                    } else if (item.action === 'reset') {
                        pushRoute(copyRoute(route, { offset: 0, filters: [], filterMap: {}, sort: null, sortName: '' }), routeTitle(route));
                    } else if (item.action === 'sort') {
                        showSortSelect(route, sorts, api);
                    } else if (item.action === 'filter') {
                        showFilterValueSelect(route, item.group, api);
                    }
                },
                onBack: function () {
                    if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle(COMPONENT);
                }
            });
        });
    }

    function showSortSelect(route, sorts, api) {
        var items = [{ title: (route.sort ? '' : '* ') + 'Не вибрано', id: null, name: '' }];

        sorts.forEach(function (sort) {
            items.push({
                title: (sort.id === route.sort ? '* ' : '') + sort.title,
                id: sort.id,
                name: sort.title
            });
        });

        Lampa.Select.show({
            title: 'Сортування',
            items: items,
            onSelect: function (item) {
                pushRoute(copyRoute(route, {
                    offset: 0,
                    sort: item.id || null,
                    sortName: item.name || ''
                }), routeTitle(route));
            },
            onBack: function () {
                showCatalogFilterMenu(route, api);
            }
        });
    }

    function showFilterValueSelect(route, group, api) {
        var selected = selectedFilterId(route, group);
        var items = [{ title: (!selected ? '* ' : '') + 'Не вибрано', id: null, name: '' }];

        group.items.forEach(function (value) {
            items.push({
                title: (value.id === selected ? '* ' : '') + value.title,
                id: value.id,
                name: value.title
            });
        });

        Lampa.Select.show({
            title: group.title,
            items: items,
            onSelect: function (item) {
                var filterMap = merge({}, route.filterMap || {});
                var filterNames = merge({}, route.filterNames || {});
                var filters;

                if (item.id) {
                    filterMap[group.id] = item.id;
                    filterNames[group.id] = item.name;
                } else {
                    delete filterMap[group.id];
                    delete filterNames[group.id];
                }

                filters = objectValues(filterMap).filter(Boolean);

                pushRoute(copyRoute(route, {
                    offset: 0,
                    filters: filters,
                    filterMap: filterMap,
                    filterNames: filterNames
                }), routeTitle(route));
            },
            onBack: function () {
                showCatalogFilterMenu(route, api);
            }
        });
    }

    function selectedFilterId(route, group) {
        var map = route.filterMap || {};
        return map[group.id] || '';
    }

    function selectedFilterTitle(route, group) {
        var id = selectedFilterId(route, group);
        var names = route.filterNames || {};
        var found = null;
        var i;

        if (!id) return 'Не вибрано';
        if (names[group.id]) return names[group.id];

        for (i = 0; i < group.items.length; i++) {
            if (group.items[i].id === id) {
                found = group.items[i];
                break;
            }
        }

        return found ? found.title : 'Вибрано';
    }

    function activeFilterSummary(route) {
        var names = route.filterNames ? objectValues(route.filterNames).filter(Boolean) : [];
        var parts = [];

        if (route.sortName) parts.push(route.sortName);
        if (names.length) parts = parts.concat(names.slice(0, 2));
        if (names.length > 2) parts.push('+' + (names.length - 2));

        return parts.length ? parts.join(' / ') : 'Фільтри і сортування';
    }

    function normalizeFilterGroups(response) {
        return asArray(response).map(function (group) {
            var id = group.id || group.filterId || group.type || group.name || group.title;
            var items = arrayFromAny(group.filterElements || group.elements || group.items || group.values || group.options);

            return {
                id: String(id || ''),
                title: group.displayName || group.name || group.title || 'Фільтр',
                items: normalizeFilterValues(items)
            };
        }).filter(function (group) {
            return group.id && group.items.length;
        });
    }

    function normalizeFilterValues(values) {
        return asArray(values).map(function (value) {
            var id = value.id || value.filterElementId || value.elementId || value.value;
            var title = value.displayName || value.name || value.title || value.label || value.value;

            return {
                id: String(id || ''),
                title: String(title || id || '')
            };
        }).filter(function (item) {
            return item.id && item.title;
        });
    }

    function normalizeSortElements(response) {
        return asArray(response).map(function (sort) {
            var id = sort.id || sort.filterSortElementId || sort.elementId || sort.value;
            var title = sort.displayName || sort.name || sort.title || sort.label || sort.value;

            return {
                id: String(id || ''),
                title: String(title || id || '')
            };
        }).filter(function (sort) {
            return sort.id && sort.title;
        });
    }
