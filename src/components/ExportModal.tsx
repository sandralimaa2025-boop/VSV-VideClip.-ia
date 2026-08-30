/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  CheckCircle,
  RefreshCw,
  Film,
  FileText,
  Share2,
  Tv,
  Smartphone,
  Instagram,
  Square,
  Sparkles,
  X,
} from 'lucide-react';
import { Project, RenderJob } from '../types';
import { RenderService } from '../services/RenderService';

interface ExportModalProps {
  project: Project;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<
    'youtube_1080p' | 'tiktok_9_16' | 'instagram_4_5' | 'square_1_1'
  >('youtube_1080p');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [completedJob, setCompletedJob] = useState<RenderJob | null>(null);

  const startRender = async () => {
    setIsRendering(true);
    setRenderProgress(5);
    setStageMessage('Iniciando pipeline de exportação...');

    try {
      const renderService = RenderService.getInstance();
      const job = await renderService.renderVideo(project, selectedPreset, (prog, msg) => {
        setRenderProgress(prog);
        setStageMessage(msg);
      });
      setCompletedJob(job);
    } catch (e) {
      console.error('Render failed', e);
      alert('Houve um erro na renderização do clipe.');
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!completedJob?.outputUrl) return;
    const a = document.createElement('a');
    a.href = completedJob.outputUrl;
    a.download = `${project.name.replace(/\s+/g, '_')}_ClipeAI.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportStoryboardJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${project.name.replace(/\s+/g, '_')}_Storyboard_ClipeAI.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportPromptsText = () => {
    let content = `========================================================\n`;
    content += `CLIPE AI — PROMPT MASTER BUNDLE & BÍBLIA VISUAL\n`;
    content += `Projeto: ${project.name} | Artista: ${project.artist}\n`;
    content += `Alfinete no Mapa: ${project.alfineteNoMapa}\n`;
    content += `========================================================\n\n`;

    if (project.visualBible) {
      content += `--- BÍBLIA VISUAL (CONTINUIDADE) ---\n`;
      content += `Lente: ${project.visualBible.lens}\n`;
      content += `Iluminação: ${project.visualBible.lighting}\n`;
      content += `Estilo: ${project.visualBible.style}\n`;
      content += `Atmosfera: ${project.visualBible.atmosphere}\n\n`;
    }

    content += `--- CENAS & PROMPTS DE VÍDEO ---\n\n`;
    project.scenes.forEach((scene) => {
      content += `[CENA ${scene.order.toString().padStart(2, '0')}] - ${scene.musicSection} (${scene.duration}s)\n`;
      content += `Objetivo Emocional: ${scene.emotionalGoal}\n`;
      content += `Câmera: ${scene.cameraMovement}\n`;
      content += `Luz: ${scene.lighting}\n`;
      content += `Prompt de Vídeo:\n${scene.videoPrompt}\n\n`;
      content += `--------------------------------------------------------\n`;
    });

    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${project.name.replace(/\s+/g, '_')}_Prompts_Diretor.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0c12] border border-violet-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 glow-purple animate-fadeIn relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Exportação Final & Masterização
          </div>
          <h2 className="text-2xl font-black font-heading text-white">
            Exportar Videoclipe
          </h2>
          <p className="text-xs text-zinc-400">
            {project.name} • {project.scenes.length} cenas • {project.audioFile?.duration || 40}s
          </p>
        </div>

        {/* Preset Selector */}
        {!completedJob && !isRendering && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Selecione o Formato de Saída:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'youtube_1080p', label: 'YouTube / Cinema (1080p 16:9)', icon: Tv },
                { id: 'tiktok_9_16', label: 'TikTok / Reels (1080x1920 9:16)', icon: Smartphone },
                { id: 'instagram_4_5', label: 'Instagram Feed (1080x1350 4:5)', icon: Instagram },
                { id: 'square_1_1', label: 'Quadrado (1080x1080 1:1)', icon: Square },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = selectedPreset === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedPreset(fmt.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                      isSelected
                        ? 'bg-violet-900/80 border-violet-500 text-white font-bold glow-purple'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`} />
                    <span className="text-xs">{fmt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rendering Progress */}
        {isRendering && (
          <div className="p-6 rounded-2xl bg-black/80 border border-violet-500/40 space-y-4 text-center">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Compondo e Renderizando Videoclipe...</h4>
              <p className="text-xs text-violet-300 font-mono">{stageMessage}</p>
            </div>

            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>⚡ Modo Ultra Rápido</span>
              <span className="text-violet-300 font-bold">{Math.round(renderProgress)}% Concluído</span>
            </div>

            <button
              type="button"
              onClick={() => {
                RenderService.getInstance().cancelRender();
                setIsRendering(false);
              }}
              className="mt-2 text-xs text-zinc-500 hover:text-rose-400 underline transition-colors"
            >
              Cancelar renderização
            </button>
          </div>
        )}

        {/* Render Completed Card */}
        {completedJob && (
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-4 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Videoclipe Renderizado com Sucesso!</h4>
              <p className="text-xs text-zinc-300">
                Pronto para download com áudio e vídeo sincronizados. Tamanho estimado: {completedJob.fileSize || '18 MB'}
              </p>
            </div>

            <button
              onClick={handleDownloadVideo}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.02]"
            >
              <Download className="w-5 h-5" />
              <span>BAIXAR ARQUIVO DE VÍDEO</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!isRendering && !completedJob && (
          <button
            onClick={startRender}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black font-heading text-sm flex items-center justify-center gap-2 shadow-xl shadow-violet-950/70 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>RENDERIZAR AGORA</span>
          </button>
        )}

        {/* Export Storyboard / Prompts */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Exportações Complementares de Produção:
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportPromptsText}
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Exportar Prompts (.TXT)</span>
            </button>

            <button
              onClick={handleExportStoryboardJSON}
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Exportar Projeto (.JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
