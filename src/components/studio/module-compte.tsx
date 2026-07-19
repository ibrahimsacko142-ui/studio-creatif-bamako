// Module 7 — Gestion de compte (inscription locale MVP, historique, quota)

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, UserCircle, Sparkles, LogOut, History, Zap, Clock, FileText, Share2, Video, Image as ImageIcon, Film, CalendarDays,
} from 'lucide-react';
import { useStudio } from '@/lib/store';
import { ProviderBadge } from './shared';
import { toast } from 'sonner';

interface HistoryItem {
  id: string;
  type: string;
  titre: string | null;
  texteGenere: string | null;
  base64Image: string | null;
  videoUrl: string | null;
  apiUtilisee: string | null;
  dateCreation: string;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  bio: FileText,
  post: Share2,
  script: Video,
  image: ImageIcon,
  video: Film,
  calendrier: CalendarDays,
};

const TYPE_LABEL: Record<string, string> = {
  bio: 'Bio & Presskit',
  post: 'Posts réseaux sociaux',
  script: 'Script vidéo',
  image: 'Visuel généré',
  video: 'Clip vidéo',
  calendrier: 'Calendrier',
};

export function CompteModule() {
  const { setModule, user, setUser } = useStudio();
  const [nom, setNom] = useState(user?.nom || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [email, setEmail] = useState(user?.email || '');
  const [typeCreation, setTypeCreation] = useState(user?.typeCreation || 'entrepreneur');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user) {
      setNom(user.nom);
      setWhatsapp(user.whatsapp || '');
      setEmail(user.email || '');
      setTypeCreation(user.typeCreation);
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/user?userId=${user.id}`);
      const json = await res.json();
      if (json.ok) {
        setHistory(json.user.contenusGeneres);
        // Met à jour le quota local si différent
        if (json.user.quotaMensuelRestant !== user.quotaMensuelRestant) {
          setUser({ ...user, quotaMensuelRestant: json.user.quotaMensuelRestant });
        }
      }
    } catch (e) {
      console.warn('historique échoué', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const onSignup = async () => {
    if (!nom) {
      toast.error('Le nom est requis');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, whatsapp, email, typeCreation }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setUser(json.user);
      toast.success(`Bienvenue ${json.user.nom} !`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Échec');
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    setUser(null);
    setHistory([]);
    setNom(''); setWhatsapp(''); setEmail(''); setTypeCreation('entrepreneur');
    toast.info('Déconnecté');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in-up">
      <Button variant="ghost" size="sm" onClick={() => setModule('home')} className="mb-3 -ml-2 text-stone-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-stone-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Mon compte</h1>
          <p className="text-stone-600 text-sm">Profil, quota mensuel et historique de vos générations.</p>
        </div>
      </div>

      {!user ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" /> Créer mon profil créateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-stone-600">
              Pour tester gratuitement (3 générations), créez votre profil. Aucune authentification complexe pour le MVP — votre profil est stocké localement.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nom-c">Nom / nom de scène <span className="text-red-500">*</span></Label>
                <Input id="nom-c" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Ibrahim Sacko" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type-c">Type de créateur</Label>
                <Select value={typeCreation} onValueChange={setTypeCreation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="musicien">Musicien / artiste</SelectItem>
                    <SelectItem value="designer">Designer / freelance</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="formateur">Formateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wa-c">Numéro WhatsApp</Label>
                <Input id="wa-c" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+223 7X XX XX XX" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="em-c">Email (optionnel)</Label>
                <Input id="em-c" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
              </div>
            </div>
            <Button onClick={onSignup} disabled={loading || !nom} className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white">
              {loading ? 'Création…' : 'Créer mon profil'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Profil résumé */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/30">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                  {user.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-bold text-stone-900">{user.nom}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize bg-white/70">{user.typeCreation}</Badge>
                    {user.whatsapp && <span className="text-xs text-stone-600">📱 {user.whatsapp}</span>}
                    {user.email && <span className="text-xs text-stone-600">✉️ {user.email}</span>}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-orange-700">{user.quotaMensuelRestant}</span>
                      <span className="text-stone-500">génération(s) restante(s) ce mois</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-1" /> Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quota bar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quota mensuel (plan gratuit)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
                  style={{ width: `${Math.min(100, (user.quotaMensuelRestant / 3) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">
                {user.quotaMensuelRestant > 0
                  ? `Il vous reste ${user.quotaMensuelRestant} génération(s) gratuite(s) ce mois.`
                  : 'Quota épuisé ce mois. Passez au plan payant pour des générations illimitées.'}
              </p>
            </CardContent>
          </Card>

          {/* Historique */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-stone-600" />
                Historique de vos générations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-sm text-stone-500 py-4 text-center">Chargement…</div>
              ) : history.length === 0 ? (
                <div className="text-sm text-stone-500 py-8 text-center">
                  Aucune génération pour le moment.<br />
                  Commencez par créer une bio ou des posts !
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto scroll-thin pr-1">
                  {history.map((h) => {
                    const Icon = TYPE_ICON[h.type] || FileText;
                    return (
                      <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-stone-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm text-stone-900 truncate">{h.titre || TYPE_LABEL[h.type] || h.type}</span>
                            <ProviderBadge provider={h.apiUtilisee || undefined} />
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(h.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {(h.base64Image || h.videoUrl) && (
                            <div className="mt-2">
                              {h.base64Image && (
                                <img src={h.base64Image} alt="" className="w-20 h-20 object-cover rounded border border-stone-200" />
                              )}
                              {h.videoUrl && (
                                <video src={h.videoUrl} className="w-20 h-20 object-cover rounded border border-stone-200" />
                              )}
                            </div>
                          )}
                          {h.texteGenere && (
                            <p className="text-xs text-stone-600 mt-1 line-clamp-2">{h.texteGenere.slice(0, 120)}…</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plans */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="text-base">Passer au plan payant</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-stone-700">
              <p className="mb-3">
                Générations illimitées, accès au calendrier avancé, export PDF/Word, support prioritaire.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-3 border border-stone-200">
                  <div className="font-semibold text-stone-900">Abonnement mensuel</div>
                  <div className="text-xs text-stone-600 mt-1">Paiement Taliopay · illimité</div>
                </div>
                <div className="rounded-lg bg-white p-3 border border-stone-200">
                  <div className="font-semibold text-stone-900">Pack à l'unité</div>
                  <div className="text-xs text-stone-600 mt-1">Bio + 5 posts + 1 script — 2000–5000 FCFA via WhatsApp</div>
                </div>
              </div>
              <Separator className="my-3" />
              <p className="text-xs text-stone-500">
                Pour le MVP, la coordination se fait via WhatsApp. L'intégration Taliopay automatisée arrive en Phase 4.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
