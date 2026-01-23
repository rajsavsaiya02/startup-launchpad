
    it('calls updateBrandingSettings on save', async () => {
        const { settingsService } = require('../settingsService');
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
                // other fields...
            }));
        });
    });
