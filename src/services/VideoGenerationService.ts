/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scene, VisualBible, CharacterBible, AspectRatio } from '../types';
import { IVideoProviderAdapter, DemoVideoProviderAdapter, RealVideoProviderAdapter, SceneGenerationResult } from '../providers/VideoProviderAdapter';

export class VideoGenerationService {
  private static instance: VideoGenerationService;
  private demoProvider: IVideoProviderAdapter;
  private realProvider: IVideoProviderAdapter;
  private activeProvider: 'demo' | 'real' = 'demo';
  private activeJobs = new Map<string, { abortController?: AbortController }>();

  private constructor() {
    this.demoProvider = new DemoVideoProviderAdapter();
    this.realProvider = new RealVideoProviderAdapter();
  }

  public static getInstance(): VideoGenerationService {
    if (!VideoGenerationService.instance) {
      VideoGenerationService.instance = new VideoGenerationService();
    }
    return VideoGenerationService.instance;
  }

  public setProviderMode(mode: 'demo' | 'real') {
    this.activeProvider = mode;
  }

  public getProviderMode(): 'demo' | 'real' {
    return this.activeProvider;
  }

  public getProvider(): IVideoProviderAdapter {
    return this.activeProvider === 'real' ? this.realProvider : this.demoProvider;
  }

  /**
   * Generates a single scene frame using Gemini AI backend
   */
  public async generateScene(
    scene: Scene,
    visualBible: VisualBible | null,
    masterCharacter: CharacterBible | null,
    aspectRatio: AspectRatio = '16:9'
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
      const errData = await response.json().catch(() => ({}));
      const message = errData.error || errData.details || `Falha na requisição (HTTP ${response.status})`;
      throw new Error(message);
    }

    const data = await response.json();
    if (!data.assetUrl || typeof data.assetUrl !== 'string') {
      throw new Error('Nenhuma imagem válida foi retornada pela API Gemini.');
    }

    return {
      assetUrl: data.assetUrl,
      thumbnailUrl: data.thumbnailUrl || data.assetUrl,
      assetType: data.assetType || 'image',
      provider: data.provider || 'Gemini AI Vision',
      isDemo: false,
      metadata: {
        camera: scene.cameraMovement,
        motionStrength: scene.motionStrength || 5,
        generatedAt: Date.now(),
      },
    };
  }

  /**
   * Regenerates a single scene with intelligent director feedback
   */
  public async regenerateScene(
    scene: Scene,
    adjustmentPreset: string,
    customNotes?: string
  ): Promise<SceneGenerationResult> {
    const provider = this.getProvider();
    return await provider.regenerateScene(scene, adjustmentPreset, customNotes);
  }

  /**
   * Generates preview for a scene
   */
  public async generatePreview(scene: Scene): Promise<string> {
    const res = await this.demoProvider.generateScene(scene, null, null, '16:9');
    return res.thumbnailUrl;
  }

  /**
   * Gets generation status
   */
  public async getGenerationStatus(jobId: string) {
    return await this.getProvider().getGenerationStatus(jobId);
  }

  /**
   * Cancels generation
   */
  public async cancelGeneration(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (job?.abortController) {
      job.abortController.abort();
    }
    this.activeJobs.delete(jobId);
    return await this.getProvider().cancelGeneration(jobId);
  }
}
