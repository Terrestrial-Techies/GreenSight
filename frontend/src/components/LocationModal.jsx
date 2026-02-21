import React from 'react';

const LocationModal = ({ onEnable, onDeny }) => {
  return (
    <div className="fixed top-4 left-4 z-[5000] animate-slide-in-left">
      <div className="bg-white rounded-2xl p-4 shadow-xl border border-black/5 max-w-[280px]">
        <h3 className="text-sm font-bold text-neutral-900 mb-1">Enable Location</h3>
        <p className="text-xs text-neutral-500 mb-3 leading-tight">
          Allow access to show nearby parks.
        </p>

        <div className="flex gap-2">
          <button 
            onClick={onDeny}
            className="flex-1 py-2 px-3 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
          >
            Later
          </button>
          <button 
            onClick={onEnable}
            className="flex-1 py-2 px-3 rounded-lg bg-[#07B60A] text-xs font-bold text-white shadow-sm"
          >
            Enable
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}} />
    </div>
  );
};

export default LocationModal;
