'use client';

import { useState, useEffect } from 'react';

interface ApiResponse {
  success?: boolean;
  verified?: boolean;
  hasFingerprint?: boolean;
  error?: string;
  message?: string;
  quality?: number;
}

export const  FingerprintTest =()=> {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasFingerprint, setHasFingerprint] = useState(false);

  // Check if user already has fingerprint on component mount
  useEffect(() => {
    void checkFingerprintStatus();
  }, []);

  const checkFingerprintStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/api/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' }),
      });

      const result: ApiResponse = await response.json();
      setHasFingerprint(result.hasFingerprint ?? false);
    } catch (error) {
      console.error('Failed to check fingerprint status:', error);
    }
  };

  const handleEnroll = async (): Promise<void> => {
    setIsLoading(true);
    setMessage('Please place your finger on the scanner...');
    
    try {
      const response = await fetch('/api/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enroll' }),
      });

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setMessage(`✅ ${result.message} Quality: ${result.quality}%`);
        setHasFingerprint(true);
      } else {
        setMessage(`❌ ${result.error || 'Enrollment failed'}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Enrollment failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (): Promise<void> => {
    setIsLoading(true);
    setMessage('Please place your finger for verification...');
    
    try {
      const response = await fetch('/api/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });

      const result: ApiResponse = await response.json();
      
      if (result.verified) {
        setMessage('✅ Fingerprint verified successfully!');
      } else {
        setMessage('❌ Fingerprint verification failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Verification failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!confirm('Are you sure you want to delete your fingerprint?')) return;

    setIsLoading(true);
    setMessage('Deleting fingerprint...');
    
    try {
      const response = await fetch('/api/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' }),
      });

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setMessage('✅ Fingerprint deleted successfully');
        setHasFingerprint(false);
      } else {
        setMessage('❌ Failed to delete fingerprint');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Delete failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Fingerprint Test</h2>
      
      <div className="mb-4">
        <p className={hasFingerprint ? 'text-green-600' : 'text-yellow-600'}>
          Status: {hasFingerprint ? 'Fingerprint registered' : 'No fingerprint registered'}
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleEnroll}
          disabled={isLoading || hasFingerprint}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Enroll Fingerprint'}
        </button>

        <button
          onClick={handleVerify}
          disabled={isLoading || !hasFingerprint}
          className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify Fingerprint'}
        </button>

        <button
          onClick={handleDelete}
          disabled={isLoading || !hasFingerprint}
          className="w-full px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Delete Fingerprint
        </button>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Make sure your fingerprint device is connected</p>
        <p>Data flow: Device → API → Database Storage</p>
      </div>
    </div>
  );
}