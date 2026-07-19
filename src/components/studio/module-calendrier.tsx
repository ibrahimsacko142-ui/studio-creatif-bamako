// Module 6 — Calendrier de contenu

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, CalendarDays, Sparkles, RefreshCw, Clock, Calendar } from 'lucide-react';
import { useStudio } from '@/lib/store';
import { CopyButton, DownloadTextButton, LoadingState, ErrorState, ProviderBadge } from './shared';

interface JourPub {
  jour: string;
  plateforme: string;
  type_contenu: string;
  idee: string;
  heure_suggeree: string;
}

interface CalendrierResult {
  periode?: string;
  jours_publication?: JourPub[];
  conseils?: string[] | string;
  raw?: string;
}

const TYPE_COLORS: Record<string, string> = {
  annonce: 'bg-orange-100 text-orange-800',
  coulisse: 'bg-amber-100 text-amber-800',
  interactif: 'bg-rose-100 text-rose-800',
  promo: 'bg-fuchsia-100 text-fuchsia-800',
  storytelling: 'bg-teal-100 text-teal-800',
};

const PLATEFORME_COLORS: Record<string, string> = {
  Facebook: 'bg-blue-100 text-blue-800',
  Instagram: 'bg-pink-100 text-pink-800',
  TikTok: 'bg-stone-800 text-white',
};

