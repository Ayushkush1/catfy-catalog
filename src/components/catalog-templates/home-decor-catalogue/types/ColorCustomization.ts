export interface ColorCustomization {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    surface: string;
    muted: string;
}

export const DEFAULT_COLORS: ColorCustomization = {
    primary: '#d4a574',     // Warm gold accent
    secondary: '#b8956a',   // Darker gold
    accent: '#e8d5b7',      // Light cream
    background: '#1a1a1a',  // Dark background
    text: '#ffffff',        // White text
    surface: '#2a2a2a',     // Dark surface
    muted: '#999999'        // Muted text
};