import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import NearYou from '../components/NearYou';
import BottomNav from '../components/BottomNav';
import Notifications from '../components/notifications'; 
import { parkService } from '../services/api';

const Home = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');

  useEffect(() => {
    const fetchParks = async () => {
      try {
        setLoading(true);
        const data = await parkService.getAllParks();
        
        const formattedData = data.map(park => ({
          ...park,
          lat: park.lat || park.latitude || 6.458985,
          lng: park.lon || park.lng || park.longitude || 3.426131,
          name: park.name || 'Green Space',
          image: park.image_url || null 
        }));

        setParks(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch parks:', err);
        setError('Unable to load data. Please check your connection.');
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

  const handleReportCondition = () => {
    alert('Report feature coming soon! (Backend requirement)');
  };

  const filteredParks = parks.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container overflow-hidden">
      <Header />
      
      <main className="content-scroll">
        {/* We keep your SearchBar logic but only show it when on 'explore' */}
        {activeTab === 'explore' && (
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        )}
        
        {/* Conditional Logic: Swap content based on activeTab */}
        {activeTab === 'notifications' ? (
          <Notifications />
        ) : (
          <div className="animate-[fadeIn_0.4s_ease-out_forwards]">
            <MapView 
              parks={filteredParks} 
              selectedPark={selectedPark} 
              onMarkerClick={setSelectedPark} 
            />

            <div className="px-4 pb-4 mt-6">
              <button className="btn-primary" onClick={handleReportCondition}>
                Report centre condition
              </button>
            </div>

            {loading ? (
              <div className="p-4 text-center text-neutral-400 text-sm">Loading near you...</div>
            ) : (
              <NearYou parks={filteredParks} onParkClick={setSelectedPark} />
            )}
          </div>
        )}
      </main>

      {/* BottomNav is always visible */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default Home;