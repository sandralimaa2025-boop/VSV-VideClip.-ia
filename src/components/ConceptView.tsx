/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Edit3,
  Film,
  Heart,
  Palette,
  Eye,
  Activity,
  Compass,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Project, ClipConcept, MusicalAnalysis, VisualBible } from '../types';

interface ConceptViewProps {
  project: Project;
  concept: ClipConcept;
  analysis: MusicalAnalysis | null;
  visualBible: VisualBible | null;
  onApproveConcept: () => void;
  onRegenerateConcept: () => void;
  onEditConcept: (updated: Partial<ClipConcept>) => void;
  isRegenerating?: boolean;
}

export const ConceptView: React.FC<ConceptViewProps> = ({
  project,
  concept,
  analysis,
  visualBible,
  onApproveConcept,
  onRegenerateConcept,
  onEditConcept,
  isRegenerating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(concept.title);
  const [editedStory, setEditedStory] = useState(concept.story);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);

  const handleSaveEdit = () => {
    onEditConcept({
      title: editedTitle,
      story: editedStory,
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn">
      {/* Master Header: "SEU CLIPE NASCEU AQUI" */}
      <div className="relative rounded-3xl bg-gradient-to-r from-violet-950/70 via-indigo-950/60 to-[#07070a] border border-violet-500/40 p-6 sm:p-8 space-y-4 glow-purple overflow-hidden">
        {/* Background glow orb */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/60 border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              Direção Criativa Aprovada pela IA
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
              SEU CLIPE NASCEU AQUI
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Conceito visual, narrativa e bíblia estética para <span className="text-violet-300 font-bold">"{project.name}"</span> por <span className="text-cyan-300">{project.artist}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-violet-400" />
              <span>{isEditing ? 'Cancelar Edição' : 'Ajustar Texto'}</span>
            </button>

            <button
              onClick={onRegenerateConcept}
              disabled={isRegenerating}
              className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Recriando...' : 'Regenerar Ideia'}</span>
            </button>
          </div>
        </div>

        {/* Concept Title & Logline */}
        <div className="space-y-3 pt-2">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-violet-500 text-white font-heading font-bold text-lg"
              />
              <textarea
                rows={4}
                value={editedStory}
                onChange={(e) => setEditedStory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-violet-500 text-white text-sm"
              />
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Salvar Ajustes
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-cyan-300">
                “{concept.title}”
              </h2>
              <p className="text-sm sm:text-base text-zinc-200 font-medium italic border-l-2 border-pink-500 pl-4 py-1">
                {concept.logline}
              </p>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-2">
                {concept.story}
              </p>
            </>
          )}
        </div>

        {/* Alfinete no Mapa Alignment */}
        {concept.alfineteAlignment && (
          <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-200">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{concept.alfineteAlignment}</span>
          </div>
        )}
      </div>

      {/* Grid of Concept Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Emotion & Visual Palette */}
        <div className="md:col-span-6 space-y-6">
          {/* Emotion & Tone Card */}
          <div className="p-5 rounded-2xl bg-[#0a0a0e] border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2 text-pink-400">
              <Heart className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-zinc-200">
                Trajetória Emocional & Clima
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Sentimento Principal
                </span>
                <span className="inline-block px-3 py-1.5 rounded-lg bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-bold">
                  {concept.mainEmotion}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Subtonalidades Sensoriais
                </span>
                <div className="flex flex-wrap gap-2">
                  {concept.secondaryEmotions.map((emo, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs"
                    >
                      {emo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette Card */}
          <div className="p-5 rounded-2xl bg-[#0a0a0e] border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2 text-violet-400">
              <Palette className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-zinc-200">
                Paleta Cromática do Videoclipe
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {concept.palette.map((color, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 flex flex-col items-center text-center"
                >
                  <div
                    className="w-10 h-10 rounded-lg shadow-md border border-white/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <span className="text-[11px] font-bold text-zinc-200 block truncate max-w-[90px]">
                      {color.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{color.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aesthetic & Camera notes */}
          <div className="p-5 rounded-2xl bg-[#0a0a0e] border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Eye className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-zinc-200">
                Direção de Fotografia & Lentes
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {concept.aesthetic}
            </p>
            {visualBible?.lens && (
              <div className="text-[11px] text-violet-300 font-mono bg-violet-950/40 p-2.5 rounded-lg border border-violet-800/30">
                🎥 Lente recomendada: {visualBible.lens}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Symbols, Scenes & Narrative Milestones */}
        <div className="md:col-span-6 space-y-6">
          {/* Visual Symbols & Metaphors */}
          <div className="p-5 rounded-2xl bg-[#0a0a0e] border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-zinc-200">
                Metáforas Visuais & Símbolos
              </h3>
            </div>

            <div className="space-y-2.5">
              {concept.visualSymbols.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1"
                >
                  <span className="text-xs font-bold text-amber-300 block">{item.symbol}</span>
                  <p className="text-xs text-zinc-300">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Climax & Ending */}
          <div className="p-5 rounded-2xl bg-[#0a0a0e] border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Film className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-zinc-200">
                Clímax & Imagem Final
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-900/40">
                <span className="font-bold text-violet-300 block mb-1">🔥 Momento de Maior Impacto (Refrão):</span>
                <p className="text-zinc-300">{concept.peakImpactMoment}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <span className="font-bold text-zinc-300 block mb-1">🎬 Desfecho / Quadro Final:</span>
                <p className="text-zinc-400">{concept.ending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Musical Timeline & Energy Curve Toggle */}
      {analysis && (
        <div className="p-5 rounded-2xl bg-[#0a0a0e] border border-zinc-800/80 space-y-4">
          <button
            onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2 text-cyan-400">
              <Activity className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-zinc-200">
                Curva de Energia & Mapa Rítmico da Música ({analysis.duration}s • ~{analysis.bpm} BPM)
              </h3>
            </div>
            {showAnalysisDetails ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Mini energy graph */}
          <div className="space-y-2">
            <div className="h-16 bg-black/60 rounded-xl p-3 flex items-end justify-between gap-1.5 border border-zinc-800">
              {(analysis.energyCurve || [20, 40, 60, 80, 95, 85, 50, 30]).map((lvl, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-cyan-400"
                    style={{ height: `${lvl}%` }}
                  />
                  <span className="text-[9px] font-mono text-zinc-500">{lvl}%</span>
                </div>
              ))}
            </div>
          </div>

          {showAnalysisDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 animate-fadeIn">
              {analysis.emotionalTimeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1"
                >
                  <span className="text-[10px] font-bold text-cyan-400 block">{item.stage}</span>
                  <span className="text-[9px] font-mono text-zinc-400 block">{item.timeRange}</span>
                  <p className="text-[10px] text-zinc-300 leading-tight">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Primary Decision Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-cyan-950/30 border border-violet-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 glow-purple">
        <div>
          <h4 className="font-heading font-black text-lg text-white">
            Gostou do conceito cinematográfico?
          </h4>
          <p className="text-xs text-zinc-300">
            Aprovar este conceito irá estruturar o Storyboard cena a cena e sincronizar com o áudio.
          </p>
        </div>

        <button
          type="button"
          onClick={onApproveConcept}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-sm font-black font-heading text-white flex items-center gap-2 shadow-xl shadow-violet-950/70 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <span>APROVAR CONCEITO & GERAR STORYBOARD</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
