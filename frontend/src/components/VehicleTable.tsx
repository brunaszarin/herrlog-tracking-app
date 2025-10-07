import { useState } from "react";
import { Edit, Trash2, MapPin, Plus, Search, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { VehicleFormModal } from "./VehicleFormModal";

interface Vehicle {
  id: string;
  plate: string;
  deviceModel: string;
  deviceId: number;
  ignitionStatus: "ON" | "OFF";
  lastUpdate: string;
  batteryLevel?: string;
  status: "Online" | "Offline" | "Maintenance" | "Inactive";
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  onViewRoute: (vehicle: Vehicle) => void;
  onAdd: (vehicle: Omit<Vehicle, 'id'>) => void;
}

export function VehicleTable({ vehicles, onEdit, onDelete, onViewRoute, onAdd }: VehicleTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Vehicle['status']) => {
    const variants = {
      Online: "bg-green-100 text-green-800",
      Offline: "bg-red-100 text-red-800",
      Maintenance: "bg-yellow-100 text-yellow-800",
      Inactive: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={variants[status]}>
        {status === "Online" ? "Online" : 
         status === "Offline" ? "Offline" : 
         status === "Maintenance" ? "Manutenção" : 
         "Inativo"}
      </Badge>
    );
  };

  const getIgnitionBadge = (ignition: "ON" | "OFF") => {
    return (
      <Badge variant={ignition === "ON" ? "default" : "secondary"}>
        {ignition === "ON" ? "Ligado" : "Desligado"}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    onAdd(vehicleData);
    setIsAddModalOpen(false);
  };

  const handleEditVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    if (editingVehicle) {
      const updatedVehicle: Vehicle = {
        ...editingVehicle,
        ...vehicleData
      };
      onEdit(updatedVehicle);
      setIsEditModalOpen(false);
      setEditingVehicle(null);
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Gestão de Veículos</h2>
          <p className="text-muted-foreground">Gerencie todos os veículos cadastrados no sistema</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-card border border-border hover:bg-muted transition-colors gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-primary">Novo Veículo</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Veículo</DialogTitle>
            </DialogHeader>
            <VehicleFormModal
              onSubmit={handleAddVehicle}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                <Input
                  placeholder="Buscar por placa ou modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-300">
                  <Filter className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Maintenance">Manutenção</SelectItem>
                  <SelectItem value="Inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-primary">
            Veículos Cadastrados ({filteredVehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-primary">Placa</TableHead>
                  <TableHead className="font-semibold text-primary">Modelo</TableHead>
                  <TableHead className="font-semibold text-primary">ID Dispositivo</TableHead>
                  <TableHead className="font-semibold text-primary">Status</TableHead>
                  <TableHead className="font-semibold text-primary">Ignição</TableHead>
                  <TableHead className="font-semibold text-primary">Bateria</TableHead>
                  <TableHead className="font-semibold text-primary">Última Atualização</TableHead>
                  <TableHead className="font-semibold text-primary">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <p className="text-muted-foreground">Nenhum veículo encontrado</p>
                        <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou adicione um novo veículo</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-primary">
                        {vehicle.plate}
                      </TableCell>
                      <TableCell>{vehicle.deviceModel}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {vehicle.deviceId}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(vehicle.status)}
                      </TableCell>
                      <TableCell>
                        {getIgnitionBadge(vehicle.ignitionStatus)}
                      </TableCell>
                      <TableCell>
                        {vehicle.batteryLevel ? (
                          <span className="text-sm">{vehicle.batteryLevel}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(vehicle.lastUpdate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewRoute(vehicle)}
                            className="h-8 w-8 bg-card border border-border text-primary hover:bg-muted"
                          >
                            <MapPin className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(vehicle)}
                            className="h-8 w-8 bg-card border border-border text-primary hover:bg-muted"
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(vehicle.id)}
                            className="h-8 w-8 bg-card border border-border text-primary hover:bg-muted"
                          >
                            <Trash2 className="w-4 h-4 text-primary" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
          </DialogHeader>
          {editingVehicle && (
            <VehicleFormModal
              vehicle={editingVehicle}
              onSubmit={handleEditVehicle}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingVehicle(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}