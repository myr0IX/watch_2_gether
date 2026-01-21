# 📌 TODO & Roadmap

**Date Review:** 2025-01-21
**Dernière mise à jour:** 2025-01-21

---

## 🔴 CRITIQUE (Avant Production)

Doit être fixé avant un déploiement en production.

### Rate Limiting
- [ ] Implémenter middleware de rate limiting
- [ ] Max 10 requêtes/minute par IP
- [ ] Retourner HTTP 429 si dépassé
- [ ] Tester avec load test

**Fichier cible:** `app/src/app/api/chat/route.ts`
**Effort:** 2-3h
**Priorité:** 🔴 HAUTE

### Gestion d'Erreur Robuste
- [ ] Distinguer erreurs réseau vs Mistral vs timeout
- [ ] Ajouter retry logic avec exponential backoff
- [ ] Ajouter timeout explicite (25s < 30s Next.js limit)
- [ ] Messages d'erreur clairs pour l'utilisateur

**Fichiers cibles:**
- `app/src/app/api/chat/route.ts`
- `app/src/hook/chat/use-chat.ts`

**Effort:** 3-4h
**Priorité:** 🔴 HAUTE

### Tests Unitaires Critiques
- [ ] Tests `parseContent()` avec edge cases
  - [ ] Cas normal: `[TOOL:{...}]`
  - [ ] JSON invalide
  - [ ] Chunks tronqués
  - [ ] Multiple tools
  - [ ] Texte vide après parsing
- [ ] Tests validation Message
- [ ] Tests streaming avec chunks fragmentés

**Fichier cible:** Créer `app/src/utils/__tests__/parse-content.test.ts`
**Effort:** 4-5h
**Priorité:** 🔴 HAUTE

---

## 🟡 IMPORTANT (Court Terme)

À faire rapidement après les critiques.

### Consolider les Types
- [ ] Créer `app/src/types/index.ts`
- [ ] Centraliser interface `Message`
- [ ] Exporter depuis un seul endroit
- [ ] Mettre à jour les imports

**Fichiers affectés:**
- `app/src/hook/chat/use-chat.ts` (ligne 3-6)
- `app/src/app/api/chat/route.ts` (ligne 5-8)
- `app/src/components/ai/chat-message.tsx`

**Effort:** 1h
**Priorité:** 🟡 MOYENNE

### Validation des Messages
- [ ] Ajouter fonction `isValidMessage()` complète
- [ ] Valider `role` est bien parmi les 3 valides
- [ ] Tester avec messages invalides

**Fichier cible:** `app/src/app/api/chat/route.ts` (lignes 20-38)
**Effort:** 1-2h
**Priorité:** 🟡 MOYENNE

### Fixer Anti-pattern React Keys
- [ ] Remplacer `key={index}` par `key={`text-${index}`}`
- [ ] Vérifier toutes les boucles `.map()`

**Fichiers cibles:**
- `app/src/components/ai/chat-message.tsx` (ligne 45)
- `app/src/components/ai/movie-card-list.tsx`

**Effort:** 15 min
**Priorité:** 🟡 MOYENNE

### Gestion des Erreurs de Parsing
- [ ] Logger les erreurs de parsing
- [ ] Afficher message utilisateur si tool échoue
- [ ] Tester avec données malformées

**Fichier cible:** `app/src/utils/parse-content.ts` (lignes 24-31)
**Effort:** 1-2h
**Priorité:** 🟡 MOYENNE

### Ajouter ARIA Labels
- [ ] Ajouter `role`, `aria-label` sur composants interactifs
- [ ] Ajouter `alt` sur icônes
- [ ] Tester avec screen reader
- [ ] Vérifier contraste de couleurs

**Fichiers cibles:**
- `app/src/components/ai/chat-bot.tsx`
- `app/src/components/ai/movie-card.tsx`
- `app/src/components/home/hero-section.tsx`

**Effort:** 3-4h
**Priorité:** 🟡 MOYENNE

### Améliorer Documentation
- [ ] Ajouter JSDoc sur hooks complexes
- [ ] Documenter le format de streaming
- [ ] README.md avec setup instructions

