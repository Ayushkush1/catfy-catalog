import { Template } from '../types';
import { createTemplate, createContainer, createHeading, createGrid, createNode } from '../utils/template-builder';

/**
 * Feature Grid Template
 * Migrated from the original PrebuiltTemplates.ts to demonstrate modular structure
 */
export const featureGridTemplate: Template = createTemplate()
  .setId('feature-grid')
  .setName('Feature Grid')
  .setDescription('A 3-column grid showcasing features with icons and descriptions')
  .setCategory('content')
  .addTags('features', 'grid', 'icons', 'services')
  .setData({
    "ROOT": {
      ...createContainer('ROOT', {
        padding: 64,
        backgroundColor: "#f9fafb"
      }, "Container", ["features-heading", "features-grid"])
    },
    "features-heading": {
      ...createHeading(
        "Our Features",
        2,
        {
          fontSize: 36,
          fontWeight: "bold",
          color: "#1f2937",
          textAlign: "center",
          marginBottom: 48
        },
        "Heading",
        "ROOT"
      )
    },
    "features-grid": {
      ...createGrid(
        3,
        {
          gap: 32,
          gridTemplateColumns: "repeat(3, 1fr)"
        },
        "Grid",
        ["feature-1", "feature-2", "feature-3"],
        "ROOT"
      )
    },
    "feature-1": {
      ...createContainer('feature-1', {
        padding: 24,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }, "Container", ["feature-1-icon", "feature-1-title", "feature-1-desc"], "features-grid")
    },
    "feature-1-icon": {
      ...createNode('IconBlock', {
        icon: "Zap",
        size: 48,
        color: "#3b82f6",
        marginBottom: 16
      }, "Icon", false, [], "feature-1")
    },
    "feature-1-title": {
      ...createHeading(
        "Fast Performance",
        3,
        {
          fontSize: 20,
          fontWeight: "semibold",
          color: "#1f2937",
          marginBottom: 8
        },
        "Heading",
        "feature-1"
      )
    },
    "feature-1-desc": {
      ...createNode('TextBlock', {
        text: "Lightning-fast loading times and optimized performance for the best user experience.",
        fontSize: 14,
        color: "#6b7280"
      }, "Text", false, [], "feature-1")
    },
    "feature-2": {
      ...createContainer('feature-2', {
        padding: 24,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }, "Container", ["feature-2-icon", "feature-2-title", "feature-2-desc"], "features-grid")
    },
    "feature-2-icon": {
      ...createNode('IconBlock', {
        icon: "Shield",
        size: 48,
        color: "#10b981",
        marginBottom: 16
      }, "Icon", false, [], "feature-2")
    },
    "feature-2-title": {
      ...createHeading(
        "Secure & Reliable",
        3,
        {
          fontSize: 20,
          fontWeight: "semibold",
          color: "#1f2937",
          marginBottom: 8
        },
        "Heading",
        "feature-2"
      )
    },
    "feature-2-desc": {
      ...createNode('TextBlock', {
        text: "Enterprise-grade security with 99.9% uptime guarantee for your peace of mind.",
        fontSize: 14,
        color: "#6b7280"
      }, "Text", false, [], "feature-2")
    },
    "feature-3": {
      ...createContainer('feature-3', {
        padding: 24,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }, "Container", ["feature-3-icon", "feature-3-title", "feature-3-desc"], "features-grid")
    },
    "feature-3-icon": {
      ...createNode('IconBlock', {
        icon: "Users",
        size: 48,
        color: "#f59e0b",
        marginBottom: 16
      }, "Icon", false, [], "feature-3")
    },
    "feature-3-title": {
      ...createHeading(
        "Easy Collaboration",
        3,
        {
          fontSize: 20,
          fontWeight: "semibold",
          color: "#1f2937",
          marginBottom: 8
        },
        "Heading",
        "feature-3"
      )
    },
    "feature-3-desc": {
      ...createNode('TextBlock', {
        text: "Seamless team collaboration with real-time editing and sharing capabilities.",
        fontSize: 14,
        color: "#6b7280"
      }, "Text", false, [], "feature-3")
    }
  })
  .build();