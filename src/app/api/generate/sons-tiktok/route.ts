// API — Module Sons TikTok viraux
// POST /api/generate/sons-tiktok

import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIProvider } from '@/lib/ai';
import { SYSTEM_SONS_TIKTOK, SCHEMA_SONS_TIKTOK } from '@/lib/prompts';
import { extractJSON } from '@/lib/json';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface SonsInput {
  genre?: string; // afrobeats, amapiano, rap mali, coupé-décalé, tous
  type_contenu?: string; // lip-sync, dance, freestyle...
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SonsInput;
    const today = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const userPrompt = `Génère 6 sons TikTok viraux du moment (${today}) pour un créateur malien.
- Genre préféré: ${body.genre || 'tous (afrobeats, amapiano, rap mali, coupé-décalé)'}
- Type de contenu: ${body.type_contenu || 'tous types (lip-sync, dance, freestyle, storytelling)'}

Pour chaque son, donne: nom, artiste, genre, durée de la trend, estimation du nombre de vidéos TikTok qui l'utilisent, type de contenu associé, idée concrète d'utilisation pour un créateur malien, hashtags.

${SCHEMA_SONS_TIKTOK}`;

    const { content, provider } = await generateText(SYSTEM_SONS_TIKTOK, userPrompt, {
      temperature: 0.8,
      provider: 'grok', // Grok a accès aux tendances récentes via X
    });

    const extracted = extractJSON(content);
    const parsed: unknown = extracted.parsed || { raw: content };

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'sons-tiktok',
            titre: `Sons TikTok — ${today}`,
            texteGenere: content,
            metadonnees: JSON.stringify({ genre: body.genre, type_contenu: body.type_contenu }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[sons-tiktok] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, data: parsed, provider: provider as AIProvider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/sons-tiktok]', msg);
    return NextResponse.json({ error: `Échec: ${msg}` }, { status: 500 });
  }
}
