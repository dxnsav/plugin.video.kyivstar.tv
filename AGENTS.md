# Repository Instructions

This repository contains the Kyivstar TV integration for Lampa, plus older Kodi-era files that may still exist in the tree. Current user-facing work is focused on the Lampa plugin under `plugin.kyivstar.tv/`.

## Primary Workflow

- Edit source fragments in `plugin.kyivstar.tv/src/`.
- Edit translations in `plugin.kyivstar.tv/i18n/`.
- Do not manually patch `plugin.kyivstar.tv/main.js` for normal changes. It is generated.
- Rebuild after source or i18n edits:

```bash
npm run build:lampa
```

- Validate generated JavaScript:

```bash
npm run check:lampa
```

- Commit both the edited source files and regenerated `plugin.kyivstar.tv/main.js`.

## Lampa Plugin Notes

- Public install URL:

```text
https://dxnsav.github.io/plugin.video.kyivstar.tv/plugin.kyivstar.tv/main.js
```

- The plugin exposes `window.KyivstarTVPlugin` debug helpers such as `logs()`, `clearLogs()`, `catalogDebug(...)`, and `dumpSeasons(...)`.
- Keep Lampa UI behavior native where possible: native search source, native full-card screen, native season/episode views, and Lampa activity/navigation conventions.
- Kyivstar TV playback is account/subscription based. Do not describe or implement this as piracy bypass.
- Be careful with event handlers on full-card buttons. Duplicate binding can open multiple players or refresh the card instead of playing.
- For series, prefer Kyivstar TV API season/episode data. Do not display fake `0 episodes` when the API only confirms season count.

## Source Layout

- `plugin.kyivstar.tv/src/api-client.js` - Kyivstar TV API transport and API methods.
- `plugin.kyivstar.tv/src/auth-and-playback.js` - login/session/playback flow.
- `plugin.kyivstar.tv/src/native-source.js` - Lampa source/full-card integration.
- `plugin.kyivstar.tv/src/search-source.js` - native Lampa search source.
- `plugin.kyivstar.tv/src/settings-registration.js` and `settings-menu.js` - settings UI.
- `plugin.kyivstar.tv/src/catalog-component.js` and `catalog-filter-menu.js` - catalog/filter UI.
- `plugin.kyivstar.tv/src/i18n.js` plus `plugin.kyivstar.tv/i18n/*.json` - localization.
- `plugin.kyivstar.tv/src/styles.js` - injected CSS.
- `scripts/build-lampa-plugin.js` - build script that assembles `main.js`.

See `plugin.kyivstar.tv/src/README.md` for the detailed file map.

## Coding Guidance

- Prefer existing Lampa and plugin patterns over new abstractions.
- Keep changes scoped to the user request.
- Use structured parsing and explicit mapping for Kyivstar TV API responses.
- Keep user-visible strings in i18n JSON files.
- When adding debug code, keep it behind `KyivstarTVPlugin` helpers or plugin logs.
- Use `rg` for searches.
- Do not revert user changes or unrelated dirty worktree files.

## Documentation Lookup

If the user asks about a library, framework, SDK, API, CLI tool, or cloud service, use Context7 documentation lookup first, following the workspace instructions. Do not use Context7 for ordinary repo refactoring or business-logic debugging.
