import VehiclesTable from "@/components/vehicles/vehicles-table";
import VehicleFormModal from "@/components/vehicles/vehicle-form-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Vehicles() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Veículos</h2>
          <p className="text-muted-foreground mt-1">Gerencie os veículos da frota</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} data-testid="button-new-vehicle">
            Novo Veículo
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <VehiclesTable onSelectVehicle={() => {}} />

      <VehicleFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
