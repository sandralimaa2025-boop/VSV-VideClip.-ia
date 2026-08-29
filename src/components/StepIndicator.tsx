/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Music, Lightbulb, Grid, Sparkles, SlidersHorizontal, Download, Check } from 'lucide-react';
import { ProjectStatus } from '../types';

interface StepIndicatorProps {
  currentStatus: ProjectStatus;
  onNavigateStep?: (targetStatus: ProjectStatus) => void;
}

interface StepDef {
  status: ProjectStatus;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStatus, onNavigateStep }) => {
  const steps: StepDef[] = [
    { status: 'SETUP', label: '1. Música & Setup', shortLabel: 'Música', icon: Music },
    { status: 'CONCEITO', label: '2. Conceito IA', shortLabel: 'Conceito', icon: Lightbulb },
    { status: 'STORYBOARD', label: '3. Storyboard', shortLabel: 'Storyboard', icon: Grid },
    { status: 'GERANDO', label: '4. Geração', shortLabel: 'Geração', icon: Sparkles },
    { status: 'EDITANDO', label: '5. Editor & Timeline', shortLabel: 'Editor', icon: SlidersHorizontal },
    { status: 'FINALIZADO', label: '6. Exportação', shortLabel: 'Exportar', icon: Download },
  ];

  const statusOrder: Record<ProjectStatus, number> = {
    SETUP: 0,
    ANALISANDO: 1,
    CONCEITO: 1,
    STORYBOARD: 2,
    GERANDO: 3,
    EDITANDO: 4,
    RENDERIZANDO: 5,
    FINALIZADO: 5,
  };

  const currentIdx = statusOrder[currentStatus] || 0;

  return (
    <div className="w-full bg-[#070709]/80 border-b border-zinc-800/80 py-2.5 px-4 overflow-x-auto">
      <div className="max-w-6xl mx-auto flex items-center justify-between min-w-[620px]">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentIdx;
          const isCompleted = idx < currentIdx;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.status}>
              <button
                disabled={!isCompleted && !isCurrent}
                onClick={() => onNavigateStep && isCompleted && onNavigateStep(step.status)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-violet-950/70 to-indigo-950/70 border border-violet-500/40 text-white shadow-md shadow-violet-950/40'
                    : isCompleted
                    ? 'text-zinc-300 hover:text-white bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer'
                    : 'text-zinc-600 bg-transparent cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-violet-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden">{step.shortLabel}</span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-[1.5px] mx-2 transition-colors ${
                    idx < currentIdx ? 'bg-emerald-500/40' : 'bg-zinc-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
