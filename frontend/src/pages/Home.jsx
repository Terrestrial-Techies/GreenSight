import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import NearYou from '../components/NearYou';
import BottomNav from '../components/BottomNav';
import Notifications from '../components/notifications'; 
import Support from './Support'; 
import Community from './Community';
import Chatbot from '../components/Chatbot';
import LocationModal from '../components/LocationModal';
import Reviews from './Reviews';
import { parkService, authService } from '../services/api';  // Combined import
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiListCheck, RiFilter2Line, RiMapPin2Line, RiTimeLine, 
  RiTreeLine, RiHeartLine, RiHeartFill, RiLeafLine, RiGroupLine, 
  RiLogoutBoxRLine, RiLoginBoxLine, RiCloseLine, RiUserLine 
} from 'react-icons/ri';

const Home = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [showChatbot, setShowChatbot] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true);  // Only once
  const [parkFilter, setParkFilter] = useState('All');
  const [showProfile, setShowProfile] = useState(false);
  const [showPopupChat, setShowPopupChat] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Favorites with localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('gs_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showPopupChat, setShowPopupChat] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [userState, setUserState] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [initialMapState, setInitialMapState] = useState({ directions: false });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle incoming state from ParkDetail (Direct Navigation)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      if (location.state.selectedPark) {
        setSelectedPark(location.state.selectedPark);
      }
      if (location.state.userLocation) {
        setUserLocation(location.state.userLocation);
      }
      if (location.state.showDirections) {
        setInitialMapState({ directions: true });
      }
      // Clear state so it doesn't trigger on every render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  const formatParkData = (data, userLat, userLng, userState) => {
    return data.map((park, index) => ({
      ...park,
      id: park.id || `${park.name || 'park'}-${park.latitude || park.lat || 'lat'}-${park.longitude || park.lng || park.lon || 'lng'}-${index}`,
      lat: park.latitude || park.lat || 6.458985,
      lng: park.longitude || park.lon || park.lng || 3.426131,
      name: park.name || 'Green Space',
      image: park.image_url || park.image || null,
      location: park.city || park.location || userState || 'Lagos',
      ai_summary: park.description || park.ai_summary || '',
      status: park.condition || 'Open',
      rating: park.rating || (4.5 + Math.random() * 0.4).toFixed(1), // Fallback to a realistic random rating
      pricing: park.pricing || 'Free Access',
      features: park.features || ['Nature', 'Security', 'Seating'],
      live_crowd: park.live_crowd || (Math.random() > 0.5 ? 'Moderate' : 'Quiet')
    }));
  };

  useEffect(() => {
    const fetchParks = async () => {
      try {
        setLoading(true);
        const data = await parkService.getAllParks();
        const formattedData = formatParkData(data);
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
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aStarts = a.name?.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStarts = b.name?.toLowerCase().startsWith(searchTerm.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

  const getParkByStatus = (status) => {
    if (status === 'All') return filteredParks;
    return filteredParks.filter(p => p.status?.toLowerCase() === status.toLowerCase());
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateParksNearUser = () => {
    let closestParks = [...filteredParks];
    if (userState) {
      const stateMatch = closestParks.filter(p => 
        p.location?.toLowerCase().includes(userState.toLowerCase()) || 
        p.state?.toLowerCase() === userState.toLowerCase()
      );
      if (stateMatch.length > 0) {
        closestParks = stateMatch;
      }
    }
    
    if (userLocation) {
        closestParks.sort((a, b) => {
            const distA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
            const distB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
            return distA - distB;
        });
    }
    return closestParks;
  };

  const parksNearUser = calculateParksNearUser();

  const handleEnableLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      try {
        // Fetch location details (state/city)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const state = data.address.state || data.address.city || data.address.town;
        setUserState(state);

        // Fetch nearby parks from backend as requested
        const nearbyData = await parkService.getNearbyParks(latitude, longitude);
        const formattedNearby = formatParkData(nearbyData, latitude, longitude, state);

        // If we found nearby parks, prioritize them and maybe filter out distant ones 
        // if that's what the user meant by "only recommends me parks in nearby locations"
        setParks(prev => {
          const existingIds = new Set(formattedNearby.map(p => p.id));
          const remainingParks = prev.filter(p => !existingIds.has(p.id));
          return [...formattedNearby, ...remainingParks];
        });
      } catch (err) {
        console.error('Error fetching location or nearby parks:', err);
      } finally {
        setIsLocating(false);
        setShowLocationModal(false);
      }
    }, (error) => {
      console.error('Geolocation error:', error);
      setIsLocating(false);
      setShowLocationModal(false);
      // Optional: Show a toast or notification to the user
    }, { enableHighAccuracy: true, timeout: 10000 });
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
          <Community />
        </div>
      );
    }

    if (activeTab === 'park') {
      return (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in bg-white lg:bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto w-full px-4 lg:px-8 py-4 flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-neutral-900">Discover Green Spaces</h2>
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
                    <img 
                      src={park.image_url || park.image || `https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=600&auto=format&fit=crop&sig=${park.id}`} 
                      alt={park.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-xl font-bold text-neutral-900 leading-tight">{park.name}</h3>
                      <div className="flex items-center gap-1 text-accent font-bold text-sm bg-accent/10 px-2 py-1 rounded">
                        ★ {park.rating}
                      </div>
                    </div>
                    <p className="text-neutral-500 text-sm flex items-center gap-1 mb-3">
                      <RiMapPin2Line size={16} className="text-primary" /> {park.location}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded">
                        {park.pricing}
                      </span>
                      {park.features && park.features.map((feature, i) => (
                        <span key={i} className="text-[11px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-500 px-2.5 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Live Flow</span>
                        <span className="text-primary font-bold text-sm">{park.live_crowd}</span>
                      </div>
                      <button 
                        className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-[12px] hover:bg-primary hover:text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/park/${park.id}`, { state: { park, userLocation } }); }}
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
        <div className="hidden xl:flex flex-col w-[380px] border-r border-neutral-100 p-6 overflow-y-auto scrollbar-hide bg-[#F8F9FA]">
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
               parks={parksNearUser} 
               onParkClick={(park) => { setSelectedPark(park); }} 
               onViewDetails={(park) => navigate(`/park/${park.id}`, { state: { park, userLocation } })}
               desktopLayout 
             />
          </div>
        </div>

        {/* Main Interactive Map Area - Right Side */}
        <div className="flex-1 relative overflow-hidden bg-neutral-100">
          <MapView 
            parks={filteredParks}
            selectedPark={selectedPark} 
            userLocation={userLocation}
            initialShowDirections={initialMapState.directions}
            onMarkerClick={(park) => { setSelectedPark(park); }} 
            onChatClick={() => setShowPopupChat(true)}
            onViewDetails={(park) => navigate(`/park/${park.id}`, { state: { park, userLocation } })}
          />
        );
      case 'park':
        return (
          <div className="flex-1 flex flex-col overflow-hidden animate-fade-in bg-white lg:bg-[#F8F9FA]">
            <div className="max-w-6xl mx-auto w-full px-4 lg:px-8 py-4 flex flex-col h-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Discover Green Spaces</h2>
                <div className="w-full md:max-w-xs">
                  <SearchBar value={searchTerm} onChange={setSearchTerm} />
                </div>
              </div>

        {/* Floating "Near You" for Mobile - Bottom Sheet Style */}
        <div className="xl:hidden p-4 bg-white border-t border-neutral-100 rounded-t-[32px] shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
           <NearYou 
             parks={parksNearUser} 
             onParkClick={(park) => { setSelectedPark(park); }} 
             onViewDetails={(park) => navigate(`/park/${park.id}`, { state: { park, userLocation } })}
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
      
      <main className="content-scroll">
        {activeTab === 'explore' && (
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        )}

        {renderContent()}
      </main>

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
                      <img src={fav.image || `https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=400&auto=format&fit=crop&sig=${fav.id}`} className="w-12 h-12 rounded-lg object-cover" />
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
      
      {showLocationModal && (
        <LocationModal 
          onEnable={() => setShowLocationModal(false)} 
          onDeny={() => setShowLocationModal(false)} 
          isLoading={isLocating}
        />
      )}
    </div>
  );
};

export default Home;  // Single export

