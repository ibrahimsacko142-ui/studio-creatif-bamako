// Module Tendances & Hooks — 5 onglets intégrés
// 1. Bibliothèque (instantané, sans IA)
// 2. Tendances Mali (Grok)
// 3. Générateur 10 hooks (GPT-5)
// 4. Hook Optimizer (GPT-5)
// 5. Sons TikTok (Grok)

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, TrendingUp, BookOpen, Sparkles, Target, Music, Flame, Clock, Hash, Lightbulb, BarChart3,
} from 'lucide-react';
import { useStudio } from '@/lib/store';
import { HOOKS_BIBLIOTHEQUE } from '@/lib/hooks-biblio';
import { CopyButton, LoadingState, ErrorState, ProviderBadge } from './shared';
import { toast } from 'sonner';

// ============ TAB 1: BIBLIOTHÈQUE ============
function BiblioTab() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const cat = HOOKS_BIBLIOTHEQUE.find((c) => c.id === selectedCat);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-50 to-amber-50/40 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-stone-900">Bibliothèque de hooks prêts à l'emploi</h3>
              <p className="text-sm text-stone-600 mt-0.5">
                Des hooks curatés par émotion et technique. Aucune IA, instantané. Remplace [sujet] par ton contenu.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {HOOKS_BIBLIOTHEQUE.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id === selectedCat ? null : c.id)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${c.couleur} ${
              selectedCat === c.id ? 'ring-2 ring-purple-400 -translate-y-0.5' : 'hover:-translate-y-0.5'
            }`}
          >
            <div className="text-2xl mb-1">{c.emoji}</div>
            <div className="font-semibold text-stone-900 text-sm">{c.label}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">{c.hooks.length} hooks</div>
          </button>
        ))}
      </div>

      {cat && (
        <Card className="animate-fade-in-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{cat.emoji}</span> {cat.label}
            </CardTitle>
            <p className="text-sm text-stone-600 mt-1">{cat.description}</p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto scroll-thin pr-2">
            {cat.hooks.map((h, i) => (
              <div key={i} className="p-3 rounded-lg border border-stone-200 bg-white hover:border-purple-300 transition-colors">
                <p className="text-stone-900 font-medium text-sm mb-2">{h.texte}</p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                    <Lightbulb className="w-3 h-3 mr-1" /> {h.technique}
                  </Badge>
                  <CopyButton text={h.texte} label="Copier" />
                </div>
                {h.exemple_sujet && (
                  <p className="text-[10px] text-stone-500 mt-2 italic">
                    💡 Exemple: remplace [sujet] par « {h.exemple_sujet} »
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ TAB 2: TENDANCES MALI ============
interface Tendance {
  sujet: string;
  categorie: string;
  intensite: string;
  angles_creatifs: string | string[];
  hashtags: string;
  duree_vie: string;
}
interface TendancesResult {
  date?: string;
  tendances?: Tendance[];
  conseil_global?: string;
  raw?: string;
}

function TendancesTab() {
  const { user } = useStudio();
  const [cible, setCible] = useState('');
  const [periode, setPeriode] = useState<'jour' | 'semaine'>('semaine');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TendancesResult | null>(null);
  const [provider, setProvider] = useState<string>();

  const onSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/generate/tendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cible, periode, userId: user?.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json.data);
      setProvider(json.provider);
      if (user) {
        try {
          await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, action: 'decrement' }) });
        } catch {}
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setLoading(false); }
  };

  const intensityColors: Record<string, string> = {
    forte: 'bg-red-100 text-red-700',
    moyenne: 'bg-amber-100 text-amber-700',
    'émergente': 'bg-teal-100 text-teal-700',
  };
  const catColors: Record<string, string> = {
    musique: 'bg-purple-100 text-purple-700',
    foot: 'bg-green-100 text-green-700',
    culture: 'bg-amber-100 text-amber-700',
    event: 'bg-blue-100 text-blue-700',
    drame: 'bg-stone-200 text-stone-700',
    succès: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50/40 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0"><TrendingUp className="w-5 h-5" /></div>
            <div>
              <h3 className="font-display font-bold text-stone-900">Tendances Mali du jour</h3>
              <p className="text-sm text-stone-600 mt-0.5">Veille des sujets brûlants à Bamako et au Mali, avec angles créatifs concrets. Propulsé par Grok (accès actualité récente).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cible-t">Ton profil créateur</Label>
              <Input id="cible-t" value={cible} onChange={(e) => setCible(e.target.value)} placeholder="Ex: rappeur, designer, entrepreneur" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="periode-t">Période</Label>
              <Select value={periode} onValueChange={(v) => setPeriode(v as 'jour' | 'semaine')}>
                <SelectTrigger id="periode-t"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jour">Tendances du jour</SelectItem>
                  <SelectItem value="semaine">Tendances de la semaine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={onSubmit} disabled={loading} className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white">
            {loading ? 'Veille en cours…' : '🔍 Lancer la veille tendances'}
          </Button>
        </CardContent>
      </Card>

      {loading && <Card><CardContent className="p-0"><LoadingState label="Scan des tendances Mali…" /></CardContent></Card>}
      {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
      {!loading && !error && result && (
        <Card className="border-amber-200 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2"><Flame className="w-5 h-5 text-orange-600" /> {result.tendances?.length || 0} tendance(s) détectée(s)</CardTitle>
            <ProviderBadge provider={provider} />
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto scroll-thin pr-2">
            {result.tendances?.map((t, i) => (
              <div key={i} className="p-4 rounded-xl border border-stone-200 bg-white">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <h4 className="font-semibold text-stone-900 flex-1 min-w-0">{i + 1}. {t.sujet}</h4>
                  <div className="flex gap-1 flex-wrap">
                    {t.categorie && <Badge variant="outline" className={`text-[10px] ${catColors[t.categorie] || 'bg-stone-100'}`}>{t.categorie}</Badge>}
                    {t.intensite && <Badge variant="outline" className={`text-[10px] ${intensityColors[t.intensite] || 'bg-stone-100'}`}>🔥 {t.intensite}</Badge>}
                    {t.duree_vie && <Badge variant="outline" className="text-[10px]"><Clock className="w-3 h-3 mr-1" />{t.duree_vie}</Badge>}
                  </div>
                </div>
                {t.angles_creatifs && (
                  <div className="mb-2">
                    <div className="text-[10px] font-semibold text-stone-500 uppercase mb-1">Angles créatifs</div>
                    <ul className="space-y-1">
                      {(Array.isArray(t.angles_creatifs) ? t.angles_creatifs : String(t.angles_creatifs).split('|').map(s => s.trim()).filter(Boolean)).map((a, j) => (
                        <li key={j} className="text-sm text-stone-700 flex gap-2">
                          <span className="text-amber-600">→</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {t.hashtags && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <Hash className="w-3 h-3 text-stone-400" />
                    {String(t.hashtags).split(',').map((h, k) => (
                      <span key={k} className="text-xs text-amber-700 font-medium">{h.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end gap-2">
                  <CopyButton text={`${t.sujet}\n\nAngles:\n${Array.isArray(t.angles_creatifs) ? t.angles_creatifs.join('\n') : t.angles_creatifs}\n\nHashtags: ${t.hashtags}`} label="Copier cette tendance" />
                </div>
              </div>
            ))}
            {result.conseil_global && (
              <>
                <Separator />
                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                  <div className="text-xs font-semibold text-amber-800 uppercase mb-1 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Conseil stratégique</div>
                  <p className="text-sm text-stone-700">{result.conseil_global}</p>
                </div>
              </>
            )}
            {result.raw && <pre className="text-xs bg-stone-100 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto">{result.raw}</pre>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ TAB 3: GÉNÉRATEUR 10 HOOKS ============
interface Hook {
  texte: string;
  score_viral: string | number;
  technique: string;
  raison: string;
  plateforme_ideale?: string;
}
interface HooksGenResult {
  hooks?: Hook[];
  raw?: string;
}

function HooksGenTab() {
  const { user } = useStudio();
  const [sujet, setSujet] = useState('');
  const [cible, setCible] = useState('');
  const [style, setStyle] = useState('');
  const [plateforme, setPlateforme] = useState('tous');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HooksGenResult | null>(null);
  const [provider, setProvider] = useState<string>();

  const onSubmit = async () => {
    if (!sujet) { toast.error('Le sujet est requis'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/generate/hooks-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sujet, cible, style, plateforme, userId: user?.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json.data);
      setProvider(json.provider);
      if (user) {
        try {
          await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, action: 'decrement' }) });
        } catch {}
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setLoading(false); }
  };

  const sortedHooks = result?.hooks?.slice().sort((a, b) => {
    const sa = parseFloat(String(a.score_viral)) || 0;
    const sb = parseFloat(String(b.score_viral)) || 0;
    return sb - sa;
  }) || [];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-rose-50 to-purple-50/40 border-rose-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h3 className="font-display font-bold text-stone-900">Générateur de 10 hooks personnalisés</h3>
              <p className="text-sm text-stone-600 mt-0.5">Donne ton sujet, reçois 10 hooks classés par score viral. Chaque hook explique pourquoi il marche et sur quelle plateforme le poster.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sujet-h">Sujet / contenu à accrocher <span className="text-red-500">*</span></Label>
            <Textarea id="sujet-h" value={sujet} onChange={(e) => setSujet(e.target.value)} rows={2} placeholder="Ex: Sortie de mon single 'Bamako Nuit' le 15 août" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cible-h">Cible</Label>
              <Input id="cible-h" value={cible} onChange={(e) => setCible(e.target.value)} placeholder="jeunes 18-30 Bamako" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="style-h">Ton style</Label>
              <Input id="style-h" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="mystérieux, fière" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-h">Plateforme</Label>
              <Select value={plateforme} onValueChange={setPlateforme}>
                <SelectTrigger id="pf-h"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Reels">Instagram Reels</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={onSubmit} disabled={loading || !sujet} className="w-full bg-gradient-to-r from-rose-600 to-purple-500 hover:from-rose-700 hover:to-purple-600 text-white">
            {loading ? 'Génération des 10 hooks…' : '✨ Générer 10 hooks'}
          </Button>
        </CardContent>
      </Card>

      {loading && <Card><CardContent className="p-0"><LoadingState label="Création de 10 hooks percutants…" /></CardContent></Card>}
      {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
      {!loading && !error && result && (
        <Card className="border-rose-200 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-rose-600" /> Top {result.hooks?.length || 0} hooks (par score viral)</CardTitle>
            <ProviderBadge provider={provider} />
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto scroll-thin pr-2">
            {sortedHooks.map((h, i) => {
              const score = parseFloat(String(h.score_viral)) || 0;
              const scoreColor = score >= 9 ? 'bg-green-600' : score >= 7 ? 'bg-amber-500' : 'bg-stone-400';
              return (
                <div key={i} className="p-3 rounded-xl border border-stone-200 bg-white hover:border-rose-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-12 h-12 rounded-lg ${scoreColor} text-white flex flex-col items-center justify-center`}>
                      <span className="text-lg font-bold leading-none">{h.score_viral}</span>
                      <span className="text-[8px] uppercase tracking-wider mt-0.5">/10</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 mb-1.5">#{i + 1} · {h.texte}</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">{h.technique}</Badge>
                        {h.plateforme_ideale && <Badge variant="outline" className="text-[10px]">{h.plateforme_ideale}</Badge>}
                      </div>
                      <p className="text-xs text-stone-600 italic">💡 {h.raison}</p>
                    </div>
                    <CopyButton text={h.texte} label="" />
                  </div>
                </div>
              );
            })}
            {result.raw && <pre className="text-xs bg-stone-100 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto">{result.raw}</pre>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ TAB 4: HOOK OPTIMIZER ============
interface OptimizedHook {
  texte: string;
  technique: string;
  score_viral: string | number;
  raison: string;
}
interface HookOptimizerResult {
  diagnostic_original?: string;
  versions_optimisees?: OptimizedHook[];
  raw?: string;
}

function HookOptimizerTab() {
  const { user } = useStudio();
  const [hookOriginal, setHookOriginal] = useState('');
  const [cible, setCible] = useState('');
  const [plateforme, setPlateforme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HookOptimizerResult | null>(null);
  const [provider, setProvider] = useState<string>();

  const onSubmit = async () => {
    if (!hookOriginal) { toast.error('Colle ton hook original'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/generate/hook-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hook_original: hookOriginal, cible, plateforme, userId: user?.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json.data);
      setProvider(json.provider);
      if (user) {
        try {
          await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, action: 'decrement' }) });
        } catch {}
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setLoading(false); }
  };

  const sortedVersions = result?.versions_optimisees?.slice().sort((a, b) => {
    const sa = parseFloat(String(a.score_viral)) || 0;
    const sb = parseFloat(String(b.score_viral)) || 0;
    return sb - sa;
  }) || [];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-50 to-teal-50/40 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0"><Target className="w-5 h-5" /></div>
            <div>
              <h3 className="font-display font-bold text-stone-900">Hook Optimizer</h3>
              <p className="text-sm text-stone-600 mt-0.5">Tu as un post qui marche moyen ? Colle-le, l'IA le réécrit en 5 versions plus percutantes sans changer le sens.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="hook-o">Ton hook / post actuel <span className="text-red-500">*</span></Label>
            <Textarea id="hook-o" value={hookOriginal} onChange={(e) => setHookOriginal(e.target.value)} rows={3} placeholder="Ex: Nouveau single Bamako Nuit bientôt disponible 🎵" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cible-o">Cible</Label>
              <Input id="cible-o" value={cible} onChange={(e) => setCible(e.target.value)} placeholder="jeunes Bamako" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-o">Plateforme</Label>
              <Input id="pf-o" value={plateforme} onChange={(e) => setPlateforme(e.target.value)} placeholder="TikTok / Facebook" />
            </div>
          </div>
          <Button onClick={onSubmit} disabled={loading || !hookOriginal} className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white">
            {loading ? 'Optimisation en cours…' : '🎯 Optimiser mon hook'}
          </Button>
        </CardContent>
      </Card>

      {loading && <Card><CardContent className="p-0"><LoadingState label="Analyse et réécriture…" /></CardContent></Card>}
      {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
      {!loading && !error && result && (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-lg">5 versions optimisées</CardTitle>
            <ProviderBadge provider={provider} />
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto scroll-thin pr-2">
            <div className="p-3 rounded-lg bg-stone-100 border border-stone-200">
              <div className="text-[10px] font-semibold text-stone-500 uppercase mb-1">Diagnostic du hook original</div>
              <p className="text-sm text-stone-700">{result.diagnostic_original}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-[10px] font-semibold text-blue-700 uppercase mb-1">Hook original</div>
              <p className="text-sm text-stone-800 italic">« {hookOriginal} »</p>
            </div>
            <Separator />
            <div className="space-y-3">
              {sortedVersions.map((h, i) => {
                const score = parseFloat(String(h.score_viral)) || 0;
                const scoreColor = score >= 9 ? 'bg-green-600' : score >= 7 ? 'bg-amber-500' : 'bg-stone-400';
                return (
                  <div key={i} className="p-3 rounded-xl border border-stone-200 bg-white">
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-12 h-12 rounded-lg ${scoreColor} text-white flex flex-col items-center justify-center`}>
                        <span className="text-lg font-bold leading-none">{h.score_viral}</span>
                        <span className="text-[8px] uppercase tracking-wider mt-0.5">/10</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 mb-1.5">Version {i + 1} · « {h.texte} »</p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">{h.technique}</Badge>
                        </div>
                        <p className="text-xs text-stone-600 italic">💡 {h.raison}</p>
                      </div>
                      <CopyButton text={h.texte} label="" />
                    </div>
                  </div>
                );
              })}
            </div>
            {result.raw && <pre className="text-xs bg-stone-100 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto">{result.raw}</pre>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ TAB 5: SONS TIKTOK ============
interface SonTikTok {
  nom: string;
  artiste: string;
  genre: string;
  duree_trend: string;
  nb_videos_estime: string;
  type_contenu: string;
  idee_utilisation: string;
  hashtags: string;
}
interface SonsResult {
  sons?: SonTikTok[];
  conseil_son?: string;
  raw?: string;
}

function SonsTab() {
  const { user } = useStudio();
  const [genre, setGenre] = useState('tous');
  const [typeContenu, setTypeContenu] = useState('tous');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SonsResult | null>(null);
  const [provider, setProvider] = useState<string>();

  const onSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/generate/sons-tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, type_contenu: typeContenu, userId: user?.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json.data);
      setProvider(json.provider);
      if (user) {
        try {
          await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, action: 'decrement' }) });
        } catch {}
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setLoading(false); }
  };

  const genreColors: Record<string, string> = {
    afrobeats: 'bg-orange-100 text-orange-700',
    amapiano: 'bg-purple-100 text-purple-700',
    'rap mali': 'bg-stone-200 text-stone-700',
    'coupé-décalé': 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-fuchsia-50 to-purple-50/40 border-fuchsia-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center shrink-0"><Music className="w-5 h-5" /></div>
            <div>
              <h3 className="font-display font-bold text-stone-900">Sons TikTok viraux</h3>
              <p className="text-sm text-stone-600 mt-0.5">Top 6 sons TikTok tendance pour le marché ouest-africain. Pour chaque son : idée concrète d'utilisation, type de contenu, hashtags.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="genre-s">Genre préféré</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id="genre-s"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous genres</SelectItem>
                  <SelectItem value="afrobeats">Afrobeats</SelectItem>
                  <SelectItem value="amapiano">Amapiano</SelectItem>
                  <SelectItem value="rap mali">Rap mali</SelectItem>
                  <SelectItem value="coupé-décalé">Coupé-décalé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tc-s">Type de contenu</Label>
              <Select value={typeContenu} onValueChange={setTypeContenu}>
                <SelectTrigger id="tc-s"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous types</SelectItem>
                  <SelectItem value="lip-sync">Lip-sync</SelectItem>
                  <SelectItem value="dance">Dance</SelectItem>
                  <SelectItem value="freestyle">Freestyle</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                  <SelectItem value="transition">Transition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={onSubmit} disabled={loading} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:from-fuchsia-700 hover:to-purple-600 text-white">
            {loading ? 'Veille sons en cours…' : '🎵 Lancer la veille sons TikTok'}
          </Button>
        </CardContent>
      </Card>

      {loading && <Card><CardContent className="p-0"><LoadingState label="Scan des sons viraux TikTok…" /></CardContent></Card>}
      {!loading && error && <Card className="border-red-200"><CardContent className="p-0"><ErrorState message={error} onRetry={onSubmit} /></CardContent></Card>}
      {!loading && !error && result && (
        <Card className="border-fuchsia-200 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2"><Music className="w-5 h-5 text-fuchsia-600" /> {result.sons?.length || 0} sons tendance</CardTitle>
            <ProviderBadge provider={provider} />
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto scroll-thin pr-2">
            {result.sons?.map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-stone-200 bg-white">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-stone-900">#{i + 1} · {s.nom}</h4>
                    <p className="text-xs text-stone-500">par {s.artiste}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {s.genre && <Badge variant="outline" className={`text-[10px] ${genreColors[s.genre] || 'bg-stone-100'}`}>{s.genre}</Badge>}
                    {s.duree_trend && <Badge variant="outline" className="text-[10px]"><Clock className="w-3 h-3 mr-1" />{s.duree_trend}</Badge>}
                    {s.type_contenu && <Badge variant="outline" className="text-[10px]">{s.type_contenu}</Badge>}
                  </div>
                </div>
                {s.nb_videos_estime && (
                  <div className="text-xs text-stone-600 mb-2 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> ≈ {s.nb_videos_estime} vidéos TikTok
                  </div>
                )}
                {s.idee_utilisation && (
                  <div className="mb-2 p-2 bg-fuchsia-50/60 rounded border border-fuchsia-100">
                    <div className="text-[10px] font-semibold text-fuchsia-700 uppercase mb-1">💡 Idée d'utilisation</div>
                    <p className="text-sm text-stone-700">{s.idee_utilisation}</p>
                  </div>
                )}
                {s.hashtags && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <Hash className="w-3 h-3 text-stone-400" />
                    {String(s.hashtags).split(',').map((h, k) => (
                      <span key={k} className="text-xs text-fuchsia-700 font-medium">{h.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end">
                  <CopyButton text={`${s.nom} — ${s.artiste}\nGenre: ${s.genre}\nTrend: ${s.duree_trend}\n\nIdée: ${s.idee_utilisation}\n\nHashtags: ${s.hashtags}`} label="Copier" />
                </div>
              </div>
            ))}
            {result.conseil_son && (
              <>
                <Separator />
                <div className="bg-fuchsia-50/60 p-3 rounded-lg border border-fuchsia-100">
                  <div className="text-xs font-semibold text-fuchsia-800 uppercase mb-1 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Conseil de la semaine</div>
                  <p className="text-sm text-stone-700">{result.conseil_son}</p>
                </div>
              </>
            )}
            {result.raw && <pre className="text-xs bg-stone-100 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto">{result.raw}</pre>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ COMPOSANT PRINCIPAL ============
export function TendancesModule() {
  const { setModule } = useStudio();
  const [activeTab, setActiveTab] = useState('biblio');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in-up">
      <Button variant="ghost" size="sm" onClick={() => setModule('home')} className="mb-3 -ml-2 text-stone-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-rose-500 to-amber-500 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Tendances & Hooks</h1>
          <p className="text-stone-600 text-sm">Tout pour rendre ton contenu viral : bibliothèque, veille Mali, générateur, optimiseur et sons TikTok.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full mb-4 h-auto">
          <TabsTrigger value="biblio" className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] sm:text-xs">
            <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">Bibliothèque</span><span className="sm:hidden">Hooks</span>
          </TabsTrigger>
          <TabsTrigger value="tendances" className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] sm:text-xs">
            <TrendingUp className="w-4 h-4" /> <span className="hidden sm:inline">Tendances</span><span className="sm:hidden">Trend</span>
          </TabsTrigger>
          <TabsTrigger value="gen" className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] sm:text-xs">
            <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Générateur</span><span className="sm:hidden">Gen</span>
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] sm:text-xs">
            <Target className="w-4 h-4" /> <span className="hidden sm:inline">Optimizer</span><span className="sm:hidden">Opti</span>
          </TabsTrigger>
          <TabsTrigger value="sons" className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] sm:text-xs">
            <Music className="w-4 h-4" /> <span className="hidden sm:inline">Sons TikTok</span><span className="sm:hidden">Sons</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="biblio"><BiblioTab /></TabsContent>
        <TabsContent value="tendances"><TendancesTab /></TabsContent>
        <TabsContent value="gen"><HooksGenTab /></TabsContent>
        <TabsContent value="optimizer"><HookOptimizerTab /></TabsContent>
        <TabsContent value="sons"><SonsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
