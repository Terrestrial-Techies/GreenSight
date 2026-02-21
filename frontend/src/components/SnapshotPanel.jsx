import React, { useState } from 'react';
import { RiCloseLine, RiCheckLine, RiLeafLine, RiShieldCheckLine, RiTimeLine } from 'react-icons/ri';

const SnapshotPanel = ({ park, onClose, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!park) return null;

  const address = park.address || 'Lagos, Nigeria';
  const aiSummary = park.ai_summary || null; // Will be filled by Gemini
  const features = park.key_features || null; // Will be filled by Gemini
  const cleanliness = park.cleanliness || null; // Will be filled by Gemini
  const facilities = park.facilities || null; // Will be filled by Gemini
  const gallery = park.gallery || [
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1585829365291-1762f59ed290?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1596438611195-667f7614e7dc?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1588711447273-047b749d01f2?auto=format&fit=crop&q=80&w=200',
  ];

  // ✅ STATUS: Mapped directly from real park.condition in the database
  const conditionRaw = park.condition?.toLowerCase();
  const conditionColor = conditionRaw === 'bad' ? '#FF000C' : conditionRaw === 'average' ? '#F99D1B' : '#07B60A';
  const statusLabel = conditionRaw === 'bad' ? 'Poor' : conditionRaw === 'average' ? 'Average' : conditionRaw === 'good' ? 'Excellent' : (park.condition || 'Excellent');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Nunito, sans-serif', color: '#111418' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 20px 12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: 'Playfair Display, serif' }}>{park.name}</h2>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#667085' }}>{address}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111418', padding: 4, marginTop: -4 }}>
          <RiCloseLine size={24} />
        </button>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ height: 1, background: '#F2F4F7', margin: '0 20px' }} />

      {/* ── GEMINI LOADING BANNER ── */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFBF2', padding: '7px 20px', borderBottom: '1px solid #F99D1B22' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F99D1B', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 11, color: '#F99D1B', fontWeight: 700 }}>🤖 Gemini is enriching park data...</span>
        </div>
      )}

      {!isExpanded ? (
        /* ── STAGE 1: SUMMARY ── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px 20px', gap: 16 }}>
          
          {/* Status Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Status Ring */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: `conic-gradient(${conditionColor} 0deg 270deg, #F2F4F7 270deg 360deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${conditionColor}33`, flexShrink: 0,
            }}>
              <div style={{ width: 44, height: 44, background: 'white', borderRadius: '50%' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#667085', fontWeight: 600 }}>Status</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: conditionColor }}>
                {statusLabel}
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Key Features</div>
            {features ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {features.map((f, i) => (
                  <span key={i} style={{ background: '#F5FFF5', color: '#07B60A', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, border: '1px solid #07B60A22' }}>{f}</span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#98A2B3', fontStyle: 'italic' }}>🤖 Gemini will generate this from park data</div>
            )}
          </div>

          {/* AI Summary */}
          <div style={{ background: '#FFFBF2', border: '1px solid #F99D1B22', borderRadius: 14, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <RiLeafLine size={12} color="#F99D1B" />
              <span style={{ fontSize: 9, fontWeight: 900, color: '#F99D1B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Review Summary</span>
            </div>
            {aiSummary ? (
              <p style={{ margin: 0, fontSize: 11.5, color: '#4A5568', lineHeight: 1.6, fontStyle: 'italic' }}>"{aiSummary}"</p>
            ) : (
              <p style={{ margin: 0, fontSize: 11.5, color: '#B0B7C3', lineHeight: 1.6, fontStyle: 'italic' }}>🤖 AI summary will be generated by Gemini once integrated</p>
            )}
          </div>

          {/* View Full Snapshot Button */}
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              marginTop: 'auto', background: '#07B60A', color: 'white',
              border: 'none', borderRadius: 12, padding: '13px', fontWeight: 800,
              fontSize: 14, cursor: 'pointer', width: '100%',
            }}
          >
            View Full Snapshot
          </button>
        </div>
      ) : (
        /* ── STAGE 2: FULL SNAPSHOT (hidden scrollbar) ── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.sp-scroll::-webkit-scrollbar { display: none; }`}</style>
          <div className="sp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 10px' }}>

            {/* Real Time Conditions */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Real Time Conditions</div>
              {[
                { label: 'Crowd Level', color: '#07B60A' },
                { label: `Cleanliness: ${cleanliness}`, color: '#F99D1B' },
                { label: 'Safety Perception', color: '#07B60A' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#344054' }}>{item.label}</span>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `4px solid ${item.color}` }} />
                </div>
              ))}
              <span style={{ fontSize: 11, color: '#98A2B3', display: 'flex', alignItems: 'center', gap: 4 }}>
                <RiTimeLine size={11} /> 2 mins ago
              </span>
            </div>

            <div style={{ height: 1, background: '#F2F4F7', marginBottom: 16 }} />

            {/* Facility Checklist */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Facility Checklist</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                {facilities.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                      background: item.available ? '#344054' : 'white',
                      border: `2px solid ${item.available ? '#344054' : '#D0D5DD'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {item.available && <RiCheckLine size={11} color="white" />}
                    </div>
                    <span style={{ fontSize: 12, color: '#344054' }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: '#F2F4F7', marginBottom: 16 }} />

            {/* Gallery */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Gallery</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {gallery.map((img, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#F2F4F7' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 20px', borderTop: '1px solid #F2F4F7', background: 'white' }}>
            <button
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${park.lat},${park.lng}`, '_blank')}
              style={{ flex: 1, background: '#07B60A', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              Get directions
            </button>
            <button
              style={{ flex: 1, background: '#07B60A', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              Save to favourites
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnapshotPanel;
