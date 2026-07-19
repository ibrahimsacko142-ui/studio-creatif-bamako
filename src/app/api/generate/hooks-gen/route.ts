// API — Module Hooks Generator : 10 hooks personnalisés
// POST /api/generate/hooks-gen

import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIProvider } from '@/lib/ai';
import { SYSTEM_HOOKS_GEN, SCHEMA_HOOKS_GEN } from '@/lib/prompts';
import { extractJSON } from '@/lib/json';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface HooksGenInput {
  sujet: string;
  cible?: string;
  style?: string;
  plateforme?: 'TikTok' | 'Reels' | 'Facebook' | 'tous';
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as HooksGenInput;
    if (!body.sujet) {
      return NextResponse.json({ error: 'Le sujet est requis.' }, { status: 400 });
    }

    const userPrompt = `Génère 10 hooks (accroches) viraux pour ce contenu:
- Sujet: ${body.sujet}
- Cible: ${body.cible || 'jeunesse 18-30 ans à Bamako et au Mali'}
- Style du créateur: ${body.style || 'authentique, moderne'}
- Plateforme: ${body.plateforme || 'toutes'}

Varie les techniques: curiosité, choc, chiffres, émotion, polémique, identité locale, contraste, question.
Chaque hook doit être en 1 phrase courte (max 15 mots) et pouvoir ouvrir un post ou une vidéo TikTok/Reels.
Donne un score viral estimé sur 10 pour chaque hook et explique pourquoi il marche.

${SCHEMA_HOOKS_GEN}`;

    const { content, provider } = await generateText(SYSTEM_HOOKS_GEN, userPrompt, {
      temperature: 0.9,
    });

    const extracted = extractJSON(content);
    const parsed: unknown = extracted.parsed || { raw: content };

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'hooks-gen',
            titre: `10 hooks — ${body.sujet.slice(0, 50)}`,
            texteGenere: content,
            metadonnees: JSON.stringify({ sujet: body.sujet, cible: body.cible, plateforme: body.plateforme }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[hooks-gen] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, data: parsed, provider: provider as AIProvider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/hooks-gen]', msg);
    return NextResponse.json({ error: `Échec: ${msg}` }, { status: 500 });
  }
}
