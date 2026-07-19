// API — Module 4 : Visuels générés (Gemini / Imagen)
// POST /api/generate/image

import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface ImageInput {
  description: string;
  style?: string;
  couleurs?: string;
  format?: 'square' | 'portrait' | 'landscape' | 'story';
  userId?: string;
}

const FORMAT_MAP: Record<NonNullable<ImageInput['format']>, '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440'> = {
  square: '1024x1024',
  portrait: '864x1152',
  landscape: '1152x864',
  story: '720x1440',
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ImageInput;
    if (!body.description) {
      return NextResponse.json({ error: 'La description est requise.' }, { status: 400 });
    }

    const fullPrompt = `${body.description}. Style: ${body.style || 'moderne, professionnel'}. Palette: ${body.couleurs || 'cohérente avec une marque créative ouest-africaine'}. Haute qualité, prêt à publier sur réseaux sociaux.`;
    const size = FORMAT_MAP[body.format || 'square'];

    const { base64, provider } = await generateImage(fullPrompt, size);
    const dataUrl = `data:image/png;base64,${base64}`;

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'image',
            titre: `Visuel — ${body.description.slice(0, 50)}`,
            base64Image: dataUrl,
            metadonnees: JSON.stringify({ description: body.description, style: body.style, format: body.format }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[image] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, imageUrl: dataUrl, provider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/image]', msg);
    return NextResponse.json({ error: `Échec génération visuel: ${msg}` }, { status: 500 });
  }
}
