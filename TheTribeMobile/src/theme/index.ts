// TheTribe Design Tokens
// Matches frontend/app/globals.css

export const Colors = {
    // Core
    background: '#000000',
    foreground: '#ededed',

    // Brand
    tribeBlack: '#000000',
    tribeGold: '#D4AF37',
    tribeGray: '#1a1a1a',
    tribeLight: '#ededed',

    // Utility
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

export const Fonts = {
    regular: 'System',
    heading: 'System', // Can be replaced with custom fonts later
};

export const Theme = {
    colors: Colors,
    fonts: Fonts,
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        full: 9999,
    },
};

export default Theme;
