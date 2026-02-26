import React, { useState, useEffect } from 'react';
import { communityService } from '../services/api';
import { RiMapPin2Line, RiTimeLine, RiChat3Line, RiHeartLine, RiUserSmileLine } from 'react-icons/ri';
import { formatDistanceToNow } from 'date-fns';

const Community = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await communityService.getAllReviews();
        setReviews(data);
      } catch (err) {
        console.error("Error loading feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FA] overflow-y-auto pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-neutral-100 px-6 py-8 mb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-neutral-900 mb-2">Community Feed</h1>
          <p className="text-neutral-500">Real-time updates and stories from explorers across Nigeria.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {reviews.length === 0 ? (
          <div className="text-center py-20">
            <RiChat3Line size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500 font-medium">No stories shared yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-100 flex flex-col"
              >
                {/* Image Header (if exists) */}
                {review.image_url && (
                  <div className="w-full aspect-video overflow-hidden">
                    <img 
                      src={review.image_url} 
                      alt="Review" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  {/* User Info & Meta */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <RiUserSmileLine size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Explorer</p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
                        <RiTimeLine size={12} />
                        {formatDistanceToNow(new Date(review.created_at))} ago
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <p className="text-neutral-700 text-sm leading-relaxed mb-4 flex-1">
                    "{review.review_text}"
                  </p>

                  {/* Park Tag */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-neutral-600">
                      <RiMapPin2Line size={14} className="text-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {review.parks?.name || 'Green Space'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-neutral-400">
                      <button className="hover:text-primary transition-colors flex items-center gap-1">
                        <RiHeartLine size={18} />
                        <span className="text-xs font-bold">12</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;