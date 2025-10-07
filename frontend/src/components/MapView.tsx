import { Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";

export function MapView() {
  return (
    <div className="bg-gray-100 rounded-lg h-full relative overflow-hidden">
      {/* Map background */}
      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 relative">
        {/* Mock map content */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 300">
            {/* Mock road lines */}
            <path 
              d="M50 100 L200 80 L300 120 L350 200" 
              stroke="#666" 
              strokeWidth="2" 
              fill="none"
              strokeDasharray="5,5"
            />
            <path 
              d="M20 200 L150 180 L280 150 L380 140" 
              stroke="#666" 
              strokeWidth="1" 
              fill="none"
            />
          </svg>
        </div>
        
        {/* Delivery route */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
          {/* Route line */}
          <path 
            d="M80 200 Q150 150 200 100 T320 80" 
            stroke="#3b82f6" 
            strokeWidth="3" 
            fill="none"
            strokeDasharray="8,4"
          />
          
          {/* Start point */}
          <circle cx="80" cy="200" r="6" fill="#3b82f6" />
          <circle cx="80" cy="200" r="3" fill="white" />
          
          {/* Waypoint */}
          <circle cx="200" cy="100" r="6" fill="#3b82f6" />
          <circle cx="200" cy="100" r="3" fill="white" />
          
          {/* End point */}
          <circle cx="320" cy="80" r="8" fill="#22c55e" />
          <circle cx="320" cy="80" r="4" fill="white" />
        </svg>
        
        {/* Location label */}
        <div className="absolute top-16 right-8 bg-white rounded-lg p-2 shadow-md">
          <p className="text-sm font-medium">17 Airport Road, Benin City</p>
        </div>
      </div>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button variant="outline" size="icon" className="bg-white shadow-sm">
          <Plus className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white shadow-sm">
          <Minus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}