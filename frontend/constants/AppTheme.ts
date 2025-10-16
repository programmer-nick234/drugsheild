/**
 * DrugShield App Theme - Optimized & Consistent
 * Industry-standard color palette for medical/health applications
 */

import { Platform } from 'react-native';

// Primary Color Palette - Medical/Health Theme
export const AppColors = {
  // Primary Colors
  primary: '#0a7ea4',      // Professional teal (from main page)
  primaryDark: '#065a7a',  // Darker teal
  primaryLight: '#A1CEDC', // Light teal (from header)
  
  // Secondary Colors
  secondary: '#2196F3',    // Trust blue
  secondaryDark: '#1976D2',
  secondaryLight: '#64B5F6',
  
  // Status Colors
  success: '#4CAF50',      // Green for safe/good
  warning: '#FF9800',      // Orange for caution
  danger: '#F44336',       // Red for risk/danger
  info: '#2196F3',         // Blue for information
  
  // Neutral Colors
  dark: '#11181C',         // Primary text (from theme)
  darkGray: '#333333',
  mediumGray: '#666666',
  gray: '#9E9E9E',
  lightGray: '#E0E0E0',
  ultraLightGray: '#F5F5F5',
  white: '#FFFFFF',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundDark: '#F8F9FA',
  backgroundLight: '#FAFBFC',
  
  // Overlay/Shadow
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Medical/Health Specific
  allergic: '#FFEBEE',     // Light red for allergies
  allergicBorder: '#FFCDD2',
  allergicText: '#D32F2F',
  
  condition: '#E3F2FD',    // Light blue for conditions
  conditionBorder: '#BBDEFB',
  conditionText: '#1565C0',
  
  medication: '#F3E5F5',   // Light purple for medications
  medicationBorder: '#E1BEE7',
  medicationText: '#7B1FA2',
};

// Typography System - Industry Standard
export const AppFonts = {
  // Font Families
  family: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto-Medium',
      semiBold: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    default: {
      regular: 'system-ui',
      medium: 'system-ui',
      semiBold: 'system-ui',
      bold: 'system-ui',
    },
  }),
  
  // Font Sizes - Standard Scale
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
  },
  
  // Font Weights
  weight: {
    regular: '400' as any,
    medium: '500' as any,
    semiBold: '600' as any,
    bold: '700' as any,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing System - 4px base unit
export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

// Border Radius - Consistent Rounding
export const AppRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadow/Elevation - Subtle & Professional
export const AppShadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Common Button Styles
export const AppButtons = {
  primary: {
    backgroundColor: AppColors.primary,
    color: AppColors.white,
  },
  secondary: {
    backgroundColor: AppColors.white,
    color: AppColors.primary,
    borderColor: AppColors.primary,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: AppColors.danger,
    color: AppColors.white,
  },
  success: {
    backgroundColor: AppColors.success,
    color: AppColors.white,
  },
};

// Common Card Style
export const AppCard = {
  backgroundColor: AppColors.white,
  borderRadius: AppRadius.md,
  padding: AppSpacing.base,
  ...AppShadow.md,
};

// Common Input Style
export const AppInput = {
  backgroundColor: AppColors.white,
  borderRadius: AppRadius.sm,
  borderWidth: 1,
  borderColor: AppColors.lightGray,
  padding: AppSpacing.md,
  fontSize: AppFonts.size.base,
  color: AppColors.dark,
};

// Export default theme
export const AppTheme = {
  colors: AppColors,
  fonts: AppFonts,
  spacing: AppSpacing,
  radius: AppRadius,
  shadow: AppShadow,
  buttons: AppButtons,
  card: AppCard,
  input: AppInput,
};

export default AppTheme;
