// Builds media/masque-trame.svg: the mask of the experiment covers.
//
// The cover is a 2:1 rectangle whose top-left and bottom-right corners
// dissolve into halftone: on the site's staggered grid, the dots shrink
// toward the corner until they vanish, then the image is whole. Used as a
// CSS mask (styles/accueil.css), so only the shapes' alpha matters.
//
// Usage: node build/masque-trame.js
const fs = require('fs');
const path = require('path');

const L = 200, H = 100;          // the cover's 2:1 frame
const PAS = 7;                   // grid step
const R_PLEIN = 4.3;             // a full dot: the staggered grid is covered
const DEBUT = 6, PLEIN = 62;     // distance from the corner: first dot, full dots

const lisse = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

const cercles = [];
for (let j = 0, y = 0; y <= H + PAS; j++, y += PAS * 0.866) {
    for (let x = j % 2 ? PAS / 2 : 0; x <= L + PAS; x += PAS) {
        const d = Math.min(x + y, (L - x) + (H - y));   // to the nearest of the two corners
        if (d > PLEIN + PAS) continue;                   // the solid part covers it
        const t = lisse((d - DEBUT) / (PLEIN - DEBUT));
        const r = R_PLEIN * Math.sqrt(t);
        if (r < 0.35) continue;
        cercles.push('<circle cx="' + +x.toFixed(2) + '" cy="' + +y.toFixed(2) + '" r="' + +r.toFixed(2) + '"/>');
    }
}

// The solid part: the frame without its two corners, cut where the dots
// are already full so the seam does not show.
const c = PLEIN;
const plein = '<path d="M' + c + ' 0H' + L + 'V' + (H - c) + 'L' + (L - c) + ' ' + H + 'H0V' + c + 'Z"/>';

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + L + ' ' + H + '" preserveAspectRatio="none">'
    + plein + cercles.join('') + '</svg>\n';
fs.writeFileSync(path.join(__dirname, '..', 'media/masque-trame.svg'), svg);
console.log('media/masque-trame.svg: ' + cercles.length + ' dots, ' + svg.length + ' bytes');
