// API — Module 1 : Bio & Presskit
// POST /api/generate/bio

import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIProvider } from '@/lib/ai';
import { SYSTEM_BIO, SCHEMA_BIO } from '@/lib/prompts';
import { extractJSON } from '@/lib/json';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface BioInput {
  nom: string;
  activite: string;
  parcours?: string;
  style?: string;
  realisations?: string;
  reseaux?: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BioInput;

    if (!body.nom || !body.activite) {
      return NextResponse.json(
        { error: 'Le nom et l\'activité sont requis.' },
        { status: 400 }
      );
    }

    const userPrompt = `Génère la bio professionnelle pour ce créateur:
- Nom / scène: ${body.nom}
- Activité / genre: ${body.activite}
- Parcours: ${body.parcours || 'non précisé'}
- Style: ${body.style || 'non précisé'}
- Réalisations: ${body.realisations || 'non précisé'}
- Réseaux sociaux / liens: ${body.reseaux || 'non précisé'}

${SCHEMA_BIO}`;

    const { content, provider } = await generateText(SYSTEM_BIO, userPrompt, {
      temperature: 0.8,
    });

    let parsed: unknown;
    const extracted = extractJSON(content);
    if (extracted.parsed) {
      parsed = extracted.parsed;
    } else {
      parsed = { raw: content };
    }

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'bio',
            titre: `Bio — ${body.nom}`,
            texteGenere: content,
            metadonnees: JSON.stringify({
              nom: body.nom,
              activite: body.activite,
              parcours: body.parcours,
            }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[bio] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({
      ok: true,
      data: parsed,
      provider: provider as AIProvider,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/bio]', msg);
    return NextResponse.json(
      { error: `Échec de la génération: ${msg}` },
      { status: 500 }
    );
  }
}
