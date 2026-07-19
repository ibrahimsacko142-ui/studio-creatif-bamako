#!/usr/bin/env bash
# ============================================================
#  Studio Créatif Bamako — Script de déploiement automatisé
# ============================================================
#
#  Usage :
#    bash scripts/deploy.sh setup     # Setup initial (git, npm, prisma)
#    bash scripts/deploy.sh db-push   # Pousser le schéma sur la DB courante
#    bash scripts/deploy.sh migrate   # Migrer SQLite → PostgreSQL
#    bash scripts/deploy.sh vercel    # Déployer sur Vercel
#    bash scripts/deploy.sh all       # Tout faire dans l'ordre
#
#  Pré-requis :
#    - .env configuré avec DATABASE_URL (PostgreSQL pour prod)
#    - Vercel CLI installé : npm i -g vercel
#    - Pour migration : SQLITE_SOURCE_URL=file:./db/custom.db
# ============================================================

set -e

cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

echo "🎨 Studio Créatif Bamako — Déploiement"
echo "Dossier : $PROJECT_DIR"
echo ""

case "${1:-help}" in

  setup)
    echo "📦 Installation des dépendances..."
    bun install

    echo ""
    echo "🔧 Vérification de .env..."
    if [ ! -f .env ]; then
      echo "⚠️  .env manquant. Copie .env.example en .env et remplis les valeurs."
      exit 1
    fi

    echo ""
    echo "🗄️  Génération du client Prisma..."
    bun run db:generate

    echo ""
    echo "✅ Setup terminé. Tu peux maintenant lancer :"
    echo "   bash scripts/deploy.sh db-push    # Initialiser la DB"
    echo "   bun run dev                       # Tester en local"
    ;;

  db-push)
    echo "🗄️  Push du schéma Prisma sur la base..."
    bun run db:push
    echo "✅ Base de données synchronisée"
    ;;

  migrate)
    echo "🔄 Migration SQLite → PostgreSQL..."
    if [ ! -f db/custom.db ]; then
      echo "⚠️  db/custom.db introuvable. Rien à migrer."
      exit 0
    fi
    SQLITE_SOURCE_URL="file:./db/custom.db" bun run scripts/migrate-to-postgres.ts
    echo "✅ Migration terminée"
    ;;

  vercel)
    echo "▲ Déploiement Vercel..."
    if ! command -v vercel &> /dev/null; then
      echo "❌ Vercel CLI non installé. Lance : npm i -g vercel"
      exit 1
    fi

    echo "Login Vercel (si nécessaire)..."
    vercel whoami || vercel login

    echo ""
    echo "🚀 Déploiement en production..."
    vercel --prod

    echo ""
    echo "✅ Déployé ! Récupère l'URL ci-dessus."
    echo ""
    echo "📋 N'oublie pas de configurer les variables d'environnement :"
    echo "   vercel env add DATABASE_URL"
    echo "   vercel env add ZAI_API_KEY"
    echo "   vercel env add ZAI_BASE_URL"
    ;;

  all)
    echo "🚀 DÉPLOIEMENT COMPLET"
    echo ""
    bash "$0" setup
    echo ""
    bash "$0" db-push
    echo ""
    bash "$0" migrate
    echo ""
    bash "$0" vercel
    ;;

  *)
    echo "Usage: bash scripts/deploy.sh {setup|db-push|migrate|vercel|all}"
    echo ""
    echo "Commands:"
    echo "  setup     Installer les dépendances + générer Prisma"
    echo "  db-push   Pousser le schéma sur la DB courante"
    echo "  migrate   Migrer SQLite → PostgreSQL"
    echo "  vercel    Déployer sur Vercel"
    echo "  all       Tout faire dans l'ordre"
    ;;
esac
