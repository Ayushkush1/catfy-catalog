'use client';

import { useState, useCallback, useRef } from 'react';
import { useEditor } from '@craftjs/core';
import { Page } from '../ui';

export interface UseMultiPageOptions {
  onPageChange?: (pageId: string) => void;
  onPagesUpdate?: (pages: Page[]) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const useMultiPage = (options: UseMultiPageOptions = {}) => {
  const { onPageChange, onPagesUpdate, autoSave = true, autoSaveDelay = 1000 } = options;
  const { actions, query } = useEditor();
  
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'page-1',
      name: 'Page 1',
      data: '{}',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  
  const [currentPageId, setCurrentPageId] = useState<string>('page-1');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Get current page
  const currentPage = pages.find(page => page.id === currentPageId);
  const currentPageIndex = pages.findIndex(page => page.id === currentPageId);

  // Auto-save functionality - disabled to prevent blocks from disappearing
  const scheduleAutoSave = useCallback(() => {
    // Temporarily disabled auto-save to prevent editor state conflicts
    // TODO: Implement proper auto-save that doesn't interfere with editor state
    return;
  }, []);

  // Update page data
  const updatePageData = useCallback((pageId: string, data: string) => {
    setPages(prevPages => {
      const updatedPages = prevPages.map(page =>
        page.id === pageId
          ? { ...page, data, updatedAt: new Date() }
          : page
      );
      onPagesUpdate?.(updatedPages);
      return updatedPages;
    });
  }, [onPagesUpdate]);

  // Switch to a different page
  const switchToPage = useCallback((pageId: string) => {
    if (pageId === currentPageId) return;

    const targetPage = pages.find(page => page.id === pageId);
    if (!targetPage) return;

    // Only save and switch if we have multiple pages
    if (pages.length > 1) {
      // Save current page data before switching
      const currentPageData = query.serialize();
      updatePageData(currentPageId, currentPageData);

      // Load target page data only if it's not empty
      try {
        if (targetPage.data && targetPage.data !== '{}') {
          const parsed = typeof targetPage.data === 'string'
            ? JSON.parse(targetPage.data)
            : targetPage.data;
          actions.deserialize(parsed);
        }
        setCurrentPageId(pageId);
        onPageChange?.(pageId);
      } catch (error) {
        console.error('Failed to load page data:', error);
        // Don't fallback to empty canvas, just switch the page ID
        setCurrentPageId(pageId);
        onPageChange?.(pageId);
      }
    } else {
      // For single page, just update the current page ID
      setCurrentPageId(pageId);
      onPageChange?.(pageId);
    }
  }, [currentPageId, pages, query, actions, updatePageData, onPageChange]);

  // Add a new page
  const addPage = useCallback((name?: string, templateData?: string) => {
    const newPageId = `page-${Date.now()}`;
    const newPage: Page = {
      id: newPageId,
      name: name || `Page ${pages.length + 1}`,
      data: templateData || '{}',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setPages(prevPages => {
      const updatedPages = [...prevPages, newPage];
      onPagesUpdate?.(updatedPages);
      return updatedPages;
    });

    // Switch to the new page
    switchToPage(newPageId);

    return newPageId;
  }, [pages.length, switchToPage, onPagesUpdate]);

  // Duplicate a page
  const duplicatePage = useCallback((pageId: string) => {
    const sourcePage = pages.find(page => page.id === pageId);
    if (!sourcePage) return;

    const newPageId = `page-${Date.now()}`;
    const newPage: Page = {
      id: newPageId,
      name: `${sourcePage.name} (Copy)`,
      data: sourcePage.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setPages(prevPages => {
      const sourceIndex = prevPages.findIndex(page => page.id === pageId);
      const updatedPages = [
        ...prevPages.slice(0, sourceIndex + 1),
        newPage,
        ...prevPages.slice(sourceIndex + 1)
      ];
      onPagesUpdate?.(updatedPages);
      return updatedPages;
    });

    return newPageId;
  }, [pages, onPagesUpdate]);

  // Delete a page
  const deletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) {
      console.warn('Cannot delete the last page');
      return false;
    }

    const pageIndex = pages.findIndex(page => page.id === pageId);
    if (pageIndex === -1) return false;

    setPages(prevPages => {
      const updatedPages = prevPages.filter(page => page.id !== pageId);
      onPagesUpdate?.(updatedPages);
      return updatedPages;
    });

    // If we deleted the current page, switch to another page
    if (pageId === currentPageId) {
      const remainingPages = pages.filter(page => page.id !== pageId);
      if (remainingPages.length > 0) {
        // Switch to the previous page, or the first page if we deleted the first one
        const targetIndex = Math.max(0, pageIndex - 1);
        const targetPage = remainingPages[targetIndex];
        switchToPage(targetPage.id);
      }
    }

    return true;
  }, [pages, currentPageId, switchToPage, onPagesUpdate]);

