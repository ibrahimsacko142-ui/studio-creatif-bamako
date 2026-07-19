# 🚀 Déploiement — Studio Créatif Bamako

Ce document décrit comment déployer la plateforme en production sur **Vercel** (recommandé dans le cahier des charges).

---

## 📋 Pré-requis

- Un compte **GitHub** (pour héberger le code)
- Un compte **Vercel** (gratuit pour commencer) — https://vercel.com
- Une base de données **PostgreSQL** cloud (au choix) :
  - **Neon** (gratuit, recommandé) — https://neon.tech
  - **Supabase** (gratuit, alternatif) — https://supabase.com
  - **Vercel Postgres** (intégré Vercel)
  - **Railway** — https://railway.app
- Vos **clés API IA** (Z.AI unifiée ou GPT-5 / Grok / Kimi / Gemini séparées)

---

## 🔧 Étape 1 — Préparer le code pour GitHub

```bash
# À la racine du projet
git init
git add .
git status   # VÉRIFIER qu'aucun .env ou .z-ai-config n'est stagged
git commit -m "Initial commit — Studio Créatif Bamako MVP"

# Créer le repo sur GitHub puis :
git remote add origin https://github.com/VOTRE-USER/studio-creatif-bamako.git
git branch -M main
git push -u origin main
```

⚠️ **SÉCURITÉ — Vérifier avant push** :
```bash
# Ne doit rien afficher :
git ls-files | grep -E "\.env$|\.z-ai-config"
# Si quelque chose s'affiche, NE PAS POUSSER, exécuter :
git rm --cached .env .z-ai-config
git commit -m "Remove secrets"
```

---

## 🗄️ Étape 2 — Créer la base PostgreSQL

### Option A — Neon (recommandé, gratuit)
1. Créer un compte sur https://neon.tech
2. Créer un nouveau projet « studio-creatif-bamako »
3. Copier la `connection string` au format :
   ```
   postgresql://user:password@ep-xxx.eu-west-2.aws.neon.tech/studio?schema=public
   ```

### Option B — Supabase
1. Créer un projet sur https://supabase.com
2. Settings → Database → Connection string → URI
3. Copier l'URL PostgreSQL

### Option C — Vercel Postgres
1. Sur Vercel, dashboard → Storage → Create database → Postgres
2. Copier `DATABASE_URL`

---

## 🔄 Étape 3 — Migrer le schéma vers PostgreSQL

Le schéma Prisma actuel utilise SQLite. Pour PostgreSQL, modifiez `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"   // ← changer de "sqlite" à "postgresql"
  url      = env("DATABASE_URL")
}
```

Puis générer et pousser le schéma :

```bash
# Installer Prisma CLI si nécessaire
bun add -D prisma

# Pousser le schéma vers la DB cloud
DATABASE_URL="votre-url-postgresql" bun run db:push

# Vérifier que les tables sont créées
DATABASE_URL="votre-url-postgresql" npx prisma studio
```

---

## ▲ Étape 4 — Déployer sur Vercel

### Méthode A — Via le dashboard Vercel (recommandé)
1. Aller sur https://vercel.com/new
2. Importer le repo `studio-creatif-bamako` depuis GitHub
3. **Framework Preset** : Next.js (détecté automatiquement)
4. **Build Command** : `bun run build` (ou laisser par défaut)
5. **Environment Variables** — ajouter TOUTES ces variables :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `DATABASE_URL` | `postgresql://...` (Neon/Supabase) | Production + Preview |
| `ZAI_API_KEY` | `sk-ai-v1-...` (votre clé Z.AI) | Production + Preview |
| `ZAI_BASE_URL` | `https://api.z.ai/api/v1` | Production + Preview |
| `NEXT_PUBLIC_APP_NAME` | `Studio Créatif Bamako` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://studio-creatif-bamako.vercel.app` | Production |
| `NEXT_PUBLIC_WHATSAPP_CONTACT` | `+223 7X XX XX XX` | Production |

6. Cliquer **Deploy** — Vercel build + déploie en 2-3 minutes
7. URL temporaire : `https://studio-creatif-bamako-xxx.vercel.app`

### Méthode B — Via CLI Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer en preview
vercel

# Déployer en production
vercel --prod

