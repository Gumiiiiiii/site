// Précalcule les buissons du champ de l'accueil (scripts/lavande.js) dans media/buissons-lavande.bin.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Doit rester identique à la lecture dans scripts/lavande.js. Sortie : [canal][variante][angle][y][x].
const L = 144, H = 96, C = 5, PX = 42, U0 = -1.3, V0 = 1.29;
const ANGLES = [6, 18, 42], VARIANTES = 3, SS = 3;

function hasard(i, j) { const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return n - Math.floor(n); }
function lisse(a, b, x) { let t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

const CASE = 0.115, ORIGINE_Y = 0.05, EPI = 0.3;
let graine = 0, epis = new Map();

function epiDe(i, j) {
    const cle = (i + 512) * 4096 + (j + 512);
    if (epis.has(cle)) return epis.get(cle);
    const gi = i + graine * 101, gj = j + graine * 57;
    const a = (i + 0.15 + 0.7 * hasard(gi, gj)) * CASE, b = (j + 0.15 + 0.7 * hasard(gj + 17, gi)) * CASE;
    const r2 = a * a + b * b;
    let e = null;
    if (r2 <= 1.05 && hasard(gi + 3, gj + 9) >= 0.08) {
        let dx = 2 * a / (1 + r2), dy = (1 - r2) / (1 + r2), dz = 2 * b / (1 + r2);
        dy -= 0.06 * (1 - dy);
        const n = Math.hypot(dx, dy, dz); dx /= n; dy /= n; dz /= n;
        const Lg = (0.95 + 0.22 * hasard(gi - 5, gj + 2)) / Math.sqrt((dx * dx + dz * dz) / 1.0 + dy * dy / 1.12);
        e = { dx, dy, dz, L: Lg, r: 0.04 + 0.012 * hasard(gj, gi + 31) };
    }
    epis.set(cle, e);
    return e;
}
function distEpi(px, py, pz, e) {
    const t = px * e.dx + (py - ORIGINE_Y) * e.dy + pz * e.dz;
    const t0 = e.L - EPI, tc = t < t0 ? t0 : t > e.L ? e.L : t;
    const qx = px - e.dx * tc, qy = py - ORIGINE_Y - e.dy * tc, qz = pz - e.dz * tc;
    const s = (tc - t0) / EPI;
    return Math.sqrt(qx * qx + qy * qy + qz * qz) - e.r * (1 - 0.55 * s * s);
}
let touche = 0;
function scene(px, py, pz) {
    const ph = graine * 1.7;
    const fx = px / 0.78, fy = (py - 0.3) / 0.68, fz = pz / 0.78;
    let d = (Math.sqrt(fx * fx + fy * fy + fz * fz) - 1) * 0.5
        - 0.035 * (Math.sin(px * 17 + ph) * Math.sin(py * 19 + 1) * Math.sin(pz * 15 + 2 + ph));
    let k = 1;
    const qx = px, qy = py - ORIGINE_Y, qz = pz, n = Math.sqrt(qx * qx + qy * qy + qz * qz);
    if (n > 0.45) {
        const ux = qx / n, uy = qy / n, uz = qz / n;
        const a = ux / (1 + uy), b = uz / (1 + uy);
        const ci = Math.floor(a / CASE), cj = Math.floor(b / CASE);
        for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
            const e = epiDe(ci + di, cj + dj);
            if (!e) continue;
            const de = distEpi(px, py, pz, e);
            if (de < d) { d = de; k = 2; }
        }
    }
    if (py < d) { d = py; k = 0; }
    touche = k;
    return d;
}
function lancer(ox, oy, oz, dx, dy, dz, loin) {
    let t = 0;
    for (let i = 0; i < 160; i++) {
        const d = scene(ox + dx * t, oy + dy * t, oz + dz * t);
        if (d < 0.0015) return t;
        t += d * 0.8;
        if (t > loin) return -1;
    }
    return t;
}
function ombre(ox, oy, oz, lx, ly, lz) {
    let res = 1, t = 0.02;
    for (let i = 0; i < 48 && t < 3; i++) {
        const d = scene(ox + lx * t, oy + ly * t, oz + lz * t);
        if (d < 0.001) return 0;
        res = Math.min(res, 10 * d / t);
        t += Math.max(0.015, d * 0.9);
    }
    return res;
}
function occlusion(px, py, pz, nx, ny, nz) {
    let o = 0, w = 1;
    for (let i = 1; i <= 5; i++) {
        const h = 0.05 * i;
        o += w * (h - scene(px + nx * h, py + ny * h, pz + nz * h));
        w *= 0.7;
    }
    return Math.max(0, 1 - 3.2 * o);
}

// Le soleil de la page d'essai : devant à gauche, haut.
const az = -40 * Math.PI / 180;
let sl = [Math.sin(az) * 0.8, 0.65, Math.cos(az) * 0.5];
const sn = Math.hypot(...sl); sl = sl.map(v => v / sn);

