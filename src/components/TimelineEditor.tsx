/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Sliders,
  Sparkles,
  Download,
  Film,
  Music,
  Type,
  Layers,
  Wand2,
} from 'lucide-react';
import { Project, Scene, FilterType, TransitionType } from '../types';
import { createSynthesizedAudioDataUrl } from '../utils/sampleSongs';

interface TimelineEditorProps {
  project: Project;
  scenes: Scene[];
  onUpdateScene: (sceneId: string, updated: Partial<Scene>) => void;
  onOpenExportModal: () => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  project,
  scenes,
  onUpdateScene,
  onOpenExportModal,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id || '');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const totalDuration = project.audioFile?.duration || scenes.reduce((acc, s) => acc + s.duration, 0) || 40;

  // Generate a fallback synthetic audio track if project audio has no url or is broken
  const fallbackAudioUrl = useMemo(() => {
    try {
      return createSynthesizedAudioDataUrl('synthwave', Math.min(60, Math.ceil(totalDuration)));
    } catch {
      return '';
    }
  }, [totalDuration]);

  // Selected Scene
  const activeScene = scenes.find((s) => s.id === selectedSceneId) || scenes[0];

  // Find currently playing scene based on playback timestamp
  const currentPlayingScene =
    scenes.find((s) => currentTime >= s.startTime && currentTime < s.endTime) ||
    (currentTime >= totalDuration ? scenes[scenes.length - 1] : scenes[0]);

  // Audio Playback Synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const trackPlayback = () => {
    const now = performance.now();
    const delta = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    setCurrentTime((prev) => {
      let next = prev;
      if (audioRef.current && !audioRef.current.paused && !isNaN(audioRef.current.currentTime)) {
        next = audioRef.current.currentTime;
      } else {
        next = prev + delta;
      }

      if (next >= totalDuration) {
        setIsPlaying(false);
        if (audioRef.current) {
          try {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          } catch (e) {}
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return 0;
      }
      return next;
    });

    animationFrameRef.current = requestAnimationFrame(trackPlayback);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
      }
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      setIsPlaying(true);
      lastTimeRef.current = performance.now();

      // If at end, loop back to start
      if (currentTime >= totalDuration - 0.1) {
        setCurrentTime(0);
        if (audioRef.current) audioRef.current.currentTime = 0;
      }

      if (audioRef.current) {
        try {
          audioRef.current.currentTime = currentTime >= totalDuration - 0.1 ? 0 : currentTime;
        } catch (e) {}

        audioRef.current
          .play()
          .then(() => {
            trackPlayback();
          })
          .catch((e) => {
            console.warn('Audio play blocked by browser or failed, running timeline video timer', e);
            trackPlayback();
          });
      } else {
        trackPlayback();
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && isPlaying) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleSeek = (timeInSecs: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, timeInSecs));
    lastTimeRef.current = performance.now();
    setCurrentTime(clamped);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = clamped;
      } catch (e) {}
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    handleSeek(pct * totalDuration);
  };

  const skipToPrevScene = () => {
    const idx = scenes.findIndex((s) => s.id === currentPlayingScene?.id);
    if (idx > 0) {
      handleSeek(scenes[idx - 1].startTime);
      setSelectedSceneId(scenes[idx - 1].id);
    } else {
      handleSeek(0);
    }
  };

  const skipToNextScene = () => {
    const idx = scenes.findIndex((s) => s.id === currentPlayingScene?.id);
    if (idx < scenes.length - 1) {
      handleSeek(scenes[idx + 1].startTime);
      setSelectedSceneId(scenes[idx + 1].id);
    }
  };

  const formatTimecode = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Keyboard shortcut listener for spacebar play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-6xl mx-auto py-4 space-y-6 animate-fadeIn">
      {/* Hidden audio element for precise sync */}
      <audio
        ref={audioRef}
        src={project.audioFile?.url || fallbackAudioUrl}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* Top Bar with Export CTA */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-cyan-400">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading font-black text-lg text-white">
              Editor de Linha do Tempo & Finalização
            </h2>
            <p className="text-xs text-zinc-400">
              Sincronia audiovisual • Transições • Filtros • Proporção {project.aspectRatio}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenExportModal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-xs font-black font-heading text-white flex items-center gap-2 shadow-xl shadow-violet-950/60 transition-all hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>EXPORTAR VIDEOCLIPE (MP4)</span>
        </button>
      </div>

      {/* Main Split: Player on Left / Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Master Video Player Container */}
        <div
          ref={playerContainerRef}
          className="lg:col-span-8 bg-[#08080c] border border-zinc-800/80 rounded-2xl overflow-hidden space-y-3 p-3 glow-purple"
        >
          {/* Video Preview Canvas Frame */}
          <div
            className={`relative bg-black rounded-xl overflow-hidden flex items-center justify-center transition-all ${
              project.aspectRatio === '9:16'
                ? 'aspect-[9/16] max-h-[520px] mx-auto'
                : project.aspectRatio === '4:5'
                ? 'aspect-[4/5] max-h-[520px] mx-auto'
                : project.aspectRatio === '1:1'
                ? 'aspect-square max-h-[520px] mx-auto'
                : 'aspect-video w-full'
            }`}
          >
            {/* Active Scene Asset */}
            {currentPlayingScene?.generatedAssetUrl || currentPlayingScene?.thumbnailUrl ? (
              <img
                src={currentPlayingScene.generatedAssetUrl || currentPlayingScene.thumbnailUrl}
                alt={`Cena ${currentPlayingScene.order}`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Film className="w-10 h-10 text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-500">Pré-visualização da Cena {currentPlayingScene?.order}</p>
              </div>
            )}

            {/* Filter Overlay */}
            {currentPlayingScene?.filter === 'cyberpunk_neon' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-cyan-500/20 mix-blend-color pointer-events-none" />
            )}
            {currentPlayingScene?.filter === 'golden_hour' && (
              <div className="absolute inset-0 bg-amber-500/15 mix-blend-color pointer-events-none" />
            )}
            {currentPlayingScene?.filter === 'noir_bw' && (
              <div className="absolute inset-0 backdrop-grayscale pointer-events-none" />
            )}
            {currentPlayingScene?.filter === 'moody_blue' && (
              <div className="absolute inset-0 bg-blue-900/20 mix-blend-color pointer-events-none" />
            )}

            {/* Lyrics Subtitle Overlay on screen */}
            {currentPlayingScene?.lyricsSnippet && (
              <div className="absolute bottom-6 left-6 right-6 text-center pointer-events-none">
                <span className="inline-block px-4 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs sm:text-sm font-semibold tracking-wide border border-white/10 shadow-lg">
                  {currentPlayingScene.lyricsSnippet}
                </span>
              </div>
            )}

            {/* Top metadata badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="px-2 py-1 rounded bg-black/80 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/40 backdrop-blur-sm">
                CENA {currentPlayingScene?.order.toString().padStart(2, '0')} // {currentPlayingScene?.musicSection}
              </span>
            </div>

            {/* Timecode Badge */}
            <div className="absolute top-3 right-3 pointer-events-none">
              <span className="px-2 py-1 rounded bg-black/80 text-[11px] font-mono font-bold text-violet-300 border border-violet-500/40 backdrop-blur-sm">
                {formatTimecode(currentTime)} / {formatTimecode(totalDuration)}
              </span>
            </div>
          </div>

          {/* Transport Control Bar */}
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSeek(0)}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="Voltar ao início"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={skipToPrevScene}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="Cena anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white flex items-center justify-center shadow-lg shadow-violet-900/50 transition-all active:scale-95"
                title="Play/Pause (Espaço)"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={skipToNextScene}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="Próxima cena"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-zinc-300 font-bold ml-2">
                {formatTimecode(currentTime)}
              </span>
            </div>

            {/* Right transport items */}
            <div className="flex items-center gap-3">
              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-zinc-400 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-20 accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={() => {
                  if (playerContainerRef.current) {
                    if (!document.fullscreenElement) {
                      playerContainerRef.current.requestFullscreen().catch(() => {});
                      setIsFullscreen(true);
                    } else {
                      document.exitFullscreen().catch(() => {});
                      setIsFullscreen(false);
                    }
                  }
                }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Tela Cheia"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scene Inspector on Right */}
        <div className="lg:col-span-4 bg-[#0c0c12] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sliders className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-white">
                Inspetor da Cena {activeScene?.order}
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-700/40">
              {activeScene?.duration} segundos
            </span>
          </div>

          {/* Transition Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Transição de Entrada
            </label>
            <select
              value={activeScene?.transition || 'cut'}
              onChange={(e) =>
                onUpdateScene(activeScene.id, { transition: e.target.value as TransitionType })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="fade">Fade In / Fade Out (Suave)</option>
              <option value="cut">Corte Seco (Rítmico)</option>
              <option value="dissolve">Dissolve Cruzado (Poético)</option>
              <option value="match_cut">Match Cut Cinematográfico</option>
              <option value="zoom_in">Zoom In Vertiginoso</option>
              <option value="flash_white">Flash White (Explosão de Luz)</option>
            </select>
          </div>

          {/* Filter Preset */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Filtro de Cor (Grading)
            </label>
            <select
              value={activeScene?.filter || 'cinematic_35mm'}
              onChange={(e) =>
                onUpdateScene(activeScene.id, { filter: e.target.value as FilterType })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="cinematic_35mm">Cinema 35mm Granulado</option>
              <option value="cyberpunk_neon">Cyberpunk Neon (Ciano & Magenta)</option>
              <option value="golden_hour">Golden Hour (Âmbar e Calor)</option>
              <option value="noir_bw">Film Noir (Preto & Branco Alto Contraste)</option>
              <option value="moody_blue">Moody Blue (Melancolia Noturna)</option>
              <option value="vintage_film">Vintage Super-8</option>
              <option value="none">Original (Sem Filtro)</option>
            </select>
          </div>

          {/* Motion Strength */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-zinc-300 uppercase tracking-wider">
                Intensidade de Movimento (Ken Burns / Câmera)
              </span>
              <span className="font-mono text-violet-300">{activeScene?.motionStrength || 5}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={activeScene?.motionStrength || 5}
              onChange={(e) =>
                onUpdateScene(activeScene.id, { motionStrength: parseInt(e.target.value, 10) })
              }
              className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Subtitle / Lyric editor */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Legenda / Letra nesta cena
            </label>
            <input
              type="text"
              value={activeScene?.lyricsSnippet || ''}
              onChange={(e) => onUpdateScene(activeScene.id, { lyricsSnippet: e.target.value })}
              placeholder="Digite o texto da letra sincronizado com esta cena..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Scene details summary */}
          <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs space-y-1 text-zinc-400">
            <p className="text-zinc-300 font-medium">🎯 {activeScene?.emotionalGoal}</p>
            <p>📹 {activeScene?.cameraMovement}</p>
          </div>
        </div>
      </div>

      {/* Multi-Track Visual Timeline */}
      <div className="bg-[#09090d] border border-violet-900/30 rounded-2xl p-5 space-y-4 glow-purple">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            LINHA DO TEMPO MULTIPISTA
          </span>
          <span className="text-zinc-500 text-[11px]">
            Clique em qualquer ponto para mover o cursor de reprodução
          </span>
        </div>

        {/* Timeline Container */}
        <div
          onClick={handleTimelineClick}
          className="relative bg-[#050508] rounded-xl border border-zinc-800/80 p-3 space-y-3 cursor-pointer select-none overflow-hidden"
        >
          {/* TRACK 1: Video Scenes Track */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <Film className="w-3 h-3 text-cyan-400" />
              <span>Pista de Vídeo (Cenas & Transições)</span>
            </div>
            <div className="flex items-center gap-1 h-14 bg-black/80 rounded-lg p-1 border border-zinc-800/80">
              {scenes.map((scene) => {
                const widthPct = Math.max(8, (scene.duration / totalDuration) * 100);
                const isSelected = scene.id === selectedSceneId;
                const isCurrent =
                  currentTime >= scene.startTime && currentTime < scene.endTime;

                return (
                  <div
                    key={scene.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSceneId(scene.id);
                      handleSeek(scene.startTime);
                    }}
                    className={`h-full rounded-md px-2 py-1 flex flex-col justify-between transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-violet-900/90 border-2 border-cyan-400 shadow-md shadow-cyan-950/60'
                        : isCurrent
                        ? 'bg-violet-950/80 border border-violet-500/50'
                        : 'bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  >
                    {(scene.thumbnailUrl || scene.generatedAssetUrl) && (
                      <img
                        src={scene.thumbnailUrl || scene.generatedAssetUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-between text-[10px] font-bold">
                      <span className="text-white truncate drop-shadow">
                        C{scene.order.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-300 drop-shadow">{scene.duration}s</span>
                    </div>

                    <span className="relative z-10 text-[9px] text-violet-200 truncate block drop-shadow">
                      {scene.musicSection}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: Audio Track with Waveform */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <Music className="w-3 h-3 text-pink-400" />
              <span>Pista de Áudio (Frequências & Beats)</span>
            </div>
            <div className="h-10 bg-black/80 rounded-lg p-1.5 flex items-end justify-between gap-[2px] border border-zinc-800/80">
              {(project.audioFile?.waveformPeaks || [0.3, 0.5, 0.8, 0.9, 0.6, 0.4, 0.7, 0.8]).map(
                (peak, idx) => {
                  const total = (project.audioFile?.waveformPeaks || []).length || 8;
                  const barProgress = idx / total;
                  const isPassed = currentTime / totalDuration >= barProgress;

                  return (
                    <div
                      key={idx}
                      className={`w-full rounded-full transition-colors ${
                        isPassed ? 'bg-cyan-400' : 'bg-zinc-800'
                      }`}
                      style={{ height: `${Math.max(15, peak * 100)}%` }}
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* TRACK 3: Subtitle Track */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <Type className="w-3 h-3 text-violet-400" />
              <span>Pista de Legenda / Letra</span>
            </div>
            <div className="flex items-center gap-1 h-6 bg-black/80 rounded-lg px-2 border border-zinc-800/80 text-[10px] text-zinc-400 font-mono truncate">
              {currentPlayingScene?.lyricsSnippet || 'Sem legenda neste trecho'}
            </div>
          </div>

          {/* Global Playhead Scrubber */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] pointer-events-none z-20"
            style={{
              left: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
            }}
          >
            <div className="w-3 h-3 bg-cyan-400 -translate-x-[5px] rotate-45 shadow-[0_0_8px_#22d3ee]" />
          </div>
        </div>
      </div>
    </div>
  );
};
