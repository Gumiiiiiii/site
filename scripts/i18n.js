(function () {
    const DICT = {
        // Navbar
        nav_experiments: { fr: 'Expérimentations', en: 'Experiments' },
        nav_tools: { fr: 'Outils', en: 'Tools' },
        nav_lang_title: { fr: 'Changer la langue', en: 'Switch language' },

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
            fr: "Redesign du site d'ArdaCraft pour refléter l'ambition et l'ampleur du projet.",
            en: "Redesigning the ArdaCraft website to reflect the project's ambition and scale."
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
        tool_palette_title: { fr: 'Générateur de palettes', en: 'Palette generator' },
        tool_palette_desc: {
            fr: 'Créez des palettes de couleurs harmonieuses et exportez-les en un clic.',
            en: 'Create harmonious color palettes and export them in one click.'
        },
        tool_mockup_title: { fr: 'Générateur de mockups', en: 'Mockup generator' },
        tool_mockup_desc: {
            fr: 'Créez des mises en situation photo-réalistes pour vos designs en un clic.',
            en: 'Create photo-realistic showcases for your designs in one click.'
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
            fr: "Une collection d'utilitaires développés pour accélérer mon flux de travail et celui de mes proches, tout en explorant de nouvelles technologies.",
            en: 'A collection of utilities built to speed up my workflow and that of the people around me, while exploring new technologies.'
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

        // Article template
        toc_label: { fr: 'Sommaire', en: 'Contents' },
        read_next: { fr: 'À lire ensuite', en: 'Read next' },
        copy_link: { fr: 'Copier le lien', en: 'Copy the link' },
        copy_done: { fr: 'Copié !', en: 'Copied!' },

        // Contrast checker tool
        contrast_text_color: { fr: 'Couleur du texte', en: 'Text color' },
        contrast_bg_color: { fr: 'Couleur de fond', en: 'Background color' },
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
        contrast_bg_image: { fr: 'Image de fond', en: 'Background image' },
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

        // Footer
        footer_title: { fr: "Envie d'échanger ?", en: 'Want to get in touch?' },
        footer_byline: { fr: 'Conçu et développé par Pierre.', en: 'Designed and built by Pierre.' },

        // Tools shared
        back_tools: { fr: 'Retour aux outils', en: 'Back to tools' },

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
        qr_generate: { fr: 'Générer le QR Code', en: 'Generate QR code' },
        qr_placeholder_hint: { fr: 'Votre QR code<br>apparaîtra ici', en: 'Your QR code<br>will appear here' },
        qr_download: { fr: 'Télécharger', en: 'Download' },
        qr_empty_error: { fr: 'Veuillez entrer un texte ou un lien.', en: 'Please enter some text or a link.' },
        qr_lib_error: { fr: 'Bibliothèque QR indisponible.', en: 'QR library unavailable.' },
        qr_tooltip: {
            fr: '<strong>Créez un QR code rapide et propre.</strong><br><br>Saisissez votre contenu, choisissez un style, puis exportez en PNG ou SVG.',
            en: '<strong>Create a clean QR code in seconds.</strong><br><br>Enter your content, pick a style, then export as PNG or SVG.'
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

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const entry = DICT[el.getAttribute('data-i18n-placeholder')];
            if (entry && entry[lang]) el.setAttribute('placeholder', entry[lang]);
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const entry = DICT[el.getAttribute('data-i18n-title')];
            if (entry && entry[lang]) el.setAttribute('title', entry[lang]);
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
