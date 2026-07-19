// API — Module 3 : Scripts vidéo courts
// POST /api/generate/script

import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIProvider } from '@/lib/ai';
import { SYSTEM_SCRIPT, SCHEMA_SCRIPT } from '@/lib/prompts';
import { extractJSON } from '@/lib/json';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ScriptInput {
  sujet: string;
  duree: 15 | 30 | 60;
  plateforme: 'TikTok' | 'Reels' | 'Shorts' | 'tous';
  ton?: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScriptInput;
    if (!body.sujet) {
      return NextResponse.json({ error: 'Le sujet est requis.' }, { status: 400 });
    }

    const userPrompt = `Génère un script vidéo court pour TikTok/Reels/Shorts:
- Sujet: ${body.sujet}
- Durée cible: ${body.duree} secondes
- Plateforme: ${body.plateforme}
- Ton: ${body.ton || 'dynamique, accrocheur, moderne'}

Adapte le rythme à la durée. Pour 15s: ultra-concis. Pour 30s: équilibré. Pour 60s: développement plus riche.
${SCHEMA_SCRIPT}`;

    const { content, provider } = await generateText(SYSTEM_SCRIPT, userPrompt, {
      temperature: 0.85,
    });

    const extracted = extractJSON(content);
    const parsed: unknown = extracted.parsed || { raw: content };

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'script',
            titre: `Script ${body.duree}s — ${body.sujet.slice(0, 40)}`,
            texteGenere: content,
            metadonnees: JSON.stringify({ sujet: body.sujet, duree: body.duree, plateforme: body.plateforme }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[script] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, data: parsed, provider: provider as AIProvider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/script]', msg);
    return NextResponse.json({ error: `Échec: ${msg}` }, { status: 500 });
  }
}
