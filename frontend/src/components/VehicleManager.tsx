import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload, Car } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Vehicle {
  id: string;
  plate: string;
  deviceModel: string;
  deviceId: number;
  createdAt: string;
  updatedAt: string;
}

interface VehicleManagerProps {
  onVehicleSelect: (vehicle: Vehicle) => void;
  selectedVehicle?: Vehicle;
}

export function VehicleManager({ onVehicleSelect, selectedVehicle }: VehicleManagerProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate: '',
    deviceModel: '',
    deviceId: ''
  });

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1156d058`;

  useEffect(() => {
    // Test server connection first
    const testConnection = async () => {
      try {
        console.log('Testing server connection...');
        const response = await fetch(`${apiUrl}/health`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        console.log('Health check response:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Server is healthy:', data);
        }
      } catch (error) {
        console.error('Server connection test failed:', error);
        toast.error('Servidor não está respondendo. Tentando novamente...');
      }
    };
    
    testConnection().then(() => {
      fetchVehicles();
    });
  }, []);

  const fetchVehicles = async () => {
    try {
      console.log('Fetching vehicles from:', `${apiUrl}/vehicles`);
      const response = await fetch(`${apiUrl}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to fetch vehicles: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched vehicles:', data);
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error(`Erro ao carregar veículos: ${error.message}`);
      // Set empty array on error so UI doesn't break
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plate || !formData.deviceModel || !formData.deviceId) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    
    try {
      const response = await fetch(`${apiUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          plate: formData.plate.trim(),
          deviceModel: formData.deviceModel.trim(),
          deviceId: parseInt(formData.deviceId)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to create vehicle: ${response.status}`);
      }

      const data = await response.json();
      setVehicles([...vehicles, data.vehicle]);
      setIsCreateDialogOpen(false);
      setFormData({ plate: '', deviceModel: '', deviceId: '' });
      toast.success('Veículo criado com sucesso!');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast.error(`Erro ao criar veículo: ${error.message}`);
    }
  };

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVehicle) return;

    try {
      const response = await fetch(`${apiUrl}/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          plate: formData.plate,
          deviceModel: formData.deviceModel,
          deviceId: parseInt(formData.deviceId)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle');
      }

      const data = await response.json();
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? data.vehicle : v));
      setIsEditDialogOpen(false);
      setEditingVehicle(null);
      setFormData({ plate: '', deviceModel: '', deviceId: '' });
      toast.success('Veículo atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Erro ao atualizar veículo');
    }
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (!confirm(`Tem certeza que deseja deletar o veículo ${vehicle.plate}?`)) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/vehicles/${vehicle.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      setVehicles(vehicles.filter(v => v.id !== vehicle.id));
      if (selectedVehicle?.id === vehicle.id) {
        onVehicleSelect(vehicles[0]);
      }
      toast.success('Veículo deletado com sucesso!');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Erro ao deletar veículo');
    }
  };

  const handleUploadTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle) {
      toast.error('Selecione um veículo primeiro');
      return;
    }

    const fileInput = document.getElementById('trackingFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast.error('Selecione um arquivo JSON');
      return;
    }

    try {
      const text = await file.text();
      const trackingData = JSON.parse(text);

      const response = await fetch(`${apiUrl}/vehicles/${selectedVehicle.id}/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(trackingData)
      });

      if (!response.ok) {
        throw new Error('Failed to upload tracking data');
      }

      const data = await response.json();
      setIsUploadDialogOpen(false);
      toast.success(`Dados de rastreamento enviados! ${data.processedCount} pontos processados.`);
    } catch (error) {
      console.error('Error uploading tracking data:', error);
      toast.error('Erro ao enviar dados de rastreamento');
    }
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      deviceModel: vehicle.deviceModel,
      deviceId: vehicle.deviceId.toString()
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="mt-2 text-gray-500">Carregando veículos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Gerenciar Veículos</h2>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Veículo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Veículo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateVehicle} className="space-y-4">
                <div>
                  <Label htmlFor="plate">Placa</Label>
                  <Input
                    id="plate"
                    value={formData.plate}
                    onChange={(e) => setFormData({...formData, plate: e.target.value})}
                    placeholder="Ex: ABC1234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deviceModel">Modelo do Dispositivo</Label>
                  <Input
                    id="deviceModel"
                    value={formData.deviceModel}
                    onChange={(e) => setFormData({...formData, deviceModel: e.target.value})}
                    placeholder="Ex: ST310"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deviceId">ID do Dispositivo</Label>
                  <Input
                    id="deviceId"
                    type="number"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                    placeholder="Ex: 511353816"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Criar Veículo
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload JSON
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Dados de Rastreamento</DialogTitle>
              </DialogHeader>
              {selectedVehicle ? (
                <form onSubmit={handleUploadTracking} className="space-y-4">
                  <div>
                    <Label>Veículo Selecionado: {selectedVehicle.plate}</Label>
                  </div>
                  <div>
                    <Label htmlFor="trackingFile">Arquivo JSON</Label>
                    <Input
                      id="trackingFile"
                      type="file"
                      accept=".json"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar Dados
                  </Button>
                </form>
              ) : (
                <p>Selecione um veículo primeiro</p>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {vehicles.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Car className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum veículo cadastrado</p>
              <p className="text-sm text-gray-400">Clique em "Novo Veículo" para começar</p>
            </CardContent>
          </Card>
        ) : (
          vehicles.map((vehicle) => (
            <Card 
              key={vehicle.id}
              className={`cursor-pointer transition-all ${
                selectedVehicle?.id === vehicle.id 
                  ? "border-blue-500 bg-blue-50" 
                  : "hover:border-gray-300"
              }`}
              onClick={() => onVehicleSelect(vehicle)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{vehicle.plate}</h3>
                      <p className="text-sm text-gray-500">{vehicle.deviceModel} - ID: {vehicle.deviceId}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(vehicle);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVehicle(vehicle);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditVehicle} className="space-y-4">
            <div>
              <Label htmlFor="editPlate">Placa</Label>
              <Input
                id="editPlate"
                value={formData.plate}
                onChange={(e) => setFormData({...formData, plate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="editDeviceModel">Modelo do Dispositivo</Label>
              <Input
                id="editDeviceModel"
                value={formData.deviceModel}
                onChange={(e) => setFormData({...formData, deviceModel: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="editDeviceId">ID do Dispositivo</Label>
              <Input
                id="editDeviceId"
                type="number"
                value={formData.deviceId}
                onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Atualizar Veículo
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}