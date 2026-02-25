import React from 'react';
import { RiSearch2Line } from 'react-icons/ri';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <RiSearch2Line className="text-neutral-400 group-focus-within:text-primary transition-colors" size={18} />
      </div>
      <input 
        type="text" 
        placeholder="Search Lagos parks..." 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-full bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
      />
    </div>
  );
};

export default SearchBar;