**Effort:** 2h
**Priorité:** 🟡 MOYENNE

---

## 🟢 NICE TO HAVE (Plus Tard)

Améliorations non-bloquantes pour plus tard.

### Pagination du Chat
- [ ] Implémenter pagination/virtualisation
- [ ] Limiter messages en mémoire
- [ ] Lazy load anciens messages
- [ ] Tester avec 1000+ messages

**Outil:** `react-window`
**Effort:** 4-5h
**Priorité:** 🟢 BASSE

### Persistance des Chats
- [ ] Sauvegarder chats en IndexedDB ou localStorage
- [ ] Charger au montage
- [ ] Ajouter bouton "Nouveau chat"
- [ ] Supprimer chats anciens

**Effort:** 3-4h
**Priorité:** 🟢 BASSE

### Cache des Réponses
- [ ] Cache simple basé sur contenu message
- [ ] Redis ou SQLite
- [ ] TTL de 24h
- [ ] Monitoring hits/misses

**Effort:** 3-4h
**Priorité:** 🟢 BASSE

### Error Boundary
- [ ] Créer ErrorBoundary component
- [ ] Wrapper sur chat principal
- [ ] Graceful fallback UI
- [ ] Logging d'erreurs

**Effort:** 2h
**Priorité:** 🟢 BASSE

### Tests E2E
- [ ] Setup Playwright
- [ ] Test happy path: envoi message → réponse
- [ ] Test erreur: message vide, API erreur
- [ ] Test streaming: chunks fragmentés

**Effort:** 4-5h
**Priorité:** 🟢 BASSE

### Optimisation Bundle
- [ ] Analyser taille (next/bundle-analyzer)
- [ ] Code split Motion si possible
- [ ] Lazy load Movie Cards
- [ ] Mesurer avant/après

**Effort:** 3-4h
**Priorité:** 🟢 BASSE

### Dark Mode
- [ ] Implémenter toggle theme
- [ ] Persister choix utilisateur
- [ ] Respecter prefers-color-scheme
- [ ] Tester contraste

**Effort:** 2-3h
**Priorité:** 🟢 BASSE

---

## 📊 Vue d'Ensemble

### Par Effort
| Effort | Tasks |
|--------|-------|
| < 1h | Fixer keys React, mini docs |
| 1-2h | Types, validation messages, parsing errors |
| 2-4h | Rate limiting, ARIA, error boundary |
| 4-5h | Tests, pagination, cache |
| 5+h | Persistance, tests E2E, bundle optimization |

### Par Priorité
| Priorité | Count | Effort Total |
|----------|-------|--------------|
| 🔴 CRITIQUE | 3 | ~10h |
| 🟡 IMPORTANT | 6 | ~12h |
| 🟢 NICE TO HAVE | 8 | ~25h |

**Total:** ~47h pour tout

### Pour MVP (Minimal Viable)
1. ✅ Fixer keys React (15 min)
2. ✅ Consolider types (1h)
3. ✅ Validation messages (1-2h)
4. ✅ Rate limiting (2-3h)
5. ✅ Gestion erreur (3-4h)
6. ✅ Tests unitaires critiques (4-5h)

**Sous-total: ~12h pour un MVP robuste**

---

## 🚀 Comment Utiliser Ce Fichier

- [ ] Cocher les items complétés
- [ ] Ajouter des commentaires si changements
- [ ] Créer commit avec chaque update:
  ```bash
  git commit -m "fix: add rate limiting

  - Implements token bucket
  - Max 10 req/min per IP
  - Closes TODO item"
  ```

---

## 📋 Checklist Entretien

Avant d'en parler à un recruteur:
- [ ] Lire REVIEW.md complètement
- [ ] Comprendre les problèmes identifiés
- [ ] Avoir réponse pour: "Pourquoi pas de tests?"
- [ ] Avoir réponse pour: "Sécurité?"
- [ ] Avoir roadmap claire en tête

---

**Format:** GFM (GitHub Flavored Markdown)
**Source:** `.reviews/2025-01-21/`
