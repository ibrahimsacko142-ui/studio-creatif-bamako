// Module 5 — Clips vidéo courts générés (Gemini / Veo)

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
  ToggleGroup, ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { ArrowLeft, Film, Sparkles, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useStudio } from '@/lib/store';
import { ErrorState, ProviderBadge } from './shared';
import { toast } from 'sonner';

export function VideoModule() {
  const { setModule, user, saveDraft, drafts, clearDraft } = useStudio();
  const draftKey = 'video';
  const saved = drafts[draftKey] || {};

  const [sujet, setSujet] = useState((saved.sujet as string) || '');
  const [duree, setDuree] = useState<'5' | '10'>((saved.duree as '5' | '10') || '5');
  const [style, setStyle] = useState((saved.style as string) || '');

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | undefined>();

  useEffect(() => {
    saveDraft(draftKey, { sujet, duree, style });
  }, [sujet, duree, style, saveDraft, draftKey]);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 6, 95));
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const onSubmit = async () => {
    if (!sujet) return;
    setLoading(true); setError(null); setVideoUrl(null); setProgress(5);
    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sujet,
          duree: parseInt(duree) as 5 | 10,
          style,
          userId: user?.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec');
      setVideoUrl(json.videoUrl);
      setProvider(json.provider);
      toast.success('Clip vidéo généré avec succès');
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
      setProgress(100);
    }
  };

  const onReset = () => {
    clearDraft(draftKey);
    setSujet(''); setDuree('5'); setStyle('');
    setVideoUrl(null); setError(null); setProvider(undefined); setProgress(0);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in-up">
      <Button variant="ghost" size="sm" onClick={() => setModule('home')} className="mb-3 -ml-2 text-stone-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
          <Film className="w-6 h-6 text-purple-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Clips vidéo courts</h1>
          <p className="text-stone-600 text-sm">Teaser 5s / 10s généré par IA vidéo Gemini Veo. Pour TikTok / Reels.</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-stone-700">
          <strong className="text-amber-800">Important :</strong> la génération vidéo est plus longue (2 à 5 minutes).
          Laissez la page ouverte pendant la génération. Pas de fallback — message d'erreur clair en cas d'indisponibilité Gemini.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Description du clip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sujet-v">Sujet / description <span className="text-red-500">*</span></Label>
              <Textarea id="sujet-v" value={sujet} onChange={(e) => setSujet(e.target.value)} rows={4} placeholder="Ex : Un jeune rappeur marche dans les rues de Bamako au coucher du soleil, s'arrête devant un mur de graffitis, regarde la caméra avec intensité." />
            </div>
            <div className="space-y-1.5">
              <Label>Durée du clip</Label>
              <ToggleGroup type="single" value={duree} onValueChange={(v) => v && setDuree(v as '5' | '10')} className="justify-start">
                <ToggleGroupItem value="5" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white">5 secondes</ToggleGroupItem>
                <ToggleGroupItem value="10" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white">10 secondes</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="style-v">Style visuel</Label>
              <Input id="style-v" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Ex : cinématique, urbain, néon, documentaire" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={onSubmit} disabled={loading || !sujet} className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 text-white">
                {loading ? 'Génération en cours…' : 'Générer le clip'}
              </Button>
              <Button variant="outline" onClick={onReset} disabled={loading}><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 self-start">
          {loading && (
            <Card>
              <CardContent className="py-12 px-6 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="text-center w-full">
                  <div className="font-semibold text-stone-900">Création du clip vidéo…</div>
                  <div className="text-sm text-stone-500 mt-1 mb-3">Gemini Veo génère votre clip (2-5 min).</div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-xs text-stone-500 mt-2">{Math.round(progress)}% · Ne fermez pas la page</div>
                </div>
              </CardContent>
            </Card>
          )}
          {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
          {!loading && !error && !videoUrl && (
            <Card className="border-dashed border-stone-300 bg-stone-50/50">
              <CardContent className="py-12 px-6 text-center">
                <Film className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Votre clip vidéo généré apparaîtra ici.</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && videoUrl && (
            <Card className="border-purple-200 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-lg">Clip généré</CardTitle>
                <ProviderBadge provider={provider} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-stone-200 bg-black aspect-video">
                  <video src={videoUrl} controls className="w-full h-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">{duree}s</Badge>
                  <Badge variant="outline">720p</Badge>
                </div>
                <Separator />
                <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white">
                  <a href={videoUrl} download={`clip-${duree}s-${Date.now()}.mp4`}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Télécharger MP4
                  </a>
                </Button>
                <p className="text-xs text-stone-500">
                  💡 Le clip est hébergé sur un serveur Gemini temporaire. Téléchargez-le pour le conserver.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
