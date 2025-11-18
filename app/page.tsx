'use client';

import { useState } from 'react';
import QRScanner from '@/components/scanner/QRScanner';
import CameraCapture from '@/components/camera/CameraCapture';
import { IcebreakerResult } from '@/lib/types';

type ViewMode = 'home' | 'qr-scan' | 'photo' | 'manual' | 'results';

export default function Home() {
  const [mode, setMode] = useState<ViewMode>('home');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState<IcebreakerResult | null>(null);
  const [manualInput, setManualInput] = useState({ company: '', industry: '' });

  const analyzeQRCode = async (url: string) => {
    setLoading(true);
    setStatus('Analyzing QR code...');
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'qr', data: { url } }),
      });

      const result = await response.json();

      if (result.success) {
        setResults(result.data);
        setMode('results');
      } else if (result.needsPhoto) {
        setError(result.message);
        setMode('photo');
      } else {
        setError(result.error || 'Failed to analyze QR code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const analyzePhoto = async (imageBase64: string) => {
    setLoading(true);
    setStatus('Analyzing photo...');
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'image', data: { imageBase64 } }),
      });

      const result = await response.json();

      if (result.success) {
        setResults(result.data);
        setMode('results');
      } else if (result.needsManualInput) {
        setError(result.message);
        setMode('manual');
      } else {
        setError(result.error || 'Failed to analyze photo');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const analyzeManual = async () => {
    if (!manualInput.company.trim()) {
      setError('Please enter a company name');
      return;
    }

    setLoading(true);
    setStatus('Searching for company information...');
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'manual',
          data: {
            companyName: manualInput.company,
            industry: manualInput.industry || 'green energy industrial',
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResults(result.data);
        setMode('results');
      } else {
        setError(result.error || 'Failed to find company information');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const reset = () => {
    setMode('home');
    setResults(null);
    setError('');
    setStatus('');
    setManualInput({ company: '', industry: '' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            EventScout AI
          </h1>
          <p className="text-gray-600">
            Smart networking assistant for events
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Home Screen */}
          {mode === 'home' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                How would you like to start?
              </h2>

              <button
                onClick={() => setMode('qr-scan')}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-left flex items-center gap-3"
              >
                <span className="text-2xl">📱</span>
                <div>
                  <div className="font-semibold">Scan QR Code</div>
                  <div className="text-sm text-blue-100">
                    Scan exhibitor QR code
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('photo')}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-left flex items-center gap-3"
              >
                <span className="text-2xl">📸</span>
                <div>
                  <div className="font-semibold">Take Photo</div>
                  <div className="text-sm text-green-100">
                    Photo of booth or flyer
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('manual')}
                className="w-full bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-left flex items-center gap-3"
              >
                <span className="text-2xl">✍️</span>
                <div>
                  <div className="font-semibold">Enter Manually</div>
                  <div className="text-sm text-purple-100">
                    Type company name
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* QR Scanner Mode */}
          {mode === 'qr-scan' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Scan QR Code
              </h2>
              <QRScanner onScan={analyzeQRCode} onError={setError} />
              <button
                onClick={reset}
                className="mt-4 w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Photo Mode */}
          {mode === 'photo' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Take Photo
              </h2>
              <CameraCapture onCapture={analyzePhoto} onCancel={reset} />
            </div>
          )}

          {/* Manual Entry Mode */}
          {mode === 'manual' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Enter Company Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={manualInput.company}
                    onChange={(e) =>
                      setManualInput({ ...manualInput, company: e.target.value })
                    }
                    placeholder="e.g., Tesla Energy"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry (optional)
                  </label>
                  <input
                    type="text"
                    value={manualInput.industry}
                    onChange={(e) =>
                      setManualInput({ ...manualInput, industry: e.target.value })
                    }
                    placeholder="e.g., solar energy"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={analyzeManual}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Searching...' : 'Generate Icebreakers'}
                </button>

                <button
                  onClick={reset}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Results Mode */}
          {mode === 'results' && results && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {results.company}
              </h2>
              {results.industry && (
                <p className="text-sm text-gray-500 mb-4">{results.industry}</p>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Overview</h3>
                <p className="text-gray-700 text-sm">{results.overview}</p>
              </div>

              <h3 className="font-semibold text-gray-800 mb-3">
                Conversation Starters
              </h3>
              <div className="space-y-3 mb-6">
                {results.icebreakers.map((question, idx) => (
                  <div
                    key={idx}
                    className="bg-green-50 border-l-4 border-green-500 p-4"
                  >
                    <p className="text-gray-800">{question}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={reset}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Scan Another
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-800">{status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Powered by Claude AI
        </div>
      </div>
    </main>
  );
}
