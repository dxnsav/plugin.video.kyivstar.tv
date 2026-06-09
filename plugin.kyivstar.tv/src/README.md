# Lampa plugin source

`plugin.kyivstar.tv/main.js` is the single file loaded by Lampa. Do not edit it directly unless you are making an emergency hotfix.

Edit the source fragments in this directory, then rebuild:

```bash
npm run build:lampa
npm run check:lampa
```

The build script concatenates `*.js` files in lexicographic order and wraps them in one IIFE.

## File map

- `00-state.js` - constants, shared state, storage keys.
- `10-boot.js` - startup flow and plugin initialization.
- `20-settings-registration.js` - Lampa settings registration.
- `30-lampa-integration.js` - menu, activity and global Lampa integration.
- `40-native-source.js` - native source/search hooks.
- `50-search.js` - Kyivstar search UI/data flow.
- `55-settings-menu.js` - Kyivstar TV settings screen and diagnostics actions.
- `56-filter-menu.js` - Kyivstar filter and sort menu.
- `60-custom-component.js` - custom Lampa component and page rendering.
- `70-routes-mappers.js` - route handlers and asset/card mappers.
- `80-auth-playback.js` - login/session and playback entry points.
- `90-api.js` - Kyivstar API client methods.
- `95-utils.js` - generic helpers.
- `99-styles.js` - injected CSS.
