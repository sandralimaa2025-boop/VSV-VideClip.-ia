/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Film,
  User,
  Palette,
  Layers,
  Compass,
  Check,
  Wand2,
  Tv,
  Smartphone,
  Instagram,
  Square,
  HelpCircle,
} from 'lucide-react';
import { Project, AspectRatio, DurationMode, CharacterBible } from '../types';

interface CreationFormProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onSubmitForAnalysis: () => void;
  onBackToAudio: () => void;
  isAnalyzing: boolean;
  analysisStageMessage: string;
}

export const CreationForm: React.FC<CreationFormProps> = ({
  project,
  onUpdateProject,
  onSubmitForAnalysis,
  onBackToAudio,
  isAnalyzing,
  analysisStageMessage,
}) => {
  const [subStep, setSubStep] = useState<1 | 2 | 3 | 4>(1);

  // Available Visual Styles for selection
  const visualStyleOptions = [
    'Cinematográfico',
    'Realista',
    'Ultra-realista',
    'Fashion',
    'Urbano',
    'Romântico',
    'Sombrio',
    'Futurista',
    'Vintage',
    'Retrô',
    'Fantasia',
    'Surrealista',
    'Anime',
    'Documental',
    'Performance musical',
    'Storytelling',
  ];

  // Color preset tags
  const colorPresetOptions = [
    { label: 'Ciano & Magenta Neon', colors: ['#06b6d4', '#d946ef', '#1e1b4b'] },
    { label: 'Golden Hour & Âmbar Vintage', colors: ['#d97706', '#92400e', '#fef3c7'] },
    { label: 'Noir & Chiaroscuro Monocromático', colors: ['#000000', '#52525b', '#f4f4f5'] },
    { label: 'Teal & Orange Hollywoodiano', colors: ['#0d9488', '#ea580c', '#111827'] },
    { label: 'Esmeralda & Verde Floresta', colors: ['#059669', '#064e3b', '#a7f3d0'] },
    { label: 'Vermelho Bordô, Preto & Branco', colors: ['#800020', '#000000', '#ffffff'] },
  ];

  // Alfinete no mapa suggestions
  const alfineteSuggestions = [
    '“Histórias de amor que parecem filmes.”',
    '“Videoclipes que transformam sentimentos em imagens.”',
    '“Música urbana com estética cinematográfica.”',
    '“Canções comuns transformadas em pequenas histórias.”',
    '“Um choque visual futurista com ressonância poética.”',
  ];

  const toggleStyle = (style: string) => {
    const current = project.visualStyles || [];
    if (current.includes(style)) {
      onUpdateProject({ visualStyles: current.filter((s) => s !== style) });
    } else {
      onUpdateProject({ visualStyles: [...current, style] });
    }
  };

  const handleCharacterChange = (field: keyof CharacterBible, value: string) => {
    const currentMaster = project.masterCharacter || {
      id: `char-${Date.now()}`,
      name: 'Protagonista',
      age: '24',
      appearance: '',
      outfit: '',
      personality: '',
      keyFeatures: '',
      face: '',
      hair: '',
      eyes: '',
      skinTone: '',
      bodyType: '',
      accessories: '',
    };

    onUpdateProject({
      masterCharacter: {
        ...currentMaster,
        [field]: value,
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 space-y-8">
      {/* Sub-step indicator */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
            Passo 1 de 6 • Pré-Produção
          </span>
          <h2 className="text-2xl font-bold font-heading text-white">
            {subStep === 1 && 'Etapa 1: Identidade da Música'}
            {subStep === 2 && 'Etapa 2: Direção Artística & Estética'}
            {subStep === 3 && 'Etapa 3: Ficha do Personagem-Mestre'}
            {subStep === 4 && 'Etapa 4: Formato & Alfinete no Mapa'}
          </h2>
        </div>

        {/* Mini tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          {[1, 2, 3, 4].map((stepNum) => (
            <button
              key={stepNum}
              type="button"
              onClick={() => setSubStep(stepNum as 1 | 2 | 3 | 4)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                subStep === stepNum
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {stepNum}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Overlay if AI Director is analyzing */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-[#050505]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-bold font-heading text-white">O Diretor IA está criando seu videoclipe...</h3>
            <p className="text-sm text-violet-300 font-medium animate-pulse">{analysisStageMessage}</p>
            <p className="text-xs text-zinc-400 pt-2">
              Analisando sentimentos, harmonia, arcos visuais e alinhando com o seu Alfinete no Mapa.
            </p>
          </div>
        </div>
      )}

      {/* Form Steps */}
      <div className="space-y-6">
        {/* ================= ETAPA 1 ================= */}
        {subStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Nome da Música <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => onUpdateProject({ name: e.target.value })}
                  placeholder="Ex: Luzes da Noite"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-zinc-800 focus:border-violet-500 focus:outline-none text-white text-sm font-medium transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Artista / Banda <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  value={project.artist}
                  onChange={(e) => onUpdateProject({ artist: e.target.value })}
                  placeholder="Ex: Gabriel & Os Lunares"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-zinc-800 focus:border-violet-500 focus:outline-none text-white text-sm font-medium transition-colors"
                />
              </div>
            </div>

            {/* Lyrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Letra da Música
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!project.hasLyrics}
                    onChange={(e) => onUpdateProject({ hasLyrics: !e.target.checked })}
                    className="rounded border-zinc-700 text-violet-600 focus:ring-violet-500 bg-zinc-900"
                  />
                  <span>Não tenho a letra (música instrumental ou análise sonora)</span>
                </label>
              </div>

              {project.hasLyrics && (
                <textarea
                  rows={6}
                  value={project.lyrics}
                  onChange={(e) => onUpdateProject({ lyrics: e.target.value })}
                  placeholder="Cole aqui a letra da música..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-zinc-800 focus:border-violet-500 focus:outline-none text-white text-sm font-mono leading-relaxed transition-colors"
                />
              )}
            </div>

            {/* Meaning & Emotion */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Conte em poucas palavras o que essa música significa para você:
                </label>
                <textarea
                  rows={2}
                  value={project.songMeaning}
                  onChange={(e) => onUpdateProject({ songMeaning: e.target.value })}
                  placeholder="Ex: É uma canção sobre superar um momento difícil e reencontrar a própria força na cidade grande..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-zinc-800 focus:border-violet-500 focus:outline-none text-white text-sm transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Qual sentimento você quer deixar em quem assistir ao videoclipe?
                </label>
                <input
                  type="text"
                  value={project.emotionalIntent}
                  onChange={(e) => onUpdateProject({ emotionalIntent: e.target.value })}
                  placeholder="Ex: Arrepios, nostalgia doce, adrenalina pura, esperança inabalável..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-zinc-800 focus:border-violet-500 focus:outline-none text-white text-sm transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ETAPA 2 ================= */}
        {subStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Visual Styles Multi-select */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                Qual estilo visual você deseja? (Pode selecionar múltiplos)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {visualStyleOptions.map((style) => {
                  const isSelected = (project.visualStyles || []).includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all text-left ${
                        isSelected
                          ? 'bg-gradient-to-r from-violet-950/80 to-indigo-950/80 border-violet-500 text-white shadow-md shadow-violet-950/60'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span>{style}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual References */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                Descreva uma referência visual para o clipe:
              </label>
              <input
                type="text"
                value={project.visualReference}
                onChange={(e) => onUpdateProject({ visualReference: e.target.value })}
                placeholder="Ex: Iluminação volumétrica de Blade Runner 2049, fotografia de Euphoria, filme 35mm granulado..."
                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-zinc-800 focus:border-violet-500 focus:outline-none text-white text-sm transition-colors"
              />
            </div>

            {/* Dominant Colors Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                Quais cores devem dominar o videoclipe?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colorPresetOptions.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdateProject({ dominantColors: preset.colors })}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all ${
                      JSON.stringify(project.dominantColors) === JSON.stringify(preset.colors)
                        ? 'bg-violet-950/40 border-violet-500 text-white glow-purple'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-medium">{preset.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {preset.colors.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Universe & Aesthetic Inspiration */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                Existe algum filme, estética, época ou universo visual que inspira o clipe?
              </label>
              <input
                type="text"
                value={project.universeInspiration}
                onChange={(e) => onUpdateProject({ universeInspiration: e.target.value })}
                placeholder="Ex: Anos 80, ficção científica retrô, casarão colonial, metrópole chuvosa de madrugada..."
                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-zinc-800 focus:border-violet-500 focus:outline-none text-white text-sm transition-colors"
              />
              <p className="text-[11px] text-zinc-500">
                Nota: O CLIPE AI usa referências como inspiração de direção de arte, sem violar marcas ou direitos autorais.
              </p>
            </div>
          </div>
        )}

        {/* ================= ETAPA 3 ================= */}
        {subStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Character selection mode */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                O videoclipe terá personagem principal?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'sim', label: 'Sim, quero detalhar' },
                  { value: 'ia_cria', label: 'Quero que a IA crie' },
                  { value: 'artista', label: 'O próprio artista' },
                  { value: 'nao', label: 'Não (Abstrato / Cênico)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onUpdateProject({
                        hasMainCharacter: opt.value as 'sim' | 'nao' | 'artista' | 'ia_cria',
                      })
                    }
                    className={`p-3.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      project.hasMainCharacter === opt.value
                        ? 'bg-violet-950/80 border-violet-500 text-white glow-purple'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Master Character Sheet */}
            {project.hasMainCharacter !== 'nao' && (
              <div className="bg-[#0c0c10] border border-violet-900/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-400">
                    <User className="w-4 h-4 text-pink-400" />
                    <h4 className="font-heading font-bold text-sm text-zinc-100">
                      FICHA DO PERSONAGEM-MESTRE (Continuidade Visual)
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-950 border border-violet-700/40 text-violet-300">
                    Bíblia de Elenco
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Todas as cenas geradas utilizarão essas características como âncora para garantir consistência estética.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400">Nome / Arquétipo</label>
                    <input
                      type="text"
                      value={project.masterCharacter?.name || ''}
                      onChange={(e) => handleCharacterChange('name', e.target.value)}
                      placeholder="Ex: Elena / O Viajante Noturno"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400">Idade Aparente</label>
                    <input
                      type="text"
                      value={project.masterCharacter?.age || ''}
                      onChange={(e) => handleCharacterChange('age', e.target.value)}
                      placeholder="Ex: 24 anos"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400">Rosto e Expressão</label>
                    <input
                      type="text"
                      value={project.masterCharacter?.face || ''}
                      onChange={(e) => handleCharacterChange('face', e.target.value)}
                      placeholder="Ex: Traços marcantes, olhar enigmático e profundo"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400">Cabelo & Olhos</label>
                    <input
                      type="text"
                      value={project.masterCharacter?.hair || ''}
                      onChange={(e) => handleCharacterChange('hair', e.target.value)}
                      placeholder="Ex: Cabelo preto ondulado na altura dos ombros, olhos castanho-claros"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-400">Figurino / Roupas Principais</label>
                    <input
                      type="text"
                      value={project.masterCharacter?.outfit || ''}
                      onChange={(e) => handleCharacterChange('outfit', e.target.value)}
                      placeholder="Ex: Sobretudo escuro de couro fosco com gola alta e anéis de prata"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-400">Características Únicas & Acessórios</label>
                    <input
                      type="text"
                      value={project.masterCharacter?.keyFeatures || ''}
                      onChange={(e) => handleCharacterChange('keyFeatures', e.target.value)}
                      placeholder="Ex: Pequena cicatriz na sobrancelha direita, pingente de ampulheta no pescoço"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ETAPA 4 ================= */}
        {subStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Format (Aspect Ratio) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                Formato do Videoclipe
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: '16:9', label: 'YouTube / Cinema (16:9)', icon: Tv },
                  { value: '9:16', label: 'TikTok / Reels (9:16)', icon: Smartphone },
                  { value: '4:5', label: 'Instagram Feed (4:5)', icon: Instagram },
                  { value: '1:1', label: 'Quadrado (1:1)', icon: Square },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = project.aspectRatio === fmt.value;
                  return (
                    <button
                      key={fmt.value}
                      type="button"
                      onClick={() => onUpdateProject({ aspectRatio: fmt.value as AspectRatio })}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-violet-950/80 border-violet-500 text-white glow-purple'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`} />
                      <span className="text-xs font-bold text-center">{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Mode */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
                Modo de Duração
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'full', label: 'Clipe Completo', desc: 'Sincronizado com a música inteira' },
                  { value: 'teaser_30', label: 'Teaser Cinematográfico (30s)', desc: 'Cortes rápidos dos momentos épicos' },
                  { value: 'teaser_15', label: 'Versão Curta Redes (15s)', desc: 'Foco no refrão para viralizar' },
                ].map((dur) => (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => onUpdateProject({ durationMode: dur.value as DurationMode })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      project.durationMode === dur.value
                        ? 'bg-violet-950/60 border-violet-500 text-white'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-zinc-200 block">{dur.label}</span>
                    <span className="text-[11px] text-zinc-400">{dur.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ALFINETE NO MAPA */}
            <div className="bg-gradient-to-tr from-violet-950/40 via-indigo-950/40 to-cyan-950/30 border border-violet-500/40 rounded-2xl p-6 space-y-4 glow-purple">
              <div className="flex items-center gap-2 text-cyan-300">
                <Compass className="w-5 h-5" />
                <h4 className="font-heading font-black text-base text-white tracking-wide">
                  ALFINETE NO MAPA — O Norte Criativo do Seu Clipe
                </h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Pelo que você quer que esse videoclipe seja lembrado? Esse conceito será o guia para toda a narrativa, escolha de lentes e metáforas visuais da IA.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={project.alfineteNoMapa}
                  onChange={(e) => onUpdateProject({ alfineteNoMapa: e.target.value })}
                  placeholder="Ex: Videoclipes que transformam sentimentos em imagens inesquecíveis."
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-violet-500/50 focus:border-cyan-400 focus:outline-none text-white text-sm font-semibold transition-colors"
                />

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider block">
                    Sugestões de posicionamento do Diretor:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {alfineteSuggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => onUpdateProject({ alfineteNoMapa: sug })}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-violet-950/60 border border-zinc-700 hover:border-violet-500/40 text-[11px] text-zinc-300 transition-colors text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={() => {
            if (subStep === 1) {
              onBackToAudio();
            } else {
              setSubStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {subStep < 4 ? (
          <button
            type="button"
            onClick={() => setSubStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-violet-950/40 transition-all active:scale-95"
          >
            <span>Próxima Etapa</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmitForAnalysis}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-sm font-black font-heading text-white flex items-center gap-2.5 shadow-xl shadow-violet-950/70 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Wand2 className="w-5 h-5 text-amber-300" />
            <span>INVOCAR DIRETOR IA & CRIAR CONCEITO</span>
          </button>
        )}
      </div>
    </div>
  );
};
