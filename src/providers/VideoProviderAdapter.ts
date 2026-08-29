/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scene, VisualBible, CharacterBible, AspectRatio } from '../types';

export interface SceneGenerationResult {
  assetUrl: string;
  thumbnailUrl: string;
  assetType: 'video' | 'image_motion' | 'demo_canvas';
  provider: string;
  isDemo: boolean;
  metadata?: {
    camera: string;
    motionStrength: number;
    generatedAt: number;
  };
}

export interface IVideoProviderAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  generateScene(
    scene: Scene,
    visualBible: VisualBible | null,
    masterCharacter: CharacterBible | null,
    aspectRatio: AspectRatio
  ): Promise<SceneGenerationResult>;
  regenerateScene(
    scene: Scene,
    adjustmentPreset: string,
    customNotes?: string
  ): Promise<SceneGenerationResult>;
  getGenerationStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'ready' | 'error';
    progress: number;
    error?: string;
  }>;
  cancelGeneration(jobId: string): Promise<boolean>;
}

/**
 * Procedural Cinematic Canvas Visualizer for High-Fidelity Demo Simulation
 */
export class DemoVideoProviderAdapter implements IVideoProviderAdapter {
  public name = 'Demo Simulation Provider (Procedural Cinematics)';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async generateScene(
    scene: Scene,
    visualBible: VisualBible | null,
    masterCharacter: CharacterBible | null,
    aspectRatio: AspectRatio = '16:9'
  ): Promise<SceneGenerationResult> {
    // Artificial latency to simulate professional rendering queue
    await new Promise((resolve) => setTimeout(resolve, 1400 + Math.random() * 800));

    const canvasUrl = this.renderProceduralSceneFrame(scene, visualBible, masterCharacter, aspectRatio);

    return {
      assetUrl: canvasUrl,
      thumbnailUrl: canvasUrl,
      assetType: 'demo_canvas',
      provider: 'CLIPE AI Demo Engine',
      isDemo: true,
      metadata: {
        camera: scene.cameraMovement,
        motionStrength: scene.motionStrength || 5,
        generatedAt: Date.now(),
      },
    };
  }

  public async regenerateScene(
    scene: Scene,
    adjustmentPreset: string,
    customNotes?: string
  ): Promise<SceneGenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const updatedScene: Scene = {
      ...scene,
      emotionalGoal: `${scene.emotionalGoal} (+${adjustmentPreset})`,
      description: customNotes ? `${scene.description} (${customNotes})` : scene.description,
    };

    const canvasUrl = this.renderProceduralSceneFrame(updatedScene, null, null, '16:9', adjustmentPreset);

