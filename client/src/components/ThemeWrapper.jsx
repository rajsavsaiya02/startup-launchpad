import React, { useMemo } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { useSettings } from '../context/SettingsContext';
import { theme as baseTheme } from '../theme';

// Helper to generate a simple palette from a color (placeholder for now)
// In a real app, use a library like different-hues or similar.
// For now we will just use the user defined color as the primary base.
// Note: Mantine requires a 10-color array for custom colors.
// We will define a 'brand' color with the user's primary color as the middle value (filled).
const generatePalette = (color) => {
    // This is a naive implementation. In production, use a proper shade generator.
    // Using the same color for all shades to ensure it works, effectively disabling shade variations.
    return Array(10).fill(color);
};

export const ThemeWrapper = ({ children }) => {
    const { settings, loading } = useSettings();

    const dynamicTheme = useMemo(() => {
        if (loading) return baseTheme;

        const brandColors = settings.primary_color ? generatePalette(settings.primary_color) : baseTheme.colors?.blue || Array(10).fill('#228be6');
        
        return createTheme({
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                brand: brandColors,
            },
            primaryColor: 'brand',
            // We can also inject other variables here
        });
    }, [settings, loading]);

    return (
        <MantineProvider theme={dynamicTheme}>
            {children}
        </MantineProvider>
    );
};
