// pierre.gumi.ch sert le CV à la racine, sans rediriger.
export const config = { matcher: ['/', '/en'] };

const HOTE = 'pierre.gumi.ch';

// Laisser la requête suivre son cours normal.
function suivant() {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

export default function middleware(request) {
    // Un middleware s'exécute sur la page d'accueil du site : s'il échoue, il l'emporte avec lui.
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
