/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types';

const STORAGE_KEY = 'clipe_ai_projects_v1';
const ACTIVE_PROJECT_KEY = 'clipe_ai_active_project_id';

export class ProjectStorageService {
  public static getAllProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static getProjectById(id: string): Project | null {
    const projects = ProjectStorageService.getAllProjects();
    return projects.find((p) => p.id === id) || null;
  }

  public static saveProject(project: Project): void {
    try {
      const projects = ProjectStorageService.getAllProjects();
      const existingIndex = projects.findIndex((p) => p.id === project.id);
      const updatedProject = { ...project, updatedAt: Date.now() };

      if (existingIndex >= 0) {
        projects[existingIndex] = updatedProject;
      } else {
        projects.unshift(updatedProject);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    } catch (e) {
      console.warn('Failed to save project to localStorage', e);
    }
  }

  public static deleteProject(id: string): void {
    try {
      const projects = ProjectStorageService.getAllProjects().filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to delete project', e);
    }
  }

  public static getActiveProjectId(): string | null {
    return localStorage.getItem(ACTIVE_PROJECT_KEY);
  }

  public static setActiveProjectId(id: string): void {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  }
}