// Un échantillon : [encre, couverture, clarté (thème sombre), ombre au sol, éclat].
function echantillon(ox, oy, oz, dx, dy, dz, out) {
    out.fill(0);
    const t = lancer(ox, oy, oz, dx, dy, dz, 40);
    if (t < 0) return;
    const px = ox + dx * t, py = oy + dy * t, pz = oz + dz * t;
    scene(px, py, pz);
    const k = touche, e = 0.002;
    let nx = scene(px + e, py, pz) - scene(px - e, py, pz);
    let ny = scene(px, py + e, pz) - scene(px, py - e, pz);
    let nz = scene(px, py, pz + e) - scene(px, py, pz - e);
    let nn = Math.hypot(nx, ny, nz) || 1; nx /= nn; ny /= nn; nz /= nn;
    let s = ombre(px + nx * 0.004, py + ny * 0.004, pz + nz * 0.004, sl[0], sl[1], sl[2]);
    const ao = occlusion(px, py, pz, nx, ny, nz);
    if (k === 0) {
        out[3] = Math.min(1, 0.5 * (1 - s) + 0.9 * (1 - ao)) * (1 - lisse(1.4, 2.6, Math.hypot(px, pz)));
        return;
    }
    // La normale de l'enveloppe du dôme, que chaque épi infléchit.
    const gx = px, gy = py - 0.18, gz = pz, gn = Math.hypot(gx, gy, gz) || 1;
    nx = 0.72 * gx / gn + 0.28 * nx; ny = 0.72 * gy / gn + 0.28 * ny; nz = 0.72 * gz / gn + 0.28 * nz;
    nn = Math.hypot(nx, ny, nz) || 1; nx /= nn; ny /= nn; nz /= nn;
    s = 0.55 + 0.45 * s;
    const cosL = nx * sl[0] + ny * sl[1] + nz * sl[2];
    let jour = Math.max(0, cosL) * s + (0.06 + 0.1 * ny) * ao;
    jour += 0.14 * lisse(0.1, -0.6, cosL) * lisse(0.3, 0.9, 1 - Math.abs(nx * dx + ny * dy + nz * dz)) * lisse(0.5, -0.2, ny);
    jour *= 0.25 + 0.75 * lisse(0.5, 1.1, Math.hypot(px, py - 0.2, pz));
    const teinte = k === 2 ? 0.85 : 0.7, r = 1 - Math.min(1, jour * 1.25);
    out[0] = teinte * (0.2 + 0.8 * r * r * (2 - r)) * (0.65 + 0.35 * ao);
    out[1] = 1;
    out[2] = (k === 2 ? 0.75 : 0.6) * (0.12 + 0.88 * Math.min(1, jour * 1.2)) * (0.6 + 0.4 * ao);
    out[4] = lisse(0.5, 0.9, jour) * (k === 2 ? 1 : 0.6);
}

const donnees = new Uint8Array(VARIANTES * ANGLES.length * L * H * C);
const out = new Float64Array(C), somme = new Float64Array(C);
let o = 0;
for (let v = 0; v < VARIANTES; v++) {
    graine = v; epis = new Map();
    for (const deg of ANGLES) {
        const th = deg * Math.PI / 180;
        // Caméra orthographique : l'œil regarde vers -z, incliné de th vers le sol.
        const dx = 0, dy = -Math.sin(th), dz = -Math.cos(th);
        const uy = Math.cos(th), uz = -Math.sin(th);
        for (let j = 0; j < H; j++) {
            for (let i = 0; i < L; i++) {
                somme.fill(0);
                for (let si = 0; si < SS; si++) for (let sj = 0; sj < SS; sj++) {
                    const u = U0 + (i + (si + 0.5) / SS) / PX, w = V0 - (j + (sj + 0.5) / SS) / PX;
                    echantillon(u, uy * w - dy * 20, uz * w - dz * 20, dx, dy, dz, out);
                    for (let c = 0; c < C; c++) somme[c] += out[c];
                }
                for (let c = 0; c < C; c++) donnees[o++] = Math.round(255 * Math.max(0, Math.min(1, somme[c] / (SS * SS))));
            }
        }
        console.log('variante', v, 'angle', deg);
    }
}
// Rangé canal par canal, sur 32 niveaux : le fichier fond de moitié, sans écart visible.
const N = donnees.length / C, plans = new Uint8Array(donnees.length);
for (let c = 0; c < C; c++) for (let k = 0; k < N; k++) plans[c * N + k] = Math.round(Math.round(donnees[k * C + c] / 255 * 31) * 255 / 31);
const gz = zlib.gzipSync(plans, { level: 9 });
fs.writeFileSync(path.join(__dirname, '..', 'media', 'buissons-lavande.bin'), gz);
console.log('octets', donnees.length, '->', gz.length);
