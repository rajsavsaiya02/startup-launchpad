import React, { useState, useEffect } from 'react';
import { Shield, Clock, MapPin, Globe, Smartphone, Laptop, Monitor, X, AlertTriangle, Fingerprint } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { apiClient } from '../../../lib/axios';
import { SessionTable } from '../../../components/security/SessionTable';

import { DeviceVerificationModal } from '../../../components/security/DeviceVerificationModal';

export function AdminSecurityPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  useEffect(() => {
    fetchSessions(); // Fetch real sessions
  }, []);

  const fetchSessions = async () => {
    try {
        setLoadingSessions(true);
        const res = await apiClient.get('/sessions');
        setSessions(res.data.sessions);
        setLoading(false);
    } catch (err) {
        console.error('Failed to fetch sessions', err);
    } finally {
        setLoadingSessions(false);
    }
  };

  const handleVerifyDevice = async (sessionId) => {
      try {
          // Trigger OTP Send
          const res = await apiClient.post('/auth/device/verify-request');
          setVerificationEmail(res.data.email);
          setShowVerifyModal(true);
          addToast('Verification code sent', 'success');
      } catch (err) {
          addToast(err.response?.data?.message || 'Failed to send verification code', 'error');
      }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to revoke this session?")) return;
    try {
        await apiClient.delete(`/sessions/${sessionId}`);
        addToast('Session revoked successfully', 'success');
        fetchSessions();
    } catch (err) {
        addToast('Failed to revoke session', 'error');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!window.confirm("Are you sure you want to log out from all other devices?")) return;
    try {
        await apiClient.delete('/sessions');
        addToast('All other sessions signed out', 'success');
        fetchSessions();
    } catch (err) {
        addToast('Failed to sign out other sessions', 'error');
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-6">
      
      {/* Header */}
      <div className="border-b border-border-light dark:border-border-dark pb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-white">Security & Active Sessions</h1>
        <p className="text-text-secondary dark:text-gray-400 mt-1">Monitor your account activity and manage connected devices. Unrecognized devices should be revoked immediately.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
          
          {/* Active Sessions Table */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Laptop className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-text-primary dark:text-white">Active Sessions</h3>
                    <Badge variant="success" className="ml-2">Safe Environment</Badge>
                </div>
                {sessions.length > 1 && (
                   <Button variant="outline" size="sm" onClick={handleRevokeAllOther} className="text-error hover:text-white hover:bg-error border-error/30 text-xs">
                       Sign Out All Other Devices
                   </Button>
                )}
             </div>

             {loadingSessions ? (
                <div className="space-y-2">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                   ))}
                </div>
             ) : (
                <SessionTable 
                   sessions={sessions} 
                   onRevoke={handleRevokeSession}
                   onVerify={handleVerifyDevice}
                />
             )}
          </div>

          {/* Danger Zone */}
          <Card className="p-6 bg-white dark:bg-surface-dark border-error/20 max-w-4xl">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-error/10 rounded-full text-error">
                   <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-text-primary dark:text-white">Danger Zone</h3>
                   <p className="text-sm text-text-secondary mt-1 max-w-2xl">
                      Irreversible actions related to your security. Changing your password will sign out all other active sessions immediately.
                   </p>
                   <div className="flex gap-4 mt-6">
                      <Button variant="outline" className="text-error border-error/50 hover:bg-error/5">Change Password</Button>
                      <Button variant="danger">Deactivate Account</Button>
                   </div>
                </div>
             </div>
          </Card>
      </div>

      <DeviceVerificationModal 
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={() => {
              fetchSessions(); // Refresh to see Green status
          }}
          email={verificationEmail}
      />
    </div>
  );
}
