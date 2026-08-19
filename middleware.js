// Sonde : ce fichier ne sert qu'à savoir si Vercel exécute un middleware sur
// ce projet, qui n'a pas de framework et se déploie en statique.
//
// Elle ne répond que sur /_probe-middleware, un chemin qui n'existe pas dans
// le dépôt : si Vercel l'exécute, l'URL renvoie « middleware-actif » au lieu
// de la page 404. Aucune autre URL du site ne passe par ici.
export const config = { matcher: ['/_probe-middleware'] };

export default function middleware() {
    return new Response('middleware-actif', {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
}
