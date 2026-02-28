import React, { useState, useEffect } from 'react';
import { 
  RiTeamLine, 
  RiMessage3Line, 
  RiTimeLine, 
  RiUser3Line, 
  RiAddLine, 
  RiCloseLine,
  RiMapPin2Line,
  RiChat3Line,
  RiHeartLine,
  RiUserSmileLine,
  RiEditLine
} from 'react-icons/ri';
// All imports must be at the top, outside the component!

const formatTimeAgo = (value) => {
  if (!value) return 'recently';
  const then = new Date(value).getTime();
  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 604800)}w ago`;
  if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffSeconds / 31536000)}y ago`;
};

const Community = ({ onOpenReview }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ author: '', title: '', body: '' });
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'reviews'

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Try to fetch from API, fallback to mock data if fails
      const res = await fetch('http://localhost:5000/community').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        // Mock data for development
        setPosts([
          {
            id: 1,
            author: 'Tunde Emmanuel',
            title: 'Quiet morning at Johnson Park',
            body: 'The park is peaceful today. Great for reading or meditation. Facilities are clean and well-maintained.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            author: 'Amara Okafor',
            title: 'Weekend crowd alert',
            body: 'Getting busy around 3pm. Best to come early if you want a quiet spot. The new walking path is open!',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error("Community Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(() => null);
      
      if (res && res.ok) {
        setFormData({ author: '', title: '', body: '' });
        setShowForm(false);
        fetchPosts();
      } else {
        // Mock successful post
        const newPost = {
          id: posts.length + 1,
          author: formData.author || 'Anonymous Explorer',
          title: formData.title,
          body: formData.body,
          createdAt: new Date().toISOString()
        };
        setPosts([newPost, ...posts]);
        setFormData({ author: '', title: '', body: '' });
        setShowForm(false);
      }
    } catch (err) {
      console.error("Post Error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 animate-in fade-in duration-500">
      <header className="bg-white p-4 border-b sticky top-0 z-20 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <RiTeamLine /> Community Hub
            </h1>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
              Lagos Green Network
            </p>
          </div>

          <button 
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 shadow-lg ${
              showForm 
                ? 'bg-neutral-200 text-neutral-700 shadow-none' 
                : 'bg-primary text-white shadow-primary/30'
            }`}
          >
            {showForm ? (
              <>
                <RiCloseLine size={20} />
                <span className="text-sm font-bold">Cancel</span>
              </>
            ) : (
              <>
                <RiMessage3Line size={20} />
                <span className="text-sm font-bold">Share Update</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mt-4 border-b border-neutral-100">
          <button
            className={`pb-2 px-1 font-bold text-sm transition-colors ${
              activeTab === 'feed' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
            onClick={() => setActiveTab('feed')}
          >
            Community Feed
          </button>
          <button
            className={`pb-2 px-1 font-bold text-sm transition-colors ${
              activeTab === 'reviews' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Park Reviews
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Post Form */}
        {showForm && activeTab === 'feed' && (
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-primary/10 animate-in slide-in-from-top duration-300">
            <h2 className="font-bold text-neutral-800 mb-4 text-lg">New Community Post</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase ml-2">Display Name</label>
                <input 
                  required 
                  placeholder="e.g. Tunde Emmanuel"
                  className="w-full p-3 rounded-xl bg-neutral-100 border-none text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.author} 
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase ml-2">Topic</label>
                <input 
                  required 
                  placeholder="What are you reporting?"
                  className="w-full p-3 rounded-xl bg-neutral-100 border-none text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase ml-2">Details</label>
                <textarea 
                  required 
                  placeholder="Is the park quiet? Are the facilities working?" 
                  rows="3"
                  className="w-full p-3 rounded-xl bg-neutral-100 border-none text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.body} 
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                />
              </div>

              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-primary-dark transition-colors mt-2">
                Post to Feed
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-neutral-400 font-medium">Fetching latest updates...</p>
          </div>
        )}

        {/* Feed Tab Content */}
        {activeTab === 'feed' && !loading && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <RiTeamLine size={48} className="mx-auto mb-2 text-neutral-300" />
                <p className="text-neutral-400">No updates yet. Be the first to share!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm font-bold"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map(post => (
                <article key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 hover:border-primary/20 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/5">
                      <RiUser3Line size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 leading-none">{post.author || 'Explorer'}</p>
                      <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-1 font-medium">
                        <RiTimeLine /> {formatTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-neutral-900 mb-1 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {post.body}
                  </p>

                  <div className="mt-4 pt-4 border-t border-neutral-50 flex gap-6">
                    <button className="text-[11px] text-primary font-bold uppercase tracking-wider hover:underline">
                      Reply
                    </button>
                    <button className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider hover:text-primary transition-colors">
                      Helpful
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-20">
                <RiChat3Line size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-500 font-medium">No reviews yet.</p>
                {onOpenReview && (
                  <button
                    type="button"
                    onClick={onOpenReview}
                    className="mt-4 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <RiEditLine size={16} />
                    Leave a Review
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <RiUserSmileLine size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">Explorer</p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
                          <RiTimeLine size={12} />
                          {formatTimeAgo(review.created_at)}
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-700 text-sm leading-relaxed mb-4">
                      "{review.review_text}"
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-50">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-neutral-600">
                        <RiMapPin2Line size={14} className="text-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {review.parks?.name || 'Green Space'}
                        </span>
                      </div>

                      <button className="text-neutral-400 hover:text-primary transition-colors flex items-center gap-1">
                        <RiHeartLine size={18} />
                        <span className="text-xs font-bold">Helpful</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Community;
