// Design tokens based on PROJECT.md specifications

export interface ColorScheme {
  primary: string;
  success: string;
  error: string;
  neutral: string;
  text: string;
  bg: string;
}

export interface Colors {
  light: ColorScheme;
  dark: ColorScheme;
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    h1: string;
    h2: string;
    body: string;
    caption: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    semibold: number;
    bold: number;
  };
}

export interface Spacing {
  sidebar: string;
  sidebarCollapsed: string;
  toolsPanel: string;
  canvas: string;
  propertiesPanel: string;
}

export interface Breakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  large: string;
}

export interface Transitions {
  duration: {
    fast: string;
    normal: string;
  };
  timing: string;
}

export interface IconSize {
  default: string;
  strokeWidth: number;
}

export const colors: Colors = {
  light: {
    primary: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    neutral: '#F3F4F6',
    text: '#111827',
    bg: '#FFFFFF',
  },
  dark: {
    primary: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    neutral: '#374151',
    text: '#F9FAFB',
    bg: '#111827',
  },
};

export const typography: Typography = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  fontSize: {
    h1: '32px',
    h2: '24px',
    body: '16px',
    caption: '14px',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    semibold: 600,
    bold: 700,
  },
};

export const spacing: Spacing = {
  sidebar: '20%',
  sidebarCollapsed: '60px',
  toolsPanel: '15%',
  canvas: '70%',
  propertiesPanel: '15%',
};

export const breakpoints: Breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  large: '1440px',
};

export const transitions: Transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
  },
  timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const iconSize: IconSize = {
  default: '24px',
  strokeWidth: 2,
};
