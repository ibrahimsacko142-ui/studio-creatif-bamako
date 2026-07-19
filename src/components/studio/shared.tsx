// Composants utilitaires partagés

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Download, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function CopyButton({ text, label = 'Copier' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copié dans le presse-papier');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Échec de la copie');
    }
  }, [text]);
  return (
    <Button size="sm" variant="outline" onClick={onCopy} className="gap-1.5">
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      {label}
    </Button>
  );
}

export function DownloadTextButton({
  text,
  filename,
  label = 'Télécharger',
}: {
  text: string;
  filename: string;
  label?: string;
}) {
  const onDownload = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fichier téléchargé');
  }, [text, filename]);
  return (
    <Button size="sm" variant="outline" onClick={onDownload} className="gap-1.5">
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );
}

export function LoadingState({ label = 'Génération en cours...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-stone-900">{label}</div>
        <div className="text-sm text-stone-500 mt-1">
          L'IA rédige votre contenu adapté au contexte malien…
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 px-4">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-red-600" />
      </div>
      <div className="text-center max-w-md">
        <div className="font-semibold text-stone-900 mb-1">Une erreur est survenue</div>
        <div className="text-sm text-stone-600">{message}</div>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Réessayer
        </Button>
      )}
    </div>
  );
}

export function ProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;
  const labels: Record<string, string> = {
    'gpt-5': 'GPT-5',
    'grok': 'Grok',
    'kimi': 'Kimi',
    'gemini-imagen': 'Gemini · Imagen',
    'gemini-veo': 'Gemini · Veo',
  };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
      ⚡ {labels[provider] || provider}
    </span>
  );
}
