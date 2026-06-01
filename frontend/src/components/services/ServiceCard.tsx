import type { ReactNode } from "react";
import { Clock3, IndianRupee, Star, Sparkles, Home } from "lucide-react";

import type { Service } from "../../types/domain";

export const ServiceCard = ({
  service,
  action,
}: {
  service: Service;
  action?: ReactNode;
}) => (
  <article className="group relative overflow-hidden rounded-3xl border-2 border-gray-100 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-purple-200 transform hover:-translate-y-1">
    {service.image_url ? (
      <div className="relative h-48 overflow-hidden">
        <img 
          src={service.image_url} 
          alt={service.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
        </div>
      </div>
    ) : (
      <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-full p-4">
          <Sparkles className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    )}
    
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            {service.name}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed">{service.description}</p>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <IndianRupee className="h-5 w-5 text-green-600" />
          <span className="text-xl font-bold text-gray-900">{service.price}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Clock3 className="h-4 w-4" />
          <span className="text-sm font-medium">{service.duration_min} min</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Home className="h-3 w-3" />
        <span>Home Service Available</span>
      </div>
      
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  </article>
);