    return {
      assetUrl: canvasUrl,
      thumbnailUrl: canvasUrl,
      assetType: 'demo_canvas',
      provider: 'CLIPE AI Demo Engine (Regenerado)',
      isDemo: true,
      metadata: {
        camera: scene.cameraMovement,
        motionStrength: scene.motionStrength || 6,
        generatedAt: Date.now(),
      },
    };
  }

  public async getGenerationStatus(_jobId: string) {
    return { status: 'ready' as const, progress: 100 };
  }

  public async cancelGeneration(_jobId: string): Promise<boolean> {
    return true;
  }

  /**
   * Generates a high quality cinematic stylized poster/frame on an HTML5 canvas
   */
  private renderProceduralSceneFrame(
    scene: Scene,
    visualBible: VisualBible | null,
    masterCharacter: CharacterBible | null,
    aspectRatio: AspectRatio,
    adjustment?: string
  ): string {
    const canvas = document.createElement('canvas');
    const width = 1280;
    const height =
      aspectRatio === '9:16' ? 2275 : aspectRatio === '4:5' ? 1600 : aspectRatio === '1:1' ? 1280 : 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Color gradient based on scene palette and order
    const gradients = [
      ['#0f172a', '#1e1b4b', '#06b6d4'], // Neon Teal Night
      ['#18181b', '#3b0764', '#d946ef'], // Deep Magenta
      ['#0c0a09', '#451a03', '#f59e0b'], // Warm Golden Tungsten
      ['#022c22', '#064e3b', '#10b981'], // Emerald Noir
      ['#172554', '#1e3a8a', '#60a5fa'], // Deep Ocean Blue
    ];

    const colorPair = gradients[(scene.order - 1) % gradients.length];
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, colorPair[0]);
    bgGrad.addColorStop(0.5, colorPair[1]);
    bgGrad.addColorStop(1, colorPair[2]);

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle atmospheric light beam / flare
    const flareGrad = ctx.createRadialGradient(width * 0.7, height * 0.3, 10, width * 0.7, height * 0.3, width * 0.6);
    flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    flareGrad.addColorStop(0.3, 'rgba(139, 92, 246, 0.25)');
    flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, 0, width, height);

    // Vignette
    const vigGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // Geometric cinematic composition grid / perspective lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    // Rule of thirds lines
    ctx.beginPath();
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, height);
    ctx.moveTo((width / 3) * 2, 0);
    ctx.lineTo((width / 3) * 2, height);
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (height / 3) * 2);
    ctx.lineTo(width, (height / 3) * 2);
    ctx.stroke();

    // Cinematic Letterbox & Film Frame Header
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(30, 30, width - 60, 70);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30, 30, width - 60, 70);

    // Header text
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText(`CENA ${scene.order.toString().padStart(2, '0')} // ${scene.musicSection.toUpperCase()}`, 50, 65);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`[MODO DEMONSTRAÇÃO] Direção: ${scene.cameraMovement} | Lente: ${scene.lens || '35mm Anamorphic'}`, 50, 88);

    // Center focal silhouette / icon placeholder
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 20, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Scene Center Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`“${scene.emotionalGoal}”`, width / 2, height / 2 - 15);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(scene.characterAction || 'Ação cinematográfica em andamento', width / 2, height / 2 + 20);

    // Footer overlay card with prompts
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(9, 9, 14, 0.9)';
    ctx.fillRect(30, height - 150, width - 60, 120);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(30, height - 150, width - 60, 120);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillText(`PROMPT DE VÍDEO (MOTION / CAMERA):`, 50, height - 122);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    const desc = scene.videoPrompt || scene.description;
    const truncated = desc.length > 130 ? desc.slice(0, 130) + '...' : desc;
    ctx.fillText(truncated, 50, height - 100);

    ctx.fillStyle = '#a855f7';
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `Iluminação: ${scene.lighting}  |  Transição: ${scene.transition.toUpperCase()}  |  Duração: ${scene.duration}s`,
      50,
      height - 60
    );

    return canvas.toDataURL('image/jpeg', 0.88);
  }
}

/**
 * Real Video Provider Adapter (Google Veo, Runway Gen-3, Luma Dream Machine, Kling, Fal, Replicate)
 */
export class RealVideoProviderAdapter implements IVideoProviderAdapter {
  public name = 'External Video Provider Adapter (Veo / Runway / Luma / Kling)';

  public async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const config = await res.json();
        return !!config.hasVideoKey || !!config.hasGeminiKey;
      }
    } catch {
      return false;
    }
    return false;
  }

  public async generateScene(
    scene: Scene,
    visualBible: VisualBible | null,
    masterCharacter: CharacterBible | null,
    aspectRatio: AspectRatio
  ): Promise<SceneGenerationResult> {
    const response = await fetch('/api/generation/scene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scene,
        visualBible,
        masterCharacter,
        aspectRatio,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          'A API de vídeo externa requer chave de configuração. Ative o Modo Demonstração ou configure as chaves no arquivo .env'
      );
    }

    const data = await response.json();
    return {
      assetUrl: data.assetUrl,
      thumbnailUrl: data.thumbnailUrl || data.assetUrl,
      assetType: data.assetType || 'video',
      provider: data.provider || 'AI Video Provider',
      isDemo: false,
      metadata: data.metadata,
    };
  }

  public async regenerateScene(
    scene: Scene,
    adjustmentPreset: string,
    customNotes?: string
  ): Promise<SceneGenerationResult> {
    const response = await fetch('/api/generation/regenerate-scene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scene, adjustmentPreset, customNotes }),
    });

    if (!response.ok) {
      throw new Error('Falha ao regenerar a cena na API externa.');
    }

    const data = await response.json();
    return {
      assetUrl: data.assetUrl,
      thumbnailUrl: data.thumbnailUrl || data.assetUrl,
      assetType: data.assetType || 'video',
      provider: data.provider || 'AI Video Provider',
      isDemo: false,
    };
  }

  public async getGenerationStatus(jobId: string) {
    const res = await fetch(`/api/generation/status/${jobId}`);
    if (!res.ok) throw new Error('Não foi possível obter status da geração');
    return res.json();
  }

  public async cancelGeneration(jobId: string): Promise<boolean> {
    const res = await fetch(`/api/generation/cancel/${jobId}`, { method: 'POST' });
    return res.ok;
  }
}
