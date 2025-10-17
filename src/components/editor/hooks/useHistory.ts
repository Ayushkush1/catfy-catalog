'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';

export interface HistoryState {
  data: string;
  timestamp: number;
}

export interface UseHistoryOptions {
  maxHistorySize?: number;
  debounceDelay?: number;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export const useHistory = (options: UseHistoryOptions = {}) => {
  const { maxHistorySize = 50, debounceDelay = 500, onHistoryChange } = options;
  const { query, actions } = useEditor();
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const isUndoRedoRef = useRef(false);
  const lastSavedStateRef = useRef<string>('');

  // Initialize with current state
  useEffect(() => {
    const initialState = query.serialize();
    if (initialState && initialState !== '{}') {
      const historyItem: HistoryState = {
        data: initialState,
        timestamp: Date.now()
      };
      setHistory([historyItem]);
      setCurrentIndex(0);
      lastSavedStateRef.current = initialState;
    }
  }, []);

  // Save current state to history
  const saveState = useCallback(() => {
    if (isUndoRedoRef.current) {
      return; // Don't save state during undo/redo operations
    }

    const currentState = query.serialize();
    
    // Don't save if state hasn't changed
    if (currentState === lastSavedStateRef.current) {
      return;
    }

    const historyItem: HistoryState = {
      data: currentState,
      timestamp: Date.now()
    };

    setHistory(prevHistory => {
      // Remove any future history if we're not at the end
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      // Add new state
      newHistory.push(historyItem);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev));
        return newHistory;
      }
      
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });

    lastSavedStateRef.current = currentState;
  }, [query, currentIndex, maxHistorySize]);

  // Debounced save state
  const debouncedSaveState = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      saveState();
    }, debounceDelay);
  }, [saveState, debounceDelay]);

  // Undo operation
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const targetState = history[newIndex];
      
      if (targetState) {
        isUndoRedoRef.current = true;
        
        try {
          actions.clearEvents();
          const parsedData = JSON.parse(targetState.data);
          actions.deserialize(parsedData);
          setCurrentIndex(newIndex);
          lastSavedStateRef.current = targetState.data;
          
          console.log('✅ Undo successful, moved to index:', newIndex);
        } catch (error) {
          console.error('❌ Undo failed:', error);
        } finally {
          // Reset flag after a short delay to allow editor to settle
          setTimeout(() => {
            isUndoRedoRef.current = false;
          }, 100);
        }
      }
    }
  }, [currentIndex, history, actions]);

  // Redo operation
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const targetState = history[newIndex];
      
      if (targetState) {
        isUndoRedoRef.current = true;
        
        try {
          actions.clearEvents();
          const parsedData = JSON.parse(targetState.data);
          actions.deserialize(parsedData);
          setCurrentIndex(newIndex);
          lastSavedStateRef.current = targetState.data;
          
          console.log('✅ Redo successful, moved to index:', newIndex);
        } catch (error) {
          console.error('❌ Redo failed:', error);
        } finally {
          // Reset flag after a short delay to allow editor to settle
          setTimeout(() => {
            isUndoRedoRef.current = false;
          }, 100);
        }
      }
    }
  }, [currentIndex, history, actions]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    lastSavedStateRef.current = '';
  }, []);

  // Get history info
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Notify about history changes
  useEffect(() => {
    onHistoryChange?.(canUndo, canRedo);
  }, [canUndo, canRedo, onHistoryChange]);

  // Monitor editor changes and save state
  const { nodes } = useEditor((state) => ({
    nodes: state.nodes
  }));

  useEffect(() => {
    if (!isUndoRedoRef.current) {
      debouncedSaveState();
    }
  }, [nodes, debouncedSaveState]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    canUndo,
    canRedo,
    historyLength: history.length,
    currentIndex,
    
    // Actions
    undo,
    redo,
    saveState,
    clearHistory,
    
    // Manual state management
    forceSaveState: saveState,
  };
};

export default useHistory;