import JsonUpload from "@/components/upload/json-upload";

export default function Upload() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload de Dados GPS</h2>
        <p className="text-muted-foreground mt-1">Faça upload de arquivos JSON com dados de rastreamento</p>
      </div>

      <div className="max-w-2xl">
        <JsonUpload />
      </div>
    </div>
  );
}
