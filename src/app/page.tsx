// Studio Créatif Bamako — Page principale
// SPA mobile-first avec routing interne par état Zustand

'use client';

import { useStudio } from '@/lib/store';
import { Header, Footer } from '@/components/studio/layout';
import { HomeView } from '@/components/studio/home';
import { BioModule } from '@/components/studio/module-bio';
import { PostsModule } from '@/components/studio/module-posts';
import { ScriptModule } from '@/components/studio/module-script';
import { ImageModule } from '@/components/studio/module-image';
import { VideoModule } from '@/components/studio/module-video';
import { CalendrierModule } from '@/components/studio/module-calendrier';
import { TendancesModule } from '@/components/studio/module-tendances';
import { CompteModule } from '@/components/studio/module-compte';
import { useEffect } from 'react';

export default function Home() {
  const { activeModule } = useStudio();

  // Scroll to top on module change
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeModule]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1">
        {activeModule === 'home' && <HomeView />}
        {activeModule === 'bio' && <BioModule />}
        {activeModule === 'posts' && <PostsModule />}
        {activeModule === 'script' && <ScriptModule />}
        {activeModule === 'image' && <ImageModule />}
        {activeModule === 'video' && <VideoModule />}
        {activeModule === 'calendrier' && <CalendrierModule />}
        {activeModule === 'tendances' && <TendancesModule />}
        {activeModule === 'compte' && <CompteModule />}
      </main>
      <Footer />
    </div>
  );
}
