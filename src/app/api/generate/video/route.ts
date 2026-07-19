// API — Module 5 : Clips vidéo courts générés (Gemini / Veo)
// POST /api/generate/video

import { NextRequest, NextResponse } from 'next/server';
import { generateVideo } from '@/lib/ai';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface VideoInput {
  sujet: string;
  duree: 5 | 10;
  style?: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VideoInput;
    if (!body.sujet) {
      return NextResponse.json({ error: 'Le sujet est requis.' }, { status: 400 });
    }

    const prompt = `${body.sujet}. Style visuel: ${body.style || 'moderne, dynamique, urbain ouest-africain'}. Clip court percutant pour réseaux sociaux (TikTok/Reels).`;

    const { videoUrl, provider } = await generateVideo(prompt, {
      duration: body.duree,
      size: '1280x720',
    });

    if (body.userId) {
      try {
        await db.contenuGenere.create({
          data: {
            userId: body.userId,
            type: 'video',
            titre: `Clip ${body.duree}s — ${body.sujet.slice(0, 40)}`,
            videoUrl,
            metadonnees: JSON.stringify({ sujet: body.sujet, duree: body.duree, style: body.style }),
            apiUtilisee: provider,
          },
        });
      } catch (e) {
        console.warn('[video] sauvegarde DB échouée:', e);
      }
    }

    return NextResponse.json({ ok: true, videoUrl, provider });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/generate/video]', msg);
    return NextResponse.json({ error: `Échec génération clip vidéo: ${msg}` }, { status: 500 });
  }
}
