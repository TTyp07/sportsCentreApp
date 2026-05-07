import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../lib/api';
import type { Facility } from '../../types';
import { Building2, MapPin, Users, Clock, Search, Filter, ChevronRight, Map, List } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SPORT_TYPES = ['All', 'Badminton Court', 'Football Pitch', 'Squash Court', 'Tennis Court', 'Swimming Pool', 'Gym', 'Other'];

const DEFAULT_LAT = 50.9352;
const DEFAULT_LNG = -1.3980;

// Component to fly map to selected facility
function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 17, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

export default function Facilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    api.get<Facility[]>('/facilities')
      .then(setFacilities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getImageUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  }

  const filtered = facilities.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.type.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || f.type.toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchType && f.isActive;
  });

  const facilitiesWithCoords = filtered.map((f, i) => ({
    ...f,
    lat: f.latitude || DEFAULT_LAT + (i * 0.0003),
    lng: f.longitude || DEFAULT_LNG + (i * 0.0003),
  }));

  const selectedFacility = facilitiesWithCoords.find(f => f._id === selectedId);

  function handleSelectFacility(id: string) {
    setSelectedId(id);
    setView('map');
    // Open popup after fly
    setTimeout(() => {
      markersRef.current[id]?.openPopup();
    }, 1300);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sports Facilities</h1>
        <p className="text-gray-500 mt-1">Browse and book available facilities at our sports centre</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search facilities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm appearance-none bg-white"
          >
            {SPORT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List size={16} /> List
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
              view === 'map' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Map size={16} /> Map
          </button>
        </div>
      </div>

      {/* Map View */}
      {view === 'map' && (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '480px' }}>
          <MapContainer
            center={[DEFAULT_LAT, DEFAULT_LNG]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedFacility && (
              <MapFlyTo lat={selectedFacility.lat} lng={selectedFacility.lng} />
            )}
            {facilitiesWithCoords.map(facility => (
              <Marker
                key={facility._id}
                position={[facility.lat, facility.lng]}
                ref={m => { if (m) markersRef.current[facility._id] = m; }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{facility.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{facility.type}</p>
                    {facility.location && (
                      <p className="text-xs text-gray-400 mb-2">{facility.location}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">
                      Capacity: {facility.capacityLimit} · {facility.timeSlotDuration}min slots
                    </p>
                    <Link
                      to={`/facilities/${facility._id}`}
                      className="text-xs text-teal-600 font-medium hover:text-teal-700"
                    >
                      View & Book →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Facility List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No facilities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(facility => (
            <div
              key={facility._id}
              className={`group bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200 ${
                selectedId === facility._id ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-teal-200'
              }`}
            >
              <Link to={`/facilities/${facility._id}`}>
                <div className="h-40 bg-gradient-to-br from-teal-500 to-teal-700 relative overflow-hidden">
                  {facility.image ? (
                    <img
                      src={getImageUrl(facility.image)}
                      alt={facility.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 size={48} className="text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-black/30 backdrop-blur-md rounded-full text-xs font-medium text-white">
                      {facility.type}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/facilities/${facility._id}`}>
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                    {facility.name}
                  </h3>
                  {facility.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{facility.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    {facility.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {facility.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={12} /> Cap: {facility.capacityLimit}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {facility.timeSlotDuration}min
                    </span>
                  </div>
                </Link>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-teal-600 font-medium">
                    {facility.availableSlots?.length || 0} time slots
                  </span>
                  <button
                    onClick={() => handleSelectFacility(facility._id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <MapPin size={12} /> Show on map
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
