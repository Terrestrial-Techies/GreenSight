import React from 'react';
import { RiRocketLine, RiTimerFlashLine } from 'react-icons/ri';

const Community = () => {
  return (
    <div className="flex-1 bg-[#F8F9FA] overflow-y-auto pb-24">
      <div className="bg-white border-b border-neutral-100 px-6 py-8 mb-6">
        <div className="max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 mb-2">Community Feed</h1>
            <p className="text-neutral-500">Community features are in progress.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-white border border-neutral-100 shadow-sm p-8 md:p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
            <RiRocketLine size={30} />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/80 mb-3">Coming Soon</p>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">Community Board Is Launching Soon</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Reviews are now posted through the review flow. This Community space will return with social features soon.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 text-sm font-bold">
            <RiTimerFlashLine size={16} />
            Feature in development
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
