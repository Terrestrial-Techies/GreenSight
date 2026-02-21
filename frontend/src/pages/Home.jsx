import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import NearYou from '../components/NearYou';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import LocationModal from '../components/LocationModal';
import Reviews from './Reviews';
import { parkService } from '../services/api';

const Home = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [showChatbot, setShowChatbot] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true);

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
          image: park.image_url || null,
          status: park.condition || 'Open',
          cleanliness: park.cleanliness || 'Clean',
          crowd_level: park.crowd_level || 'Moderate crowds',
          busy_times: park.busy_times || 'Busy on weekends + Evenings',
          notes: park.notes || 'Often hosts events, concerts'
        }));

        setParks(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch parks:', err);
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

  const handleReportCondition = () => {
    alert('Report feature coming soon!');
  };

  const filteredParks = parks
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStarts = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

  const renderContent = () => {
    if (activeTab === 'reviews') {
      return <Reviews parks={filteredParks} onParkClick={(p) => { setSelectedPark(p); setActiveTab('explore'); }} />;
    }

    if (activeTab === 'notifications') {
      return (
        <div className="p-10 text-center text-neutral-400">
          <p className="text-lg font-bold">Notifications</p>
          <p className="text-sm mt-2">You're all caught up! No new alerts for your favorite parks.</p>
        </div>
      );
    }

    return (
      <main className="content-scroll">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        
        <div className="animate-fade-in">
          <MapView 
            parks={filteredParks} 
            selectedPark={selectedPark} 
            onMarkerClick={setSelectedPark} 
            onChatClick={() => setShowChatbot(true)}
          />

          <div className="px-4 pb-4 mt-6">
            <button className="btn-primary" onClick={handleReportCondition}>
              Report current condition
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-center text-neutral-400 text-sm">Loading near you...</div>
          ) : (
            <NearYou parks={filteredParks} onParkClick={setSelectedPark} />
          )}
        </div>
      </main>
    );
  };

  return (
    <div className="app-container overflow-hidden">
      <Header />
      
      {renderContent()}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
      
      {showLocationModal && (
        <LocationModal 
          onEnable={() => setShowLocationModal(false)} 
          onDeny={() => setShowLocationModal(false)} 
        />
      )}
    </div>
  );
};

export default Home;
