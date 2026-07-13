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

        // CV landing (pierre.gumi.ch, hidden page)
        doc_cv_title: { fr: 'Pierre Gumilar · Responsable Marketing Digital', en: 'Pierre Gumilar · Digital Marketing Manager' },
        doc_cv_desc: {
            fr: "Responsable marketing digital, de la stratégie à l'exécution : SEO, contenu, e-commerce, data. Disponible pour un CDI.",
            en: 'Digital marketing manager, from strategy to execution: SEO, content, e-commerce, data. Open to full-time roles.'
        },
        cv_avail: { fr: 'Disponible immédiatement pour un CDI, sur site ou à distance.', en: 'Available now for a full-time role, on-site or remote.' },
        cv_hero_title: { fr: "Je transforme l'attention en croissance mesurable", en: 'I turn attention into measurable growth' },
        cv_hero_sub: {
            fr: "Pierre Gumilar, Responsable Marketing Digital. De la stratégie à l'exécution : SEO, contenu, e-commerce, data. 3 ans chez Lindt & Sprüngli, et un portfolio qui prouve que je livre moi-même ce que je conçois.",
            en: "Pierre Gumilar, Digital Marketing Manager. From strategy to execution: SEO, content, e-commerce, data. 3 years at Lindt & Sprüngli, and a portfolio that proves I ship what I design."
        },
        cv_photo_alt: { fr: 'Portrait de Pierre Gumilar', en: 'Portrait of Pierre Gumilar' },
        cv_cta_write: { fr: 'Me contacter', en: 'Contact me' },
        cv_cta_pdf: { fr: 'CV PDF (1 page)', en: 'Resume PDF (1 page)' },
        cv_stat1_label: { fr: 'de trafic organique', en: 'organic traffic' },
        cv_stat1_src: { fr: 'SEO · Lindt & Sprüngli', en: 'SEO · Lindt & Sprüngli' },
        cv_stat2_label: { fr: 'followers en 3 mois', en: 'followers in 3 months' },
        cv_stat2_src: { fr: 'croissance communautaire', en: 'community growth' },
        cv_stat3_label: { fr: 'de ventes e-commerce', en: 'e-commerce sales' },
        cv_stat3_src: { fr: 'optimisation · Lindt & Sprüngli', en: 'optimization · Lindt & Sprüngli' },
        cv_stat4_label: { fr: 'recherches par an ciblées', en: 'yearly searches targeted' },
        cv_stat4_src: { fr: "SEO produit · l'étude est en ligne", en: 'product SEO · the study is public' },
        cv_sec_cases: { fr: 'Trois contextes, trois preuves', en: 'Three settings, three proofs' },
        cv_case1_tag: { fr: 'Lindt & Sprüngli · CDI', en: 'Lindt & Sprüngli · full-time' },
        cv_case1_title: { fr: 'Piloter le contenu e-commerce de Lindt & Sprüngli', en: 'Running e-commerce content at Lindt & Sprüngli' },
        cv_case1_desc: {
            fr: "7 000+ assets produits en 3 ans (direction artistique, photo, 3D), stratégie SEO, structuration de la donnée produit et coordination des agences, développeurs et équipes internes.",
            en: '7,000+ assets produced over 3 years (art direction, photo, 3D), SEO strategy, product data structuring, and coordination across agencies, developers and internal teams.'
        },
        cv_case1_result: { fr: '+180 % de trafic organique, +1000 % de donnée produit', en: '+180% organic traffic, +1000% product data' },
        cv_case2_tag: { fr: 'ArdaCraft · projet communautaire', en: 'ArdaCraft · community project' },
        cv_case2_title: { fr: '1 million de recherches par an, zéro concurrent sérieux', en: 'One million yearly searches, no serious competitor' },
        cv_case2_desc: {
            fr: "Identifier l'opportunité SEO, concevoir une carte interactive, la positionner en référence sur son sujet. Sur le même projet : de 8 000 à 115 000 followers en 3 mois, sans budget média.",
            en: 'Spot the SEO opportunity, design an interactive map, make it the reference on its topic. Same project: from 8,000 to 115,000 followers in 3 months, zero media budget.'
        },
        cv_case2_result: { fr: "un levier d'acquisition durable", en: 'a lasting acquisition channel' },
        cv_case3_tag: { fr: 'Consulting indépendant', en: 'Independent consulting' },
        cv_case3_title: { fr: 'Refondre un site client et tripler son trafic', en: 'Rebuild a client site and triple its traffic' },
        cv_case3_desc: {
            fr: "Audit complet, refonte WordPress de A à Z (HTML, CSS, JS), et pilotage de campagnes d'acquisition B2B sur Google Ads pour d'autres clients.",
            en: 'Full audit, WordPress rebuild from scratch (HTML, CSS, JS), plus B2B acquisition campaigns on Google Ads for other clients.'
        },
        cv_case3_result: { fr: '+300 % de trafic après la refonte', en: '+300% traffic after the rebuild' },
        cv_case_link: { fr: "Lire l'étude complète", en: 'Read the full study' },
        cv_sec_reco: { fr: 'Ils ont travaillé avec moi', en: 'They worked with me' },
        cv_reco_pending: { fr: "Exemple : la vraie citation arrive", en: 'Sample: real quote coming' },
        cv_reco1_role: { fr: 'Digital Marketing · ma manager chez Lindt & Sprüngli', en: 'Digital Marketing · my manager at Lindt & Sprüngli' },
        cv_reco2_role: { fr: 'Senior Digital E-commerce Manager · collègue chez Lindt & Sprüngli', en: 'Senior Digital E-commerce Manager · colleague at Lindt & Sprüngli' },
        cv_sec_skills: { fr: 'Ce que je fais', en: 'What I do' },
        cv_skill1_t: { fr: 'Acquisition & SEO', en: 'Acquisition & SEO' },
        cv_skill1_d: { fr: 'Semrush, Search Console, netlinking. Preuve : +180 % de trafic organique chez Lindt.', en: 'Semrush, Search Console, link building. Proof: +180% organic traffic at Lindt.' },
        cv_skill2_t: { fr: 'Data & analytics', en: 'Data & analytics' },
        cv_skill2_d: { fr: 'GA4, Looker Studio, Clarity. Des reportings qui décident, pas qui décorent.', en: 'GA4, Looker Studio, Clarity. Reports that drive decisions, not decoration.' },
        cv_skill3_t: { fr: 'Contenu & social', en: 'Content & social' },
        cv_skill3_d: { fr: '7 000+ assets supervisés : direction artistique, photo, 3D. Des dizaines de millions de vues organiques.', en: '7,000+ assets supervised: art direction, photo, 3D. Tens of millions of organic views.' },
        cv_skill4_t: { fr: 'E-commerce & PIM', en: 'E-commerce & PIM' },
        cv_skill4_d: { fr: 'Magento, Salsify. +1000 % sur la qualité et la quantité de la donnée produit.', en: 'Magento, Salsify. +1000% on product data quality and coverage.' },
        cv_skill5_t: { fr: 'Design & intégration', en: 'Design & build' },
        cv_skill5_d: { fr: 'Figma, Webflow, Webstudio, HTML/CSS/JS. Je livre moi-même ce que je conçois.', en: 'Figma, Webflow, Webstudio, HTML/CSS/JS. I ship what I design myself.' },
        cv_skill6_t: { fr: 'GenAI', en: 'GenAI' },
        cv_skill6_d: { fr: "Usage quotidien outillé. Une conférence d'une heure animée sur le sujet.", en: 'Daily hands-on use. Gave a one-hour talk on the topic.' },
        cv_tools_label: { fr: 'La boîte à outils, au quotidien', en: 'The everyday toolbox' },
        cv_sec_path: { fr: 'Parcours', en: 'Background' },
        cv_tl_exp: { fr: 'Expérience', en: 'Experience' },
        cv_tl_edu: { fr: 'Formation & langues', en: 'Education & languages' },
        cv_tl_now: { fr: '2023 · auj.', en: '2023 · now' },
        cv_tl1: { fr: 'E-Commerce Content Manager · Lindt & Sprüngli, Paris', en: 'E-Commerce Content Manager · Lindt & Sprüngli, Paris' },
        cv_tl_since: { fr: 'depuis 2022', en: 'since 2022' },
        cv_tl2: { fr: 'Consulting & projets indépendants · multi-secteurs', en: 'Consulting & independent projects · multi-industry' },
        cv_tl3: { fr: 'Assistant Marketing Digital · Lindt & Sprüngli, Paris', en: 'Digital Marketing Assistant · Lindt & Sprüngli, Paris' },
        cv_tl4: { fr: 'Assistant SEO Manager · Nutri & Co, Aix-en-Provence', en: 'SEO Manager Assistant · Nutri & Co, Aix-en-Provence' },
        cv_tl5: { fr: 'Assistant Marketing Opérationnel · EXKI, Bruxelles', en: 'Operational Marketing Assistant · EXKI, Brussels' },
        cv_tl6: { fr: 'MSc Marketing & Services Management · IAE Aix School of Management', en: 'MSc Marketing & Services Management · IAE Aix School of Management' },
        cv_tl7: { fr: 'DUETI Business · University of the West of Scotland', en: 'DUETI Business · University of the West of Scotland' },
        cv_tl_lang_label: { fr: 'langues', en: 'languages' },
        cv_tl8: { fr: 'Anglais courant, C1 (TOEIC 940). Présentations et réunions en contexte international.', en: 'Fluent English, C1 (TOEIC 940). Presentations and meetings in international settings.' },
        cv_sec_search: { fr: 'Ce que je cherche', en: "What I'm looking for" },
        cv_spec1_t: { fr: 'Contrat', en: 'Contract' },
        cv_spec1_v: { fr: 'CDI', en: 'Full-time (CDI)' },
        cv_spec2_t: { fr: 'Rôle', en: 'Role' },
        cv_spec2_v: { fr: 'Marketing digital / Growth', en: 'Digital marketing / Growth' },
        cv_spec3_t: { fr: 'Mobilité', en: 'Location' },
        cv_spec3_v: { fr: 'France, Belgique, Suisse, Luxembourg · sur site ou remote', en: 'France, Belgium, Switzerland, Luxembourg · on-site or remote' },
        cv_spec4_t: { fr: 'Disponibilité', en: 'Availability' },
        cv_spec4_v: { fr: 'Immédiate', en: 'Immediate' },
        cv_contact_title: { fr: 'Parlons-en', en: "Let's talk" },
        cv_contact_perso: {
            fr: 'Le reste du temps, je cours longtemps et je prends des photos.',
            en: 'The rest of the time, I run long distances and take photos.'
        },
        cv_copy: { fr: "Copier l'adresse", en: 'Copy address' },
        cv_copied: { fr: 'Copié !', en: 'Copied!' },

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
        }
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
