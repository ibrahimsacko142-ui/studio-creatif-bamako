// Module 3 — Scripts vidéo courts

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
import {
  ToggleGroup, ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { ArrowLeft, Video, Sparkles, RefreshCw, Clapperboard, Megaphone, Film } from 'lucide-react';
import { useStudio } from '@/lib/store';
import { CopyButton, DownloadTextButton, LoadingState, ErrorState, ProviderBadge } from './shared';

interface ScriptResult {
  titre?: string;
  duree?: number | string;
  accroche?: string;
  corps?: string;
  appel_action?: string;
  plans_suggérés?: string[] | string;
  musique_ambiance?: string;
  raw?: string;
}

export function ScriptModule() {
  const { setModule, user, saveDraft, drafts, clearDraft } = useStudio();
  const draftKey = 'script';
  const saved = drafts[draftKey] || {};

  const [sujet, setSujet] = useState((saved.sujet as string) || '');
  const [duree, setDuree] = useState<'15' | '30' | '60'>((saved.duree as '15' | '30' | '60') || '30');
  const [plateforme, setPlateforme] = useState((saved.plateforme as string) || 'TikTok');
  const [ton, setTon] = useState((saved.ton as string) || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [provider, setProvider] = useState<string | undefined>();

  useEffect(() => {
    saveDraft(draftKey, { sujet, duree, plateforme, ton });
  }, [sujet, duree, plateforme, ton, saveDraft, draftKey]);

  const onSubmit = async () => {
    if (!sujet) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sujet,
          duree: parseInt(duree) as 15 | 30 | 60,
          plateforme,
          ton,
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
    setSujet(''); setDuree('30'); setPlateforme('TikTok'); setTon('');
    setResult(null); setError(null); setProvider(undefined);
  };

  const fullText = result ? `SCRIPT VIDÉO — ${result.titre || sujet}
Durée: ${result.duree || duree}s · Plateforme: ${plateforme}

=== ACCROCHE (3 premières secondes) ===
${result.accroche || ''}

=== CORPS ===
${result.corps || ''}

=== APPEL À L'ACTION ===
${result.appel_action || ''}

=== PLANS SUGGÉRÉS ===
${Array.isArray(result.plans_suggérés) ? result.plans_suggérés.map((p, i) => `${i + 1}. ${p}`).join('\n') : (result.plans_suggérés || '').split('|').map(s => s.trim()).filter(Boolean).map((p, i) => `${i + 1}. ${p}`).join('\n')}

=== MUSIQUE / AMBIANCE ===
${result.musique_ambiance || ''}` : '';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in-up">
      <Button variant="ghost" size="sm" onClick={() => setModule('home')} className="mb-3 -ml-2 text-stone-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
          <Video className="w-6 h-6 text-rose-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Scripts vidéo courts</h1>
          <p className="text-stone-600 text-sm">Script TikTok / Reels / Shorts structuré : accroche, corps, appel à l'action.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600" /> Votre vidéo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sujet-s">Sujet de la vidéo <span className="text-red-500">*</span></Label>
              <Textarea id="sujet-s" value={sujet} onChange={(e) => setSujet(e.target.value)} rows={3} placeholder="Ex : Présenter mon nouveau clip, teaser de mon EP, behind the scenes…" />
            </div>
            <div className="space-y-1.5">
              <Label>Durée cible</Label>
              <ToggleGroup type="single" value={duree} onValueChange={(v) => v && setDuree(v as '15' | '30' | '60')} className="justify-start">
                <ToggleGroupItem value="15" className="data-[state=on]:bg-rose-600 data-[state=on]:text-white">15 sec</ToggleGroupItem>
                <ToggleGroupItem value="30" className="data-[state=on]:bg-rose-600 data-[state=on]:text-white">30 sec</ToggleGroupItem>
                <ToggleGroupItem value="60" className="data-[state=on]:bg-rose-600 data-[state=on]:text-white">60 sec</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plateforme-s">Plateforme</Label>
              <Select value={plateforme} onValueChange={setPlateforme}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Reels">Instagram Reels</SelectItem>
                  <SelectItem value="Shorts">YouTube Shorts</SelectItem>
                  <SelectItem value="tous">Toutes plateformes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ton-s">Ton</Label>
              <Input id="ton-s" value={ton} onChange={(e) => setTon(e.target.value)} placeholder="Ex : dynamique, mystérieux, humoristique" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={onSubmit} disabled={loading || !sujet} className="flex-1 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white">
                {loading ? 'Génération…' : 'Générer le script'}
              </Button>
              <Button variant="outline" onClick={onReset} disabled={loading}><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 self-start">
          {loading && <Card><CardContent className="p-0"><LoadingState label="Écriture du script…" /></CardContent></Card>}
          {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
          {!loading && !error && !result && (
            <Card className="border-dashed border-stone-300 bg-stone-50/50">
              <CardContent className="py-12 px-6 text-center">
                <Clapperboard className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Votre script vidéo structuré apparaîtra ici.</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && result && (
            <Card className="border-rose-200 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-lg">{result.titre || 'Script généré'}</CardTitle>
                <ProviderBadge provider={provider} />
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto scroll-thin pr-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-rose-50 text-rose-700"><Video className="w-3 h-3 mr-1" /> {result.duree || duree}s</Badge>
                  <Badge variant="outline">{plateforme}</Badge>
                </div>
                {result.accroche && (
                  <div className="bg-rose-50/60 p-3 rounded-lg border-l-4 border-rose-500">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1"><Megaphone className="w-3 h-3" /> Accroche (3s)</h4>
                      <CopyButton text={result.accroche} />
                    </div>
                    <p className="text-stone-800 text-sm leading-relaxed">{result.accroche}</p>
                  </div>
                )}
                {result.corps && (
                  <div className="bg-white p-3 rounded-lg border border-stone-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide">Corps</h4>
                      <CopyButton text={result.corps} />
                    </div>
                    <p className="text-stone-800 text-sm whitespace-pre-line leading-relaxed">{result.corps}</p>
                  </div>
                )}
                {result.appel_action && (
                  <div className="bg-amber-50/60 p-3 rounded-lg border-l-4 border-amber-500">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Appel à l'action</h4>
                      <CopyButton text={result.appel_action} />
                    </div>
                    <p className="text-stone-800 text-sm leading-relaxed font-medium">{result.appel_action}</p>
                  </div>
                )}
                {result.plans_suggérés && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-2 flex items-center gap-1"><Film className="w-3 h-3" /> Plans suggérés</h4>
                      <ol className="space-y-1.5">
                        {(Array.isArray(result.plans_suggérés) ? result.plans_suggérés : String(result.plans_suggérés).split('|').map(s => s.trim()).filter(Boolean)).map((p, i) => (
                          <li key={i} className="text-sm text-stone-700 flex gap-2">
                            <span className="font-bold text-rose-600 min-w-5">{i + 1}.</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </>
                )}
                {result.musique_ambiance && (
                  <div className="text-sm text-stone-600 italic">
                    <span className="font-semibold">Musique / ambiance :</span> {result.musique_ambiance}
                  </div>
                )}
                {result.raw && <pre className="text-xs bg-stone-100 p-3 rounded-lg whitespace-pre-wrap">{result.raw}</pre>}
                <Separator />
                <DownloadTextButton text={fullText} filename={`script-${duree}s-${(sujet || 'video').toLowerCase().slice(0, 30).replace(/\s+/g, '-')}.txt`} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
