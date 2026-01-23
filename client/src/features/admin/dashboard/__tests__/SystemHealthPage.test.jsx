/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SystemHealthPage } from '../SystemHealthPage';
import { apiClient } from '../../../../lib/axios';

// Mock apiClient
vi.mock('../../../../lib/axios');

describe('SystemHealthPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders loading state initially', () => {
        // Return a promise that doesn't resolve immediately to test loading state
        apiClient.get.mockImplementation(() => new Promise(() => {}));
        
        render(<SystemHealthPage />);
        expect(screen.getByText(/System Health/i)).toBeInTheDocument();
        expect(screen.getByText(/Refresh/i)).toBeInTheDocument();
        // You might check for spinner or disabled button
        expect(screen.getByRole('button', { name: /Refresh/i })).toBeDisabled();
    });

    test('renders health data successfully', async () => {
        const mockData = {
            status: 'success',
            system: {
                uptime: 3600,
                memory: { used: 1024, total: 2048, free: 512 },
                cpus: 4,
                loadavg: [1.5, 1.2, 1.0],
                platform: 'linux',
                release: '5.4.0',
                nodeVersion: 'v16.0.0',
                backendVersion: '0.1.0'
            },
            infrastructure: {
                database: { status: 'connected', latency: 25 },
                disk: { 
                    status: 'ok', 
                    used: 50000000, 
                    free: 5318709120, // (5GB - 50MB)
                    quota: 5368709120, // 5GB
                    usagePercent: 0.93,
                    path: '/',
                    breakdown: [
                        { name: 'private', size: 30000000, type: 'directory' },
                        { name: 'temp', size: 20000000, type: 'directory' }
                    ]
                }
            }
        };

        apiClient.get.mockResolvedValue({ data: mockData });

        render(<SystemHealthPage />);

        await waitFor(() => {
            expect(screen.getByText('All systems operational')).toBeInTheDocument();
            expect(screen.getByText('25ms')).toBeInTheDocument(); // Latency
            expect(screen.getByText('linux')).toBeInTheDocument(); // Platform
        });
    });

    test('renders error state on API failure', async () => {
        apiClient.get.mockRejectedValue(new Error('Network Error'));

        render(<SystemHealthPage />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to connect to health service/i)).toBeInTheDocument();
        });
    });

    test('allows updating storage quota', async () => {
        const mockData = {
           status: 'ok',
           infrastructure: {
               disk: { status: 'ok', used: 100, free: 200, quota: 300 }
           } 
        };
        apiClient.get.mockResolvedValue({ data: mockData });
        apiClient.post.mockResolvedValue({ data: { status: 'success' } });

        render(<SystemHealthPage />);

        // Wait for data load
        await waitFor(() => {
            expect(screen.getByText('Disk Space')).toBeInTheDocument();
        });

        // Click Edit
        const editButton = screen.getByLabelText('Edit Quota');
        fireEvent.click(editButton);

        // Check input appears
        const input = screen.getByRole('spinbutton'); // number input
        expect(input).toBeInTheDocument();
        fireEvent.change(input, { target: { value: '10' } });

        // Click Save
        const saveButton = screen.getByLabelText('Save Quota');
        fireEvent.click(saveButton);

        // Verify API call
        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/health/quota', { quotaGB: 10 });
        });
    });
});
