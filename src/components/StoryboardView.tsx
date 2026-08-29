/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Film,
  Camera,
  Sparkles,
  ArrowRight,
  Clock,
  Edit2,
  Trash2,
  Plus,
  Copy,
  ChevronDown,
  ChevronUp,
  Layers,
  Wand2,
  CheckCircle,
} from 'lucide-react';
import { Scene, Project, VisualBible, CharacterBible } from '../types';

interface StoryboardViewProps {
  project: Project;
  scenes: Scene[];
  visualBible: VisualBible | null;
  masterCharacter: CharacterBible | null;
  onUpdateScene: (sceneId: string, updated: Partial<Scene>) => void;
  onDeleteScene: (sceneId: string) => void;
  onAddScene: () => void;
  onOpenVisualBible: () => void;
  onApproveStoryboard: (mode: 'all' | 'first_only') => void;
  onRegenerateSingleScene: (scene: Scene) => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  project,
  scenes,
  visualBible,
  masterCharacter,
  onUpdateScene,
  onDeleteScene,
  onAddScene,
  onOpenVisualBible,
  onApproveStoryboard,
  onRegenerateSingleScene,
}) => {
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(scenes[0]?.id || null);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [approvingMode, setApprovingMode] = useState<'all' | 'first_only' | null>(null);

  const handleApprove = (mode: 'all' | 'first_only') => {
    setApprovingMode(mode);
    onApproveStoryboard(mode);
  };

  const toggleExpand = (id: string) => {
    setExpandedSceneId((prev) => (prev === id ? null : id));
  };

  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            Roteiro Técnico & Decupagem
          </div>
          <h2 className="text-3xl font-black font-heading tracking-tight text-white">
            Storyboard do Videoclipe
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            {scenes.length} Cenas Planejadas • Duração Total: {totalDuration}s • Proporção: {project.aspectRatio}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {visualBible && (
            <button
              onClick={onOpenVisualBible}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-violet-900/60 text-xs font-bold text-pink-300 flex items-center gap-2 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              <span>Ver Bíblia Visual</span>
            </button>
          )}

          <button
            onClick={onAddScene}
            className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Adicionar Cena</span>
          </button>

          <button
            type="button"
            onClick={() => handleApprove('all')}
            disabled={approvingMode !== null || scenes.length === 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-xs font-black text-white flex items-center gap-1.5 shadow-lg shadow-violet-950/60 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{approvingMode ? 'Iniciando...' : 'Aprovar & Gerar'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Bible Summary Bar */}
      {visualBible && (
        <div className="p-4 rounded-2xl bg-[#0a0a0e] border border-violet-900/30 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-violet-300 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>ÂNCORAS DE CONTINUIDADE ATIVAS:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-zinc-300">
            <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
              🎥 Lente: {visualBible.lens}
            </span>
            <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
              💡 Luz: {visualBible.lighting}
            </span>
            <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
              🎭 Personagem: {masterCharacter?.name || 'Protagonista'}
            </span>
          </div>
        </div>
      )}

      {/* Scene Cards List */}
      <div className="space-y-4">
        {scenes.map((scene, idx) => {
          const isExpanded = expandedSceneId === scene.id;
          const isEditing = editingSceneId === scene.id;

          return (
            <div
              key={scene.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-[#0c0c12] border-violet-500/50 glow-purple'
                  : 'bg-[#08080c]/90 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Scene Card Header */}
              <div
                onClick={() => toggleExpand(scene.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Scene Number & Visual Thumbnail */}
                  <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-violet-950/80 border border-violet-500/40 shrink-0 shadow-md">
                    {scene.thumbnailUrl || scene.generatedAssetUrl ? (
                      <img
                        src={scene.thumbnailUrl || scene.generatedAssetUrl}
                        alt={`Cena ${scene.order}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black font-heading text-cyan-300">
                        {scene.order.toString().padStart(2, '0')}
                      </div>
                    )}
                    <div className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-black/80 text-[9px] font-black text-cyan-300">
                      {scene.order.toString().padStart(2, '0')}
                    </div>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {scene.musicSection}
                      </h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {scene.duration}s ({scene.startTime}s - {scene.endTime}s)
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/30">
                        {scene.transition}
                      </span>
                    </div>

                    <p className="text-xs text-violet-300 truncate">
                      🎯 “{scene.emotionalGoal}”
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerateSingleScene(scene);
                    }}
                    className="p-2 rounded-lg bg-zinc-900/80 hover:bg-violet-950/40 text-zinc-300 hover:text-cyan-300 border border-zinc-800 transition-colors"
                    title="Pedir ajuste de direção para esta cena"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Deseja remover a Cena ${scene.order}?`)) {
                        onDeleteScene(scene.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-zinc-900/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
                    title="Excluir cena"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Scene Expanded Details */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-zinc-800/80 space-y-4 text-xs animate-fadeIn">
                  {/* Lyrics line if present */}
                  {scene.lyricsSnippet && (
                    <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-900/30 text-violet-200 italic font-mono">
                      🎵 Trecho da letra: “{scene.lyricsSnippet}”
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual Description & Action */}
                    <div className="space-y-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                          Descrição Visual da Cena:
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={scene.description}
                            onChange={(e) => onUpdateScene(scene.id, { description: e.target.value })}
                            className="w-full p-2 bg-zinc-900 border border-violet-500 rounded text-xs text-white"
                          />
                        ) : (
                          <p className="text-zinc-200 leading-relaxed">{scene.description}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                          Ação do Personagem / Performance:
                        </span>
                        <p className="text-zinc-300">{scene.characterAction}</p>
                      </div>
                    </div>

                    {/* Camera & Lighting */}
                    <div className="space-y-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
                      <div className="space-y-1">
                        <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          Movimento de Câmera (Direção):
                        </span>
                        <p className="text-zinc-200">{scene.cameraMovement}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-zinc-500 block">Iluminação:</span>
                          <span className="text-zinc-300 font-medium">{scene.lighting}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Lente:</span>
                          <span className="text-zinc-300 font-medium">{scene.lens}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompts Engine Box */}
                  <div className="p-4 rounded-xl bg-black/70 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-wider">
                        PROMPT DE VÍDEO (GERAÇÃO IA):
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scene.videoPrompt);
                          alert('Prompt copiado para a área de transferência!');
                        }}
                        className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-300 leading-relaxed bg-zinc-900/70 p-2.5 rounded-lg border border-zinc-800">
                      {scene.videoPrompt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Approving Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-cyan-950/30 border border-violet-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 glow-purple">
        <div className="space-y-1">
          <h4 className="font-heading font-black text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Storyboard Aprovado? Escolha como gerar:
          </h4>
          <p className="text-xs text-zinc-300 max-w-xl">
            Você pode gerar primeiro a <strong>Cena 1 de teste</strong> para avaliar o estilo visual com calma antes do restante, ou disparar a <strong>produção completa de todas as cenas</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Option 1: Generate only 1st scene */}
          <button
            type="button"
            onClick={() => handleApprove('first_only')}
            disabled={approvingMode !== null || scenes.length === 0}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-violet-950/80 border border-violet-500/40 hover:border-violet-400 text-xs font-bold text-violet-200 hover:text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>{approvingMode === 'first_only' ? 'GERANDO CENA 1...' : 'GERAR APENAS CENA 1 (TESTE)'}</span>
          </button>

          {/* Option 2: Generate all scenes */}
          <button
            type="button"
            onClick={() => handleApprove('all')}
            disabled={approvingMode !== null || scenes.length === 0}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-xs font-black font-heading text-white flex items-center justify-center gap-2 shadow-xl shadow-violet-950/70 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{approvingMode === 'all' ? 'GERANDO TODAS...' : 'GERAR TODAS AS CENAS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
