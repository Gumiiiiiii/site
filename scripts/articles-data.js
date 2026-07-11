// Article content for the experiments template page.
// Each article provides its full content in both languages; the template
// (article-page.js) renders the right one and re-renders on language switch.
window.GUMI_ARTICLES = {

    'ardacraft': {
        cover: '/media/ardacraft-redesign-featured-image.webp',
        coverAlt: 'Aperçu de la refonte du site ArdaCraft',
        readNext: 'ai-photoshoot',
        title: {
            fr: "Refonte d'ArdaCraft : forger une Terre du Milieu numérique moderne et inclusive",
            en: 'ArdaCraft Redesign: Forging a Modern, Inclusive Digital Middle-earth'
        },
        excerpt: {
            fr: "Nouvelle identité visuelle, accessibilité WCAG et migration vers une infrastructure statique moderne pour le wiki de la communauté ArdaCraft.",
            en: 'A new visual identity, WCAG accessibility and a migration to a modern static infrastructure for the ArdaCraft community wiki.'
        },
        html: {
            fr: `
            <div class="abstract">
                <p><strong>Refonte visuelle totale</strong> pour aligner l'identité de la marque à l'échelle épique et à l'atmosphère immersive exceptionnelle du projet.</p>
                <p><strong>100% de conformité WCAG</strong> atteinte grâce à une refonte de l'architecture privilégiant une accessibilité web inclusive et sans compromis.</p>
                <p><strong>-90% de coûts mensuels</strong> et un temps de chargement <strong>81% plus rapide</strong> accomplis via la transition vers une infrastructure statique moderne (Jamstack).</p>
            </div>

            <h2>L'aube d'une nouvelle ère numérique pour ArdaCraft</h2>
            <p>Depuis des années, le projet ArdaCraft est une réussite monumentale de la construction numérique, recréant méticuleusement les vastes paysages de la <a href="https://ardacraft.me/" target="_blank">Terre du Milieu de J.R.R. Tolkien</a> avec un niveau de précision historique et géographique sans précédent. Pourtant, alors que notre monde en jeu continuait d'évoluer et de s'étendre vers de nouveaux territoires époustouflants, notre présence web restait figée dans une époque révolue. Le site, premier point de contact pour des milliers de bâtisseurs potentiels, de passionnés de lore et de curieux, était devenu visuellement daté, structurellement lourd et frustrant à maintenir. Il était temps d'une refonte complète — repartir de zéro pour élever notre identité de marque tout en corrigeant des défauts structurels qui épuisaient silencieusement nos ressources et éloignaient les utilisateurs.</p>

            <h2>Réinventer l'identité de marque</h2>
            <p>Le langage visuel de notre ancien site ne parvenait pas à transmettre la grandeur et le dévouement inhérents à la mission d'ArdaCraft. Dès leur arrivée sur la page d'accueil, les visiteurs devraient sentir les vents glacés des Monts Brumeux ou la chaleur accueillante d'un foyer de la Comté. Pour y parvenir, notre équipe de design a opéré un virage esthétique majeur. Nous avons abandonné les textures web lourdes et surchargées du début des années 2010 au profit d'une interface épurée, immersive et parfaitement responsive. En utilisant des <a href="#gallery">photographies en jeu haute résolution</a> comme bannières panoramiques, associées à un système typographique soigné mariant des titres classiques à empattements et un corps de texte sans-serif très lisible, nous avons créé un environnement à la fois légendaire et résolument moderne. Cette nouvelle hiérarchie visuelle place immédiatement au premier plan nos actualités essentielles, nos captures d'écran spectaculaires et les projecteurs sur la communauté.</p>

            <figure class="image-breakout">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" alt="Mise en page large">
                <figcaption>Une mise en page large qui casse le rythme du texte pour plus d'impact visuel.</figcaption>
            </figure>

            <h3>Typographie et hiérarchie visuelle</h3>
            <p>Pour vraiment éprouver la fluidité du texte sur différentes tailles d'écran, il est essentiel d'utiliser des blocs variés. Nous avons mis en place une grille CSS robuste qui laisse le texte respirer, avec des interlignages généreux et des marges adaptées. L'introduction de lettrines thématiques et d'accents <em>italiques</em> subtils guide l'œil du lecteur à travers les longues mises à jour de lore et les tutoriels de construction complexes, sans fatigue cognitive.</p>

            <blockquote>
                <p>« Notre objectif n'était pas seulement de faire un joli site ; nous voulions que l'architecture numérique de notre présence web reflète l'intégrité structurelle et la beauté des cités majestueuses que nous construisons en jeu. Chaque pixel, comme chaque bloc, doit servir un dessein délibéré. »</p>
                <footer>— L'équipe de développement web d'ArdaCraft</footer>
            </blockquote>

            <h2>Défendre l'accessibilité pour tous les aventuriers</h2>
            <p>À mesure que notre communauté devenait une communauté mondiale, nous avons pris conscience de l'importance vitale de l'inclusivité numérique. Explorer nos recréations détaillées de la Terre du Milieu devrait être une expérience ouverte à absolument tout le monde, quelles que soient les capacités physiques de chacun ou sa manière de naviguer sur le web. Lors de notre phase d'audit, nous avons découvert que notre ancien framework manquait cruellement de conformité aux <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank">Web Content Accessibility Guidelines (WCAG)</a>. Les lecteurs d'écran peinaient à interpréter nos tableaux imbriqués, et notre palette de couleurs échouait souvent aux tests de contraste élémentaires.</p>
            <p>Pour y remédier, nous avons reconstruit le DOM en nous appuyant strictement sur des balises HTML5 sémantiques. Nous avons instauré des standards de contraste rigoureux garantissant une lisibilité nette du texte sur les éléments de fond, et introduit une prise en charge complète de la navigation au clavier. Voici les piliers de notre initiative d'accessibilité :</p>

            <ul>
                <li><strong>Structure sémantique :</strong> remplacer les <code>&lt;div&gt;</code> ambiguës par des repères <code>&lt;article&gt;</code>, <code>&lt;section&gt;</code> et <code>&lt;nav&gt;</code> appropriés.</li>
                <li><strong>Labels ARIA et textes alternatifs :</strong> garantir que chaque média, des grandes galeries aux plus petites icônes d'interface, comporte un texte descriptif pour les technologies d'assistance.</li>
                <li><strong>États de focus :</strong> concevoir des anneaux de focus très visibles et esthétiques pour que les utilisateurs au clavier ne perdent jamais leur position sur la page.</li>
            </ul>

            <h2>Le chantier technique : réduire drastiquement les coûts d'infrastructure</h2>
            <p>Le triomphe le plus monumental — quoique invisible — de cette refonte est sans doute la restructuration complète de notre architecture back-end. Notre ancien système reposait sur un CMS monolithique hébergé sur des serveurs privés virtuels fonctionnant en permanence. Cette approche était extrêmement gourmande : nous payions une capacité de calcul maximale 24h/24, même en période de faible trafic. De plus, les requêtes en base nécessaires au chargement d'une seule page riche en images haute résolution provoquaient d'importants problèmes de latence, en particulier pour nos utilisateurs internationaux.</p>
            <p>La solution fut un changement de paradigme vers une <a href="https://jamstack.org/" target="_blank">architecture Jamstack</a> moderne. En découplant la couche de présentation front-end de la base de données back-end, nous avons pu pré-générer l'intégralité du site en fichiers statiques HTML, CSS et JavaScript. Ces ressources optimisées ont ensuite été déployées sur un CDN mondial. Les résultats de cette migration furent spectaculaires : des pages considérablement plus rapides et une infrastructure serveur enfin soulagée.</p>

            <figure>
                <img src="https://images.unsplash.com/photo-1461800919507-79b1673d4615" alt="Un ordinateur portable affichant du code" width="100%">
                <figcaption>La transition vers un générateur de site statique nous permet de servir les pages mondialement, sans aucune base de données.</figcaption>
            </figure>

            <h3>Détail de la réduction des coûts</h3>
            <p>L'impact financier de ce pivot technique a été profondément transformateur pour notre projet bénévole. En éliminant le besoin de serveurs de base de données toujours actifs et en passant à des fichiers statiques hébergés en périphérie, nous avons obtenu une réduction stupéfiante de <strong>90%</strong> de nos coûts mensuels d'infrastructure web. Les fonds auparavant brûlés en cycles serveurs inefficaces peuvent désormais être réinvestis directement dans le projet : de meilleurs serveurs de jeu, des développements sur mesure et des événements communautaires.</p>

            <table>
                <thead>
                    <tr>
                        <th>Métrique</th>
                        <th>Architecture héritée</th>
                        <th>Nouvelle architecture statique</th>
                        <th>Amélioration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Temps de chargement moyen</td>
                        <td>4,2 secondes</td>
                        <td>0,8 seconde</td>
                        <td>81% plus rapide</td>
                    </tr>
                    <tr>
                        <td>Coût d'infrastructure mensuel</td>
                        <td>Indice de base (100%)</td>
                        <td>Indice optimisé (10%)</td>
                        <td><strong>-90%</strong></td>
                    </tr>
                    <tr>
                        <td>Fiabilité (uptime)</td>
                        <td>98,5%</td>
                        <td>99,99%</td>
                        <td>Stabilité accrue</td>
                    </tr>
                </tbody>
            </table>

            <h4>Un aperçu de la magie</h4>
            <p>Pour les développeurs de notre communauté, la transition a signifié des configurations bien plus propres, orientées build. Au lieu de lutter avec des règles de cache serveur complexes, notre pipeline de déploiement ressemble désormais à ce script simplifié :</p>

            <pre><code>// Exemple de script de build et de déploiement
const buildSite = async () => {
  console.log("Récupération du lore et des galeries...");
  const data = await fetchCMSData();

  console.log("Génération des pages HTML statiques...");
  generatePages(data);

  console.log("Déploiement sur le CDN. 90% d'économies sécurisées !");
};

buildSite();</code></pre>

            <h2>Regarder vers l'horizon</h2>
            <p>Le lancement de ce site repensé n'est pas un aboutissement, mais une nouvelle fondation. Avec une image de marque qui impose le respect, une interface accessible qui accueille tout le monde et un back-end optimisé qui garantit notre pérennité financière, ArdaCraft est mieux positionné que jamais pour poursuivre sa construction historique. Nous vous invitons à explorer les nouvelles galeries, à parcourir les pages de lore mises à jour et à découvrir la vitesse et la clarté de notre nouveau foyer numérique. La route se poursuit sans fin, et nous sommes ravis que vous la parcouriez avec nous.</p>
            `,
            en: `
            <div class="abstract">
                <p><strong>Complete visual overhaul</strong> to align the brand identity with the epic scale and exceptional immersive atmosphere of the project.</p>
                <p><strong>100% WCAG compliance</strong> achieved through an architecture redesign prioritizing inclusive, uncompromising web accessibility.</p>
                <p><strong>-90% monthly costs</strong> and an <strong>81% faster</strong> load time accomplished through the transition to a modern static infrastructure (Jamstack).</p>
            </div>

            <h2>The Dawn of a New Digital Age for ArdaCraft</h2>
            <p>For years, the ArdaCraft project has stood as a monumental achievement in digital block-building, meticulously recreating the vast and sweeping landscapes of <a href="https://ardacraft.me/" target="_blank">J.R.R. Tolkien’s Middle-earth</a> with an unprecedented level of historical and geographical accuracy. However, while our in-game world continued to evolve and expand into breathtaking new territories, our primary web presence was slowly being left behind in a bygone era. The website, which serves as the very first touchpoint for thousands of prospective builders, lore enthusiasts, and curious wanderers, had grown visually dated, structurally unwieldy, and frustratingly difficult to maintain. It was time for a comprehensive overhaul—a complete redesign from the ground up that would not only elevate our brand identity but also address critical structural flaws that had been silently draining our resources and alienating users.</p>

            <h2>Reimagining the Brand Identity</h2>
            <p>The visual language of our previous website failed to communicate the sheer grandeur and dedication inherent to the ArdaCraft mission. When users first arrive on our homepage, they should immediately feel the cold winds of the Misty Mountains or the welcoming warmth of a Shire hearth. To achieve this, our design team embarked on a massive aesthetic pivot. We stripped away the cluttered, heavy web textures of the early 2010s in favor of a sleek, immersive, and highly responsive interface. By utilizing <a href="#gallery">high-resolution in-game photography</a> as sweeping hero banners, coupled with a carefully curated typography system that pairs classical, serif headers with clean, highly legible sans-serif body text, we have created an environment that feels both legendary and thoroughly modern. This new visual hierarchy ensures that our most critical updates, breathtaking screenshots, and community spotlights are immediately front and center.</p>

            <figure class="image-breakout">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" alt="Premium Wide Showcase">
                <figcaption>A wide layout that breaks the rhythm of the text for greater visual impact.</figcaption>
            </figure>

            <h3>Typography and Visual Hierarchy</h3>
            <p>To truly test how text flows across different screen sizes, it is essential to utilize varied block elements. We implemented a robust CSS grid system that allows text to breathe, utilizing generous line heights and appropriate padding. The introduction of thematic drop caps and subtle <em>italicized</em> accents helps guide the reader's eye through lengthy lore updates and complex building tutorials without inducing cognitive fatigue.</p>

            <blockquote>
                <p>"Our goal wasn't just to make a pretty website; we wanted the digital architecture of our web presence to mirror the structural integrity and beauty of the majestic cities we construct in-game. Every pixel, much like every block, must serve a deliberate purpose."</p>
                <footer>— The ArdaCraft Web Development Team</footer>
            </blockquote>

            <h2>Championing Accessibility for All Adventurers</h2>
            <p>As our community has grown into a global fellowship, we have come to recognize the vital importance of digital inclusivity. Exploring our detailed recreations of Middle-earth is an experience that should be open to absolutely everyone, regardless of their physical abilities or how they navigate the web. During our auditing phase, we discovered that our previous framework was severely lacking in basic <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank">Web Content Accessibility Guidelines (WCAG)</a> compliance. Screen readers struggled to parse our nested tables, and our color palette often failed basic contrast checks.</p>
            <p>To rectify this, we rebuilt the Document Object Model (DOM) to strictly rely on semantic HTML5 tags. We implemented rigorous contrast standards ensuring that text stands out crisply against background elements, and we introduced comprehensive keyboard navigation support. Here are the core pillars of our accessibility initiative:</p>

            <ul>
                <li><strong>Semantic Structuring:</strong> Replacing ambiguous <code>&lt;div&gt;</code> tags with appropriate <code>&lt;article&gt;</code>, <code>&lt;section&gt;</code>, and <code>&lt;nav&gt;</code> landmarks.</li>
                <li><strong>Aria Labels and Alt Text:</strong> Ensuring every single piece of media, from massive gallery showcases to tiny UI icons, includes descriptive text for assistive technologies.</li>
                <li><strong>Focus States:</strong> Designing highly visible, aesthetically pleasing focus rings so keyboard-only users never lose track of their position on the page.</li>
            </ul>

            <h2>The Technical Journey: Slashing Infrastructure Costs</h2>
            <p>Perhaps the most monumental, albeit invisible, triumph of this redesign is the complete restructuring of our backend architecture. Our legacy system relied on a monolithic content management system hosted on traditional, persistently running virtual private servers. This approach was incredibly resource-intensive; we were paying for maximum compute capacity 24/7, even during low-traffic periods. Furthermore, the database queries required to load a single page with multiple high-resolution images were causing massive latency issues, especially for our international users.</p>
            <p>The solution was a paradigm shift toward a modern <a href="https://jamstack.org/" target="_blank">Jamstack architecture</a>. By decoupling our frontend presentation layer from our backend database, we could pre-render the entire website into static HTML, CSS, and JavaScript files. We then deployed these highly optimized static assets across a global Content Delivery Network (CDN). The results of this migration were nothing short of spectacular, dramatically increasing page load speeds while simultaneously unburdening our server infrastructure.</p>

            <figure>
                <img src="https://images.unsplash.com/photo-1461800919507-79b1673d4615" alt="A laptop showing lines of code" width="100%">
                <figcaption>Transitioning to a static site generator allowed us to serve pages globally with zero database overhead.</figcaption>
            </figure>

            <h3>Cost Reduction Breakdown</h3>
            <p>The financial impact of this technical pivot has been deeply transformative for our volunteer-run project. By eliminating the need for robust, always-on database servers and transitioning to edge-hosted static files, we achieved a staggering <strong>90% reduction</strong> in our monthly web infrastructure costs. This means that funds previously burned on inefficient server cycles can now be reallocated directly into the project—funding better game servers, commissioning custom development, and hosting community events.</p>

            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Legacy Architecture</th>
                        <th>New Static Architecture</th>
                        <th>Improvement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Average Page Load Time</td>
                        <td>4.2 Seconds</td>
                        <td>0.8 Seconds</td>
                        <td>81% Faster</td>
                    </tr>
                    <tr>
                        <td>Monthly Infrastructure Cost</td>
                        <td>Base Index (100%)</td>
                        <td>Optimized Index (10%)</td>
                        <td><strong>90% Decrease</strong></td>
                    </tr>
                    <tr>
                        <td>Uptime Reliability</td>
                        <td>98.5%</td>
                        <td>99.99%</td>
                        <td>Higher Stability</td>
                    </tr>
                </tbody>
            </table>

            <h4>A Snippet of the Magic</h4>
            <p>For the developers in our community, the transition meant writing much cleaner, build-focused configurations. Instead of wrestling with complex server-side caching rules, our deployment pipeline now looks something as elegant as this simplified script:</p>

            <pre><code>// Example build and deploy script
const buildSite = async () => {
  console.log("Fetching latest lore and gallery data...");
  const data = await fetchCMSData();

  console.log("Generating static HTML pages...");
  generatePages(data);

  console.log("Deploying to Edge CDN. 90% cost savings secured!");
};

buildSite();</code></pre>

            <h2>Looking Toward the Horizon</h2>
            <p>The launch of this redesigned website is not an endpoint, but rather a new foundation. With a brand image that commands respect, an accessible interface that welcomes all, and an optimized backend that secures our financial sustainability, ArdaCraft is better positioned than ever to continue its historic build. We invite you to explore the new galleries, read through the updated lore pages, and experience the speed and clarity of our new digital home. The road goes ever on and on, and we are thrilled to have you walking it with us.</p>
            `
        }
    },

    'ai-photoshoot': {
        cover: 'https://images.unsplash.com/photo-1678995632902-6019eb508c90?q=80&w=2000&auto=format&fit=crop',
        coverAlt: 'Portrait généré par intelligence artificielle',
        readNext: 'ardacraft',
        title: {
            fr: "Peut-on remplacer un véritable shooting photo avec l'Intelligence Artificielle ?",
            en: 'Can Artificial Intelligence Replace a Real Photo Shoot?'
        },
        excerpt: {
            fr: "Un mois d'expérimentation pour confronter la génération d'images par IA à un shooting produit traditionnel : coûts, qualité, limites et verdict.",
            en: 'A month of experimentation pitting AI image generation against a traditional product shoot: costs, quality, limits and verdict.'
        },
        html: {
            fr: `
            <div class="abstract">
                <p><strong>-95% de budget</strong> par visuel généré comparé à une journée de shooting produit traditionnelle avec photographe et studio.</p>
                <p><strong>40 visuels retenus sur 600 générés</strong> : un taux de déchet énorme, mais un itération quasi instantanée et illimitée.</p>
                <p><strong>Verdict nuancé</strong> : bluffant pour les ambiances et les arrière-plans, encore fragile pour la fidélité produit et la cohérence des détails.</p>
            </div>

            <h2>Pourquoi cette expérimentation ?</h2>
            <p>Un shooting photo professionnel, même modeste, mobilise un photographe, un studio, du matériel d'éclairage et une demi-journée de post-production. Pour une petite marque ou un projet personnel, le budget grimpe vite au-delà du millier d'euros pour une poignée de visuels. En parallèle, les générateurs d'images par IA promettent des résultats « photoréalistes » en quelques secondes. J'ai voulu vérifier cette promesse avec un cas concret : produire le visuel de lancement d'un objet réel, dans plusieurs ambiances, en comparant systématiquement le résultat IA à une référence photographiée en studio.</p>

            <h2>Le protocole</h2>
            <p>Pour que la comparaison soit honnête, j'ai fixé des règles strictes dès le départ : même objet, mêmes ambiances cibles, même temps de post-production maximum, et un jury de cinq personnes qui ignoraient quelle image provenait de quelle méthode.</p>

            <ul>
                <li><strong>Référence studio :</strong> une matinée de shooting classique, 35 clichés, 6 images finales retouchées.</li>
                <li><strong>Pipeline IA :</strong> photos smartphone de l'objet, entraînement d'un modèle personnalisé, puis génération massive avec des prompts d'ambiance.</li>
                <li><strong>Évaluation :</strong> test à l'aveugle sur la fidélité du produit, la qualité de la lumière et l'envie d'achat déclarée.</li>
            </ul>

            <figure class="image-breakout">
                <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop" alt="Studio photo avec éclairage professionnel">
                <figcaption>Le dispositif studio de référence : ce que l'IA doit égaler pour prétendre remplacer un shooting.</figcaption>
            </figure>

            <h3>Ce que l'IA fait remarquablement bien</h3>
            <p>Sur les ambiances, les matières d'arrière-plan et la lumière global, les résultats sont sidérants. Un « produit posé sur du marbre au soleil couchant » sort en trente secondes avec une lumière que j'aurais mis une heure à installer en studio. L'itération est le vrai super-pouvoir : changer de décor, d'heure de la journée ou de palette ne coûte rien, là où chaque variation en studio implique de re-shooter.</p>

            <blockquote>
                <p>« Le coût marginal d'une image supplémentaire tombe à zéro. C'est ça, la vraie rupture : on ne réfléchit plus en nombre de clichés, on réfléchit en directions créatives. »</p>
                <footer>— Note de carnet, jour 12 de l'expérimentation</footer>
            </blockquote>

            <h3>Ce qui coince encore</h3>
            <p>La fidélité produit reste le talon d'Achille. Logos déformés, proportions légèrement fausses, coutures qui n'existent pas : sur un objet que le client connaît par cœur, ces écarts sont éliminatoires. Le taux de déchet est brutal — moins de 7% des générations étaient exploitables telles quelles — et chaque correction fine (redresser un logo, corriger un reflet) ramène vers la retouche manuelle qu'on espérait éviter.</p>

            <table>
                <thead>
                    <tr>
                        <th>Critère</th>
                        <th>Shooting studio</th>
                        <th>Pipeline IA</th>
                        <th>Gagnant</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Coût par visuel final</td>
                        <td>~180 €</td>
                        <td>~9 €</td>
                        <td><strong>IA</strong></td>
                    </tr>
                    <tr>
                        <td>Fidélité du produit</td>
                        <td>Parfaite</td>
                        <td>Aléatoire</td>
                        <td><strong>Studio</strong></td>
                    </tr>
                    <tr>
                        <td>Variété des ambiances</td>
                        <td>Limitée par le décor</td>
                        <td>Quasi illimitée</td>
                        <td><strong>IA</strong></td>
                    </tr>
                    <tr>
                        <td>Test à l'aveugle (préférence)</td>
                        <td>58%</td>
                        <td>42%</td>
                        <td><strong>Studio</strong></td>
                    </tr>
                </tbody>
            </table>

            <h2>Alors, verdict ?</h2>
            <p>Non, l'IA ne remplace pas encore un vrai shooting quand la fidélité produit est critique — packaging, e-commerce, catalogue. Mais elle a déjà gagné sur un autre terrain : les visuels d'ambiance, les moodboards clients, les tests de direction artistique et les déclinaisons pour les réseaux sociaux. Mon flux de travail a d'ailleurs changé depuis : je génère les ambiances en IA, je valide une direction avec le client, puis je ne shoote en studio que la direction retenue. Le shooting n'a pas disparu — il est devenu la dernière étape d'un entonnoir beaucoup plus large.</p>
            `,
            en: `
            <div class="abstract">
                <p><strong>-95% budget</strong> per generated visual compared to a traditional product shoot day with a photographer and studio.</p>
                <p><strong>40 visuals kept out of 600 generated</strong>: a huge waste rate, but near-instant, unlimited iteration.</p>
                <p><strong>A nuanced verdict</strong>: stunning for moods and backgrounds, still fragile on product fidelity and detail consistency.</p>
            </div>

            <h2>Why This Experiment?</h2>
            <p>A professional photo shoot, even a modest one, requires a photographer, a studio, lighting gear and half a day of post-production. For a small brand or a personal project, the budget quickly climbs past a thousand euros for a handful of visuals. Meanwhile, AI image generators promise "photorealistic" results in seconds. I wanted to test that promise with a concrete case: producing the launch visual for a real object, in several moods, systematically comparing the AI result against a studio-photographed reference.</p>

            <h2>The Protocol</h2>
            <p>To keep the comparison honest, I set strict rules from the start: same object, same target moods, same maximum post-production time, and a jury of five people who didn't know which image came from which method.</p>

            <ul>
                <li><strong>Studio reference:</strong> a classic morning shoot, 35 shots, 6 final retouched images.</li>
                <li><strong>AI pipeline:</strong> smartphone photos of the object, training a custom model, then mass generation with mood prompts.</li>
                <li><strong>Evaluation:</strong> a blind test on product fidelity, lighting quality and declared purchase intent.</li>
            </ul>

            <figure class="image-breakout">
                <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop" alt="Photo studio with professional lighting">
                <figcaption>The reference studio setup: what the AI has to match to claim it can replace a shoot.</figcaption>
            </figure>

            <h3>What AI Does Remarkably Well</h3>
            <p>On moods, background materials and overall lighting, the results are staggering. A "product on marble at sunset" comes out in thirty seconds with lighting that would have taken me an hour to set up in a studio. Iteration is the real superpower: changing the set, the time of day or the palette costs nothing, whereas every variation in a studio means re-shooting.</p>

            <blockquote>
                <p>"The marginal cost of one more image drops to zero. That's the real disruption: you stop thinking in number of shots and start thinking in creative directions."</p>
                <footer>— Notebook entry, day 12 of the experiment</footer>
            </blockquote>

            <h3>What Still Falls Short</h3>
            <p>Product fidelity remains the Achilles' heel. Distorted logos, slightly wrong proportions, seams that don't exist: on an object the client knows by heart, these deviations are disqualifying. The waste rate is brutal — less than 7% of generations were usable as-is — and every fine correction (straightening a logo, fixing a reflection) drags you back to the manual retouching you hoped to avoid.</p>

            <table>
                <thead>
                    <tr>
                        <th>Criterion</th>
                        <th>Studio shoot</th>
                        <th>AI pipeline</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cost per final visual</td>
                        <td>~€180</td>
                        <td>~€9</td>
                        <td><strong>AI</strong></td>
                    </tr>
                    <tr>
                        <td>Product fidelity</td>
                        <td>Perfect</td>
                        <td>Unreliable</td>
                        <td><strong>Studio</strong></td>
                    </tr>
                    <tr>
                        <td>Variety of moods</td>
                        <td>Limited by the set</td>
                        <td>Nearly unlimited</td>
                        <td><strong>AI</strong></td>
                    </tr>
                    <tr>
                        <td>Blind test (preference)</td>
                        <td>58%</td>
                        <td>42%</td>
                        <td><strong>Studio</strong></td>
                    </tr>
                </tbody>
            </table>

            <h2>So, the Verdict?</h2>
            <p>No, AI doesn't replace a real shoot yet when product fidelity is critical — packaging, e-commerce, catalogs. But it has already won on another front: mood visuals, client moodboards, art direction tests and social media variations. My workflow has actually changed since: I generate moods with AI, validate a direction with the client, then only shoot the chosen direction in the studio. The photo shoot hasn't disappeared — it has become the final step of a much wider funnel.</p>
            `
        }
    }
};
