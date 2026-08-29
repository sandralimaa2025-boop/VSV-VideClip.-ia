/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioFileData, MusicalAnalysis, CharacterBible } from '../types';

export interface SampleSong {
  id: string;
  name: string;
  artist: string;
  genre: string;
  meaning: string;
  songMeaning?: string;
  emotionalIntent: string;
  visualStyles: string[];
  visualReference: string;
  dominantColors: string[];
  universeInspiration: string;
  alfineteNoMapa: string;
  lyrics: string;
  audioData: AudioFileData;
  presetAnalysis: MusicalAnalysis;
  masterCharacter?: CharacterBible | null;
}

// Generate synthesized audio tone buffer data URL for realistic instant playback without external hosting dependencies
export function createSynthesizedAudioDataUrl(
  type: 'synthwave' | 'indie' | 'trap',
  durationSec: number = 40
): string {
  try {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * durationSec);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV Header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate melodious musical chord progression
    const bpm = type === 'synthwave' ? 120 : type === 'trap' ? 140 : 90;
    const beatDuration = 60 / bpm;

    // Chords (Frequencies in Hz)
    const progressions = {
      synthwave: [
        [220.0, 261.63, 329.63], // Am
        [174.61, 220.0, 261.63], // F
        [130.81, 164.81, 196.0],  // C
        [196.0, 246.94, 293.66],  // G
      ],
      indie: [
        [261.63, 329.63, 392.0],  // C
        [220.0, 261.63, 329.63], // Am
        [174.61, 220.0, 261.63], // F
        [196.0, 246.94, 293.66],  // G
      ],
      trap: [
        [146.83, 174.61, 220.0],  // Dm
        [130.81, 164.81, 196.0],  // C
        [116.54, 146.83, 174.61], // Bb
        [164.81, 207.65, 246.94], // A
      ],
    };

    const chords = progressions[type];
    let offset = 44;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = t / beatDuration;
      const chordIndex = Math.floor(beat / 4) % chords.length;
      const currentChord = chords[chordIndex];

      let sample = 0;

      // Arpeggiate chord notes
      const noteIdx = Math.floor((beat * 2) % currentChord.length);
      const freq = currentChord[noteIdx];
      const bassFreq = currentChord[0] / 2;

      // Synthwave / Indie / Trap tone sculpting
      if (type === 'synthwave') {
        const lead = Math.sin(2 * Math.PI * freq * t) * 0.25;
        const sub = Math.sin(2 * Math.PI * bassFreq * t) * 0.35;
        const kickEnv = Math.exp(-((beat % 1) * 8));
        const kick = Math.sin(2 * Math.PI * 60 * (1 - (beat % 1)) * t) * kickEnv * 0.4;
        sample = lead + sub + kick;
      } else if (type === 'trap') {
        const bell = Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-((beat % 0.5) * 4)) * 0.3;
        const sub808 = Math.sin(2 * Math.PI * (bassFreq * 0.75) * t) * 0.45;
        const hihat = (Math.random() * 2 - 1) * Math.exp(-((beat % 0.25) * 16)) * 0.15;
        sample = bell + sub808 + hihat;
      } else {
        // Acoustic indie guitar-like plucked timbre
        const pluck = (Math.sin(2 * Math.PI * freq * t) + 0.5 * Math.sin(4 * Math.PI * freq * t)) *
          Math.exp(-((beat % 2) * 2)) * 0.4;
        const warmBass = Math.sin(2 * Math.PI * bassFreq * t) * 0.25;
        sample = pluck + warmBass;
      }

      // Clamp to 16-bit PCM range
      const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 16000)));
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Failed to create synthesized audio', e);
    return '';
  }
}

