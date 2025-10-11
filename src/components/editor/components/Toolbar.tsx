'use client';

import React, { useEffect, useState } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCcw,
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  FileText,
  Image,
  FileDown,
  Code,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { isClientAdmin } from '@/lib/client-auth';

interface ToolbarProps {
  onSave: () => void;
  onExport: (type: 'pdf' | 'png' | 'json' | 'html') => void;
  onImport?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  onDeviceModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  previewMode: boolean;
  onPreviewModeToggle: () => void;
  onShowLeftSidebar: () => void;
  showLeftSidebar: boolean;
  onShowLayers: () => void;
  showLayers: boolean;
  onShowInspector: () => void;
  showInspector: boolean;
  onTogglePagesTab?: () => void;
  showPagesTab?: boolean;
  backButton?: {
    href: string;
    catalogueName: string;
  };
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onSave,
  onExport,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetZoom,
  deviceMode,
  onDeviceModeChange,
  previewMode,
  onPreviewModeToggle,
  onShowLeftSidebar,
  showLeftSidebar,
  onShowLayers,
  showLayers,
  onShowInspector,
  showInspector,
  onTogglePagesTab,
  showPagesTab = true,
  backButton
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isClientAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const exportOptions = [
    { type: 'pdf' as const, label: 'Export as PDF', icon: <FileText className="w-4 h-4" /> },
    { type: 'png' as const, label: 'Export as PNG', icon: <Image className="w-4 h-4" /> },
    { type: 'json' as const, label: 'Export as JSON', icon: <FileDown className="w-4 h-4" /> },
    { type: 'html' as const, label: 'Export as HTML', icon: <Code className="w-4 h-4" /> }
  ];

  const deviceModes = [
    { mode: 'desktop' as const, label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
    { mode: 'tablet' as const, label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { mode: 'mobile' as const, label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> }
  ];

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-3">
      {/* Left Section - File Actions */}
      <div className="flex items-center space-x-1">
        {/* Back to Templates Button - Only visible for admin users */}
        {isAdmin && (
          <Link 
            href="/themes"
            className="flex items-center px-2 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors text-sm"
            title="Back to Templates"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Templates
          </Link>
        )}
        
        {backButton && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <Link 
              href={backButton.href}
              className="flex items-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Back to Edit"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-sm font-medium text-gray-900 ml-1">
              {backButton.catalogueName}
            </span>
          </>
        )}
        
        <button
          onClick={onSave}
          className="flex items-center px-2 py-1 bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white rounded-md hover:from-[#1E1338] hover:to-[#4F46E5] transition-all duration-200 text-sm font-medium"
        >
          <Save className="w-4 h-4 mr-1.5" />
          Save
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </button>

          {showExportMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {exportOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    onExport(option.type);
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={onImport}
          disabled={!onImport}
          className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          Import
        </button>
      </div>

      {/* Center Section - History & Zoom */}
      <div className="flex items-center space-x-2">
        {/* History Controls */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-0.5 border-l border-gray-200 pl-2">
          <button
            onClick={onZoomOut}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <div className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-medium text-gray-700 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </div>
          
          <button
            onClick={onZoomIn}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={onFitToScreen}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Fit to Screen"
          >
            <Maximize className="w-4 h-4" />
          </button>
          
          <button
            onClick={onResetZoom}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Section - View Controls */}
      <div className="flex items-center space-x-1">
        {/* Device Mode Switcher */}
        <div className="flex items-center bg-gray-100 rounded-md p-0.5">
          {deviceModes.map((device) => (
            <button
              key={device.mode}
              onClick={() => onDeviceModeChange(device.mode)}
              className={`p-1.5 rounded-md transition-colors ${
                deviceMode === device.mode
                  ? 'bg-white text-[#2D1B69] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={device.label}
            >
              {device.icon}
            </button>
          ))}
        </div>

        {/* Preview Mode Toggle */}
        <button
          onClick={onPreviewModeToggle}
          className={`flex items-center px-2 py-1 rounded-md transition-colors text-sm ${
            previewMode
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {previewMode ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
          {previewMode ? 'Edit' : 'Preview'}
        </button>

        {/* Left Sidebar Toggle (Pages/Components) */}
        <button
          onClick={onShowLeftSidebar}
          className={`flex items-center px-2 py-1 rounded-md transition-colors text-sm ${
            showLeftSidebar
              ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          Pages
        </button>

        {/* Layers Toggle */}
        <button
          onClick={onShowLayers}
          className={`flex items-center px-2 py-1 rounded-md transition-colors text-sm ${
            showLayers
              ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-4 h-4 mr-1.5" />
          Layers
        </button>

        {/* Inspector Toggle */}
        <button
          onClick={onShowInspector}
          className={`flex items-center px-2 py-1 rounded-md transition-colors text-sm ${
            showInspector
              ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Code className="w-4 h-4 mr-1.5" />
          Style
        </button>
      </div>
    </div>
  );
};