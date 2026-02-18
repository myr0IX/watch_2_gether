# CLAUDE.md

Ce fichier fournit le contexte nécessaire pour travailler sur ce projet.

## Vue d'Ensemble

**Watch 2 Gether** est une application Next.js de recommandation de films et séries. Elle utilise Mistral AI pour le chatbot et l'API Trakt pour les données de contenu.

## Commandes de Développement

Toutes les commandes doivent être exécutées depuis le répertoire `/app` :

```bash
pnpm dev      # Serveur de développement (http://localhost:3000)
pnpm build    # Build de production
pnpm start    # Serveur de production
pnpm lint     # Vérification ESLint
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND - React 19 + Tailwind CSS + Motion                │
│  └─ ChatBot UI, MovieCard Components                        │
├─────────────────────────────────────────────────────────────┤
│  API ROUTE - POST /api/chat (Streaming)                     │
│  └─ Session Management + Tool Orchestration                 │
├─────────────────────────────────────────────────────────────┤
│  CHAT LAYER - Stream Processing, Tools, Error Handling      │
├─────────────────────────────────────────────────────────────┤
│  AI LAYER - Mistral AI (mistral-small-latest)               │
├─────────────────────────────────────────────────────────────┤
│  DATA LAYER - Trakt API v2                                  │
└─────────────────────────────────────────────────────────────┘
```

### Structure des Répertoires

```
app/src/
├── app/                          # Next.js App Router
│   ├── api/chat/route.ts         # Endpoint principal du chat
│   ├── chat/page.tsx             # Page du chatbot
│   └── layout.tsx, page.tsx      # Layout et page d'accueil
│
├── components/
│   ├── ai/                       # Composants du chatbot
│   │   ├── chat-bot.tsx          # Wrapper principal
│   │   ├── chat-message.tsx      # Affichage des messages
│   │   ├── movie-card.tsx        # Carte de film/série
│   │   └── movie-card-list.tsx   # Liste de cartes
│   ├── home/                     # Composants page d'accueil
│   └── ui/                       # Composants UI de base
│
├── config/
│   ├── mistral-ai-client.ts      # Client Mistral AI
│   └── system-prompt.ts          # Prompt système du chatbot
│
├── lib/
│   ├── chat/                     # Logique du chat
│   │   ├── stream-processor.ts   # Traitement du stream AI
│   │   ├── tool-orchestrator.ts  # Exécution des tools
│   │   ├── error-handler.ts      # Gestion des erreurs/rate limit
│   │   ├── session-store.ts      # Sessions en mémoire (30min TTL)
│   │   └── types.ts              # Types TypeScript
│   │
│   └── trakt/                    # Intégration Trakt API
│       ├── api.ts                # Requêtes HTTP vers Trakt
│       ├── service.ts            # Logique métier
│       ├── schema.ts             # Validation Zod
│       ├── tool.ts               # Définition du tool pour Mistral
│       └── types.ts              # Types
│
├── tools/                        # Définition des tools
│   ├── executor.ts               # Routage vers les handlers
│   ├── movie-card.ts             # Tool movies_card
│   └── types.ts                  # Noms et configs des tools
│
├── hook/chat/use-chat.ts         # Hook React pour le chat
│
└── schemas/                      # Schémas Zod
    ├── message.ts                # Messages et ToolResult
    ├── movie-card.ts             # Données MovieCard
    └── stream-chunk.ts           # Chunks du stream
```

## Flux de Communication

### Requête Utilisateur → Réponse

1. **Frontend** (`use-chat.ts`) → POST `/api/chat`
2. **API Route** → Crée/récupère session, ajoute message à l'historique
3. **Mistral AI** → Stream avec tool calls possibles
4. **Stream Processor** → Parse les chunks, extrait texte et tool calls
5. **Tool Orchestrator** → Exécute les tools (movies_search, movies_card)
6. **Streaming Response** → Chunks envoyés au client en temps réel

### Chunks Streamés

```typescript
{ type: "session", sessionId: "..." }     // ID de session
{ type: "text", content: "..." }          // Texte de l'assistant
{ type: "tool", name: "movies_card", data: {...} }  // Résultat de tool
```

## Les 2 Tools

### movies_search (Trakt API)

Recherche des films/séries tendance sur Trakt.

**Paramètres :**
- `query` (string, optionnel) - Recherche par nom
- `type` (string, optionnel) - "movie", "show" ou "person"
- `year` (number, optionnel) - Année de sortie
- `genres` (array, optionnel, max 3) - Genres

**Retourne :** Tableau de `TrendingResult[]` avec les données Trakt.

**Note :** `requiresAIProcessing: true` → l'AI doit traiter les résultats.

### movies_card (Affichage)

Affiche une carte visuelle pour un film ou série.

**Paramètres :**
- `title` (string, requis) - Titre
- `description` (string, requis) - Synopsis
- `imdbRating` (number, requis) - Note IMDb sur 10
- `imdbId` (string, optionnel) - ID IMDb

**Note :** `requiresAIProcessing: false` → envoyé directement au client.

## Technologies

| Couche | Technologies |
|--------|-------------|
| Frontend | React 19, Next.js 16, Tailwind CSS 4, Motion |
| AI | Mistral API (mistral-small-latest) |
| Data | Trakt API v2 |
| Validation | Zod |
| Package Manager | pnpm 10.28.0 |

## Configuration

### Variables d'Environnement

```env
MISTRAL_API_KEY=...       # Clé API Mistral
TRAKT_CLIENT_ID=...       # Client ID Trakt
```

### Trakt API

- Base URL : `https://api.trakt.tv`
- Auth : Header `trakt-api-key`
- Limite : 5 résultats par défaut
- Extended : `full` (données complètes)

## Patterns de Développement

- **App Router** pour les pages (`app/` directory)
- **TypeScript strict** pour tout nouveau code
- **Tailwind CSS** pour le styling
- **Alias `@`** pour les imports depuis `src/`
- **Server Components** par défaut, `'use client'` si interactivité nécessaire
- **Zod** pour la validation des données entrantes/sortantes
- **Streaming** pour les réponses temps réel

## Code Style

### Comments
- **Language**: All comments MUST be in English
- **Usage**: Comments are a last resort - only add them when the code is not self-explanatory
- **Principle**: Prefer clear naming and simple code over comments

### TypeScript
- **No type assertions**: Never use `as Type` or `as unknown as Type` - fix the types properly
- **No `any`**: Always type properly using Zod schemas, generics, or explicit types
- **Runtime validation**: Use Zod for external data (API responses, user input)

## Points Architecturaux Clés

- **Streaming Response** : ReadableStream pour le temps réel
- **Tool Loop** : Boucle jusqu'à ce que tous les tools AI-independents soient traités
- **Session Persistence** : En mémoire avec TTL de 30 minutes
- **Rate Limit** : Retry automatique après 60s sur erreur 429
- **Type Safety** : Validation Zod partout
- **Real Data** : Données uniquement de Trakt, pas d'hallucinations
