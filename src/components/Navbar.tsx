/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film, Clapperboard, Sparkles, Sliders, ShieldCheck, FolderOpen, Plus, Play } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface NavbarProps {
  currentProject: Project | null;
  onNewProject: () => void;
  onOpenProjects: () => void;
  onOpenVisualBible: () => void;
  onOpenApiConfig: () => void;
  onOpenCopyright: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  onNewProject,
  onOpenProjects,
  onOpenVisualBible,
  onOpenApiConfig,
  onOpenCopyright,
  demoMode,
  onToggleDemoMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070709]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-violet-950/40">
            <div className="w-full h-full bg-[#09090b] rounded-[11px] flex items-center justify-center">
              <Clapperboard className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-violet-200 to-cyan-300">
                CLIPE AI
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300">
                DIRETOR IA
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Direção e Produção Audiovisual com Inteligência Artificial
            </p>
          </div>
        </div>

        {/* Center: Current Project badge if active */}
        {currentProject && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
            <Film className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-200 font-medium max-w-[200px] truncate">
              {currentProject.name || 'Projeto sem título'}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-950/60 text-violet-300 border border-violet-700/30">
              {currentProject.status}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Demo Mode Pill */}
          <button
            onClick={onToggleDemoMode}
            title="Alternar entre modo simulação demonstrativa e modo APIs reais"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              demoMode
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/30'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{demoMode ? 'MODO DEMO' : 'MODO API REAL'}</span>
          </button>

          {/* Visual Bible Button (if exists) */}
          {currentProject?.visualBible && (
            <button
              onClick={onOpenVisualBible}
              className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors"
              title="Abrir Bíblia Visual do Clipe"
            >
              <Film className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">Bíblia Visual</span>
            </button>
          )}

          {/* Projects Button */}
          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors"
            title="Meus Projetos"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Projetos</span>
          </button>

          {/* Settings / API Config */}
          <button
            onClick={onOpenApiConfig}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Configurações de APIs & Provedores"
          >
            <Sliders className="w-4 h-4 text-violet-400" />
          </button>

          {/* Copyright notice */}
          <button
            onClick={onOpenCopyright}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            title="Direitos Autorais e Termos"
          >
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
          </button>

          {/* New Project CTA */}
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-950/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Clipe</span>
          </button>
        </div>
      </div>
    </header>
  );
};
