import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DebugPanel() {
  const [serverStatus, setServerStatus] = useState<string>('Desconhecido');
  const [lastResponse, setLastResponse] = useState<string>('');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1156d058`;

  const testServerHealth = async () => {
    try {
      setServerStatus('Testando...');
      const response = await fetch(`${apiUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServerStatus('Online');
        setLastResponse(JSON.stringify(data, null, 2));
      } else {
        setServerStatus(`Erro ${response.status}`);
        setLastResponse(await response.text());
      }
    } catch (error) {
      setServerStatus('Offline');
      setLastResponse(error.message);
    }
  };

  const testCreateVehicle = async () => {
    try {
      const testVehicle = {
        plate: 'TEST123',
        deviceModel: 'ST310',
        deviceId: 123456789
      };

      const response = await fetch(`${apiUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(testVehicle)
      });

      const data = await response.text();
      setLastResponse(`Status: ${response.status}\n${data}`);
    } catch (error) {
      setLastResponse(`Error: ${error.message}`);
    }
  };

  const testFetchVehicles = async () => {
    try {
      const response = await fetch(`${apiUrl}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.text();
      setLastResponse(`Status: ${response.status}\n${data}`);
    } catch (error) {
      setLastResponse(`Error: ${error.message}`);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Debug Panel
          <Badge variant={serverStatus === 'Online' ? 'default' : 'destructive'}>
            {serverStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testServerHealth} variant="outline" size="sm">
            Testar Servidor
          </Button>
          <Button onClick={testCreateVehicle} variant="outline" size="sm">
            Criar Veículo Teste
          </Button>
          <Button onClick={testFetchVehicles} variant="outline" size="sm">
            Buscar Veículos
          </Button>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">API URL:</p>
          <code className="text-xs bg-gray-100 p-2 rounded block break-all">
            {apiUrl}
          </code>
        </div>
        
        {lastResponse && (
          <div>
            <p className="text-sm font-medium mb-2">Última Resposta:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {lastResponse}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}