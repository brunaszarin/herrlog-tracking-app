import { DashboardCards, RecentActivity, VehicleStatusOverview } from "@/components/dashboard/dashboard-cards";
import VehiclesTable from "@/components/vehicles/vehicles-table";
import JsonUpload from "@/components/upload/json-upload";
import RouteMap from "@/components/map/route-map";
import VehicleDetailsPanel from "@/components/map/vehicle-details-panel";
import FloatingActionButton from "@/components/common/floating-action-button";
import VehicleFormModal from "@/components/vehicles/vehicle-form-modal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Vehicle, GpsData } from "@shared/schema";

export default function Dashboard() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: gpsData = [] } = useQuery<GpsData[]>({
    queryKey: ['/api/gps-data'],
  });

  const totalVehicles = vehicles.length;
  const recentUploads = new Set(gpsData.map(d => d.vehicleId)).size;
  const averageSpeed = gpsData.length > 0 
    ? Math.round(gpsData.reduce((sum, d) => sum + (d.speed || 0), 0) / gpsData.length)
    : 0;
  const totalRoutes = gpsData.length;

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Cards */}
      <DashboardCards
        totalVehicles={totalVehicles}
        recentUploads={recentUploads}
        averageSpeed={averageSpeed}
        totalRoutes={totalRoutes}
      />

      {/* Recent Activity and Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <VehicleStatusOverview />
      </div>

      {/* Vehicles Table */}
      <VehiclesTable onSelectVehicle={setSelectedVehicleId} />

      {/* Upload and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JsonUpload />
        <RouteMap vehicleId={selectedVehicleId} />
      </div>

      {/* Vehicle Details Panel */}
      {selectedVehicleId && (
        <VehicleDetailsPanel vehicleId={selectedVehicleId} />
      )}

      {/* Mobile Floating Action Button */}
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      {/* Vehicle Form Modal */}
      <VehicleFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
