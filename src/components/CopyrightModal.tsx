/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, X, FileText, Check } from 'lucide-react';

interface CopyrightModalProps {
  onClose: () => void;
}

export const CopyrightModal: React.FC<CopyrightModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0c12] border border-violet-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 glow-purple animate-fadeIn relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">
              Direitos Autorais e Uso Ético da IA
            </h2>
            <p className="text-xs text-zinc-400">
              Diretrizes de Propriedade Intelectual do CLIPE AI
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              1. Titularidade da Música e Letra
            </h4>
            <p>
              Ao utilizar o CLIPE AI, o usuário declara ser o autor, titular ou possuidor de autorização legal expressa para utilização da faixa musical e das letras enviadas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              2. Geração Original e Não-Violação
            </h4>
            <p>
              O sistema de direção por IA cria obras visuais inéditas e conceituais, abstendo-se de replicar marcas registradas, rostos de terceiros sem consentimento ou obras protegidas por direitos autorais de forma indevida.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              3. Titularidade do Videoclipe Renderizado
            </h4>
            <p>
              O produto final gerado pertence ao criador do projeto, respeitadas as condições de licenciamento dos provedores de IA integrados.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-900/40"
        >
          Entendi e Concordo
        </button>
      </div>
    </div>
  );
};
