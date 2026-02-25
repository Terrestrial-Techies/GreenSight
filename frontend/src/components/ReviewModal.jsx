import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiImageAddLine, RiSendPlaneFill, RiLoader4Line } from 'react-icons/ri';
import { communityService } from '../services/api'; 

const ReviewModal = ({ isOpen, onClose, parks, user }) => {
  const [formData, setFormData] = useState({
    park_id: '',
    review_text: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Clear form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ park_id: '', review_text: '', image: null });
      setPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Check if user exists
    if (!user) return alert("Please login to share a review");

    /** * FIX: Handle nested user object.
     * If user object is { token: '...', user: { id: 1 } }, we need user.user.id
     * If user object is just { id: 1 }, we use user.id
     */
    const userId = user.user?.id || user.id || user.user?.user_id || user.user_id;

    if (!userId) {
      console.error("Auth Debug - User Object:", user);
      return alert("User ID not found. Please log out and log back in.");
    }

    setLoading(true);
    const data = new FormData();
    data.append('park_id', formData.park_id);
    data.append('user_id', userId); // Sending the extracted ID
    data.append('review_text', formData.review_text);
    if (formData.image) data.append('image', formData.image);

    try {
      await communityService.submitReview(data);
      alert('Review shared successfully!');
      onClose();
      // Optional: Refresh to show new post
      window.location.reload(); 
    } catch (err) {
      console.error("Upload Error:", err);
      const msg = err.response?.data?.error || 'Failed to share review';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl animate-modal-pop">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-neutral-900">Share Your Experience</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Park Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Select Space</label>
            <select 
              required
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer"
              value={formData.park_id}
              onChange={(e) => setFormData({...formData, park_id: e.target.value})}
            >
              <option value="">Which park did you visit?</option>
              {parks.map(park => (
                <option key={park.id} value={park.id}>{park.name}</option>
              ))}
            </select>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Your Review</label>
            <textarea 
              required
              rows="4"
              placeholder="What was the vibe like? How's the greenery today?"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none"
              value={formData.review_text}
              onChange={(e) => setFormData({...formData, review_text: e.target.value})}
            />
          </div>

          {/* Image Upload */}
          <div className="relative">
            <input 
              type="file" 
              id="image-upload" 
              hidden 
              accept="image/*" 
              onChange={handleImageChange}
            />
            <label 
              htmlFor="image-upload"
              className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              {preview ? (
                <div className="flex items-center gap-3">
                  <img src={preview} className="h-12 w-12 object-cover rounded-lg border border-neutral-100" alt="Preview" />
                  <span className="text-sm font-bold text-primary">Change Photo</span>
                </div>
              ) : (
                <>
                  <RiImageAddLine size={24} className="text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-500">Add a photo of the park</span>
                </>
              )}
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? <RiLoader4Line className="animate-spin" size={24} /> : <RiSendPlaneFill size={20} />}
            {loading ? 'POSTING...' : 'SHARE REVIEW'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;