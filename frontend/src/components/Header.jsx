import React, { useState, useEffect } from 'react';
import { RiUserSharedLine, RiSignalTowerLine, RiBattery2Fill, RiWifiLine } from 'react-icons/ri';

const Header = () => {
  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-black/5">
      {/* App Header */}
      <div className="h-[60px] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.4 18H10.6V16H11.4V18ZM13.8 18H13V16H13.8V18ZM15.4 14.3C14.8 14.8 14 15 13 15H11C10 15 9.2 14.8 8.6 14.3C8 13.8 7.7 13.1 7.7 12.2H9.2C9.2 12.7 9.3 13.1 9.6 13.4C9.9 13.7 10.4 13.8 11 13.8H13C13.6 13.8 14.1 13.7 14.4 13.4C14.7 13.1 14.8 12.7 14.8 12.2H16.3C16.3 13.1 16 13.8 15.4 14.3ZM16.3 10.5H14.8V9.5C14.8 9 14.7 8.6 14.4 8.3C14.1 8 13.6 7.9 13 7.9H11C10.4 7.9 9.9 8 9.6 8.3C9.3 8.6 9.2 9 9.2 9.5V10.5H7.7V9.5C7.7 8.6 8 7.9 8.6 7.4C9.2 6.9 10 6.7 11 6.7H13C14 6.7 14.8 6.9 15.4 7.4C16 7.9 16.3 8.6 16.3 9.5V10.5Z" fill="#07B60A"/>
            </svg>
          </div>
          <h1 className="text-[20px] font-heading font-bold tracking-tight text-neutral-900">
            Green<span className="text-primary">Sight</span>
          </h1>
        </div>
        <button className="w-8 h-8 rounded-full border-[1.5px] border-neutral-50 flex items-center justify-center text-neutral-400 active:opacity-70 transition-opacity">
          <RiUserSharedLine size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;