# Configurer les variables d'environnement
vercel env add DATABASE_URL
vercel env add ZAI_API_KEY
# ...
```

---

## 🔑 Étape 5 — Configurer les clés API

### Si vous utilisez Z.AI unifié (recommandé)
Le SDK `z-ai-web-dev-sdk` cherche un fichier `.z-ai-config` ou des variables d'environnement.

Pour Vercel, on utilise les variables d'environnement. Modifier `src/lib/ai.ts` pour les lire :

```typescript
// Avant ZAI.create()
process.env.ZAI_API_KEY = process.env.ZAI_API_KEY || '';
process.env.ZAI_BASE_URL = process.env.ZAI_BASE_URL || 'https://api.z.ai/api/v1';
const zai = await ZAI.create();
```

Ou créer un fichier `.z-ai-config` local (jamais sur Vercel).

### Si vous utilisez les APIs directes (OpenAI, xAI, Moonshot, Google)
Modifier `src/lib/ai.ts` pour utiliser `openai` SDK avec différentes `baseURL` et `apiKey` selon le provider.

---

## 🌐 Étape 6 — Domaine personnalisé (optionnel)

1. Sur Vercel → Project → Settings → Domains
2. Ajouter `studio-creatif-bamako.ml` ou `creatif.bamako.com`
3. Configurer les DNS chez votre registrar :
   - `A` record → `76.76.21.21`
   - ou `CNAME` record → `cname.vercel-dns.com`
4. SSL automatique via Vercel

---

## ✅ Vérification post-déploiement

Tester ces endpoints après déploiement :

```bash
# Page d'accueil
curl https://VOTRE-DOMAINE.vercel.app/

# API bio (test simple)
curl -X POST https://VOTRE-DOMAINE.vercel.app/api/generate/bio \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","activite":"Musicien"}'

# Création utilisateur
curl -X POST https://VOTRE-DOMAINE.vercel.app/api/user \
  -H "Content-Type: application/json" \
  -d '{"nom":"Ibrahim Sacko","whatsapp":"+22376000000"}'
```

---

## 🚨 Points de vigilance production

1. **Rate limiting** : ajouter `@upstash/ratelimit` pour limiter les abus sur le plan gratuit
2. **CORS** : configurer correctement si frontend séparé
3. **Logs** : activer Vercel Logs pour monitorer les erreurs API
4. **Coûts IA** : surveiller la consommation des APIs (dashboard OpenAI / Google / etc.)
5. **Backups DB** : Neon/Supabase font des backups automatiques, vérifier la rétention
6. **Quotas** : surveiller le quota mensuel gratuit de chaque API IA

---

## 📦 Commandes utiles

```bash
# Développement local
bun run dev

# Build production local (test avant deploy)
bun run build

# Lint
bun run lint

# DB - pousser le schéma
bun run db:push

# DB - générer le client Prisma
bun run db:generate

# DB - migrations
bun run db:migrate

# Vercel - logs
vercel logs

# Vercel - env vars
vercel env ls
```

---

## 🆘 Dépannage

### Erreur "Database connection failed"
- Vérifier `DATABASE_URL` dans Vercel env vars
- Vérifier que l'URL PostgreSQL contient `?schema=public` à la fin
- Neon : vérifier que la DB n'est pas en sommeil (free tier)

### Erreur "ZAI API key missing"
- Vérifier `.z-ai-config` OU `ZAI_API_KEY` dans Vercel env vars
- Redéployer après avoir ajouté la variable

### Build Vercel échoue
- Vérifier `bun run build` passe en local
- Vérifier que `DATABASE_URL` est set pendant le build (Prisma génère le client)
- Si Prisma erreur : ajouter `postinstall: "prisma generate"` dans package.json scripts

### Génération vidéo timeout (>300s)
- Vercel Hobby limite à 60s par défaut
- Passer en plan Pro pour 300s
- Ou migrer la génération vidéo vers une queue asynchrone (QStash + Vercel Functions)

---

## 📞 Support

- **Projet** : Ibrahim Sacko — SK Designer Luxe / Créateur Boutique
- **Hébergement** : Vercel (recommandé) ou Netlify
- **DB** : Neon (gratuit) ou Supabase
- **Domaine** : `.ml` (Mali) ou `.com` selon disponibilité

Bon déploiement ! 🚀
