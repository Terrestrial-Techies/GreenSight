import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { RiArrowLeftLine, RiMapPin2Line, RiTimeLine, RiInformationLine, RiCheckLine, RiHeartLine, RiHeartFill, RiDirectionLine, RiShareLine, RiStarFill } from 'react-icons/ri';
import { parkService } from '../services/api';
import './ParkDetail.css';

const ParkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userLoc, setUserLoc] = useState(null);

  // Get real user location only if already provided by parent (Home)
  // This prevents the permission dialog from popping up unexpectedly
  useEffect(() => {
    if ("geolocation" in navigator && location.state?.userLocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLoc([position.coords.latitude, position.coords.longitude]);
          },
          (error) => console.log("Waiting for location permission..."),
          { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [location.state?.userLocation]);

  useEffect(() => {
    const fetchParkDetails = async () => {
      try {
        setLoading(true);

        // Use park data from route state if available (passed from Home/MapView)
        if (location.state?.park) {
          setPark(location.state.park);
          setLoading(false);

          // Also try to enrich with reviews in the background
          try {
            const enrichedData = await parkService.enrichPark(id);
            if (enrichedData) {
              setPark(enrichedData);
            }
          } catch (enrichErr) {
            // Keep the route-state data if enrichment fails
            console.log('Enrichment failed, using passed park data');
          }
          return;
        }

        // Fallback: fetch from API (for direct URL access)
        const data = await parkService.enrichPark(id);
        if (data) {
          setPark(data);
        }
      } catch (err) {
        console.error('Failed to fetch park details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParkDetails();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-500 font-medium anim-pulse">Gathering fresh insights...</p>
        </div>
      </div>
    );
  }

  if (!park) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Park not found</h2>
          <button onClick={() => navigate('/')} className="btn-primary px-6 py-2">Back to Explore</button>
        </div>
      </div>
    );
  }

  return (
    <div className="park-detail-page bg-[#F8F9FA] min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <RiArrowLeftLine size={24} />
        </button>
        <div className="flex items-center gap-2">
           <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
             <RiShareLine size={24} />
           </button>
           <button 
             onClick={() => setIsFavorite(!isFavorite)}
             className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-primary bg-primary/5' : 'text-neutral-400 hover:bg-neutral-100'}`}
           >
             {isFavorite ? <RiHeartFill size={24} /> : <RiHeartLine size={24} />}
           </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pb-20 px-6">
        {/* Gallery Hero Section */}
        <section className="mt-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[300px] md:h-[500px]">
            <div 
              className="md:col-span-3 rounded-[40px] overflow-hidden shadow-2xl relative cursor-zoom-in"
              onClick={() => setSelectedImage(park.image_url || park.image || `https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=1200&sig=${park.id}`)}
            >
              <img
                src={park.image_url || park.image || `https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=1200&sig=${park.id}`}
                alt={park.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-primary text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl border border-white/20">
                  {park.condition || 'Verified'}
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col gap-4">
              {(park.gallery || [
                `https://images.unsplash.com/photo-1567080597717-adc73369d19a?auto=format&fit=crop&q=80&w=400&sig=${park.id}1`,
                `https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=400&sig=${park.id}2`
              ]).slice(0, 2).map((img, idx) => (
                <div 
                  key={idx} 
                  className="flex-1 rounded-[32px] overflow-hidden shadow-lg hover:brightness-110 transition-all cursor-zoom-in relative"
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} className="w-full h-full object-cover" />
                  {idx === 1 && (park.gallery?.length > 2) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-black text-xl">+{park.gallery.length - 2}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fullscreen Image Overlay */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
             <button className="absolute top-8 right-8 text-white p-4">
                <RiArrowLeftLine size={32} className="rotate-90 md:rotate-0" />
             </button>
             <img 
               src={selectedImage} 
               className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-modal-pop" 
               alt="Gallery item"
             />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RiStarFill className="text-yellow-400" size={20} />
                <span className="font-bold text-lg">{park.average_rating || park.rating || '—'}</span>
                <button
                  onClick={() => navigate(`/park/${id}/reviews`)}
                  className="text-neutral-400 hover:text-primary hover:underline transition-colors cursor-pointer"
                >
                  ({park.reviews_count || 0} Verified Review{park.reviews_count !== 1 ? 's' : ''})
                </button>
              </div>
              <h1 className="text-5xl font-black text-neutral-900 mb-4">{park.name}</h1>
              <p className="text-neutral-500 flex items-center gap-2 text-lg">
                <RiMapPin2Line className="text-primary" /> {park.address || park.city || park.location || 'Location not specified'}
              </p>
            </div>

            {/* AI Summary / Description */}
            <div className="p-8 bg-white rounded-[32px] shadow-sm border border-neutral-100">
               <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                 <span className="text-primary">✨</span> {park.ai_summary ? 'AI Insights Summary' : 'About This Park'}
               </h3>
               <p className="text-neutral-600 leading-relaxed text-lg italic">
                 "{park.ai_summary || park.description || park.summary || 'No description available for this park yet. Check back later or leave a review to help other visitors!'}"
               </p>
            </div>

            {/* Facilities & Features — only shown if real data exists */}
            {(() => {
              // Build facilities list from AI-generated facilities or from DB features
              const facilityItems = park.facilities
                ? (Array.isArray(park.facilities)
                    ? park.facilities.map(f => typeof f === 'string' ? { name: f, available: true } : f)
                    : [])
                : (park.features
                    ? (Array.isArray(park.features)
                        ? park.features.map(f => ({ name: f, available: true }))
                        : [])
                    : []);

              if (facilityItems.length === 0) return null;

              return (
                <div>
                  <h3 className="text-2xl font-black mb-6">Facilities & Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {facilityItems.map((f, i) => (
                      <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${f.available !== false ? 'bg-white border-neutral-100 shadow-sm' : 'bg-neutral-50 border-transparent opacity-60'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${f.available !== false ? 'bg-primary/10 text-primary' : 'bg-neutral-200 text-neutral-400'}`}>
                          <RiCheckLine size={20} />
                        </div>
                        <span className={`font-bold ${f.available !== false ? 'text-neutral-800' : 'text-neutral-400'}`}>{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Latest Conditions — only shown if real data exists */}
            {(park.crowd_level || park.cleanliness || park.safety_perception || park.condition) && (
              <div>
                <h3 className="text-2xl font-black mb-6">Latest Conditions</h3>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-neutral-100 space-y-6">
                   {park.condition && (
                     <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-600">Overall Condition</span>
                        <span className={`px-4 py-1 rounded-full font-bold text-sm uppercase ${
                          park.condition?.toLowerCase() === 'bad' ? 'bg-red-50 text-red-600' :
                          park.condition?.toLowerCase() === 'average' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-green-50 text-green-600'
                        }`}>{park.condition}</span>
                     </div>
                   )}
                   {park.crowd_level && (
                     <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-600">Crowd Level</span>
                        <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-bold text-sm uppercase">{park.crowd_level}</span>
                     </div>
                   )}
                   {park.cleanliness && (
                     <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-600">Cleanliness</span>
                        <span className="bg-green-50 text-green-600 px-4 py-1 rounded-full font-bold text-sm uppercase">{park.cleanliness}</span>
                     </div>
                   )}
                   {park.safety_perception && (
                     <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-600">Safety Perception</span>
                        <span className="bg-primary/5 text-primary px-4 py-1 rounded-full font-bold text-sm uppercase">{park.safety_perception}</span>
                     </div>
                   )}
                   <div className="pt-4 border-t border-neutral-50 flex items-center justify-between">
                      <p className="text-xs text-neutral-400 italic">Based on community reviews & AI analysis</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
             <div className="bg-primary p-8 rounded-[40px] text-white shadow-xl">
                <RiTimeLine size={32} className="mb-4 text-white" />
                <h4 className="text-lg font-bold mb-2">Visiting Hours</h4>
                <p className="!text-white font-medium mb-6">{park.visiting_hours || 'Contact park for visiting hours'}</p>
                <button className="w-full py-4 bg-white text-primary rounded-2xl font-black hover:scale-[1.02] transition-transform shadow-lg">
                  Report Current Flow
                </button>
             </div>

             <div className="bg-white p-6 rounded-[40px] border border-neutral-100 shadow-sm">
                <h4 className="font-black mb-4">Pricing & Access</h4>
                <div className="p-4 bg-neutral-50 rounded-2xl mb-4">
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">Standard Entry</p>
                  <p className="text-2xl font-black text-primary">{park.pricing || 'Not available'}</p>
                </div>
                {park.access_type && (
                  <p className="text-xs text-neutral-400 italic">Access: {park.access_type}</p>
                )}
             </div>

            <div className="flex flex-col gap-3">
              <button 
                className="flex items-center justify-center gap-3 w-full py-4 bg-black text-white rounded-[24px] font-bold hover:bg-neutral-800 transition-all shadow-lg active:scale-95 cursor-pointer z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Redirect to internal map
                  navigate('/', { 
                    state: { 
                      activeTab: 'explore', 
                      selectedPark: park,
                      showDirections: true,
                      userLocation: location.state?.userLocation || userLoc
                    } 
                  });
                }}
              >
                <RiDirectionLine size={24} />
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParkDetail;
