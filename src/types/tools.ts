import React from 'react';

export type ToolCategory = 'OBSERVE' | 'ANALYZE' | 'PREDICT' | 'MONITOR' | 'ACT' | 'EXPLORE' | 'BUSINESS';

export type ToolAvailability = 'READY' | 'LIVE' | 'ACTIVE' | 'COMING SOON';

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  iconName: string;
  availability: ToolAvailability;
  tier: 'FREE' | 'COMMERCIAL' | 'ULTIMATE';
  isFeatured?: boolean;
  contextualSource?: string;
  tags: string[];
}

export interface ToolCategoryInfo {
  id: ToolCategory;
  label: string;
  tagline: string;
  description: string;
  iconName: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  toolsCount: number;
}
