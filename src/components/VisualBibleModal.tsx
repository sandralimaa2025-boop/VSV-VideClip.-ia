/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, X, ShieldCheck, Film, User, Camera, Palette, Sun, Sparkles } from 'lucide-react';
import { VisualBible, CharacterBible } from '../types';

interface VisualBibleModalProps {
  visualBible: VisualBible | null;
  masterCharacter: CharacterBible | null;
  onClose: () => void;
}

export const VisualBibleModal: React.FC<VisualBibleModalProps> = ({
  visualBible,
  masterCharacter,
  onClose,
}) => {
  if (!visualBible) return null;

  const anchors = [
    { label: '1. PERSONAGEM', value: visualBible.character || masterCharacter?.name || 'Protagonista principal', icon: User },
    { label: '2. CENÁRIO', value: visualBible.setting, icon: Film },
    { label: '3. FIGURINO / ROUPA', value: visualBible.outfit || masterCharacter?.outfit || 'Figurino conceitual', icon: ShieldCheck },
    { label: '4. PALETA DE CORES', value: visualBible.palette.join(', '), icon: Palette },
    { label: '5. LENTE CINEMATOGRÁFICA', value: visualBible.lens, icon: Camera },
    { label: '6. ILUMINAÇÃO & CHIAROSCURO', value: visualBible.lighting, icon: Sun },
    { label: '7. ESTILO VISUAL', value: visualBible.style, icon: Sparkles },
    { label: '8. PROPORÇÃO DE QUADRO', value: visualBible.proportion, icon: Film },
    { label: '9. TEXTURA & GRANULAÇÃO', value: visualBible.texture, icon: Layers },
    { label: '10. ATMOSFERA & TONE', value: visualBible.atmosphere, icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0c12] border border-violet-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 glow-purple animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-pink-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-white">
                Bíblia Visual do Videoclipe
              </h2>
              <p className="text-xs text-violet-300">
                10 Âncoras de Continuidade Estética
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300">
          O Diretor IA utiliza estas 10 diretrizes fixas em todos os prompts para garantir que os personagens, a iluminação e as cores não mudem arbitrariamente entre as cenas.
        </p>

        {/* 10 Anchors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {anchors.map((anc, idx) => {
            const Icon = anc.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{anc.label}</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">{anc.value}</p>
              </div>
            );
          })}
        </div>

        {/* Master Character Card */}
        {masterCharacter && (
          <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-900/40 space-y-2 text-xs">
            <h4 className="font-bold text-violet-300 flex items-center gap-2">
              <User className="w-4 h-4 text-pink-400" />
              Ficha do Personagem-Mestre: {masterCharacter.name}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-zinc-300">
              <p><span className="text-zinc-500">Idade:</span> {masterCharacter.age}</p>
              <p><span className="text-zinc-500">Rosto:</span> {masterCharacter.face}</p>
              <p><span className="text-zinc-500">Cabelo:</span> {masterCharacter.hair}</p>
              <p><span className="text-zinc-500">Figurino:</span> {masterCharacter.outfit}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
