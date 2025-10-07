import React from 'react';

export default function TestApp() {
  console.log('🧪 TEST: Simple component loading...');
  
  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">🚗 HERRLOG Test</h1>
      <p className="text-gray-600">Se você está vendo isso, React está funcionando!</p>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-bold text-blue-800">Status do Sistema:</h2>
        <ul className="mt-2 space-y-1 text-blue-700">
          <li>✅ React carregado</li>
          <li>✅ CSS aplicado</li>
          <li>✅ Componente renderizado</li>
        </ul>
      </div>
      
      <button 
        onClick={() => alert('Teste de interatividade funcionando!')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Testar Interatividade
      </button>
    </div>
  );
}