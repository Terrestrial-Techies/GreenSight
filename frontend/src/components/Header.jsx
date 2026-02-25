import React from 'react';
import { RiUserLine } from 'react-icons/ri';

const Header = () => {
  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-black/5">
      {/* App Header */}
      <div className="h-[60px] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C22.63 28 28 22.63 28 16C28 9.37 22.63 4 16 4ZM16 26C10.48 26 6 21.52 6 16C6 10.48 10.48 6 16 6C21.52 6 26 10.48 26 16C26 21.52 21.52 26 16 26ZM12 16C12 13.79 13.79 12 16 12C18.21 12 20 13.79 20 16C20 18.21 18.21 20 16 20C13.79 20 12 18.21 12 16Z" fill="#07B60A"/>
            </svg>
          </div>
          <h1 className="text-[22px] font-heading font-bold tracking-tight text-[#111]">
            Green<span className="text-[#07B60A]">Sight</span>
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-[#111] hover:bg-neutral-50 transition-colors">
          <RiUserLine size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;


