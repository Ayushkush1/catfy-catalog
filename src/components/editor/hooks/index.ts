// Custom Hooks
export { useMultiPage } from './useMultiPage';
export { useZoom } from './useZoom';
export { useDeviceMode } from './useDeviceMode';
export { useExportImport } from './useExportImport';

// Export types
export type { UseMultiPageOptions } from './useMultiPage';
export type { UseZoomOptions } from './useZoom';
export type { DeviceMode, DeviceConfig, UseDeviceModeOptions } from './useDeviceMode';
export type { ExportOptions, ImportOptions } from './useExportImport';

// Hook return types
export interface UseMultiPageReturn {
  // State
  pages: any[];
  currentPageId: string | null;
  currentPage: any;
  currentPageIndex: number;
  
  // Actions
  switchToPage: (pageId: string) => void;
  addPage: (name?: string) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, newName: string) => void;
  reorderPages: (startIndex: number, endIndex: number) => void;
  loadPages: (pagesData: any[]) => void;
  getAllPagesData: () => any[];
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  updatePageData: (pageId: string, data: any) => void;
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
  
  // Utilities
  getCanvasStyle: () => React.CSSProperties;
  getNextZoomLevel: () => number;
  getPreviousZoomLevel: () => number;
}

export interface UseDeviceModeReturn {
  // State
  currentMode: import('./useDeviceMode').DeviceMode;
  currentDevice: any;
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

export interface UseExportImportReturn {
  // Export functions
  exportAsPNG: (canvasElement: HTMLElement, options?: any) => Promise<string>;
  exportAsPDF: (pages: any[], canvasElements: HTMLElement[], options?: any) => Promise<void>;
  exportAsJSON: (pages: any[], options?: any) => void;
  exportAsHTML: (pages: any[], options?: any) => void;

  // Import functions
  importFromJSON: (file: File, options?: any) => Promise<any[]>;
  importPageData: (file: File, options?: any) => Promise<string>;
  triggerImport: (onImport: (file: File) => void, accept?: string) => void;

  // Utility functions
  getCurrentPageData: () => string;
  loadPageData: (data: string) => boolean;
  convertCraftJSToHTML: (nodeData: any) => string;

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
}