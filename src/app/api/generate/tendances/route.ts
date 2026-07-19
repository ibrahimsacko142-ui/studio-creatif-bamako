// API — Module Tendances : veille tendances Mali du jour
// POST /api/generate/tendances

import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIProvider } from '@/lib/ai';
import { SYSTEM_TENDANCES, SCHEMA_TENDANCES } from '@/lib/prompts';
import { extractJSON } from '@/lib/json';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface TendancesInput {
  cible?: string; // musicien, designer, entrepreneur...
  periode?: 'jour' | 'semaine';
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TendancesInput;
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const userPrompt = `Génère les tendances du jour (${today}) pour un créateur malien de type "${body.cible || 'généraliste'}".
Priorité: ${body.periode || 'jour'}.

Identifie 5 sujets brûlants exploitables par un créateur à Bamako ou au Mali cette semaine (musique, foot, événements culturels, network drama, succès locaux, drames, etc.).

Pour chaque tendance, donne : sujet, catégorie, intensité, 3 angles créatifs concrets pour exploiter le sujet, hashtags pertinents, durée de vie estimée.

${SCHEMA_TENDANCES}`;

    const { content, provider } = await generateText(SYSTEM_TENDANCES, userPrompt, {
      temperature: 0.7,
      provider: 'grok', // Grok a accès à l'actualité récente via X
    });

    const extracted = extractJSON(content);
    const parsed: unknown = extracted.parsed || { raw: content };

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'tendances',
            titre: `Tendances ${today}`,
            texteGenere: content,
            metadonnees: JSON.stringify({ cible: body.cible, periode: body.periode }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[tendances] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, data: parsed, provider: provider as AIProvider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/tendances]', msg);
    return NextResponse.json({ error: `Échec: ${msg}` }, { status: 500 });
  }
}
