import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Edit, Trash2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle } from "@shared/schema";

interface VehiclesTableProps {
  onSelectVehicle: (vehicleId: string) => void;
}

export default function VehiclesTable({ onSelectVehicle }: VehiclesTableProps) {
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    refetchInterval: 30000,
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      await apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Sucesso",
        description: "Veículo removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover veículo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && vehicles) {
      setSelectedVehicles(new Set(vehicles.map(v => v.id)));
    } else {
      setSelectedVehicles(new Set());
    }
  };

  const handleSelectVehicle = (vehicleId: string, checked: boolean) => {
    const newSelected = new Set(selectedVehicles);
    if (checked) {
      newSelected.add(vehicleId);
    } else {
      newSelected.delete(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm("Tem certeza que deseja remover este veículo?")) {
      deleteVehicleMutation.mutate(vehicleId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Manutenção</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffMins < 1440) return `Há ${Math.floor(diffMins / 60)}h`;
    return `Há ${Math.floor(diffMins / 1440)} dias`;
  };

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="text-center py-8">
          <p className="text-destructive">Erro ao carregar veículos. Tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Veículos Cadastrados</h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie e visualize todos os veículos do sistema</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Checkbox
                  checked={vehicles && selectedVehicles.size === vehicles.length}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Placa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Modelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Última Atualização</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">Carregando veículos...</span>
                  </div>
                </td>
              </tr>
            ) : !vehicles || vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Car className="w-8 h-8 text-muted-foreground" />
                    <span className="text-muted-foreground">Nenhum veículo cadastrado</span>
                    <p className="text-sm text-muted-foreground">Clique em "Novo Veículo" para começar</p>
                  </div>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="table-row-hover transition-colors" data-testid={`row-vehicle-${vehicle.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedVehicles.has(vehicle.id)}
                      onCheckedChange={(checked) => handleSelectVehicle(vehicle.id, !!checked)}
                      data-testid={`checkbox-vehicle-${vehicle.id}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground" data-testid={`text-plate-${vehicle.id}`}>
                        {vehicle.plate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground" data-testid={`text-model-${vehicle.id}`}>
                      {vehicle.model}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground font-mono" data-testid={`text-device-id-${vehicle.id}`}>
                      {vehicle.deviceId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vehicle.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {vehicle.updatedAt ? formatLastUpdate(new Date(vehicle.updatedAt)) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectVehicle(vehicle.id)}
                        data-testid={`button-view-${vehicle.id}`}
                        className="text-primary hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-edit-${vehicle.id}`}
                        className="text-secondary hover:bg-secondary/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        disabled={deleteVehicleMutation.isPending}
                        data-testid={`button-delete-${vehicle.id}`}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {vehicles && vehicles.length > 0 && (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{vehicles.length}</span> veículo{vehicles.length !== 1 ? 's' : ''}
            {selectedVehicles.size > 0 && (
              <span>, <span className="font-medium text-foreground">{selectedVehicles.size}</span> selecionado{selectedVehicles.size !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
