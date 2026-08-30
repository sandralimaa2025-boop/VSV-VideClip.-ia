/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FolderOpen, X, Film, Plus, Trash2, Calendar, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { Project } from '../types';

interface ProjectsDashboardProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
  onClose: () => void;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
  onNewProject,
  onClose,
}) => {
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0c12] border border-violet-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 glow-purple animate-fadeIn relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-cyan-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-white">
                Meus Projetos de Videoclipes
              </h2>
              <p className="text-xs text-zinc-400">
                {projects.length} {projects.length === 1 ? 'projeto salvo' : 'projetos salvos'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-violet-900/40 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Clipe</span>
          </button>
        </div>

        {/* Delete Confirmation Alert */}
        {projectToDelete && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-900/50 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Excluir Projeto?</h4>
                <p className="text-xs text-zinc-300">
                  Deseja excluir definitivamente <span className="font-semibold text-rose-300">"{projectToDelete.name || 'Sem título'}"</span>?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl space-y-3">
            <Film className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-400">Nenhum projeto salvo ainda.</p>
            <p className="text-xs text-zinc-500">
              Envie sua primeira música para criar um videoclipe profissional com o Diretor IA!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              const dateStr = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString('pt-BR');

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-violet-950/40 border-violet-500 shadow-md shadow-violet-950/60'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-violet-400 shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{proj.name || 'Sem título'}</h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {proj.artist || 'Artista'} • <span className="text-violet-300">{proj.status}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {proj.audioFile?.duration || 40}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(proj);
                      }}
                      className="p-2 rounded-lg bg-zinc-800/60 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors"
                      title="Excluir projeto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(proj);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white flex items-center gap-1"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
