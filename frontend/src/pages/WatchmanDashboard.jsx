

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import {
  ScanLine,
  CheckCircle,
  LogIn,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Play,
  X,
  Loader2
} from 'lucide-react';
import api, { PY_URL } from '../api';

export default function WatchmanDashboard() {
  
  const [mode, setMode] = useState('ENTRY'); // ENTRY | EXIT
  const [entryStep, setEntryStep] = useState(1);
  const [code, setCode] = useState('');
  const [visitorData, setVisitorData] = useState(null);

  
  const webcamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [scanResult, setScanResult] = useState(null);

  
  const [videoConstraints, setVideoConstraints] = useState({
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: { exact: 'environment' }, // strong preference for rear cam
  });

  
  const handleCameraError = (err) => {
    console.error('Camera error', err);
    setCameraError('Camera permission denied or not available.');
    setLoading(false);

    // fallback: try looser facingMode
    setVideoConstraints({
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'environment',
    });
  };

  useEffect(() => {
    // Reset camera error when user toggles mode / flow
    if (!isCameraReady) setCameraError(null);
  }, [isCameraReady]);

  // Verify code -> fetch visitor
  const verifyCode = async () => {
    if (!code) return alert('Enter Code');
    try {
      const res = await api.post('/api/watchman/verify', { code });
      if (res.data.success) {
        setVisitorData(res.data.visitor);
        setEntryStep(2);
        setCameraError(null);
      } else {
        alert(res.data.message || 'Invalid Code');
      }
    } catch (e) {
      console.error(e);
      alert('Network Error');
    }
  };

  // Confirm entry / exit using current scanResult
  const confirmAction = async () => {
    try {
      if (!scanResult?.text) return alert('No plate detected');
      if (mode === 'ENTRY') {
        await api.post('/api/watchman/entry', {
          visitorId: visitorData?._id,
          plateNumber: scanResult.text,
          plateImage: scanResult.croppedImage,   // cropped plate (data URL / base64)
          originalImage: scanResult.originalImage // full screenshot (data URL)
        });
      } else {
        const res = await api.post('/api/watchman/exit', {
          plateNumber: scanResult.text,
        });
        if (!res.data.success) return alert(res.data.message || 'Exit failed');
      }
      alert('Success');
      resetAll();
    } catch (e) {
      console.error(e);
      alert('Server Error or Unauthorized');
    }
  };

  const resetAll = () => {
    setScanResult(null);
    setVisitorData(null);
    setCode('');
    setEntryStep(1);
    setScanAttempts(0);
    setLoading(false);
    setCameraError(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Auto-scan: tries up to 5 times, stops on first success
  const runAutoScan = useCallback(async () => {
    if (!webcamRef.current) {
      setCameraError('Camera not initialized');
      return;
    }

    setLoading(true);
    setScanAttempts(0);
    setScanResult(null);
    setCameraError(null);

    const maxAttempts = 5;
    for (let i = 1; i <= maxAttempts; i++) {
      setScanAttempts(i);

      // Take screenshot (data URL)
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        console.warn('No screenshot available yet');
        // small delay then continue
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }

      // Convert to blob & send to python detection endpoint (same as before)
      try {
        const blob = await (await fetch(imageSrc)).blob();
        const fd = new FormData();
        fd.append('image', blob, 'capture.jpg');

        // Call python detection endpoint (no JWT expected)
        const pyRes = await axios.post(`${PY_URL}/detect`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000,
        });

        if (pyRes?.data?.found) {
          // success: map response to camelCase fields and include the original screenshot
          setScanResult({
            found: pyRes.data.found,
            text: pyRes.data.text,
            confidence: pyRes.data.confidence,
            croppedImage: pyRes.data.cropped_image, // keep the data as returned (likely data URL or base64)
            originalImage: imageSrc
          });
          break;
        }
      } catch (err) {
        console.error('OCR request failed on attempt', i, err);
        // don't break; keep trying
      }

      // small delay between attempts (make UX snappy but tolerant)
      if (i < maxAttempts) await new Promise((r) => setTimeout(r, 700));
    }

    setLoading(false);
  }, []);

  // Small UI helper for mode switch that resets state
  const switchMode = (newMode) => {
    setMode(newMode);
    resetAll();
    // If switching to ENTRY keep step 1 until code verified
    setEntryStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h1 className="font-bold text-lg tracking-widest uppercase text-slate-300">
            Security Panel <span className="text-indigo-500">v2</span>
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-400 font-mono text-xs uppercase px-2 py-1 rounded"
        >
          [ Logout ]
        </button>
      </header>

      {/* Mode Switcher (mobile-first) */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <button
          onClick={() => switchMode('ENTRY')}
          className={`flex-1 py-4 text-center font-bold text-sm tracking-widest transition-all ${
            mode === 'ENTRY'
              ? 'bg-indigo-600 text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          ENTRY
        </button>
        <button
          onClick={() => switchMode('EXIT')}
          className={`flex-1 py-4 text-center font-bold text-sm tracking-widest transition-all ${
            mode === 'EXIT'
              ? 'bg-rose-600 text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          EXIT
        </button>
      </div>

      <main className="max-w-md mx-auto p-4">
        {/* ENTRY Step 1: Code input */}
        {mode === 'ENTRY' && entryStep === 1 && (
          <section className="bg-slate-800 rounded-xl p-6 mt-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Awaiting Access Code</h2>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              inputMode="numeric"
              className="w-full text-center text-4xl font-mono bg-slate-900 border-2 border-indigo-500/30 p-4 rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <button
              onClick={verifyCode}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold tracking-wider shadow-md hover:bg-indigo-500"
            >
              Verify Identity
            </button>
          </section>
        )}

        {/* Camera + HUD (Entry Step 2 or Exit) */}
        {(mode === 'EXIT' || entryStep === 2) && (
          <section className="mt-6 space-y-4">
            {/* Visitor card (entry only) */}
            {visitorData && mode === 'ENTRY' && (
              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="text-xs text-indigo-400 uppercase font-bold">Authorized Guest</div>
                  <div className="text-lg font-bold text-white">{visitorData.guestName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-indigo-400 uppercase font-bold">Visiting</div>
                  <div className="text-sm text-white">{visitorData.hostName}</div>
                </div>
              </div>
            )}

            {/* Camera container */}
            <div className="relative bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg aspect-video">
              {/* Decorative corners */}
              <div className="absolute top-3 left-3 w-12 h-12 border-l-4 border-t-4 border-indigo-500/40 rounded-tl-lg z-10" />
              <div className="absolute top-3 right-3 w-12 h-12 border-r-4 border-t-4 border-indigo-500/40 rounded-tr-lg z-10" />
              <div className="absolute bottom-3 left-3 w-12 h-12 border-l-4 border-b-4 border-indigo-500/40 rounded-bl-lg z-10" />
              <div className="absolute bottom-3 right-3 w-12 h-12 border-r-4 border-b-4 border-indigo-500/40 rounded-br-lg z-10" />

              {/* scanning progress / line */}
              {loading && (
                <div className="absolute top-0 left-0 w-full h-1 bg-green-400 z-20 shadow-[0_0_14px_rgba(34,197,94,0.9)] animate-[pulse_1.2s_infinite]" />
              )}

              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover opacity-90"
                videoConstraints={videoConstraints}
                onUserMedia={() => {
                  setIsCameraReady(true);
                  setCameraError(null);
                }}
                onUserMediaError={handleCameraError}
                audio={false}
              />

              {/* Overlay controls (center bottom) */}
              {!scanResult && (
                <div className="absolute bottom-4 left-0 w-full flex flex-col items-center gap-2 z-30 px-4">
                  <div className="w-full flex justify-between items-center text-xs text-slate-300 px-2">
                    <div>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={16} />
                          <span>Scanning ({scanAttempts}/5)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Play size={14} />
                          <span>Ready</span>
                        </div>
                      )}
                    </div>
                    <div className="text-slate-400">Cam: {videoConstraints.facingMode?.exact ? 'rear (exact)' : videoConstraints.facingMode === 'environment' ? 'rear' : 'default'}</div>
                  </div>

                  <button
                    onClick={async () => {
                      // Reset previous result & start scanning attempts
                      setScanResult(null);
                      await runAutoScan();
                    }}
                    disabled={loading || !!cameraError}
                    className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full font-bold shadow-md transition transform active:scale-95 ${
                      loading ? 'bg-red-600/80 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {loading ? <RefreshCw className="animate-spin" /> : <ScanLine />}
                    <span>{loading ? 'SCANNING...' : 'SCAN PLATE'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera error */}
            {cameraError && (
              <div className="bg-red-900/20 border border-red-600/20 text-red-200 p-3 rounded-md text-sm flex items-center gap-2">
                <AlertTriangle />
                <div>
                  <div className="font-bold">Camera error</div>
                  <div className="text-xs">{cameraError}</div>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => {
                      // Attempt to re-init camera with fallback
                      setCameraError(null);
                      setVideoConstraints({
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'environment',
                      });
                      setTimeout(() => window.location.reload(), 500); // quick reload to reinit camera
                    }}
                    className="text-xs underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && (
              <div className="bg-slate-800 rounded-lg p-3 border border-green-500/30 flex items-center gap-3">
                <img src={scanResult.croppedImage} alt="plate" className="h-16 w-28 object-cover rounded border" />
                <div className="flex-1">
                  <div className="text-green-400 text-xs uppercase">Automatic Number Plate Recognition</div>
                  <div className="text-2xl font-mono font-bold text-white tracking-wider">{scanResult.text}</div>
                  <div className="text-xs text-slate-400 mt-1">Confidence: {Math.round((scanResult.confidence ?? 0) * 100)}%</div>
                  {/* optional: show a tiny preview / toggle of original */}
                  {scanResult.originalImage && (
                    <div className="text-xs text-slate-400 mt-2">
                      Original captured frame included.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={resetAll} className="p-2 rounded bg-slate-700 hover:bg-slate-600">
                    <X />
                  </button>
                  <button onClick={confirmAction} className="p-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold flex items-center gap-2">
                    <CheckCircle size={16} /> Approve {mode}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* small footer / help */}
        <div className="mt-6 text-xs text-slate-400 text-center">
          <div>Tip: Point the rear camera at the plate and keep a steady hold while scanning.</div>
        </div>
      </main>
    </div>
  );
}
