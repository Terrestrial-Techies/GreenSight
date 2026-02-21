import React, { useState, useEffect } from 'react';
import { RiCustomerService2Line, RiSendPlaneFill, RiHistoryLine, RiInformationLine } from 'react-icons/ri';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('create'); 
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/support');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Support Load Error:", err);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await fetch('http://localhost:5000/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: 'Ticket submitted! We will contact you soon.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
        fetchTickets();
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to send. Check your connection.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 animate-in fade-in duration-300">
      <header className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2 text-primary">
          <RiCustomerService2Line /> Support Center
        </h1>
        <div className="flex bg-neutral-100 rounded-lg p-1">
          <button 
            onClick={() => setView('create')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${view === 'create' ? 'bg-white shadow text-primary font-bold' : 'text-neutral-500'}`}
          >
            New Ticket
          </button>
          <button 
            onClick={() => { setView('history'); fetchTickets(); }}
            className={`px-3 py-1 text-xs rounded-md transition-all ${view === 'history' ? 'bg-white shadow text-primary font-bold' : 'text-neutral-500'}`}
          >
            History
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl mx-auto w-full">
        {view === 'create' ? (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-neutral-800">How can we help?</h2>
              <p className="text-sm text-neutral-500">Expect a response within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 ml-1">Full Name</label>
                  <input 
                    required type="text" placeholder="Tunde Lagos"
                    className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 ml-1">Email Address</label>
                  <input 
                    required type="email" placeholder="tunde@example.com"
                    className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600 ml-1">Subject</label>
                <input 
                  required type="text" placeholder="Park location inaccuracy"
                  className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600 ml-1">Message</label>
                <textarea 
                  required rows="4" placeholder="Describe the issue in detail..."
                  className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              {status.msg && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <RiInformationLine /> {status.msg}
                </div>
              )}

              <button 
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? "Sending..." : <><RiSendPlaneFill /> Submit Ticket</>}
              </button>
            </form>
          </section>
        ) : (
          <section className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-neutral-400 animate-pulse">Loading history...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-20">
                <RiHistoryLine size={48} className="mx-auto text-neutral-200 mb-2" />
                <p className="text-neutral-500">No support history found.</p>
              </div>
            ) : (
              tickets.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">#{t.id} {t.status}</span>
                    <span className="text-[10px] text-neutral-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-neutral-800 leading-tight">{t.subject}</h3>
                  <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{t.message}</p>
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Support;