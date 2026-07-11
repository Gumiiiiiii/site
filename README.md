# Gumi. — gumi.ch

Site portfolio personnel : une collection d'outils web et d'expérimentations (articles), en français avec bascule anglaise côté client.

## Structure

```
index.html                  Accueil
outils.html                 Liste des outils
experiments.html            Liste des expérimentations
experiments/<slug>.html     Pages d'articles statiques (SEO), contenu rendu par
                            scripts/article-page.js depuis scripts/articles-data.js
experiments-template.html   Ancienne URL — simple redirection vers experiments/<slug>
tools/*.html                Un fichier par outil (traitement 100% navigateur,
                            sauf le téléchargeur de médias qui appelle l'API)
api/get-video.js            Fonction Vercel (extraction de médias via yt-dlp)
api/_lib/extract.cjs        Logique partagée entre la fonction Vercel et server.js
server.js                   Même API en serveur Express autonome (Render)
scripts/                    JS par page + i18n.js (dictionnaire FR/EN) + vendor/
styles/                     shared.css (global), tools-suite.css, article.css
fonts/                      Urbanist variable (auto-hébergée)
media/                      Images, favicon, texture
```

## Développement

```
npm install        # sans Python local : YOUTUBE_DL_SKIP_PYTHON_CHECK=1 npm install
npm run dev        # http://localhost:4173 — reproduit cleanUrls + le préfixe /en/ de Vercel
npm test           # smoke test jsdom : charge chaque page, échoue sur erreur JS
node server.js     # API d'extraction en local (port 10000), nécessite yt-dlp + Python
```

## Déploiement

- **Vercel** : statique + `api/get-video.js`. `vercel.json` gère `cleanUrls` et la
  réécriture `/en/*` → `/*` (la langue est appliquée côté client via localStorage).
- **Render** : `server.js` sert la même API d'extraction en secours (le client
  bascule automatiquement, voir `scripts/tool-media-downloader.js`).

## Ajouter un article

1. Ajouter l'entrée (FR + EN) dans `scripts/articles-data.js`.
2. Copier une page de `experiments/` et adapter : `<title>`, meta description,
   canonical, balises OG, JSON-LD, `<h1>`, image de couverture et
   `window.GUMI_ARTICLE_SLUG`.
3. Ajouter la carte dans `experiments.html` (et l'accueil si souhaité).
4. Ajouter l'URL dans `sitemap.xml`.

## Ajouter un outil

1. Copier une page de `tools/` et son script `scripts/tool-*.js`.
2. Ajouter les clés de traduction dans `scripts/i18n.js`.
3. Ajouter la carte dans `outils.html` (et l'accueil si souhaité), plus `sitemap.xml`.
