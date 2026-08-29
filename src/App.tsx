/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, Scene, AudioFileData, ClipConcept, VisualBible } from './types';
import { ProjectStorageService } from './services/storage';
import { LLMProviderAdapter } from './providers/LLMProviderAdapter';
import { VideoGenerationService } from './services/VideoGenerationService';
import { SAMPLE_SONGS, SampleSong } from './utils/sampleSongs';

// Components
import { Navbar } from './components/Navbar';
import { StepIndicator } from './components/StepIndicator';
import { AudioUploader } from './components/AudioUploader';
import { CreationForm } from './components/CreationForm';
import { ConceptView } from './components/ConceptView';
import { StoryboardView } from './components/StoryboardView';
import { GenerationView } from './components/GenerationView';
import { TimelineEditor } from './components/TimelineEditor';

// Modals
import { ExportModal } from './components/ExportModal';
import { VisualBibleModal } from './components/VisualBibleModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { CopyrightModal } from './components/CopyrightModal';
import { ProjectsDashboard } from './components/ProjectsDashboard';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project>(createNewEmptyProject());
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Sub-step in setup mode (0: Audio Uploader, 1: Creation Form)
  const [setupSubStep, setSetupSubStep] = useState<'upload' | 'form'>('upload');

  // AI Director Invocations & Progress
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStageMessage, setAnalysisStageMessage] = useState('');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [currentGeneratingSceneIndex, setCurrentGeneratingSceneIndex] = useState(0);

  // Modals state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVisualBibleModal, setShowVisualBibleModal] = useState(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  // Load projects from storage on mount
  useEffect(() => {
    const saved = ProjectStorageService.getAllProjects();
    setProjects(saved);

    const activeId = ProjectStorageService.getActiveProjectId();
    if (activeId) {
      const active = saved.find((p) => p.id === activeId);
      if (active) {
        setCurrentProject(active);
        if (active.status === 'SETUP' && active.audioFile) {
          setSetupSubStep('form');
        }
      }
    }
  }, []);

  // Autosave current project whenever it updates
  useEffect(() => {
    if (currentProject && currentProject.name) {
      ProjectStorageService.saveProject(currentProject);
      setProjects(ProjectStorageService.getAllProjects());
    }
  }, [currentProject]);

  function createNewEmptyProject(): Project {
    const defaultSample = SAMPLE_SONGS[0];
    return {
      id: `proj-${Date.now()}`,
      name: '',
      artist: '',
      genre: 'Pop / Synthwave',
      language: 'pt-BR',
      hasLyrics: true,
      lyrics: '',
      songMeaning: '',
      emotionalIntent: '',
      visualStyles: ['Cinematográfico', 'Futurista'],
      visualReference: '',
      dominantColors: ['#06b6d4', '#d946ef', '#1e1b4b'],
      universeInspiration: '',
      hasMainCharacter: 'ia_cria',
      masterCharacter: null,
      aspectRatio: '16:9',
      durationMode: 'full',
      alfineteNoMapa: '“Videoclipes que transformam sentimentos em imagens inesquecíveis.”',
      audioFile: null,
      status: 'SETUP',
      concept: null,
      visualBible: null,
      scenes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  const handleNewProject = () => {
    const newProj = createNewEmptyProject();
    setCurrentProject(newProj);
    setSetupSubStep('upload');
    ProjectStorageService.saveProject(newProj);
    setProjects(ProjectStorageService.getAllProjects());
  };

  const handleUpdateProject = (updated: Partial<Project>) => {
    setCurrentProject((prev) => ({
      ...prev,
      ...updated,
      updatedAt: Date.now(),
    }));
  };

  // 1. Audio Upload Handler
  const handleAudioSelected = (audio: AudioFileData, samplePreset?: SampleSong) => {
    if (samplePreset) {
      handleUpdateProject({
        name: samplePreset.name,
        artist: samplePreset.artist,
        genre: samplePreset.genre,
        lyrics: samplePreset.lyrics,
        hasLyrics: true,
        songMeaning: samplePreset.songMeaning,
        emotionalIntent: samplePreset.emotionalIntent,
        visualStyles: samplePreset.visualStyles,
        dominantColors: samplePreset.dominantColors,
        universeInspiration: samplePreset.universeInspiration,
        alfineteNoMapa: samplePreset.alfineteNoMapa,
        audioFile: audio,
        hasMainCharacter: 'sim',
        masterCharacter: samplePreset.masterCharacter,
      });
    } else {
      handleUpdateProject({
        audioFile: audio,
        name: currentProject.name || audio.name.replace(/\.[^/.]+$/, ''),
      });
    }
  };

  // 2. Submit for Concept Generation ("SEU CLIPE NASCEU AQUI")
  const handleSubmitForConcept = async () => {
    setIsAnalyzing(true);
    setAnalysisStageMessage('Ouvindo as frequências da sua música...');

    try {
      // Step 2.1: Musical analysis
      await new Promise((r) => setTimeout(r, 600));
      setAnalysisStageMessage('Encontrando o coração da narrativa e os arcos emocionais...');
      const analysis = await LLMProviderAdapter.analyzeSong(currentProject);

      // Step 2.2: Concept generation
      setAnalysisStageMessage('O Diretor IA está concebendo o universo visual e o Alfinete no Mapa...');
      await new Promise((r) => setTimeout(r, 800));
      const { concept, visualBible, masterCharacter } = await LLMProviderAdapter.generateConcept(
        currentProject,
        analysis
      );

      handleUpdateProject({
        analysis,
        concept,
        visualBible,
        masterCharacter: currentProject.masterCharacter || masterCharacter,
        status: 'CONCEITO',
      });
    } catch (err) {
      console.error('Analysis error', err);
      alert('Houve um problema ao conceber o videoclipe. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Approve Concept -> Generate Storyboard
  const handleApproveConcept = async () => {
    if (!currentProject.concept || !currentProject.visualBible) return;

    setIsAnalyzing(true);
    setAnalysisStageMessage('Decupando cenas e calculando movimentos de câmera...');

    try {
      const scenes = await LLMProviderAdapter.generateStoryboard(
        currentProject,
        currentProject.concept,
        currentProject.visualBible,
        currentProject.analysis!
      );

      handleUpdateProject({
        scenes,
        status: 'STORYBOARD',
      });
    } catch (err) {
      console.error('Storyboard generation error', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. Approve Storyboard -> Generation View
  const handleApproveStoryboard = async () => {
    const scenesToProcess = currentProject.scenes && currentProject.scenes.length > 0
      ? currentProject.scenes
      : [];

    handleUpdateProject({
      status: 'GERANDO',
    });

    // Automatically trigger scene generation immediately upon approval
    if (scenesToProcess.length > 0) {
      setTimeout(() => {
        handleStartBatchGeneration(scenesToProcess);
      }, 50);
    }
  };

  // 5. Batch Scene Generation
  const handleStartBatchGeneration = async (scenesOverride?: Scene[]) => {
    if (isGeneratingAll) return;
    setIsGeneratingAll(true);
    setGeneratingProgress(0);

    const videoService = VideoGenerationService.getInstance();
    videoService.setProviderMode(demoMode ? 'demo' : 'real');

    const sourceScenes = scenesOverride || currentProject.scenes;
    const updatedScenes = [...sourceScenes];

    for (let i = 0; i < updatedScenes.length; i++) {
      setCurrentGeneratingSceneIndex(i);
      const scene = updatedScenes[i];

      // Update scene status to generating
      updatedScenes[i] = { ...scene, status: 'generating' };
      handleUpdateProject({ scenes: [...updatedScenes] });

      try {
        const result = await videoService.generateScene(
          scene,
          currentProject.visualBible,
          currentProject.masterCharacter,
          currentProject.aspectRatio
        );

        updatedScenes[i] = {
          ...scene,
          status: 'ready',
          generatedAssetUrl: result.assetUrl,
          thumbnailUrl: result.thumbnailUrl,
          assetType: result.assetType,
        };
      } catch (err) {
        console.error(`Failed to generate scene ${i + 1}`, err);
        updatedScenes[i] = { ...scene, status: 'error' };
      }

      const progress = ((i + 1) / updatedScenes.length) * 100;
      setGeneratingProgress(progress);
      handleUpdateProject({ scenes: [...updatedScenes] });
    }

    setIsGeneratingAll(false);
  };

  // 6. Single Scene Regeneration (with Director feedback)
  const handleRegenerateScene = async (scene: Scene, preset: string, customNotes?: string) => {
    const videoService = VideoGenerationService.getInstance();
    videoService.setProviderMode(demoMode ? 'demo' : 'real');

    const updated = await LLMProviderAdapter.regenerateScene(
      scene,
      preset,
      customNotes || '',
      currentProject.visualBible,
      currentProject.masterCharacter
    );

    const result = await videoService.regenerateScene(updated, preset, customNotes);

    const newScenes = currentProject.scenes.map((s) =>
      s.id === scene.id
        ? {
            ...updated,
            status: 'ready' as const,
            generatedAssetUrl: result.assetUrl,
            thumbnailUrl: result.thumbnailUrl,
            assetType: result.assetType,
          }
        : s
    );

    handleUpdateProject({ scenes: newScenes });
  };

  // 7. Update Single Scene
  const handleUpdateScene = (sceneId: string, updated: Partial<Scene>) => {
    const newScenes = currentProject.scenes.map((s) => (s.id === sceneId ? { ...s, ...updated } : s));
    handleUpdateProject({ scenes: newScenes });
  };

  // 8. Delete Scene
  const handleDeleteScene = (sceneId: string) => {
    const filtered = currentProject.scenes.filter((s) => s.id !== sceneId);
    // Re-index scene order
    const reindexed = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    handleUpdateProject({ scenes: reindexed });
  };

  // 9. Add Scene
  const handleAddScene = () => {
    const count = currentProject.scenes.length;
    const lastScene = currentProject.scenes[count - 1];
    const startTime = lastScene ? lastScene.endTime : 0;
    const duration = 6;
    const endTime = startTime + duration;

    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      projectId: currentProject.id,
      order: count + 1,
      startTime,
      endTime,
      duration,
      musicSection: `Seção Nova (${startTime}s - ${endTime}s)`,
      lyricsSnippet: '',
      emotionalGoal: 'Elevação dramática e impacto visual',
      description: 'Plano cinematográfico adicional em sincronia com o ritmo.',
      visualSubject: currentProject.masterCharacter?.name || 'Protagonista',
      characterAction: 'Olhar focado e movimento cinematográfico fluido',
      setting: currentProject.visualBible?.setting || 'Locação cinematográfica',
      cameraMovement: 'Travelling dinâmico',
      lens: currentProject.visualBible?.lens || '35mm',
      lighting: currentProject.visualBible?.lighting || 'Luz de recorte suave',
      palette: currentProject.visualBible?.palette.join(', ') || '#06b6d4',
      visualPrompt: `Master shot for "${currentProject.name}", scene ${count + 1}`,
      videoPrompt: `Camera motion: Travelling dinâmico, cinematic lighting`,
      transition: 'cut',
      filter: 'cinematic_35mm',
      status: 'pending',
    };

    handleUpdateProject({ scenes: [...currentProject.scenes, newScene] });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentProject={currentProject}
        onNewProject={handleNewProject}
        onOpenProjects={() => setShowProjectsModal(true)}
        onOpenVisualBible={() => setShowVisualBibleModal(true)}
        onOpenApiConfig={() => setShowApiConfigModal(true)}
        onOpenCopyright={() => setShowCopyrightModal(true)}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(!demoMode)}
      />

      {/* Step Indicator */}
      <StepIndicator
        currentStatus={currentProject.status}
        onNavigateStep={(target) => handleUpdateProject({ status: target })}
      />

      {/* Main App Stage Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4">
        {/* STEP 1: SETUP (Audio Upload OR Creation Form) */}
        {currentProject.status === 'SETUP' && (
          <>
            {setupSubStep === 'upload' ? (
              <AudioUploader
                audioFile={currentProject.audioFile}
                onAudioSelected={(audio, sample) => {
                  handleAudioSelected(audio, sample);
                  setSetupSubStep('form');
                }}
                onContinue={() => setSetupSubStep('form')}
              />
            ) : (
              <CreationForm
                project={currentProject}
                onUpdateProject={handleUpdateProject}
                onSubmitForAnalysis={handleSubmitForConcept}
                onBackToAudio={() => setSetupSubStep('upload')}
                isAnalyzing={isAnalyzing}
                analysisStageMessage={analysisStageMessage}
              />
            )}
          </>
        )}

        {/* STEP 2: CONCEITO ("SEU CLIPE NASCEU AQUI") */}
        {currentProject.status === 'CONCEITO' && currentProject.concept && (
          <ConceptView
            project={currentProject}
            concept={currentProject.concept}
            analysis={currentProject.analysis || null}
            visualBible={currentProject.visualBible || null}
            onApproveConcept={handleApproveConcept}
            onRegenerateConcept={handleSubmitForConcept}
            onEditConcept={(updated) =>
              handleUpdateProject({
                concept: { ...currentProject.concept!, ...updated },
              })
            }
            isRegenerating={isAnalyzing}
          />
        )}

        {/* STEP 3: STORYBOARD */}
        {currentProject.status === 'STORYBOARD' && (
          <StoryboardView
            project={currentProject}
            scenes={currentProject.scenes}
            visualBible={currentProject.visualBible || null}
            masterCharacter={currentProject.masterCharacter || null}
            onUpdateScene={handleUpdateScene}
            onDeleteScene={handleDeleteScene}
            onAddScene={handleAddScene}
            onOpenVisualBible={() => setShowVisualBibleModal(true)}
            onApproveStoryboard={handleApproveStoryboard}
            onRegenerateSingleScene={(scene) =>
              handleRegenerateScene(scene, 'Mais cinematográfica')
            }
          />
        )}

        {/* STEP 4: GERAÇÃO */}
        {currentProject.status === 'GERANDO' && (
          <GenerationView
            project={currentProject}
            scenes={currentProject.scenes}
            isGeneratingAll={isGeneratingAll}
            generatingProgress={generatingProgress}
            currentGeneratingSceneIndex={currentGeneratingSceneIndex}
            onStartBatchGeneration={handleStartBatchGeneration}
            onRegenerateScene={handleRegenerateScene}
            onGoToEditor={() => handleUpdateProject({ status: 'EDITANDO' })}
            demoMode={demoMode}
          />
        )}

        {/* STEP 5: EDITOR & TIMELINE */}
        {(currentProject.status === 'EDITANDO' || currentProject.status === 'FINALIZADO') && (
          <TimelineEditor
            project={currentProject}
            scenes={currentProject.scenes}
            onUpdateScene={handleUpdateScene}
            onOpenExportModal={() => setShowExportModal(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      {showExportModal && (
        <ExportModal
          project={currentProject}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showVisualBibleModal && (
        <VisualBibleModal
          visualBible={currentProject.visualBible || null}
          masterCharacter={currentProject.masterCharacter || null}
          onClose={() => setShowVisualBibleModal(false)}
        />
      )}

      {showApiConfigModal && (
        <ApiConfigModal
          onClose={() => setShowApiConfigModal(false)}
          demoMode={demoMode}
          onToggleDemoMode={() => setDemoMode(!demoMode)}
        />
      )}

      {showCopyrightModal && (
        <CopyrightModal onClose={() => setShowCopyrightModal(false)} />
      )}

      {showProjectsModal && (
        <ProjectsDashboard
          projects={projects}
          activeProjectId={currentProject.id}
          onSelectProject={(proj) => {
            setCurrentProject(proj);
            if (proj.status === 'SETUP' && proj.audioFile) {
              setSetupSubStep('form');
            }
          }}
          onDeleteProject={(id) => {
            ProjectStorageService.deleteProject(id);
            const remaining = ProjectStorageService.getAllProjects();
            setProjects(remaining);
            if (currentProject.id === id) {
              handleNewProject();
            }
          }}
          onNewProject={handleNewProject}
          onClose={() => setShowProjectsModal(false)}
        />
      )}
    </div>
  );
}
export default App;
