// API — Module 6 : Calendrier de contenu
// POST /api/generate/calendrier

import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIProvider } from '@/lib/ai';
import { SYSTEM_CALENDRIER, SCHEMA_CALENDRIER } from '@/lib/prompts';
import { extractJSON } from '@/lib/json';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface CalendrierInput {
  periode: 2 | 3 | 4;
  type_createur: string;
  objectif?: string;
  contenus_recents?: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CalendrierInput;
    if (!body.periode || !body.type_createur) {
      return NextResponse.json(
        { error: 'La période et le type de créateur sont requis.' },
        { status: 400 }
      );
    }

    // Calcul de la date de début (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];

    const userPrompt = `Génère un calendrier de publication pour:
- Type de créateur: ${body.type_createur}
- Période: ${body.periode} semaines à partir du ${today}
- Objectif principal: ${body.objectif || "renforcer la présence en ligne et l'engagement"}
- Contenus récents (à éviter de répéter): ${body.contenus_recents || 'aucun'}

Le calendrier doit contenir 3 publications par semaine, sur Facebook principalement (public malien), avec quelques Instagram et TikTok.
${SCHEMA_CALENDRIER}`;

    const { content, provider } = await generateText(SYSTEM_CALENDRIER, userPrompt, {
      temperature: 0.7,
    });

    const extracted = extractJSON(content);
    const parsed: unknown = extracted.parsed || { raw: content };

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'calendrier',
            titre: `Calendrier ${body.periode} semaines — ${body.type_createur}`,
            texteGenere: content,
            metadonnees: JSON.stringify({ periode: body.periode, type_createur: body.type_createur }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[calendrier] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, data: parsed, provider: provider as AIProvider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/calendrier]', msg);
    return NextResponse.json({ error: `Échec: ${msg}` }, { status: 500 });
  }
}
