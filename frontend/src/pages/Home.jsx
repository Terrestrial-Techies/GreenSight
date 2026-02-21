import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import NearYou from '../components/NearYou';
import BottomNav from '../components/BottomNav';
<<<<<<< HEAD
import Notifications from '../components/notifications'; 
import Support from './Support'; 
import Community from './Community'; // 1. Import the new Community component
=======
import Chatbot from '../components/Chatbot';
import LocationModal from '../components/LocationModal';
import Reviews from './Reviews';
>>>>>>> 5a86afe (review section)
import { parkService } from '../services/api';

const Home = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
<<<<<<< HEAD

  // Fallback / Enhancement data (since backend is missing some fields for now)
  const enhanceParkData = (backendParks) => {
    return backendParks.map((park, index) => ({
      id: park.id || `${park.name || 'park'}-${park.latitude || park.lat || 'lat'}-${park.longitude || park.lng || 'lng'}-${index}`,
      lat: park.latitude || park.lat || 6.5244,
      lng: park.longitude || park.lng || 3.3792,
      name: park.name || "Unnamed Park",
      location: park.location || "Lagos, Nigeria",
      access: park.access_type || park.access || "Public",
      price: park.price || "Free",
      lastUpdated: "Recently",
      features: park.features || [],
      description: park.description || `A verified green space in Lagos with a confidence score of ${park.confidence_score || 0}%`
    }));
  };
=======
  const [selectedPark, setSelectedPark] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
<<<<<<< HEAD
>>>>>>> 79079fe (map intergation with directions on click)
=======
  const [showChatbot, setShowChatbot] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true);
>>>>>>> 5a86afe (review section)

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
<<<<<<< HEAD
    switch (activeTab) {
      case 'notifications':
        return <Notifications />;
      case 'support':
        return <Support />;
      case 'community': // 2. Add case for community
        return <Community />;
      case 'explore':
      default:
        return (
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
        );
    }
  };

  return (
    <div className="app-container overflow-hidden">
      <Header />
      
      <main className="content-scroll">
        {activeTab === 'explore' && (
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        )}

        {renderContent()}
=======
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
>>>>>>> 5a86afe (review section)
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

<<<<<<< HEAD
export default Home;
=======
export default Home;
>>>>>>> 5a86afe (review section)