  // Rename a page
  const renamePage = useCallback((pageId: string, newName: string) => {
    setPages(prevPages => {
      const updatedPages = prevPages.map(page =>
        page.id === pageId
          ? { ...page, name: newName, updatedAt: new Date() }
          : page
      );
      onPagesUpdate?.(updatedPages);
      return updatedPages;
    });
  }, [onPagesUpdate]);

  // Reorder pages
  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPages(prevPages => {
      const updatedPages = [...prevPages];
      const [movedPage] = updatedPages.splice(fromIndex, 1);
      updatedPages.splice(toIndex, 0, movedPage);
      onPagesUpdate?.(updatedPages);
      return updatedPages;
    });
  }, [onPagesUpdate]);

  // Load pages from external source
  const loadPages = useCallback((newPages: Page[], initialPageId?: string) => {
    console.log('🔄 Loading pages:', newPages.length);
    console.log('📄 Pages data:', newPages.map(p => ({ id: p.id, name: p.name, dataLength: p.data.length })));
    
    if (newPages.length === 0) return;

    setPages(newPages);
    onPagesUpdate?.(newPages);

    const targetPageId = initialPageId || newPages[0].id;
    const targetPage = newPages.find(page => page.id === targetPageId);
    
    if (targetPage) {
      try {
        console.log('🎯 Loading target page:', targetPage.name);
        console.log('📊 Page data preview:', targetPage.data.substring(0, 200) + '...');
        
        const parsed = typeof targetPage.data === 'string'
          ? JSON.parse(targetPage.data)
          : targetPage.data;
          
        console.log('✅ Parsed data structure:', Object.keys(parsed));
        console.log('🏗️ ROOT node exists:', !!parsed.ROOT);
        
        if (parsed.ROOT) {
          console.log('🔧 ROOT node type:', parsed.ROOT.type?.resolvedName);
          console.log('📦 ROOT node children:', parsed.ROOT.nodes?.length || 0);
        }
        
        console.log('🚀 Calling actions.deserialize...');
        actions.deserialize(parsed);
        console.log('✅ Deserialization completed successfully');
        
        setCurrentPageId(targetPageId);
        onPageChange?.(targetPageId);
        
        // Force a re-render after a short delay
        setTimeout(() => {
          console.log('🔄 Forcing editor refresh...');
          const currentNodes = query.getNodes();
          console.log('📊 Current editor nodes:', Object.keys(currentNodes).length);
          console.log('🏗️ Node types:', Object.values(currentNodes).map(n => n.data.displayName || n.data.type));
        }, 100);
        
      } catch (error) {
        console.error('❌ Failed to load page data:', error);
        console.error('📊 Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          pageData: targetPage.data.substring(0, 500)
        });
        
        const emptyState = {
          ROOT: {
            type: { resolvedName: 'ContainerBlock' },
            isCanvas: true,
            props: {},
            displayName: 'Container',
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {},
            parent: null as any
          }
        } as any;
        actions.deserialize(emptyState);
      }
    } else {
      console.error('❌ Target page not found:', targetPageId);
    }
  }, [actions, query, onPageChange, onPagesUpdate]);

  // Get all pages data for export
  const getAllPagesData = useCallback(() => {
    // Save current page data first
    const currentPageData = query.serialize();
    const updatedPages = pages.map(page =>
      page.id === currentPageId
        ? { ...page, data: currentPageData, updatedAt: new Date() }
        : page
    );

    return updatedPages;
  }, [pages, currentPageId, query]);

  // Navigate to next/previous page
  const goToNextPage = useCallback(() => {
    const currentIndex = pages.findIndex(page => page.id === currentPageId);
    if (currentIndex < pages.length - 1) {
      switchToPage(pages[currentIndex + 1].id);
    }
  }, [pages, currentPageId, switchToPage]);

  const goToPreviousPage = useCallback(() => {
    const currentIndex = pages.findIndex(page => page.id === currentPageId);
    if (currentIndex > 0) {
      switchToPage(pages[currentIndex - 1].id);
    }
  }, [pages, currentPageId, switchToPage]);

  return {
    // State
    pages,
    currentPageId,
    currentPage,
    currentPageIndex,
    
    // Actions
    switchToPage,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    reorderPages,
    loadPages,
    getAllPagesData,
    goToNextPage,
    goToPreviousPage,
    updatePageData,
    scheduleAutoSave,
  };
};