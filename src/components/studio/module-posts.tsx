// Module 2 — Posts réseaux sociaux

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Share2, Sparkles, RefreshCw, Facebook, Instagram } from 'lucide-react';
import { useStudio } from '@/lib/store';
import { CopyButton, LoadingState, ErrorState, ProviderBadge } from './shared';

interface Post {
  texte: string;
  hashtags: string[] | string;
  plateforme: string;
  tone: string;
}

interface PostsResult {
  posts?: Post[];
  conseil_publication?: string;
  raw?: string;
}

export function PostsModule() {
  const { setModule, user, saveDraft, drafts, clearDraft } = useStudio();
  const draftKey = 'posts';
  const saved = drafts[draftKey] || {};

  const [sujet, setSujet] = useState((saved.sujet as string) || '');
  const [plateforme, setPlateforme] = useState((saved.plateforme as string) || 'tous');
  const [ton, setTon] = useState((saved.ton as string) || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PostsResult | null>(null);
  const [provider, setProvider] = useState<string | undefined>();

  useEffect(() => {
    saveDraft(draftKey, { sujet, plateforme, ton });
  }, [sujet, plateforme, ton, saveDraft, draftKey]);

  const onSubmit = async () => {
    if (!sujet) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/generate/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sujet, plateforme, ton, userId: user?.id }),
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
    setSujet(''); setPlateforme('tous'); setTon('');
    setResult(null); setError(null); setProvider(undefined);
  };

  const platformIcon = (p: string) => {
    if (p === 'Facebook') return <Facebook className="w-3 h-3" />;
    if (p === 'Instagram') return <Instagram className="w-3 h-3" />;
    return <Share2 className="w-3 h-3" />;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in-up">
      <Button variant="ghost" size="sm" onClick={() => setModule('home')} className="mb-3 -ml-2 text-stone-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <Share2 className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Posts réseaux sociaux</h1>
          <p className="text-stone-600 text-sm">4 variantes de posts avec hashtags adaptés au marché malien.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> Sujet du post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sujet">Sujet / actualité <span className="text-red-500">*</span></Label>
              <Textarea id="sujet" value={sujet} onChange={(e) => setSujet(e.target.value)} rows={3} placeholder="Ex : Sortie de mon nouveau single « Bamako Nuit » le 15 août" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plateforme">Plateforme cible</Label>
              <Select value={plateforme} onValueChange={setPlateforme}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes (Facebook + Instagram + TikTok)</SelectItem>
                  <SelectItem value="Facebook">Facebook uniquement</SelectItem>
                  <SelectItem value="Instagram">Instagram uniquement</SelectItem>
                  <SelectItem value="TikTok">TikTok uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ton">Ton souhaité</Label>
              <Input id="ton" value={ton} onChange={(e) => setTon(e.target.value)} placeholder="Ex : percutant, fière, authentique, jeune" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={onSubmit} disabled={loading || !sujet} className="flex-1 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white">
                {loading ? 'Génération…' : 'Générer 4 posts'}
              </Button>
              <Button variant="outline" onClick={onReset} disabled={loading}><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 self-start">
          {loading && <Card><CardContent className="p-0"><LoadingState label="Création de vos posts…" /></CardContent></Card>}
          {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
          {!loading && !error && !result && (
            <Card className="border-dashed border-stone-300 bg-stone-50/50">
              <CardContent className="py-12 px-6 text-center">
                <Share2 className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Vos 4 posts variants apparaîtront ici.</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && result && (
            <Card className="border-amber-200 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-lg">Posts générés ({result.posts?.length || 0})</CardTitle>
                <ProviderBadge provider={provider} />
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto scroll-thin pr-2">
                {result.posts?.map((p, i) => (
                  <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-[10px] gap-1">
                        {platformIcon(p.plateforme)} {p.plateforme}
                      </Badge>
                      <span className="text-[10px] text-stone-500 uppercase">{p.tone}</span>
                    </div>
                    <p className="text-stone-800 text-sm whitespace-pre-line mb-2 leading-relaxed">{p.texte}</p>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(p.hashtags) ? p.hashtags : (typeof p.hashtags === 'string' ? p.hashtags.split(',').map(s => s.trim()).filter(Boolean) : [])).map((h, j) => (
                        <span key={j} className="text-xs text-amber-700 font-medium">{h}</span>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end">
                      <CopyButton text={`${p.texte}\n\n${Array.isArray(p.hashtags) ? p.hashtags.join(' ') : (p.hashtags || '')}`} label="Copier le post" />
                    </div>
                  </div>
                ))}
                {result.conseil_publication && (
                  <>
                    <Separator />
                    <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                      <div className="text-xs font-semibold text-amber-800 uppercase mb-1">Conseil publication</div>
                      <p className="text-sm text-stone-700">{result.conseil_publication}</p>
                    </div>
                  </>
                )}
                {result.raw && (
                  <pre className="text-xs bg-stone-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">{result.raw}</pre>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
