import React, { useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { RiSearchLine, RiUserLine } from 'react-icons/ri';
import './Reviews.css';

const Reviews = ({ parks = [], onParkClick }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filterOptions = ['All', 'Open', 'Busy', 'Closed'];

  const filteredParks = parks.filter(park => {
    const matchesSearch = park.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'All') return matchesSearch;
    return matchesSearch && (park.status === filter || park.condition === filter);
  });

  return (
    <div className="reviews-page content-scroll">
      
      <div className="px-4 mt-4">
        <div className="relative">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input 
            type="text" 
            placeholder="Search parks by name"
            className="w-full bg-white border border-neutral-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-colors text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 px-4 mt-4 overflow-x-auto no-scrollbar pb-2">
        {filterOptions.map(opt => (
          <button 
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-6 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === opt 
              ? 'bg-[#07B60A] text-white border-[#07B60A]' 
              : 'bg-white text-neutral-600 border-neutral-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Park List */}
      <div className="px-4 mt-4 flex flex-col gap-4 pb-24">
        {filteredParks.map(park => (
          <div key={park.id} className="review-park-card" onClick={() => onParkClick(park)}>
            <div className="review-park-image">
              <img src={park.image || 'https://images.unsplash.com/photo-1585829365291-1762f59ed290?auto=format&fit=crop&q=80&w=200'} alt={park.name} />
              <div className="status-dot-overlay"></div>
            </div>
            <div className="review-park-details">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-[#07B60A] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">{park.name}</h3>
              </div>
              <p className="text-sm text-neutral-600 mb-1">
                {park.cleanliness || 'Clean'} . {park.crowd_level || 'Moderate crowds'}
              </p>
              <p className="text-sm text-neutral-600 mb-2">
                {park.busy_times || 'Busy on weekends + Evenings'}
              </p>
              <div className="park-notes">
                <span className="font-bold text-neutral-900">Notes: </span>
                <span className="text-sm text-neutral-600">
                  {park.notes || 'often hosts events, concerts'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredParks.length === 0 && (
          <div className="text-center py-20 text-neutral-400">
            No parks found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
