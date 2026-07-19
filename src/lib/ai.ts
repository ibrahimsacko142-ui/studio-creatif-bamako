// Lib — Utilitaires IA Studio Créatif Bamako
// Toutes les requêtes IA passent par ici (jamais exposées côté client)
// Compatible Vercel : lit les variables d'environnement ZAI_API_KEY et ZAI_BASE_URL

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

export type AIProvider = 'gpt-5' | 'grok' | 'kimi' | 'gemini-imagen' | 'gemini-veo';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (zaiInstance) return zaiInstance;

  // Sur Vercel (production), utiliser les variables d'environnement
  // Le SDK ZAI cherche un fichier .z-ai-config, on le crée temporairement si besoin
  if (process.env.ZAI_API_KEY && !fs.existsSync('.z-ai-config')) {
    const config = {
      baseUrl: process.env.ZAI_BASE_URL || 'https://api.z.ai/api/v1',
      apiKey: process.env.ZAI_API_KEY,
      chatId: process.env.ZAI_CHAT_ID || 'studio-creatif-bamako',
      userId: process.env.ZAI_USER_ID || 'production',
    };
    try {
      fs.writeFileSync('.z-ai-config', JSON.stringify(config, null, 2));
    } catch (e) {
      // En lecture seule (Vercel build), on écrit dans /tmp
      const tmpPath = path.join('/tmp', '.z-ai-config');
      fs.writeFileSync(tmpPath, JSON.stringify(config, null, 2));
      process.chdir('/tmp');
    }
  }

  zaiInstance = await ZAI.create();
  return zaiInstance;
}

/**
 * Génère du texte via LLM avec système de fallback.
 * Primaire: GPT-5 (qualité rédactionnelle)
 * Secondaire: Grok (ton actuel, percutant)
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; provider?: AIProvider }
): Promise<{ content: string; provider: AIProvider }> {
  const temperature = options?.temperature ?? 0.8;
  const zai = await getZAI();

  // Ordre de fallback : GPT-5 → Grok → Kimi
  const providers: AIProvider[] = options?.provider
    ? [options.provider]
    : ['gpt-5', 'grok', 'kimi'];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        thinking: { type: 'disabled' },
        temperature,
        // @ts-expect-error — provider hint transmis au routeur interne
        model: provider,
      });

      const content = completion.choices[0]?.message?.content;
      if (content && content.trim().length > 0) {
        return { content: content.trim(), provider };
      }
      throw new Error(`Réponse vide du provider ${provider}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI fallback] ${provider} a échoué: ${msg}`);
      lastError = err instanceof Error ? err : new Error(msg);
      // On tente le provider suivant
    }
  }

  throw new Error(
    `Tous les providers IA ont échoué. Dernière erreur: ${lastError?.message ?? 'inconnue'}`
  );
}

/**
 * Génère une image via Gemini (Imagen).
 */
export async function generateImage(
  prompt: string,
  size: '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440' = '1024x1024'
): Promise<{ base64: string; provider: AIProvider }> {
  const zai = await getZAI();
  try {
    const response = await zai.images.generations.create({
      prompt,
      size,
    });
    const base64 = response.data[0]?.base64;
    if (!base64) throw new Error('Image vide renvoyée par Gemini');
    return { base64, provider: 'gemini-imagen' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Échec génération visuel: ${msg}`);
  }
}

/**
 * Génère un clip vidéo court via Gemini (Veo). Tâche asynchrone.
 */
export async function generateVideo(
  prompt: string,
  opts?: { duration?: 5 | 10; size?: string }
): Promise<{ videoUrl: string; provider: AIProvider }> {
  const zai = await getZAI();
  const duration = opts?.duration ?? 5;
  const size = opts?.size ?? '1280x720';

  try {
    const task = await zai.video.generations.create({
      prompt,
      quality: 'speed',
      with_audio: false,
      size,
      fps: 30,
      duration,
    });

    // Polling asynchrone (max 5 minutes)
    const maxPolls = 60;
    const pollInterval = 5000;
    let result = await zai.async.result.query(task.id);

    for (let i = 0; i < maxPolls && result.task_status === 'PROCESSING'; i++) {
      await new Promise((r) => setTimeout(r, pollInterval));
      result = await zai.async.result.query(task.id);
    }

    if (result.task_status === 'SUCCESS') {
      const videoUrl =
        result.video_result?.[0]?.url ||
        // @ts-expect-error - plusieurs formes possibles
        result.video_url ||
        // @ts-expect-error
        result.url ||
        // @ts-expect-error
        result.video;
      if (!videoUrl) throw new Error('Vidéo générée mais URL introuvable');
      return { videoUrl, provider: 'gemini-veo' };
    }
    throw new Error(`Tâche vidéo terminée avec statut: ${result.task_status}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Échec génération clip vidéo: ${msg}`);
  }
}
