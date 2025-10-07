import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Vehicle {
  plate: string;
  deviceModel: string;
  deviceId: number;
  ignitionStatus: "ON" | "OFF";
  lastUpdate: string;
  batteryLevel?: string;
  status: "Online" | "Offline" | "Maintenance" | "Inactive";
}

interface VehicleFormModalProps {
  vehicle?: Vehicle;
  onSubmit: (vehicle: Omit<Vehicle, 'id'>) => void;
  onCancel: () => void;
}

export function VehicleFormModal({ vehicle, onSubmit, onCancel }: VehicleFormModalProps) {
  const [formData, setFormData] = useState({
    plate: vehicle?.plate || "",
    deviceModel: vehicle?.deviceModel || "",
    deviceId: vehicle?.deviceId || "",
    status: vehicle?.status || "Online",
    ignitionStatus: vehicle?.ignitionStatus || "OFF",
    batteryLevel: vehicle?.batteryLevel || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.plate) {
      newErrors.plate = "Placa é obrigatória";
    } else if (!/^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(formData.plate)) {
      newErrors.plate = "Formato de placa inválido (ex: ABC1234 ou ABC1D23)";
    }

    if (!formData.deviceModel) {
      newErrors.deviceModel = "Modelo do dispositivo é obrigatório";
    }

    if (!formData.deviceId) {
      newErrors.deviceId = "ID do dispositivo é obrigatório";
    } else if (isNaN(Number(formData.deviceId))) {
      newErrors.deviceId = "ID deve ser um número";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const vehicleData = {
      plate: formData.plate.toUpperCase(),
      deviceModel: formData.deviceModel,
      deviceId: Number(formData.deviceId),
      status: formData.status as Vehicle['status'],
      ignitionStatus: formData.ignitionStatus as Vehicle['ignitionStatus'],
      batteryLevel: formData.batteryLevel || undefined,
      lastUpdate: new Date().toISOString(),
    };

    onSubmit(vehicleData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plate">Placa *</Label>
          <Input
            id="plate"
            value={formData.plate}
            onChange={(e) => handleInputChange("plate", e.target.value)}
            placeholder="ABC1234"
            className={`bg-transparent border-2 rounded-xl transition-colors ${errors.plate ? "border-red-500" : "border-gray-200 focus:border-[#1E6B7A]"}`}
            maxLength={7}
          />
          {errors.plate && <p className="text-sm text-red-500">{errors.plate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deviceModel">Modelo do Dispositivo *</Label>
          <Select 
            value={formData.deviceModel} 
            onValueChange={(value) => handleInputChange("deviceModel", value)}
          >
            <SelectTrigger className={`bg-transparent border-2 rounded-xl transition-colors ${errors.deviceModel ? "border-red-500" : "border-gray-200 focus:border-[#1E6B7A]"}`}>
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ST310">ST310</SelectItem>
              <SelectItem value="ST8310U">ST8310U</SelectItem>
              <SelectItem value="ST310UC2">ST310UC2</SelectItem>
              <SelectItem value="ST8310UM">ST8310UM</SelectItem>
              <SelectItem value="ST340">ST340</SelectItem>
              <SelectItem value="ST940">ST940</SelectItem>
            </SelectContent>
          </Select>
          {errors.deviceModel && <p className="text-sm text-red-500">{errors.deviceModel}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deviceId">ID do Dispositivo *</Label>
        <Input
          id="deviceId"
          value={formData.deviceId}
          onChange={(e) => handleInputChange("deviceId", e.target.value)}
          placeholder="511353816"
          className={`bg-transparent border-2 rounded-xl transition-colors ${errors.deviceId ? "border-red-500" : "border-gray-200 focus:border-[#1E6B7A]"}`}
        />
        {errors.deviceId && <p className="text-sm text-red-500">{errors.deviceId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
              <SelectItem value="Maintenance">Manutenção</SelectItem>
              <SelectItem value="Inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ignitionStatus">Status da Ignição</Label>
          <Select 
            value={formData.ignitionStatus} 
            onValueChange={(value) => handleInputChange("ignitionStatus", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ON">Ligado</SelectItem>
              <SelectItem value="OFF">Desligado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="batteryLevel">Nível da Bateria (opcional)</Label>
        <Input
          id="batteryLevel"
          value={formData.batteryLevel}
          onChange={(e) => handleInputChange("batteryLevel", e.target.value)}
          placeholder="93% ou 28.63V"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="bg-card border border-border hover:bg-muted transition-colors">
          Cancelar
        </Button>
        <Button type="submit" className="bg-[#1E6B7A] hover:bg-[#2D7A8A]">
          {vehicle ? "Salvar Alterações" : "Adicionar Veículo"}
        </Button>
      </div>
    </form>
  );
}