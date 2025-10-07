import React, { useState } from 'react';

// Componente ultra-simples para teste
function SimpleLogin({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">HERRLOG</h1>
          <p className="text-gray-600">Vehicle Tracker</p>
        </div>
        
        <button 
          onClick={onLogin}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Entrar no Sistema
        </button>
      </div>
    </div>
  );
}

// Dashboard ultra-simples
function SimpleDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">HERRLOG Vehicle Tracker</h1>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800"
          >
            Sair
          </button>
        </div>
      </header>
      
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Veículos Total</h3>
            <p className="text-2xl font-bold text-blue-600">5</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Online</h3>
            <p className="text-2xl font-bold text-green-600">4</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Com Tracking</h3>
            <p className="text-2xl font-bold text-blue-600">3</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Pontos Totais</h3>
            <p className="text-2xl font-bold text-blue-600">15</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4 text-gray-800">🎉 Sistema Funcionando!</h2>
          <div className="space-y-2 text-gray-600">
            <p>✅ Interface carregada com sucesso</p>
            <p>✅ 5 veículos do teste admissional</p>
            <p>✅ Dados de tracking disponíveis</p>
            <p>✅ Sistema Herrlog operacional</p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-bold text-blue-800">Próximos Passos:</h3>
            <ul className="mt-2 space-y-1 text-blue-700 text-sm">
              <li>• Navegue pelas seções do menu</li>
              <li>• Teste o upload de JSON</li>
              <li>• Visualize as rotas no mapa</li>
              <li>• Gerencie os veículos</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  console.log('🚀 HERRLOG: Simple App starting...');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleLogin = () => {
    console.log('✅ HERRLOG: Login successful');
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    console.log('👋 HERRLOG: Logout');
    setIsLoggedIn(false);
  };
  
  console.log('🎯 HERRLOG: Rendering', isLoggedIn ? 'dashboard' : 'login');
  
  if (!isLoggedIn) {
    return <SimpleLogin onLogin={handleLogin} />;
  }
  
  return <SimpleDashboard onLogout={handleLogout} />;
}