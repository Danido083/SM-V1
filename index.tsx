import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';

console.log('Passo 2: Configurando renderização do React (index.tsx)');

const initApp = () => {
  console.log('Passo 3: DOMContentLoaded verificado - Iniciando montagem no DOM');
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Passo 3 Erro FATAL: Elemento #root não encontrado no HTML!');
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('Passo 4: React renderizado com sucesso sem quebras!');
  } catch (error) {
    console.error('Passo 4 Erro FATAL: Uma exceção não tratada quebrou o render do React:', error);
  }
};

// Evita manipulação prematura do DOM garantindo o carregamento completo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
