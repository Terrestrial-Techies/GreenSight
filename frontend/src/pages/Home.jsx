import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import NearYou from '../components/NearYou';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import LocationModal from '../components/LocationModal';
import ReviewModal from '../components/ReviewModal';
import { parkService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiMapPin2Line, 
  RiTimeLine, 
  RiHeartFill, 
  RiLogoutBoxRLine, 
  RiLoginBoxLine, 
  RiCloseLine, 
  RiUserLine,
  RiRefreshLine 
} from 'react-icons/ri';
import Community from './Community';

const Home = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [parkFilter, setParkFilter] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('gs_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showPopupChat, setShowPopupChat] = useState(false);
  const [userState, setUserState] = useState(null); // Tracks detected/searched city
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('gs_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Initial Fetch: Load all parks on startup
  const fetchParks = async () => {
    try {
      setLoading(true);
      const data = await parkService.getAllParks();
      const formattedData = data.map((park, index) => ({
        ...park,
        id: park.id || `park-${index}`,
        lat: park.latitude || park.lat || 6.4589,
        lng: park.longitude || park.lng || 3.4261,
        name: park.name || 'Green Space',
        image: park.image_url || park.image || null,
        location: park.location || 'Nigeria',
        status: park.condition || 'Open',
      }));
      setParks(formattedData);
      setUserState(null); // Clear filter title on full reset
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch parks:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParks();
  }, []);

  // FIX: This function connects the LocationModal results to the Home state
  const handleLocationUpdate = (data) => {
    if (data.parks) {
      // Format backend data to ensure lat/lng keys are consistent for MapView
      const formattedParks = data.parks.map(p => ({
        ...p,
        lat: p.latitude,
        lng: p.longitude
      }));
      setParks(formattedParks);
      setUserState(data.city); // Updates the sidebar title (e.g., "Parks in Ikeja")
    }
    setShowLocationModal(false);
  };

  const filteredParks = parks
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStarts = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      if (aStarts && !bStarts) return -1;
      return 0;
    });

  const getParkByStatus = (status) => {
    if (status === 'All') return filteredParks;
    return filteredParks.filter(p => p.status?.toLowerCase() === status.toLowerCase());
  };

  const renderContent = () => {
    if (activeTab === 'support') {
      return (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in bg-white h-full relative">
          <Chatbot isFullPage={true} onClose={() => setActiveTab('explore')} />
        </div>
      );
    }

    if (activeTab === 'review') {
      return (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in bg-white h-full">
          <Community onOpenReview={() => setShowReviewModal(true)} />
        </div>
      );
    }

    if (activeTab === 'park') {
      return (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in bg-white lg:bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto w-full px-4 lg:px-8 py-4 flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-neutral-900">
                {userState ? `Results in ${userState}` : "Discover Green Spaces"}
              </h2>
              <div className="w-full md:max-w-xs">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Open', 'Busy', 'Closed'].map(f => (
                <button
                  key={f}
                  onClick={() => setParkFilter(f)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                    parkFilter === f ? 'bg-primary text-white shadow-md' : 'bg-white text-neutral-600 border border-neutral-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 overflow-y-auto scrollbar-hide flex-1">
              {getParkByStatus(parkFilter).map(park => (
                <div 
                  key={park.id} 
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-neutral-100 flex flex-col transition-all cursor-pointer group" 
                  onClick={() => { setSelectedPark(park); setActiveTab('explore'); }}
                >
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    <img src={park.image || 'https://images.unsplash.com/photo-1585829365291-1762f59ed290'} alt={park.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-xl font-bold text-neutral-900 leading-tight">{park.name}</h3>
                      <div className="flex items-center gap-1 text-accent font-bold text-sm bg-accent/10 px-2 py-1 rounded">★ 4.8</div>
                    </div>
                    <p className="text-neutral-500 text-sm flex items-center gap-1 mb-3">
                      <RiMapPin2Line size={16} className="text-primary" /> {park.location}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Live Flow</span>
                        <span className="text-primary font-bold text-sm">{park.live_crowd || 'Moderate'}</span>
                      </div>
                      <button 
                        className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-[12px] hover:bg-primary hover:text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/park/${park.id}`, { state: { park } }); }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden bg-white">
        <div className="xl:hidden p-4 border-b border-neutral-100 bg-white">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        {/* Sidebar - Dynamically updates based on location sync */}
        <div className="hidden xl:flex flex-col w-[380px] border-r border-neutral-100 p-6 overflow-y-auto scrollbar-hide bg-[#F8F9FA]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-1">
              {userState ? `Parks in ${userState}` : "Explore Nigeria"}
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                {userState ? "Filtered nearby" : "Top rated green spaces"}
              </p>
              {userState && (
                <button onClick={fetchParks} className="text-[10px] text-primary font-bold flex items-center gap-1 hover:underline">
                  <RiRefreshLine /> Reset Map
                </button>
              )}
            </div>
          </div>
          
          {!user && (
            <div className="mb-6 bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <p className="text-xs text-neutral-600 mb-3">Save favorites and get personalized recommendations.</p>
              <div className="flex gap-2">
                <Link to="/login" className="flex-1 text-center py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold hover:bg-neutral-50">Sign In</Link>
                <Link to="/signup" className="flex-1 text-center py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90">Join Free</Link>
              </div>
            </div>
          )}

          <div className="mb-6">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>

          <div className="flex-1">
             <NearYou 
               parks={filteredParks} 
               onParkClick={(park) => { setSelectedPark(park); }} 
               desktopLayout 
             />
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden bg-neutral-100">
          <MapView 
            parks={filteredParks}
            selectedPark={selectedPark} 
            onMarkerClick={(park) => { setSelectedPark(park); }} 
            onChatClick={() => setShowPopupChat(true)}
            onViewDetails={(park) => navigate(`/park/${park.id}`, { state: { park } })}
          />
          
          <div className="absolute bottom-24 right-6 z-[1000] lg:bottom-12">
             <button 
               className="btn-primary w-full px-6 py-4 flex items-center justify-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all rounded-full"
               onClick={() => user ? setShowReviewModal(true) : navigate('/login')}
             >
               <RiTimeLine size={20} />
               <span className="hidden sm:inline">Share Review</span>
               <span className="sm:hidden">Report</span>
             </button>
          </div>
        </div>

        <div className="xl:hidden p-4 bg-white border-t border-neutral-100 rounded-t-[32px] shadow-lg">
           <NearYou 
             parks={filteredParks} 
             onParkClick={(park) => { setSelectedPark(park); }} 
           />
        </div>
      </main>
    );
  };

  return (
    <div className="app-container">
      <div className="hidden lg:block">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} onProfileClick={() => setShowProfile(true)} user={user} />
      </div>
      
      {renderContent()}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black">My Profile</h2>
              <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                <RiCloseLine size={24} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-8 p-4 bg-neutral-50 rounded-2xl">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <RiUserLine size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl">{user?.name || user?.email || 'Explorer'}</h3>
                <p className="text-sm text-neutral-500">{user ? 'Professional Explorer' : 'Guest'}</p>
              </div>
              {user && (
                <button onClick={logout} className="p-2 text-error hover:bg-error/10 rounded-lg shadow-sm" title="Logout">
                  <RiLogoutBoxRLine size={24} />
                </button>
              )}
            </div>

            {!user && (
              <div className="bg-primary/5 p-6 rounded-2xl mb-8 border border-primary/10 text-center">
                <p className="text-sm text-neutral-600 mb-4">Sign in to sync your favorites.</p>
                <Link to="/login" className="btn-primary inline-flex items-center justify-center gap-2 w-full py-3">
                  <RiLoginBoxLine size={20} /> Sign In
                </Link>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Saved Favorites</h3>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] scrollbar-hide">
                {favorites.length === 0 ? (
                  <p className="text-neutral-400 italic text-sm">No favorites saved yet.</p>
                ) : (
                  favorites.map(fav => (
                    <div key={fav.id} className="flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-xl hover:border-primary/20 transition-colors shadow-sm cursor-pointer" onClick={() => { setSelectedPark(fav); setShowProfile(false); setActiveTab('explore'); }}>
                      <img src={fav.image || 'https://images.unsplash.com/photo-1585829365291-1762f59ed290'} className="w-12 h-12 rounded-lg object-cover" alt="" />
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900 text-sm">{fav.name}</p>
                        <p className="text-[10px] text-neutral-400">{fav.location}</p>
                      </div>
                      <RiHeartFill className="text-primary" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onProfileClick={() => setShowProfile(true)} />
      </div>

      {showReviewModal && <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} parks={parks} user={user} />}
      {showPopupChat && <Chatbot onClose={() => setShowPopupChat(false)} />}
      
      {/* MODAL FIX: Using handleLocationUpdate instead of previous anonymous handlers */}
      {showLocationModal && (
        <LocationModal 
          onLocationUpdate={handleLocationUpdate} 
          onDeny={() => setShowLocationModal(false)} 
        />
      )}
    </div>
  );
};

export default Home;