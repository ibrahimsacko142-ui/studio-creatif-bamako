// Composants partagés — Header & Footer du Studio Créatif Bamako

'use client';

import { useStudio } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, User as UserIcon, ChevronRight, Zap, Calendar } from 'lucide-react';

export function Header() {
  const { user, setModule, activeModule } = useStudio();

  return (
    <header className="sticky top-0 z-40 bg-stone-50/85 backdrop-blur-md border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => setModule('home')}
            className="flex items-center gap-2 group"
            aria-label="Retour à l'accueil"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-stone-900 leading-none text-base">
                Studio Créatif
              </div>
              <div className="text-[10px] uppercase tracking-wider text-orange-700/80 font-semibold leading-none mt-0.5">
                Bamako · Mali
              </div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={activeModule === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setModule('home')}
              className="text-stone-700"
            >
              Accueil
            </Button>
            <Button
              variant={activeModule === 'calendrier' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setModule('calendrier')}
              className="text-stone-700"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Calendrier
            </Button>
            {user && (
              <Button
                variant={activeModule === 'compte' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setModule('compte')}
                className="text-stone-700"
              >
                Mon compte
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white text-xs font-bold">
                      {user.nom.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline font-medium text-stone-800">
                      {user.nom.split(' ')[0]}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-[10px] px-1.5 py-0 h-5"
                    >
                      <Zap className="w-3 h-3 mr-0.5" />
                      {user.quotaMensuelRestant}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col">
                      <span className="font-semibold text-stone-900">{user.nom}</span>
                      <span className="text-xs text-stone-500 capitalize">{user.typeCreation}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setModule('compte')}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Mon compte & historique
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setModule('calendrier')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendrier de contenu
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-xs text-stone-500">
                    Quota gratuit restant : <span className="font-semibold text-orange-700">{user.quotaMensuelRestant}</span> génération(s) ce mois
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={() => setModule('compte')}
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white"
              >
                Se connecter
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-100/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-display font-bold text-stone-900 mb-2">Studio Créatif Bamako</div>
            <p className="text-stone-600 leading-relaxed">
              Plateforme de génération de contenu IA pensée pour les créateurs maliens :
              musiciens, designers, entrepreneurs et formateurs.
            </p>
          </div>
          <div>
            <div className="font-semibold text-stone-900 mb-2">Modules</div>
            <ul className="space-y-1 text-stone-600">
              <li>Bio & Presskit</li>
              <li>Posts réseaux sociaux</li>
              <li>Scripts vidéo courts</li>
              <li>Visuels & clips vidéo IA</li>
              <li>Calendrier de contenu</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-stone-900 mb-2">À propos</div>
            <p className="text-stone-600 leading-relaxed">
              Un projet SK Designer Luxe / Créateur Boutique.
              Première zone pilote : Bamako et Ségou. Premier cas d'usage : Thug Lite Bandit (Markala).
            </p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-stone-200 text-xs text-stone-500 flex flex-col sm:flex-row justify-between gap-2">
          <div>© 2026 Studio Créatif Bamako — Tous droits réservés</div>
          <div>Fait avec ❤️ à Bamako · Propulsé par IA</div>
        </div>
      </div>
    </footer>
  );
}
