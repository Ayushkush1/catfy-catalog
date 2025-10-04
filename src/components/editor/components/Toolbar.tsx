'use client';

import React from 'react';
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

interface ToolbarProps {
  onSave: () => void;
  onExport: (type: 'pdf' | 'png' | 'json' | 'html') => void;
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
  onShowLayers: () => void;
  showLayers: boolean;
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
  onShowLayers,
  showLayers,
  onTogglePagesTab,
  showPagesTab = true,
  backButton
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

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
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section - File Actions */}
      <div className="flex items-center space-x-2">
        {backButton && (
          <>
            <Link 
              href={backButton.href}
              className="flex items-center p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
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

        <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </button>
      </div>

      {/* Center Section - History & Zoom */}
      <div className="flex items-center space-x-4">
        {/* History Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border-l border-gray-200 pl-4">
          <button
            onClick={onZoomOut}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <div className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </div>
          
          <button
            onClick={onZoomIn}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={onFitToScreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Fit to Screen"
          >
            <Maximize className="w-4 h-4" />
          </button>
          
          <button
            onClick={onResetZoom}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Section - View Controls */}
      <div className="flex items-center space-x-2">
        {/* Device Mode Switcher */}
        <div className="flex items-center bg-gray-100 rounded-md p-1">
          {deviceModes.map((device) => (
            <button
              key={device.mode}
              onClick={() => onDeviceModeChange(device.mode)}
              className={`p-2 rounded-md transition-colors ${
                deviceMode === device.mode
                  ? 'bg-white text-blue-600 shadow-sm'
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
          className={`flex items-center px-3 py-2 rounded-md transition-colors text-sm ${
            previewMode
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {previewMode ? 'Edit' : 'Preview'}
        </button>

        {/* Pages Toggle removed per UI update */}

        {/* Layers Toggle */}
        <button
          onClick={onShowLayers}
          className={`flex items-center px-3 py-2 rounded-md transition-colors text-sm ${
            showLayers
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-4 h-4 mr-2" />
          Layers
        </button>
      </div>
    </div>
  );
};