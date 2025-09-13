export interface ColorCustomization {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    surface: string;
    neutral: string;
    muted: string;
}

export const DEFAULT_COLORS: ColorCustomization = {
    primary: '#2C2C2C',     // Dark charcoal for furniture elegance
    secondary: '#8B7355',   // Warm brown for wood tones
    accent: '#D4A574',      // Gold accent for luxury feel
    background: '#1A1A1A',  // Deep black for sophistication
    text: '#FFFFFF',        // Pure white for contrast
    surface: '#3A3A3A',     // Medium gray for surfaces
    neutral: '#F5F5F5',     // Light gray for neutral areas
    muted: '#888888'        // Muted gray for subtle elements
};