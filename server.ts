/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Express } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// Shared Gemini Client (Server-side only)
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function createExpressApp(): Express {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Diagnostic request logger for all /api calls
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[API LOG] ${req.method} ${req.originalUrl} -> HTTP ${res.statusCode} (${res.get('Content-Type') || 'no-type'}) in ${Date.now() - start}ms`);
    });
    next();
  });

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Config & API status
  app.get('/api/config', (req, res) => {
    res.json({
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasVideoKey: !!process.env.VIDEO_API_KEY,
      hasImageKey: !!process.env.IMAGE_API_KEY,
      supportedVideoProviders: ['Veo 3.1', 'Runway Gen-3', 'Luma Dream Machine', 'Kling AI', 'Fal.ai', 'CLIPE AI Demo Simulator'],
    });
  });

  // Director: Analyze Music & Emotion
  app.post('/api/director/analyze', async (req, res) => {
    try {
      const { name, artist, lyrics, hasLyrics, songMeaning, emotionalIntent, visualStyles, alfineteNoMapa, duration } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          analysis: null,
          message: 'Gemini key not configured on server',
        });
      }

      const prompt = `Você é um Diretor Cinematográfico de Videoclipes premiado internacionalmente.
Analise a seguinte música e estruture a linha do tempo emocional e a curva de energia para a concepção do videoclipe:

- Nome da Música: ${name || 'Sem título'}
- Artista: ${artist || 'Artista Independente'}
- Duração: ${duration || 40} segundos
- Gênero / Estilos Visuais Desejados: ${(visualStyles || []).join(', ')}
- O que a música significa para o autor: ${songMeaning || 'Não informado'}
- Sentimento que quer despertar no público: ${emotionalIntent || 'Impacto emocional'}
- ALFINETE NO MAPA (Norte criativo definitivo do projeto): ${alfineteNoMapa || 'Videoclipe memorável'}
- Letra da Música:
${hasLyrics && lyrics ? lyrics : 'Música instrumental ou sem letra fornecida. Analise o fluxo sonoro emocional.'}

Retorne exclusivamente um JSON no seguinte formato:
{
  "duration": number,
  "bpm": number,
  "detectedGenre": string,
  "overallMood": string,
  "energyCurve": number[],
  "emotionalTimeline": [
    { "stage": "INTRO" | "CONSTRUÇÃO" | "TENSÃO" | "REFRÃO" | "CLÍMAX" | "DESFECHO", "timeRange": string, "description": string }
  ],
  "keyHitMoments": number[],
  "sections": [
    { "name": string, "startTime": number, "endTime": number, "energyLevel": "low"|"building"|"high"|"peak"|"calm", "suggestedPacing": "lento"|"moderado"|"rápido"|"dinâmico", "lyricSnippet": string }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json({ analysis: parsed });
    } catch (err: unknown) {
      console.error('Error in /api/director/analyze:', err);
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Erro ao analisar música com o Diretor IA: ${msg}` });
    }
  });

  // Director: Generate Master Concept ("SEU CLIPE NASCEU AQUI")
  app.post('/api/director/concept', async (req, res) => {
    try {
      const { project, analysis } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          concept: null,
          visualBible: null,
          message: 'Gemini key not configured',
        });
      }

      const prompt = `Você é o Diretor Criativo e Roteirista do CLIPE AI.
Crie o conceito cinematográfico profundo ("SEU CLIPE NASCEU AQUI") e a Bíblia Visual do videoclipe.

Dados do Projeto:
- Música: ${project.name} (${project.artist})
- Estilos Visuais: ${(project.visualStyles || []).join(', ')}
- Referência Visual do Usuário: ${project.visualReference || 'Nenhuma'}
- Cores Dominantes: ${(project.dominantColors || []).join(', ')}
- Universo / Inspiração: ${project.universeInspiration || 'Não informado'}
- ALFINETE NO MAPA (Norte criativo): ${project.alfineteNoMapa}
- Análise Musical: ${JSON.stringify(analysis || {})}
- Personagem Principal: ${JSON.stringify(project.masterCharacter || project.hasMainCharacter)}

IMPORTANTE:
Não crie ideias clichês ou literais. Use metáforas visuais poderosas, conexões inesperadas, e transforme a emoção da música em cinema puro.

Retorne estritamente um JSON:
{
  "concept": {
    "title": string,
    "logline": string,
    "story": string,
    "mainEmotion": string,
    "secondaryEmotions": string[],
    "palette": [{ "name": string, "hex": string }],
    "aesthetic": string,
    "characterSummary": string,
    "settingsSummary": string[],
    "visualSymbols": [{ "symbol": string, "meaning": string }],
    "peakImpactMoment": string,
    "ending": string,
    "alfineteAlignment": string
  },
  "visualBible": {
    "character": string,
    "setting": string,
    "outfit": string,
    "palette": string[],
    "lens": string,
    "lighting": string,
    "style": string,
    "proportion": "16:9" | "9:16" | "4:5" | "1:1",
    "texture": string,
    "atmosphere": string
  },
  "masterCharacter": {
    "id": string,
    "name": string,
    "age": string,
    "appearance": string,
    "outfit": string,
    "personality": string,
    "keyFeatures": string,
    "face": string,
    "hair": string,
    "eyes": string,
    "skinTone": string,
    "bodyType": string,
    "accessories": string
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: unknown) {
      console.error('Error in /api/director/concept:', err);
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Erro ao gerar conceito com o Diretor IA: ${msg}` });
    }
  });

  // Director: Generate Storyboard
  app.post('/api/director/storyboard', async (req, res) => {
    try {
      const { project, concept, visualBible, analysis } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({ scenes: null });
      }

      const prompt = `Você é o Diretor de Fotografia e Editor do CLIPE AI.
Gere o Storyboard completo com 4 a 6 cenas cinematográficas sincronizadas com a música.

Contexto do Projeto:
- Música: ${project.name} (${project.artist})
- Duração total: ${analysis?.duration || 40}s
- Conceito: ${concept?.title} (${concept?.logline})
- Bíblia Visual: ${JSON.stringify(visualBible || {})}
- Alfinete no Mapa: ${project.alfineteNoMapa}
- Seções Musicais: ${JSON.stringify(analysis?.sections || [])}

Cada cena DEVE ter:
- order (1, 2, 3...)
- startTime e endTime (cobrindo a duração total da música sem buracos)
- duration
- musicSection (ex: "Intro (0:00 - 0:08)", "Refrão (0:22 - 0:34)")
- lyricsSnippet
- emotionalGoal
- description
- visualSubject
- characterAction
- setting
- cameraMovement (ex: "Travelling lento", "Dolly in com lente anamórfica", "Steadicam orbital 360°")
- lens
- lighting
- palette
- visualPrompt (Prompt detalhado para gerador de imagens)
- videoPrompt (Prompt detalhado de movimento e câmera para geradores de vídeo como Runway Gen-3/Luma/Veo)
- transition ("fade" | "cut" | "dissolve" | "match_cut" | "zoom_in" | "flash_white")
- filter ("cinematic_35mm" | "cyberpunk_neon" | "vintage_film" | "noir_bw" | "golden_hour" | "moody_blue" | "none")

Retorne exclusivamente um JSON:
{
  "scenes": [
    {
      "id": string,
      "order": number,
      "startTime": number,
      "endTime": number,
      "duration": number,
      "musicSection": string,
      "lyricsSnippet": string,
      "emotionalGoal": string,
      "description": string,
      "visualSubject": string,
      "characterAction": string,
      "setting": string,
      "cameraMovement": string,
      "lens": string,
      "lighting": string,
      "palette": string[],
      "visualPrompt": string,
      "videoPrompt": string,
      "transition": string,
      "filter": string
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: unknown) {
      console.error('Error in /api/director/storyboard:', err);
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Erro ao gerar storyboard: ${msg}` });
    }
  });

  // Director: Regenerate Scene
  app.post('/api/director/regenerate-scene', async (req, res) => {
    try {
      const { scene, adjustmentPreset, customNotes, visualBible, masterCharacter } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({ scene: null });
      }

      const prompt = `Como Diretor de Videoclipes, reescreva e aprimore especificamente esta CENA com base na solicitação do diretor:
Ajuste solicitado: "${adjustmentPreset}" ${customNotes ? `| Notas do Diretor: "${customNotes}"` : ''}

Cena atual:
${JSON.stringify(scene)}

Bíblia Visual (manter consistência):
${JSON.stringify(visualBible || {})}

Retorne um JSON com a cena atualizada preservando id, startTime, endTime, duration e atualizando emotionalGoal, description, cameraMovement, lighting, visualPrompt, videoPrompt.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ scene: parsed });
    } catch (err: unknown) {
      console.error('Error in /api/director/regenerate-scene:', err);
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Erro ao regenerar cena: ${msg}` });
    }
  });

  // Single Scene Visual Generation via Gemini (Nano Banana / Imagen 3 / Gemini Image)
  app.post('/api/generation/scene', async (req, res) => {
    try {
      const { scene, visualBible, masterCharacter, aspectRatio = '16:9' } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({
          error: 'Chave GEMINI_API_KEY não configurada no servidor.',
        });
      }

      if (!scene) {
        return res.status(400).json({ error: 'Dados da cena não fornecidos.' });
      }

      const prompt = `Cinematic music video frame for a high production music video.
Scene Description: ${scene.visualPrompt || scene.description || scene.characterAction}
Setting: ${scene.setting || visualBible?.setting || 'Cinematic stage'}
Camera Movement & Angle: ${scene.cameraMovement || 'Cinematic 35mm lens'}
Lighting: ${scene.lighting || visualBible?.lighting || 'Dramatic cinematic lighting, volumetric lights, neon accents'}
Visual Style: ${visualBible?.style || 'Cinematic film, anamorphic lens flare, 8k masterpiece'}
Atmosphere: ${visualBible?.atmosphere || 'Moody, emotional, high-contrast, atmospheric'}`;

      const formattedRatio: '16:9' | '9:16' | '1:1' | '3:4' | '4:3' =
        aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : aspectRatio === '4:5' ? '3:4' : '16:9';

      let lastError: string | null = null;
      let assetUrl: string | null = null;
      let usedModel = '';

      // 1. Try gemini-3.1-flash-lite-image
      try {
        usedModel = 'gemini-3.1-flash-lite-image';
        const response = await ai.models.generateContent({
          model: usedModel,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: formattedRatio,
            },
          },
        });

        const candidates = response.candidates || [];
        for (const candidate of candidates) {
          const parts = candidate.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || 'image/jpeg';
              assetUrl = `data:${mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          if (assetUrl) break;
        }
      } catch (err1: any) {
        lastError = err1?.message || String(err1);
        console.warn('Tentativa com gemini-3.1-flash-lite-image falhou:', lastError);

        // 2. Try gemini-3.1-flash-image
        try {
          usedModel = 'gemini-3.1-flash-image';
          const response = await ai.models.generateContent({
            model: usedModel,
            contents: {
              parts: [{ text: prompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: formattedRatio,
              },
            },
          });

          const candidates = response.candidates || [];
          for (const candidate of candidates) {
            const parts = candidate.content?.parts || [];
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType || 'image/jpeg';
                assetUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                break;
              }
            }
            if (assetUrl) break;
          }
        } catch (err2: any) {
          lastError = err2?.message || String(err2);
          console.warn('Tentativa com gemini-3.1-flash-image falhou:', lastError);

          // 3. Try Imagen 3 via generateImages
          try {
            usedModel = 'imagen-3.0-generate-002';
            const imgRes = await ai.models.generateImages({
              model: usedModel,
              prompt,
              config: {
                numberOfImages: 1,
                aspectRatio: (aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9') as any,
                outputMimeType: 'image/jpeg',
              },
            });

            if (imgRes.generatedImages && imgRes.generatedImages.length > 0) {
              const b64 = imgRes.generatedImages[0].image?.imageBytes;
              if (b64) {
                assetUrl = `data:image/jpeg;base64,${b64}`;
              }
            }
          } catch (err3: any) {
            lastError = err3?.message || String(err3);
            console.warn('Tentativa com imagen-3.0-generate-002 falhou:', lastError);
          }
        }
      }

      if (assetUrl) {
        return res.status(200).json({
          assetUrl,
          thumbnailUrl: assetUrl,
          assetType: 'image',
          provider: `Gemini AI Vision (${usedModel})`,
          isDemo: false,
          modelUsed: usedModel,
        });
      }

      // Return explicit JSON error with clean user-friendly message
      let userFriendlyError = lastError || 'Nenhuma imagem foi retornada pelo modelo.';
      try {
        if (lastError && (lastError.startsWith('{') || lastError.includes('"message"'))) {
          const parsed = JSON.parse(lastError.slice(lastError.indexOf('{')));
          if (parsed.error?.message) {
            userFriendlyError = parsed.error.message;
          }
        }
      } catch {
        // Keep raw text
      }

      return res.status(502).json({
        error: `Erro ao gerar imagem com Gemini: ${userFriendlyError}`,
        details: lastError,
        modelAttempted: usedModel,
      });
    } catch (err: unknown) {
      console.error('Error in /api/generation/scene:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Erro interno no servidor ao gerar cena: ${errMsg}` });
    }
  });

  // Dedicated Video Generation Route (Veo)
  app.post('/api/generation/video', async (req, res) => {
    try {
      const { scene, visualBible, aspectRatio = '16:9' } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({
          error: 'Chave GEMINI_API_KEY não configurada no servidor.',
        });
      }

      const visualPrompt = scene?.visualPrompt || scene?.description || 'Cinematic music video scene';
      const cameraMovement = scene?.cameraMovement ? `Camera movement: ${scene.cameraMovement}.` : 'Smooth cinematic camera movement.';
      const lighting = visualBible?.lighting ? `Lighting: ${visualBible.lighting}.` : 'Dramatic stage and cinematic lighting.';
      const colorPalette = visualBible?.colorPalette?.length ? `Color scheme: ${visualBible.colorPalette.join(', ')}.` : '';

      const videoPrompt = `${visualPrompt}. ${cameraMovement} ${lighting} ${colorPalette} Realistic 4k music video cinematic shot.`.trim();

      const candidateModels = [
        'veo-2.0-generate-001',
        'veo-3.1-lite-generate-preview',
        'veo-3.1-fast-generate-preview',
      ];

      let lastError: string | null = null;
      let usedModel = '';
      let operation: any = null;

      for (const modelName of candidateModels) {
        try {
          usedModel = modelName;
          operation = await ai.models.generateVideos({
            model: modelName,
            prompt: videoPrompt,
            config: {
              aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
              numberOfVideos: 1,
            },
          });
          break;
        } catch (err: any) {
          lastError = err?.message || String(err);
        }
      }

      if (operation) {
        return res.status(200).json({
          success: true,
          status: 'pending',
          operationName: operation.name,
          assetType: 'video',
          provider: `Google Veo (${usedModel})`,
          modelUsed: usedModel,
          isDemo: false,
        });
      }

      return res.status(502).json({
        success: false,
        status: 'error',
        error: `Erro ao gerar vídeo com Veo: ${lastError || 'Modelo Veo indisponível'}`,
        details: lastError,
        modelAttempted: usedModel,
        assetType: 'video',
      });
    } catch (err: any) {
      console.error('Error in /api/generation/video:', err);
      return res.status(500).json({
        success: false,
        error: `Erro interno no servidor ao tentar gerar vídeo: ${err?.message || err}`,
        assetType: 'video',
      });
    }
  });

  // Isolated Test Veo Video Generation Endpoint
  app.post('/api/test-veo', async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({ success: false, error: 'GEMINI_API_KEY não configurada' });
      }

      const prompt = req.body?.prompt || 'A cinematic music video shot of a lone musician in neon lights.';
      const candidateModels = ['veo-2.0-generate-001', 'veo-3.1-lite-generate-preview'];

      let lastError: string | null = null;
      let usedModel = '';
      let operation: any = null;

      for (const modelName of candidateModels) {
        try {
          usedModel = modelName;
          operation = await ai.models.generateVideos({
            model: modelName,
            prompt,
            config: { aspectRatio: '16:9', numberOfVideos: 1 },
          });
          break;
        } catch (err: any) {
          lastError = err?.message || String(err);
        }
      }

      if (operation) {
        return res.status(200).json({
          success: true,
          status: 'pending',
          modelUsed: usedModel,
          operationName: operation.name,
        });
      }

      return res.status(502).json({
        success: false,
        status: 'error',
        modelAttempted: usedModel,
        error: lastError,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // Provider: Regenerate Scene
  app.post('/api/generation/regenerate-scene', async (req, res) => {
    try {
      const { scene, adjustmentPreset, customNotes } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });
      }

      return res.status(200).json({
        assetUrl: scene?.generatedAssetUrl || '',
        thumbnailUrl: scene?.thumbnailUrl || scene?.generatedAssetUrl || '',
        assetType: scene?.assetType || 'image',
        provider: 'Gemini AI Vision',
        isDemo: false,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erro ao regenerar cena' });
    }
  });

  // Provider: Status & Cancel endpoints
  app.get('/api/generation/status/:jobId', (req, res) => {
    res.json({ status: 'completed', progress: 100 });
  });

  app.post('/api/generation/cancel/:jobId', (req, res) => {
    res.json({ status: 'cancelled' });
  });

  // Catch-all 404 for API routes so they NEVER fall through to HTML SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Rota de API não encontrada: ${req.method} ${req.originalUrl}` });
  });

  return app;
}

export const app = createExpressApp();

async function startServer() {
  const PORT = 3000;

  // Vite Middleware (Dev vs Prod)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CLIPE AI server running on http://localhost:${PORT}`);
  });
}

// Start standalone server when executed directly
if (process.env.VERCEL !== '1') {
  startServer();
}
