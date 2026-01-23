import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditLogsPage } from '../AuditLogsPage';
import { auditService } from '../auditService';
import { ToastProvider } from '../../../../components/ui/Toast';

// Mock dependencies
vi.mock('../auditService');
vi.mock('../../../../components/ui/Avatar', () => ({
  Avatar: () => <div data-testid="avatar">Avatar</div>
}));

vi.mock('../../../../components/ui/Badge', () => ({
  Badge: ({ children }) => <span data-testid="badge">{children}</span>
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('AuditLogsPage', () => {
    const mockLogs = {
        logs: [
            { id: 1, action: 'User Login', description: 'User authed', created_at: new Date().toISOString(), status: 'Success' }
        ],
        pagination: { total: 1, page: 1, pages: 1 }
    };

    const mockStats = {
        total_events: 100,
        security_events: 5,
        failed_events: 2
    };

    beforeEach(() => {
        vi.clearAllMocks();
        auditService.getLogs.mockResolvedValue(mockLogs);
        auditService.getStats.mockResolvedValue(mockStats);
        auditService.getSystemLogs.mockResolvedValue({
            logs: ['[INFO] System started'],
            total: 1,
            page: 1, 
            pages: 1
        });
        auditService.getActivePorts.mockResolvedValue([
            { port: '5432', service: 'Postgres', status: 'Secured', pid: '123' }
        ]);
    });

    it('renders the page header and stats', async () => {
        render(
            <ToastProvider>
                <AuditLogsPage />
            </ToastProvider>
        );
        
        expect(screen.getByText('Audit & System Logs')).toBeInTheDocument();
        expect(screen.getByText('Security Monitoring Active')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('100')).toBeInTheDocument(); // Total events
            expect(screen.getByText('5')).toBeInTheDocument();   // Security events
        });
    });

    it('switches tabs correctly', async () => {
        const user = userEvent.setup();
        render(
            <ToastProvider>
                <AuditLogsPage />
            </ToastProvider>
        );
        
        // Initial load (Activity Logs)
        await waitFor(() => expect(screen.getByText('User Login')).toBeInTheDocument());

        // Switch to Live Server Logs
        const serverTab = screen.getByRole('button', { name: /Live Server Logs/i });
        await user.click(serverTab);
        
        // Verify stats cards disappear (implies activeTab changed)
        await waitFor(() => {
             expect(screen.queryByText('Total Events (24h)')).not.toBeInTheDocument();
        });

        // Use findByText to wait for the header to appear
        expect(await screen.findByText('Application Server Logs')).toBeInTheDocument();
        expect(screen.getByText('Message')).toBeInTheDocument();
        expect(screen.getByText(/System started/)).toBeInTheDocument();

        // Switch to Active Ports
        const portsTab = screen.getByText('Active Ports');
        await user.click(portsTab);

        await waitFor(() => {
            expect(auditService.getActivePorts).toHaveBeenCalled();
            expect(screen.getByText('Postgres')).toBeInTheDocument();
        });
    });
});
