import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import BrandingSettings from '../BrandingSettings';
import { SettingsProvider } from '../../../../context/SettingsContext';
import { settingsService } from '../settingsService';

// ... (existing mocks) ...

// ... (inside test) ...

vi.mock('lucide-react', () => ({
  Save: () => <span data-testid="icon-save" />,
  Loader2: () => <span data-testid="icon-loader" />,
  CheckCircle: () => <span data-testid="icon-check" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  Palette: () => <span data-testid="icon-palette" />
}));

// Mock ImageUpload component
vi.mock('../../../../components/ui/ImageUpload', () => ({
  ImageUpload: ({ value, onChange, className }) => (
    <div data-testid="image-upload">
       <input 
         data-testid="image-input" // Simplified mock input for value check
         type="text" 
         readOnly
         value={value || ''} 
       />
       <button data-testid="image-upload-trigger" onClick={() => onChange(new File([''], 'test.png', { type: 'image/png' }))} />
    </div>
  )
}));

// Mock settingsUtils
vi.mock('../settingsService', () => ({
  settingsService: {
    getSettings: vi.fn(),
    updateBrandingSettings: vi.fn().mockResolvedValue({ settings: { platform_name: 'Updated Name', primary_color: '#000000', secondary_color: '#ffffff', accent_color: '#ff0000', logo_url: '', favicon_url: '' } }),
    uploadBrandingImage: vi.fn().mockResolvedValue({ file: { url: 'http://new-image.com' } })
  }
}));

// Mock SettingsContext
const useSettingsMock = vi.fn();
vi.mock('../../../../context/SettingsContext', () => ({
    useSettings: () => useSettingsMock(),
    SettingsProvider: ({ children }) => <div>{children}</div>
}));

describe('BrandingSettings Component', () => {
    const mockUpdateLocalSettings = vi.fn();
    const defaultSettings = {
        platform_name: 'Test Platform 1',
        logo_url: 'http://logo.com',
        favicon_url: 'http://favicon.com',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#ff0000'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementation
        useSettingsMock.mockReturnValue({
             settings: defaultSettings,
             updateLocalSettings: mockUpdateLocalSettings,
             loading: false
        });
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        return render(
             <BrandingSettings />
        );
    };

    it('renders platform name input with value from context', async () => {
        renderComponent();
        await waitFor(() => {
            const input = screen.getByPlaceholderText(/e.g. Startup LaunchPad/i);
            expect(input.value).toBe('Test Platform 1');
        });
    });

    it('renders color inputs with correct values', async () => {
        renderComponent();
        await waitFor(() => {
             // We can check the text inputs that display the hex code
             // Since there might be multiple inputs (one color type, one text type per field),
             // let's grab by display value which is robust.
            expect(screen.getAllByDisplayValue('#000000').length).toBeGreaterThan(0);
            expect(screen.getAllByDisplayValue('#ffffff').length).toBeGreaterThan(0);
            expect(screen.getAllByDisplayValue('#ff0000').length).toBeGreaterThan(0);
        });
    });

    it('updates platform name on change', async () => {
        renderComponent();
        await waitFor(() => {
            const input = screen.getByPlaceholderText(/e.g. Startup LaunchPad/i);
            fireEvent.change(input, { target: { value: 'New Name' } });
            // The local state should update, controlled component
            expect(input.value).toBe('New Name');
        });
    });

    it('calls updateBrandingSettings on save', async () => {

        renderComponent();
        
        await waitFor(() => {
            const saveButton = screen.getByText(/Save Changes/i);
            fireEvent.click(saveButton);
        });

        await waitFor(() => {
            expect(settingsService.updateBrandingSettings).toHaveBeenCalled();
            // Verify payload contains only branding fields
            expect(settingsService.updateBrandingSettings).toHaveBeenCalledWith(expect.objectContaining({
                platform_name: 'Test Platform 1',
                primary_color: '#000000',
                secondary_color: '#ffffff',
                accent_color: '#ff0000'
            }));
        });
    });
});


