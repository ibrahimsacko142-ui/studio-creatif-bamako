// API — Initialiser / créer un utilisateur local (MVP sans auth complexe)
// POST /api/user  — créer / retrouver un utilisateur
// GET  /api/user?userId=... — récupérer utilisateur + historique
// PATCH /api/user — décrémenter quota

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

interface InitInput {
  nom: string;
  whatsapp?: string;
  email?: string;
  typeCreation?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InitInput;
    if (!body.nom) {
      return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 });
    }

    let user = null;
    if (body.whatsapp) {
      user = await db.user.findFirst({ where: { whatsapp: body.whatsapp } });
    }
    if (!user && body.email) {
      user = await db.user.findFirst({ where: { email: body.email } });
    }

    if (!user) {
      user = await db.user.create({
        data: {
          nom: body.nom,
          whatsapp: body.whatsapp || null,
          email: body.email || null,
          typeCreation: body.typeCreation || 'entrepreneur',
          quotaMensuelRestant: 3,
        },
      });
      await db.abonnement.create({
        data: {
          userId: user.id,
          plan: 'gratuit',
          statutPaiement: 'none',
        },
      });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/user/init]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      contenusGeneres: { orderBy: { dateCreation: 'desc' }, take: 50 },
      abonnements: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  return NextResponse.json({ ok: true, user });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { userId: string; action: 'decrement' | 'reset' };
    if (body.action === 'decrement') {
      const user = await db.user.findUnique({ where: { id: body.userId } });
      if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
      const nouveauQuota = Math.max(0, user.quotaMensuelRestant - 1);
      await db.user.update({ where: { id: body.userId }, data: { quotaMensuelRestant: nouveauQuota } });
      return NextResponse.json({ ok: true, quota: nouveauQuota });
    }
    return NextResponse.json({ error: 'Action non supportée' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
