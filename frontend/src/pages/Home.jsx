import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ParkCard from '../components/ParkCard';
import MapView from '../components/MapView';
import SnapshotPanel from '../components/SnapshotPanel';
import { RiSearchLine, RiFilter3Line, RiMapPinLine } from 'react-icons/ri';
import './Home.css';

const Home = () => {
  const [parks, setParks] = useState([
    {
      id: 1,
      name: "Lufasi Nature Park",
      location: "Lekki-Epe Expressway, Lagos",
      access: "Paid",
      price: "1000 NGN",
      lastUpdated: "5 mins ago",
      lat: 6.4531,
      lng: 3.6015,
      features: [
        { name: "Walking Trails", status: "Operational" },
        { name: "Pond", status: "Operational" },
        { name: "Playground", status: "Maintenance" }
      ],
      description: "A serene escape from the Lagos bustle. Great for nature walks and quiet reflection."
    },
    {
      id: 2,
      name: "Freedom Park",
      location: "Broad Street, Lagos Island",
      access: "Paid",
      price: "500 NGN",
      lastUpdated: "12 mins ago",
      lat: 6.4523,
      lng: 3.3958,
      features: [
        { name: "Fountains", status: "Operational" },
        { name: "Seating Areas", status: "Operational" },
        { name: "Sports Courts", status: "Closed" }
      ],
      description: "Historical site turned leisure park. Excellent vibe for evening hangouts."
    },
    {
      id: 3,
      name: "Jhalobia Recreation Park",
      location: "Ikeja, Lagos",
      access: "Paid",
      price: "2000 NGN",
      lastUpdated: "1 hour ago",
      lat: 6.5724,
      lng: 3.3283,
      features: [
        { name: "Gardens", status: "Operational" },
        { name: "Swings", status: "Operational" }
      ],
      description: "Beautifully landscaped gardens, perfect for photoshoots and family picnics."
    }
  ]);

  const [selectedPark, setSelectedPark] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="home">
      <Navbar />
      <main className="main-content">
        <section className="park-explorer">
          <div className="search-bar-container">
            <div className="search-bar glass-morphism">
              <RiSearchLine className="search-icon" />
              <input
                type="text"
                placeholder="Search green spaces in Lagos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="filter-btn"><RiFilter3Line /></button>
            </div>
            <div className="location-info">
              <RiMapPinLine className="pin-icon" />
              <span>Nearby Lagos, Nigeria</span>
            </div>
          </div>

          <div className="explorer-layout">
            <div className="park-list-panel">
              <div className="list-header">
                <h2>Nearby Green Spaces</h2>
                <p>{parks.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length} results found</p>
              </div>
              <div className="park-cards-grid">
                {parks
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(park => (
                  <ParkCard
                    key={park.id}
                    park={park}
                    isSelected={selectedPark?.id === park.id}
                    onClick={() => setSelectedPark(park)}
                  />
                ))}
              </div>
            </div>

            <div className="map-panel glass-morphism">
              <MapView parks={parks} selectedPark={selectedPark} onMarkerClick={setSelectedPark} />
              
              {selectedPark && (
                <SnapshotPanel 
                  park={selectedPark} 
                  onClose={() => setSelectedPark(null)} 
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
