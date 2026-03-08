import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiStarFill, RiStarLine, RiUserLine, RiTimeLine, RiMapPin2Line } from 'react-icons/ri';
import { parkService } from '../services/api';
import './ParkReviews.css';

const ParkReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [park, setPark] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await parkService.enrichPark(id);
        if (data) {
          setPark(data);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to fetch park reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const renderStars = (rating) => {
    const stars = [];
    const r = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= r
          ? <RiStarFill key={i} className="text-yellow-400" size={16} />
          : <RiStarLine key={i} className="text-neutral-300" size={16} />
      );
    }
    return stars;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="park-reviews-page flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-500 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="park-reviews-page bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <RiArrowLeftLine size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-neutral-900 truncate">{park?.name || 'Park'} Reviews</h1>
          <p className="text-sm text-neutral-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Park Summary Card */}
        {park && (
          <div className="park-summary-card bg-white rounded-[28px] border border-neutral-100 shadow-sm p-6 mb-8 flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
              <img
                src={park.image_url || park.image || `https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=200&sig=${park.id}`}
                alt={park.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-neutral-900 truncate">{park.name}</h2>
              <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                <RiMapPin2Line className="text-primary" size={14} />
                {park.address || 'Lagos, Nigeria'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">{renderStars(park.average_rating || 4)}</div>
                <span className="text-xs text-neutral-400 font-bold">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[28px] border border-neutral-100 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <RiStarLine size={30} />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-2">No Reviews Yet</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              Be the first to share your experience about this green space!
            </p>
          </div>
        ) : (
          <div className="reviews-list space-y-4">
            {reviews.map((review, index) => (
              <div
                key={review.id || index}
                className="review-card bg-white rounded-[24px] border border-neutral-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      <RiUserLine size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-800 text-sm">
                        {review.user_name || review.user_email || 'GreenSight Explorer'}
                      </p>
                      {review.created_at && (
                        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                          <RiTimeLine size={12} />
                          {formatDate(review.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  {review.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <RiStarFill className="text-yellow-400" size={14} />
                      <span className="text-sm font-bold text-yellow-700">{review.rating}</span>
                    </div>
                  )}
                </div>

                {/* Star Row */}
                {review.rating && (
                  <div className="flex gap-0.5 mb-3">
                    {renderStars(review.rating)}
                  </div>
                )}

                {/* Review Text */}
                <p className="text-neutral-600 leading-relaxed text-[15px]">
                  {review.review_text || review.text || review.comment || 'No review text provided.'}
                </p>

                {/* Review Image */}
                {review.image_url && (
                  <div className="mt-4 rounded-2xl overflow-hidden max-h-60">
                    <img src={review.image_url} alt="Review photo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ParkReviews;
