'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseZoomOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  onZoomChange?: (zoom: number) => void;
}

export const useZoom = (options: UseZoomOptions = {}) => {
  const {
    initialZoom = 1,
    minZoom = 0.1,
    maxZoom = 5,
    zoomStep = 0.03,
    onZoomChange
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Update zoom level
  const updateZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
    setZoom(clampedZoom);
    onZoomChange?.(clampedZoom);
  }, [minZoom, maxZoom, onZoomChange]);

  // Zoom in
  const zoomIn = useCallback(() => {
    updateZoom(zoom + zoomStep);
  }, [zoom, zoomStep, updateZoom]);

  // Zoom out
  const zoomOut = useCallback(() => {
    updateZoom(zoom - zoomStep);
  }, [zoom, zoomStep, updateZoom]);

  // Reset zoom to 100%
  const resetZoom = useCallback(() => {
    updateZoom(1);
  }, [updateZoom]);

  // Fit to screen
  const fitToScreen = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate zoom to fit both width and height with some padding
    const padding = 40; // 20px padding on each side
    const scaleX = (containerRect.width - padding) / canvasRect.width;
    const scaleY = (containerRect.height - padding) / canvasRect.height;
    
    // Use the smaller scale to ensure it fits in both dimensions
    const newZoom = Math.min(scaleX, scaleY) * zoom;
    updateZoom(newZoom);
  }, [zoom, updateZoom]);

  // Set specific zoom level
  const setZoomLevel = useCallback((level: number) => {
    updateZoom(level);
  }, [updateZoom]);

  // Zoom to specific percentage
  const zoomToPercentage = useCallback((percentage: number) => {
    updateZoom(percentage / 100);
  }, [updateZoom]);

  // Handle mouse wheel zoom
  const handleWheelZoom = useCallback((event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      
      const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
      updateZoom(zoom + delta);
    }
  }, [zoom, zoomStep, updateZoom]);

  // Keyboard shortcuts
  const handleKeyboardZoom = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '=':
        case '+':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        case '0':
          event.preventDefault();
          resetZoom();
          break;
        case '1':
          if (event.shiftKey) {
            event.preventDefault();
            fitToScreen();
          }
          break;
      }
    }
  }, [zoomIn, zoomOut, resetZoom, fitToScreen]);

  // Setup event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add wheel event listener for zoom
    canvas.addEventListener('wheel', handleWheelZoom, { passive: false });

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyboardZoom);

    return () => {
      canvas.removeEventListener('wheel', handleWheelZoom);
      document.removeEventListener('keydown', handleKeyboardZoom);
    };
  }, [handleWheelZoom, handleKeyboardZoom]);

  // Get zoom percentage
  const zoomPercentage = Math.round(zoom * 100);

  // Check if zoom is at limits
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  // Predefined zoom levels
  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];

  // Get next/previous zoom level
  const getNextZoomLevel = useCallback(() => {
    const currentIndex = zoomLevels.findIndex(level => level >= zoom);
    return currentIndex < zoomLevels.length - 1 ? zoomLevels[currentIndex + 1] : maxZoom;
  }, [zoom, maxZoom]);

  const getPreviousZoomLevel = useCallback(() => {
    const currentIndex = zoomLevels.findIndex(level => level >= zoom);
    return currentIndex > 0 ? zoomLevels[currentIndex - 1] : minZoom;
  }, [zoom, minZoom]);

  // Zoom to next/previous level
  const zoomToNextLevel = useCallback(() => {
    updateZoom(getNextZoomLevel());
  }, [getNextZoomLevel, updateZoom]);

  const zoomToPreviousLevel = useCallback(() => {
    updateZoom(getPreviousZoomLevel());
  }, [getPreviousZoomLevel, updateZoom]);

  // Get transform style for canvas
  const getCanvasStyle = useCallback(() => ({
    transform: `scale(${zoom})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease-out',
  }), [zoom]);

  return {
    // State
    zoom,
    zoomPercentage,
    canZoomIn,
    canZoomOut,
    zoomLevels,
    canvasRef,

    // Actions
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    setZoomLevel,
    zoomToPercentage,
    zoomToNextLevel,
    zoomToPreviousLevel,
    getCanvasStyle,

    // Utilities
    getNextZoomLevel,
    getPreviousZoomLevel,
  };
};