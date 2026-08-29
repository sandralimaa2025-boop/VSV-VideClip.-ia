/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scene, VisualBible, CharacterBible, AspectRatio } from '../types';

export interface GeneratedPromptPackage {
  visualPrompt: string;       // For image gen models (Midjourney, Flux, Imagen)
  videoPrompt: string;        // For video gen models (Runway Gen-3, Luma, Veo, Kling)
  cameraMovementPrompt: string;
  characterTokens: string;
  lightingAndAtmosphereTokens: string;
}

export class PromptEngine {
  /**
   * Builds high-fidelity, structured prompts enforcing visual continuity from the Visual Bible
   */
  public static buildScenePrompts(
    scene: Partial<Scene>,
    visualBible: VisualBible | null,
    masterCharacter: CharacterBible | null,
    aspectRatio: AspectRatio = '16:9',
    songContext: { name: string; artist: string; alfineteNoMapa: string }
  ): GeneratedPromptPackage {
    // 1. Character description tokens
    let characterTokens = '';
    if (masterCharacter) {
      characterTokens = [
        masterCharacter.name ? `[Character: ${masterCharacter.name}]` : '',
        masterCharacter.age ? `${masterCharacter.age} years old` : '',
        masterCharacter.appearance || '',
        masterCharacter.face ? `face: ${masterCharacter.face}` : '',
        masterCharacter.hair ? `hair: ${masterCharacter.hair}` : '',
        masterCharacter.eyes ? `eyes: ${masterCharacter.eyes}` : '',
        masterCharacter.skinTone ? `skin: ${masterCharacter.skinTone}` : '',
        masterCharacter.bodyType ? `body: ${masterCharacter.bodyType}` : '',
        masterCharacter.outfit ? `wearing: ${masterCharacter.outfit}` : '',
        masterCharacter.accessories ? `accessories: ${masterCharacter.accessories}` : '',
        masterCharacter.keyFeatures ? `distinguishing features: ${masterCharacter.keyFeatures}` : '',
      ]
        .filter(Boolean)
        .join(', ');
    } else if (visualBible?.character) {
      characterTokens = visualBible.character;
    }

    // 2. Setting and environment
    const settingToken = scene.setting || visualBible?.setting || 'Cinematic environment with volumetric depth';

    // 3. Action and Subject
    const actionToken = scene.characterAction || scene.description || 'Cinematic performance';
    const emotionalGoal = scene.emotionalGoal || 'Deep emotional resonance';

    // 4. Camera and Lens
    const cameraMovement = scene.cameraMovement || 'Slow cinematic push-in dolly';
    const lens = scene.lens || visualBible?.lens || '35mm anamorphic prime lens, shallow depth of field, f/1.8';

    // 5. Lighting, Palette and Atmosphere
    const lighting = scene.lighting || visualBible?.lighting || 'Volumetric cinematic key light, atmospheric rim lighting';
    const palette = scene.palette || (visualBible?.palette ? visualBible.palette.join(', ') : 'Cinematic teal and warm amber');
    const atmosphere = visualBible?.atmosphere || 'Moody, textured haze, fine film grain';
    const style = visualBible?.style || 'High-end cinema music video production, 8k resolution, photorealistic masterwork';
    const texture = visualBible?.texture || 'Kodak Vision3 500T 35mm film stock grain';

    // 6. Assemble Still Visual Prompt (for initial frames & keyframes)
    const visualPromptParts = [
      `Cinematic music video still for "${songContext.name}"`,
      characterTokens ? `Subject: ${characterTokens}` : '',
      `Action: ${actionToken}`,
      `Environment: ${settingToken}`,
      `Atmosphere & Emotion: ${emotionalGoal}, ${atmosphere}`,
      `Cinematography: Shot on ARRI Alexa Mini LF, ${lens}`,
      `Lighting: ${lighting}`,
      `Color Grade: ${palette}`,
      `Style & Quality: ${style}, ${texture}, master composition, dynamic framing`,
      `--ar ${aspectRatio.replace(':', ':')}`,
    ].filter(Boolean);

    const visualPrompt = visualPromptParts.join(' | ');

    // 7. Assemble Video Motion Prompt (for video generators like Runway, Luma, Veo, Kling)
    const videoPromptParts = [
      `[Cinematic Music Video Scene]`,
      `Camera Direction: ${cameraMovement}, smooth stabilization`,
      characterTokens ? `Character: ${characterTokens} performing ${actionToken}` : `Scene: ${actionToken}`,
      `Lighting & Color: ${lighting}, color graded in ${palette}`,
      `Atmosphere: ${atmosphere}`,
      `Motion Dynamics: Fluid organic movement, realistic physics, 24fps cinematic motion blur`,
      `Visual Bible Continuity Anchor: Consistent face, wardrobe and color temperature with previous takes`,
    ].filter(Boolean);

    const videoPrompt = videoPromptParts.join('. ');

    return {
      visualPrompt,
      videoPrompt,
      cameraMovementPrompt: cameraMovement,
      characterTokens,
      lightingAndAtmosphereTokens: `${lighting}, ${palette}, ${atmosphere}`,
    };
  }

  /**
   * Refines a prompt based on intelligent regeneration directives
   */
  public static refinePromptWithAdjustment(
    currentPrompt: string,
    preset: 'dramatic' | 'realistic' | 'cinematic' | 'emotional' | 'dynamic' | 'dark' | 'romantic' | 'custom',
    customNotes?: string
  ): string {
    const modifiers = {
      dramatic: 'Enhanced dramatic tension, deep chiaroscuro contrast shadows, intense emotional gaze, slower brooding camera motion',
      realistic: 'Hyper-realistic raw textures, natural unpolished lighting, authentic human expression, documentary-grade handheld micro-jitter',
      cinematic: 'Ultra-wide anamorphic horizontal lens flares, 70mm IMAX scale, smooth Steadicam tracking, master color grading by Deakins',
      emotional: 'Intimate macro close-up, subtle micro-expressions, soft diffusion filter, warm melancholic light wraps, heightened emotional vulnerability',
      dynamic: 'Fast kinetic whip pan, dynamic push zoom on beat drops, high-energy lighting shifts, pulsing rhythmic visual cuts',
      dark: 'Low-key noir lighting, dense fog and shadow silhouettes, desaturated cold tones with sharp crimson accents, ominous mood',
      romantic: 'Soft golden hour backlighting, gentle lens halation, dreamy bokeh particles in air, tender emotional warmth',
      custom: customNotes ? `Director custom notes: ${customNotes}` : '',
    };

    const modifierText = modifiers[preset] || (customNotes ? `Director custom notes: ${customNotes}` : '');
    return `${currentPrompt} [Director Revision: ${modifierText}]`;
  }
}
