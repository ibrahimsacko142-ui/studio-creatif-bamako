// API — Module Hook Optimizer : améliore un hook existant
// POST /api/generate/hook-optimizer

import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIProvider } from '@/lib/ai';
import { SYSTEM_HOOK_OPTIMIZER, SCHEMA_HOOK_OPTIMIZER } from '@/lib/prompts';
import { extractJSON } from '@/lib/json';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface HookOptimizerInput {
  hook_original: string;
  cible?: string;
  plateforme?: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as HookOptimizerInput;
    if (!body.hook_original) {
      return NextResponse.json({ error: 'Le hook original est requis.' }, { status: 400 });
    }

    const userPrompt = `Analyse et améliore ce hook/post:
"HOOK ORIGINAL: ${body.hook_original}"

- Cible: ${body.cible || 'jeunesse 18-30 ans Bamako / Mali'}
- Plateforme: ${body.plateforme || 'TikTok / Reels / Facebook'}

1. Fais un diagnostic court de ce qui ne marche pas dans le hook original.
2. Génère 5 versions optimisées plus percutantes, en variant les techniques (curiosité, chiffres, émotion, contraste, question, identité locale).
3. Garde le sens intact, mais rends chaque version plus accrocheuse.
4. Donne un score viral estimé sur 10 et explique pourquoi chaque version est meilleure.

${SCHEMA_HOOK_OPTIMIZER}`;

    const { content, provider } = await generateText(SYSTEM_HOOK_OPTIMIZER, userPrompt, {
      temperature: 0.85,
    });

    const extracted = extractJSON(content);
    const parsed: unknown = extracted.parsed || { raw: content };

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'hook-optimizer',
            titre: `Hook optimisé — ${body.hook_original.slice(0, 40)}`,
            texteGenere: content,
            metadonnees: JSON.stringify({ hook_original: body.hook_original, plateforme: body.plateforme }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[hook-optimizer] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, data: parsed, provider: provider as AIProvider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/hook-optimizer]', msg);
    return NextResponse.json({ error: `Échec: ${msg}` }, { status: 500 });
  }
}
