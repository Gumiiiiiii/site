# Gumi. — gumi.ch

Site portfolio personnel : une collection d'outils web et d'expérimentations (articles), en français avec bascule anglaise côté client.

## Structure

```
index.html                  Accueil
outils.html                 Liste des outils
experiments.html            Liste des expérimentations
experiments/<slug>.html     Pages d'articles. Le corps est PRÉ-RENDU dans le
                            fichier par build/prerender-articles.js depuis
                            scripts/articles-data.js (les moteurs qui n'exécutent
                            pas JS doivent voir le texte). article-page.js
                            re-rend la même chose au runtime pour la bascule FR/EN.
                            Écrire dans articles-data.js, puis `npm run build`.
experiments-template.html   Ancienne URL — simple redirection vers experiments/<slug>
tools/*.html                Un fichier par outil (traitement 100% navigateur,
                            sauf le téléchargeur de médias qui appelle l'API)
en/                         Pages anglaises GÉNÉRÉES par build/prerender-en.js
                            (ne pas éditer à la main ; committées pour Vercel)
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
npm install           # sans Python local : YOUTUBE_DL_SKIP_PYTHON_CHECK=1 npm install
npm run dev           # http://localhost:4173 — reproduit cleanUrls + le préfixe /en/ de Vercel
npm run build:all     # les deux pré-rendus ci-dessous, dans l'ordre
                      # (ne jamais nommer ce script « build » : Vercel le
                      #  détecterait et l'exécuterait au déploiement)
npm run build:articles # injecte les corps d'articles FR dans experiments/*.html
npm run build:en      # régénère en/ (pages anglaises pré-rendues pour le SEO)
npm test              # fraîcheur des deux pré-rendus + smoke test jsdom + tests de layout
node server.js     # API d'extraction en local (port 10000), nécessite yt-dlp + Python
```

## Déploiement

- **Vercel** : statique + `api/get-video.js`. `vercel.json` gère `cleanUrls` et la
  réécriture `/en/*` → `/*` — celle-ci ne sert plus que les assets partagés : les
  pages `/en/*` sont des vrais fichiers pré-rendus dans `en/` (les fichiers
  existants ont priorité sur les réécritures).
- **Render** : `server.js` sert la même API d'extraction en secours (le client
  bascule automatiquement, voir `scripts/tool-media-downloader.js`).

## Ajouter un article

1. Ajouter l'entrée (FR + EN) dans `scripts/articles-data.js`.
2. Copier une page de `experiments/` et adapter : `<title>`, meta description,
   canonical, balises OG, JSON-LD, `<h1>`, image de couverture et
   `window.GUMI_ARTICLE_SLUG`.
3. Ajouter la carte dans `experiments.html` (et l'accueil si souhaité).
4. Ajouter l'URL (FR + EN) dans `sitemap.xml` et l'item dans `feed.xml`.
5. `npm run build:en` puis committer `en/` (sinon `npm test` échoue).

## Ajouter un outil

1. Copier une page de `tools/` et son script `scripts/tool-*.js`.
2. Ajouter les clés de traduction dans `scripts/i18n.js`.
3. Ajouter la carte dans `outils.html` (et l'accueil si souhaité), plus
   l'URL (FR + EN) dans `sitemap.xml`.
4. Dans `sw.js` : ajouter la page et le script à `CORE_ASSETS` et incrémenter
   `VERSION` (sinon le badge « fonctionne hors ligne » ment).
5. `npm run build:en` puis committer `en/` (sinon `npm test` échoue).