export function CalendrierModule() {
  const { setModule, user, saveDraft, drafts, clearDraft } = useStudio();
  const draftKey = 'calendrier';
  const saved = drafts[draftKey] || {};

  const [periode, setPeriode] = useState<'2' | '3' | '4'>((saved.periode as '2' | '3' | '4') || '2');
  const [typeCreateur, setTypeCreateur] = useState((saved.typeCreateur as string) || '');
  const [objectif, setObjectif] = useState((saved.objectif as string) || '');
  const [contenusRecents, setContenusRecents] = useState((saved.contenusRecents as string) || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalendrierResult | null>(null);
  const [provider, setProvider] = useState<string | undefined>();

  useEffect(() => {
    saveDraft(draftKey, { periode, typeCreateur, objectif, contenusRecents });
  }, [periode, typeCreateur, objectif, contenusRecents, saveDraft, draftKey]);

  const onSubmit = async () => {
    if (!typeCreateur) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/generate/calendrier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periode: parseInt(periode) as 2 | 3 | 4,
          type_createur: typeCreateur,
          objectif,
          contenus_recents: contenusRecents,
          userId: user?.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec');
      setResult(json.data);
      setProvider(json.provider);
      if (user) {
        try {
          await fetch('/api/user', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, action: 'decrement' }),
          });
        } catch {}
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    clearDraft(draftKey);
    setPeriode('2'); setTypeCreateur(''); setObjectif(''); setContenusRecents('');
    setResult(null); setError(null); setProvider(undefined);
  };

  // Group by week
  const groupedByWeek = (() => {
    if (!result?.jours_publication) return [];
    const groups: Record<string, JourPub[]> = {};
    result.jours_publication.forEach((j) => {
      const d = new Date(j.jour);
      if (isNaN(d.getTime())) return;
      // Compute ISO week number
      const onejan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
      const key = `Semaine ${week}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(j);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  })();

  const fullText = result ? `CALENDRIER DE CONTENU — ${result.periode || periode + ' semaines'}
Type de créateur: ${typeCreateur}

${(result.jours_publication || []).map((j) => `${j.jour} · ${j.plateforme} · ${j.type_contenu} · ${j.heure_suggeree}
   → ${j.idee}`).join('\n\n')}

=== CONSEILS ===
${Array.isArray(result.conseils) ? result.conseils.join('\n') : (result.conseils || '').split('|').map(s => s.trim()).filter(Boolean).join('\n')}` : '';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in-up">
      <Button variant="ghost" size="sm" onClick={() => setModule('home')} className="mb-3 -ml-2 text-stone-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-teal-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Calendrier de contenu</h1>
          <p className="text-stone-600 text-sm">Planning de publication sur 2 à 4 semaines, adapté à votre présence en ligne.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" /> Votre stratégie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="type-c">Votre profil créateur <span className="text-red-500">*</span></Label>
              <Input id="type-c" value={typeCreateur} onChange={(e) => setTypeCreateur(e.target.value)} placeholder="Ex : rappeur, designer, formateur, entrepreneur" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="periode-c">Durée du calendrier</Label>
              <Select value={periode} onValueChange={(v) => setPeriode(v as '2' | '3' | '4')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 semaines</SelectItem>
                  <SelectItem value="3">3 semaines</SelectItem>
                  <SelectItem value="4">4 semaines</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obj-c">Objectif principal</Label>
              <Input id="obj-c" value={objectif} onChange={(e) => setObjectif(e.target.value)} placeholder="Ex : promouvoir mon nouveau single, gagner 1000 abonnés" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recent-c">Contenus récents (à éviter de répéter)</Label>
              <Textarea id="recent-c" value={contenusRecents} onChange={(e) => setContenusRecents(e.target.value)} rows={3} placeholder="Ex : j'ai déjà posté une annonce de sortie la semaine dernière, des photos backstage…" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={onSubmit} disabled={loading || !typeCreateur} className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white">
                {loading ? 'Génération…' : 'Générer mon calendrier'}
              </Button>
              <Button variant="outline" onClick={onReset} disabled={loading}><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 self-start">
          {loading && <Card><CardContent className="p-0"><LoadingState label="Construction du calendrier…" /></CardContent></Card>}
          {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
          {!loading && !error && !result && (
            <Card className="border-dashed border-stone-300 bg-stone-50/50">
              <CardContent className="py-12 px-6 text-center">
                <CalendarDays className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Votre calendrier structuré par semaine apparaîtra ici.</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && result && (
            <Card className="border-teal-200 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-lg">Calendrier — {result.periode || `${periode} semaines`}</CardTitle>
                <ProviderBadge provider={provider} />
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto scroll-thin pr-2">
                {groupedByWeek.length > 0 ? (
                  groupedByWeek.map(([week, items]) => (
                    <div key={week}>
                      <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {week}
                      </h4>
                      <div className="space-y-2">
                        {items.sort((a, b) => a.jour.localeCompare(b.jour)).map((j, i) => (
                          <div key={i} className="rounded-lg border border-stone-200 bg-white p-3">
                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-stone-700">
                                {new Date(j.jour).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                              </span>
                              <div className="flex gap-1">
                                <Badge variant="outline" className={`text-[10px] ${PLATEFORME_COLORS[j.plateforme] || 'bg-stone-100'}`}>{j.plateforme}</Badge>
                                <Badge variant="outline" className={`text-[10px] ${TYPE_COLORS[j.type_contenu] || 'bg-stone-100'}`}>{j.type_contenu}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-stone-800 leading-snug">{j.idee}</p>
                            <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {j.heure_suggeree}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <pre className="text-xs bg-stone-100 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
                )}
                {result.conseils && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Conseils stratégiques</h4>
                      <ul className="space-y-1.5">
                        {(Array.isArray(result.conseils) ? result.conseils : String(result.conseils).split('|').map(s => s.trim()).filter(Boolean)).map((c, i) => (
                          <li key={i} className="text-sm text-stone-700 flex gap-2">
                            <span className="text-teal-600">●</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                {result.raw && <pre className="text-xs bg-stone-100 p-3 rounded-lg whitespace-pre-wrap">{result.raw}</pre>}
                <Separator />
                <div className="flex gap-2">
                  <DownloadTextButton text={fullText} filename={`calendrier-${periode}sem.txt`} />
                  <CopyButton text={fullText} label="Copier tout le calendrier" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
