// Aperçu de publication : un média, un texte.
(function () {
    var drop = document.getElementById('pp-drop');
    var input = document.getElementById('pp-input');
    var fileBox = document.getElementById('pp-file');
    var fileName = document.getElementById('pp-file-name');
    var removeBtn = document.getElementById('pp-remove');
    var text = document.getElementById('pp-text');
    var count = document.getElementById('pp-count');
    var nameInput = document.getElementById('pp-name');
    var handleInput = document.getElementById('pp-handle');
    var tabs = document.getElementById('pp-tabs');
    var stage = document.getElementById('pp-stage');
    var scale = document.getElementById('pp-scale');
    if (!drop || !text || !stage) return;

    var MOTS = {
        fr: { plus: 'plus', voirPlus: 'Voir plus', aime: "J'aime", commenter: 'Commenter', republier: 'Republier', envoyer: 'Envoyer', partager: 'Partager', maintenant: '1 min', nom: 'Votre nom', id: 'votrenom', texte: 'Votre texte apparaîtra ici.', erreur: 'Ce fichier n’est ni une image ni une vidéo.' },
        en: { plus: 'more', voirPlus: 'See more', aime: 'Like', commenter: 'Comment', republier: 'Repost', envoyer: 'Send', partager: 'Share', maintenant: '1m', nom: 'Your name', id: 'yourname', texte: 'Your text will appear here.', erreur: 'This file is neither an image nor a video.' }
    };

    function langue() {
        return window.GumiI18n && window.GumiI18n.get() === 'en' ? 'en' : 'fr';
    }

    var ICONES = {
        coeur: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
        bulle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
        bulleCarree: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        avion: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
        signet: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
        boucle: '<path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/>',
        vues: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
        envoi: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>',
        pouce: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
        fleche: '<polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/>',
        globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
        points: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
        image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
        lecture: '<polygon points="6 3 20 12 6 21 6 3"/>'
    };

    function icone(nom, classe) {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (classe ? ' class="' + classe + '"' : '') + '>' + ICONES[nom] + '</svg>';
    }

    // limite : nombre de caractères accepté.
    var RESEAUX = [
        { id: 'instagram', nom: 'Instagram', limite: 2200, coupe: 125, format: [0.8, 1.91], defaut: 1 },
        { id: 'x', nom: 'X', limite: 280, coupe: Infinity, format: [0.75, 16 / 9], defaut: 16 / 9 },
        { id: 'linkedin', nom: 'LinkedIn', limite: 3000, coupe: 210, format: [0.8, 1.91], defaut: 1.91 },
        { id: 'facebook', nom: 'Facebook', limite: 63206, coupe: 480, format: [0.8, 1.91], defaut: 1.91 }
    ];

    var etat = { reseau: RESEAUX[0], media: null };   // media : { url, type, ratio, nom }

    function echapper(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function formater(n) {
        return n.toLocaleString(langue() === 'en' ? 'en-US' : 'fr-FR');
    }

    // Les maquettes

    function blocMedia(r) {
        var ratio = etat.media ? Math.min(r.format[1], Math.max(r.format[0], etat.media.ratio)) : r.defaut;
        var dedans;
        if (!etat.media) {
            dedans = '<div class="pp-media-vide">' + icone('image') + '</div>';
        } else if (etat.media.type === 'video') {
            dedans = '<video src="' + echapper(etat.media.url) + '" muted playsinline preload="metadata"></video>'
                + '<div class="pp-lecture">' + icone('lecture') + '</div>';
        } else {
            dedans = '<img src="' + echapper(etat.media.url) + '" alt="">';
        }
        return '<div class="pp-media" style="aspect-ratio: ' + ratio.toFixed(4) + ';">' + dedans + '</div>';
    }

    function blocTexte(r, mots, brut, avant) {
        if (!brut) return '<div class="pp-texte vide">' + (avant || '') + echapper(mots.texte) + '</div>';
        var corps;
        if (brut.length > r.coupe) {
            // Coupe au dernier mot entier avant la limite d'affichage.
            var debut = brut.slice(0, r.coupe).replace(/\s+\S*$/, '');
            corps = echapper(debut) + '… <span class="pp-plus">' + echapper(r.id === 'instagram' ? mots.plus : mots.voirPlus) + '</span>';
        } else if (brut.length > r.limite) {
            corps = echapper(brut.slice(0, r.limite)) + '<span class="pp-x-depasse">' + echapper(brut.slice(r.limite)) + '</span>';
        } else {
            corps = echapper(brut);
        }
        return '<div class="pp-texte">' + (avant || '') + corps + '</div>';
    }

    function dessiner() {
        var r = etat.reseau;
        var mots = MOTS[langue()];
        var brut = text.value.replace(/\s+$/, '');
        var nom = nameInput.value.trim() || mots.nom;
        var id = (handleInput.value.trim().replace(/^@+/, '') || mots.id).replace(/\s+/g, '');
        var avatar = '<div class="pp-avatar">' + echapper(nom.charAt(0)) + '</div>';
        var html;

        if (r.id === 'instagram') {
            html = '<div class="pp-carte pp-ig">'
                + '<div class="pp-ig-tete">' + avatar + '<span class="pp-ig-nom">' + echapper(id) + '</span>' + icone('points') + '</div>'
                + blocMedia(r)
                + '<div class="pp-actions">' + icone('coeur') + icone('bulle') + icone('avion') + icone('signet', 'pp-fin') + '</div>'
                + '<div class="pp-ig-legende">' + blocTexte(r, mots, brut, '<b>' + echapper(id) + '</b>') + '</div>'
                + '</div>';
        } else if (r.id === 'x') {
            html = '<div class="pp-carte pp-x">' + avatar + '<div class="pp-x-corps">'
                + '<div class="pp-x-tete"><b>' + echapper(nom) + '</b><span>@' + echapper(id) + ' · ' + mots.maintenant + '</span></div>'
                + blocTexte(r, mots, brut)
                + blocMedia(r)
                + '<div class="pp-actions">' + icone('bulle') + icone('boucle') + icone('coeur') + icone('vues') + icone('signet') + icone('envoi') + '</div>'
                + '</div></div>';
        } else if (r.id === 'linkedin') {
            html = '<div class="pp-carte pp-li">'
                + '<div class="pp-li-tete">' + avatar + '<div><div class="pp-li-nom">' + echapper(nom) + '</div>'
                + '<div class="pp-li-sous">' + mots.maintenant + ' · ' + icone('globe') + '</div></div></div>'
                + blocTexte(r, mots, brut)
                + blocMedia(r)
                + '<div class="pp-actions"><span>' + icone('pouce') + mots.aime + '</span><span>' + icone('bulleCarree') + mots.commenter + '</span><span>' + icone('boucle') + mots.republier + '</span><span>' + icone('avion') + mots.envoyer + '</span></div>'
                + '</div>';
        } else {
            html = '<div class="pp-carte pp-fb">'
                + '<div class="pp-fb-tete">' + avatar + '<div><div class="pp-fb-nom">' + echapper(nom) + '</div>'
                + '<div class="pp-fb-sous">' + mots.maintenant + ' · ' + icone('globe') + '</div></div></div>'
                + blocTexte(r, mots, brut)
                + blocMedia(r)
                + '<div class="pp-actions"><span>' + icone('pouce') + mots.aime + '</span><span>' + icone('bulle') + mots.commenter + '</span><span>' + icone('fleche') + mots.partager + '</span></div>'
                + '</div>';
        }

        scale.innerHTML = html;
        count.textContent = formater(brut.length) + ' / ' + formater(r.limite);
        count.classList.toggle('depasse', brut.length > r.limite);
        ajuster();
    }

    // Met la publication à l'échelle de la scène, sans jamais l'agrandir.
    function ajuster() {
        scale.style.transform = '';
        scale.style.marginBottom = '';
        var carte = scale.firstElementChild;
        if (!carte) return;
        var w = carte.offsetWidth, h = carte.offsetHeight;
        var k = Math.min(1, stage.clientWidth / w, stage.clientHeight / h);
        if (k < 1) {
            scale.style.transform = 'scale(' + k.toFixed(4) + ')';
            // Le transform ne libère pas la place : la marge la rend.
            scale.style.marginBottom = (-(h * (1 - k))).toFixed(1) + 'px';
        }
    }

    // Le média

    function retirer() {
        if (etat.media) URL.revokeObjectURL(etat.media.url);
        etat.media = null;
        input.value = '';
        fileBox.classList.remove('visible');
        drop.style.display = '';
        dessiner();
    }

    function recevoir(file) {
        if (!file) return;
        var estVideo = /^video\//.test(file.type);
        if (!estVideo && !/^image\//.test(file.type)) {
            if (window.showToolToast) window.showToolToast(MOTS[langue()].erreur, true);
            return;
        }
        if (etat.media) URL.revokeObjectURL(etat.media.url);
        var url = URL.createObjectURL(file);
        var media = { url: url, type: estVideo ? 'video' : 'image', ratio: 1, nom: file.name };

        function pret(largeur, hauteur) {
            media.ratio = largeur && hauteur ? largeur / hauteur : 1;
            etat.media = media;
            fileName.textContent = file.name;
            fileBox.classList.add('visible');
            drop.style.display = 'none';
            dessiner();
        }

        if (estVideo) {
            var v = document.createElement('video');
            v.preload = 'metadata';
            v.onloadedmetadata = function () { pret(v.videoWidth, v.videoHeight); };
            v.onerror = function () { pret(16, 9); };
            v.src = url;
        } else {
            var img = new Image();
            img.onload = function () { pret(img.naturalWidth, img.naturalHeight); };
            img.onerror = function () { URL.revokeObjectURL(url); if (window.showToolToast) window.showToolToast(MOTS[langue()].erreur, true); };
            img.src = url;
        }
    }

    drop.addEventListener('click', function () { input.click(); });
    drop.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', function () { recevoir(input.files[0]); });
    ['dragenter', 'dragover'].forEach(function (type) {
        drop.addEventListener(type, function (e) { e.preventDefault(); drop.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (type) {
        drop.addEventListener(type, function (e) { e.preventDefault(); drop.classList.remove('dragover'); });
    });
    drop.addEventListener('drop', function (e) { recevoir(e.dataTransfer.files[0]); });
    // Une image copiée se colle directement, où que soit le curseur.
    document.addEventListener('paste', function (e) {
        var fichiers = e.clipboardData && e.clipboardData.files;
        if (fichiers && fichiers.length) { e.preventDefault(); recevoir(fichiers[0]); }
    });
    removeBtn.addEventListener('click', retirer);

    // Les réseaux et la saisie

    RESEAUX.forEach(function (r) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pp-onglet';
        b.textContent = r.nom;
        b.setAttribute('data-reseau', r.id);
        b.setAttribute('aria-pressed', r === etat.reseau ? 'true' : 'false');
        b.addEventListener('click', function () {
            etat.reseau = r;
            tabs.querySelectorAll('.pp-onglet').forEach(function (o) {
                o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
            });
            dessiner();
        });
        tabs.appendChild(b);
    });

    [text, nameInput, handleInput].forEach(function (champ) {
        champ.addEventListener('input', dessiner);
    });
    document.addEventListener('gumi:lang', dessiner);
    window.addEventListener('resize', ajuster);
    window.addEventListener('load', ajuster);
    if (window.ResizeObserver) new ResizeObserver(ajuster).observe(stage);

    dessiner();
})();
