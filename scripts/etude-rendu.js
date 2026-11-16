// Ce qu'une page d'expérimentation dérive de scripts/articles-data.js, écrit
// une seule fois : le temps de lecture, le pied du résumé (lire la suite,
// faire résumer par une IA) et les cartes des autres expérimentations.
//
// Trois lecteurs : scripts/article-page.js dans le navigateur, et les deux
// scripts de build (build/prerender-articles.js pour le français,
// build/prerender-en.js pour l'anglais), qui l'évaluent dans jsdom. Il ne
// touche donc pas au DOM : il rend des chaînes.
(function (racine) {
    var MOTS_PAR_MINUTE = 220;

    var T = {
        fr: {
            lecture: 'min de lecture',
            lire: 'Lire l’histoire en entier',
            resumer: 'Résumer avec',
            invite: 'Résume en cinq points clés cet article de Pierre (gumi.ch) : '
        },
        en: {
            lecture: 'min read',
            lire: 'Read the full story',
            resumer: 'Summarise with',
            invite: 'Summarise this article by Pierre (gumi.ch) in five key points: '
        }
    };

    // Trois assistants, chacun ouvert sur une conversation déjà remplie. Les
    // liens partent du site : la page ne charge rien de chez eux.
    var IA = [
        ['ChatGPT', 'https://chatgpt.com/?q='],
        ['Claude', 'https://claude.ai/new?q='],
        ['Perplexity', 'https://www.perplexity.ai/search?q=']
    ];

    function echapper(t) {
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function duree(article, lang) {
        var texte = (article.html && article.html[lang] || '').replace(/<[^>]+>/g, ' ');
        var mots = texte.split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(mots / MOTS_PAR_MINUTE)) + ' ' + T[lang].lecture;
    }

    function adresse(slug, lang) {
        return 'https://gumi.ch' + (lang === 'en' ? '/en' : '') + '/experiments/' + slug;
    }

    // Le pied du résumé : à gauche, descendre vers le texte ; à droite, le
    // confier à une IA.
    function pied(slug, lang) {
        var t = T[lang];
        var q = encodeURIComponent(t.invite + adresse(slug, lang));
        var liens = IA.map(function (ia) {
            return '<a href="' + ia[1] + q + '" target="_blank" rel="noopener">' + ia[0] + '</a>';
        }).join('');
        return '<div class="resume-pied">'
            + '<a class="resume-lire" href="#post-content">' + t.lire
            + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg></a>'
            + '<p class="resume-ia"><span>' + t.resumer + '</span>' + liens + '</p>'
            + '</div>';
    }

    // Le résumé complet : celui des données, son pied en plus.
    function resume(articles, slug, lang) {
        var a = articles[slug];
        var html = a && a.abstract && a.abstract[lang];
        if (!html) return '';
        var fin = html.lastIndexOf('</section>');
        return fin < 0 ? html : html.slice(0, fin) + pied(slug, lang) + html.slice(fin);
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
