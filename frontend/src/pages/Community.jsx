import React, { useState, useEffect } from 'react';
import { 
  RiTeamLine, 
  RiMessage3Line, 
  RiTimeLine, 
  RiUser3Line, 
  RiAddLine, 
  RiCloseLine 
} from 'react-icons/ri';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ author: '', title: '', body: '' });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/community');
      const data = await res.json();
      setPosts(data.posts || []);
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
      });
      if (res.ok) {
        setFormData({ author: '', title: '', body: '' });
        setShowForm(false);
        fetchPosts();
      }
    } catch (err) {
      console.error("Post Error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 animate-in fade-in duration-500">
      <header className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-20 shadow-sm">
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
              <span className="text-sm font-bold font-nunito">Cancel</span>
            </>
          ) : (
            <>
              <RiMessage3Line size={20} />
              <span className="text-sm font-bold font-nunito">Share Update</span>
            </>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {showForm && (
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-primary/10 animate-in slide-in-from-top duration-300">
            <h2 className="font-bold text-neutral-800 mb-4 font-playfair text-lg">New Community Post</h2>
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

              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md active:bg-primary-dark transition-colors mt-2">
                Post to Feed
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-neutral-400 font-medium">Fetching latest updates...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <RiTeamLine size={48} className="mx-auto mb-2" />
                <p>No updates yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map(post => (
                <article key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 hover:border-primary/20 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/5">
                      <RiUser3Line size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 leading-none">{post.author}</p>
                      <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-1 font-medium">
                        <RiTimeLine /> {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-neutral-900 mb-1 leading-tight font-playfair">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed font-nunito">
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
      </main>
    </div>
  );
};

export default Community;