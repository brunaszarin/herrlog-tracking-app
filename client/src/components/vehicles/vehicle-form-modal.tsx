import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { vehicleFormSchema, type VehicleForm, type Vehicle } from "@shared/schema";

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
  mode?: 'create' | 'edit';
}

export default function VehicleFormModal({ 
  isOpen, 
  onClose, 
  vehicle,
  mode = 'create'
}: VehicleFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<VehicleForm>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      plate: vehicle?.plate || "",
      model: vehicle?.model || "",
      deviceId: vehicle?.deviceId || "",
      status: (vehicle?.status as "active" | "inactive" | "maintenance") || "active",
      manufacturer: vehicle?.manufacturer || "",
      notes: vehicle?.notes || "",
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: VehicleForm) => {
      const response = await apiRequest("POST", "/api/vehicles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Sucesso",
        description: "Veículo criado com sucesso.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      const message = error.message?.includes("already exists") 
        ? "Já existe um veículo com esta placa ou Device ID."
        : "Falha ao criar veículo. Tente novamente.";
      
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: VehicleForm) => {
      const response = await apiRequest("PUT", `/api/vehicles/${vehicle!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Sucesso",
        description: "Veículo atualizado com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      const message = error.message?.includes("already exists")
        ? "Já existe um veículo com esta placa ou Device ID."
        : "Falha ao atualizar veículo. Tente novamente.";
      
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VehicleForm) => {
    if (mode === 'create') {
      createVehicleMutation.mutate(data);
    } else {
      updateVehicleMutation.mutate(data);
    }
  };

  const isLoading = createVehicleMutation.isPending || updateVehicleMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Veículo' : 'Editar Veículo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ABC1234" 
                        {...field} 
                        data-testid="input-plate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo do Device *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ST310" 
                        {...field}
                        data-testid="input-model"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device ID *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="511353816" 
                        {...field}
                        data-testid="input-device-id"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca/Fabricante</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Suntech" 
                      {...field}
                      data-testid="input-manufacturer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Informações adicionais sobre o veículo..."
                      {...field}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? "Salvando..." : mode === 'create' ? "Criar Veículo" : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
