// Article content for the experiments template page.
// Each article provides its full content in both languages; the template
// (article-page.js) renders the right one and re-renders on language switch.
window.GUMI_ARTICLES = {

    'ardacraft': {
        cover: '/media/ardacraft-redesign-featured-image.webp',
        coverAlt: 'Aperçu de la refonte du site ArdaCraft',
        readNext: 'ardacraft-map',
        published: '2026-07-11',
        title: {
            fr: "De Webflow à une architecture décentralisée : comment j'ai repensé le site d'ArdaCraft",
            en: 'From Webflow to a Decentralized Architecture: How I Rethought the ArdaCraft Website'
        },
        excerpt: {
            fr: "Participer au succès d'une communauté de passionnés tout en me challengeant et en développant de nouvelles compétences : retour sur un chantier de 150 heures.",
            en: 'Contributing to the success of a passionate community while challenging myself and building new skills: a look back at a 150-hour project.'
        },
        html: {
            fr: `
            <div class="abstract">
                <p><strong>-90 % de coûts d'hébergement</strong> par rapport au forfait supérieur que Webflow nous imposait — et deux fois moins qu'avant la migration.</p>
                <p><strong>150 heures sur 3 mois</strong> pour migrer vers une architecture décentralisée : WordPress et Webstudio reliés en headless via GraphQL.</p>
                <p><strong>3× plus d'utilisation</strong> des fonctionnalités clés (recherche, filtres, tri) sur l'une des pages les plus visitées, grâce à une optimisation UX guidée par les données.</p>
            </div>

            <p><em>Participer au succès d'une communauté de passionnés tout en me challengeant et en développant de nouvelles compétences : retour sur un chantier de 150 heures.</em></p>

            <h2>Le contexte : un succès massif, un goulot d'étranglement réel</h2>
            <p>ArdaCraft est un projet collaboratif international dont l'ambition est de recréer minutieusement la <a href="https://ardacraft.me/" target="_blank" rel="noopener">Terre du Milieu</a> (l'univers du <em>Seigneur des Anneaux</em> et du <em>Hobbit</em>). J'ai rejoint l'aventure initialement pour créer des vidéos, avant de prendre plus de responsabilités pour me challenger et explorer de nouveaux horizons.</p>
            <p>Il y a quelques années, le projet a connu un immense succès sur les réseaux sociaux, cumulant des dizaines de millions de vues sur nos Reels. Pourtant, je n'étais pas satisfait : le nombre de visiteurs réels sur le projet ne décollait pas. J'ai vite compris le problème. Notre site web était un goulot d'étranglement. Pour un utilisateur curieux, comprendre comment commencer la visite du monde relevait du parcours du combattant.</p>

            <figure class="image-breakout">
                <img src="/media/ardacraft-experiments-location-gallery.webp" alt="Six panoramas de la Terre du Milieu recréée dans ArdaCraft : champs cultivés de la Comté, collines brumeuses, falaises, village fleuri et tour de garde fortifiée" width="1920" height="1080" loading="lazy">
                <figcaption>L'ampleur du projet : quelques-uns des 316 lieux recréés bloc par bloc par la communauté.</figcaption>
            </figure>

            <h2>Le problème : la rançon du succès et l'impasse financière</h2>
            <p>En collaboration avec un autre membre, j'ai reconstruit un site mais plus complet et aligné sur nos objectifs : agrandir la communauté et imposer ArdaCraft comme une référence auprès des fans de Tolkien.</p>
            <p>Développée sur Webflow, cette première refonte a été un succès critique. Portée par notre stratégie de communication, elle a attiré plus de 217 000 visiteurs la première année. C'est là que les ennuis ont commencé.</p>
            <p>Nous avons atteint la limite de notre abonnement Webflow. Passer au forfait supérieur aurait <strong>multiplié nos coûts par cinq</strong>. Pour un projet communautaire qui survit uniquement grâce aux dons, c'était impossible. Il nous fallait une solution capable de grandir avec nous sans vider notre trésorerie.</p>

            <h3>Notre nouvelle architecture technique</h3>
            <p>Pour contourner cette contrainte financière, nous avons migré vers une solution décentralisée. J'ai dû apprendre à maîtriser plusieurs nouveaux outils. Le défi était de taille : il a fallu déplacer des milliers de points de données et faire communiquer WordPress et Webstudio via GraphQL pour gérer dynamiquement des centaines de pages en mode <em>headless</em>. J'ai même dû concevoir un script Python sur mesure pour compresser des milliers d'images au format WebP et optimiser les performances.</p>
            <p>Ce chantier de refonte et de migration m'a demandé <strong>bien 150 heures de travail étalées sur 3 mois</strong>. Bien que j'aie été le contributeur principal sur cette partie, je suis profondément reconnaissant envers toutes les personnes de l'équipe qui m'ont donné un coup de main de temps en temps ; leur soutien constant a été un moteur indispensable pour avancer.</p>
            <p>Je me suis basé sur 3 piliers :</p>
            <ul>
                <li><strong>L'impact visuel</strong> : un design marquant pour faire ressortir notre personnalité.</li>
                <li><strong>L'efficacité du parcours</strong> : une navigation logique pour guider le visiteur.</li>
                <li><strong>L'adaptabilité</strong> : une expérience fluide du smartphone à l'ordinateur.</li>
            </ul>

            <hr />

            <h2>1. L'impact visuel : immersion avant tout</h2>

            <figure class="image-breakout">
                <img src="/media/ardacraft-experiments-before-after.webp" alt="Comparaison avant/après de la page des lieux : l'ancienne interface utilitaire à gauche, la nouvelle version immersive aux accents dorés à droite" width="1920" height="1080" loading="lazy">
                <figcaption>Avant / après : la page des lieux, passée d'une liste utilitaire à une vitrine immersive.</figcaption>
            </figure>

            <p>Redesigner l'intégralité des pages a été une tâche colossale. Après une phase de recherche sur Figma, j'ai introduit des concepts visuels forts : l'utilisation extensive de la couleur « or », des effets « brillants » sur les éléments interactifs et du <em>glassmorphism</em>.</p>
            <p>Mon maître-mot était l'<strong>immersion</strong>. Comment faire des choix créatifs forts sans dégrader la navigation ? La clé a été la subtilité : travailler avec des images en fond, des dégradés, utiliser le <em>glassmorphism</em> avec parcimonie et réduire drastiquement le nombre d'éléments visibles à l'écran.</p>

            <figure class="image-breakout">
                <img src="/media/ardacraft-experiments-process.webp" alt="Processus de design en deux exemples : une maquette Figma face à la page finale en ligne, puis un croquis papier face à sa page finale en ligne" width="1920" height="1080" loading="lazy">
                <figcaption>Mon flux de travail réel : une fois le style établi sur une dizaine de pages, je passais du croquis papier ou de la maquette Figma directement à l'implémentation — en affinant les idées en cours de route.</figcaption>
            </figure>

            <p>S'il est presque impossible de mesurer l'impact réel d'un nouveau design sur un projet associatif comme le nôtre, le gain est ailleurs : nous disposons enfin d'une belle cohérence visuelle sur l'intégralité des pages, et le site agit désormais comme un pilier fort de l'identité de marque (<em>brand identity</em>) d'ArdaCraft.</p>

            <hr />

            <h2>2. L'efficacité du parcours : analyser les données pour simplifier</h2>
            <p>Pour optimiser le parcours, je me suis appuyé sur <a href="https://clarity.microsoft.com/" target="_blank" rel="noopener">Microsoft Clarity</a>, un outil d'analyse UX qui permet de visualiser le comportement des utilisateurs (via des cartes de chaleur ou des enregistrements de sessions). Le constat a été simple : la plupart des éléments coupés par le bas de l'écran (<em>viewport</em>) n'étaient jamais utilisés. J'ai donc remonté ces fonctionnalités clés en haut de page pour les rendre immédiatement accessibles.</p>
            <p>La page listant tous les lieux du <em>Seigneur des Anneaux</em> est l'une des plus visitées. En appliquant cette logique, les résultats ont été immédiats. À trafic comparable entre décembre 2025 et juin 2026, l'utilisation des fonctionnalités a bondi :</p>

            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">Fonctionnalité</th>
                        <th style="text-align: center;">Utilisation en décembre 2025</th>
                        <th style="text-align: center;">Utilisation en juin 2026</th>
                        <th style="text-align: center;">Évolution globale</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left;"><strong>Recherche</strong></td>
                        <td style="text-align: center;">2,98 %</td>
                        <td style="text-align: center;">5,09 %</td>
                        <td style="text-align: center;"><strong>+ 71 %</strong></td>
                    </tr>
                    <tr>
                        <td style="text-align: left;"><strong>Filtres</strong></td>
                        <td style="text-align: center;">1,17 %</td>
                        <td style="text-align: center;">7,64 %</td>
                        <td style="text-align: center;"><strong>+ 555 %</strong></td>
                    </tr>
                    <tr>
                        <td style="text-align: left;"><strong>Tri</strong></td>
                        <td style="text-align: center;">1,55 %</td>
                        <td style="text-align: center;">4,99 %</td>
                        <td style="text-align: center;"><strong>+ 222 %</strong></td>
                    </tr>
                </tbody>
            </table>

            <p>Ces modifications sont un grand succès, et nous allons continuer à optimiser cette expérience.</p>

            <hr />

            <h2>3. L'adaptabilité : penser enfin aux mobiles</h2>
            <p>De nombreuses fonctionnalités majeures, comme la carte interactive ou les filtres, n'étaient tout simplement pas adaptées aux smartphones. L'un des grands chantiers a donc été de repenser ces éléments pour le mobile.</p>
            <p>Nous avions également remarqué que l'ancien menu mobile était délaissé car trop complexe. La nouvelle version propose un menu extrêmement simple, ce qui a radicalement facilité la navigation de nos utilisateurs nomades.</p>

            <hr />

            <h2>Et après ?</h2>
            <p>La communauté a très bien accueilli cette nouvelle mouture, le site est jugé bien plus utile et agréable au quotidien. Nous avons notamment reçu de nombreux commentaires enthousiastes sur la carte interactive.</p>
            <p>ArdaCraft est un projet qui se base sur des recherches approfondies touchant à la géologie, la botanique, l'histoire et leurs influences sur le monde de Tolkien. Notre carte a pour ambition de regrouper tous ces éléments scientifiques et narratifs pour les mettre à la disposition des passionnés, s'imposant comme l'outil ultime d'immersion dans notre univers (ce qui fera d'ailleurs l'objet d'un prochain article dédié !).</p>
            <p>Quant à la suite ? Je planche déjà sur mon prochain défi : concevoir la V3 de cette fameuse carte interactive.</p>
            `,
            en: `
            <div class="abstract">
                <p><strong>-90% hosting costs</strong> compared to the higher Webflow tier we were being pushed onto — and half of what we paid before the migration.</p>
                <p><strong>150 hours over 3 months</strong> to migrate to a decentralized architecture: WordPress and Webstudio connected headless via GraphQL.</p>
                <p><strong>3× more usage</strong> of key features (search, filters, sorting) on one of our most visited pages, thanks to data-driven UX optimization.</p>
            </div>

            <p><em>Contributing to the success of a passionate community while challenging myself and building new skills: a look back at a 150-hour project.</em></p>

            <h2>The Context: Massive Success, a Very Real Bottleneck</h2>
            <p>ArdaCraft is an international collaborative project whose ambition is to meticulously recreate <a href="https://ardacraft.me/" target="_blank" rel="noopener">Middle-earth</a> (the universe of <em>The Lord of the Rings</em> and <em>The Hobbit</em>). I initially joined the adventure to create videos, before taking on more responsibilities to challenge myself and explore new horizons.</p>
            <p>A few years ago, the project became hugely successful on social media, racking up tens of millions of views on our Reels. Yet I wasn't satisfied: the number of actual visitors to the project wasn't taking off. I quickly understood the problem. Our website was a bottleneck. For a curious user, figuring out how to start exploring the world was an obstacle course.</p>

            <figure class="image-breakout">
                <img src="/media/ardacraft-experiments-location-gallery.webp" alt="Six panoramas of Middle-earth recreated in ArdaCraft: cultivated Shire fields, misty hills, cliffs, a flowering village and a fortified watchtower" width="1920" height="1080" loading="lazy">
                <figcaption>The scale of the project: a few of the 316 locations recreated block by block by the community.</figcaption>
            </figure>

            <h2>The Problem: The Price of Success and a Financial Dead End</h2>
            <p>Together with another member, I rebuilt the site — more complete this time, and aligned with our goals: growing the community and establishing ArdaCraft as a reference among Tolkien fans.</p>
            <p>Built on Webflow, that first redesign was a critical success. Carried by our communication strategy, it attracted more than 217,000 visitors in its first year. That's when the trouble started.</p>
            <p>We hit the limit of our Webflow plan. Upgrading to the next tier would have <strong>multiplied our costs by five</strong>. For a community project that survives on donations alone, that was impossible. We needed a solution that could grow with us without draining our treasury.</p>

            <h3>Our New Technical Architecture</h3>
            <p>To work around this financial constraint, we migrated to a decentralized solution. I had to learn several new tools. The challenge was substantial: thousands of data points had to be moved, and WordPress and Webstudio had to communicate via GraphQL to dynamically manage hundreds of pages in <em>headless</em> mode. I even had to build a custom Python script to compress thousands of images to WebP and optimize performance.</p>
            <p>This redesign and migration took me <strong>a good 150 hours of work spread over 3 months</strong>. Although I was the main contributor on this part, I am deeply grateful to everyone on the team who lent a hand from time to time; their constant support was an essential driving force.</p>
            <p>I built everything on 3 pillars:</p>
            <ul>
                <li><strong>Visual impact</strong>: a striking design to bring out our personality.</li>
                <li><strong>An efficient journey</strong>: logical navigation to guide the visitor.</li>
                <li><strong>Adaptability</strong>: a smooth experience from smartphone to desktop.</li>
            </ul>

            <hr />

            <h2>1. Visual Impact: Immersion Above All</h2>

            <figure class="image-breakout">
                <img src="/media/ardacraft-experiments-before-after.webp" alt="Before/after comparison of the locations page: the old utilitarian interface on the left, the new immersive gold-accented version on the right" width="1920" height="1080" loading="lazy">
                <figcaption>Before / after: the locations page, transformed from a utilitarian list into an immersive showcase.</figcaption>
            </figure>

            <p>Redesigning every single page was a colossal task. After a research phase in Figma, I introduced strong visual concepts: extensive use of a "gold" color, "shiny" effects on interactive elements, and <em>glassmorphism</em>.</p>
            <p>My watchword was <strong>immersion</strong>. How do you make bold creative choices without degrading navigation? The key was subtlety: working with background images and gradients, using <em>glassmorphism</em> sparingly, and drastically reducing the number of elements visible on screen.</p>

            <figure class="image-breakout">
                <img src="/media/ardacraft-experiments-process.webp" alt="Design process in two examples: a Figma mockup next to the final live page, then a paper sketch next to its final live page" width="1920" height="1080" loading="lazy">
                <figcaption>My actual workflow: once the style was established across a dozen pages, I went from paper sketch or Figma mockup straight to implementation — refining ideas along the way.</figcaption>
            </figure>

            <p>While it's nearly impossible to measure the real impact of a new design on a volunteer project like ours, the gain lies elsewhere: we finally have strong visual consistency across every page, and the site now acts as a solid pillar of ArdaCraft's brand identity.</p>

            <hr />

            <h2>2. An Efficient Journey: Analyzing Data to Simplify</h2>
            <p>To optimize the user journey, I relied on <a href="https://clarity.microsoft.com/" target="_blank" rel="noopener">Microsoft Clarity</a>, a UX analytics tool that lets you visualize user behavior (through heatmaps and session recordings). The finding was simple: most elements cut off by the bottom of the viewport were never used. So I moved these key features to the top of the page to make them immediately accessible.</p>
            <p>The page listing all the locations from <em>The Lord of the Rings</em> is one of the most visited. Applying this logic, the results were immediate. With comparable traffic between December 2025 and June 2026, feature usage soared:</p>

            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">Feature</th>
                        <th style="text-align: center;">Usage in December 2025</th>
                        <th style="text-align: center;">Usage in June 2026</th>
                        <th style="text-align: center;">Overall change</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left;"><strong>Search</strong></td>
                        <td style="text-align: center;">2.98%</td>
                        <td style="text-align: center;">5.09%</td>
                        <td style="text-align: center;"><strong>+71%</strong></td>
                    </tr>
                    <tr>
                        <td style="text-align: left;"><strong>Filters</strong></td>
                        <td style="text-align: center;">1.17%</td>
                        <td style="text-align: center;">7.64%</td>
                        <td style="text-align: center;"><strong>+555%</strong></td>
                    </tr>
                    <tr>
                        <td style="text-align: left;"><strong>Sorting</strong></td>
                        <td style="text-align: center;">1.55%</td>
                        <td style="text-align: center;">4.99%</td>
                        <td style="text-align: center;"><strong>+222%</strong></td>
                    </tr>
                </tbody>
            </table>

            <p>These changes are a great success, and we will keep optimizing this experience.</p>

            <hr />

            <h2>3. Adaptability: Finally Thinking Mobile</h2>
            <p>Many major features, like the interactive map or the filters, simply weren't suited to smartphones. One of the big work streams was therefore rethinking these elements for mobile.</p>
            <p>We had also noticed that the old mobile menu was neglected because it was too complex. The new version offers an extremely simple menu, which has radically eased navigation for our on-the-go users.</p>

            <hr />

            <h2>What's Next?</h2>
            <p>The community welcomed this new version very warmly; the site is considered far more useful and pleasant to use day to day. We received particularly enthusiastic feedback about the interactive map.</p>
            <p>ArdaCraft is a project grounded in deep research into geology, botany, history and their influence on Tolkien's world. Our map aims to bring all these scientific and narrative elements together for enthusiasts, establishing itself as the ultimate immersion tool into our universe (which will, incidentally, be the subject of a dedicated upcoming article!).</p>
            <p>As for what comes next? I'm already working on my next challenge: designing V3 of that famous interactive map.</p>
            `
        }
    },

    'ardacraft-map': {
        cover: '/media/ardacraft-map-featured-image.webp',
        coverAlt: 'La carte interactive de la Terre du Milieu conçue pour ArdaCraft',
        readNext: 'ardacraft',
        published: '2026-07-12',
        title: {
            fr: "Utiliser le SEO pour faire grandir une communauté de passionnés : l'opportunité à 1 million de recherches par an",
            en: 'Using SEO to Grow a Community of Enthusiasts: The One-Million-Searches-a-Year Opportunity'
        },
        excerpt: {
            fr: "Comment j'ai transformé plus d'un million de recherches annuelles autour de la Terre du Milieu en un véritable levier d'acquisition pour ArdaCraft, grâce à une carte interactive.",
            en: 'How I turned over a million annual searches around Middle-earth into a real acquisition channel for ArdaCraft, through an interactive map.'
        },
        html: {
            fr: `
            <div class="abstract">
                <p><strong>+1 000 000 de recherches par an</strong> autour des cartes de la Terre du Milieu : un marché massif que personne ne servait vraiment bien.</p>
                <p><strong>330 000 clics/an</strong> de potentiel en première position, pour une difficulté SEO estimée à seulement 36 % (« Possible »).</p>
                <p><strong>50 % de notre trafic hors-marque</strong> généré à lui seul par la carte interactive, en quelques mois à peine.</p>
            </div>

            <p><em>Comment nous avons transformé un volume de recherche massif autour de la Terre du Milieu en un levier d'acquisition concret pour ArdaCraft, grâce à notre carte interactive.</em></p>

            <h2>L'opportunité : un million de recherches à portée de main</h2>
            <p>Dans ma quête constante de nouvelles opportunités pour faire grandir <strong>ArdaCraft</strong>, j'ai décidé de me pencher sérieusement sur notre stratégie SEO. C'est en analysant le marché autour de l'univers de Tolkien qu'un segment précis a immédiatement capté mon attention : les recherches de cartes. Les données Semrush étaient sans appel, révélant un écosystème de <strong>plus d'un million de recherches par an</strong> en incluant toutes les variantes du mot-clé « middle earth map ».</p>
            <p>En creusant les chiffres, j'ai découvert une opportunité de trafic incroyable : le potentiel s'élevait à <strong>plus de 330 000 clics par an</strong> à aller chercher en première position. Pourtant, l'indicateur de difficulté de Semrush (le <em>Keyword Difficulty</em>) restait très accessible, avec un score de seulement <strong>36 % (qualifié de « Possible » par l'outil)</strong>. Une analyse de la SERP a rapidement confirmé mon intuition : les trois premiers résultats étaient tous des cartes interactives, preuve que Google attend un outil dynamique pour satisfaire les internautes.</p>
            <p>C'est là que le lien avec ArdaCraft est devenu une évidence. Nous disposions déjà d'atouts uniques pour apporter une valeur inestimable aux utilisateurs : des données géographiques précises (biomes, régions, coordonnées de notre carte Minecraft), des milliers de photos uniques pour illustrer concrètement chaque lieu, et surtout une communauté de passionnés connaissant les textes de Tolkien sur le bout des doigts pour garantir une exactitude absolue.</p>
            <p>C'est pour offrir cette expérience supérieure que j'ai pris la décision de lancer notre propre <a href="https://ardacraft.me/map/middle-earth-interactive-map" target="_blank" rel="noopener">carte interactive de la Terre du Milieu</a>. Voici comment nous avons transformé ces données de recherche et nos forces communautaires en un projet concret, conçu dès le premier jour pour conquérir le sommet de Google.</p>

            <hr />

            <h2>L'analyse de la SERP : repérer les failles pour faire mieux</h2>
            <p>Pour dépasser les acteurs déjà installés, il ne suffisait pas de dupliquer ce qu'ils faisaient. J'ai passé du temps à disséquer les cartes du Top 3 de Google. Mon constat a été simple : elles étaient globalement bonnes, mais souffraient toutes de compromis majeurs. La plupart étaient presque inutilisables sur mobile, et chacune possédait une fonctionnalité intéressante que les autres n'avaient pas. L'information et l'expérience étaient fragmentées.</p>
            <p>Ma stratégie produit a donc été limpide : concevoir l'outil ultime en cumulant toutes les fonctionnalités existantes, tout en y ajoutant nos propres innovations. Pour l'interface (UI) et l'ergonomie (UX), j'ai choisi de ne pas réinventer la roue. Je me suis basé sur les standards universels de <strong>Google Maps</strong>, un outil que tout le monde sait déjà manipuler, pour offrir une navigation immédiatement fluide et intuitive.</p>

            <figure class="image-breakout">
                <img src="/media/ardacraft-map-google-comparison.webp" alt="La carte interactive d'ArdaCraft présentée à côté de Google Maps, montrant une interface et une ergonomie volontairement familières" width="1920" height="1080" loading="lazy">
                <figcaption>Le parti pris d'ergonomie : reprendre les codes de Google Maps pour que la prise en main soit immédiate.</figcaption>
            </figure>

            <h2>Le lancement de la V1 : la réalité technique</h2>
            <p>La création de cette carte s'est faite en plusieurs étapes. La V1 a d'abord servi de <em>proof of concept</em>. Son but était simple : prouver l'intérêt de l'outil auprès de notre communauté et valider nos intuitions. Sur cette première version, les principaux défis se concentraient sur les fonctionnalités et l'accès à une donnée de qualité.</p>
            <p>La difficulté majeure a résidé dans la collecte et le placement de ces données : tracer le chemin précis du voyage de Frodon, par exemple, exige que quelqu'un saisisse manuellement plusieurs milliers de coordonnées géographiques distinctes. Au-delà de ce travail de titan, il a fallu construire une interface capable d'afficher cette masse d'informations sans saturer l'écran ni perdre l'utilisateur — tout en gérant un lourd travail de <em>bug fixing</em> à mesure que le code se complexifiait.</p>

            <h2>La V2 : UX, mobile et gamification</h2>
            <p>Le redesign global de notre site web a été l'opportunité parfaite pour reconstruire intégralement la page de la carte et lancer la V2. J'en ai profité pour affiner l'UI et corriger plusieurs frictions ergonomiques que j'avais clairement identifiées grâce aux données de Microsoft Clarity. Pour tester l'engagement de nos utilisateurs et explorer de nouvelles pistes de rétention, j'ai également intégré une brique de <em>gamification</em> sous forme de mini-jeux.</p>
            <p>L'un des plus grands défis de cette V2 a été le mobile. Souvent, la solution de facilité consiste à couper la moitié des fonctionnalités sur smartphone. Ici, l'intégralité des fonctionnalités majeures a été conservée sur mobile ; seuls deux jeux et quelques éléments d'information très secondaires ont été laissés de côté, à la marge, pour préserver la fluidité de la navigation tactile.</p>

            <figure class="image-breakout">
                <img src="/media/ardacraft-map-mobile-screens.webp" alt="Plusieurs écrans mobiles de la carte interactive d'ArdaCraft, montrant les fonctionnalités conservées sur smartphone" width="1920" height="1080" loading="lazy">
                <figcaption>Sur mobile, presque rien n'a été sacrifié : les fonctionnalités majeures sont toutes là, réagencées pour le tactile.</figcaption>
            </figure>

            <hr />

            <h2>Les résultats chiffrés : quand la réalité technique rencontre le SEO</h2>
            <p>Lancer un outil aussi lourd sur un projet communautaire implique des arbitrages constants. Les données de notre Google Search Console résument parfaitement cette aventure, rythmée par les lancements et les contraintes de serveurs :</p>

            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">Mois</th>
                        <th style="text-align: center;">Clics</th>
                        <th style="text-align: center;">Impressions</th>
                        <th style="text-align: left;">Contexte produit</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="text-align: left;"><strong>Décembre 2025</strong></td><td style="text-align: center;">1 500</td><td style="text-align: center;">108 000</td><td style="text-align: left;">Lancement officiel de la V1</td></tr>
                    <tr><td style="text-align: left;"><strong>Janvier 2026</strong></td><td style="text-align: center;">2 710</td><td style="text-align: center;">196 000</td><td style="text-align: left;">Mise en pause à la mi-mois (surcoûts)</td></tr>
                    <tr><td style="text-align: left;"><strong>Février 2026</strong></td><td style="text-align: center;">4 640</td><td style="text-align: center;">179 000</td><td style="text-align: left;">Mois complet en ligne — pic de trafic</td></tr>
                    <tr><td style="text-align: left;"><strong>Mars 2026</strong></td><td style="text-align: center;">1 550</td><td style="text-align: center;">97 100</td><td style="text-align: left;">Mise en pause à la mi-mois (surcoûts)</td></tr>
                    <tr><td style="text-align: left;"><strong>Avril 2026</strong></td><td style="text-align: center;">2 220</td><td style="text-align: center;">213 000</td><td style="text-align: left;">Stabilisation des impressions</td></tr>
                    <tr><td style="text-align: left;"><strong>Mai 2026</strong></td><td style="text-align: center;">1 850</td><td style="text-align: center;">179 000</td><td style="text-align: left;">Transition technique</td></tr>
                    <tr><td style="text-align: left;"><strong>Juin 2026</strong></td><td style="text-align: center;">1 360</td><td style="text-align: center;">175 000</td><td style="text-align: left;">Lancement de la V2 sur le nouveau site</td></tr>
                </tbody>
            </table>

            <p>L'analyse de ces chiffres est pleine d'enseignements. Le potentiel est immense — on frôle les 200 000 impressions mensuelles très rapidement — mais avoir dû couper le site à la moitié du mois en janvier et en mars, pour préserver notre budget, nous a sans doute coûté cher en référencement. Google n'aime pas l'instabilité, et ces coupures ont freiné notre dynamique de croissance.</p>

            <h3>La preuve par le trafic « hors-marque »</h3>
            <p>Malgré ces perturbations techniques, l'impact stratégique est incontestable. Depuis février, la Google Search Console permet d'isoler très facilement les requêtes « non-brandées » (les recherches qui ne contiennent pas le nom d'ArdaCraft). Le verdict est sans appel : <strong>la carte représente à elle seule 50 % de notre trafic hors-marque</strong>.</p>
            <p>C'est la preuve du bien-fondé de ce choix stratégique : nous avons réussi à capter une audience de purs curieux et de passionnés de Tolkien qui ignoraient tout de notre existence avant de chercher une carte sur Google.</p>

            <hr />

            <h2>Objectif V3 : vers la version finale</h2>
            <p>Bonne nouvelle : la migration vers notre nouvelle architecture décentralisée (WordPress, GraphQL, Cloudflare, Webstudio) nous offre enfin un système fiable, scalable et financièrement viable. Fini l'épée de Damoclès des surcoûts liés au volume de trafic.</p>
            <p>La prochaine étape est donc tracée : la <strong>V3 de la carte interactive</strong>. Pour moi, ce sera la version finale et complète de l'outil. Le chantier consistera à corriger les derniers bugs restants, affiner la qualité de nos coordonnées et peaufiner les détails d'affichage.</p>
            <p>Aujourd'hui, la base technique est robuste et le contenu d'une richesse inégalée. Une fois cette V3 déployée, nos efforts basculeront sur le dernier pilier essentiel de notre stratégie d'acquisition : le <strong>netlinking</strong>. Nous concentrerons nos efforts sur une grande campagne de communication entièrement axée sur la valeur unique de cet outil, afin d'aller chercher les backlinks nécessaires pour installer durablement et définitivement ArdaCraft au sommet de Google.</p>
            `,
            en: `
            <div class="abstract">
                <p><strong>+1,000,000 searches per year</strong> around Middle-earth maps: a massive market no one was really serving well.</p>
                <p><strong>330,000 clicks/year</strong> of potential in the first position, for an SEO difficulty estimated at just 36% ("Possible").</p>
                <p><strong>50% of our non-brand traffic</strong> generated by the interactive map alone, in just a few months.</p>
            </div>

            <p><em>How we turned a massive volume of searches around Middle-earth into a concrete acquisition lever for ArdaCraft, thanks to our interactive map.</em></p>

            <h2>The Opportunity: A Million Searches Within Reach</h2>
            <p>In my constant search for new opportunities to grow <strong>ArdaCraft</strong>, I decided to take our SEO strategy seriously. While analyzing the market around Tolkien's universe, one specific segment immediately caught my attention: map searches. The Semrush data was unequivocal, revealing an ecosystem of <strong>more than one million searches per year</strong> when including every variant of the keyword "middle earth map".</p>
            <p>Digging into the numbers, I discovered an incredible traffic opportunity: the potential amounted to <strong>more than 330,000 clicks per year</strong> up for grabs in the first position. Yet Semrush's difficulty indicator (the <em>Keyword Difficulty</em>) remained very accessible, with a score of just <strong>36% (labeled "Possible" by the tool)</strong>. A quick SERP analysis confirmed my intuition: the top three results were all interactive maps — proof that Google expects a dynamic tool to satisfy users.</p>
            <p>That's when the connection with ArdaCraft became obvious. We already had unique assets to deliver priceless value to users: precise geographic data (biomes, regions, coordinates from our Minecraft map), thousands of unique photos to concretely illustrate each location, and above all a community of enthusiasts who know Tolkien's texts inside out to guarantee absolute accuracy.</p>
            <p>To offer that superior experience, I decided to launch our own <a href="https://ardacraft.me/map/middle-earth-interactive-map" target="_blank" rel="noopener">interactive map of Middle-earth</a>. Here's how we turned that search data and our community strengths into a concrete project, designed from day one to conquer the top of Google.</p>

            <hr />

            <h2>SERP Analysis: Spotting the Gaps to Do Better</h2>
            <p>To surpass the established players, duplicating what they did wasn't enough. I spent time dissecting the maps in Google's Top 3. My conclusion was simple: they were generally good, but they all suffered from major compromises. Most were nearly unusable on mobile, and each had one interesting feature the others lacked. The information and the experience were fragmented.</p>
            <p>My product strategy was therefore clear: build the ultimate tool by combining every existing feature, while adding our own innovations. For the interface (UI) and usability (UX), I chose not to reinvent the wheel. I based everything on the universal standards of <strong>Google Maps</strong>, a tool everyone already knows how to use, to offer immediately smooth and intuitive navigation.</p>

            <figure class="image-breakout">
                <img src="/media/ardacraft-map-google-comparison.webp" alt="ArdaCraft's interactive map shown next to Google Maps, illustrating a deliberately familiar interface and usability" width="1920" height="1080" loading="lazy">
                <figcaption>The usability bet: borrowing Google Maps' conventions so the learning curve is immediate.</figcaption>
            </figure>

            <h2>The V1 Launch: Technical Reality</h2>
            <p>Building this map happened in several stages. V1 first served as a <em>proof of concept</em>. Its goal was simple: prove the tool's value to our community and validate our assumptions. On this first version, the main challenges centered on features and access to quality data.</p>
            <p>The major difficulty lay in collecting and placing that data: tracing the precise path of Frodo's journey, for example, requires someone to manually enter several thousand distinct geographic coordinates. Beyond this titanic work, we had to build an interface capable of displaying this mass of information without saturating the screen or losing the user — all while handling heavy <em>bug fixing</em> as the code grew more complex.</p>

            <h2>V2: UX, Mobile and Gamification</h2>
            <p>The global redesign of our website was the perfect opportunity to completely rebuild the map page and launch V2. I took the chance to refine the UI and fix several ergonomic frictions I had clearly identified thanks to Microsoft Clarity data. To test user engagement and explore new retention avenues, I also added a <em>gamification</em> layer in the form of mini-games.</p>
            <p>One of V2's biggest challenges was mobile. Often, the easy way out is to cut half the features on smartphones. Here, all the major features were kept on mobile; only two games and a few very secondary informational elements were left aside, at the margins, to preserve the fluidity of touch navigation.</p>

            <figure class="image-breakout">
                <img src="/media/ardacraft-map-mobile-screens.webp" alt="Several mobile screens of ArdaCraft's interactive map, showing the features kept on smartphones" width="1920" height="1080" loading="lazy">
                <figcaption>On mobile, almost nothing was sacrificed: the major features are all there, rearranged for touch.</figcaption>
            </figure>

            <hr />

            <h2>The Numbers: When Technical Reality Meets SEO</h2>
            <p>Launching such a heavy tool on a community project involves constant trade-offs. Our Google Search Console data perfectly sums up this adventure, punctuated by launches and server constraints:</p>

            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">Month</th>
                        <th style="text-align: center;">Clicks</th>
                        <th style="text-align: center;">Impressions</th>
                        <th style="text-align: left;">Product context</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="text-align: left;"><strong>December 2025</strong></td><td style="text-align: center;">1,500</td><td style="text-align: center;">108,000</td><td style="text-align: left;">Official V1 launch</td></tr>
                    <tr><td style="text-align: left;"><strong>January 2026</strong></td><td style="text-align: center;">2,710</td><td style="text-align: center;">196,000</td><td style="text-align: left;">Paused mid-month (to avoid overspend)</td></tr>
                    <tr><td style="text-align: left;"><strong>February 2026</strong></td><td style="text-align: center;">4,640</td><td style="text-align: center;">179,000</td><td style="text-align: left;">Full month online — traffic peak</td></tr>
                    <tr><td style="text-align: left;"><strong>March 2026</strong></td><td style="text-align: center;">1,550</td><td style="text-align: center;">97,100</td><td style="text-align: left;">Paused mid-month (to avoid overspend)</td></tr>
                    <tr><td style="text-align: left;"><strong>April 2026</strong></td><td style="text-align: center;">2,220</td><td style="text-align: center;">213,000</td><td style="text-align: left;">Impressions stabilizing</td></tr>
                    <tr><td style="text-align: left;"><strong>May 2026</strong></td><td style="text-align: center;">1,850</td><td style="text-align: center;">179,000</td><td style="text-align: left;">Technical transition</td></tr>
                    <tr><td style="text-align: left;"><strong>June 2026</strong></td><td style="text-align: center;">1,360</td><td style="text-align: center;">175,000</td><td style="text-align: left;">V2 launch on the new site</td></tr>
                </tbody>
            </table>

            <p>These figures are full of lessons. The potential is immense — we brush against 200,000 monthly impressions very quickly — but having to take the site down mid-month in January and March, to protect our budget, likely cost us dearly in rankings. Google doesn't like instability, and these interruptions slowed our growth momentum.</p>

            <h3>The Proof Through "Non-Brand" Traffic</h3>
            <p>Despite these technical disruptions, the strategic impact is undeniable. Since February, Google Search Console makes it easy to isolate "non-branded" queries (searches that don't contain the ArdaCraft name). The verdict is clear: <strong>the map alone accounts for 50% of our non-brand traffic</strong>.</p>
            <p>It's the definitive proof of this strategic choice: we managed to capture an audience of pure newcomers and Tolkien enthusiasts who knew nothing of our existence before searching for a map on Google.</p>

            <hr />

            <h2>Goal V3: Toward the Final Version</h2>
            <p>The good news is that migrating to our new decentralized architecture (WordPress, GraphQL, Cloudflare, Webstudio) finally gives us a reliable, scalable and financially viable system. No more sword of Damocles of costs tied to traffic volume.</p>
            <p>The next step is therefore set: <strong>V3 of the interactive map</strong>. For me, this will be the final, complete version of the tool. The work will consist of fixing the last remaining bugs, refining the quality of our coordinates and polishing display details.</p>
            <p>Today, the technical foundation is robust and the content unmatched in richness. Once V3 is deployed, our efforts will shift to the last essential pillar of our acquisition strategy: <strong>link building</strong>. We'll focus on a large communication campaign built entirely around the unique value of this tool, to earn the backlinks needed to durably and definitively establish ArdaCraft at the top of Google.</p>
            `
        }
    },

    'ai-photoshoot': {
        cover: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop',
        coverAlt: 'Studio photo avec éclairage professionnel',
        readNext: 'ardacraft',
        published: '2026-07-11',
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
