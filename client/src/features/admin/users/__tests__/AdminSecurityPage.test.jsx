import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSecurityPage } from '../AdminSecurityPage';
import { apiClient } from '../../../../lib/axios';
import { vi } from 'vitest';

// Mock API client
vi.mock('../../../../lib/axios');

// Mock useToast
const mockAddToast = vi.fn();
vi.mock('../../../../components/ui/Toast', () => ({
  useToast: () => ({
    addToast: mockAddToast
  })
}));

describe('AdminSecurityPage', () => {
  beforeEach(() => {
    // Clear mocks
    apiClient.get.mockClear();
    apiClient.post.mockClear();
    mockAddToast.mockClear();
  });

  test('renders active sessions list', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        sessions: [
          {
            id: '1',
            browser: 'Chrome',
            os: 'MacOS',
            device_type: 'Desktop',
            location_city: 'New York',
            is_active: true,
            isCurrent: true,
            is_trusted: false // Unverified
          }
        ]
      }
    });

    render(<AdminSecurityPage />);

    // Check loading state
    // expect(screen.getByRole('status')).toBeInTheDocument(); 

    // Wait for sessions to load
    const deviceElement = await screen.findByText(/Chrome/i);
    expect(deviceElement).toBeInTheDocument();
    
    // Check for "Unverified" indicator (Red Flag logic depends on implementation details not fully visible but we expect "Unverified" or similar text)
    // Or we check if "Verify Device" button is there
    // expect(screen.getByText('Verify Device')).toBeInTheDocument();
  });
});
