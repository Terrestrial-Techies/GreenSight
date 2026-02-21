const NearYou = ({ parks, onParkClick }) => {
  return (
    <section className="py-4">
      <h2 className="px-4 text-[18px] font-heading font-bold mb-3 text-neutral-900">Near You</h2>
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
        {parks.map((park) => (
          <button 
            key={park.id} 
            onClick={() => onParkClick && onParkClick(park)}
            className="flex-none w-[140px] text-left group transition-transform active:scale-95"
          >
            <div className="w-[140px] h-[180px] rounded-2xl overflow-hidden shadow-sm bg-neutral-50 mb-2 border border-black/5">
              <img 
                src={park.image || `https://source.unsplash.com/featured/?park,nature&sig=${park.id}`} 
                alt={park.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 truncate px-1">{park.name}</h3>
            <p className="text-xs text-neutral-400 capitalize px-1">{park.condition || 'Good'} condition</p>
          </button>
        ))}
      </div>
    </section>
  );
};


export default NearYou;

