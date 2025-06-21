import React from 'react';
import { ChevronRight, MapPin, Calendar, Star, DollarSign, Camera } from 'lucide-react';

const PropertyCard = ({ property, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case '관심': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case '검토중': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case '보류': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div
      onClick={() => onClick(property.id)}
      className="glass-effect rounded-2xl p-6 hover:bg-white/15 transition-all cursor-pointer transform hover:scale-105 shadow-xl animate-slide-in"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">{property.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status)}`}>
          {property.status}
        </span>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-white/70">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{property.address}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white/70">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="font-semibold text-white">{property.price}</span>
          </div>
          
          <div className="flex items-center text-white/70">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{property.date}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < property.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
            />
          ))}
        </div>
        
        <div className="flex items-center space-x-4 text-white/60 text-sm">
          <div className="flex items-center">
            <Camera className="w-4 h-4 mr-1" />
            <span>{property.images}</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;