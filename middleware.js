// pierre.gumi.ch sert le CV à la racine, sans rediriger.
//
// Pourquoi ici et pas dans vercel.json : sur Vercel, les rewrites ne passent
// qu'après le système de fichiers. « / » et « /en » sont de vrais fichiers du
// dépôt (index.html et en/index.html), donc ils gagnent, et le rewrite
// conditionné à l'hôte n'était jamais atteint — pierre.gumi.ch affichait la
// page d'accueil de gumi.ch. Le middleware, lui, s'exécute avant tout le
// reste : c'est le seul endroit d'où l'on peut prendre la main sur un chemin
// qui existe déjà.
//
// Une redirection ferait aussi l'affaire, mais elle changerait l'URL — et
// c'est précisément l'URL nue qu'on veut garder.
//
// Le matcher limite la portée à ces deux chemins : tout le reste du site,
// gumi.ch comme pierre.gumi.ch, ne passe pas par ce fichier.
export const config = { matcher: ['/', '/en'] };

const HOTE = 'pierre.gumi.ch';

// Laisser la requête suivre son cours normal.
function suivant() {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

export default function middleware(request) {
    // Un middleware s'exécute sur la page d'accueil du site : s'il échoue, il
    // l'emporte avec lui. Tout ce qui suit est donc sous filet.
    try {
        const hote = (request.headers.get('host') || '').split(':')[0].toLowerCase();
        if (hote !== HOTE) return suivant();

        return new Response(null, {
            headers: { 'x-middleware-rewrite': new URL('/cv', request.url).toString() }
        });
    } catch (e) {
        return suivant();
    }
}
