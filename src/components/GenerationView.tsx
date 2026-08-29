/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Play,
  CheckCircle,
  Clock,
  Layers,
  Wand2,
  AlertCircle,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { Scene, Project } from '../types';

interface GenerationViewProps {
  project: Project;
  scenes: Scene[];
  isGeneratingAll: boolean;
  generatingProgress: number;
  currentGeneratingSceneIndex: number;
  onStartBatchGeneration: () => void;
  onGenerateRemainingScenes: () => void;
  onGenerateSingleSceneIndex: (index: number) => void;
  onRegenerateScene: (scene: Scene, preset: string, customNotes?: string) => void;
  onGoToEditor: () => void;
  demoMode: boolean;
}

export const GenerationView: React.FC<GenerationViewProps> = ({
  project,
  scenes,
  isGeneratingAll,
  generatingProgress,
  currentGeneratingSceneIndex,
  onStartBatchGeneration,
  onGenerateRemainingScenes,
  onGenerateSingleSceneIndex,
  onRegenerateScene,
  onGoToEditor,
  demoMode,
}) => {
  const [selectedSceneForRegen, setSelectedSceneForRegen] = useState<Scene | null>(null);
  const [regenPreset, setRegenPreset] = useState('Mais cinematográfica');
  const [customRegenNotes, setCustomRegenNotes] = useState('');
  const [isSubmittingRegen, setIsSubmittingRegen] = useState(false);

  const readyScenesCount = scenes.filter((s) => s.status === 'ready' && s.generatedAssetUrl).length;
  const pendingScenesCount = scenes.length - readyScenesCount;
  const allReady = readyScenesCount === scenes.length && scenes.length > 0;

  const regenPresets = [
    'Mais cinematográfica',
    'Mais dramática',
    'Mais emocional',
    'Mais dinâmica e rápida',
    'Iluminação mais sombria / chiaroscuro',
    'Luz volumétrica e cores saturadas',
  ];

  const handleConfirmRegen = async () => {
    if (!selectedSceneForRegen) return;
    setIsSubmittingRegen(true);
    await onRegenerateScene(selectedSceneForRegen, regenPreset, customRegenNotes);
    setIsSubmittingRegen(false);
    setSelectedSceneForRegen(null);
    setCustomRegenNotes('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Produção Visual & Render
          </div>
          <h2 className="text-3xl font-black font-heading tracking-tight text-white">
            Geração de Cenas do Videoclipe
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            {readyScenesCount} de {scenes.length} cenas geradas • Provedor:{' '}
            <span className="text-violet-300 font-semibold">
              {demoMode ? 'CLIPE AI Demo Simulator' : 'API Real de Vídeo'}
            </span>
          </p>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-3 flex-wrap">
          {pendingScenesCount > 0 && readyScenesCount > 0 && !allReady && (
            <button
              onClick={onGenerateRemainingScenes}
              disabled={isGeneratingAll}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingAll ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAll ? 'Processando...' : `Gerar Cenas Restantes (${pendingScenesCount})`}</span>
            </button>
          )}

          {!allReady && readyScenesCount === 0 && (
            <button
              onClick={onStartBatchGeneration}
              disabled={isGeneratingAll}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-violet-950/50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingAll ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAll ? 'Gerando Cenas...' : 'Gerar Todas as Cenas'}</span>
            </button>
          )}

          {allReady && (
            <button
              onClick={onGoToEditor}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-violet-950/50 transition-all hover:scale-105"
            >
              <span>IR PARA EDITOR & TIMELINE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Awaiting command banner when only scene 1 is generated */}
      {readyScenesCount > 0 && !allReady && !isGeneratingAll && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/40 to-violet-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glow-cyan">
          <div className="space-y-1">
            <h4 className="font-heading font-black text-sm text-cyan-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Cena de Teste Concluída! Aguardando seu comando para gerar o restante
            </h4>
            <p className="text-xs text-zinc-300">
              Você pode avaliar o estilo visual na Cena 1 abaixo. Quando estiver satisfeito, clique no botão para gerar as outras {pendingScenesCount} cenas ou gere individualmente cada uma.
            </p>
          </div>
          <button
            onClick={onGenerateRemainingScenes}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-cyan-950/70 transition-all hover:scale-105 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>GERAR O RESTANTE ({pendingScenesCount} CENAS)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode Notice */}
      {demoMode && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-4 text-xs text-amber-200">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">MODO DEMONSTRAÇÃO ATIVO:</span> Renderizando simulação
              audiovisual procedimental com enquadramentos, luz e movimentos de câmera calculados pela IA.
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar if generating */}
      {isGeneratingAll && (
        <div className="p-5 rounded-2xl bg-[#0c0c12] border border-violet-500/40 space-y-3 glow-purple">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-violet-400" />
              Renderizando Cena {(currentGeneratingSceneIndex + 1).toString().padStart(2, '0')} de{' '}
              {scenes.length}...
            </span>
            <span className="font-mono text-violet-300">{Math.round(generatingProgress)}%</span>
          </div>

          <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${generatingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Scene Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenes.map((scene, index) => {
          const isReady = scene.status === 'ready' && scene.generatedAssetUrl;
          const isPending = scene.status === 'pending';
          const isGenerating = scene.status === 'generating';

          return (
            <div
              key={scene.id}
              className="bg-[#09090d] border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col group hover:border-violet-500/50 transition-all"
            >
              {/* Asset Preview Container */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {isReady && scene.generatedAssetUrl ? (
                  <img
                    src={scene.generatedAssetUrl}
                    alt={`Cena ${scene.order}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="p-6 text-center space-y-3">
                    {isGenerating ? (
                      <div className="space-y-2">
                        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                        <span className="text-xs text-violet-300 font-bold block">
                          Gerando tomada cinematográfica...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Clock className="w-6 h-6 text-zinc-600 mx-auto" />
                        <span className="text-xs text-zinc-500 block">Aguardando geração</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
                    Cena {scene.order.toString().padStart(2, '0')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-violet-950/80 backdrop-blur-sm text-[10px] font-bold text-violet-300 border border-violet-500/40">
                    {scene.duration}s
                  </span>
                </div>

                {isReady && (
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Pronta
                    </span>
                  </div>
                )}
              </div>

              {/* Scene Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">
                    {scene.musicSection}
                  </h4>
                  <p className="text-[11px] text-violet-300 line-clamp-2">
                    🎯 “{scene.emotionalGoal}”
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    📹 {scene.cameraMovement}
                  </p>
                </div>

                {/* Scene Actions */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  {isPending && (
                    <button
                      onClick={() => onGenerateSingleSceneIndex(index)}
                      disabled={isGeneratingAll}
                      className="flex-1 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Gerar Esta Cena</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => setSelectedSceneForRegen(scene)}
                      className="flex-1 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-violet-950/60 border border-zinc-800 hover:border-violet-700/40 text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Wand2 className="w-3 h-3 text-cyan-400" />
                      <span>Ajustar Direção</span>
                    </button>
                  )}

                  {scene.status === 'error' && (
                    <button
                      onClick={() => onGenerateSingleSceneIndex(index)}
                      disabled={isGeneratingAll}
                      className="flex-1 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 border border-rose-600/50 text-[11px] font-semibold text-rose-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3 text-rose-300" />
                      <span>Tentar Novamente</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Intelligent Regeneration Modal */}
      {selectedSceneForRegen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0c12] border border-violet-500/50 rounded-3xl p-6 max-w-lg w-full space-y-5 glow-purple animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Wand2 className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base text-white">
                  Ajustar Cena {selectedSceneForRegen.order} com Diretor IA
                </h3>
              </div>
              <button
                onClick={() => setSelectedSceneForRegen(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Escolha uma instrução do diretor ou descreva o que você deseja mudar especificamente nesta cena:
            </p>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                Instruções Rápidas de Direção:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {regenPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRegenPreset(preset)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                      regenPreset === preset
                        ? 'bg-violet-900/80 border-violet-500 text-white font-bold'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Notas adicionais do Diretor (Opcional):
              </label>
              <textarea
                rows={2}
                value={customRegenNotes}
                onChange={(e) => setCustomRegenNotes(e.target.value)}
                placeholder="Ex: Quero um olhar mais penetrante para a câmera no final..."
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedSceneForRegen(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmRegen}
                disabled={isSubmittingRegen}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-violet-900/50 transition-all disabled:opacity-50"
              >
                {isSubmittingRegen ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isSubmittingRegen ? 'Regenerando...' : 'Regenerar Cena'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      {allReady && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-cyan-950/30 border border-violet-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 glow-purple">
          <div>
            <h4 className="font-heading font-black text-lg text-white">
              Todas as cenas foram geradas!
            </h4>
            <p className="text-xs text-zinc-300">
              Entre no Editor de Linha do Tempo para sincronizar transições, filtros, legendas e renderizar o clipe.
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToEditor}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-sm font-black font-heading text-white flex items-center gap-2 shadow-xl shadow-violet-950/70 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>IR PARA EDITOR & TIMELINE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
