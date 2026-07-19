# 🎨 Studio Créatif Bamako

**Plateforme web de génération de contenu IA pour créateurs maliens** — musiciens, designers, entrepreneurs et formateurs. Adaptée au contexte culturel et linguistique ouest-africain francophone.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Vercel](https://img.shields.io/badge/Vercel-Ready-black?logo=vercel)

---

## 🌟 Fonctionnalités

### 8 modules IA opérationnels

| Module | Description | API utilisée |
|--------|-------------|--------------|
| 📝 **Bio & Presskit** | Bio courte, bio longue EPK, résumé pro | GPT-5 (fallback Grok → Kimi) |
| 📱 **Posts réseaux sociaux** | 4 variantes avec hashtags maliens | GPT-5 (fallback Grok → Kimi) |
| 🎬 **Scripts vidéo courts** | 15s / 30s / 60s avec accroche + CTA | GPT-5 (fallback Grok → Kimi) |
| 🖼️ **Visuels générés** | Pochette, flyer, visuel post | Gemini Imagen |
| 🎥 **Clips vidéo courts** | Teaser 5s / 10s | Gemini Veo |
| 📅 **Calendrier de contenu** | Planning 2-4 semaines | GPT-5 (fallback Grok → Kimi) |
| 🔥 **Tendances & Hooks** | 5 sous-modules viraux | Grok + GPT-5 |
| 👤 **Gestion de compte** | Profil, quota, historique | — |

### Module « Tendances & Hooks » (5 sous-onglets)
1. 📚 **Bibliothèque** — 63 hooks prêts à l'emploi, 9 catégories (instantané, sans IA)
2. 📈 **Tendances Mali** — veille des sujets brûlants à Bamako (Grok)
3. ✨ **Générateur 10 hooks** — hooks personnalisés scorés /10 (GPT-5)
4. 🎯 **Hook Optimizer** — améliore un hook existant en 5 versions (GPT-5)
5. 🎵 **Sons TikTok** — top 6 sons viraux ouest-africains (Grok)

---

## 🏗️ Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 16 + TypeScript + Tailwind CSS 4)        │
│  ├─ Mobile-first responsive                                 │
│  ├─ shadcn/ui (48 composants)                               │
│  ├─ Zustand (state global + persistance localStorage)       │
│  └─ Brouillons anti-perte au refresh                        │
├─────────────────────────────────────────────────────────────┤
│  API Routes (Next.js Route Handlers)                        │
│  ├─ /api/generate/bio, posts, script, image, video,         │
│  │   calendrier, tendances, hooks-gen, hook-optimizer,      │
│  │   sons-tiktok                                             │
│  └─ /api/user (CRUD + quota)                                │
├─────────────────────────────────────────────────────────────┤
│  Lib IA (server-side only — clés jamais exposées)           │
│  ├─ Fallback GPT-5 → Grok → Kimi (jamais bloquer user)     │
│  ├─ Gemini Imagen (image) + Veo (vidéo asynchrone)         │
│  └─ JSON robuste (gère fences markdown, strings mal échappées)│
├─────────────────────────────────────────────────────────────┤
│  Base de données (Prisma ORM)                               │
│  ├─ SQLite (développement local)                            │
│  └─ PostgreSQL (production Vercel)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Démarrage rapide (développement local)

### Pré-requis
- Node.js 18+ ou Bun
- Un compte Z.AI (clé API unifiée) OU clés séparées OpenAI / xAI / Moonshot / Google

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/VOTRE-USER/studio-creatif-bamako.git
cd studio-creatif-bamako

# 2. Installer les dépendances
bun install   # ou npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec votre DATABASE_URL

# 4. Configurer les clés API IA
# Option A : créer .z-ai-config à la racine
cat > .z-ai-config << 'EOF'
{
  "baseUrl": "https://api.z.ai/api/v1",
  "apiKey": "sk-ai-v1-votre-cle-ici",
  "chatId": "studio-creatif-bamako",
  "userId": "dev"
}
EOF

# Option B : utiliser les variables d'environnement
# (déjà géré par src/lib/ai.ts)

# 5. Initialiser la base de données
bun run db:push

# 6. Lancer le serveur de développement
bun run dev
```

Le site est accessible sur http://localhost:3000

---

## 📦 Déploiement en production

Voir le guide complet : **[DEPLOIEMENT.md](./DEPLOIEMENT.md)**

### Étapes résumées

1. **Push sur GitHub** (vérifier que `.env` et `.z-ai-config` ne sont pas trackés)
2. **Créer une base PostgreSQL** sur Neon / Supabase / Vercel Postgres
3. **Importer le repo sur Vercel** → https://vercel.com/new
4. **Configurer les variables d'environnement** :
   - `DATABASE_URL` — URL PostgreSQL
   - `ZAI_API_KEY` — clé API Z.AI
   - `ZAI_BASE_URL` — `https://api.z.ai/api/v1`
5. **Deploy** — Vercel build automatique
6. **(Optionnel) Domaine personnalisé** — `studio-creatif-bamako.ml`

---

## 📁 Structure du projet

```
studio-creatif-bamako/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/
│   │   │   │   ├── bio/route.ts
│   │   │   │   ├── posts/route.ts
│   │   │   │   ├── script/route.ts
│   │   │   │   ├── image/route.ts
│   │   │   │   ├── video/route.ts
│   │   │   │   ├── calendrier/route.ts
│   │   │   │   ├── tendances/route.ts
│   │   │   │   ├── hooks-gen/route.ts
│   │   │   │   ├── hook-optimizer/route.ts
│   │   │   │   └── sons-tiktok/route.ts
│   │   │   └── user/route.ts
│   │   ├── page.tsx          # SPA avec routing par état Zustand
│   │   ├── layout.tsx        # Layout racine (fonts FR, métadonnées)
│   │   └── globals.css       # Thème terracotta/ocre/or
│   ├── components/
│   │   ├── studio/
│   │   │   ├── layout.tsx          # Header + Footer
│   │   │   ├── home.tsx            # Hero + grille 8 modules
│   │   │   ├── module-bio.tsx
│   │   │   ├── module-posts.tsx
│   │   │   ├── module-script.tsx
│   │   │   ├── module-image.tsx
│   │   │   ├── module-video.tsx
│   │   │   ├── module-calendrier.tsx
│   │   │   ├── module-tendances.tsx # 5 onglets intégrés
│   │   │   ├── module-compte.tsx
│   │   │   └── shared.tsx           # CopyButton, LoadingState, etc.
│   │   └── ui/                # shadcn/ui (48 composants)
│   └── lib/
│       ├── ai.ts              # Orchestration IA + fallback
│       ├── prompts.ts         # Prompts français contexte malien
│       ├── json.ts            # Extracteur JSON robuste
│       ├── hooks-biblio.ts    # 63 hooks curatés (sans IA)
│       ├── store.ts           # Zustand store
│       └── db.ts              # Prisma client
├── prisma/
│   └── schema.prisma          # User, ContenuGenere, Abonnement
├── public/                    # Assets statiques
├── .env.example               # Template variables d'env
├── vercel.json                # Config Vercel
├── DEPLOIEMENT.md             # Guide déploiement complet
└── README.md                  # Ce fichier
```

---

## 🛡️ Sécurité

- ✅ **Clés API côté serveur uniquement** (jamais dans le frontend)
- ✅ **Routes API Next.js** (server-side, jamais exposées)
- ✅ **`.env` et `.z-ai-config` dans `.gitignore`**
- ✅ **Fallback IA** pour ne jamais bloquer l'utilisateur (GPT-5 → Grok → Kimi)
- ⚠️ **Rate limiting à ajouter** en production (cf. DEPLOIEMENT.md)

---

## 🎯 Cas d'usage pilote

**Premier utilisateur test : Thug Lite Bandit (rappeur, Markala)**
- Générer sa bio artiste complète
- Produire 5 posts promo pour son prochain single/EP
- Créer un script vidéo TikTok de 30 secondes
- Objectif : valider la qualité du contenu généré avant ouverture au public

---

## 🗺️ Roadmap

| Phase | Contenu | Statut |
|-------|---------|--------|
| Phase 1 — MVP texte | Bio + Posts réseaux sociaux | ✅ Livré |
| Phase 2 | Scripts vidéo + routage multi-API + fallback | ✅ Livré |
| Phase 3 | Visuels (Imagen) + Clips vidéo (Veo) | ✅ Livré |
| Phase 4 | Calendrier + paiement Taliopay automatisé | 🟡 Calendrier livré, Taliopay à intégrer |
| Phase 5 | Compte utilisateur complet, NextAuth | 🟡 MVP local livré, auth réelle à faire |
| Phase 6 | Test avec Thug Lite Bandit | 📋 À venir |
| Bonus | Tendances & Hooks (5 sous-modules) | ✅ Livré |

---

## 💰 Modèle économique

### Freemium
- **Gratuit** : 3 générations par mois, tous modules confondus
- **Payant (abonnement mensuel)** : générations illimitées, export PDF/Word, calendrier avancé
- **Paiement** : Taliopay (déjà en place sur l'écosystème Ibrahim Sacko)

### Pack à l'unité
- Pack complet (bio + 5 posts + 1 script) : 2000–5000 FCFA
- Coordination via WhatsApp

---

## 👥 Équipe

- **Porteur du projet** : Ibrahim Sacko — [SK Designer Luxe](https://createur-boutique.vercel.app) / Créateur Boutique
- **Développement** : Studio Créatif Bamako (Z.ai)
- **Premier utilisateur test** : Thug Lite Bandit (rappeur, Markala)

---

## 📜 Licence

Propriétaire — © 2026 Ibrahim Sacko / SK Designer Luxe. Tous droits réservés.

---

## 📞 Contact

- **WhatsApp** : +223 7X XX XX XX
- **Email** : contact@studio-creatif-bamako.ml
- **Site** : https://studio-creatif-bamako.ml (à venir)

---

**Fait avec ❤️ à Bamako · Propulsé par IA**
