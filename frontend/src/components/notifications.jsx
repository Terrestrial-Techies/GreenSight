import React, { useEffect, useState } from 'react';
import { RiNotification3Line, RiInformationFill, RiAlertLine, RiCheckboxCircleLine, RiTimeLine } from 'react-icons/ri';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
      setError(null);
    } catch (err) {
      setError("Failed to load notifications. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <RiAlertLine className="text-red-500" />;
      case 'success': return <RiCheckboxCircleLine className="text-green-500" />;
      default: return <RiInformationFill className="text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <RiNotification3Line className="text-primary" /> Notifications
        </h1>
        {notifications.length > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
            {notifications.length} New
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-neutral-400 text-sm">Fetching updates for you...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchNotifications}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-12 text-center">
            <div className="bg-neutral-100 p-6 rounded-full mb-4">
              <RiNotification3Line size={48} className="text-neutral-300" />
            </div>
            <h3 className="font-bold text-neutral-700">All caught up!</h3>
            <p className="text-neutral-400 text-sm">
              We'll notify you about green sight conditions and updates here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((note) => (
              <div key={note.id} className="p-4 hover:bg-neutral-50 transition-colors flex gap-4">
                <div className="text-2xl mt-1">{getIcon(note.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-neutral-800">{note.title}</h4>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1 whitespace-nowrap">
                      <RiTimeLine /> Just now
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{note.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;