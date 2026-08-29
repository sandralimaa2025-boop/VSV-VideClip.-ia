/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioProviderAdapter {
  private static audioCtx: AudioContext | null = null;

  public static getAudioContext(): AudioContext {
    if (!AudioProviderAdapter.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      AudioProviderAdapter.audioCtx = new AudioCtxClass();
    }
    if (AudioProviderAdapter.audioCtx.state === 'suspended') {
      AudioProviderAdapter.audioCtx.resume();
    }
    return AudioProviderAdapter.audioCtx;
  }

  /**
   * Decodes an audio file and extracts its duration, waveform peaks and estimated BPM
   */
  public static async analyzeAudioFile(file: File): Promise<{
    duration: number;
    waveformPeaks: number[];
    bpm: number;
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = AudioProviderAdapter.getAudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const duration = audioBuffer.duration;
      const rawData = audioBuffer.getChannelData(0);
      const samples = 100; // 100 waveform bars
      const blockSize = Math.floor(rawData.length / samples);
      const waveformPeaks: number[] = [];

      for (let i = 0; i < samples; i++) {
        const start = i * blockSize;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[start + j]);
        }
        waveformPeaks.push(Math.min(1, (sum / blockSize) * 2.5));
      }

      // Estimate BPM using peak detection
      const bpm = AudioProviderAdapter.estimateBPM(rawData, audioBuffer.sampleRate);

      return {
        duration: Math.round(duration),
        waveformPeaks,
        bpm: bpm || 120,
      };
    } catch (e) {
      console.warn('Web Audio decoding fallback for waveform', e);
      return {
        duration: 40,
        waveformPeaks: [0.2, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3],
        bpm: 120,
      };
    }
  }

  /**
   * Simple peak-interval based BPM estimator
   */
  private static estimateBPM(data: Float32Array, sampleRate: number): number {
    let peakCount = 0;
    const threshold = 0.5;
    const minDistance = Math.floor(sampleRate * 0.3); // Minimum 300ms between beats (max 200 BPM)
    let lastPeak = 0;
    const intervals: number[] = [];

    // Analyze first 30 seconds for speed
    const limit = Math.min(data.length, sampleRate * 30);
    for (let i = 0; i < limit; i++) {
      if (data[i] > threshold && i - lastPeak > minDistance) {
        if (lastPeak > 0) {
          intervals.push(i - lastPeak);
        }
        lastPeak = i;
        peakCount++;
      }
    }

    if (intervals.length > 5) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round((60 * sampleRate) / avgInterval);
      if (bpm >= 60 && bpm <= 180) return bpm;
    }
    return 120;
  }
}