export const SAMPLE_SONGS: SampleSong[] = [
  {
    id: 'sample-1',
    name: 'Midnight Neon Echoes',
    artist: 'Luna Vex',
    genre: 'Synthwave / Cyberpop',
    meaning: 'A busca por conexão humana em uma metrópole futurista hiperconectada e solitária.',
    songMeaning: 'A busca por conexão humana em uma metrópole futurista hiperconectada e solitária.',
    emotionalIntent: 'Nostalgia melancólica que explode em adrenalina e esperança.',
    visualStyles: ['Cinematográfico', 'Futurista', 'Sombrio', 'Urbano'],
    visualReference: 'Blade Runner 2049, Drive, cyberpunk estilizado com iluminação volumétrica e chuva refletida no asfalto.',
    dominantColors: ['#06b6d4', '#d946ef', '#1e1b4b', '#0f172a'],
    universeInspiration: 'Tóquio 2099, hologramas flutuantes, arranha-céus infinitos, carros flutuantes e becos com neblina.',
    alfineteNoMapa: 'Um videoclipe cyberpunk onde a tecnologia revela a vulnerabilidade humana.',
    masterCharacter: {
      id: 'char-sample-1',
      name: 'Elena / A Mensageira da Noite',
      age: '23',
      appearance: 'Traços marcantes e olhar penetrante',
      outfit: 'Jaqueta bomber holográfica fosca com gola alta e calça preta tática',
      personality: 'Intensa, corajosa e melancólica',
      keyFeatures: 'Delineado ciano brilhante sob os olhos, cabelo curto platinado com pontas azuis',
      face: 'Rosto anguloso, pele clara com reflexos de neon',
      hair: 'Cabelo curto platinado com mechas ciano',
      eyes: 'Olhos castanhos profundos',
      skinTone: 'Claro com iluminação fria',
      bodyType: 'Atlético',
      accessories: 'Pingente de prisma de vidro e luvas sem dedos',
    },
    lyrics: `[Intro - 00:00]
(Luzes de neon piscam no vidro molhado)
O silêncio ecoa na avenida vazia...

[Verso 1 - 00:08]
Tantos sinais no ar, frequências sem calor
Caminho entre sombras buscando o teu amor
Reflexos de mercúrio nos olhos de vidro
Perdido na rede, mas ainda te sinto

[Refrão - 00:22]
Acenda os neons da noite!
Deixe a cidade queimar em azul e carmim
Se a gravidade falhar no horizonte
Segure minha mão antes do fim!

[Clímax / Outro - 00:34]
Sob a chuva de luzes elétricas...
Somos reais.`,
    audioData: {
      name: 'Midnight_Neon_Echoes_Luna_Vex.wav',
      size: 1764000,
      duration: 42,
      url: '', // populated at runtime with synth audio
      mimeType: 'audio/wav',
      sampleTrackId: 'synthwave',
      waveformPeaks: [0.15, 0.22, 0.35, 0.48, 0.42, 0.65, 0.82, 0.95, 0.88, 0.72, 0.60, 0.30],
    },
    presetAnalysis: {
      duration: 42,
      bpm: 120,
      detectedGenre: 'Synthwave / Cyberpop',
      overallMood: 'Nostalgia eletrizante e futurista',
      energyCurve: [20, 35, 55, 70, 95, 88, 65, 30],
      emotionalTimeline: [
        { stage: 'INTRO', timeRange: '00:00 - 00:08', description: 'Atmosfera densa de isolamento urbano' },
        { stage: 'CONSTRUÇÃO', timeRange: '00:08 - 00:16', description: 'Despertar de inquietação e movimento' },
        { stage: 'TENSÃO', timeRange: '00:16 - 00:22', description: 'Aceleração do ritmo cardíaco e dos sintetizadores' },
        { stage: 'REFRÃO', timeRange: '00:22 - 00:32', description: 'Explosão de neons e catarse visual' },
        { stage: 'CLÍMAX', timeRange: '00:32 - 00:38', description: 'Momento de revelação e conexão' },
        { stage: 'DESFECHO', timeRange: '00:38 - 00:42', description: 'Respiro poético e horizonte infinito' },
      ],
      keyHitMoments: [8.0, 16.0, 22.0, 32.0, 38.0],
      sections: [
        { name: 'Intro', startTime: 0, endTime: 8, energyLevel: 'low', suggestedPacing: 'lento', lyricSnippet: 'O silêncio ecoa na avenida vazia...' },
        { name: 'Verso 1', startTime: 8, endTime: 22, energyLevel: 'building', suggestedPacing: 'moderado', lyricSnippet: 'Tantos sinais no ar, frequências sem calor...' },
        { name: 'Refrão', startTime: 22, endTime: 34, energyLevel: 'peak', suggestedPacing: 'dinâmico', lyricSnippet: 'Acenda os neons da noite! Deixe a cidade queimar...' },
        { name: 'Clímax & Outro', startTime: 34, endTime: 42, energyLevel: 'high', suggestedPacing: 'lento', lyricSnippet: 'Sob a chuva de luzes elétricas... Somos reais.' },
      ],
    },
  },
  {
    id: 'sample-2',
    name: 'Chuva na Janela da Memória',
    artist: 'Gabriel Marés',
    genre: 'MPB / Indie Acústico',
    meaning: 'A despedida inevitável de um grande amor de juventude e a aceitação serena do tempo.',
    songMeaning: 'A despedida inevitável de um grande amor de juventude e a aceitação serena do tempo.',
    emotionalIntent: 'Poesia suave, aconchego, sensação agridoce de saudade acolhedora.',
    visualStyles: ['Cinematográfico', 'Vintage', 'Romântico', 'Storytelling'],
    visualReference: 'Cinematografia de Wong Kar-wai (In the Mood for Love), luz dourada de fim de tarde e filme analógico 35mm com grão sutil.',
    dominantColors: ['#d97706', '#92400e', '#0f766e', '#fef3c7'],
    universeInspiration: 'Um casarão antigo de madeira com janelas de vidro canelado, xícaras de café fumegantes e cartas antigas.',
    alfineteNoMapa: 'Pequenos detalhes cotidianos transformados em poesia visual cinematográfica.',
    masterCharacter: {
      id: 'char-sample-2',
      name: 'Gabriel / O Músico Solitário',
      age: '27',
      appearance: 'Sensível, olhar sereno e expressivo',
      outfit: 'Suéter de lã crua vintage, calça de sarja cáqui e violão acústico de madeira maciça',
      personality: 'Introspectivo, poético e acolhedor',
      keyFeatures: 'Óculos de armação redonda tartaruga fina e mãos calejadas de cordas',
      face: 'Traços suaves com barba por fazer rala',
      hair: 'Cabelo castanho ondulado e natural',
      eyes: 'Castanho-mel',
      skinTone: 'Moreno claro banhado por luz dourada',
      bodyType: 'Esbelto',
      accessories: 'Caderno de capa de couro com anotações à mão',
    },
    lyrics: `[Intro - 00:00]
O café esfriou na mesa posta...
O vento balança a cortina de linho.

[Verso 1 - 00:08]
Gotas desenham caminhos no vidro
Lembranças que o tempo teima em guardar
Teu riso ecoava em cada canto antigo
Hoje o silêncio aprendeu a dançar

[Refrão - 00:20]
Se a tempestade lavar as calçadas
Vou guardar tua voz no peito
Mesmo que a vida mude de estrada
O que foi verdadeiro não tem defeito

[Clímax / Outro - 00:32]
O sol reaparece dourado na janela.`,
    audioData: {
      name: 'Chuva_na_Janela_Gabriel_Mares.wav',
      size: 1587600,
      duration: 38,
      url: '',
      mimeType: 'audio/wav',
      sampleTrackId: 'indie',
      waveformPeaks: [0.10, 0.18, 0.25, 0.32, 0.40, 0.55, 0.62, 0.58, 0.45, 0.35, 0.20, 0.10],
    },
    presetAnalysis: {
      duration: 38,
      bpm: 90,
      detectedGenre: 'MPB / Indie Acústico',
      overallMood: 'Nostalgia intimista e calorosa',
      energyCurve: [15, 25, 40, 60, 75, 68, 45, 20],
      emotionalTimeline: [
        { stage: 'INTRO', timeRange: '00:00 - 00:08', description: 'Intimidade silenciosa de um quarto acolhedor' },
        { stage: 'CONSTRUÇÃO', timeRange: '00:08 - 00:15', description: 'Recordações ganham vida através de objetos' },
        { stage: 'TENSÃO', timeRange: '00:15 - 00:20', description: 'O peso da ausência antes da aceitação' },
        { stage: 'REFRÃO', timeRange: '00:20 - 00:30', description: 'Crescendo emocional lírico com violão e cordas' },
        { stage: 'CLÍMAX', timeRange: '00:30 - 00:34', description: 'Luz dourada banhando o ambiente' },
        { stage: 'DESFECHO', timeRange: '00:34 - 00:38', description: 'Paz e sorriso sutil de quem amou de verdade' },
      ],
      keyHitMoments: [8.0, 15.0, 20.0, 30.0],
      sections: [
        { name: 'Intro', startTime: 0, endTime: 8, energyLevel: 'low', suggestedPacing: 'lento', lyricSnippet: 'O café esfriou na mesa posta...' },
        { name: 'Verso 1', startTime: 8, endTime: 20, energyLevel: 'building', suggestedPacing: 'moderado', lyricSnippet: 'Gotas desenham caminhos no vidro...' },
        { name: 'Refrão', startTime: 20, endTime: 32, energyLevel: 'peak', suggestedPacing: 'moderado', lyricSnippet: 'Se a tempestade lavar as calçadas...' },
        { name: 'Clímax & Outro', startTime: 32, endTime: 38, energyLevel: 'calm', suggestedPacing: 'lento', lyricSnippet: 'O sol reaparece dourado na janela.' },
      ],
    },
  },
  {
    id: 'sample-3',
    name: 'Sombras de Titânio',
    artist: 'KRONOS feat. Maya',
    genre: 'Trap / Hip-Hop Cinematográfico',
    meaning: 'Superação, resiliência nas ruas e a construção do próprio legado contra todas as probabilidades.',
    songMeaning: 'Superação, resiliência nas ruas e a construção do próprio legado contra todas as probabilidades.',
    emotionalIntent: 'Poder, intensidade bruta, determinação inabalável e elegância urbana.',
    visualStyles: ['Cinematográfico', 'Urbano', 'Sombrio', 'Fashion'],
    visualReference: 'Estética de videoclipes da A$AP Rocky e The Weeknd, contraste alto, fumaça, reflexos em carros pretos de luxo e joias de prata sob luz de tungstênio.',
    dominantColors: ['#000000', '#71717a', '#dc2626', '#e4e4e7'],
    universeInspiration: 'Hangar subterrâneo, viadutos de concreto brutalista à noite, luz estroboscópica e silhuetas marcantes.',
    alfineteNoMapa: 'Música urbana com estética cinematográfica de alta costura.',
    masterCharacter: {
      id: 'char-sample-3',
      name: 'KRONOS / O Visionário do Asfalto',
      age: '25',
      appearance: 'Presença imponente e olhar penetrante',
      outfit: 'Casaco de couro preto oversized com corte de alfaiataria, correntes de prata e anéis esculpidos',
      personality: 'Focado, magnético, dominante e obstinado',
      keyFeatures: 'Tatuagem geométrica no pescoço e postura cinematográfica imponente',
      face: 'Mandíbula esculpida, iluminação de alto contraste lateral',
      hair: 'Tranças nagô desenhadas com precisão',
      eyes: 'Castanho escuro intenso',
      skinTone: 'Negro com brilho suave de suor e luz de tungstênio',
      bodyType: 'Atlético e esguio',
      accessories: 'Óculos escuros retangulares sem aro e correntes pesadas de prata 925',
    },
    lyrics: `[Intro - 00:00]
(Sirenes ao longe, batida pesada de 808 iniciando)
Eles acharam que eu ia cair...

[Verso 1 - 00:08]
Forjado no fogo, blindado de aço
Passo firme no escuro sem errar o compasso
Olham meu trono mas não viram a subida
Cada cicatriz virou diamante nessa vida

[Refrão - 00:20]
Coroa pesada, postura de rei!
Quebraram as regras que eu mesmo criei
Do asfalto ao topo, sem pedir perdão
Minha história tá gravada em titânio no chão!

[Clímax / Outro - 00:32]
Titânio não quebra.`,
    audioData: {
      name: 'Sombras_de_Titanio_KRONOS.wav',
      size: 1675800,
      duration: 40,
      url: '',
      mimeType: 'audio/wav',
      sampleTrackId: 'trap',
      waveformPeaks: [0.20, 0.35, 0.50, 0.65, 0.85, 0.98, 0.95, 0.90, 0.75, 0.80, 0.50, 0.25],
    },
    presetAnalysis: {
      duration: 40,
      bpm: 140,
      detectedGenre: 'Trap / Hip-Hop Cinematográfico',
      overallMood: 'Poder impactante e sofisticação urbana',
      energyCurve: [25, 45, 65, 80, 100, 95, 80, 40],
      emotionalTimeline: [
        { stage: 'INTRO', timeRange: '00:00 - 00:08', description: 'Tensão iminente em silhueta contra fumaça' },
        { stage: 'CONSTRUÇÃO', timeRange: '00:08 - 00:16', description: 'Caminhada decidida com close dinâmico' },
        { stage: 'TENSÃO', timeRange: '00:16 - 00:20', description: 'Corte rápido e subgrave carregando' },
        { stage: 'REFRÃO', timeRange: '00:20 - 00:30', description: 'Drop colossal com luzes estroboscópicas e fogo frio' },
        { stage: 'CLÍMAX', timeRange: '00:30 - 00:36', description: 'Plano geral épico no topo da cidade' },
        { stage: 'DESFECHO', timeRange: '00:36 - 00:40', description: 'Olhar direto para a câmera, congelamento cinematográfico' },
      ],
      keyHitMoments: [8.0, 16.0, 20.0, 30.0, 36.0],
      sections: [
        { name: 'Intro', startTime: 0, endTime: 8, energyLevel: 'building', suggestedPacing: 'moderado', lyricSnippet: 'Eles acharam que eu ia cair...' },
        { name: 'Verso 1', startTime: 8, endTime: 20, energyLevel: 'high', suggestedPacing: 'dinâmico', lyricSnippet: 'Forjado no fogo, blindado de aço...' },
        { name: 'Refrão', startTime: 20, endTime: 32, energyLevel: 'peak', suggestedPacing: 'dinâmico', lyricSnippet: 'Coroa pesada, postura de rei! Quebraram as regras...' },
        { name: 'Clímax & Outro', startTime: 32, endTime: 40, energyLevel: 'high', suggestedPacing: 'moderado', lyricSnippet: 'Titânio não quebra.' },
      ],
    },
  },
];
