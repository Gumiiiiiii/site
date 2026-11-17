// Ce qu'une page d'expérimentation dérive de scripts/articles-data.js, écrit
// une seule fois : le temps de lecture, le résumé et les cartes des autres
// expérimentations.
//
// Trois lecteurs : scripts/article-page.js dans le navigateur, et les deux
// scripts de build (build/prerender-articles.js pour le français,
// build/prerender-en.js pour l'anglais), qui l'évaluent dans jsdom. Il ne
// touche donc pas au DOM : il rend des chaînes.
(function (racine) {
    var MOTS_PAR_MINUTE = 220;

    var T = { fr: { lecture: 'min de lecture' }, en: { lecture: 'min read' } };

    function echapper(t) {
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function duree(article, lang) {
        var texte = (article.html && article.html[lang] || '').replace(/<[^>]+>/g, ' ');
        var mots = texte.split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(mots / MOTS_PAR_MINUTE)) + ' ' + T[lang].lecture;
    }

    function resume(articles, slug, lang) {
        var a = articles[slug];
        return (a && a.abstract && a.abstract[lang]) || '';
    }

    // Les autres expérimentations : celle qui fait suite d'abord, puis les
    // autres, de la plus récente à la plus ancienne.
    function autres(articles, slug) {
        var a = articles[slug] || {};
        var liste = Object.keys(articles).filter(function (k) { return k !== slug && k !== a.readNext; });
        liste.sort(function (x, y) { return (articles[y].published || '').localeCompare(articles[x].published || ''); });
        if (a.readNext && articles[a.readNext]) liste.unshift(a.readNext);
        return liste.slice(0, 3);
    }

    function cartes(articles, slug, lang) {
        return autres(articles, slug).map(function (k, i) {
            var n = articles[k];
            return '<a class="read-next-card" href="' + k + '"' + (i === 0 ? ' id="read-next-link"' : '') + '>'
                + '<div class="card-image"><img src="' + echapper(n.cover) + '" alt="' + echapper(n.coverAlt || n.title[lang]) + '" loading="lazy"></div>'
                + '<div class="card-content"><h3 class="card-title">' + echapper(n.title[lang]) + '</h3>'
                + '<p class="card-desc">' + echapper(n.excerpt[lang]) + '</p></div></a>';
        }).join('');
    }

    racine.GumiEtude = { duree: duree, resume: resume, cartes: cartes, autres: autres };
})(typeof window !== 'undefined' ? window : this);
