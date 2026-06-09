    function addStyles() {
        var existing = document.getElementById('kyivstar-tv-styles');

        if (existing && existing.getAttribute('data-build') === PLUGIN_BUILD) return;
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        var style = document.createElement('style');
        style.id = 'kyivstar-tv-styles';
        style.setAttribute('data-build', PLUGIN_BUILD);
        style.textContent = [
            '.kyivstar-tv{padding:1.4em 2.8em 3em;color:#fff;width:100%;min-height:100%;box-sizing:border-box;}',
            '.kyivstar-tv__body,.kyivstar-tv .scroll,.kyivstar-tv .scroll__body{width:100%;min-height:20em;box-sizing:border-box;}',
            '.kyivstar-tv__content{display:block;width:100%;box-sizing:border-box;}',
            '.kyivstar-tv-row{margin:0 0 2.15em;}',
            '.kyivstar-tv-row__title{font-size:1.45em;font-weight:700;line-height:1.15;margin:0 0 .7em;}',
            '.kyivstar-tv-row__body{display:flex;gap:1.1em;overflow:hidden;padding:.15em .2em .45em 0;scroll-behavior:smooth;}',
            '.kyivstar-tv__grid{display:grid;gap:1em;align-items:stretch;width:100%;max-width:86em;box-sizing:border-box;}',
            '.kyivstar-tv__grid--root{grid-template-columns:repeat(auto-fill,minmax(12em,16em));}',
            '.kyivstar-tv__grid--catalog{grid-template-columns:repeat(auto-fill,minmax(9.5em,1fr));}',
            '.kyivstar-tv-card{flex:0 0 10.8em;min-width:0;outline:0;color:#fff;transition:transform .12s ease,opacity .12s ease;}',
            '.kyivstar-tv-card.focus,.kyivstar-tv-card:focus,.kyivstar-tv-card:hover{transform:translateY(-2px);}',
            '.kyivstar-tv-card.focus .kyivstar-tv-card__thumb,.kyivstar-tv-card:focus .kyivstar-tv-card__thumb,.kyivstar-tv-card:hover .kyivstar-tv-card__thumb{box-shadow:0 0 0 .13em rgba(255,255,255,.92),0 .45em 1.1em rgba(0,0,0,.24);}',
            '.kyivstar-tv-card--locked{opacity:.55;}',
            '.kyivstar-tv-card__thumb{height:16em;background:#101820;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.05);transition:box-shadow .12s ease;}',
            '.kyivstar-tv-card__thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
            '.kyivstar-tv-card__fallback{width:3.6em;height:3.6em;border-radius:8px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.86);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.05em;}',
            '.kyivstar-tv-card__fallback svg{width:2.2em;height:2.2em;}',
            '.kyivstar-tv-card__meta{padding:.7em 0 0;}',
            '.kyivstar-tv-card__title{font-size:1em;font-weight:600;line-height:1.18;min-height:2.36em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}',
            '.kyivstar-tv-card__subtitle{font-size:.82em;color:rgba(255,255,255,.66);line-height:1.25;margin-top:.38em;min-height:1.05em;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}',
            '.kyivstar-tv-card--category{flex-basis:14.4em;background:rgba(255,255,255,.055);border-radius:8px;padding:1.1em 1.2em 1.2em;box-shadow:inset 0 0 0 1px rgba(255,255,255,.055);}',
            '.kyivstar-tv-card--category .kyivstar-tv-card__thumb{height:4.4em;background:transparent;box-shadow:none;border-radius:0;}',
            '.kyivstar-tv-card--category.focus,.kyivstar-tv-card--category:focus,.kyivstar-tv-card--category:hover{box-shadow:0 0 0 .13em rgba(255,255,255,.92),inset 0 0 0 1px rgba(255,255,255,.18);background:rgba(255,255,255,.1);}',
            '.kyivstar-tv-card--category.focus .kyivstar-tv-card__thumb,.kyivstar-tv-card--category:focus .kyivstar-tv-card__thumb,.kyivstar-tv-card--category:hover .kyivstar-tv-card__thumb{box-shadow:none;}',
            '.kyivstar-tv-card--category .kyivstar-tv-card__fallback{background:transparent;color:rgba(255,255,255,.9);font-size:1.2em;}',
            '.kyivstar-tv-card--category .kyivstar-tv-card__meta{padding-top:.75em;}',
            '.kyivstar-tv-card--category .kyivstar-tv-card__title{min-height:1.2em;font-size:1.05em;}',
            '.kyivstar-tv__message{padding:1em 1.2em;border-radius:8px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);display:inline-block;}',
            '.kyivstar-tv__message--error{border:1px solid rgba(255,86,86,.7);color:#ffb8b8;}',
            '@media(max-width:720px){.kyivstar-tv{padding:1.1em}.kyivstar-tv-row__title{font-size:1.2em}.kyivstar-tv-row__body{gap:.75em}.kyivstar-tv-card{flex-basis:8.8em}.kyivstar-tv-card__thumb{height:13em}.kyivstar-tv-card--category{flex-basis:12em}.kyivstar-tv-card--category .kyivstar-tv-card__thumb{height:3.8em}.kyivstar-tv__grid{grid-template-columns:repeat(auto-fill,minmax(8.8em,1fr));gap:.75em}}'
        ].join('');
        document.head.appendChild(style);
    }
