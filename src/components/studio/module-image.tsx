// Module 4 — Visuels générés (Gemini / Imagen)

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ToggleGroup, ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { ArrowLeft, Image as ImageIcon, Sparkles, RefreshCw, Download, Loader2 } from 'lucide-react';
import { useStudio } from '@/lib/store';
import { ErrorState, ProviderBadge } from './shared';
import { toast } from 'sonner';

export function ImageModule() {
  const { setModule, user, saveDraft, drafts, clearDraft } = useStudio();
  const draftKey = 'image';
  const saved = drafts[draftKey] || {};

  const [description, setDescription] = useState((saved.description as string) || '');
  const [style, setStyle] = useState((saved.style as string) || '');
  const [couleurs, setCouleurs] = useState((saved.couleurs as string) || '');
  const [format, setFormat] = useState<'square' | 'portrait' | 'landscape' | 'story'>(
    (saved.format as 'square' | 'portrait' | 'landscape' | 'story') || 'square'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | undefined>();

  useEffect(() => {
    saveDraft(draftKey, { description, style, couleurs, format });
  }, [description, style, couleurs, format, saveDraft, draftKey]);

  const onSubmit = async () => {
    if (!description) return;
    setLoading(true); setError(null); setImageUrl(null);
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, style, couleurs, format, userId: user?.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec');
      setImageUrl(json.imageUrl);
      setProvider(json.provider);
      toast.success('Visuel généré avec succès');
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
    setDescription(''); setStyle(''); setCouleurs(''); setFormat('square');
    setImageUrl(null); setError(null); setProvider(undefined);
  };

  const onDownload = async () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `visuel-${Date.now()}.png`;
    a.click();
    toast.success('Image téléchargée');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in-up">
      <Button variant="ghost" size="sm" onClick={() => setModule('home')} className="mb-3 -ml-2 text-stone-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-fuchsia-100 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-fuchsia-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Visuels générés</h1>
          <p className="text-stone-600 text-sm">Pochette, flyer, visuel post — généré par IA Gemini Imagen.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-600" /> Description du visuel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="desc-i">Description <span className="text-red-500">*</span></Label>
              <Textarea id="desc-i" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Ex : Pochette d'album pour un single afropop. Image d'un coucher de soleil sur le fleuve Niger à Bamako, silhouette d'un musicien avec guitare." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="style-i">Style visuel</Label>
              <Input id="style-i" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Ex : minimaliste, vintage, néon, photo réaliste" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="couleurs-i">Couleurs de marque</Label>
              <Input id="couleurs-i" value={couleurs} onChange={(e) => setCouleurs(e.target.value)} placeholder="Ex : orange, ocre, noir, blanc" />
            </div>
            <div className="space-y-1.5">
              <Label>Format</Label>
              <ToggleGroup type="single" value={format} onValueChange={(v) => v && setFormat(v as 'square' | 'portrait' | 'landscape' | 'story')} className="justify-start">
                <ToggleGroupItem value="square" className="data-[state=on]:bg-fuchsia-600 data-[state=on]:text-white">Carré 1:1</ToggleGroupItem>
                <ToggleGroupItem value="portrait" className="data-[state=on]:bg-fuchsia-600 data-[state=on]:text-white">Portrait</ToggleGroupItem>
                <ToggleGroupItem value="landscape" className="data-[state=on]:bg-fuchsia-600 data-[state=on]:text-white">Paysage</ToggleGroupItem>
                <ToggleGroupItem value="story" className="data-[state=on]:bg-fuchsia-600 data-[state=on]:text-white">Story 9:16</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={onSubmit} disabled={loading || !description} className="flex-1 bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:from-fuchsia-700 hover:to-purple-600 text-white">
                {loading ? 'Génération…' : 'Générer le visuel'}
              </Button>
              <Button variant="outline" onClick={onReset} disabled={loading}><RefreshCw className="w-4 h-4" /></Button>
            </div>
            <p className="text-xs text-stone-500">
              ⚠️ La génération d'image peut prendre 10 à 30 secondes. Pas de fallback — en cas d'indisponibilité Gemini, un message d'erreur s'affiche.
            </p>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 self-start">
          {loading && (
            <Card>
              <CardContent className="py-16 px-6 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-stone-900">Création du visuel…</div>
                  <div className="text-sm text-stone-500 mt-1">Gemini Imagen génère votre image (10-30s).</div>
                </div>
              </CardContent>
            </Card>
          )}
          {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
          {!loading && !error && !imageUrl && (
            <Card className="border-dashed border-stone-300 bg-stone-50/50">
              <CardContent className="py-12 px-6 text-center">
                <ImageIcon className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Votre visuel généré apparaîtra ici.</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && imageUrl && (
            <Card className="border-fuchsia-200 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-lg">Visuel généré</CardTitle>
                <ProviderBadge provider={provider} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                  <img src={imageUrl} alt="Visuel généré par IA" className="w-full h-auto" />
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={onDownload} className="flex-1 bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white">
                    <Download className="w-4 h-4 mr-2" /> Télécharger PNG
                  </Button>
                </div>
                <p className="text-xs text-stone-500">
                  💡 Vous pouvez régénérer avec une description affinée si le résultat ne convient pas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
