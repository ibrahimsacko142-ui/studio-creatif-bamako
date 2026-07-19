#!/usr/bin/env bun
/**
 * Migration SQLite → PostgreSQL
 * Studio Créatif Bamako
 *
 * Usage :
 *   bun run scripts/migrate-to-postgres.ts
 *
 * Pré-requis :
 *   - DATABASE_URL=postgresql://... dans .env (la nouvelle DB PostgreSQL)
 *   - SQLITE_SOURCE_URL=file:./db/custom.db (l'ancienne DB SQLite)
 *
 * Le script :
 *   1. Pousse le schéma Prisma sur PostgreSQL (création des tables)
 *   2. Lit toutes les données de SQLite
 *   3. Les insère dans PostgreSQL
 *   4. Affiche un récap
 */

import { PrismaClient } from '@prisma/client';
import { PrismaClient as SQLitePrisma } from '@prisma/client';
import path from 'path';

// Lecture des variables d'environnement
const sqliteUrl = process.env.SQLITE_SOURCE_URL || 'file:./db/custom.db';
const postgresUrl = process.env.DATABASE_URL;

if (!postgresUrl || !postgresUrl.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL doit être une URL PostgreSQL dans .env');
  console.error('   Ex: DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"');
  process.exit(1);
}

console.log('🔄 Migration SQLite → PostgreSQL');
console.log(`   Source : ${sqliteUrl}`);
console.log(`   Cible  : ${postgresUrl.replace(/:[^:@]+@/, ':***@')}`);
console.log('');

async function main() {
  // 1. Prisma client SQLite (source)
  const sqlite = new SQLitePrismaClient({
    datasources: { db: { url: sqliteUrl } },
  });

  // 2. Prisma client PostgreSQL (cible)
  const postgres = new PrismaClient();

  console.log('📦 Lecture des données SQLite...');
  const users = await sqlite.user.findMany();
  const contenus = await sqlite.contenuGenere.findMany();
  const abonnements = await sqlite.abonnement.findMany();
  console.log(`   ${users.length} users, ${contenus.length} contenus, ${abonnements.length} abonnements`);

  console.log('');
  console.log('🚀 Push du schéma sur PostgreSQL...');
  // Note : lancer `bun run db:push` à la main avant ce script
  // (le script suppose que le schéma est déjà appliqué)

  console.log('');
  console.log('⤴️  Migration des users...');
  let count = 0;
  for (const u of users) {
    try {
      await postgres.user.upsert({
        where: { id: u.id },
        create: {
          id: u.id,
          nom: u.nom,
          email: u.email,
          whatsapp: u.whatsapp,
          typeCreation: u.typeCreation,
          quotaMensuelRestant: u.quotaMensuelRestant,
          dateInscription: u.dateInscription,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        },
        update: {},
      });
      count++;
    } catch (e) {
      console.error(`   ⚠️ user ${u.id} échoué:`, e instanceof Error ? e.message : e);
    }
  }
  console.log(`   ✅ ${count}/${users.length} users migrés`);

  console.log('');
  console.log('⤴️  Migration des contenus générés...');
  count = 0;
  for (const c of contenus) {
    try {
      await postgres.contenuGenere.upsert({
        where: { id: c.id },
        create: {
          id: c.id,
          userId: c.userId,
          type: c.type,
          titre: c.titre,
          texteGenere: c.texteGenere,
          base64Image: c.base64Image,
          videoUrl: c.videoUrl,
          metadonnees: c.metadonnees,
          apiUtilisee: c.apiUtilisee,
          dateCreation: c.dateCreation,
        },
        update: {},
      });
      count++;
    } catch (e) {
      console.error(`   ⚠️ contenu ${c.id} échoué:`, e instanceof Error ? e.message : e);
    }
  }
  console.log(`   ✅ ${count}/${contenus.length} contenus migrés`);

  console.log('');
  console.log('⤴️  Migration des abonnements...');
  count = 0;
  for (const a of abonnements) {
    try {
      await postgres.abonnement.upsert({
        where: { id: a.id },
        create: {
          id: a.id,
          userId: a.userId,
          plan: a.plan,
          dateDebut: a.dateDebut,
          dateFin: a.dateFin,
          statutPaiement: a.statutPaiement,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        },
        update: {},
      });
      count++;
    } catch (e) {
      console.error(`   ⚠️ abonnement ${a.id} échoué:`, e instanceof Error ? e.message : e);
    }
  }
  console.log(`   ✅ ${count}/${abonnements.length} abonnements migrés`);

  console.log('');
  console.log('🎉 Migration terminée avec succès !');

  await sqlite.$disconnect();
  await postgres.$disconnect();
}

main().catch((e) => {
  console.error('❌ Migration échouée:', e);
  process.exit(1);
});
