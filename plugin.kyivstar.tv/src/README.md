# Lampa plugin source

`plugin.kyivstar.tv/main.js` is the single file loaded by Lampa. Do not edit it directly unless you are making an emergency hotfix.

Edit the source fragments in this directory, then rebuild:

```bash
npm run build:lampa
npm run check:lampa
```

The build script reads `plugin.kyivstar.tv/i18n/*.json`, inlines those dictionaries into `main.js`, concatenates files in the explicit order listed in `scripts/build-lampa-plugin.js`, and wraps everything in one IIFE.

## Localization

User-facing strings live in:

- `plugin.kyivstar.tv/i18n/en.json`
- `plugin.kyivstar.tv/i18n/ru.json`
- `plugin.kyivstar.tv/i18n/uk.json`

Use `t('key')` in source files. Keep the same keys in every locale file. Lampa still loads one built `main.js`; there are no runtime locale fetches.

## File map

- `state.js` - constants, shared state, storage keys.
- `i18n.js` - locale detection and dictionary lookup.
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
