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
   * Generates a single scene frame using the active provider adapter
   */
  public async generateScene(
    scene: Scene,
    visualBible: VisualBible | null,
    masterCharacter: CharacterBible | null,
    aspectRatio: AspectRatio = '16:9'
  ): Promise<SceneGenerationResult> {
    const provider = this.getProvider();
    return await provider.generateScene(scene, visualBible, masterCharacter, aspectRatio);
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
