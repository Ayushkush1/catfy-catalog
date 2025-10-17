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
  Share2,
  FileText,
  Settings,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { isClientAdmin } from '@/lib/client-auth';

interface CanvaToolbarProps {
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
  backButton?: {
    href: string;
    catalogueName: string;
  };
  templateName?: string;
}

export const CanvaToolbar: React.FC<CanvaToolbarProps> = ({
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
  backButton,
  templateName
}) => {
  const [showResizeMenu, setShowResizeMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
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
    { type: 'pdf' as const, label: 'Download as PDF', icon: <FileText className="w-4 h-4" /> },
    { type: 'png' as const, label: 'Download as PNG', icon: <Download className="w-4 h-4" /> },
    { type: 'json' as const, label: 'Export as JSON', icon: <FileText className="w-4 h-4" /> },
    { type: 'html' as const, label: 'Export as HTML', icon: <FileText className="w-4 h-4" /> }
  ];

  const deviceModes = [
    { mode: 'desktop' as const, label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
    { mode: 'tablet' as const, label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { mode: 'mobile' as const, label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> }
  ];

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section - Back Button and Navigation */}
      <div className="flex items-center space-x-3">
        {/* Back Button */}
        {isAdmin ? (
          <Link 
            href="/admin?tab=templates"
            className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md transition-colors text-sm hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10"
            title="Back to Admin Templates"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        ) : backButton ? (
          <Link 
            href={backButton.href}
            className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md transition-colors text-sm hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        ) : null}

        {/* Resize Menu */}
        <div className="relative">
          <button
            onClick={() => setShowResizeMenu(!showResizeMenu)}
            className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md transition-colors text-sm font-medium hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10"
            aria-expanded={showResizeMenu}
          >
            Resize
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {showResizeMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {deviceModes.map((device) => (
                <button
                  key={device.mode}
                  onClick={() => {
                    onDeviceModeChange(device.mode);
                    setShowResizeMenu(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    deviceMode === device.mode
                      ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {device.icon}
                  <span className="ml-3">{device.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editing Toggle */}
        <button
          onClick={onPreviewModeToggle}
          className={`flex items-center px-3 py-2 rounded-md transition-colors text-sm font-medium ${
            previewMode
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20'
          }`}
        >
          {previewMode ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
          {previewMode ? 'Present' : 'Editing'}
        </button>
      </div>

      {/* Center Section - History & Zoom */}
      <div className="flex items-center space-x-2">
        {/* History Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border-l border-gray-200 pl-3">
          <button
            onClick={onZoomOut}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <div className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </div>
          
          <button
            onClick={onZoomIn}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={onFitToScreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fit to Screen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Section - Template Name, Save, Share and Profile */}
      <div className="flex items-center space-x-3">
        {/* Template Name (for admin) or Catalogue Name (for users) */}
        {templateName && (
          <div className="text-sm font-medium text-gray-700 px-3 py-2 bg-gray-50 rounded-lg">
            {templateName}
          </div>
        )}
        {!templateName && backButton?.catalogueName && (
          <div className="text-sm font-medium text-gray-700 px-3 py-2 bg-gray-50 rounded-lg">
            {backButton.catalogueName}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={onSave}
          className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md transition-colors text-sm font-medium hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>

        {/* Share Menu with Export Options */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white rounded-md hover:from-[#1E1338] hover:to-[#4F46E5] transition-colors text-sm font-medium"
            aria-expanded={showShareMenu}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>

          {showShareMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  onSave();
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
              >
                <Save className="w-4 h-4 mr-3" />
                Save & Share
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              {exportOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    onExport(option.type);
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  {option.icon}
                  <span className="ml-3">{option.label}</span>
                </button>
              ))}

              {onImport && (
                <>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={() => {
                      onImport();
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                  >
                    <Upload className="w-4 h-4 mr-3" />
                    Import
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <ProfileDropdown />
      </div>
    </div>
  );
};