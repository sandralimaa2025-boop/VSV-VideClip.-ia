/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sliders, X, CheckCircle, AlertCircle, Sparkles, Key, ExternalLink } from 'lucide-react';

interface ApiConfigModalProps {
  onClose: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  onClose,
  demoMode,
  onToggleDemoMode,
}) => {
  const [configStatus, setConfigStatus] = useState<{
    hasGeminiKey: boolean;
    hasVideoKey: boolean;
    hasImageKey: boolean;
    supportedVideoProviders: string[];
  }>({
    hasGeminiKey: false,
    hasVideoKey: false,
    hasImageKey: false,
    supportedVideoProviders: [],
  });

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfigStatus(data))
      .catch(() => {});
  }, []);

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
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            Camada de Provedores & APIs
          </div>
          <h2 className="text-2xl font-black font-heading text-white">
            Configuração de Provedores de IA
          </h2>
          <p className="text-xs text-zinc-400">
            Arquitetura desacoplada e modular para múltiplos motores de IA
          </p>
        </div>

        {/* Demo Mode Toggle Banner */}
        <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/40 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white block">Modo Demonstração Interativo</span>
            <p className="text-[11px] text-zinc-300">
              Permite testar 100% da experiência de direção, storyboard, animação procedural e renderização mesmo sem configurar chaves de vídeo pagas.
            </p>
          </div>
          <button
            onClick={onToggleDemoMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              demoMode
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}
          >
            {demoMode ? 'ATIVADO' : 'DESATIVADO'}
          </button>
        </div>

        {/* Status of Server APIs */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Status dos Serviços no Servidor (.env):
          </span>

          <div className="space-y-2 text-xs">
            {/* Gemini */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">GEMINI_API_KEY (Diretor IA & Análise)</span>
                <span className="text-[11px] text-zinc-400">Google Gemini 3.7 Flash</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  configStatus.hasGeminiKey
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                }`}
              >
                {configStatus.hasGeminiKey ? 'Conectado' : 'Fallback Ativo'}
              </span>
            </div>

            {/* Video Provider */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">VIDEO_API_KEY (Veo / Runway / Luma / Kling)</span>
                <span className="text-[11px] text-zinc-400">Provedor de geração de vídeo neural</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  configStatus.hasVideoKey
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {configStatus.hasVideoKey ? 'Conectado' : 'Modo Demo Ativo'}
              </span>
            </div>
          </div>
        </div>

        {/* Instruction Note */}
        <div className="p-4 rounded-2xl bg-black/70 border border-zinc-800 text-xs space-y-2 text-zinc-400 leading-relaxed">
          <p className="font-semibold text-zinc-300">Como conectar provedores externos reais?</p>
          <p>
            Para conectar suas chaves de API reais, configure as variáveis de ambiente no arquivo <code className="text-violet-300 font-mono">.env</code> da aplicação:
          </p>
          <pre className="p-2.5 rounded-lg bg-zinc-900 text-[11px] font-mono text-cyan-300 border border-zinc-800 overflow-x-auto">
            GEMINI_API_KEY=sua_chave_gemini{"\n"}
            VIDEO_API_KEY=sua_chave_video{"\n"}
            IMAGE_API_KEY=sua_chave_imagem
          </pre>
        </div>
      </div>
    </div>
  );
};
