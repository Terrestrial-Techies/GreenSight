import React from 'react';
import { RiMapPinLine } from 'react-icons/ri';

const LocationModal = ({ onEnable, onDeny }) => {
  return (
    <div className="fixed inset-0 lg:inset-auto lg:top-24 lg:left-6 z-[5000] flex items-end lg:items-start justify-center lg:justify-start p-4 lg:p-0 pointer-events-none">
      <div className="bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 w-full max-w-[360px] pointer-events-auto animate-slide-up lg:animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-primary shadow-inner">
            <RiMapPinLine size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 leading-tight">Explore nearby</h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Lagos Guide</p>
          </div>
        </div>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          Enable location to find Lagos' hidden green gems and get real-time condition updates from other explorers.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onDeny}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Not now
          </button>
          <button 
            onClick={onEnable}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
          >
            Enable GPS
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
