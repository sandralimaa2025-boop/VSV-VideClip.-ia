/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, MusicalAnalysis, ClipConcept, Scene, CharacterBible, VisualBible } from '../types';

export class LLMProviderAdapter {
  /**
   * Analyzes the song identity, lyrics, musical energy, and emotional trajectory
   */
  public static async analyzeSong(project: Partial<Project>): Promise<MusicalAnalysis> {
    try {
      const response = await fetch('/api/director/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          artist: project.artist,
          lyrics: project.lyrics,
          hasLyrics: project.hasLyrics,
          songMeaning: project.songMeaning,
          emotionalIntent: project.emotionalIntent,
          visualStyles: project.visualStyles,
          alfineteNoMapa: project.alfineteNoMapa,
          duration: project.audioFile?.duration || 40,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          return data.analysis;
        }
      }
    } catch (err) {
      console.warn('Backend Gemini API call returned error or is offline, using Director Reasoning Fallback', err);
    }

    // Fallback Director Reasoning Engine
    return LLMProviderAdapter.fallbackAnalysis(project);
  }

  /**
   * Generates the master creative concept ("SEU CLIPE NASCEU AQUI")
   */
  public static async generateConcept(
    project: Partial<Project>,
    analysis: MusicalAnalysis
  ): Promise<{ concept: ClipConcept; visualBible: VisualBible; masterCharacter: CharacterBible | null }> {
    try {
      const response = await fetch('/api/director/concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, analysis }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.concept && data.visualBible) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend Gemini concept generation fallback', err);
    }

    return LLMProviderAdapter.fallbackConcept(project, analysis);
  }

  /**
   * Generates the complete scene-by-scene Storyboard with camera, lighting, and prompt directions
   */
  public static async generateStoryboard(
    project: Project,
    concept: ClipConcept,
    visualBible: VisualBible,
    analysis: MusicalAnalysis
  ): Promise<Scene[]> {
    try {
      const response = await fetch('/api/director/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, concept, visualBible, analysis }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.scenes && Array.isArray(data.scenes)) {
          return data.scenes;
        }
      }
    } catch (err) {
      console.warn('Backend Gemini storyboard fallback', err);
    }

    return LLMProviderAdapter.fallbackStoryboard(project, concept, visualBible, analysis);
  }

  /**
   * Re-evaluates a single scene based on director feedback
   */
  public static async regenerateScene(
    scene: Scene,
    adjustmentPreset: string,
    customNotes: string,
    visualBible: VisualBible | null,
    masterCharacter: CharacterBible | null
  ): Promise<Scene> {
    try {
      const response = await fetch('/api/director/regenerate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene, adjustmentPreset, customNotes, visualBible, masterCharacter }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.scene) {
          return data.scene;
        }
      }
    } catch (err) {
      console.warn('Backend scene regeneration fallback', err);
    }

    // Fallback modification
    return {
      ...scene,
      emotionalGoal: `${scene.emotionalGoal} (Revisão: Mais ${adjustmentPreset})`,
      description: customNotes ? `${scene.description}. [Diretor: ${customNotes}]` : `${scene.description} com ênfase dramática refinada.`,
      cameraMovement: adjustmentPreset.includes('dinâmica') ? 'Travelling acelerado com chicote panorâmico' : 'Travelling lento intimista e imersivo',
      status: 'pending',
    };
  }

  // --- Offline Fallback Engines ---
  private static fallbackAnalysis(project: Partial<Project>): MusicalAnalysis {
    const duration = project.audioFile?.duration || 40;
    const styles = project.visualStyles?.join(', ') || 'Cinematográfico';

    return {
      duration,
      bpm: 120,
      detectedGenre: project.visualStyles?.[0] || 'Pop / Indie / Urbano',
      overallMood: project.emotionalIntent || 'Intensidade cinematográfica e ressonância poética',
      energyCurve: [20, 35, 50, 68, 90, 85, 60, 30],
      emotionalTimeline: [
        { stage: 'INTRO', timeRange: `00:00 - 00:${Math.floor(duration * 0.2).toString().padStart(2, '0')}`, description: 'Imersão no universo visual e isolamento inicial' },
        { stage: 'CONSTRUÇÃO', timeRange: `00:${Math.floor(duration * 0.2).toString().padStart(2, '0')} - 00:${Math.floor(duration * 0.4).toString().padStart(2, '0')}`, description: 'Inquietação e primeiros impulsos de transformação' },
        { stage: 'TENSÃO', timeRange: `00:${Math.floor(duration * 0.4).toString().padStart(2, '0')} - 00:${Math.floor(duration * 0.55).toString().padStart(2, '0')}`, description: 'Crescendo rítmico e choque de forças visuais' },
        { stage: 'REFRÃO', timeRange: `00:${Math.floor(duration * 0.55).toString().padStart(2, '0')} - 00:${Math.floor(duration * 0.8).toString().padStart(2, '0')}`, description: 'Explosão catártica com luzes volumétricas e movimento intenso' },
        { stage: 'CLÍMAX', timeRange: `00:${Math.floor(duration * 0.8).toString().padStart(2, '0')} - 00:${Math.floor(duration * 0.92).toString().padStart(2, '0')}`, description: 'Momento de revelação e transcendência narrativa' },
        { stage: 'DESFECHO', timeRange: `00:${Math.floor(duration * 0.92).toString().padStart(2, '0')} - 00:${Math.floor(duration).toString().padStart(2, '0')}`, description: 'Respiro poético e imagem final inesquecível' },
      ],
      keyHitMoments: [duration * 0.2, duration * 0.4, duration * 0.55, duration * 0.8],
      sections: [
        { name: 'Intro', startTime: 0, endTime: Math.floor(duration * 0.2), energyLevel: 'low', suggestedPacing: 'lento', lyricSnippet: 'Abertura do videoclipe' },
        { name: 'Verso 1', startTime: Math.floor(duration * 0.2), endTime: Math.floor(duration * 0.55), energyLevel: 'building', suggestedPacing: 'moderado', lyricSnippet: 'Desenvolvimento do personagem' },
        { name: 'Refrão', startTime: Math.floor(duration * 0.55), endTime: Math.floor(duration * 0.8), energyLevel: 'peak', suggestedPacing: 'dinâmico', lyricSnippet: 'Momento de maior impacto sonoro' },
        { name: 'Clímax & Desfecho', startTime: Math.floor(duration * 0.8), endTime: Math.floor(duration), energyLevel: 'high', suggestedPacing: 'moderado', lyricSnippet: 'Resolução visual final' },
      ],
    };
  }

  private static fallbackConcept(project: Partial<Project>, analysis: MusicalAnalysis): {
    concept: ClipConcept;
    visualBible: VisualBible;
    masterCharacter: CharacterBible | null;
  } {
    const songName = project.name || 'Sinfonia';
    const artist = project.artist || 'Artista';
    const styles = project.visualStyles?.length ? project.visualStyles.join(' & ') : 'Cinematográfico';
    const alfinete = project.alfineteNoMapa || 'Um videoclipe que transforma sentimento puro em imagens inesquecíveis.';

    const concept: ClipConcept = {
      title: `${songName}: O Reflexo do Infinito`,
      logline: `Em meio a uma paisagem marcada pelo tempo, o protagonista redescobre sua própria essência através de visões hipnóticas guiadas pela música.`,
      story: `O videoclipe acompanha uma jornada visual não-linear. Começamos com planos detalhados e introspectivos, onde o silêncio visual contrasta com os primeiros acordes. À medida que a harmonia se expande, o ambiente reage: sombras se dissolvem em feixes de luz volumétrica e o personagem transita de uma postura de confinamento para uma catarse libertadora. O refrão culmina em um cenário surreal onde memória e realidade se fundem sob uma paleta cinematográfica marcante.`,
      mainEmotion: project.emotionalIntent || 'Catarse e Despertar',
      secondaryEmotions: ['Melancolia Poética', 'Tensão Rítmica', 'Esperança Vibrante'],
      palette: [
        { name: 'Azul Eletromagnético', hex: '#06b6d4' },
        { name: 'Magenta Profundo', hex: '#d946ef' },
        { name: 'Âmbar Noturno', hex: '#f59e0b' },
        { name: 'Obsidiana Cinematográfica', hex: '#0f172a' },
      ],
      aesthetic: `${styles} com iluminação volumétrica, composição em proporção áurea e profundidade de campo f/1.4`,
      characterSummary: project.masterCharacter?.name || 'Figura enigmática com olhar magnético e presença marcante',
      settingsSummary: [
        'Espaço urbano minimalista banhado por neblina e luz difusa',
        'Vastidão aberta com horizonte dramático ao crepúsculo',
        'Cenário espelhado com reflexos infinitos e partículas de luz suspensas',
      ],
      visualSymbols: [
        { symbol: 'Superfícies Espelhadas / Água', meaning: 'O confronto entre a imagem pública e a verdade interior' },
        { symbol: 'Luz Volumétrica Rompendo a Penumbra', meaning: 'A música como força catalisadora de transformação' },
        { symbol: 'Vento e Tecidos Fluidos', meaning: 'A passagem inexorável do tempo e a liberação emocional' },
      ],
      peakImpactMoment: 'O clímax do refrão onde todos os feixes de luz convergem em uma dança de câmera orbital 360°.',
      ending: 'O protagonista encara a lente com serenidade absoluta enquanto a luz suave se desvanece no corte final.',
      alfineteAlignment: `Direção totalmente alinhada ao Alfinete: "${alfinete}"`,
    };

    const visualBible: VisualBible = {
      character: project.masterCharacter ? `${project.masterCharacter.name}, ${project.masterCharacter.appearance}` : 'Protagonista com visual cinematográfico autêntico',
      setting: 'Locações com alto valor estético, arquitetura dramática e horizonte expansivo',
      outfit: project.masterCharacter?.outfit || 'Figurino contemporâneo com tecidos nobres e textura táctil cinematográfica',
      palette: ['#06b6d4', '#d946ef', '#f59e0b', '#0f172a'],
      lens: '35mm e 50mm Anamorphic Master Primes, flare horizontal azul suave',
      lighting: 'Chiaroscuro moderno, luz de contorno (rim light) volumétrica e sombras aveludadas',
      style: `${styles}, estética de cinema contemporâneo 8K, granulação sutil de película 35mm`,
      proportion: project.aspectRatio || '16:9',
      texture: 'Película analógica 35mm fina, fumaça atmosférica e reflexos reais de lente',
      atmosphere: 'Envolvente, sofisticada, ritmada com a pulsação da música',
    };

    return { concept, visualBible, masterCharacter: project.masterCharacter || null };
  }

  private static fallbackStoryboard(
    project: Project,
    concept: ClipConcept,
    visualBible: VisualBible,
    analysis: MusicalAnalysis
  ): Scene[] {
    const totalDuration = analysis.duration || 40;
    const sceneConfigs = [
      {
        section: 'Intro',
        portion: 0.18,
        goal: 'Estabelecer atmosfera misteriosa e capturar a atenção imediata nos primeiros 3 segundos.',
        visual: 'Plano detalhe cinematográfico do protagonista em penumbra, com olhar focado e feixe de luz lateral.',
        action: 'Respiração controlada, olhar que se volta lentamente em direção à fonte de luz.',
        camera: 'Travelling lento em aproximação (Slow Push-In Dolly)',
        lighting: 'Luz azul fria de recorte com sombras densas',
        transition: 'dissolve' as const,
      },
      {
        section: 'Verso 1 (Construção)',
        portion: 0.35,
        goal: 'Construir a inquietação e o conflito emocional enquanto os instrumentos entram na música.',
        visual: 'Plano médio do protagonista caminhando em ambiente arquitetônico minimalista com neblina ao chão.',
        action: 'Caminhada decidida, vento sutil movimentando o figurino e reflexos nas paredes.',
        camera: 'Steadicam lateral acompanhando o passo no ritmo do beat',
        lighting: 'Tungstênio quente contrastando com sombras azuladas',
        transition: 'cut' as const,
      },
      {
        section: 'Pré-Refrão (Tensão)',
        portion: 0.55,
        goal: 'Elevar a tensão visual no compasso que antecede a explosão sonora.',
        visual: 'Plano conjunto com espelhos ou partículas suspensas vibrando com a intensidade do som.',
        action: 'Protagonista para no centro do quadro, levantando o olhar para o horizonte.',
        camera: 'Dolly zoom vertiginoso (Vertigo effect)',
        lighting: 'Luzes pulsantes em contraluz',
        transition: 'flash_white' as const,
      },
      {
        section: 'Refrão (Impacto / Catarse)',
        portion: 0.80,
        goal: 'Explosão de energia visual em sincronia com o refrão principal.',
        visual: 'Plano aberto monumental com neons coloridos, tempestade de luz e movimento cinematográfico.',
        action: 'Performance expressiva, gestos dinâmicos e conexão direta com a música.',
        camera: 'Movimento orbital dinâmico 360° em alta velocidade',
        lighting: 'Explosão de tons magenta e ciano saturados',
        transition: 'cut' as const,
      },
      {
        section: 'Clímax & Desfecho',
        portion: 1.0,
        goal: 'Entregar a imagem mais memorável do videoclipe e fechar a narrativa com impacto poético.',
        visual: 'Grande plano geral ao amanhecer ou horizonte infinito com o protagonista em silhueta triunfante.',
        action: 'Sorriso sutil ou olhar definitivo para a lente enquanto o som se dissipa.',
        camera: 'Travelling recuado suave até plongée contemplativo',
        lighting: 'Golden hour dourada suave e flare poético',
        transition: 'fade' as const,
      },
    ];

    let lastEnd = 0;
    return sceneConfigs.map((cfg, idx) => {
      const start = lastEnd;
      const end = Math.round(totalDuration * cfg.portion);
      lastEnd = end;
      const duration = Math.max(3, end - start);

      const sceneLyrics = project.lyrics
        ? project.lyrics.split('\n').filter(l => l.trim() && !l.startsWith('[')).slice(idx * 2, idx * 2 + 2).join(' ')
        : `Trecho musical da seção ${cfg.section}`;

      return {
        id: `scene-${idx + 1}-${Date.now()}`,
        projectId: project.id,
        order: idx + 1,
        startTime: start,
        endTime: end,
        duration,
        musicSection: `${cfg.section} (${Math.floor(start / 60)}:${(start % 60).toString().padStart(2, '0')} - ${Math.floor(end / 60)}:${(end % 60).toString().padStart(2, '0')})`,
        lyricsSnippet: sceneLyrics,
        emotionalGoal: cfg.goal,
        description: cfg.visual,
        visualSubject: concept.characterSummary,
        characterAction: cfg.action,
        setting: visualBible.setting,
        cameraMovement: cfg.camera,
        lens: visualBible.lens,
        lighting: cfg.lighting,
        palette: visualBible.palette.join(', '),
        visualPrompt: `Cinematic frame for "${project.name}", Scene ${idx + 1}: ${cfg.visual}, ${cfg.lighting}, ${visualBible.style}`,
        videoPrompt: `Master camera take: ${cfg.camera}, ${cfg.action}, ${cfg.lighting}, photorealistic 8k film texture`,
        transition: cfg.transition,
        filter: 'cinematic_35mm',
        status: 'pending',
        motionStrength: idx === 3 ? 8 : 5,
      };
    });
  }
}
