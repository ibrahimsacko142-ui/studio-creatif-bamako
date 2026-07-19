// Store Zustand — État global Studio Créatif Bamako
// Gère : utilisateur, module actif, brouillons locaux (anti-perte au refresh)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ModuleId =
  | 'home'
  | 'bio'
  | 'posts'
  | 'script'
  | 'image'
  | 'video'
  | 'calendrier'
  | 'tendances'
  | 'compte';

export interface LocalUser {
  id: string;
  nom: string;
  whatsapp?: string | null;
  email?: string | null;
  typeCreation: string;
  quotaMensuelRestant: number;
}

interface StudioState {
  // Utilisateur
  user: LocalUser | null;
  setUser: (u: LocalUser | null) => void;

  // Module courant
  activeModule: ModuleId;
  setModule: (m: ModuleId) => void;

  // Brouillons (sauvegarde locale des formulaires en cours)
  drafts: Record<string, Record<string, unknown>>;
  saveDraft: (key: string, data: Record<string, unknown>) => void;
  clearDraft: (key: string) => void;

  // Toast léger (optionnel)
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useStudio = create<StudioState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),

      activeModule: 'home',
      setModule: (m) => set({ activeModule: m }),

      drafts: {},
      saveDraft: (key, data) =>
        set((s) => ({ drafts: { ...s.drafts, [key]: data } })),
      clearDraft: (key) =>
        set((s) => {
          const next = { ...s.drafts };
          delete next[key];
          return { drafts: next };
        }),

      toast: null,
      showToast: (message, type = 'info') =>
        set({ toast: { message, type } }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'studio-creatif-bamako',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, drafts: s.drafts }),
    }
  )
);
