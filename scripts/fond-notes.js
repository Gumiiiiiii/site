// Les notes manuscrites posées sur les recommandations.
//
// Une police script suffit à écrire à la main, pas à donner l'impression que
// la main a écrit deux fois la même lettre différemment : Caveat, comme toutes
// les polices de ce genre, n'a qu'un dessin par caractère. On recompose donc
// chaque note lettre à lettre, en donnant à chacune une inclinaison, une
// hauteur et une graisse légèrement différentes.
//
// Le tirage est déterministe — il dépend de la lettre et de sa place — pour
// que la note ne se redessine pas autrement à chaque passage : une note qui
// bouge trahit le procédé.
//
// Ce script est décoratif de bout en bout. Les notes portent aria-hidden, la
// page se lit sans elles, et si rien de tout ceci ne s'exécute il reste le
// texte, écrit dans la police script.
(function () {
    // Les lettres de Cedarville s'attachent les unes aux autres : une secousse
    // franche décrocherait les liaisons, et l'écriture cesserait d'être une
    // écriture. Ces valeurs-là sont le maximum qu'elles supportent.
    var INCLINAISON = 0.9;   // degrés, de part et d'autre
    var HAUTEUR = 0.35;      // pixels, de part et d'autre

    // Un bruit reproductible : même lettre, même place, même tirage.
    function tirage(graine) {
        var x = Math.sin(graine * 12.9898) * 43758.5453;
        return x - Math.floor(x);
    }

    function ecrire(note) {
        var texte = note.getAttribute('data-note-texte');
        if (texte === null) {
            texte = note.textContent;
            note.setAttribute('data-note-texte', texte);
        }

        var fragment = document.createDocumentFragment();

        for (var i = 0; i < texte.length; i++) {
            var lettre = texte[i];
            if (lettre === ' ') {
                fragment.appendChild(document.createTextNode(' '));
                continue;
            }

            var graine = texte.charCodeAt(i) + i * 7.13;
            var angle = (tirage(graine) - 0.5) * 2 * INCLINAISON;
            var haut = (tirage(graine + 1.7) - 0.5) * 2 * HAUTEUR;

            var span = document.createElement('span');
            span.textContent = lettre;
            span.style.display = 'inline-block';
            span.style.transform = 'rotate(' + angle.toFixed(2) + 'deg) translateY(' + haut.toFixed(2) + 'px)';
            fragment.appendChild(span);
        }

        note.textContent = '';
        note.appendChild(fragment);
    }

    Array.prototype.forEach.call(document.querySelectorAll('.fond-note-texte'), ecrire);

    // Le dictionnaire réécrit le texte de la note : il faut la recomposer.
    document.addEventListener('gumi:lang', function () {
        var notes = document.querySelectorAll('.fond-note-texte');
        Array.prototype.forEach.call(notes, function (note) {
            note.removeAttribute('data-note-texte');
            ecrire(note);
        });
    });
})();
