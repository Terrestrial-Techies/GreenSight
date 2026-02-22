import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import NearYou from '../components/NearYou';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import LocationModal from '../components/LocationModal';
import Reviews from './Reviews';
import { parkService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { RiListCheck, RiFilter2Line, RiMapPin2Line, RiTimeLine, RiTreeLine, RiHeartLine, RiHeartFill, RiLeafLine, RiGroupLine, RiLogoutBoxRLine, RiLoginBoxLine } from 'react-icons/ri';

const Home = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [parkFilter, setParkFilter] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('gs_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPopupChat, setShowPopupChat] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    localStorage.setItem('gs_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (park) => {
    setFavorites(prev => {
      const isFav = prev.find(p => p.id === park.id);
      if (isFav) return prev.filter(p => p.id !== park.id);
      return [...prev, park];
    });
  };

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
          image: park.image_url || park.image || null,
          status: park.condition || 'Open',
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



  const filteredParks = parks
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStarts = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
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
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in bg-white h-full">
           <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
             {/* High Impact Background Banner */}
             <div className="absolute inset-0 z-0">
               <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-50" />
               <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
             </div>
             
             <div className="relative z-10 max-w-2xl w-full text-center px-6">
                <div className="bg-white/20 backdrop-blur-md w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
                  <RiGroupLine size={40} className="text-white" />
                </div>
                <h1 className="text-5xl font-black text-white mb-6 drop-shadow-lg">Coming Soon</h1>
                <p className="text-white/90 text-xl mb-8 leading-relaxed font-medium">
                  We're building Nigeria's most trusted community of urban explorers. 
                  Soon you'll be able to share conditions, earn badges, and preserve our city's greenery together.
                </p>
                {!user ? (
                   <Link to="/signup" className="inline-flex items-center gap-3 px-8 py-3 bg-white text-primary font-black rounded-full shadow-2xl hover:scale-105 transition-transform">
                    <RiLeafLine size={20} />
                    <span>JOIN THE COMMUNITY</span>
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/20 backdrop-blur-md text-white border border-white/40 font-black rounded-full shadow-2xl">
                    <RiGroupLine size={20} />
                    <span>VERIFYING FOUNDERS</span>
                  </div>
                )}
             </div>
           </div>
        </div>
      );
    }

    if (activeTab === 'park') {
      return (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in bg-white lg:bg-[#F8F9FA]">
          <div className="max-w-[1280px] mx-auto w-full px-4 lg:px-8 py-8 flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold text-neutral-900">Discover Green Spaces</h2>
              <div className="w-full md:max-w-xs">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Open', 'Busy', 'Closed'].map(f => (
                <button
                  key={f}
                  onClick={() => setParkFilter(f)}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${
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
                  onClick={() => { setSelectedPark(park); setActiveTab('explore'); setShowDetails(true); }}
                >
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    <img 
                      src={park.image || 'https://images.unsplash.com/photo-1585829365291-1762f59ed290'} 
                      alt={park.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-bold text-neutral-900 leading-tight">{park.name}</h3>
                      <div className="flex items-center gap-1 text-accent font-bold text-xs bg-accent/10 px-2 py-0.5 rounded">
                        ★ 4.8
                      </div>
                    </div>
                    <p className="text-neutral-500 text-xs flex items-center gap-1 mb-3">
                      <RiMapPin2Line size={14} className="text-primary" /> {park.location || 'Lagos, Nigeria'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {park.pricing || 'Free'}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                        Waterfall
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                        Quiet Zone
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Live Flow</span>
                        <span className="text-primary font-bold text-xs">{park.live_crowd || 'Moderate'}</span>
                      </div>
                      <button 
                        className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold text-[10px] hover:bg-primary hover:text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSelectedPark(park); setActiveTab('explore'); setShowDetails(true); }}
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
        {/* Mobile/Tablet Search Header */}
        <div className="xl:hidden p-4 border-b border-neutral-100 bg-white">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        {/* Sidebar for Desktop - Left Side */}
        <div className="hidden xl:flex flex-col w-[420px] border-r border-neutral-100 p-6 overflow-y-auto scrollbar-hide bg-[#F8F9FA]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Explore Nigeria</h2>
            <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Top rated urban green spaces</p>
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

        {/* Main Interactive Map Area - Right Side */}
        <div className="flex-1 relative overflow-hidden bg-neutral-100">
          <MapView 
            parks={filteredParks} 
            selectedPark={selectedPark} 
            onMarkerClick={(park) => { setSelectedPark(park); }} 
            onChatClick={() => setShowPopupChat(true)}
            onViewDetails={() => setShowDetails(true)}
          />
          
          <div className="absolute bottom-24 right-6 z-[1000] lg:bottom-12">
             <button 
               className="btn-primary w-full px-6 py-4 flex items-center justify-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all rounded-full"
               onClick={() => alert('Feature coming soon!')}
             >
               <RiTimeLine size={20} />
               <span className="hidden sm:inline">Report Current Condition</span>
               <span className="sm:hidden">Report</span>
             </button>
          </div>
        </div>

        {/* Floating "Near You" for Mobile - Bottom Sheet Style */}
        <div className="xl:hidden p-4 bg-white border-t border-neutral-100 rounded-t-[32px] shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
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
        <Navbar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onProfileClick={() => setShowProfile(true)} 
          user={user}
        />
      </div>
      
      {renderContent()}

      {/* Profile / Favorites Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-modal-pop" onClick={e => e.stopPropagation()}>
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
                <button onClick={logout} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Logout">
                  <RiLogoutBoxRLine size={24} />
                </button>
              )}
            </div>

            {!user ? (
              <div className="bg-primary/5 p-6 rounded-2xl mb-8 border border-primary/10 text-center">
                <p className="text-sm text-neutral-600 mb-4">Sign in to sync your favorites and join the conversation.</p>
                <Link to="/login" className="btn-primary inline-flex items-center justify-center gap-2 w-full py-3">
                  <RiLoginBoxLine size={20} />
                  Sign In
                </Link>
              </div>
            ) : null}

            <div className="mb-4">
              <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Saved Favorites</h3>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
                {favorites.length === 0 ? (
                  <p className="text-neutral-400 italic text-sm">No favorites saved yet. Explorer more!</p>
                ) : (
                  favorites.map(fav => (
                    <div key={fav.id} className="flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-xl hover:border-primary/20 transition-colors shadow-sm cursor-pointer" onClick={() => { setSelectedPark(fav); setShowProfile(false); setActiveTab('explore'); }}>
                      <img src={fav.image || 'https://images.unsplash.com/photo-1585829365291-1762f59ed290'} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900">{fav.name}</p>
                        <p className="text-[10px] text-neutral-400">{fav.location || 'Lagos'}</p>
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

      {/* Responsive Navigation for Mobile and Tablets */}
      <div className="lg:hidden">
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onProfileClick={() => setShowProfile(true)} 
        />
      </div>


      
      {showPopupChat && <Chatbot onClose={() => setShowPopupChat(false)} />}
      
      {showDetails && selectedPark && (
        <div className="fixed inset-0 z-[6500] pointer-events-none flex items-start justify-start p-4 lg:p-8">
           <div className="pointer-events-auto w-full max-w-[380px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-modal-pop border border-neutral-100">
              <SnapshotPanel 
                park={selectedPark} 
                onClose={() => setShowDetails(false)} 
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.some(f => f.id === selectedPark.id)}
              />
           </div>
        </div>
      )}
      
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
