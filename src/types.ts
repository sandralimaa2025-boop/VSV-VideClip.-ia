/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectStatus =
  | 'SETUP'
  | 'ANALISANDO'
  | 'CONCEITO'
  | 'STORYBOARD'
  | 'GERANDO'
  | 'EDITANDO'
  | 'RENDERIZANDO'
  | 'FINALIZADO';

export type AspectRatio = '16:9' | '9:16' | '4:5' | '1:1';

export type DurationMode = 'full' | 'teaser_15' | 'teaser_30' | 'social_short';

export interface AudioFileData {
  name: string;
  size: number;
  duration: number; // in seconds
  url: string;
  mimeType: string;
  waveformPeaks?: number[];
  sampleTrackId?: string;
}

export interface CharacterBible {
  id: string;
  name: string;
  age: string;
  appearance: string;
  outfit: string;
  personality: string;
  keyFeatures: string;
  face: string;
  hair: string;
  eyes: string;
  skinTone: string;
  bodyType: string;
  accessories: string;
  referenceImageUrl?: string;
}

export interface VisualBible {
  character: string;
  setting: string;
  outfit: string;
  palette: string[]; // Hex codes or descriptive names
  lens: string;
  lighting: string;
  style: string;
  proportion: AspectRatio;
  texture: string;
  atmosphere: string;
}

export interface MusicalSection {
  name: string; // e.g. "Intro", "Verso 1", "Pré-Refrão", "Refrão", "Clímax", "Desfecho"
  startTime: number;
  endTime: number;
  energyLevel: 'low' | 'building' | 'high' | 'peak' | 'calm';
  lyricSnippet?: string;
  suggestedPacing: 'lento' | 'moderado' | 'rápido' | 'dinâmico';
}

export interface MusicalAnalysis {
  duration: number;
  bpm: number;
  detectedGenre: string;
  overallMood: string;
  energyCurve: number[]; // 0 to 100 values
  emotionalTimeline: {
    stage: 'INTRO' | 'CONSTRUÇÃO' | 'TENSÃO' | 'REFRÃO' | 'CLÍMAX' | 'DESFECHO';
    timeRange: string;
    description: string;
  }[];
  keyHitMoments: number[]; // timestamps in seconds for major beats/drops
  sections: MusicalSection[];
}

export interface ClipConcept {
  title: string;
  logline: string;
  story: string;
  mainEmotion: string;
  secondaryEmotions: string[];
  palette: { name: string; hex: string }[];
  aesthetic: string;
  characterSummary: string;
  settingsSummary: string[];
  visualSymbols: { symbol: string; meaning: string }[];
  peakImpactMoment: string;
  ending: string;
  alfineteAlignment: string; // How this reflects the "Alfinete no Mapa"
}

export type TransitionType =
  | 'fade'
  | 'cut'
  | 'dissolve'
  | 'match_cut'
  | 'zoom_in'
  | 'whip_pan'
  | 'flash_white';

export type SceneFilter =
  | 'cinematic_35mm'
  | 'cyberpunk_neon'
  | 'vintage_film'
  | 'noir_bw'
  | 'golden_hour'
  | 'moody_blue'
  | 'none';

export type FilterType = SceneFilter;

export type SceneStatus = 'pending' | 'generating' | 'ready' | 'error';

export interface Scene {
  id: string;
  projectId: string;
  order: number;
  startTime: number;
  endTime: number;
  duration: number;
  musicSection: string;
  lyricsSnippet: string;
  emotionalGoal: string;
  description: string;
  visualSubject: string;
  characterAction: string;
  setting: string;
  cameraMovement: string;
  lens: string;
  lighting: string;
  palette: string;
  visualPrompt: string; // for image generation
  videoPrompt: string; // for video motion generation (e.g. Runway / Luma / Veo)
  transition: TransitionType;
  filter: SceneFilter;
  generatedAssetUrl?: string;
  thumbnailUrl?: string;
  assetType?: 'video' | 'image_motion' | 'demo_canvas';
  status: SceneStatus;
  motionStrength?: number; // 1 - 10
  textOverlay?: string;
  regenerationHistory?: {
    timestamp: number;
    promptUsed: string;
    notes?: string;
  }[];
}

export interface Project {
  id: string;
  name: string;
  artist: string;
  genre?: string;
  language?: string;
  audioFile: AudioFileData | null;
  lyrics: string;
  hasLyrics: boolean;
  songMeaning: string;
  emotionalIntent: string;
  visualStyles: string[];
  visualReference: string;
  dominantColors: string[];
  universeInspiration: string;
  hasMainCharacter: 'sim' | 'nao' | 'artista' | 'ia_cria';
  masterCharacter: CharacterBible | null;
  aspectRatio: AspectRatio;
  durationMode: DurationMode;
  alfineteNoMapa: string; // Creative North Star: "Pelo que você quer que esse videoclipe seja lembrado?"
  musicalAnalysis?: MusicalAnalysis | null;
  analysis?: MusicalAnalysis | null;
  concept: ClipConcept | null;
  visualBible: VisualBible | null;
  scenes: Scene[];
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  demoMode?: boolean;
}

export interface VideoProviderStatus {
  providerName: string;
  isConfigured: boolean;
  supportedModels: string[];
  activeModel: string;
  hasGeminiKey: boolean;
}

export interface RenderJob {
  id: string;
  projectId: string;
  status: 'idle' | 'rendering' | 'completed' | 'error';
  progress: number; // 0 to 100
  stageMessage: string;
  exportPreset: 'youtube_1080p' | 'tiktok_9_16' | 'instagram_4_5' | 'square_1_1';
  outputUrl?: string;
  fileSize?: string;
  completedAt?: number;
  error?: string;
}
