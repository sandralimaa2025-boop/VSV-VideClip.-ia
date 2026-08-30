/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Music, Play, Pause, Volume2, Sparkles, Disc, FileAudio, ArrowRight, Zap } from 'lucide-react';
import { AudioFileData } from '../types';
import { AudioProviderAdapter } from '../providers/AudioProviderAdapter';
import { SAMPLE_SONGS, SampleSong, createSynthesizedAudioDataUrl } from '../utils/sampleSongs';

interface AudioUploaderProps {
  audioFile: AudioFileData | null;
  onAudioSelected: (audio: AudioFileData, samplePreset?: SampleSong) => void;
  onContinue: () => void;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  audioFile,
  onAudioSelected,
  onContinue,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioFile?.duration || 0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const fallbackAudioUrl = React.useMemo(() => {
    try {
      return createSynthesizedAudioDataUrl('synthwave', Math.min(60, Math.ceil(duration || audioFile?.duration || 40)));
    } catch {
      return '';
    }
  }, [duration, audioFile?.duration]);

  // Audio Playback handler
  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
      }
      setIsPlaying(false);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    } else {
      setIsPlaying(true);
      lastTimeRef.current = performance.now();

      if (audioRef.current && audioFile?.url) {
        audioRef.current.currentTime = currentTime;
        audioRef.current
          .play()
          .then(() => {
            trackPlayback();
          })
          .catch((e) => {
            console.warn('Playback error or blocked by browser, running visual timer', e);
            trackPlayback();
          });
      } else {
        trackPlayback();
      }
    }
  };

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

      const dur = duration || audioFile?.duration || 40;
      if (next >= dur) {
        setIsPlaying(false);
        if (audioRef.current) {
          try {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          } catch (e) {}
        }
        if (animRef.current) {
          cancelAnimationFrame(animRef.current);
          animRef.current = null;
        }
        return 0;
      }
      return next;
    });

    animRef.current = requestAnimationFrame(trackPlayback);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const dur = duration || audioFile?.duration || 40;
    if (!dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * dur;
    lastTimeRef.current = performance.now();
    setCurrentTime(newTime);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = newTime;
      } catch (err) {}
    }
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Process File Upload
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|flac|aac)$/i)) {
      alert('Por favor, envie um arquivo de áudio válido (MP3, WAV, M4A, OGG).');
      return;
    }

    setIsAnalyzing(true);
    try {
      const url = URL.createObjectURL(file);
      const analysis = await AudioProviderAdapter.analyzeAudioFile(file);

      const data: AudioFileData = {
        name: file.name,
        size: file.size,
        duration: analysis.duration,
        url,
        mimeType: file.type || 'audio/mp3',
        waveformPeaks: analysis.waveformPeaks,
      };

      onAudioSelected(data);
    } catch (err) {
      console.error('Audio load error', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Sample Track Selector
  const handleSelectSample = (sample: SampleSong) => {
    const trackType = (sample.audioData.sampleTrackId as 'synthwave' | 'indie' | 'trap') || 'synthwave';
    const audioUrl = createSynthesizedAudioDataUrl(trackType, sample.presetAnalysis.duration);

    const updatedAudioData: AudioFileData = {
      ...sample.audioData,
      url: audioUrl,
    };

    onAudioSelected(updatedAudioData, sample);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-6">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Música • Roteiro • Cinema • IA
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
          Qual história sua música quer contar?
        </h1>
        <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
          Envie sua música e deixe a IA atuar como diretora, criando o conceito, o roteiro visual, o storyboard sincronizado e a direção de arte do seu videoclipe profissional.
        </p>
      </div>

      {/* Upload Box / Active Audio Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Upload Dropzone */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center text-center gap-4 min-h-[280px] ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/20 glow-cyan'
                : audioFile
                ? 'border-violet-500/40 bg-violet-950/10'
                : 'border-zinc-800 bg-[#09090b]/80 hover:border-violet-500/40 hover:bg-zinc-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-900 via-indigo-900 to-zinc-900 flex items-center justify-center border border-violet-500/30 group-hover:scale-105 transition-transform shadow-lg shadow-violet-950/50">
              {isAnalyzing ? (
                <Disc className="w-8 h-8 text-cyan-400 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-cyan-300" />
              )}
            </div>

            <div>
              <p className="text-base font-bold text-zinc-100 font-heading">
                {isAnalyzing
                  ? 'Analisando frequências e BPM da música...'
                  : 'Arraste e solte o arquivo da sua música aqui'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Formatos suportados: MP3, WAV, M4A, OGG, FLAC (sem limite de duração)
              </p>
            </div>

            <button
              type="button"
              className="mt-2 px-5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-white transition-colors"
            >
              Procurar no Computador
            </button>
          </div>

          {/* Active Audio Inspection & Player */}
          {audioFile && (
            <div className="bg-[#0c0c10] border border-violet-900/40 rounded-2xl p-5 space-y-4 glow-purple">
              {/* Hidden native audio element */}
              <audio
                ref={audioRef}
                src={audioFile.url || fallbackAudioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleAudioEnded}
                onLoadedMetadata={handleTimeUpdate}
              />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center shrink-0">
                    <FileAudio className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{audioFile.name}</h4>
                    <p className="text-xs text-zinc-400 flex items-center gap-2">
                      <span>Duração: {formatTime(duration || audioFile.duration)}</span>
                      <span>•</span>
                      <span>Tamanho: {(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-md shadow-violet-950/40 shrink-0 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>

              {/* Waveform Scrubber */}
              <div className="space-y-1.5">
                <div
                  onClick={handleSeek}
                  className="relative h-14 bg-black/60 rounded-xl border border-zinc-800/80 p-2 cursor-pointer flex items-end justify-between gap-[2px] overflow-hidden group"
                >
                  {/* Waveform Bars */}
                  {(audioFile.waveformPeaks || [0.2, 0.4, 0.7, 0.9, 0.8, 0.5, 0.3, 0.6]).map(
                    (peak, idx) => {
                      const totalBars = (audioFile.waveformPeaks || []).length || 8;
                      const barProgress = idx / totalBars;
                      const isPlayed = duration > 0 && currentTime / duration >= barProgress;

                      return (
                        <div
                          key={idx}
                          className={`w-full rounded-full transition-all duration-75 ${
                            isPlayed
                              ? 'bg-gradient-to-t from-violet-500 to-cyan-400'
                              : 'bg-zinc-800 group-hover:bg-zinc-700'
                          }`}
                          style={{ height: `${Math.max(12, peak * 100)}%` }}
                        />
                      );
                    }
                  )}

                  {/* Playhead indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] pointer-events-none"
                    style={{
                      left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || audioFile.duration)}</span>
                </div>
              </div>

              {/* Ready to configure button */}
              <button
                type="button"
                onClick={onContinue}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-950/40 transition-all active:scale-[0.99]"
              >
                <span>CRIAR MEU CLIPE COM ESTA MÚSICA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sample Tracks Sidebar for immediate testing */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#09090c]/90 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-violet-400">
              <Zap className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-zinc-200">
                Ou teste com faixas de demonstração
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Experimente o fluxo completo do diretor com faixas pré-configuradas contendo áudio sintetizado, letra e referências estéticas:
            </p>

            <div className="space-y-3">
              {SAMPLE_SONGS.map((sample) => {
                const isSelected = audioFile?.sampleTrackId === sample.audioData.sampleTrackId;

                return (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-violet-950/40 border-violet-500/50 glow-purple'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                          sample.id === 'sample-1'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                            : sample.id === 'sample-2'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-zinc-200 truncate">{sample.name}</h5>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {sample.artist} • <span className="text-violet-300">{sample.genre}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-violet-900/40 hover:bg-violet-800/50 border border-violet-700/40 text-[11px] font-semibold text-violet-200 shrink-0"
                    >
                      {isSelected ? 'Selecionada' : 'Carregar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value Prop Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400">
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <span className="font-semibold text-zinc-200 block mb-1">🎭 Personagem-Mestre</span>
              Mantém consistência de rosto, figurino e iluminação em todas as cenas.
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <span className="font-semibold text-zinc-200 block mb-1">🎯 Alfinete no Mapa</span>
              Garante que o clipe tenha um posicionamento visual inconfundível.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
