import React from 'react';
import { RiSearchLine } from 'react-icons/ri';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="px-4 py-2 bg-white">
      <div className="relative flex items-center bg-white border-[1.5px] border-neutral-50 rounded-full px-4 h-12 focus-within:border-primary transition-colors">
        <RiSearchLine className="text-neutral-400 mr-3" size={20} />
        <input 
          type="text" 
          placeholder="Search nearby parks" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-none bg-transparent w-full h-full font-body text-base text-neutral-900 outline-none placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
};

export default SearchBar;

