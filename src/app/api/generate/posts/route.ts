// API — Module 2 : Posts réseaux sociaux
// POST /api/generate/posts

import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIProvider } from '@/lib/ai';
import { SYSTEM_POSTS, SCHEMA_POSTS } from '@/lib/prompts';
import { extractJSON } from '@/lib/json';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface PostsInput {
  sujet: string;
  plateforme: 'Facebook' | 'Instagram' | 'TikTok' | 'tous';
  ton: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PostsInput;
    if (!body.sujet) {
      return NextResponse.json({ error: 'Le sujet est requis.' }, { status: 400 });
    }

    const userPrompt = `Génère 4 posts réseaux sociaux variés sur ce sujet:
- Sujet / actualité: ${body.sujet}
- Plateforme cible: ${body.plateforme}
- Ton souhaité: ${body.ton || 'percutant, authentique, jeunesse malienne'}

Génère 4 variantes avec des angles différents (annonce, storytelling, interactif, promo).
${SCHEMA_POSTS}`;

    const { content, provider } = await generateText(SYSTEM_POSTS, userPrompt, {
      temperature: 0.9,
    });

    const extracted = extractJSON(content);
    const parsed: unknown = extracted.parsed || { raw: content };

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'post',
            titre: `Posts — ${body.sujet.slice(0, 50)}`,
            texteGenere: content,
            metadonnees: JSON.stringify({ sujet: body.sujet, plateforme: body.plateforme, ton: body.ton }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[posts] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, data: parsed, provider: provider as AIProvider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/posts]', msg);
    return NextResponse.json({ error: `Échec: ${msg}` }, { status: 500 });
  }
}
