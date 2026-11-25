import { ThemeMode } from '@/types/grocery';

export interface AppThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceMuted: string;
  border: string;
  borderFocused: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  emerald: string;
  emeraldDark: string;
  emeraldSoft: string;
  emeraldText: string;
  amber: string;
  amberSoft: string;
  amberText: string;
  rose: string;
  roseSoft: string;
  roseText: string;
  sky: string;
  slateButton: string;
  slateButtonText: string;
  overlay: string;
  tabBar: string;
}

export const LIGHT_THEME: AppThemeColors = {
  background: '#F8FAFC', // slate-50
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9', // slate-100
  surfaceMuted: '#E2E8F0', // slate-200
  border: '#E2E8F0', // slate-200
  borderFocused: '#059669', // emerald-600
  textPrimary: '#0F172A', // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94A3B8', // slate-400
  emerald: '#059669', // emerald-600
  emeraldDark: '#047857', // emerald-700
  emeraldSoft: '#ECFDF5', // emerald-50
  emeraldText: '#047857',
  amber: '#D97706', // amber-600
  amberSoft: '#FFFBEB', // amber-50
  amberText: '#B45309',
  rose: '#E11D48', // rose-600
  roseSoft: '#FFF1F2', // rose-50
  roseText: '#BE123C',
  sky: '#0284C7',
  slateButton: '#0F172A',
  slateButtonText: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.5)',
  tabBar: '#FFFFFF',
};

export const DARK_THEME: AppThemeColors = {
  background: '#020617', // slate-950
  surface: '#0F172A', // slate-900
  surfaceSecondary: '#1E293B', // slate-800
  surfaceMuted: '#334155', // slate-700
  border: '#1E293B', // slate-800
  borderFocused: '#10B981', // emerald-500
  textPrimary: '#F8FAFC', // slate-50
  textSecondary: '#94A3B8', // slate-400
  textMuted: '#64748B', // slate-500
  emerald: '#059669', // emerald-600
  emeraldDark: '#10B981', // emerald-500
  emeraldSoft: 'rgba(6, 78, 59, 0.45)', // emerald-950/45
  emeraldText: '#34D399', // emerald-400
  amber: '#FBBF24', // amber-400
  amberSoft: 'rgba(69, 26, 3, 0.5)', // amber-950/50
  amberText: '#FBBF24',
  rose: '#FB7185', // rose-400
  roseSoft: 'rgba(76, 5, 25, 0.55)', // rose-950/55
  roseText: '#FDA4AF',
  sky: '#38BDF8',
  slateButton: '#059669',
  slateButtonText: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.72)',
  tabBar: '#0F172A',
};

export function getThemeColors(mode: ThemeMode): AppThemeColors {
  return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
}
