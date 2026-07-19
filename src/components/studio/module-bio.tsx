// Module 1 — Bio & Presskit

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { useStudio } from '@/lib/store';
import { CopyButton, DownloadTextButton, LoadingState, ErrorState, ProviderBadge } from './shared';

interface BioResult {
  bio_courte?: string;
  bio_longue?: string;
  resume_pro?: string;
  tags?: string[] | string;
  raw?: string;
}

export function BioModule() {
  const { setModule, user, saveDraft, drafts, clearDraft } = useStudio();
  const draftKey = 'bio';
  const saved = drafts[draftKey] || {};

  const [nom, setNom] = useState((saved.nom as string) || '');
  const [activite, setActivite] = useState((saved.activite as string) || '');
  const [parcours, setParcours] = useState((saved.parcours as string) || '');
  const [style, setStyle] = useState((saved.style as string) || '');
  const [realisations, setRealisations] = useState((saved.realisations as string) || '');
  const [reseaux, setReseaux] = useState((saved.reseaux as string) || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BioResult | null>(null);
  const [provider, setProvider] = useState<string | undefined>();

  // Sauvegarde automatique du brouillon
  useEffect(() => {
    saveDraft(draftKey, { nom, activite, parcours, style, realisations, reseaux });
  }, [nom, activite, parcours, style, realisations, reseaux, saveDraft, draftKey]);

  const onSubmit = async () => {
    if (!nom || !activite) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/generate/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom, activite, parcours, style, realisations, reseaux,
          userId: user?.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec');
      setResult(json.data as BioResult);
      setProvider(json.provider);
      // Décrémenter le quota
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
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    clearDraft(draftKey);
    setNom(''); setActivite(''); setParcours(''); setStyle(''); setRealisations(''); setReseaux('');
    setResult(null); setError(null); setProvider(undefined);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in-up">
      <Button variant="ghost" size="sm" onClick={() => setModule('home')} className="mb-3 -ml-2 text-stone-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>

      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-orange-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Bio & Presskit</h1>
          <p className="text-stone-600 text-sm">Générez votre bio courte, bio longue pour EPK, et résumé professionnel.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* FORMULAIRE */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" /> Vos informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom / nom de scène <span className="text-red-500">*</span></Label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Thug Lite Bandit" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="activite">Activité / genre <span className="text-red-500">*</span></Label>
              <Input id="activite" value={activite} onChange={(e) => setActivite(e.target.value)} placeholder="Ex : Rappeur, designer graphique, formateur…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parcours">Parcours</Label>
              <Textarea id="parcours" value={parcours} onChange={(e) => setParcours(e.target.value)} rows={3} placeholder="D'où venez-vous, vos débuts, vos influences…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="style">Style</Label>
              <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Ex : afrotrap conscient, design minimaliste…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="realisations">Réalisations</Label>
              <Textarea id="realisations" value={realisations} onChange={(e) => setRealisations(e.target.value)} rows={3} placeholder="Singles, EPs, projets, clients, prix…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reseaux">Réseaux / liens</Label>
              <Input id="reseaux" value={reseaux} onChange={(e) => setReseaux(e.target.value)} placeholder="@instagram, facebook, youtube, spotify…" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onSubmit}
                disabled={loading || !nom || !activite}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white"
              >
                {loading ? 'Génération…' : 'Générer ma bio'}
              </Button>
              <Button variant="outline" onClick={onReset} disabled={loading}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-stone-500">
              💾 Brouillon sauvegardé automatiquement. {user ? `Quota restant : ${user.quotaMensuelRestant}` : 'Créez un compte pour sauvegarder en ligne.'}
            </p>
          </CardContent>
        </Card>

        {/* RÉSULTAT */}
        <div className="lg:sticky lg:top-20 self-start">
          {loading && <Card className="border-stone-200"><CardContent className="p-0"><LoadingState label="Rédaction de votre bio…" /></CardContent></Card>}
          {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
          {!loading && !error && !result && (
            <Card className="border-dashed border-stone-300 bg-stone-50/50">
              <CardContent className="py-12 px-6 text-center">
                <FileText className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">
                  Remplissez le formulaire et lancez la génération.<br />Votre bio apparaîtra ici.
                </p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && result && (
            <Card className="border-orange-200 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-lg">Bio générée</CardTitle>
                <ProviderBadge provider={provider} />
              </CardHeader>
              <CardContent className="space-y-5 max-h-[600px] overflow-y-auto scroll-thin pr-2">
                {result.bio_courte && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Bio courte (réseaux sociaux)</h4>
                      <CopyButton text={result.bio_courte} />
                    </div>
                    <p className="text-stone-800 leading-relaxed text-sm bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                      {result.bio_courte}
                    </p>
                  </div>
                )}
                <Separator />
                {result.bio_longue && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Bio longue (EPK / presskit)</h4>
                      <CopyButton text={result.bio_longue} />
                    </div>
                    <div className="text-stone-800 leading-relaxed text-sm whitespace-pre-line bg-white p-3 rounded-lg border border-stone-200">
                      {result.bio_longue}
                    </div>
                  </div>
                )}
                <Separator />
                {result.resume_pro && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Résumé professionnel</h4>
                      <CopyButton text={result.resume_pro} />
                    </div>
                    <p className="text-stone-800 italic text-sm bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      {result.resume_pro}
                    </p>
                  </div>
                )}
                {result.tags && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-2">Mots-clés</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(result.tags) ? result.tags : String(result.tags).split(',').map(s => s.trim()).filter(Boolean)).map((t, i) => (
                          <Badge key={i} variant="secondary" className="bg-stone-100 text-stone-700">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {result.raw && (
                  <div>
                    <h4 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-2">Réponse</h4>
                    <pre className="text-xs bg-stone-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">{result.raw}</pre>
                  </div>
                )}
                <Separator />
                <DownloadTextButton
                  text={`BIO — ${nom}\n\n=== Bio courte ===\n${result.bio_courte || ''}\n\n=== Bio longue ===\n${result.bio_longue || ''}\n\n=== Résumé pro ===\n${result.resume_pro || ''}\n\n=== Tags ===\n${Array.isArray(result.tags) ? result.tags.join(', ') : (result.tags || '')}`}
                  filename={`bio-${nom.toLowerCase().replace(/\s+/g, '-')}.txt`}
                  label="Télécharger .txt"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
