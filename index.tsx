import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('Passo 1: Iniciou index.tsx');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Passo 1.1: DOMContentLoaded disparado');
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Erro Crítico: Elemento #root não encontrado no HTML!');
    // Fallback visual caso o root não exista (improvável, mas robusto)
    document.body.innerHTML = '<div style="color: white; text-align: center; padding: 20px;">Erro Crítico: O site não pôde ser carregado.</div>';
    return;
  }

  console.log('Passo 1.2: Elemento root encontrado, montando React...');

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('Passo 1.3: React render chamado');
  } catch (e) {
    console.error('Erro ao montar React:', e);
  }
});
