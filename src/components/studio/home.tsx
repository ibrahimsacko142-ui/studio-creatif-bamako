// Page d'accueil — Hero + grille des 7 modules + section cas d'usage Thug Lite Bandit

'use client';

import { useStudio, ModuleId } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  FileText,
  Share2,
  Video,
  Image as ImageIcon,
  Film,
  CalendarDays,
  TrendingUp,
  UserCircle,
  ArrowRight,
  Zap,
  ShieldCheck,
  Smartphone,
  Languages,
} from 'lucide-react';

interface ModuleCard {
  id: ModuleId;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  bg: string;
  badge?: string;
  highlight?: boolean;
}

const MODULES: ModuleCard[] = [
  {
    id: 'tendances',
    title: 'Tendances & Hooks',
    description: 'Bibliothèque de hooks, veille tendances Mali, générateur de 10 hooks, optimiseur et sons TikTok viraux.',
    icon: TrendingUp,
    accent: 'text-purple-700',
    bg: 'bg-gradient-to-br from-purple-50 to-rose-50 hover:from-purple-100 hover:to-rose-100',
    badge: 'NOUVEAU',
    highlight: true,
  },
  {
    id: 'bio',
    title: 'Bio & Presskit',
    description: 'Bio courte, bio longue pour EPK, résumé pro. Pour musiciens, designers, entrepreneurs.',
    icon: FileText,
    accent: 'text-orange-700',
    bg: 'bg-orange-50 hover:bg-orange-100',
    badge: 'Texte',
  },
  {
    id: 'posts',
    title: 'Posts réseaux sociaux',
    description: '3 à 5 variantes de posts Facebook / Instagram / TikTok avec hashtags maliens.',
    icon: Share2,
    accent: 'text-amber-700',
    bg: 'bg-amber-50 hover:bg-amber-100',
    badge: 'Texte',
  },
  {
    id: 'script',
    title: 'Scripts vidéo courts',
    description: 'Script 15s / 30s / 60s avec accroche, corps, appel à l\'action et plans suggérés.',
    icon: Video,
    accent: 'text-rose-700',
    bg: 'bg-rose-50 hover:bg-rose-100',
    badge: 'Texte',
  },
  {
    id: 'image',
    title: 'Visuels générés',
    description: 'Pochette d\'album, flyer événement, visuel post. Généré par IA Gemini.',
    icon: ImageIcon,
    accent: 'text-fuchsia-700',
    bg: 'bg-fuchsia-50 hover:bg-fuchsia-100',
    badge: 'IA Image',
  },
  {
    id: 'video',
    title: 'Clips vidéo courts',
    description: 'Teaser 5s / 10s généré par IA vidéo. Pour accroches TikTok / Reels.',
    icon: Film,
    accent: 'text-purple-700',
    bg: 'bg-purple-50 hover:bg-purple-100',
    badge: 'IA Vidéo',
  },
  {
    id: 'calendrier',
    title: 'Calendrier de contenu',
    description: 'Planning de publication sur 2 à 4 semaines, basé sur vos contenus.',
    icon: CalendarDays,
    accent: 'text-teal-700',
    bg: 'bg-teal-50 hover:bg-teal-100',
    badge: 'Stratégie',
  },
  {
    id: 'compte',
    title: 'Mon compte',
    description: 'Historique de vos générations, suivi du quota mensuel, profil créateur.',
    icon: UserCircle,
    accent: 'text-stone-700',
    bg: 'bg-stone-100 hover:bg-stone-200',
  },
];

export function HomeView() {
  const { setModule, user } = useStudio();

  return (
    <div className="animate-fade-in-up">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/40 to-stone-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-300/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Adapté au contexte malien · Français
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 leading-[1.05]">
              Votre contenu créatif,
              <br />
              <span className="text-gradient-terracotta">généré en quelques secondes.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              Une plateforme IA pensée pour les créateurs de Bamako et du Mali :
              musiciens, designers, entrepreneurs et formateurs. Remplissez un formulaire simple,
              recevez un pack de contenu prêt à l'emploi — texte, visuels, clips vidéo et calendrier.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => setModule('bio')}
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white h-12 px-6 text-base"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setModule('compte')}
                className="h-12 px-6 text-base bg-white/60"
              >
                {user ? 'Voir mon compte' : 'Créer mon profil'}
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-orange-600" /> Mobile-first
              </span>
              <span className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-orange-600" /> Français & contexte local
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Clés API sécurisées
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-orange-600" /> {user ? `${user.quotaMensuelRestant} générations offertes` : '3 générations offertes'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES GRID */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 -mt-8 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Choisissez un module
            </h2>
            <p className="text-stone-600 mt-1 text-sm sm:text-base">
              7 outils pour couvrir toute votre chaîne de contenu créatif.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setModule(m.id)}
                className={`group text-left p-5 rounded-2xl border ${m.highlight ? 'border-purple-300 shadow-md' : 'border-stone-200'} ${m.bg} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-400 relative`}
              >
                {m.highlight && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                    ✨ NOUVEAU
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${m.highlight ? 'bg-gradient-to-br from-purple-600 to-rose-500 text-white' : 'bg-white shadow-sm'} flex items-center justify-center ${m.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {m.badge && !m.highlight && (
                    <Badge variant="outline" className="text-[10px] bg-white/70">
                      {m.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-display font-semibold text-stone-900 mb-1.5">{m.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{m.description}</p>
                <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${m.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Ouvrir
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* CAS D'USAGE PILOTE */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 text-stone-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 mb-3">
                Cas d'usage pilote
              </Badge>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
                Thug Lite Bandit, premier test réel
              </h2>
              <p className="text-stone-300 leading-relaxed mb-4">
                Rappeur basé à Markala, Thug Lite Bandit sera le premier utilisateur test du Studio.
                L'objectif : valider la qualité du contenu généré avant ouverture au public.
              </p>
              <ul className="space-y-2 text-sm text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">●</span>
                  Générer sa bio artiste complète (courte + longue + résumé pro)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">●</span>
                  Produire 5 posts promo pour son prochain single / EP
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">●</span>
                  Créer un script vidéo TikTok de 30 secondes
                </li>
              </ul>
            </div>
            <div className="bg-stone-800/60 rounded-2xl p-6 border border-stone-700">
              <div className="text-xs uppercase tracking-wider text-amber-300/80 font-semibold mb-2">
                Roadmap
              </div>
              <div className="space-y-3">
                {[
                  { phase: 'Phase 1', txt: 'MVP texte — Bio + Posts', done: true },
                  { phase: 'Phase 2', txt: 'Scripts vidéo + routage multi-API', done: true },
                  { phase: 'Phase 3', txt: 'Visuels + Clips vidéo (Gemini)', done: true },
                  { phase: 'Phase 4', txt: 'Calendrier + paiement Taliopay', done: false },
                  { phase: 'Phase 5', txt: 'Compte utilisateur complet', done: false },
                ].map((r) => (
                  <div key={r.phase} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${r.done ? 'bg-green-400' : 'bg-stone-600'}`} />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-amber-300">{r.phase}</span>
                      <span className="text-sm text-stone-300 ml-2">{r.txt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
