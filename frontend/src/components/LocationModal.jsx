import React, { useState } from 'react';
import { RiMapPinLine, RiCheckLine, RiSearchLine, RiCursorLine } from 'react-icons/ri';

const LocationModal = ({ onLocationUpdate, onDeny }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedCity, setDetectedCity] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualCity, setManualCity] = useState("");

  const handleSuccess = (data) => {
    setDetectedCity(data.city);
    setLoading(false);
    // Short delay so user sees the success state before modal closes
    setTimeout(() => {
      if (onLocationUpdate) onLocationUpdate(data);
    }, 1500);
  };

  const handleEnableGPS = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    // Relaxed options to prevent timeouts
    const geoOptions = {
      enableHighAccuracy: false, // Uses Wi-Fi/Cell towers (Faster)
      timeout: 30000,            // 30 seconds
      maximumAge: 300000         // 5 minute cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch('http://127.0.0.1:5000/parks/nearby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
          });

          if (!res.ok) throw new Error("Server error");
          const data = await res.json();
          handleSuccess(data);
        } catch (err) {
          setError("Could not sync with the park service.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("GPS Error:", err);
        // SMART FALLBACK: If GPS fails, automatically show manual input
        setError(err.code === 3 ? "GPS timed out. Please enter your city manually." : "GPS access denied.");
        setShowManual(true);
        setLoading(false);
      },
      geoOptions
    );
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:5000/parks/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: manualCity }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      handleSuccess(data);
    } catch (err) {
      setError("City not found or service down.");
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 lg:inset-auto lg:top-24 lg:left-6 z-[5000] flex items-end lg:items-start justify-center lg:justify-start p-4 lg:p-0 pointer-events-none">
      <div className="bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 w-full max-w-[360px] pointer-events-auto animate-slide-up lg:animate-fade-in">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${detectedCity ? 'bg-green-100 text-green-600' : 'bg-primary-container text-primary'}`}>
            {detectedCity ? <RiCheckLine size={24} /> : showManual ? <RiSearchLine size={24} /> : <RiMapPinLine size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 leading-tight">
              {detectedCity ? `Items in ${detectedCity}` : showManual ? "Where are you?" : "Explore nearby"}
            </h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {detectedCity ? "Location Synced" : "GreenSight Guide"}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="mb-6">
          {error && <p className="text-xs text-red-500 font-medium mb-2">{error}</p>}
          
          {detectedCity ? (
            <p className="text-sm text-neutral-600">Successfully filtered green gems in <strong>{detectedCity}</strong>.</p>
          ) : showManual ? (
            <form onSubmit={handleManualSearch} className="relative">
              <input 
                autoFocus
                type="text"
                placeholder="Enter city (e.g. Ikeja, Lekki...)"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
              />
              <button disabled={loading} className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg">
                <RiSearchLine size={18} />
              </button>
            </form>
          ) : (
            <p className="text-sm text-neutral-600">Enable location to find hidden gems near you, or enter your city manually.</p>
          )}
        </div>

        {/* Action Buttons */}
        {!detectedCity && (
          <div className="flex flex-col gap-2">
            {!showManual ? (
              <>
                <button 
                  onClick={handleEnableGPS}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-primary text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:bg-neutral-400"
                >
                  {loading ? "Locating..." : <><RiCursorLine /> Use Current Location</>}
                </button>
                <button 
                  onClick={() => setShowManual(true)}
                  className="w-full py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
                >
                  Enter location manually
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowManual(false)}
                className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-center hover:text-primary transition-colors"
              >
                Go back to GPS
              </button>
            )}
            <button onClick={onDeny} className="mt-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-center hover:text-red-500">
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;