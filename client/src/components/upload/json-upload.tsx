import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { UploadHistory } from "@shared/schema";

export default function JsonUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: uploadHistory, isLoading: historyLoading } = useQuery<UploadHistory[]>({
    queryKey: ['/api/upload-history'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-json', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/upload-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Upload concluído",
        description: `${data.recordsProcessed} registros processados com sucesso. ${data.recordsSkipped > 0 ? `${data.recordsSkipped} registros ignorados.` : ''}`,
      });
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no upload",
        description: error.message || "Falha ao processar arquivo. Verifique o formato e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/json" || file.name.endsWith('.json')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Apenas arquivos JSON são aceitos.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/json" || file.name.endsWith('.json')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Apenas arquivos JSON são aceitos.",
          variant: "destructive",
        });
        e.target.value = '';
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Upload de Dados GPS</h2>
        <p className="text-sm text-muted-foreground mt-1">Faça upload do arquivo JSON com dados de rastreamento</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone rounded-lg p-8 text-center border-2 border-dashed transition-colors cursor-pointer ${
          dragActive ? 'drag-over border-primary bg-primary/5' : 'border-border hover:border-primary'
        } ${uploadMutation.isPending ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="drop-zone"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          {selectedFile ? (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                Arquivo selecionado: {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground mb-1">
                Arraste e solte seu arquivo JSON aqui
              </p>
              <p className="text-xs text-muted-foreground mb-4">ou clique para selecionar</p>
            </>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-file"
            disabled={uploadMutation.isPending}
          />
          
          {!selectedFile && (
            <p className="text-xs text-muted-foreground mt-3">Formato suportado: JSON (max 10MB)</p>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div className="mt-4">
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploadMutation.isPending}
          className="w-full"
          data-testid="button-upload"
        >
          {uploadMutation.isPending ? "Processando..." : "Processar e Salvar Dados"}
        </Button>
      </div>

      {/* Upload History */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Últimos Uploads</h3>
        
        {historyLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            <span className="text-sm text-muted-foreground">Carregando histórico...</span>
          </div>
        ) : !uploadHistory || uploadHistory.length === 0 ? (
          <div className="text-center py-4">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum upload realizado ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {uploadHistory.slice(0, 5).map((upload) => (
              <div 
                key={upload.id} 
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                data-testid={`upload-history-${upload.id}`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{upload.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {upload.uploadedAt ? formatDate(upload.uploadedAt.toString()) : 'N/A'}
                      {upload.fileSize && ` - ${formatFileSize(upload.fileSize)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded">
                    {upload.recordsProcessed} pontos
                  </span>
                  {upload.recordsSkipped && upload.recordsSkipped > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {upload.recordsSkipped} ignorados
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
