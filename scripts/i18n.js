(function () {
    const DICT = {
        // Accessibility
        skip_link: { fr: 'Aller au contenu', en: 'Skip to content' },

        // Navbar
        nav_experiments: { fr: 'Expérimentations', en: 'Experiments' },
        nav_tools: { fr: 'Outils', en: 'Tools' },
        nav_lang_title: { fr: 'Changer la langue', en: 'Switch language' },
        nav_theme_title: { fr: 'Changer le thème', en: 'Switch theme' },

        // Homepage
        home_hero: {
            fr: "Je rassemble ici des outils et des expérimentations conçus par curiosité, pour donner vie à des idées et explorer de nouvelles directions.",
            en: "This is where I gather tools and experiments built out of curiosity, to bring ideas to life and explore new directions."
        },
        home_exp_title: { fr: 'Mes expérimentations', en: 'My experiments' },
        home_tools_title: { fr: 'Mes outils', en: 'My tools' },
        discover_all: { fr: 'Tout découvrir', en: 'See everything' },

        // Experiment cards
        exp_card_ardacraft: {
            fr: "De Webflow à une architecture décentralisée : comment j'ai repensé le site d'ArdaCraft.",
            en: 'From Webflow to a decentralized architecture: how I rethought the ArdaCraft website.'
        },
        exp_card_ardacraft_map: {
            fr: "Utiliser le SEO pour faire grandir une communauté de passionnés : l'opportunité à 1 million de recherches par an.",
            en: 'Using SEO to grow a community of enthusiasts: the one-million-searches-a-year opportunity.'
        },
        exp_card_shooting: {
            fr: "Peut-on remplacer un véritable shooting photo avec l'Intelligence Artificielle ?",
            en: "Can Artificial Intelligence replace a real photo shoot?"
        },
        // Tool cards
        tool_converter_title: { fr: 'Convertisseur de fichiers', en: 'File converter' },
        tool_converter_desc: {
            fr: 'Conversion locale de PDF, PSD, AI et images vers PNG, JPG, WebP ou PDF, avec compression.',
            en: 'Local conversion of PDF, PSD, AI and images to PNG, JPG, WebP or PDF, with compression.'
        },
        tool_qr_title: { fr: 'Générateur de QR code', en: 'QR code generator' },
        tool_qr_desc: {
            fr: 'QR codes personnalisés, prêts à partager ou exporter.',
            en: 'Custom QR codes, ready to share or export.'
        },
        tool_media_title: { fr: 'Téléchargeur de médias', en: 'Media downloader' },
        tool_media_desc: {
            fr: 'Extraction rapide de vidéos, audio et miniatures depuis vos liens.',
            en: 'Quickly extract videos, audio and thumbnails from your links.'
        },
        tool_text_title: { fr: 'Modificateur de texte', en: 'Text modifier' },
        tool_text_desc: {
            fr: 'Transformations, nettoyage et remplacements avancés directement dans le navigateur.',
            en: 'Advanced transformations, cleanup and replacements right in the browser.'
        },
        tool_placeholder_title: { fr: 'Texte de remplissage', en: 'Placeholder text' },
        tool_placeholder_desc: {
            fr: 'Générez du faux texte lorem ipsum, anglais ou français, calibré en paragraphes.',
            en: 'Generate lorem ipsum, English-ish or French-ish filler text, sized in paragraphs.'
        },
        tool_videocomp_title: { fr: 'Compresseur de vidéos', en: 'Video compressor' },
        tool_videocomp_desc: {
            fr: 'Compression locale de vidéos MP4, MOV, AVI, WebM et MKV, sans upload.',
            en: 'Local compression of MP4, MOV, AVI, WebM and MKV videos, no upload.'
        },
        tool_password_title: { fr: 'Générateur de mots de passe', en: 'Password generator' },
        tool_password_desc: {
            fr: 'Mots de passe robustes et aléatoires, générés localement dans votre navigateur.',
            en: 'Strong random passwords, generated locally in your browser.'
        },
        tool_palette_title: { fr: 'Générateur de palettes', en: 'Palette generator' },
        tool_palette_desc: {
            fr: 'Créez des palettes de couleurs harmonieuses à partir d\'une couleur de base, en local.',
            en: 'Build harmonious color palettes from a base color, locally.'
        },
        tool_social_title: { fr: 'Formats réseaux sociaux', en: 'Social media formats' },
        tool_social_desc: {
            fr: 'Déclinez un visuel aux formats Instagram, X, LinkedIn, YouTube et plus, en local.',
            en: 'Crop one visual into Instagram, X, LinkedIn, YouTube formats and more, locally.'
        },
        tool_sharepre_title: { fr: 'Aperçu de partage', en: 'Share preview' },
        tool_sharepre_desc: {
            fr: "Prévisualisez l'apparence de vos liens sur X, LinkedIn, WhatsApp, Discord et plus.",
            en: 'Preview how your links look on X, LinkedIn, WhatsApp, Discord and more.'
        },
        coming_soon: { fr: 'Bientôt disponible', en: 'Coming soon' },
        tool_contrast_title: { fr: 'Analyseur de contraste', en: 'Contrast checker' },
        tool_contrast_desc: {
            fr: "Vérifiez l'accessibilité de vos palettes selon les normes de lisibilité WCAG.",
            en: "Check your palettes' accessibility against WCAG readability standards."
        },

        // Category pages
        exp_hero_title: { fr: 'Mes Expérimentations', en: 'My Experiments' },
        exp_hero_sub: {
            fr: 'Des concepts exploratoires, des concepts visuels et des prototypes pour repousser les limites des technologies actuelles.',
            en: 'Exploratory concepts, visual ideas and prototypes pushing the limits of current technologies.'
        },
        tools_hero_title: { fr: 'Mes Outils', en: 'My Tools' },
        tools_hero_sub: {
            fr: "Une collection d'utilitaires développés pour accélérer mon flux de travail et celui de mes proches.",
            en: 'A collection of utilities built to speed up my workflow and that of the people around me.'
        },
        search_experiments: { fr: 'Rechercher une expérimentation...', en: 'Search experiments...' },
        search_tools: { fr: 'Rechercher un outil...', en: 'Search tools...' },
        filter_all_f: { fr: 'Toutes', en: 'All' },
        filter_all: { fr: 'Tous', en: 'All' },
        filter_ai: { fr: 'Intelligence Artificielle', en: 'Artificial Intelligence' },
        filter_design: { fr: 'Design', en: 'Design' },
        filter_web: { fr: 'Web', en: 'Web' },
        filter_dev: { fr: 'Développement', en: 'Development' },
        filter_utils: { fr: 'Utilitaires', en: 'Utilities' },
        filter_marketing: { fr: 'Marketing', en: 'Marketing' },

        // Article template
        published_on: { fr: 'Publié le', en: 'Published on' },
        toc_label: { fr: 'Sommaire', en: 'Contents' },
        read_next: { fr: 'À lire ensuite', en: 'Read next' },
        copy_link: { fr: 'Copier le lien', en: 'Copy the link' },
        copy_done: { fr: 'Copié !', en: 'Copied!' },

        // Contrast checker tool
        contrast_text_color: { fr: 'Couleur du texte', en: 'Text color' },
        contrast_bg_label: { fr: 'Arrière-plan', en: 'Background' },
        contrast_or: { fr: 'ou', en: 'or' },
        contrast_ratio_label: { fr: 'Contraste', en: 'Contrast' },
        contrast_small: { fr: 'Petit texte', en: 'Small text' },
        contrast_large: { fr: 'Grand texte', en: 'Large text' },
        contrast_fix: { fr: 'Corriger automatiquement', en: 'Fix automatically' },
        contrast_note: { fr: "4,5 pour le petit texte, 3 pour le grand", en: "4.5 for small text, 3 for large" },
        contrast_msg_all: { fr: 'Contraste suffisant pour toutes les tailles de texte.', en: 'Sufficient contrast for all text sizes.' },
        contrast_msg_large: { fr: 'Contraste suffisant uniquement pour le grand texte.', en: 'Sufficient contrast for large text only.' },
        contrast_msg_none: { fr: 'Contraste insuffisant pour toutes les tailles de texte.', en: 'Poor contrast for all text sizes.' },
        contrast_r1: { fr: 'Très faible', en: 'Very poor' },
        contrast_r2: { fr: 'Faible', en: 'Poor' },
        contrast_r3: { fr: 'Correct', en: 'Good' },
        contrast_r4: { fr: 'Très bon', en: 'Very good' },
        contrast_r5: { fr: 'Excellent', en: 'Excellent' },
        contrast_add_image: { fr: 'Ajouter une image', en: 'Add an image' },
        contrast_remove_image: { fr: "Retirer l'image", en: 'Remove image' },
        contrast_img_note: {
            fr: "Le contraste est calculé sur la couleur moyenne de l'image.",
            en: 'Contrast is computed against the average color of the image.'
        },
        contrast_tooltip: {
            fr: "<strong>Comment ça marche ?</strong><br><br>Cet outil suit les Web Content Accessibility Guidelines (WCAG), qui définissent deux niveaux de contraste : AA (minimum) et AAA (renforcé).<br><br>AA : ratio d'au moins 4,5:1 pour le texte normal et 3:1 pour le grand texte (18pt+) ou le gras.<br>AAA : ratio d'au moins 7:1 pour le texte normal et 4,5:1 pour le grand texte ou le gras.<br><br><a href=\"https://www.w3.org/WAI/standards-guidelines/wcag/\" target=\"_blank\" rel=\"noopener\" style=\"color: var(--accent); font-weight: 800;\">En savoir plus</a>",
            en: "<strong>How does it work?</strong><br><br>This tool follows the Web Content Accessibility Guidelines (WCAG), which define two contrast levels: AA (minimum) and AAA (enhanced).<br><br>AA: a ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt+) or bold text.<br>AAA: a ratio of at least 7:1 for normal text and 4.5:1 for large text or bold text.<br><br><a href=\"https://www.w3.org/WAI/standards-guidelines/wcag/\" target=\"_blank\" rel=\"noopener\" style=\"color: var(--accent); font-weight: 800;\">Learn more</a>"
        },

        // Document titles + meta descriptions (tab title / search snippet).
        // Article pages manage their own title in article-page.js.
        doc_home_title: { fr: 'Gumi. — Outils web & expérimentations', en: 'Gumi. — Web tools & experiments' },
        doc_home_desc: {
            fr: 'Gumi rassemble des outils web pratiques et des expérimentations digitales, conçus par curiosité pour donner vie à des idées.',
            en: 'Gumi gathers practical web tools and digital experiments, built out of curiosity to bring ideas to life.'
        },
        doc_outils_title: { fr: 'Outils - Gumi.', en: 'Tools - Gumi.' },
        doc_outils_desc: {
            fr: 'Explorez les outils Gumi : conversion de fichiers, compression de vidéos, téléchargement de médias, QR code, contraste, texte de remplissage, mots de passe et édition de texte dans le navigateur.',
            en: 'Explore the Gumi tools: file conversion, video compression, media download, QR codes, contrast, filler text, passwords and text editing in the browser.'
        },
        doc_exp_title: { fr: 'Expérimentations - Gumi.', en: 'Experiments - Gumi.' },
        doc_exp_desc: {
            fr: 'Découvrez les expérimentations de Gumi : concepts exploratoires, concepts visuels et prototypes pour repousser les limites des technologies actuelles.',
            en: "Discover Gumi's experiments: exploratory concepts, visual ideas and prototypes pushing the limits of current technologies."
        },
        doc_brand_title: { fr: 'Gumi. Brand Guidelines', en: 'Gumi. Brand Guidelines' },
        doc_brand_desc: {
            fr: 'Les brand guidelines Gumi: ton, systeme visuel, palette, typographie et principes de conception pour garder une identite coherente.',
            en: 'The Gumi brand guidelines: tone, visual system, palette, typography and design principles for a coherent identity.'
        },

        // Brand guidelines
        bg_maj: { fr: "Dernière mise à jour : août 2026", en: "Last updated: August 2026" },
        bg_titre: { fr: "Directives de marque", en: "Brand guidelines" },
        bg_note_hero: { fr: "Le système de pierre.gumi.ch", en: "The pierre.gumi.ch system" },
        bg_hero_sub: { fr: "Je dessine et je planifie mes projets sur du papier pointé. Le site est posé sur le même support, et cette page en donne les règles avant qu'elles passent sur le reste du portfolio.", en: "I sketch and plan my projects on dot-grid paper. The site sits on the same surface, and this page sets out the rules before they reach the rest of the portfolio." },
        bg_s1_titre: { fr: "Voix", en: "Voice" },
        bg_s1_intro: { fr: "Direct, créatif, sans jargon. J'adapte le propos à qui le lit.", en: "Direct, creative, no jargon. I pitch it to whoever is reading." },
        bg_s1_p1_titre: { fr: "Être direct et utile", en: "Be direct and useful" },
        bg_s1_p1_desc: { fr: "J'adapte mon discours à l'interlocuteur et expose clairement les caractéristiques du sujet.", en: "I adapt to whoever I am talking to and lay out the specifics of the subject clearly." },
        bg_s1_p1_oui1: { fr: "« Boostez votre ROI de 20 % avec cette structure de campagne Google Ads ciblée. »", en: "“Lift your ROI by 20% with this targeted Google Ads campaign structure.”" },
        bg_s1_p1_non1: { fr: "« Notre méthode magique va faire exploser vos ventes sur les moteurs de recherche ! »", en: "“Our magic method will make your search engine sales explode!”" },
        bg_s1_p2_titre: { fr: "Écrire comme un humain", en: "Write like a human" },
        bg_s1_p2_desc: { fr: "L'IA peut aider à écrire, mais tout ce qui trahit un texte généré doit disparaître : tirets cadratins, structures en miroir (« ce n'est pas X, c'est Y »), superlatifs creux, emojis décoratifs, listes surformatées. Le texte final doit sonner comme quelqu'un qui parle.", en: "AI can help with writing, but anything that gives away generated text has to go: em dashes, mirrored structures (“it’s not X, it’s Y”), empty superlatives, decorative emojis, over-formatted lists. The finished text should sound like someone talking." },
        bg_s1_p2_oui1: { fr: "« Un objectif clair : créer de l'impact, pour l'utilisateur et pour l'entreprise. »", en: "“One clear goal: create impact, for the user and for the business.”" },
        bg_s1_p2_non1: { fr: "« Un objectif clair — créer de l'impact — pour l'utilisateur et l'entreprise. »", en: "“One clear goal — creating impact — for the user and the business.”" },
        bg_s1_p3_titre: { fr: "Partager le processus", en: "Share the process" },
        bg_s1_p3_desc: { fr: "Je communique efficacement les enjeux et les délais afin d'avoir un contexte clair.", en: "I state what is at stake and when it lands, so everyone works from the same context." },
        bg_s1_p3_oui1: { fr: "« La V1 sera livrée mardi. Nous aurons besoin de vos retours avant jeudi midi. »", en: "“V1 ships Tuesday. We will need your feedback by Thursday noon.”" },
        bg_s1_p3_non1: { fr: "« On gère ça très vite, promis, ne vous inquiétez pas pour la suite. »", en: "“We will handle it quickly, promise, no need to worry about the rest.”" },
        bg_s2_titre: { fr: "Le papier", en: "The paper" },
        bg_s2_intro: { fr: "Une feuille de papier pointé, celle des carnets sur lesquels je dessine mes projets. Les titres s'écrivent sur ses rangées, et tout ce qu'on pose dessus est opaque.", en: "A sheet of dot-grid paper, the notebooks I sketch my projects on. Headings are written on its rows, and anything laid on top of it is opaque." },
        bg_s2_h1: { fr: "Une seule trame", en: "One single screen" },
        bg_s2_h1_texte: { fr: "Un halftone d'imprimeur. Les bords de page portent une trame pleine qui rétrécit vers le centre ; ce qui reste forme la grille. L'encre ne varie jamais, c'est la taille des points qui porte le ton.", en: "A printer's halftone. The page edges carry a full screen that shrinks towards the centre; what is left forms the grid. The ink never varies, dot size carries the tone." },
        bg_s2_t1: { fr: "La trame pleine, celle des bandes de dégradé.", en: "The full screen, used by the gradient bands." },
        bg_s2_t2: { fr: "La grille du milieu, une colonne et une rangée sur quatre. C'est elle qui porte les titres.", en: "The middle grid, one column and one row in four. This is what headings are written on." },
        bg_s2_t3: { fr: "Le rayon du point de grille. Il monte à 7 px au sommet de la page, et gagne encore 2,5 px vers les bords gauche et droit.", en: "The grid dot radius. It rises to 7px at the top of the page, and gains another 2.5px towards the left and right edges." },
        bg_s2_t4: { fr: "La hauteur des bandes denses, en haut comme en bas.", en: "The height of the dense bands, top and bottom alike." },
        bg_s2_t5: { fr: "L'encre du champ, identique sur toute la page.", en: "The field ink, identical across the whole page." },
        bg_s2_h2: { fr: "La rangée d'un titre", en: "A heading’s row" },
        bg_s2_h2_texte: { fr: "La ligne de base de chaque titre tombe sur une rangée de la grille, et cette rangée est retracée à une encre de 0,18. C'est la section qui se décale pour que le titre y arrive, jamais le titre seul.", en: "Every heading's baseline falls on a row of the grid, and that row is redrawn at 0.18 ink. It is the section that shifts so the heading lands there, never the heading on its own." },
        bg_s3_titre: { fr: "Couleurs", en: "Colours" },
        bg_s3_intro: { fr: "Une encre, un papier. La hiérarchie se fait à l'opacité, jamais en changeant de teinte. Le violet est réservé aux états interactifs.", en: "One ink, one paper. Hierarchy is built from opacity, never from a change of hue. Purple is reserved for interactive states." },
        bg_s3_h1: { fr: "L'échelle d'encre", en: "The ink scale" },
        bg_s3_h1_texte: { fr: "Dix valeurs, chacune avec un emploi. Cliquez sur une ligne pour copier sa valeur.", en: "Ten values, each with a job. Click a row to copy its value." },
        bg_encre_1: { fr: "Titres et texte fort", en: "Headings and strong text" },
        bg_encre_078: { fr: "Paragraphes et citations", en: "Body copy and quotes" },
        bg_encre_07: { fr: "Introductions de section", en: "Section introductions" },
        bg_encre_062: { fr: "Annotations manuscrites", en: "Handwritten annotations" },
        bg_encre_05: { fr: "Dates et mentions", en: "Dates and side notes" },
        bg_encre_045: { fr: "Légendes et texte éteint", en: "Captions and dimmed text" },
        bg_encre_014: { fr: "Filets et bordures", en: "Rules and borders" },
        bg_encre_012: { fr: "Bordures internes", en: "Inner borders" },
        bg_encre_0035: { fr: "Fonds de bloc", en: "Block backgrounds" },
        bg_encre_0022: { fr: "Fonds légers", en: "Light backgrounds" },
        bg_s3_h2: { fr: "Les deux thèmes", en: "The two themes" },
        bg_s3_h2_texte: { fr: "Le sombre n'est pas une inversion. Le papier devient un gris violacé, l'encre passe à l'ivoire, et le violet s'éclaircit pour garder son contraste.", en: "Dark is not an inversion. The paper turns a violet-tinted grey, the ink turns ivory, and the purple lightens to hold its contrast." },
        bg_theme_clair: { fr: "Clair", en: "Light" },
        bg_theme_papier: { fr: "Papier", en: "Paper" },
        bg_theme_encre: { fr: "Encre", en: "Ink" },
        bg_theme_inter: { fr: "Interaction", en: "Interaction" },
        bg_theme_sombre: { fr: "Sombre", en: "Dark" },
        bg_theme_papier2: { fr: "Papier", en: "Paper" },
        bg_theme_encre2: { fr: "Encre", en: "Ink" },
        bg_theme_inter2: { fr: "Interaction", en: "Interaction" },
        bg_s3_h3: { fr: "Le violet ne se voit qu'en réponse", en: "Purple only shows up in response" },
        bg_s3_h3_texte: { fr: "Sur pierre.gumi.ch, la couleur apparaît à quatre endroits : l'entrée courante du rail, le focus clavier, le survol d'un lien, et l'icône d'un projet ouvert. Partout ailleurs, l'encre suffit. Survolez ces liens pour voir la règle à l'œuvre.", en: "On pierre.gumi.ch the colour appears in four places: the current rail entry, keyboard focus, link hover, and the icon of an open project. Everywhere else, ink is enough. Hover these links to see the rule at work." },
        bg_s3_lien1: { fr: "Un lien au repos", en: "A link at rest" },
        bg_s3_lien2: { fr: "Un autre lien", en: "Another link" },
        bg_s3_lien_note: { fr: "Contraste vérifié : 6,3:1 en clair, 8,9:1 en sombre.", en: "Contrast checked: 6.3:1 on light, 8.9:1 on dark." },
        bg_s4_titre: { fr: "Typographie", en: "Typography" },
        bg_s4_intro: { fr: "Urbanist pour tout ce qui est imprimé, Cedarville Cursive pour tout ce qui est écrit à la main par-dessus. Un titre ne porte aucune ponctuation finale.", en: "Urbanist for everything printed, Cedarville Cursive for everything handwritten over it. A heading carries no closing punctuation." },
        bg_s4_h1: { fr: "Direct et créatif", en: "Direct and creative" },
        bg_s4_h2: { fr: "Outils et expérimentations", en: "Tools and experiments" },
        bg_s4_corps: { fr: "La variante Medium garantit une lisibilité maximale pour les interfaces et les descriptions d'outils. Propre, technique et fonctionnel. Chaque mot a sa place et l'épaisseur soutient le regard.", en: "The Medium weight keeps interfaces and tool descriptions as legible as possible. Clean, technical, functional. Every word has its place and the weight carries the eye." },
        bg_s4_main: { fr: "Ça, c'est écrit à la main.", en: "This part is handwritten." },
        bg_s5_titre: { fr: "Annotations", en: "Annotations" },
        bg_s5_intro: { fr: "Ce que j'ajoute dans la marge d'un carnet après coup. En absolu, hors du flux et hors de l'arbre d'accessibilité : retirez-les, la mise en page ne bouge pas. Elles sont centrées ici pour être comparées.", en: "What I add in a notebook margin after the fact. Absolutely positioned, out of the flow and out of the accessibility tree: remove them and the layout does not move. They are centred here so they can be compared." },
        bg_note1: { fr: "Elle pointe vers l'élément", en: "It points at the element" },
        bg_note_cadre1: { fr: "La flèche", en: "The arrow" },
        bg_note2: { fr: "Entouré après coup", en: "Circled afterwards" },
        bg_note_cadre2: { fr: "Le mot entouré", en: "The circled word" },
        bg_note3: { fr: "Soulignée d'un trait", en: "Underlined by hand" },
        bg_note_cadre3: { fr: "La note en marge", en: "The margin note" },
        bg_note4: { fr: "Une précision", en: "A clarification" },
        bg_note_cadre4: { fr: "L'astérisque", en: "The asterisk" },
        bg_note5: { fr: "C'est moi !", en: "That’s me!" },
        bg_note_cadre5: { fr: "La flèche courbe", en: "The curved arrow" },
        bg_note6a: { fr: "Relire la page", en: "Proofread the page" },
        bg_note6b: { fr: "Retirer le grain", en: "Drop the paper grain" },
        bg_note_cadre6: { fr: "La tâche, cochée ou non", en: "The task, ticked or not" },
        bg_note7a: { fr: "Ces trois-là", en: "These three" },
        bg_note7b: { fr: "vont ensemble", en: "belong together" },
        bg_note_cadre7: { fr: "L'accolade", en: "The brace" },
        bg_note8: { fr: "à insérer ici", en: "insert here" },
        bg_note_cadre8: { fr: "Le signe d'insertion", en: "The insertion mark" },
        bg_note9: { fr: "À revoir celui-là", en: "Take another look" },
        bg_note_cadre9: { fr: "Le trait ondulé", en: "The wavy underline" },
        bg_s5_h1: { fr: "Les règles", en: "The rules" },
        bg_s5_r1_t: { fr: "Encre", en: "Ink" },
        bg_s5_r1: { fr: "0,62. La même encre que la page, juste plus légère. Une note écrite à la main n'a pas de couleur à elle.", en: "0.62. The same ink as the page, just lighter. A handwritten note has no colour of its own." },
        bg_s5_r2_t: { fr: "Taille", en: "Size" },
        bg_s5_r2: { fr: "Une note tient sur une ligne et ne se coupe jamais. Sa taille suit la largeur de la fenêtre, et tout ce qui la compose est exprimé en em : elle grandit d'un bloc.", en: "A note fits on one line and never wraps. Its size follows the window width, and everything in it is expressed in em, so it grows as one piece." },
        bg_s5_r4_t: { fr: "Placement", en: "Placement" },
        bg_s5_r4: { fr: "En absolu contre l'élément annoté, avec un décalage exprimé en em : au-dessus du bord haut pour la flèche, dans la marge gauche pour la note en marge, sur la ligne du nom pour l'astérisque.", en: "Absolutely positioned against the annotated element, with an offset expressed in em: above the top edge for the arrow, in the left margin for the margin note, on the name's line for the asterisk." },
        bg_s5_r5_t: { fr: "Interaction", en: "Interaction" },
        bg_s5_r5: { fr: "pointer-events: none, sans exception. Une note ne se clique pas et ne masque jamais un lien qu'elle recouvre.", en: "pointer-events: none, without exception. A note is not clickable and never blocks a link it covers." },
        bg_s6_titre: { fr: "Icônes", en: "Icons" },
        bg_s6_intro: { fr: "Lucide, sans retouche. Grille de 24, trait de 2, extrémités et jonctions arrondies. La géométrie reste celle de la bibliothèque, ce qui garantit qu’une icône ajoutée plus tard tombe juste à côté des dix qui sont déjà là.", en: "Lucide, untouched. A 24 grid, a stroke of 2, rounded caps and joins. The geometry stays the library’s own, which is what guarantees that an icon added later sits properly beside the ten already here." },
        bg_s6_h1: { fr: "Les dix du site", en: "The site’s ten" },
        bg_s6_h1_texte: { fr: "Téléchargement, envoi, fichier, image, réglages, code, QR code, palette, expérimentation, lien. L’encre vient de currentColor : l’icône prend celle du texte qu’elle accompagne et suit le thème sans être redessinée.", en: "Download, upload, file, image, settings, code, QR code, palette, experiment, link. The ink comes from currentColor: an icon takes the colour of the text it accompanies and follows the theme without being redrawn." },
        bg_s6_h2: { fr: "Les trois tailles", en: "The three sizes" },
        bg_s6_h2_texte: { fr: "26 px dans une carte ou un bouton, 32 px pour une action isolée, 40 px pour une zone entière comme le dépôt de fichier. Le trait suit l’échelle du dessin : il pèse 2,2 px à 26 px et 3,3 px à 40 px. Au-delà, il fait masse, et un grand format se traite avec un visuel.", en: "26px in a card or a button, 32px for a standalone action, 40px for a whole zone such as the file drop. The stroke scales with the drawing: it weighs 2.2px at 26px and 3.3px at 40px. Past that it turns into a mass, and a large format is handled with an image." },
        bg_s7_titre: { fr: "Mouvement", en: "Motion" },
        bg_s7_intro: { fr: "Ce qui n'a pas été atteint est transparent et posé un cheveu plus bas. Rien n'est caché sans JavaScript, ni quand le système demande moins de mouvement.", en: "Anything not yet reached is transparent and sits a hair lower. Nothing is hidden without JavaScript, nor when the system asks for reduced motion." },
        bg_mvt1: { fr: "La courbe d'entrée. Rapide au départ, longue à s'arrêter.", en: "The entry curve. Fast off the mark, slow to settle." },
        bg_mvt2: { fr: "La montée d'un élément qui entre. Un titre posé sur sa rangée ne monte pas : il ne peut que se révéler sur place.", en: "The rise of an entering element. A heading set on its row does not rise: it can only reveal in place." },
        bg_mvt3: { fr: "Le décalage entre deux voisins qui entrent ensemble, jusqu'au sixième. Au-delà, le dernier attendrait trop.", en: "The offset between two neighbours entering together, up to the sixth. Past that, the last one would wait too long." },
        bg_mvt4: { fr: "Le fondu du papier, en une seule couche plutôt que sur ses milliers de points.", en: "The paper fade, as a single layer rather than across its thousands of dots." },
        bg_mvt5: { fr: "La durée du défilement adouci (Lenis), sur molette et tactile.", en: "The smooth scroll duration (Lenis), on wheel and touch." },
        bg_mvt6: { fr: "Tout ce qui précède disparaît. La page s'affiche dans son état final dès le premier rendu, sans exception.", en: "Everything above goes away. The page renders in its final state on the first paint, without exception." },
        bg_s8_titre: { fr: "UI Kit", en: "UI Kit" },
        bg_s8_intro: { fr: "Le neumorphisme est retiré : un relief simulé suppose une lumière, le papier n'en a pas. Une forme pleine, un contour, ou rien. L'état se dit par la couleur de la bordure et du texte.", en: "Neumorphism is gone: a simulated relief assumes a light source, and paper has none. A solid shape, an outline, or nothing. State is carried by the colour of the border and the text." },
        bg_ui_btn1: { fr: "Bouton plein", en: "Solid button" },
        bg_ui_btn2: { fr: "Bouton contour", en: "Outline button" },
        bg_ui_btn3: { fr: "Bouton nu", en: "Bare button" },
        bg_ui_bascule: { fr: "Bascule", en: "Toggle" },
        bg_ui_seg1: { fr: "Haut", en: "High" },
        bg_ui_seg2: { fr: "Moyen", en: "Medium" },
        bg_ui_seg3: { fr: "Bas", en: "Low" },
        bg_ui_depot1: { fr: "Déposez votre fichier ici", en: "Drop your file here" },
        bg_ui_depot2: { fr: "ou cliquez pour parcourir", en: "or click to browse" },
        bg_ui_carte1_t: { fr: "Carte de projet", en: "Project card" },
        bg_ui_carte1_d: { fr: "Un visuel, un titre, deux lignes. La bordure prend la couleur au survol, rien d'autre ne bouge.", en: "A visual, a title, two lines. The border takes the colour on hover, nothing else moves." },
        bg_ui_carte2_t: { fr: "Carte d'outil", en: "Tool card" },
        bg_ui_carte2_d: { fr: "Sans visuel, la carte se réduit à son filet et à son fond léger.", en: "With no visual, the card comes down to its rule and its light background." },
        bg_ui_etq1: { fr: "Contexte", en: "Context" },
        bg_ui_etq2: { fr: "Étiquette", en: "Tag" },
        bg_ui_etq3: { fr: "Étiquette", en: "Tag" },
        bg_s9_titre: { fr: "Images", en: "Imagery" },
        bg_s9_intro: { fr: "Des photographies brutes, cadrées serré, sans filtre. Même rayon et même filet que les blocs.", en: "Raw photographs, tightly framed, unfiltered. Same radius and same rule as the blocks." },
        bg_s10_titre: { fr: "Applications", en: "Applications" },
        bg_s10_intro: { fr: "Le système hors du site. Chaque rendu est composé en direct, aux dimensions exactes du fichier final. Ce sont des maquettes à recomposer, pas des exports.", en: "The system off the site. Each rendering is composed live, at the exact dimensions of the final file. They are mockups to rebuild, not exports." },
        bg_ban_phrase: { fr: "Je fais tenir ensemble le catalogue, les contenus et leur diffusion.", en: "I hold the catalogue, the content and its distribution together." },
        bg_ban_note: { fr: "Écrit sur le même papier", en: "Written on the same paper" },
        bg_ban_nom: { fr: "Bannière LinkedIn", en: "LinkedIn banner" },
        bg_carte_recto: { fr: "Carte de visite, recto", en: "Business card, front" },
        bg_carte_role: { fr: "E-commerce et donnée produit", en: "E-commerce and product data" },
        bg_carte_note: { fr: "Écrivez dessus", en: "Write on it" },
        bg_carte_verso: { fr: "Carte de visite, verso", en: "Business card, back" },
        bg_og_titre: { fr: "Outils et expérimentations", en: "Tools and experiments" },
        bg_og_phrase: { fr: "Des outils conçus par curiosité, pour donner vie à des idées.", en: "Tools built out of curiosity, to bring ideas to life." },
        bg_og_nom: { fr: "Image de partage", en: "Share image" },
        bg_av_nom: { fr: "Avatar", en: "Avatar" },
        bg_s10_h1: { fr: "Ce qui ne change jamais", en: "What never changes" },
        bg_app_r1_t: { fr: "La trame", en: "The screen" },
        bg_app_r1: { fr: "Elle garde son pas de 20 × 18 px en pixels réels, quelle que soit la taille du visuel. Une trame mise à l'échelle avec le cadre n'est plus la même matière.", en: "It keeps its 20 × 18px pitch in real pixels, whatever the size of the visual. A screen scaled with its frame is no longer the same material." },
        bg_app_r2_t: { fr: "L'encre", en: "The ink" },
        bg_app_r2: { fr: "Elle monte à 0,13 hors du site, contre 0,04 sur la page. Un visuel se regarde à distance et souvent compressé : à 0,04 la trame disparaît.", en: "It rises to 0.13 off the site, against 0.04 on the page. A visual is looked at from a distance and often compressed: at 0.04 the screen disappears." },
        bg_app_r3_t: { fr: "Le logotype", en: "The logotype" },
        bg_app_r3: { fr: "Toujours le fichier fourni, jamais retapé. C'est le seul endroit où le point de la marque subsiste.", en: "Always the supplied file, never retyped. It is the one place the brand's dot survives." },
        bg_s11_titre: { fr: "Ressources", en: "Assets" },
        bg_s11_intro: { fr: "Les logos et les matières du système, à télécharger pour les adaptations de visuels.", en: "The logos and materials of the system, downloadable for visual adaptations." },
        bg_res1_t: { fr: "Mot-symbole", en: "Wordmark" },
        bg_res1_d: { fr: "Le logo principal, pour la navigation et les fonds clairs.", en: "The main logo, for navigation and light backgrounds." },
        bg_dl_png: { fr: "Télécharger PNG", en: "Download PNG" },
        bg_res2_t: { fr: "Mot-symbole inversé", en: "Reversed wordmark" },
        bg_res2_d: { fr: "Pour les fonds sombres et les visuels photographiques.", en: "For dark backgrounds and photographic visuals." },
        bg_res3_t: { fr: "Monogramme", en: "Monogram" },
        bg_res3_d: { fr: "Pour les espaces compacts : avatars, favicons.", en: "For tight spaces: avatars, favicons." },
        bg_dl_png2: { fr: "Télécharger PNG", en: "Download PNG" },
        bg_res5_t: { fr: "Motif de points", en: "Dot pattern" },
        bg_res5_d: { fr: "La trame 20 × 18 px en quinconce, rayon de 3 à 7 px croissant vers les bords. Export 3200 × 500, fond transparent.", en: "The staggered 20 × 18px screen, radius from 3 to 7px growing towards the edges. 3200 × 500 export, transparent background." },
        bg_dl_full: { fr: "Pleine intensité", en: "Full intensity" },
        bg_dl_subtle: { fr: "Rendu site", en: "Site rendering" },
        bg_res6_t: { fr: "Les deux fontes", en: "The two typefaces" },
        bg_res6_d: { fr: "Urbanist et Cedarville Cursive, toutes deux sous licence SIL Open Font, servies en WOFF2 depuis le site.", en: "Urbanist and Cedarville Cursive, both under the SIL Open Font License, served as WOFF2 from the site." },
        bg_res7_t: { fr: "Jeu d'icônes", en: "Icon set" },
        bg_res7_d: { fr: "Lucide, sous licence ISC. Les dix icônes de la page en viennent, et toute icône ajoutée doit en venir aussi : c'est ce qui garantit qu'elle tombe sur la même grille.", en: "Lucide, under the ISC licence. The ten icons on this page come from it, and any icon added later has to come from it too: that is what keeps them all on the same grid." },
        bg_ui_champ: { fr: "Saisissez du texte…", en: "Type something…" },
        doc_404_title: { fr: 'Page introuvable | Gumi.', en: 'Page not found | Gumi.' },
        doc_conv_title: { fr: 'Convertisseur de fichiers - Gumi.', en: 'File converter - Gumi.' },
        doc_conv_desc: {
            fr: 'Convertissez localement des fichiers PDF, PSD, AI et images vers PNG, JPG, WebP, AVIF ou PDF, avec compression, redimensionnement et renommage.',
            en: 'Convert PDF, PSD, AI files and images to PNG, JPG, WebP, AVIF or PDF locally, with compression, resizing and renaming.'
        },
        doc_qr_title: { fr: 'Générateur QR Code - Gumi.', en: 'QR code generator - Gumi.' },
        doc_qr_desc: {
            fr: "Créez des QR codes personnalisés avec couleurs, formes et export PNG ou SVG dans l'outil Gumi.",
            en: 'Create custom QR codes with colors, shapes and PNG or SVG export in the Gumi tool.'
        },
        doc_media_title: { fr: 'Téléchargeur de médias - Gumi.', en: 'Media downloader - Gumi.' },
        doc_media_desc: {
            fr: 'Téléchargez un ou plusieurs médias depuis vos liens, avec extraction du lien direct et options de format.',
            en: 'Download one or more media files from your links, with direct-link extraction and format options.'
        },
        doc_txt_title: { fr: 'Modificateur de Texte - Gumi.', en: 'Text modifier - Gumi.' },
        doc_txt_desc: {
            fr: 'Modifiez rapidement vos textes: casse, nettoyage, filtres avances et transformations, directement dans le navigateur.',
            en: 'Quickly transform your text: case, cleanup, advanced filters and replacements, right in the browser.'
        },
        doc_contrast_title: { fr: 'Analyseur de contraste - Gumi.', en: 'Contrast checker - Gumi.' },
        doc_contrast_desc: {
            fr: 'Vérifiez le contraste de vos couleurs selon les normes WCAG : ratio, niveaux AA/AAA pour petit et grand texte, avec aperçu en direct.',
            en: 'Check your color contrast against WCAG standards: ratio, AA/AAA levels for small and large text, with a live preview.'
        },
        doc_ph_title: { fr: 'Texte de remplissage - Gumi.', en: 'Placeholder text - Gumi.' },
        doc_ph_desc: {
            fr: 'Générez du texte de remplissage lorem ipsum, pseudo-anglais ou pseudo-français, avec contrôle du nombre et de la taille des paragraphes.',
            en: 'Generate lorem ipsum, English-ish or French-ish filler text, with control over paragraph count and size.'
        },
        doc_vc_title: { fr: 'Compresseur de vidéos - Gumi.', en: 'Video compressor - Gumi.' },
        doc_vc_desc: {
            fr: 'Compressez localement vos vidéos MP4, MOV, AVI, WebM et MKV dans le navigateur, sans upload, avec choix de la qualité et de la résolution.',
            en: 'Compress MP4, MOV, AVI, WebM and MKV videos locally in the browser, no upload, with quality and resolution options.'
        },
        doc_pw_title: { fr: 'Générateur de mots de passe - Gumi.', en: 'Password generator - Gumi.' },
        doc_pw_desc: {
            fr: 'Générez des mots de passe robustes et aléatoires localement dans votre navigateur : longueur, majuscules, chiffres, symboles et indicateur de solidité.',
            en: 'Generate strong random passwords locally in your browser: length, uppercase, digits, symbols and a strength indicator.'
        },
        doc_sp_title: { fr: 'Aperçu de partage - Gumi.', en: 'Share preview - Gumi.' },
        doc_sp_desc: {
            fr: "Prévisualisez l'apparence de vos liens sur X, LinkedIn, Facebook, WhatsApp, Discord et plus, et vérifiez vos balises Open Graph.",
            en: 'Preview how your links look on X, LinkedIn, Facebook, WhatsApp, Discord and more, and check your Open Graph tags.'
        },
        doc_sr_title: { fr: 'Formats réseaux sociaux - Gumi.', en: 'Social media formats - Gumi.' },
        doc_sr_desc: {
            fr: 'Déclinez un visuel aux formats Instagram, X, LinkedIn, YouTube et plus : recadrage local avec point focal, sans upload.',
            en: 'Crop one visual into Instagram, X, LinkedIn, YouTube formats and more: local cropping with a focal point, no upload.'
        },
        doc_palette_title: { fr: 'Générateur de palettes - Gumi.', en: 'Palette generator - Gumi.' },
        doc_palette_desc: {
            fr: 'Créez des palettes de couleurs harmonieuses à partir d\'une couleur de base et exportez-les en HEX ou variables CSS, dans le navigateur.',
            en: 'Build harmonious color palettes from a base color and export them as HEX or CSS variables, in the browser.'
        },

        // Footer
        footer_title: { fr: "Envie d'échanger ?", en: 'Want to get in touch?' },
        footer_byline: { fr: '© 2026 Gumi · Conçu et développé par Pierre.', en: '© 2026 Gumi · Designed and built by Pierre.' },

        // CV landing (pierre.gumi.ch/cv, page cachée). Copy issue du brief
        // de refonte : source de vérité visible, FR et EN.
        doc_cv_title: { fr: "Pierre Gumilar · E-commerce & marketing digital", en: "Pierre Gumilar · E-commerce & digital marketing" },
        doc_cv_desc: { fr: "E-commerce, PIM, SEO, acquisition et contenu : découvrez le parcours, les réalisations et les résultats de Pierre Gumilar.", en: "E-commerce, PIM, SEO, acquisition and content: explore Pierre Gumilar’s experience, selected work and results." },
        cv_nav_work: { fr: "Réalisations", en: "Selected work" },
        cv_nav_career: { fr: "Parcours", en: "Career" },
        cv_nav_skills: { fr: "Compétences", en: "Skills" },
        cv_nav_quotes: { fr: "Témoignages", en: "Testimonials" },
        cv_nav_sections: { fr: "Sections", en: "Sections" },
        cv_cta_write: { fr: "Me contacter", en: "Contact me" },
        // La relation de travail, en tête de chaque attribution.

        exp_card_ardacraft_social: { fr: "Emprunter les codes du voyage pour filmer la Terre du Milieu : 27 millions de vues en sept mois.", en: "Borrowing travel-reel grammar to film Middle-earth: 27 million views in seven months." },

        // Tools shared
        back_tools: { fr: 'Retour aux outils', en: 'Back to tools' },
        tooltip_offline: { fr: 'Fonctionne hors ligne', en: 'Works offline' },
        tooltip_online: { fr: 'Connexion internet requise', en: 'Internet connection required' },
        paste_added: { fr: 'Image collée ajoutée.', en: 'Pasted image added.' },
        share_link: { fr: 'Copier le lien de partage', en: 'Copy share link' },
        share_copied: { fr: 'Lien copié !', en: 'Link copied!' },

        // File converter tool
        conv_format_label: { fr: "Format d'export", en: 'Export format' },
        conv_advanced: { fr: 'Paramètres avancés', en: 'Advanced settings' },
        conv_compression_label: { fr: 'Compression', en: 'Compression' },
        conv_q_lossless: { fr: 'Sans perte', en: 'Lossless' },
        conv_q_high: { fr: 'Haute', en: 'High' },
        conv_q_medium: { fr: 'Moyenne', en: 'Medium' },
        conv_q_low: { fr: 'Basse', en: 'Low' },
        conv_dimensions: { fr: 'Dimensions', en: 'Dimensions' },
        conv_width: { fr: 'Largeur', en: 'Width' },
        conv_height: { fr: 'Hauteur', en: 'Height' },
        conv_rename: { fr: 'Renommer en séquence', en: 'Rename in sequence' },
        conv_convert_btn: { fr: 'Convertir les fichiers', en: 'Convert files' },
        conv_dropzone: { fr: 'Déposez vos fichiers ici', en: 'Drop your files here' },
        conv_dropzone_hint: { fr: '.psd, .pdf, .ai, images', en: '.psd, .pdf, .ai, images' },
        conv_clear: { fr: 'Vider', en: 'Clear' },
        conv_download_all: { fr: 'Tout télécharger', en: 'Download all' },
        conv_zipping: { fr: 'Création du ZIP...', en: 'Creating ZIP...' },
        conv_zip_error: { fr: 'Impossible de créer le ZIP. Téléchargez les fichiers un par un.', en: 'Could not create the ZIP. Download the files one by one.' },
        conv_tooltip: {
            fr: '<strong>Conversion 100% locale :</strong><br><br>1. Glissez des fichiers .psd, .ai, .pdf ou des images.<br>2. Choisissez le format de sortie.<br>3. (Optionnel) Ajustez compression, dimensions et renommage dans les paramètres avancés.<br><br><i>Aucune donnée n\'est envoyée sur nos serveurs.</i>',
            en: '<strong>100% local conversion:</strong><br><br>1. Drop .psd, .ai, .pdf files or images.<br>2. Pick the output format.<br>3. (Optional) Adjust compression, dimensions and renaming in the advanced settings.<br><br><i>No data is ever sent to our servers.</i>'
        },

        // QR code tool
        qr_content_label: { fr: 'Contenu (lien, texte, email...)', en: 'Content (link, text, email...)' },
        qr_content_placeholder: { fr: 'https://votre-lien.com', en: 'https://your-link.com' },
        qr_style_appearance: { fr: 'Style & apparence', en: 'Style & appearance' },
        qr_dot_shape: { fr: 'Forme des points', en: 'Dot shape' },
        qr_shape_square: { fr: 'Carré', en: 'Square' },
        qr_shape_rounded: { fr: 'Arrondi', en: 'Rounded' },
        qr_shape_dots: { fr: 'Points', en: 'Dots' },
        qr_color_code: { fr: 'Couleur du code', en: 'Code color' },
        qr_color_bg: { fr: 'Couleur du fond', en: 'Background color' },
        qr_custom_color: { fr: 'Couleur personnalisée', en: 'Custom color' },
        qr_generate: { fr: 'Générer le QR Code', en: 'Generate QR code' },
        qr_placeholder_hint: { fr: 'Votre QR code<br>apparaîtra ici', en: 'Your QR code<br>will appear here' },
        qr_download: { fr: 'Télécharger', en: 'Download' },
        qr_empty_error: { fr: 'Veuillez entrer un texte ou un lien.', en: 'Please enter some text or a link.' },
        qr_lib_error: { fr: 'Bibliothèque QR indisponible.', en: 'QR library unavailable.' },
        qr_tooltip: {
            fr: '<strong>Créez un QR code rapide et propre.</strong><br><br>Saisissez votre contenu : l\'aperçu se met à jour en direct. Choisissez un style et n\'importe quelle couleur, puis exportez en PNG ou SVG.',
            en: '<strong>Create a clean QR code in seconds.</strong><br><br>Type your content and the preview updates live. Pick a style and any color, then export as PNG or SVG.'
        },

        // Text modifier tool
        txt_source: { fr: 'Texte source', en: 'Source text' },
        txt_source_placeholder: { fr: 'Collez ou tapez votre texte ici...', en: 'Paste or type your text here...' },
        txt_quick_actions: { fr: 'Actions rapides', en: 'Quick actions' },
        txt_uppercase: { fr: 'MAJUSCULES', en: 'UPPERCASE' },
        txt_lowercase: { fr: 'minuscules', en: 'lowercase' },
        txt_capitalize: { fr: 'Capitaliser mots', en: 'Capitalize Words' },
        txt_sentence: { fr: 'Casse phrase', en: 'Sentence case' },
        txt_slugify: { fr: 'format-slug-url', en: 'slug-url-format' },
        txt_remove_accents: { fr: 'Sans accents', en: 'Remove accents' },
        txt_clean: { fr: 'Nettoyer les espaces', en: 'Clean up spaces' },
        txt_advanced: { fr: 'Filtres avancés', en: 'Advanced filters' },
        txt_targeting: { fr: 'Ciblage par mots', en: 'Word targeting' },
        txt_targeting_placeholder: { fr: 'Ex: urgent, erreur', en: 'e.g. urgent, error' },
        txt_target_upper: { fr: 'Cibles MAJ', en: 'Targets UPPER' },
        txt_target_bold: { fr: 'Cibles **Gras**', en: 'Targets **Bold**' },
        txt_find_replace: { fr: 'Rechercher & Remplacer', en: 'Find & Replace' },
        txt_search_placeholder: { fr: 'Texte à rechercher...', en: 'Text to find...' },
        txt_replace_placeholder: { fr: 'Remplacer par...', en: 'Replace with...' },
        txt_result: { fr: 'Résultat', en: 'Result' },
        txt_result_placeholder: { fr: 'Le texte modifié apparaîtra ici...', en: 'The modified text will appear here...' },
        txt_words: { fr: 'Mots', en: 'Words' },
        txt_chars: { fr: 'Caractères', en: 'Characters' },
        txt_lines: { fr: 'Lignes', en: 'Lines' },
        txt_copy: { fr: 'Copier le résultat', en: 'Copy result' },
        txt_copied: { fr: 'Copié !', en: 'Copied!' },
        txt_tooltip: {
            fr: '<strong>Traitement côté client :</strong><br><br>Modifiez instantanément votre texte. Combinez les formats de base avec des filtres avancés.<br><br><i>Aucune donnée n\'est envoyée sur nos serveurs.</i>',
            en: '<strong>Client-side processing:</strong><br><br>Transform your text instantly. Combine the basic formats with advanced filters.<br><br><i>No data is ever sent to our servers.</i>'
        },

        // Media downloader tool
        md_links_label: { fr: 'Liens des vidéos (un par ligne)', en: 'Video links (one per line)' },
        md_extract_btn: { fr: 'Extraire les médias', en: 'Extract media' },
        md_extract_retry: { fr: 'Réessayer l\'extraction', en: 'Retry extraction' },
        md_extracting: { fr: 'Extraction en cours...', en: 'Extracting...' },
        md_advanced: { fr: 'Paramètres avancés', en: 'Advanced settings' },
        md_format_label: { fr: 'Format souhaité', en: 'Desired format' },
        md_video_audio: { fr: 'Vidéo + Son', en: 'Video + Audio' },
        md_audio_only: { fr: 'Audio seul', en: 'Audio only' },
        md_video_only: { fr: 'Vidéo sans son', en: 'Video, no audio' },
        md_extract_thumb: { fr: 'Extraire la miniature', en: 'Extract thumbnail' },
        md_waiting: { fr: 'En attente de liens...', en: 'Waiting for links...' },
        md_download_all: { fr: 'Tout télécharger', en: 'Download all' },
        md_card_ready: { fr: 'Média prêt', en: 'Media ready' },
        md_ready_single: { fr: 'média extrait', en: 'media extracted' },
        md_ready_plural: { fr: 'médias extraits', en: 'media extracted' },
        md_warming: { fr: 'Réveil du serveur... tentative', en: 'Waking the server... attempt' },
        md_error_api: {
            fr: "Le serveur d'extraction est indisponible pour le moment. Réessayez dans quelques instants.",
            en: 'The extraction server is unavailable right now. Please try again in a moment.'
        },
        md_toast_started: { fr: 'Téléchargement lancé avec succès !', en: 'Download started successfully!' },
        md_toast_opened: {
            fr: 'Fichier ouvert dans un nouvel onglet. (Clic droit > Enregistrer sous...)',
            en: 'File opened in a new tab. (Right click > Save as...)'
        },
        md_toast_downloads: { fr: 'Téléchargements en cours.', en: 'Downloads in progress.' },
        md_toast_none: {
            fr: "Aucun média prêt. Vérifiez vos liens puis réessayez.",
            en: 'No media ready. Check your links and try again.'
        },
        md_tooltip: {
            fr: '<strong>Pré-chargement furtif :</strong><br><br>Collez vos liens (un par ligne). Le système pré-charge les médias en arrière-plan instantanément. Cliquez sur extraire pour récupérer vos fichiers.<br><br><i>Outil personnel, réservé à un usage privé : ne téléchargez que des contenus dont vous détenez les droits ou l\'autorisation.</i>',
            en: '<strong>Silent pre-loading:</strong><br><br>Paste your links (one per line). The system pre-loads media in the background instantly. Click extract to grab your files.<br><br><i>Personal tool, for private use only: download only content you own or have permission to save.</i>'
        },

        // Placeholder text tool
        ph_style: { fr: 'Style de texte', en: 'Text style' },
        ph_english: { fr: 'Anglais', en: 'English' },
        ph_french: { fr: 'Français', en: 'French' },
        ph_count: { fr: 'Nombre de paragraphes', en: 'Number of paragraphs' },
        ph_size: { fr: 'Taille des paragraphes', en: 'Paragraph size' },
        ph_short: { fr: 'Court', en: 'Short' },
        ph_medium: { fr: 'Moyen', en: 'Medium' },
        ph_long: { fr: 'Long', en: 'Long' },
        ph_generate: { fr: 'Générer le texte', en: 'Generate text' },
        ph_regenerate: { fr: 'Régénérer', en: 'Regenerate' },
        ph_placeholder_hint: { fr: 'Votre texte apparaîtra ici...', en: 'Your text will appear here...' },
        ph_paragraphs: { fr: 'Paragraphes', en: 'Paragraphs' },
        ph_words: { fr: 'Mots', en: 'Words' },
        ph_chars: { fr: 'Caractères', en: 'Characters' },
        ph_copy: { fr: 'Copier le texte', en: 'Copy text' },
        ph_copied: { fr: 'Copié !', en: 'Copied!' },
        ph_tooltip: {
            fr: '<strong>Texte de remplissage instantané :</strong><br><br>1. Choisissez un style : lorem ipsum classique, pseudo-anglais ou pseudo-français.<br>2. Réglez le nombre et la taille des paragraphes.<br>3. Générez, puis copiez le résultat en un clic.<br><br><i>Tout est généré localement, rien n\'est envoyé sur nos serveurs.</i>',
            en: '<strong>Instant filler text:</strong><br><br>1. Pick a style: classic lorem ipsum, English-ish or French-ish.<br>2. Set the number and size of paragraphs.<br>3. Generate, then copy the result in one click.<br><br><i>Everything is generated locally, nothing is sent to our servers.</i>'
        },

        // Video compressor tool
        vc_compression: { fr: 'Compression', en: 'Compression' },
        vc_light: { fr: 'Légère', en: 'Light' },
        vc_balanced: { fr: 'Équilibrée', en: 'Balanced' },
        vc_strong: { fr: 'Forte', en: 'Strong' },
        vc_advanced: { fr: 'Paramètres avancés', en: 'Advanced settings' },
        vc_max_res: { fr: 'Résolution maximale', en: 'Maximum resolution' },
        vc_res_original: { fr: 'Originale', en: 'Original' },
        vc_mute: { fr: 'Supprimer le son', en: 'Remove audio' },
        vc_compress_btn: { fr: 'Compresser les vidéos', en: 'Compress videos' },
        vc_compressing: { fr: 'Compression en cours...', en: 'Compressing...' },
        vc_dropzone: { fr: 'Déposez vos vidéos ici', en: 'Drop your videos here' },
        vc_clear: { fr: 'Vider', en: 'Clear' },
        vc_download_all: { fr: 'Tout télécharger', en: 'Download all' },
        vc_engine_loading: { fr: 'Chargement du moteur vidéo (~31 Mo), une seule fois...', en: 'Loading the video engine (~31 MB), one time only...' },
        vc_tooltip: {
            fr: '<strong>Compression 100% locale :</strong><br><br>1. Glissez des vidéos .mp4, .mov, .avi, .webm ou .mkv.<br>2. Choisissez le niveau de compression (et la résolution dans les paramètres avancés).<br>3. Lancez la compression : la sortie est un MP4 universel.<br><br><i>Le traitement se fait dans votre navigateur, aucune vidéo n\'est envoyée sur nos serveurs. Les gros fichiers peuvent prendre plusieurs minutes.</i>',
            en: '<strong>100% local compression:</strong><br><br>1. Drop .mp4, .mov, .avi, .webm or .mkv videos.<br>2. Choose the compression level (and resolution in advanced settings).<br>3. Start compressing: the output is a universal MP4.<br><br><i>Processing happens in your browser, no video is ever sent to our servers. Large files can take several minutes.</i>'
        },

        // Password generator tool
        pw_length: { fr: 'Longueur', en: 'Length' },
        pw_chars: { fr: 'Caractères', en: 'Characters' },
        pw_lower: { fr: 'Minuscules (a-z)', en: 'Lowercase (a-z)' },
        pw_upper: { fr: 'Majuscules (A-Z)', en: 'Uppercase (A-Z)' },
        pw_digits: { fr: 'Chiffres (0-9)', en: 'Digits (0-9)' },
        pw_symbols: { fr: 'Symboles (!@#$%...)', en: 'Symbols (!@#$%...)' },
        pw_advanced: { fr: 'Paramètres avancés', en: 'Advanced settings' },
        pw_exclude_ambiguous: { fr: 'Exclure les caractères ambigus (0, O, l, 1, I)', en: 'Exclude ambiguous characters (0, O, l, 1, I)' },
        pw_generate: { fr: 'Générer un mot de passe', en: 'Generate a password' },
        pw_regenerate: { fr: 'Régénérer', en: 'Regenerate' },
        pw_placeholder_hint: { fr: 'Votre mot de passe apparaîtra ici...', en: 'Your password will appear here...' },
        pw_copy: { fr: 'Copier le mot de passe', en: 'Copy password' },
        pw_copied: { fr: 'Copié !', en: 'Copied!' },
        pw_no_charset: { fr: 'Activez au moins un type de caractères.', en: 'Enable at least one character type.' },
        pw_bits: { fr: 'bits d\'entropie', en: 'bits of entropy' },
        pw_s1: { fr: 'Très faible', en: 'Very weak' },
        pw_s2: { fr: 'Faible', en: 'Weak' },
        pw_s3: { fr: 'Correct', en: 'Fair' },
        pw_s4: { fr: 'Solide', en: 'Strong' },
        pw_s5: { fr: 'Excellent', en: 'Excellent' },
        pw_tooltip: {
            fr: '<strong>Génération 100% locale :</strong><br><br>1. Choisissez la longueur et les types de caractères.<br>2. Générez autant de fois que nécessaire.<br>3. Cliquez sur le mot de passe ou sur le bouton pour le copier.<br><br><i>Le tirage utilise le générateur cryptographique du navigateur. Rien n\'est envoyé ni stocké sur nos serveurs.</i>',
            en: '<strong>100% local generation:</strong><br><br>1. Choose the length and character types.<br>2. Generate as many times as you like.<br>3. Click the password or the button to copy it.<br><br><i>It uses the browser\'s cryptographic random generator. Nothing is sent to or stored on our servers.</i>'
        },

        // Palette generator tool
        pal_seed_label: { fr: 'Couleur de base', en: 'Base color' },
        pal_harmony_label: { fr: "Type d'harmonie", en: 'Harmony type' },
        pal_h_complementary: { fr: 'Complément.', en: 'Complement.' },
        pal_h_analogous: { fr: 'Analogue', en: 'Analogous' },
        pal_h_triadic: { fr: 'Triade', en: 'Triadic' },
        pal_h_tetradic: { fr: 'Tétrade', en: 'Tetradic' },
        pal_h_mono: { fr: 'Mono', en: 'Mono' },
        pal_copy_hex: { fr: 'Copier les HEX', en: 'Copy HEX' },
        pal_copy_css: { fr: 'Copier en CSS', en: 'Copy as CSS' },
        pal_copy_one: { fr: 'Copier', en: 'Copy' },
        pal_copied: { fr: 'Copié !', en: 'Copied!' },
        pal_tooltip: {
            fr: "<strong>Des palettes harmonieuses en un clic :</strong><br><br>Choisissez une couleur de base et un type d'harmonie. Cliquez une couleur pour copier son code, ou exportez toute la palette en HEX ou variables CSS.<br><br><i>Tout est calculé localement, rien n'est envoyé sur nos serveurs.</i>",
            en: '<strong>Harmonious palettes in one click:</strong><br><br>Pick a base color and a harmony type. Click a color to copy its code, or export the whole palette as HEX or CSS variables.<br><br><i>Everything is computed locally, nothing is sent to our servers.</i>'
        },

        // Social formats tool
        sr_dropzone: { fr: 'Déposez votre visuel ici', en: 'Drop your visual here' },
        sr_dropzone_hint: { fr: 'PNG, JPG, WebP...', en: 'PNG, JPG, WebP...' },
        sr_focal_label: { fr: 'Point focal', en: 'Focal point' },
        sr_focal_hint: {
            fr: 'Déplacez le point : chaque format restera cadré dessus.',
            en: 'Move the dot: every format stays framed around it.'
        },
        sr_output_label: { fr: 'Format de sortie', en: 'Output format' },
        sr_formats_label: { fr: 'Formats à générer', en: 'Formats to generate' },
        sr_export_btn: { fr: 'Générer les formats', en: 'Generate formats' },
        sr_exporting: { fr: 'Génération...', en: 'Generating...' },
        sr_download: { fr: 'Télécharger', en: 'Download' },
        sr_download_all: { fr: 'Tout télécharger', en: 'Download all' },
        sr_placeholder: { fr: 'Vos déclinaisons apparaîtront ici...', en: 'Your exports will appear here...' },
        sr_err_image: { fr: 'Veuillez déposer une image.', en: 'Please drop an image.' },
        sr_err_none: { fr: 'Cochez au moins un format.', en: 'Select at least one format.' },
        sr_err_export: { fr: "L'export a échoué, réessayez.", en: 'Export failed, please try again.' },
        sr_f_post: { fr: 'Post', en: 'Post' },
        sr_f_portrait: { fr: 'Portrait', en: 'Portrait' },
        sr_f_story: { fr: 'Story / Reel', en: 'Story / Reel' },
        sr_f_cover: { fr: 'Couverture', en: 'Cover' },
        sr_f_header: { fr: 'Bannière', en: 'Header' },
        sr_f_banner: { fr: 'Bannière', en: 'Banner' },
        sr_f_thumb: { fr: 'Miniature', en: 'Thumbnail' },
        sr_f_pin: { fr: 'Épingle', en: 'Pin' },
        sr_tooltip: {
            fr: "<strong>Un visuel, tous les formats :</strong><br><br>1. Déposez une image.<br>2. Placez le point focal : chaque recadrage restera centré dessus.<br>3. Cochez les formats voulus et exportez.<br><br><i>Le recadrage se fait dans votre navigateur, aucune image n'est envoyée sur nos serveurs.</i>",
            en: '<strong>One visual, every format:</strong><br><br>1. Drop an image.<br>2. Place the focal point: every crop stays centered on it.<br>3. Tick the formats you need and export.<br><br><i>Cropping happens in your browser, no image is ever sent to our servers.</i>'
        },

        // Share preview tool
        sp_url_label: { fr: 'Lien à prévisualiser', en: 'Link to preview' },
        sp_url_placeholder: { fr: 'https://votre-site.com/page', en: 'https://your-site.com/page' },
        sp_fetch: { fr: 'Générer les aperçus', en: 'Generate previews' },
        sp_fetching: { fr: 'Analyse du lien...', en: 'Analyzing link...' },
        sp_placeholder: { fr: 'Les aperçus apparaîtront ici...', en: 'Your previews will appear here...' },
        sp_from: { fr: 'De', en: 'From' },
        sp_error_invalid: { fr: 'Veuillez entrer un lien valide.', en: 'Please enter a valid link.' },
        sp_error_fetch: {
            fr: 'Impossible de récupérer cette page. Vérifiez le lien puis réessayez.',
            en: "Couldn't fetch this page. Check the link and try again."
        },
        sp_audit_title: { fr: 'Diagnostic des balises', en: 'Tag diagnostics' },
        sp_a_ogtitle_ok: { fr: 'Balise og:title présente.', en: 'og:title tag present.' },
        sp_a_ogtitle_bad: { fr: 'Balise og:title manquante : le titre de la page est utilisé à la place.', en: 'og:title tag missing: the page title is used instead.' },
        sp_a_ogdesc_ok: { fr: 'Balise og:description présente.', en: 'og:description tag present.' },
        sp_a_ogdesc_bad: { fr: 'Balise og:description manquante.', en: 'og:description tag missing.' },
        sp_a_ogimage_ok: { fr: 'Balise og:image présente.', en: 'og:image tag present.' },
        sp_a_ogimage_bad: { fr: "Balise og:image manquante : la plupart des plateformes n'afficheront pas de visuel.", en: "og:image tag missing: most platforms won't show a visual." },
        sp_a_twcard_ok: { fr: 'Balise twitter:card présente.', en: 'twitter:card tag present.' },
        sp_a_twcard_warn: { fr: 'Balise twitter:card absente : X utilisera un petit aperçu par défaut.', en: 'twitter:card tag missing: X will fall back to a small preview.' },
        sp_a_title_long: { fr: 'Titre long (60+ caractères) : il sera tronqué sur plusieurs plateformes.', en: 'Long title (60+ characters): it will be truncated on several platforms.' },
        sp_a_desc_long: { fr: 'Description longue (200+ caractères) : elle sera tronquée presque partout.', en: 'Long description (200+ characters): it will be truncated almost everywhere.' },
        sp_a_img_ok: { fr: 'Image au bon format (1200×630 recommandé).', en: 'Image dimensions look good (1200×630 recommended).' },
        sp_a_img_small: { fr: 'Image trop petite : 1200×630 px recommandé, 600 px de large minimum.', en: 'Image too small: 1200×630 px recommended, 600 px wide minimum.' },
        sp_a_img_ratio: { fr: 'Ratio d\'image éloigné du 1,91:1 attendu : des recadrages sont probables.', en: 'Image ratio far from the expected 1.91:1: cropping is likely.' },
        sp_tooltip: {
            fr: "<strong>Visualisez vos liens avant de les partager.</strong><br><br>Collez un lien : l'outil lit ses balises Open Graph et affiche l'aperçu tel qu'il apparaîtra sur chaque plateforme, avec un diagnostic des balises manquantes.",
            en: '<strong>See your links before you share them.</strong><br><br>Paste a link: the tool reads its Open Graph tags and shows the preview as it will appear on each platform, with a diagnostic of missing tags.'
        },

        fond_signature: { fr: "Conçu par", en: "Designed by" },
        // --- Refonte du CV (page /fond) ---------------------------------
        // Le francais de chaque entree est exactement celui de la page : le
        // dictionnaire ne doit jamais reecrire la copie, seulement la traduire.
        // Les entrees rendues en texte brut sont stockees decodees ; seules
        // celles qui portent du balisage gardent leurs entites.
        fond_1: { fr: "Je m'appelle <strong>Pierre</strong>, <strong>responsable marketing digital</strong>&nbsp;: j'optimise les <strong>ventes e-commerce</strong> en combinant <strong>contenu, data produit, acquisition et UX</strong>, et je recherche un <strong>CDI dès septembre 2026</strong> sur site ou en remote (France, Belgique, Suisse, Luxembourg).", en: "My name is <strong>Pierre</strong>, <strong>digital marketing manager</strong>: I grow <strong>e-commerce sales</strong> by combining <strong>content, product data, acquisition and UX</strong>, and I am looking for a <strong>permanent role from September 2026</strong>, on site or remote (France, Belgium, Switzerland, Luxembourg)." },
        fond_2: { fr: "Fiches produits enrichies", en: "Enriched product records" },
        fond_3: { fr: "Trafic organique de lindt.fr", en: "Organic traffic on lindt.fr" },
        fond_4: { fr: "Réservations attribuées à Google Ads", en: "Bookings attributed to Google Ads" },
        fond_5: { fr: "Assets e-commerce coordonnés", en: "E-commerce assets coordinated" },
        fond_6: { fr: "Magento · Salsify", en: "Magento · Salsify" },
        fond_7: { fr: "Fin 2023 – mi-2026", en: "Late 2023 – mid-2026" },
        fond_8: { fr: "Émeraude Aventure", en: "Emeraude Aventure" },
        fond_9: { fr: "Production · validation · diffusion", en: "Production · approval · distribution" },
        fond_10: { fr: "Trois projets et leurs résultats", en: "Three projects and their results" },
        fond_11: { fr: "Mon parcours", en: "My background" },
        fond_12: { fr: "Mes compétences", en: "My skills" },
        fond_13: { fr: "Des recommandations", en: "Recommendations" },
        fond_14: { fr: "Mes deux passions", en: "My two passions" },
        fond_15: { fr: "Parlons-en !", en: "Let's talk!" },
        fond_16: { fr: "Faire grandir le contenu e-commerce sans perdre en cohérence.", en: "Scaling e-commerce content without losing consistency." },
        fond_17: { fr: "Construire et faire grandir un écosystème digital.", en: "Building and growing a digital ecosystem." },
        fond_18: { fr: "Transformer un budget média en réservations directes.", en: "Turning media spend into direct bookings." },
        fond_22: { fr: "Chez Lindt, je fais le lien entre la donnée produit, les contenus et leur diffusion en ligne. Je structure le catalogue et le PIM Salsify, coordonne les contenus pour Amazon et les e-retailers, et pilote les shootings ainsi que la direction artistique.", en: "At Lindt, I connect product data, content and online distribution. I structure the catalogue and Salsify PIM, coordinate Amazon and e-retail content, and lead photoshoots and art direction." },
        fond_23: { fr: "Sur plus de 7 000 assets, mon rôle consiste principalement à coordonner. J'en produis aussi une partie, puis je les valide et les diffuse. J'ai également structuré les méthodes de travail pour rendre l'enrichissement et la validation plus simples à l'échelle du catalogue.", en: "Across more than 7,000 assets, my role is primarily to coordinate. I also produce some of the content myself, then approve and distribute it. I have also structured working methods that make enrichment and approval easier across the catalogue." },
        fond_24: { fr: "ArdaCraft est le projet où j'expérimente le plus. J'y ai mené la refonte du site, conçu une carte interactive à partir d'une opportunité SEO et développé une nouvelle approche des formats vidéo.", en: "ArdaCraft is where I test and build new ideas. I led the website redesign, designed an interactive map around an SEO opportunity and developed a new approach to short-form video." },
        fond_25: { fr: "Ces chantiers partent de problèmes différents, mais suivent la même logique : observer ce qui fonctionne ailleurs, l'adapter au contexte d'ArdaCraft, puis mesurer ce qui change réellement.", en: "These projects started with different problems but followed the same process: observe what already works elsewhere, adapt it to ArdaCraft, then measure the real impact." },
        fond_26: { fr: "Pour Émeraude Aventure, une base nautique bretonne, j'ai structuré et optimisé les campagnes Google Ads avec un objectif simple : générer davantage de réservations directes tout en maîtrisant leur coût d'acquisition.", en: "For Emeraude Aventure, a water sports centre in Brittany, I structured and optimised the Google Ads campaigns with a simple goal: generate more direct bookings while keeping acquisition costs under control." },
        fond_27: { fr: "500 → 5 000 fiches enrichies", en: "500 → 5,000 enriched product records" },
        fond_28: { fr: "+180 % de trafic organique sur lindt.fr, de fin 2023 à mi-2026", en: "+180% organic traffic on lindt.fr, from late 2023 to mid-2026" },
        fond_29: { fr: "7 000+ assets coordonnés", en: "7,000+ assets coordinated" },
        fond_32: { fr: "Coûts d'hébergement divisés par 10", en: "Hosting costs divided by 10" },
        fond_33: { fr: "Usage des filtres multiplié par 6,5", en: "Filter usage multiplied by 6.5" },
        fond_34: { fr: "50 % du trafic hors marque désormais généré par la carte", en: "The map now generates 50% of non-branded traffic" },
        fond_35: { fr: "8 000 → 115 000 abonnés", en: "8,000 → 115,000 followers" },
        fond_36: { fr: "27,3 millions de vues sur 24 vidéos", en: "27.3 million views on 24 videos" },
        fond_37: { fr: "500+ réservations attribuées", en: "500+ attributed bookings" },
        fond_38: { fr: "1,99 € par réservation", en: "€1.99 per booking" },
        fond_39: { fr: "Expérience", en: "Experience" },
        fond_40: { fr: "Formation", en: "Education" },
        fond_41: { fr: "Langues", en: "Languages" },
        fond_42: { fr: "2023 – août 2026", en: "2023 – Aug 2026" },
        fond_43: { fr: "Depuis 2022", en: "since 2022" },
        fond_44: { fr: "Français", en: "French" },
        fond_45: { fr: "Anglais", en: "English" },
        fond_46: { fr: "<strong>E-Commerce Content Manager · Lindt &amp; Sprüngli, Paris</strong>", en: "E-Commerce Content Manager · Lindt & Sprüngli, Paris" },
        fond_47: { fr: "Consulting et projets indépendants · multi-secteurs", en: "Consulting and independent projects · multi-industry" },
        fond_48: { fr: "Assistant Marketing Digital, stage · Lindt & Sprüngli, Paris", en: "Digital Marketing Assistant, internship · Lindt & Sprüngli, Paris" },
        fond_49: { fr: "Assistant SEO Manager · Nutri & Co, Aix-en-Provence", en: "SEO Manager Assistant · Nutri & Co, Aix-en-Provence" },
        fond_50: { fr: "Assistant Marketing Opérationnel · EXKI, Bruxelles", en: "Operational Marketing Assistant · EXKI, Brussels" },
        fond_51: { fr: "MSc Marketing & Services Management · IAE Aix School of Management", en: "MSc Marketing & Services Management · IAE Aix School of Management" },
        fond_52: { fr: "DUETI Business · University of the West of Scotland", en: "DUETI Business · University of the West of Scotland" },
        fond_53: { fr: "Langue natale", en: "Native language" },
        fond_54: { fr: "Courant, C1, TOEIC 940 · présentations et réunions en contexte international", en: "Fluent, C1, TOEIC 940 · presentations and meetings in international settings" },
        fond_55: { fr: "Aujourd'hui, je me sens particulièrement à l'aise dans les 4 champs d'expertise ci-dessous :", en: "Today, I feel most at home in the four areas below:" },
        fond_56: { fr: "E-commerce et donnée produit", en: "E-commerce and product data" },
        fond_57: { fr: "Acquisition et SEO", en: "Acquisition and SEO" },
        fond_58: { fr: "Contenu et direction artistique", en: "Content and art direction" },
        fond_59: { fr: "Produit digital et analytics", en: "Digital product and analytics" },
        fond_60: { fr: "Structurer un catalogue, définir les attributs, enrichir les fiches et organiser leur diffusion sur les différents canaux.", en: "Structuring a catalogue, defining attributes, enriching product pages and organising how they are distributed across channels." },
        fond_61: { fr: "Identifier les opportunités, améliorer l'architecture et la visibilité, puis suivre ce qui génère réellement du trafic ou des conversions.", en: "Spotting opportunities, improving site architecture and visibility, then tracking what actually drives traffic or conversions." },
        fond_62: { fr: "Concevoir les contenus, préparer et piloter les shootings, briefer les prestataires et garantir la cohérence jusqu'à la livraison.", en: "Designing content, preparing and running photo shoots, briefing suppliers and holding the line on consistency all the way to delivery." },
        fond_63: { fr: "Concevoir des parcours et des interfaces, lire les usages, construire les tableaux de bord utiles et améliorer l'expérience à partir des données.", en: "Designing journeys and interfaces, reading how they are used, building the dashboards that matter and improving the experience from the data." },
        fond_64: { fr: "Mes expériences professionnelles et personnelles m'amènent à utiliser une sélection d'outils régulièrement, dont j'ai fait la liste non exhaustive ci-dessous :", en: "My professional and personal experience has me reaching for the same set of tools again and again. Here is a non-exhaustive list:" },
        fond_65: { fr: "Web et e-commerce", en: "Web and e-commerce" },
        fond_66: { fr: "Data, acquisition et SEO", en: "Data, acquisition and SEO" },
        fond_67: { fr: "IA générative", en: "GenAI" },
        fond_68: { fr: "Création", en: "Design" },
        fond_69: { fr: "Bureautique et projets", en: "Office and project management" },
        fond_74: { fr: "Senior Digital E-commerce Manager · Lindt & Sprüngli", en: "Senior Digital E-commerce Manager · Lindt & Sprüngli" },
        fond_75: { fr: "Dirigeant · Émeraude Aventure", en: "Director · Emeraude Aventure" },
        fond_76: { fr: "Senior Communication Manager · Lindt & Sprüngli", en: "Senior Communication Manager · Lindt & Sprüngli" },
        fond_77: { fr: "Senior Digital Manager · Lindt France", en: "Senior Digital Manager · Lindt France" },
        fond_78: { fr: "“I had the pleasure of working closely with Pierre for over two years. One of his best qualities is his curiosity. He has a great way of blending creative thinking with deep technical skills. Because of his personal projects, he is always on top of the latest trends, and I learned a lot from him, especially regarding E-commerce and general digital topics. What I admire most is that his knowledge goes way beyond his daily tasks. He brings a broad perspective to everything he touches. On top of that, he is a good collaborator, highly organized, and has a sharp, critical mind. Pierre always knows exactly how to bring out the absolute best in every project.”", en: "“I had the pleasure of working closely with Pierre for over two years. One of his best qualities is his curiosity. He has a great way of blending creative thinking with deep technical skills. Because of his personal projects, he is always on top of the latest trends, and I learned a lot from him, especially regarding E-commerce and general digital topics. What I admire most is that his knowledge goes way beyond his daily tasks. He brings a broad perspective to everything he touches. On top of that, he is a good collaborator, highly organized, and has a sharp, critical mind. Pierre always knows exactly how to bring out the absolute best in every project.”" },
        fond_79: { fr: "« Pierre s'est occupé de nos campagnes Google Ads chez Émeraude Aventure cette saison. Nous avons dépassé les 1 200 réservations directes au total, dont plus de 500 attribuées aux campagnes qu'il a pilotées, pour un coût inférieur à 2 € par réservation. Il a clairement sa part dans la réussite de cet été, qui est la meilleure saison que j'ai eue. Je recommande son travail sans problème. »", en: "“Pierre managed our Google Ads campaigns at Emeraude Aventure this season. We recorded more than 1,200 direct bookings overall, including over 500 attributed to the campaigns he managed, at a cost below €2 per booking. He clearly contributed to the success of this summer, which was our best season yet. I recommend his work without hesitation.”" },
        fond_80: { fr: "<p>«&nbsp;J'ai eu le plaisir de travailler avec Pierre chez Lindt &amp; Sprüngli pendant deux ans. Sa créativité, son sens du détail et sa capacité à concevoir des contenus à la fois engageants et performants ont été de véritables atouts pour notre équipe. Il sait transformer des idées en projets concrets tout en gardant constamment à l'esprit les enjeux business et les attentes des consommateurs.</p><p>Au-delà de ses compétences techniques, Pierre est une personne investie, à l'écoute et toujours prête à apporter son aide. Son esprit collaboratif, sa fiabilité et sa bonne humeur font de lui un collègue avec lequel il est particulièrement agréable de travailler.&nbsp;»</p>", en: "<p>“I had the pleasure of working with Pierre at Lindt &amp; Sprüngli for two years. His creativity, attention to detail and ability to design content that is both engaging and effective were real strengths for our team. He knows how to turn ideas into tangible projects while consistently keeping business priorities and consumer expectations in mind.</p><p>Beyond his technical skills, Pierre is committed, attentive and always willing to help. His collaborative mindset, reliability and good humour make him a colleague who is particularly enjoyable to work with.”</p>" },
        fond_81: { fr: "<p>«&nbsp;J'ai eu le plaisir de travailler avec Pierre chez Lindt France, où il occupait le poste de Content Manager au sein de l'équipe digitale que je pilote.</p><p>Pierre se distingue par sa capacité à allier expertise technique et sens créatif. Il maîtrise des sujets complexes liés à la gestion des contenus et de la donnée produit, tout en apportant une véritable vision créative qui contribue à valoriser l'image premium de nos marques.</p><p>Véritable facilitateur, il sait fédérer les équipes, simplifier les processus et faire avancer les projets avec efficacité. Son sens du détail, sa curiosité et sa capacité à anticiper les besoins en font un collaborateur particulièrement précieux.</p><p>Force de proposition, fiable et engagé, Pierre est un profil rare capable de faire le lien entre contenu, technologie et expérience de marque. Je lui souhaite beaucoup de succès pour la suite de son parcours.&nbsp;»</p>", en: "<p>“I had the pleasure of working with Pierre at Lindt France, where he was Content Manager within the digital team I lead.</p><p>Pierre stands out for his ability to combine technical expertise with a creative eye. He has a firm grasp of complex subjects around content and product data management, while bringing a genuine creative vision that helps carry the premium image of our brands.</p><p>A real facilitator, he knows how to bring teams together, simplify processes and move projects forward efficiently. His attention to detail, his curiosity and his ability to anticipate needs make him a particularly valuable colleague.</p><p>Proactive, reliable and committed, Pierre is a rare profile, able to connect content, technology and brand experience. I wish him every success in what comes next.”</p>" },
        fond_82: { fr: "La photographie", en: "Photography" },
        fond_83: { fr: "Les sports d'endurance", en: "Endurance sports" },
        fond_84: { fr: "Le passe-temps qui me permet de m'évader créativement et l'origine de mon appétence pour la direction artistique et l'image produit.", en: "The hobby that lets me escape creatively, and where my taste for art direction and product imagery comes from." },
        fond_85: { fr: "Amateur de grands espaces et d'exploration, j'adore découvrir de nouveaux endroits en courant et en me dépassant.", en: "I love wide open spaces and exploring: discovering new places by running them, and pushing myself doing it." },
        fond_86: { fr: "Si mon profil vous intéresse ou si vous avez une question, n'hésitez pas à me contacter ! :)", en: "If my profile is of interest, or if you simply have a question, do get in touch! :)" },
        fond_87: { fr: "Contrat", en: "Contract" },
        fond_88: { fr: "Rôle", en: "Role" },
        fond_89: { fr: "Mobilité", en: "Location" },
        fond_90: { fr: "Disponibilité", en: "Availability" },
        fond_91: { fr: "CDI", en: "Full-time (CDI)" },
        fond_92: { fr: "E-commerce / marketing digital", en: "E-commerce / Digital marketing" },
        fond_93: { fr: "Septembre 2026", en: "September 2026" },
        fond_94: { fr: "E-mail", en: "Email" },
        fond_95: { fr: "Téléphone", en: "Phone" },
        fond_96: { fr: "Réseau", en: "Network" },
        fond_97: { fr: "Document", en: "Document" },
        fond_98: { fr: "CV PDF (1 page)", en: "One-page CV" },
        fond_99: { fr: "France", en: "France" },
        fond_100: { fr: "Belgique", en: "Belgium" },
        fond_101: { fr: "Suisse", en: "Switzerland" },
        fond_102: { fr: "Luxembourg", en: "Luxembourg" },
        fond_103: { fr: "Intro", en: "Intro" },
        fond_104: { fr: "Projets", en: "Projects" },
        fond_105: { fr: "Parcours", en: "Background" },
        fond_106: { fr: "Compétences", en: "Skills" },
        fond_107: { fr: "Recommandations", en: "Recommendations" },
        fond_108: { fr: "Passions", en: "Passions" },
        fond_109: { fr: "Contact", en: "Contact" },
        // Les notes manuscrites des recommandations. Elles commentent la
        // page, elles ne la portent pas : traduites, mais jamais lues par un
        // lecteur d ecran (aria-hidden dans le HTML).
        fond_110: { fr: "Mon binôme au quotidien chez Lindt", en: "My day-to-day teammate at Lindt" },
        fond_111: { fr: "Client et ami\u00a0!", en: "Client, and a friend!" },
        fond_112: { fr: "Collègue d'une autre équipe", en: "Colleague from another team" },
        fond_113: { fr: "Ma manager chez Lindt", en: "My manager at Lindt" },
        fond_115: { fr: "C'est moi\u00a0!", en: "That's me!" },
        fond_116: { fr: "Sur les 1\u00a0200 réservations directes enregistrées au total, plus de 500 sont attribuées aux campagnes que j'ai pilotées, pour un coût inférieur à 2\u00a0€ par réservation.", en: "Of the 1,200 direct bookings recorded in total, more than 500 are attributed to the campaigns I ran, at a cost below €2 per booking." },
    };

    function urlHasEn() {
        const path = window.location.pathname;
        return path === '/en' || path.startsWith('/en/');
    }

    function getLang() {
        if (urlHasEn()) return 'en';
        const stored = localStorage.getItem('site-lang');
        return stored === 'en' ? 'en' : 'fr';
    }

    // Keep the /en/ URL prefix in sync with the active language.
    function syncUrl(lang) {
        if (!/^https?:$/.test(window.location.protocol)) return;

        let path = window.location.pathname;
        const hasEn = urlHasEn();

        if (lang === 'en' && !hasEn) {
            path = '/en' + (path === '/' ? '/' : path);
        } else if (lang === 'fr' && hasEn) {
            path = path.replace(/^\/en\/?/, '/');
        } else {
            return;
        }

        try {
            window.history.replaceState(null, '', path + window.location.search + window.location.hash);
        } catch (err) {
            // Ignore environments that refuse the URL change.
        }
    }

    function apply(lang) {
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const entry = DICT[el.getAttribute('data-i18n')];
            if (entry && entry[lang]) el.textContent = entry[lang];
        });

        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const entry = DICT[el.getAttribute('data-i18n-html')];
            if (entry && entry[lang]) el.innerHTML = entry[lang];
        });

        // <meta> tags translated via their content attribute (description).
        document.querySelectorAll('[data-i18n-content]').forEach((el) => {
            const entry = DICT[el.getAttribute('data-i18n-content')];
            if (entry && entry[lang]) el.setAttribute('content', entry[lang]);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const entry = DICT[el.getAttribute('data-i18n-placeholder')];
            if (entry && entry[lang]) el.setAttribute('placeholder', entry[lang]);
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const entry = DICT[el.getAttribute('data-i18n-title')];
            if (entry && entry[lang]) el.setAttribute('title', entry[lang]);
        });

        document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            const entry = DICT[el.getAttribute('data-i18n-aria')];
            if (entry && entry[lang]) el.setAttribute('aria-label', entry[lang]);
        });

        // Links with a language-specific target (study pages, PDFs): the
        // original href is the French one, data-href-en holds the English one.
        document.querySelectorAll('[data-href-en]').forEach((el) => {
            if (!el.dataset.hrefFr) el.dataset.hrefFr = el.getAttribute('href');
            el.setAttribute('href', lang === 'en' ? el.dataset.hrefEn : el.dataset.hrefFr);
        });

        document.dispatchEvent(new CustomEvent('gumi:lang', { detail: { lang } }));
    }

    window.GumiI18n = {
        dict: DICT,
        get: getLang,
        t(key) {
            const entry = DICT[key];
            return entry ? entry[getLang()] || entry.fr : '';
        },
        set(lang) {
            localStorage.setItem('site-lang', lang);
            syncUrl(lang);
            apply(lang);
        },
        toggle() {
            this.set(getLang() === 'fr' ? 'en' : 'fr');
        },
        apply() {
            apply(getLang());
        }
    };

    function init() {
        const lang = getLang();
        localStorage.setItem('site-lang', lang);
        syncUrl(lang);
        apply(lang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();