// Custom Hooks
export { useMultiPage } from './useMultiPage';
export { useZoom } from './useZoom';
export { useDeviceMode } from './useDeviceMode';
export { useExportImport } from './useExportImport';
export { useHistory } from './useHistory';

// Import types
import { Page } from '../ui';
import { DeviceConfig } from './useDeviceMode';

// Export types
export type { UseMultiPageOptions } from './useMultiPage';
export type { UseZoomOptions } from './useZoom';
export type { DeviceMode, DeviceConfig, UseDeviceModeOptions } from './useDeviceMode';
export type { ExportOptions, ImportOptions } from './useExportImport';

// Hook return types
export interface UseMultiPageReturn {
  // State
  pages: Page[];
  currentPageId: string | null;
  currentPage: Page | undefined;
  currentPageIndex: number;
  
  // Actions
  switchToPage: (pageId: string) => void;
  addPage: (name?: string) => void;
  addPages: (newPages: Page[], switchToFirstImported?: boolean) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, newName: string) => void;
  reorderPages: (startIndex: number, endIndex: number) => void;
  loadPages: (pagesData: Page[]) => void;
  getAllPagesData: () => Page[];
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  updatePageData: (pageId: string, data: string) => void;
  scheduleAutoSave: () => void;
}

export interface UseZoomReturn {
  // State
  zoom: number;
  zoomPercentage: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomLevels: number[];
  canvasRef: React.RefObject<HTMLDivElement>;

  // Actions
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  setZoomLevel: (level: number) => void;
  zoomToPercentage: (percentage: number) => void;
  zoomToNextLevel: () => void;
  zoomToPreviousLevel: () => void;
  getCanvasStyle: () => React.CSSProperties;

  // Utilities
  getNextZoomLevel: () => number;
  getPreviousZoomLevel: () => number;
}

export interface UseDeviceModeReturn {
  // State
  currentMode: import('./useDeviceMode').DeviceMode;
  currentDevice: DeviceConfig;
  isTransitioning: boolean;
  availableModes: import('./useDeviceMode').DeviceMode[];
  isTouchDevice: boolean;
  
  // Actions
  switchMode: (mode: import('./useDeviceMode').DeviceMode) => void;
  cycleMode: () => void;
  autoDetectMode: () => void;
  rotateDevice: () => void;
  
  // Utilities
  getCanvasDimensions: () => { width: number; height: number; maxWidth: string; aspectRatio: number };
  getResponsiveClasses: () => string;
  getContainerStyle: () => React.CSSProperties;
  getMediaQuery: (mode: import('./useDeviceMode').DeviceMode) => string;
  getOrientation: () => 'portrait' | 'landscape';
  matchesBreakpoint: (breakpoint: string) => boolean;
  
  // Device configs
  devices: Record<string, any>;
}

export interface UseHistoryReturn {
  // State
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  currentIndex: number;
  
  // Actions
  undo: () => void;
  redo: () => void;
  saveState: () => void;
  clearHistory: () => void;
  
  // Manual state management
  forceSaveState: () => void;
}

export interface UseExportImportReturn {
  // Export functions
  exportAsPNG: (canvasElement: HTMLElement, options?: Partial<import('./useExportImport').ExportOptions>) => Promise<string>;
  exportAsPDF: (pages: Page[], canvasElements: HTMLElement[], options?: Partial<import('./useExportImport').ExportOptions>) => Promise<void>;
  exportAsJSON: (pages: Page[], options?: Partial<import('./useExportImport').ExportOptions>) => void;
  exportAsHTML: (pages: Page[], options?: Partial<import('./useExportImport').ExportOptions>) => void;

  // Import functions
  importFromJSON: (file: File, options?: import('./useExportImport').ImportOptions) => Promise<Page[]>;
  importPageData: (file: File, options?: import('./useExportImport').ImportOptions) => Promise<string>;
  triggerImport: (onImport: (file: File) => void, accept?: string) => void;

  // Utility functions
  getCurrentPageData: () => string;
  loadPageData: (data: string) => boolean;
  convertCraftJSToHTML: (jsonData: string) => string;

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
}