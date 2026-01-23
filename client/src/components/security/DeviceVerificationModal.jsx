import React, { useState } from 'react';
import { Shield, Check, Lock, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { apiClient } from '../../lib/axios';
import { useToast } from '../ui/Toast';

export function DeviceVerificationModal({ isOpen, onClose, onSuccess, email }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
       // Focus previous if backspace on empty
       const inputs = e.target.parentElement.querySelectorAll('input');
       inputs[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    try {
      await apiClient.post('/auth/device/verify-confirm', { otp: code });
      addToast('Device verified successfully', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
      try {
          await apiClient.post('/auth/device/verify-request');
          addToast('New code sent to your email', 'success');
          setOtp(['', '', '', '', '', '']);
      } catch (err) {
          addToast('Failed to send code', 'error');
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Shield className="h-6 w-6" />
            </div>
            
            <h2 className="text-xl font-bold text-text-primary dark:text-white mb-2">Verify This Device</h2>
            <p className="text-sm text-text-secondary mb-6">
                Enter the 6-digit code sent to <span className="font-semibold text-text-primary dark:text-white">{email || 'your email'}</span> to trust this device for 90 days.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onFocus={(e) => e.target.select()}
                            className="w-10 h-10 text-center text-lg font-bold border border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        type="submit" 
                        isLoading={loading} 
                        disabled={otp.join('').length !== 6}
                        className="w-full"
                    >
                        Verify Device
                    </Button>
                    <button 
                        type="button" 
                        onClick={handleResend}
                        className="text-xs text-primary hover:underline"
                    >
                        Resend Code
                    </button>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={onClose}
                        className="text-text-tertiary"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
