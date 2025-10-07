import { useState, useRef } from "react";
import { Upload, FileJson, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "success" | "error";
  progress: number;
  processedPoints?: number;
  errorMessage?: string;
  uploadedAt: Date;
}

interface UploadJSONCardProps {
  onFileUpload: (file: File) => Promise<{ success: boolean; processedPoints?: number; error?: string }>;
}

export function UploadJSONCard({ onFileUpload }: UploadJSONCardProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    Array.from(files).forEach(file => {
      if (file.type === "application/json" || file.name.endsWith('.json')) {
        processFile(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFile = async (file: File) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUpload: UploadFile = {
      id: uploadId,
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 0,
      uploadedAt: new Date(),
    };

    setUploadedFiles(prev => [newUpload, ...prev]);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadedFiles(prev => prev.map(upload => 
        upload.id === uploadId && upload.progress < 90
          ? { ...upload, progress: upload.progress + 10 }
          : upload
      ));
    }, 200);

    try {
      // Clear progress interval when upload completes
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadedFiles(prev => prev.map(upload => 
          upload.id === uploadId
            ? { ...upload, progress: 100, status: "processing" }
            : upload
        ));
      }, 2000);

      // Process the file
      const result = await onFileUpload(file);

      setUploadedFiles(prev => prev.map(upload => 
        upload.id === uploadId
          ? { 
              ...upload, 
              status: result.success ? "success" : "error",
              processedPoints: result.processedPoints,
              errorMessage: result.error
            }
          : upload
      ));

    } catch (error) {
      clearInterval(progressInterval);
      setUploadedFiles(prev => prev.map(upload => 
        upload.id === uploadId
          ? { 
              ...upload, 
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Erro desconhecido"
            }
          : upload
      ));
    }
  };

  const removeUpload = (uploadId: string) => {
    setUploadedFiles(prev => prev.filter(upload => upload.id !== uploadId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: UploadFile['status']) => {
    const variants = {
      uploading: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800"
    };

    const labels = {
      uploading: "Enviando",
      processing: "Processando",
      success: "Concluído",
      error: "Erro"
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1E6B7A]">
            <Upload className="w-5 h-5" />
            Upload de Dados de Rastreamento
          </CardTitle>
          <p className="text-gray-600">
            Envie arquivos JSON com dados de geolocalização dos veículos
          </p>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? "border-[#1E6B7A] bg-teal-50" 
                : "border-gray-300 hover:border-[#1E6B7A] hover:bg-gray-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-[#1E6B7A] rounded-full">
                <FileJson className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  Arraste arquivos JSON aqui
                </p>
                <p className="text-gray-600 mb-4">
                  ou clique para selecionar arquivos
                </p>
                <Button 
                  onClick={handleFileSelect}
                  className="bg-[#1E6B7A] hover:bg-[#2D7A8A]"
                >
                  Selecionar Arquivos
                </Button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <Alert className="mt-4 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700">
              <strong>Formato esperado:</strong> Arquivos JSON com arrays de objetos contendo dados de rastreamento 
              (plate, latitude, longitude, date, speed, etc.)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload History */}
      {uploadedFiles.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#1E2A5E]">Histórico de Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(upload.status)}
                      <div>
                        <p className="font-medium text-gray-900">{upload.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(upload.size)} • {upload.uploadedAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(upload.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUpload(upload.id)}
                        className="h-8 w-8 bg-card border border-border hover:bg-muted transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>

                  {upload.status === "uploading" && (
                    <div className="mb-2">
                      <Progress value={upload.progress} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">{upload.progress}% enviado</p>
                    </div>
                  )}

                  {upload.status === "processing" && (
                    <p className="text-sm text-yellow-600">Processando dados de geolocalização...</p>
                  )}

                  {upload.status === "success" && upload.processedPoints && (
                    <p className="text-sm text-green-600">
                      ✓ {upload.processedPoints} pontos de rastreamento processados com sucesso
                    </p>
                  )}

                  {upload.status === "error" && upload.errorMessage && (
                    <p className="text-sm text-red-600">
                      ✗ {upload.errorMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}