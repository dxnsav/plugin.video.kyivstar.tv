# Lampa plugin source

`plugin.kyivstar.tv/main.js` is the single file loaded by Lampa. Do not edit it directly unless you are making an emergency hotfix.

Edit the source fragments in this directory, then rebuild:

```bash
npm run build:lampa
npm run check:lampa
```

The build script concatenates files in the explicit order listed in `scripts/build-lampa-plugin.js` and wraps them in one IIFE.

## File map

- `state.js` - constants, shared state, storage keys.
- `bootstrap.js` - startup flow and plugin initialization.
- `settings-registration.js` - Lampa settings registration.
- `lampa-integration.js` - menu, activity and global Lampa integration.
- `native-source.js` - native Lampa source rows, lists and full cards.
- `search-source.js` - Kyivstar search UI/data flow.
- `settings-menu.js` - Kyivstar TV settings screen and diagnostics actions.
- `routes-and-mappers.js` - shared asset/card mappers and legacy route helpers.
- `auth-and-playback.js` - login/session and playback entry points.
- `api-client.js` - Kyivstar API client methods.
- `utils.js` - generic helpers.
