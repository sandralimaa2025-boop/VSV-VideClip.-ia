/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scene, VisualBible, CharacterBible, AspectRatio } from '../types';

export interface SceneGenerationResult {
  assetUrl: string;
  thumbnailUrl: string;
  assetType: 'video' | 'image' | 'image_motion' | 'demo_canvas';
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
    // Artificial latency for smooth user experience
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));

    // Try backend AI generation first (Gemini Imagen / Vision)
    try {
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

      if (response.ok) {
        const data = await response.json();
        if (data.assetUrl && (data.assetUrl.startsWith('data:image') || data.assetUrl.startsWith('http') || data.assetUrl.startsWith('https'))) {
          return {
            assetUrl: data.assetUrl,
            thumbnailUrl: data.thumbnailUrl || data.assetUrl,
            assetType: data.assetType || 'image',
            provider: data.provider || 'Gemini AI Vision',
            isDemo: !!data.isDemo,
            metadata: {
              camera: scene.cameraMovement,
              motionStrength: scene.motionStrength || 5,
              generatedAt: Date.now(),
            },
          };
        }
      }
    } catch {
      // Graceful fallback to procedural cinematic rendering
    }

    // High quality procedural cinematic illustration
    const canvasUrl = this.renderProceduralSceneFrame(scene, visualBible, masterCharacter, aspectRatio);

    return {
      assetUrl: canvasUrl,
      thumbnailUrl: canvasUrl,
      assetType: 'demo_canvas',
      provider: 'CLIPE AI Cinematics Engine',
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
    await new Promise((resolve) => setTimeout(resolve, 1000));

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
      provider: 'CLIPE AI Cinematics Engine (Regenerado)',
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
   * Generates a realistic, visually stunning cinematic poster/frame on an HTML5 canvas
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

    // Determine visual genre theme from scene and description
    const textLower = `${scene.description} ${scene.setting} ${scene.lighting} ${scene.musicSection} ${visualBible?.style || ''} ${visualBible?.atmosphere || ''}`.toLowerCase();

    const isStageOrLive = textLower.includes('show') || textLower.includes('palco') || textLower.includes('palco') || textLower.includes('banda') || textLower.includes('cantor') || textLower.includes('microfone') || textLower.includes('luzes') || textLower.includes('show');
    const isCyberpunkOrNeon = textLower.includes('neon') || textLower.includes('cyber') || textLower.includes('cidade') || textLower.includes('noite') || textLower.includes('chuva') || textLower.includes('futurista');
    const isSunsetOrNature = textLower.includes('sol') || textLower.includes('praia') || textLower.includes('estrada') || textLower.includes('campo') || textLower.includes('golden') || textLower.includes('dia') || textLower.includes('montanha');

    // 1. Base Sky / Environment Gradient
    let skyColors = ['#080811', '#1e1b4b', '#4338ca'];
    if (isCyberpunkOrNeon) {
      skyColors = ['#05050d', '#1e0538', '#06b6d4'];
    } else if (isSunsetOrNature) {
      skyColors = ['#1e102d', '#7c2d12', '#f59e0b'];
    } else if (isStageOrLive) {
      skyColors = ['#030712', '#111827', '#4c1d95'];
    } else {
      const presets = [
        ['#09090b', '#1e1b4b', '#3b82f6'],
        ['#0a0a0f', '#2e1065', '#ec4899'],
        ['#022c22', '#064e3b', '#10b981'],
        ['#1c1917', '#451a03', '#d97706'],
      ];
      skyColors = presets[(scene.order - 1) % presets.length];
    }

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, skyColors[0]);
    bgGrad.addColorStop(0.55, skyColors[1]);
    bgGrad.addColorStop(1, skyColors[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Distant Stars or City Skyline
    if (isCyberpunkOrNeon || !isSunsetOrNature) {
      // Distant City Skyline Silhouettes
      ctx.fillStyle = '#050714';
      const buildingCount = 20;
      const bWidth = width / buildingCount;
      for (let i = 0; i < buildingCount; i++) {
        const bHeight = 80 + Math.sin(i * 1.5 + scene.order) * 70 + (i % 3) * 40;
        ctx.fillRect(i * bWidth, height * 0.65 - bHeight, bWidth + 2, height * 0.35 + bHeight);
        
        // Random glowing window pixels
        ctx.fillStyle = (i % 2 === 0) ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 114, 182, 0.4)';
        for (let w = 0; w < 4; w++) {
          for (let h = 0; h < 6; h++) {
            if ((i + w + h) % 3 === 0) {
              ctx.fillRect(i * bWidth + 8 + w * 10, height * 0.65 - bHeight + 15 + h * 16, 4, 6);
            }
          }
        }
        ctx.fillStyle = '#050714';
      }
    } else {
      // Golden Hour Mountain Ranges
      ctx.fillStyle = 'rgba(30, 15, 20, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.65);
      ctx.lineTo(width * 0.25, height * 0.52);
      ctx.lineTo(width * 0.5, height * 0.62);
      ctx.lineTo(width * 0.75, height * 0.48);
      ctx.lineTo(width, height * 0.65);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Ground / Floor / Stage Surface with Reflective Gradient
    const groundGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
    groundGrad.addColorStop(0, 'rgba(10, 10, 18, 0.95)');
    groundGrad.addColorStop(0.3, 'rgba(15, 15, 28, 1)');
    groundGrad.addColorStop(1, 'rgba(5, 5, 10, 1)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);

    // Ground Neon Reflection Lines (Perspective Grid)
    ctx.strokeStyle = isCyberpunkOrNeon ? 'rgba(6, 182, 212, 0.2)' : 'rgba(168, 85, 247, 0.15)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= width; x += width / 8) {
      ctx.beginPath();
      ctx.moveTo(width / 2, height * 0.65);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 4. Volumetric Stage Spotlights & Light Cones
    const spotX1 = width * 0.25;
    const spotX2 = width * 0.75;
    const spotTargetX = width * 0.5;
    const spotTargetY = height * 0.75;

    // Left Spotlight Cone
    const cone1 = ctx.createLinearGradient(spotX1, 0, spotTargetX, spotTargetY);
    cone1.addColorStop(0, isCyberpunkOrNeon ? 'rgba(236, 72, 153, 0.6)' : 'rgba(56, 189, 248, 0.55)');
    cone1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cone1;
    ctx.beginPath();
    ctx.moveTo(spotX1 - 30, 0);
    ctx.lineTo(spotX1 + 30, 0);
    ctx.lineTo(spotTargetX + 120, spotTargetY);
    ctx.lineTo(spotTargetX - 120, spotTargetY);
    ctx.closePath();
    ctx.fill();

    // Right Spotlight Cone
    const cone2 = ctx.createLinearGradient(spotX2, 0, spotTargetX, spotTargetY);
    cone2.addColorStop(0, isCyberpunkOrNeon ? 'rgba(6, 182, 212, 0.6)' : 'rgba(217, 70, 239, 0.55)');
    cone2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cone2;
    ctx.beginPath();
    ctx.moveTo(spotX2 - 30, 0);
    ctx.lineTo(spotX2 + 30, 0);
    ctx.lineTo(spotTargetX + 140, spotTargetY);
    ctx.lineTo(spotTargetX - 100, spotTargetY);
    ctx.closePath();
    ctx.fill();

    // 5. Center Spotlight Stage Glow & Atmospheric Fog
    const stageGlow = ctx.createRadialGradient(width / 2, height * 0.75, 20, width / 2, height * 0.75, width * 0.45);
    stageGlow.addColorStop(0, isSunsetOrNature ? 'rgba(245, 158, 11, 0.4)' : 'rgba(168, 85, 247, 0.35)');
    stageGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
    stageGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = stageGlow;
    ctx.fillRect(0, 0, width, height);

    // 6. Character / Artist Silhouette (Cinematic Subject)
    const charX = width / 2;
    const charY = height * 0.75;

    // Rim light on character
    ctx.strokeStyle = isCyberpunkOrNeon ? '#38bdf8' : '#e879f9';
    ctx.lineWidth = 3;
    ctx.shadowColor = isCyberpunkOrNeon ? '#38bdf8' : '#c084fc';
    ctx.shadowBlur = 18;

    // Head
    ctx.fillStyle = '#090910';
    ctx.beginPath();
    ctx.arc(charX, charY - 140, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Body / Torso Silhouette
    ctx.beginPath();
    ctx.moveTo(charX - 35, charY - 105);
    ctx.lineTo(charX + 35, charY - 105);
    ctx.lineTo(charX + 45, charY - 10);
    ctx.lineTo(charX - 45, charY - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Arms & Microphone / Performance Pose
    ctx.beginPath();
    ctx.moveTo(charX + 30, charY - 95);
    ctx.lineTo(charX + 60, charY - 60);
    ctx.lineTo(charX + 15, charY - 130); // Hand holding mic to mouth
    ctx.stroke();

    // Microphone Stand
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(charX + 15, charY - 130);
    ctx.lineTo(charX + 18, charY + 20);
    ctx.lineTo(charX - 10, charY + 30);
    ctx.moveTo(charX + 18, charY + 20);
    ctx.lineTo(charX + 45, charY + 30);
    ctx.stroke();

    // 7. Horizontal Anamorphic Lens Flare Across Cinema Center
    const flareY = height * 0.48;
    const flare = ctx.createLinearGradient(0, flareY, width, flareY);
    flare.addColorStop(0, 'rgba(56, 189, 248, 0)');
    flare.addColorStop(0.3, 'rgba(56, 189, 248, 0.25)');
    flare.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
    flare.addColorStop(0.7, 'rgba(236, 72, 153, 0.3)');
    flare.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = flare;
    ctx.fillRect(0, flareY - 3, width, 6);

    // 8. Atmospheric Floating Light Bokeh Particles
    for (let p = 0; p < 24; p++) {
      const px = (p * 57 + scene.order * 31) % width;
      const py = (p * 43 + scene.order * 23) % (height * 0.85);
      const pr = 2 + (p % 4);
      ctx.fillStyle = p % 2 === 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Vignette (Cinematic Edge Darkening)
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.68);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(0.8, 'rgba(0,0,0,0.4)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 10. Clean, Crisp Camera HUD Badges in Corners (Non-Intrusive)
    // Top Left: Recording Badge
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(38, 38, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`REC  •  4K 24FPS  •  ${scene.musicSection.toUpperCase()}`, 52, 42);

    // Top Right: Scene & Lens Details
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillText(`CENA ${scene.order.toString().padStart(2, '0')}  |  ${scene.cameraMovement}`, width - 30, 42);

    // Bottom subtle overlay label
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(30, height - 55, width - 60, 36);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, height - 55, width - 60, 36);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🎬  ${scene.characterAction || scene.description}`, 45, height - 32);

    ctx.fillStyle = '#a855f7';
    ctx.textAlign = 'right';
    ctx.fillText(`${scene.duration}s  |  Lente: ${scene.lens || '35mm Anamorphic'}`, width - 45, height - 32);

    return canvas.toDataURL('image/jpeg', 0.9);
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

    const contentType = response.headers.get('content-type') || '';
    let responseData: any = {};

    if (contentType.includes('application/json')) {
      responseData = await response.json().catch(() => ({}));
    } else {
      const text = await response.text().catch(() => '');
      throw new Error(`Resposta inesperada do servidor (HTTP ${response.status}): ${text.slice(0, 150) || 'Não-JSON'}`);
    }

    if (!response.ok) {
      throw new Error(
        responseData.error ||
          responseData.message ||
          responseData.details ||
          `Erro HTTP ${response.status} ao gerar a cena.`
      );
    }

    const data = responseData;
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
