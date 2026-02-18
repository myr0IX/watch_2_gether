# Watch 2 Gether

Application de recommandation de films et séries avec un chatbot IA.

## Fonctionnalités

- **Chatbot intelligent** : Discutez avec l'IA pour obtenir des recommandations personnalisées
- **Recherche de contenu** : Trouvez des films et séries par titre, genre ou année
- **Cartes visuelles** : Affichage des recommandations avec poster, synopsis et note IMDb
- **Streaming en temps réel** : Réponses de l'IA affichées progressivement

## Technologies

- **Frontend** : Next.js 16, React 19, Tailwind CSS, Motion
- **IA** : Mistral AI (mistral-small-latest)
- **Données** : Trakt API v2
- **Validation** : Zod

## Prérequis

- Node.js 18+
- pnpm 10+

## Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/myr0IX/watch_2_gether.git
   cd watch_2_gether
   ```

2. **Installer les dépendances**
   ```bash
   cd app
   pnpm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   Puis remplir les clés API (voir section suivante).

4. **Lancer le serveur de développement**
   ```bash
   pnpm dev
   ```

5. Ouvrir [http://localhost:3000](http://localhost:3000)

## Configuration

Créer un fichier `.env` dans le dossier `app/` avec les variables suivantes :

```env
MISTRAL_API_KEY=votre_cle_mistral
TRAKT_CLIENT_ID=votre_client_id_trakt
```

### Obtenir une clé Mistral AI

1. Créer un compte sur [console.mistral.ai](https://console.mistral.ai/)
2. Configurer la facturation dans les paramètres (un tier gratuit est disponible)
3. Aller dans **Workspace > API Keys**
4. Créer une nouvelle clé et la copier immédiatement

### Obtenir un Client ID Trakt

1. Créer un compte sur [trakt.tv](https://trakt.tv/)
2. Aller sur [trakt.tv/oauth/applications/new](https://trakt.tv/oauth/applications/new)
3. Remplir le formulaire :
   - **Name** : Watch 2 Gether (ou autre)
   - **Redirect URI** : `http://localhost:3000`
4. Cliquer sur **Create Application**
5. Copier le **Client ID** généré

## Commandes

```bash
pnpm dev      # Serveur de développement
pnpm build    # Build de production
pnpm start    # Serveur de production
pnpm lint     # Vérification ESLint
```

## Licence

MIT
